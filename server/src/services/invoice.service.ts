import ExcelJS from "exceljs";
import { Response } from "express";
import { prisma } from "../lib/prisma";
import { ApiError } from "../utils/apiErrorHandler";
import { StatusCodes } from "http-status-codes";
import { paginate } from "../utils/paginate";
import {
  InvoiceCreateUpdateDto,
  InvoiceExportQueryDTO,
} from "../schemas/invoice.schema";
import {
  prismaTransaction,
  TransactionClient,
} from "../utils/transactionHandler";
import * as inventoryService from "../services/inventory.service";
import * as customerService from "./customer.service";
import * as transactionalNotification from "./transactionalNotification.service";
import {
  Customer,
  InvoiceStatus,
  InvoicePaymentStatus,
  Prisma,
  Store,
  StoreSettings,
} from "@prisma/client";

import {
  CalculatedInvoice,
  calculateInvoiceDetails,
} from "../utils/invoice-calculator";
import {
  toInvoiceDto,
  toInvoiceSummaryDto,
  toInvoiceCalculationSummaryDto,
} from "../dto/invoice.dto";

const buildInvoiceCreateData = (
  userId: string,
  storeId: string,
  billData: InvoiceCreateUpdateDto,
  customer: Customer,
  calculations: CalculatedInvoice,
  status: InvoiceStatus,
) => ({
  userId,
  storeId,
  customerId: customer.id,
  invoiceNumber: billData.invoiceNumber,
  issueDate: new Date(billData.issueDate),
  subTotal: calculations.subTotal,
  total: calculations.total,
  discountAmount: calculations.discountAmount,
  discountPercent: calculations.discountPercent,
  dueAmount: calculations.dueAmount,
  paidAmount: calculations.paidAmount,
  taxAmount: calculations.taxAmount,
  taxRate: calculations.taxRate,
  totalProfit: calculations.totalProfit,
  roundupTotal: calculations.roundupTotal,
  note: billData.note,
  status,
  paymentStatus:
    calculations.dueAmount > 0
      ? InvoicePaymentStatus.DUE
      : InvoicePaymentStatus.PAID,
  extraData: {
    customer: {
      name: billData.customer.name,
      phoneNumber: billData.customer.phoneNumber,
      email: billData.customer.email,
      address: billData.customer.address,
    },
  },
});

const buildInvoiceItemsData = (
  invoiceId: string,
  calculations: CalculatedInvoice,
  products: Array<{ id: string; name: string }>,
) =>
  calculations.billItems.map((item, i) => ({
    invoiceId,
    sortOrder: i + 1,
    productId: item.productId,
    productName: products.find((p) => p.id === item.productId)?.name || "",
    pricePerQty: item.pricePerQuantity as any,
    netQuantity: item.netQuantity,
    totalPrice: item.totalPrice,
    stockUnit: item.stockUnit,
    totalProfit: item.totalProfit,
  }));

const updateInvoiceSummaryOnCreate = (
  storeId: string,
  calculations: CalculatedInvoice,
  isNewCustomer: boolean,
  tx: TransactionClient,
) =>
  tx.invoiceSummary.update({
    where: { storeId },
    data: {
      totalRevenue: { increment: calculations.total },
      totalPaid: { increment: calculations.paidAmount },
      totalDue: { increment: calculations.dueAmount },
      totalProfit: { increment: calculations.totalProfit },
      invoiceCount: { increment: 1 },
      totalProductsSold: {
        increment: calculations.billItems.reduce(
          (sum, item) => sum + item.netQuantity,
          0,
        ),
      },
      totalCustomers: { increment: isNewCustomer ? 1 : 0 },
      paidInvoices: {
        increment: calculations.dueAmount <= 0 ? 1 : 0,
      },
      partialInvoices: {
        increment:
          calculations.dueAmount > 0 && calculations.paidAmount > 0 ? 1 : 0,
      },
      unpaidInvoices: {
        increment:
          calculations.dueAmount > 0 && calculations.paidAmount <= 0 ? 1 : 0,
      },
    },
  });

export const applyIssueSideEffects = async (
  storeId: string,
  store: Store & { settings: StoreSettings | null },
  customer: Customer,
  isNewCustomer: boolean,
  billData: InvoiceCreateUpdateDto,
  calculations: CalculatedInvoice,
  tx: TransactionClient,
): Promise<void> => {
  await Promise.all([
    ...(store.settings?.enableInventoryTracking
      ? [
          inventoryService.processInvoiceStockUpdates(
            billData.billItems,
            store,
            tx,
          ),
        ]
      : []),
    customerService.increamentCustomerDue(customer, calculations.dueAmount, tx),
    updateInvoiceSummaryOnCreate(storeId, calculations, isNewCustomer, tx),
  ]);
};

export const createInvoice = async (
  userId: string,
  storeId: string,
  billData: InvoiceCreateUpdateDto,
  txClient?: TransactionClient,
) => {
  const runner = async (tx: TransactionClient) => {
    // Update store lastInvoiceNumber and fetch settings
    const store = await tx.store.update({
      where: { id: storeId },
      data: { lastInvoiceNumber: billData.invoiceNumber },
      include: { settings: true },
    });

    const storeSettings = store.settings!;

    // Fetch and validate products
    const productIds = billData.billItems.map((item) => item.productId);
    const products = await tx.product.findMany({
      where: { id: { in: productIds } },
    });

    if (products.length !== productIds.length) {
      throw new ApiError(
        StatusCodes.BAD_REQUEST,
        "Some products in the invoice were not found.",
      );
    }

    const calculations = calculateInvoiceDetails(
      billData,
      products,
      storeSettings,
    );

    const { customer, isNew } =
      await customerService.getOrCreateInvoiceCustomer(
        storeId,
        billData.customer,
        tx,
      );

    const status = billData.status ?? InvoiceStatus.DRAFTED;

    // Persist invoice row with all calculated fields
    const invoice = await tx.invoice.create({
      data: buildInvoiceCreateData(
        userId,
        storeId,
        billData,
        customer,
        calculations,
        status,
      ),
    });

    // Persist bill items
    await tx.invoiceItem.createMany({
      data: buildInvoiceItemsData(invoice.id, calculations, products),
    });

    // Apply external side effects ONLY when the invoice is being ISSUED
    if (status === InvoiceStatus.ISSUED) {
      await applyIssueSideEffects(
        storeId,
        store,
        customer,
        isNew,
        billData,
        calculations,
        tx,
      );
    }

    const createdInvoice = await getPopulatedInvoice(invoice.id, tx);
    return toInvoiceDto(createdInvoice);
  };

  return txClient ? runner(txClient) : prismaTransaction(runner);
};

export const issueInvoice = async (
  storeId: string,
  invoiceId: string,
  txClient?: TransactionClient,
) => {
  const runner = async (tx: TransactionClient) => {
    const invoice = await tx.invoice.findUnique({
      where: { id: invoiceId },
      include: {
        customer: true,
        billItems: true,
      },
    });

    if (!invoice || invoice.storeId !== storeId) {
      throw new ApiError(StatusCodes.NOT_FOUND, "Invoice not found");
    }

    if (invoice.status === InvoiceStatus.ISSUED) {
      const populated = await getPopulatedInvoice(invoiceId, tx);
      return toInvoiceDto(populated);
    }

    const store = await tx.store.findUnique({
      where: { id: storeId },
      include: { settings: true },
    });

    if (!store) {
      throw new ApiError(StatusCodes.NOT_FOUND, "Store not found");
    }

    const customer = invoice.customer;
    if (!customer) {
      throw new ApiError(StatusCodes.BAD_REQUEST, "Invoice customer not found");
    }

    await tx.invoice.update({
      where: { id: invoiceId },
      data: {
        status: InvoiceStatus.ISSUED,
        paymentStatus:
          invoice.dueAmount <= 0
            ? InvoicePaymentStatus.PAID
            : InvoicePaymentStatus.DUE,
      },
    });

    const calculations: CalculatedInvoice = {
      subTotal: invoice.subTotal,
      discountAmount: invoice.discountAmount,
      discountPercent: invoice.discountPercent,
      taxAmount: invoice.taxAmount,
      taxRate: invoice.taxRate,
      total: invoice.total,
      paidAmount: invoice.paidAmount,
      dueAmount: invoice.dueAmount,
      totalProfit: invoice.totalProfit,
      roundupTotal: invoice.roundupTotal,
      billItems: invoice.billItems.map((item) => ({
        productId: item.productId || "",
        netQuantity: item.netQuantity,
        totalPrice: item.totalPrice,
        stockUnit: item.stockUnit,
        totalProfit: item.totalProfit,
      })),
    };

    const billData: InvoiceCreateUpdateDto = {
      invoiceNumber: invoice.invoiceNumber,
      issueDate: invoice.issueDate,
      paidAmount: invoice.paidAmount,
      discountPercent: invoice.discountPercent,
      taxRate: invoice.taxRate,
      roundupTotal: invoice.roundupTotal,
      note: invoice.note || undefined,
      status: InvoiceStatus.ISSUED,
      billItems: invoice.billItems.map((item) => ({
        productId: item.productId!,
        netQuantity: item.netQuantity,
        totalPrice: item.totalPrice,
        stockUnit: item.stockUnit,
        pricePerQuantity: item.pricePerQty as any,
      })),
      customer: {
        id: customer.id,
        name: customer.name,
        phoneNumber: customer.phoneNumber,
        email: customer.email,
        address: customer.address,
      },
    };

    await applyIssueSideEffects(
      storeId,
      store,
      customer,
      false,
      billData,
      calculations,
      tx,
    );

    const populated = await getPopulatedInvoice(invoiceId, tx);
    return toInvoiceDto(populated);
  };

  return txClient ? runner(txClient) : prismaTransaction(runner);
};

export const updateInvoice = async (
  userId: string,
  storeId: string,
  invoiceId: string,
  billData: InvoiceCreateUpdateDto,
) =>
  prismaTransaction(async (tx) => {
    // Guard: invoice must exist and be in DRAFTED state
    const existing = await tx.invoice.findUnique({
      where: { id: invoiceId },
    });
    if (!existing) {
      throw new ApiError(StatusCodes.NOT_FOUND, "Invoice not found");
    }
    if (existing.status === InvoiceStatus.ISSUED) {
      throw new ApiError(
        StatusCodes.FORBIDDEN,
        "Cannot edit an issued invoice",
      );
    }

    // Fetch store settings and update lastInvoiceNumber
    const store = await tx.store.update({
      where: { id: storeId },
      data: { lastInvoiceNumber: billData.invoiceNumber },
      include: { settings: true },
    });

    const storeSettings = store.settings!;

    // Fetch and validate products
    const productIds = billData.billItems.map((item) => item.productId);
    const products = await tx.product.findMany({
      where: { id: { in: productIds } },
    });

    if (products.length !== productIds.length) {
      throw new ApiError(
        StatusCodes.BAD_REQUEST,
        "Some products in the invoice were not found.",
      );
    }

    // Recalculate from the request body
    const calculations = calculateInvoiceDetails(
      billData,
      products,
      storeSettings,
    );

    // Resolve customer
    const { customer, isNew } =
      await customerService.getOrCreateInvoiceCustomer(
        storeId,
        billData.customer,
        tx,
      );

    const status = billData.status ?? InvoiceStatus.DRAFTED;

    // Update invoice row with fresh calculations and new status
    await tx.invoice.update({
      where: { id: invoiceId },
      data: buildInvoiceCreateData(
        userId,
        storeId,
        billData,
        customer,
        calculations,
        status,
      ),
    });

    // Replace bill items entirely
    await tx.invoiceItem.deleteMany({ where: { invoiceId } });
    await tx.invoiceItem.createMany({
      data: buildInvoiceItemsData(invoiceId, calculations, products),
    });

    // Apply external side effects ONLY if status is set to ISSUED
    if (status === InvoiceStatus.ISSUED) {
      await applyIssueSideEffects(
        storeId,
        store,
        customer,
        isNew,
        billData,
        calculations,
        tx,
      );
    }

    const updatedInvoice = await getPopulatedInvoice(invoiceId, tx);
    return toInvoiceDto(updatedInvoice);
  });

export const deleteInvoice = async (invoiceId: string) =>
  prismaTransaction(async (tx) => {
    const invoice = await tx.invoice.findUnique({
      where: { id: invoiceId },
    });

    if (!invoice) {
      throw new ApiError(StatusCodes.NOT_FOUND, "Invoice not found");
    }

    if (invoice.status === InvoiceStatus.ISSUED) {
      throw new ApiError(
        StatusCodes.FORBIDDEN,
        "Cannot delete an issued invoice",
      );
    }

    // InvoiceItem rows cascade-delete automatically (onDelete: Cascade in schema)
    await tx.invoice.delete({ where: { id: invoiceId } });
  });

export const updateInvoiceDueAmount = async (
  invoiceId: string,
  paidAmount: number,
) =>
  prismaTransaction(async (tx) => {
    const currentInvoice = await tx.invoice.findUnique({
      where: { id: invoiceId },
      select: {
        dueAmount: true,
        paidAmount: true,
        customerId: true,
        storeId: true,
        status: true,
      },
    });

    if (!currentInvoice) {
      throw new ApiError(StatusCodes.NOT_FOUND, "Invoice not found");
    }

    if (currentInvoice.status === InvoiceStatus.DRAFTED) {
      throw new ApiError(
        StatusCodes.BAD_REQUEST,
        "Cannot update due amount for a draft invoice",
      );
    }

    if (paidAmount > currentInvoice.dueAmount) {
      throw new ApiError(StatusCodes.BAD_REQUEST, "Invalid paid ammount.");
    }

    const oldDueAmount = currentInvoice.dueAmount;
    const oldPaidAmount = currentInvoice.paidAmount;
    const newDueAmount = oldDueAmount - paidAmount;
    const newPaidAmount = oldPaidAmount + paidAmount;

    const paymentStatus =
      newDueAmount > 0 ? InvoicePaymentStatus.DUE : InvoicePaymentStatus.PAID;

    const invoice = await tx.invoice.update({
      where: { id: invoiceId },
      data: {
        paidAmount: { increment: paidAmount },
        dueAmount: { decrement: paidAmount },
        paymentStatus,
      },
    });

    if (invoice.dueAmount >= 0 && invoice.customerId) {
      await tx.customer.update({
        where: { id: invoice.customerId },
        data: { totalDue: { decrement: paidAmount } },
      });
    }

    // Update InvoiceSummary stats
    const oldIsPaid = oldDueAmount <= 0;
    const oldIsPartial = oldDueAmount > 0 && oldPaidAmount > 0;
    const oldIsUnpaid = oldDueAmount > 0 && oldPaidAmount <= 0;

    const newIsPaid = newDueAmount <= 0;
    const newIsPartial = newDueAmount > 0 && newPaidAmount > 0;
    const newIsUnpaid = newDueAmount > 0 && newPaidAmount <= 0;

    const paidInvoicesDelta = (newIsPaid ? 1 : 0) - (oldIsPaid ? 1 : 0);
    const partialInvoicesDelta =
      (newIsPartial ? 1 : 0) - (oldIsPartial ? 1 : 0);
    const unpaidInvoicesDelta = (newIsUnpaid ? 1 : 0) - (oldIsUnpaid ? 1 : 0);

    await tx.invoiceSummary.update({
      where: { storeId: currentInvoice.storeId },
      data: {
        totalPaid: { increment: paidAmount },
        totalDue: { decrement: paidAmount },
        paidInvoices: { increment: paidInvoicesDelta },
        partialInvoices: { increment: partialInvoicesDelta },
        unpaidInvoices: { increment: unpaidInvoicesDelta },
      },
    });

    const updatedInvoice = await getPopulatedInvoice(invoice.id, tx);
    const invoiceDto = toInvoiceDto(updatedInvoice);

    // Notify when invoice is fully paid (fire-and-forget)
    if (invoice.dueAmount <= 0) {
      const [user, store] = await Promise.all([
        prisma.user.findUnique({ where: { id: invoice.userId } }),
        prisma.store.findUnique({ where: { id: invoice.storeId } }),
      ]);
      if (user && store) {
        transactionalNotification.notifyInvoicePaid(
          user,
          { id: invoice.id, invoiceNumber: invoice.invoiceNumber },
          store,
        );
      }
    }

    return invoiceDto;
  });

export const getInvoiceById = async (invoiceId: string) => {
  const invoice = await getPopulatedInvoice(invoiceId);
  return toInvoiceDto(invoice);
};

export const getPopulatedInvoice = async (
  invoiceId: string,
  tx: TransactionClient = prisma,
) => {
  const invoice = await tx.invoice.findUnique({
    where: { id: invoiceId },
    include: {
      customer: true,
      billItems: {
        include: {
          product: {
            select: {
              id: true,
              name: true,
              sku: true,
              stockUnit: true,
              unitGroups: true,
              pricePerQuantity: true,
            },
          },
        },
      },
    },
  });

  if (!invoice) {
    throw new ApiError(StatusCodes.NOT_FOUND, "Failed to retrieve Invoice.");
  }

  return invoice;
};

export const searchInvoice = async (params: {
  storeId: string;
  page: number;
  limit: number;
  status?: InvoiceStatus;
  paymentStatus?: InvoicePaymentStatus;
  customerPrefix?: string;
  customerId?: string;
  invoiceNumber?: string;
  query?: string;
  sortBy: string;
  sortOrder: "asc" | "desc";
}) => {
  const {
    storeId,
    page,
    limit,
    status,
    paymentStatus,
    customerPrefix,
    customerId,
    invoiceNumber,
    query,
    sortBy,
    sortOrder,
  } = params;

  const where: Prisma.InvoiceWhereInput = { storeId };

  if (status) where.status = status;
  if (paymentStatus) where.paymentStatus = paymentStatus;
  if (customerId) where.customerId = customerId;

  if (invoiceNumber) {
    where.invoiceNumber = { contains: invoiceNumber, mode: "insensitive" };
  }

  if (customerPrefix) {
    where.customer = {
      name: { startsWith: customerPrefix, mode: "insensitive" },
    };
  }

  if (query) {
    where.OR = [
      { invoiceNumber: { contains: query, mode: "insensitive" } },
      { customer: { name: { contains: query, mode: "insensitive" } } },
    ];
  }

  const result = await paginate(
    prisma.invoice,
    where,
    { [sortBy]: sortOrder },
    { page, limit },
    {
      customer: true,
    },
  );

  return {
    ...result,
    docs: result.docs.map(toInvoiceSummaryDto),
  };
};

export const getInvoiceSummary = async (storeId: string) => {
  const summary = await prisma.invoiceSummary.findUniqueOrThrow({
    where: { storeId },
  });

  return toInvoiceCalculationSummaryDto(summary);
};

export const exportInvoicesStream = async (
  storeId: string,
  params: InvoiceExportQueryDTO,
  res: Response,
) => {
  const {
    format,
    query,
    status,
    paymentStatus,
    customerId,
    invoiceNumber,
    sortBy,
    sortOrder,
  } = params;

  const where: Prisma.InvoiceWhereInput = { storeId };

  if (status) where.status = status as InvoiceStatus;
  if (paymentStatus)
    where.paymentStatus = paymentStatus as InvoicePaymentStatus;
  if (customerId) where.customerId = customerId;

  if (invoiceNumber) {
    where.invoiceNumber = { contains: invoiceNumber, mode: "insensitive" };
  }

  if (query) {
    const term = decodeURIComponent(query);
    where.OR = [
      { invoiceNumber: { contains: term, mode: "insensitive" } },
      { customer: { name: { contains: term, mode: "insensitive" } } },
    ];
  }

  const invoices = await prisma.invoice.findMany({
    where,
    orderBy: { [sortBy]: sortOrder },
    include: {
      customer: true,
      billItems: true,
    },
  });

  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet("Invoices");

  worksheet.columns = [
    { header: "ID", key: "id", width: 36 },
    { header: "Invoice Number", key: "invoiceNumber", width: 20 },
    { header: "Issue Date", key: "issueDate", width: 15 },
    { header: "Customer Name", key: "customerName", width: 25 },
    { header: "Customer Phone", key: "customerPhone", width: 18 },
    { header: "Subtotal", key: "subTotal", width: 15 },
    { header: "Tax Amount", key: "taxAmount", width: 15 },
    { header: "Discount Amount", key: "discountAmount", width: 15 },
    { header: "Total Amount", key: "total", width: 15 },
    { header: "Paid Amount", key: "paidAmount", width: 15 },
    { header: "Due Amount", key: "dueAmount", width: 15 },
    { header: "Status", key: "status", width: 12 },
    { header: "Payment Status", key: "paymentStatus", width: 15 },
    { header: "Total Profit", key: "totalProfit", width: 15 },
    { header: "Note", key: "note", width: 30 },
    { header: "Created At", key: "createdAt", width: 22 },
  ];

  worksheet.getRow(1).font = { bold: true };

  invoices.forEach((inv) => {
    const customerExtra = (inv.extraData as any)?.customer;
    const customerName = inv.customer?.name || customerExtra?.name || "N/A";
    const customerPhone =
      inv.customer?.phoneNumber || customerExtra?.phoneNumber || "";

    worksheet.addRow({
      id: inv.id,
      invoiceNumber: inv.invoiceNumber,
      issueDate: inv.issueDate ? inv.issueDate.toISOString().split("T")[0] : "",
      customerName,
      customerPhone,
      subTotal: inv.subTotal,
      taxAmount: inv.taxAmount,
      discountAmount: inv.discountAmount,
      total: inv.total,
      paidAmount: inv.paidAmount,
      dueAmount: inv.dueAmount,
      status: inv.status,
      paymentStatus: inv.paymentStatus,
      totalProfit: inv.totalProfit,
      note: inv.note || "",
      createdAt: inv.createdAt.toISOString(),
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
      `attachment; filename="invoices_${storeId}_${timestamp}.xlsx"`,
    );
    await workbook.xlsx.write(res);
  } else {
    res.setHeader("Content-Type", "text/csv; charset=utf-8");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="invoices_${storeId}_${timestamp}.csv"`,
    );
    await workbook.csv.write(res);
  }
};
