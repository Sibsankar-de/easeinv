import { prisma } from "../lib/prisma";
import { ApiError } from "../utils/apiErrorHandler";
import { StatusCodes } from "http-status-codes";
import { paginate } from "../utils/paginate";
import { CreateInvoiceDTO } from "../schemas/invoice.schema";
import {
  prismaTransaction,
  TransactionClient,
} from "../utils/transactionHandler";
import * as inventoryService from "../services/inventory.service";
import * as customerService from "./customer.service";
import { InvoiceStatus } from "@prisma/client";
import { calculateInvoiceDetails } from "../utils/invoice-calculator";
import { toInvoiceDto, toInvoiceSummaryDto } from "../dto/invoice.dto";

export const createInvoice = async (
  userId: string,
  storeId: string,
  billData: CreateInvoiceDTO,
) =>
  prismaTransaction(async (tx) => {
    const { invoiceNumber, issueDate, customer: customerDetails } = billData;

    // Update store lastInvoiceNumber
    const store = await tx.store.update({
      where: { id: storeId },
      data: { lastInvoiceNumber: invoiceNumber },
      include: { settings: true },
    });

    const storeSettings = store.settings;

    // Fetch products
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

    // Perform calculations
    const calculations = calculateInvoiceDetails(
      {
        billItems: billData.billItems,
        discountPercent: billData.discountPercent,
        taxRate: billData.taxRate,
        paidAmount: billData.paidAmount,
        roundupTotal: billData.roundupTotal,
      },
      products,
      storeSettings,
    );

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
      data: calculations.billItems.map((item, i: number) => ({
        invoiceId: invoice.id,
        sortOrder: i + 1,
        productId: item.productId,
        productName: products.find((p) => p.id === item.productId)?.name || "",
        pricePerQty: item.pricePerQuantity as any,
        netQuantity: item.netQuantity,
        totalPrice: item.totalPrice,
        stockUnit: item.stockUnit,
        totalProfit: item.totalProfit,
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
      customerService.increamentCustomerDue(
        customer,
        calculations.dueAmount,
        tx,
      ),
    ]);

    const createdInvoice = await getInvoiceById(invoice.id, tx);
    return toInvoiceDto(createdInvoice);
  });

export const updateInvoiceDueAmount = async (
  invoiceId: string,
  paidAmount: number,
) =>
  prismaTransaction(async (tx) => {
    const invoice = await tx.invoice.update({
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
      await tx.customer.update({
        where: { id: invoice.customerId },
        data: { totalDue: { decrement: paidAmount } },
      });
    }

    const updatedInvoice = await getInvoiceById(invoice.id, tx);
    return toInvoiceDto(updatedInvoice);
  });

export const getInvoiceById = async (
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
            select: { id: true, name: true, sku: true },
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
