import { prisma } from "../lib/prisma";
import { ApiError } from "../utils/apiErrorHandler";
import { StatusCodes } from "http-status-codes";
import { paginate } from "../utils/paginate";
import {
  CreateCustomerDTO,
  UpdateCustomerDTO,
} from "../schemas/customer.schema";
import { TransactionClient } from "../utils/transactionHandler";
import { Customer } from "@prisma/client";
import { InvoiceCustomerDto } from "../schemas/invoice.schema";

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
    return {
      ...c,
      invoices: undefined,
      totalInvoices: invoices.length,
      dueCount: invoices.filter((inv) => inv.dueAmount > 0).length,
    };
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

  return paginate(
    prisma.customer,
    where,
    [{ [sortBy]: sortOrder }, { name: "asc" }],
    { page, limit },
  );
};

export const getCustomerById = async (storeId: string, customerId: string) => {
  if (!customerId) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "customerId is required");
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

  const { invoices, ...rest } = customer;
  return {
    ...rest,
    totalInvoices: invoices.length,
    dueCount: invoices.filter((inv) => inv.dueAmount > 0).length,
  };
};

export const deleteCustomer = async (storeId: string, customerId: string) => {
  if (!customerId) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "customerId is required");
  }

  const customer = await prisma.customer.findFirst({
    where: { id: customerId, storeId },
  });
  if (!customer) {
    throw new ApiError(StatusCodes.NOT_FOUND, "Customer not found");
  }

  await prisma.customer.delete({ where: { id: customerId } });
  return null;
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

  return prisma.customer.update({
    where: { id: customerId },
    data: { name, phoneNumber, email, address },
  });
};

export const createCustomer = async (
  storeId: string,
  customerData: CreateCustomerDTO,
) => {
  const { name, phoneNumber, email, address } = customerData;

  if (!name || !phoneNumber) {
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      "Name and phone number are required",
    );
  }

  return prisma.customer.create({
    data: { name, phoneNumber, email, address, storeId },
  });
};

export const getOrCreateInvoiceCustomer = async (
  storeId: string,
  customer: InvoiceCustomerDto,
  tx: TransactionClient,
) => {
  const customerId = customer.id;
  let newCustomer;
  if (customerId) {
    newCustomer = await tx.customer.findFirst({ where: { id: customerId } });
  }

  if (!newCustomer) {
    newCustomer = await tx.customer.create({
      data: {
        storeId,
        name: customer.name,
        phoneNumber: customer.phoneNumber,
        address: customer.address,
        email: customer.email,
      },
    });
  }

  if (!newCustomer) {
    throw new ApiError(
      StatusCodes.INTERNAL_SERVER_ERROR,
      "Failed to create customer.",
    );
  }

  return newCustomer;
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
