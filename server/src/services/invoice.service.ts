import { prisma } from "../lib/prisma";
import { ApiError } from "../utils/apiErrorHandler";
import { StatusCodes } from "http-status-codes";
import { paginate } from "../utils/paginate";
import { CreateInvoiceDTO } from "../schemas/invoice.schema";
import { prismaTransaction } from "../utils/transactionHandler";
import * as inventoryService from "../services/inventory.service";
import * as customerService from "./customer.service";
import { InvoiceStatus } from "@prisma/client";

export const createInvoice = async (
  userId: string,
  storeId: string,
  billData: CreateInvoiceDTO,
) =>
  prismaTransaction(async (tx) => {
    const {
      invoiceNumber,
      issueDate,
      total,
      subTotal,
      paidAmount,
      dueAmount,
      customerDetails,
    } = billData;

    // Update store lastInvoiceNumber
    const store = await tx.store.update({
      where: { id: storeId },
      data: { lastInvoiceNumber: invoiceNumber },
      include: { settings: true },
    });

    const storeSettings = store.settings;

    // Create or reuse customer
    const customer = await customerService.getOrCreateInvoiceCustomer(
      storeId,
      customerDetails,
      tx,
    );

    // create invoice + items
    const invoice = await tx.invoice.create({
      data: {
        userId,
        storeId,
        customerId: customer.id,
        invoiceNumber,
        issueDate: new Date(issueDate),
        subTotal,
        total,
        discountAmount: billData.discountAmount ?? 0,
        dueAmount: dueAmount ?? 0,
        paidAmount: paidAmount ?? 0,
        taxAmount: billData.taxAmount ?? 0,
        taxRate: billData.taxRate ?? 0,
        totalProfit: billData.totalProfit ?? 0,
        roundupTotal: billData.roundupTotal ?? false,
        note: billData.note,
        status: billData.status ?? InvoiceStatus.DRAFTED,
        extraData: {
          customer: {
            name: customerDetails.name,
            phoneNumber: customerDetails.phoneNumber,
            address: customerDetails.address,
          },
        },
      },
    });

    await tx.invoiceItem.createMany({
      data: billData.billItems.map((item, i: number) => ({
        invoiceId: invoice.id,
        sortOrder: i + 1,
        productId: item.productId,
        pricePerQty: item.pricePerQuantity,
        netQuantity: item.netQuantity,
        totalPrice: item.totalPrice,
        stockUnit: item.stockUnit,
        totalProfit: item.totalProfit ?? 0,
      })),
    });

    // Side effects: inventory tracking + due amount
    await Promise.all([
      ...(storeSettings?.enableInventoryTracking
        ? billData.billItems.map((item) =>
            inventoryService.updateInventoryStock(
              item.productId,
              item.netQuantity,
              store,
              tx,
            ),
          )
        : []),
      customerService.increamentCustomerDue(customer, dueAmount, tx),
    ]);

    return invoice;
  });

export const updateInvoiceDueAmount = async (
  invoiceId: string,
  paidAmount: number,
) => {
  if (paidAmount === null || paidAmount === undefined || paidAmount <= 0) {
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      "Paid amount must be greater than zero",
    );
  }

  const invoice = await prisma.invoice.update({
    where: { id: invoiceId },
    data: {
      paidAmount: { increment: paidAmount },
      dueAmount: { decrement: paidAmount },
    },
  });

  if (!invoice) {
    throw new ApiError(StatusCodes.NOT_FOUND, "Invoice not found");
  }

  if (invoice.dueAmount >= 0 && invoice.customerId) {
    await prisma.customer.update({
      where: { id: invoice.customerId },
      data: { totalDue: { decrement: paidAmount } },
    });
  }

  return invoice;
};

export const searchInvoice = async (params: {
  storeId: string;
  page: number;
  limit: number;
  status?: string;
  customerPrefix?: string;
  customerId?: string;
  sortBy: string;
  sortOrder: "asc" | "desc";
}) => {
  const {
    storeId,
    page,
    limit,
    status,
    customerPrefix,
    customerId,
    sortBy,
    sortOrder,
  } = params;

  const where: any = { storeId };

  if (status) where.status = status;
  if (customerId) where.customerId = customerId;

  if (customerPrefix) {
    where.customer = {
      name: { startsWith: customerPrefix, mode: "insensitive" },
    };
  }

  return paginate(
    prisma.invoice,
    where,
    { [sortBy]: sortOrder },
    { page, limit },
    {
      customer: {
        select: { id: true, name: true, phoneNumber: true, address: true },
      },
      billItems: true,
    },
  );
};

export const getInvoiceSummary = async (storeId: string) => {
  const [aggregated, paidCount, dueCount] = await Promise.all([
    prisma.invoice.aggregate({
      where: { storeId },
      _sum: {
        total: true,
        paidAmount: true,
        dueAmount: true,
      },
      _count: { id: true },
    }),
    prisma.invoice.count({ where: { storeId, dueAmount: { lte: 0 } } }),
    prisma.invoice.count({ where: { storeId, dueAmount: { gt: 0 } } }),
  ]);

  const totalProfit = await prisma.invoice.aggregate({
    where: { storeId },
    _sum: { totalProfit: true },
  });

  return {
    totalInvoices: aggregated._count.id,
    totalRevenue: aggregated._sum.total ?? 0,
    totalDue: aggregated._sum.dueAmount ?? 0,
    totalPaid: aggregated._sum.paidAmount ?? 0,
    totalProfit: totalProfit._sum.totalProfit ?? 0,
    paidCount,
    dueCount,
  };
};
