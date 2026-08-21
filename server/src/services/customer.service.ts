import ExcelJS from "exceljs";
import { Response } from "express";
import { prisma } from "../lib/prisma";
import { ApiError } from "../utils/apiErrorHandler";
import { StatusCodes } from "http-status-codes";
import { paginate } from "../utils/paginate";
import {
  CreateCustomerDTO,
  CustomerExportQueryDTO,
  UpdateCustomerDTO,
} from "../schemas/customer.schema";
import {
  prismaTransaction,
  TransactionClient,
} from "../utils/transactionHandler";
import { Customer, Prisma } from "@prisma/client";

import { InvoiceCustomerDto } from "../schemas/invoice.schema";
import { toCustomerDto, toCustomerSummaryDto } from "../dto/customer.dto";
import { publishElasticsearchJob } from "./elasticsearchPublisher.service";

export const getCustomers = async (params: {
  storeId: string;
  page: number;
  limit: number;
  sortBy: string;
  sortOrder: "asc" | "desc";
}) => {
  const { storeId, page, limit, sortBy, sortOrder } = params;

  const customers = await paginate(
    prisma.customer,
    { storeId },
    { [sortBy]: sortOrder },
    { page, limit },
    { invoices: { select: { id: true, dueAmount: true } } },
  );

  // Augment with computed stats
  const docs = customers.docs.map((c: any) => {
    const invoices: any[] = c.invoices ?? [];
    const dueCount = invoices.filter((inv) => inv.dueAmount > 0).length;
    return toCustomerSummaryDto(c, invoices.length, dueCount);
  });

  return { ...customers, docs };
};

export const searchCustomers = async (params: {
  storeId: string;
  query: string;
  page: number;
  limit: number;
  sortBy: string;
  sortOrder: "asc" | "desc";
}) => {
  const { storeId, query, page, limit, sortBy, sortOrder } = params;

  if (!storeId) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "storeId is required");
  }

  const term = decodeURIComponent(query);

  const where: any = {
    storeId,
    OR: [
      { name: { contains: term, mode: "insensitive" } },
      { phoneNumber: { contains: term, mode: "insensitive" } },
    ],
  };

  const result = await paginate(
    prisma.customer,
    where,
    [{ [sortBy]: sortOrder }, { name: "asc" }],
    { page, limit },
  );

  const docs = result.docs.map((c: any) => {
    const invoices: any[] = c.invoices ?? [];
    const dueCount = invoices.filter((inv) => inv.dueAmount > 0).length;
    return toCustomerSummaryDto(c, invoices.length, dueCount);
  });

  return { ...result, docs };
};

export const getCustomerById = async (storeId: string, customerId: string) => {
  if (!customerId) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "Customer id is required");
  }

  const customer = await prisma.customer.findFirst({
    where: { id: customerId, storeId },
    include: {
      invoices: { select: { id: true, dueAmount: true } },
    },
  });

  if (!customer) {
    throw new ApiError(StatusCodes.NOT_FOUND, "Customer not found");
  }

  const invoices = customer.invoices;
  const dueCount = invoices.filter((inv) => inv.dueAmount > 0).length;
  return toCustomerDto(customer, invoices.length, dueCount);
};

export const deleteCustomer = async (storeId: string, customerId: string) => {
  if (!customerId) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "Customer id is required");
  }

  return prismaTransaction(async (tx) => {
    const customer = await tx.customer.findFirst({
      where: { id: customerId, storeId },
    });

    if (!customer) {
      throw new ApiError(StatusCodes.NOT_FOUND, "Customer not found");
    }

    await tx.customer.delete({ where: { id: customerId } });

    await tx.invoiceSummary.update({
      where: { storeId },
      data: { totalCustomers: { decrement: 1 } },
    });

    void publishElasticsearchJob({
      action: "delete",
      entity: "customer",
      id: customerId,
      storeId,
    });

    return null;
  });
};

export const updateCustomer = async (
  storeId: string,
  customerId: string,
  customerData: UpdateCustomerDTO,
) => {
  if (!customerId) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "customerId is required");
  }

  const { name, phoneNumber, email, address } = customerData;

  const customer = await prisma.customer.findFirst({
    where: { id: customerId, storeId },
  });
  if (!customer) {
    throw new ApiError(StatusCodes.NOT_FOUND, "Customer not found");
  }

  const updatedCustomer = await prisma.customer.update({
    where: { id: customerId },
    data: { name, phoneNumber, email, address },
    include: { invoices: true },
  });

  void publishElasticsearchJob({
    action: "index",
    entity: "customer",
    id: customerId,
    storeId,
    data: buildCustomerIndexDocument(updatedCustomer),
  });

  const invoices = updatedCustomer.invoices;
  const dueCount = invoices.filter((inv) => inv.dueAmount > 0).length;
  return toCustomerDto(customer, invoices.length, dueCount);
};

export const createCustomer = async (
  storeId: string,
  customerData: CreateCustomerDTO,
) =>
  prismaTransaction(async (tx) => {
    const { name, phoneNumber, email, address } = customerData;
    const newCust = await tx.customer.create({
      data: { name, phoneNumber, email, address, storeId },
    });

    await tx.invoiceSummary.update({
      where: { storeId },
      data: { totalCustomers: { increment: 1 } },
    });

    void publishElasticsearchJob({
      action: "index",
      entity: "customer",
      id: newCust.id,
      storeId,
      data: buildCustomerIndexDocument(newCust),
    });

    return toCustomerDto(newCust);
  });

export const getOrCreateInvoiceCustomer = async (
  storeId: string,
  customer: InvoiceCustomerDto,
  tx: TransactionClient,
): Promise<{ customer: Customer; isNew: boolean }> => {
  const customerId = customer.id;
  let resolvedCustomer: Customer | null = null;
  let isNew = false;

  if (customerId) {
    resolvedCustomer = await tx.customer.findFirst({
      where: { id: customerId },
    });
  }

  if (!resolvedCustomer) {
    resolvedCustomer = await tx.customer.create({
      data: {
        storeId,
        name: customer.name,
        phoneNumber: customer.phoneNumber,
        address: customer.address,
        email: customer.email,
      },
    });
    isNew = true;
  }

  if (!resolvedCustomer) {
    throw new ApiError(
      StatusCodes.INTERNAL_SERVER_ERROR,
      "Failed to create customer.",
    );
  }

  return { customer: resolvedCustomer, isNew };
};

export const increamentCustomerDue = async (
  customer: Customer,
  dueAmount: number,
  tx: TransactionClient,
) => {
  if (dueAmount <= 0) return customer;

  return await tx.customer.update({
    where: { id: customer.id },
    data: { totalDue: { increment: dueAmount } },
  });
};

export const exportCustomersStream = async (
  storeId: string,
  params: CustomerExportQueryDTO,
  res: Response,
) => {
  const { format, query, sortBy, sortOrder } = params;

  const where: Prisma.CustomerWhereInput = { storeId };

  if (query) {
    const term = decodeURIComponent(query);
    where.OR = [
      { name: { contains: term, mode: "insensitive" } },
      { phoneNumber: { contains: term, mode: "insensitive" } },
      { email: { contains: term, mode: "insensitive" } },
    ];
  }

  const customers = await prisma.customer.findMany({
    where,
    orderBy: { [sortBy]: sortOrder },
    include: {
      invoices: { select: { id: true, dueAmount: true } },
    },
  });

  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet("Customers");

  worksheet.columns = [
    { header: "ID", key: "id", width: 36 },
    { header: "Customer Name", key: "name", width: 25 },
    { header: "Phone Number", key: "phoneNumber", width: 18 },
    { header: "Email", key: "email", width: 25 },
    { header: "Address", key: "address", width: 30 },
    { header: "Total Due", key: "totalDue", width: 15 },
    { header: "Advance Amount", key: "advance", width: 15 },
    { header: "Payment Behaviour", key: "paymentBehaviour", width: 18 },
    { header: "Customer Mark", key: "mark", width: 15 },
    { header: "Total Invoices", key: "totalInvoices", width: 15 },
    { header: "Due Invoices", key: "dueInvoices", width: 15 },
    { header: "Created At", key: "createdAt", width: 22 },
  ];

  worksheet.getRow(1).font = { bold: true };

  customers.forEach((c) => {
    const invoices = c.invoices ?? [];
    const dueCount = invoices.filter((inv) => inv.dueAmount > 0).length;

    worksheet.addRow({
      id: c.id,
      name: c.name,
      phoneNumber: c.phoneNumber || "",
      email: c.email || "",
      address: c.address || "",
      totalDue: c.totalDue,
      advance: c.advance,
      paymentBehaviour: c.paymentBehaviour,
      mark: c.mark,
      totalInvoices: invoices.length,
      dueInvoices: dueCount,
      createdAt: c.createdAt.toISOString(),
    });
  });

  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  if (format === "xlsx") {
    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    );
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="customers_${storeId}_${timestamp}.xlsx"`,
    );
    await workbook.xlsx.write(res);
  } else {
    res.setHeader("Content-Type", "text/csv; charset=utf-8");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="customers_${storeId}_${timestamp}.csv"`,
    );
    await workbook.csv.write(res);
  }
};

export const buildCustomerIndexDocument = (
  customer: Customer,
): Record<string, unknown> => ({
  id: customer.id,
  name: customer.name,
  phoneNumber: customer.phoneNumber,
  email: customer.email,
  address: customer.address,
});
