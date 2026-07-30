import { prisma } from "../lib/prisma";
import { ApiError } from "../utils/apiErrorHandler";
import { StatusCodes } from "http-status-codes";
import { paginate } from "../utils/paginate";
import { InvoiceCreateDto } from "../schemas/invoice.schema";
import {
  prismaTransaction,
  TransactionClient,
} from "../utils/transactionHandler";
import * as inventoryService from "../services/inventory.service";
import * as customerService from "./customer.service";
import { InvoiceStatus, InvoicePaymentStatus } from "@prisma/client";
import {
  CalculatedInvoice,
  calculateInvoiceDetails,
} from "../utils/invoice-calculator";
import {
  toInvoiceDto,
  toInvoiceSummaryDto,
  toInvoiceCalculationSummaryDto,
} from "../dto/invoice.dto";

export const createInvoice = async (
  userId: string,
  storeId: string,
  billData: InvoiceCreateDto,
) =>
  prismaTransaction(async (tx) => {
    const { invoiceNumber, issueDate, customer: customerDetails } = billData;

    // Update store lastInvoiceNumber
    const store = await tx.store.update({
      where: { id: storeId },
      data: { lastInvoiceNumber: invoiceNumber },
      include: { settings: true },
    });

    const storeSettings = store.settings!;

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
      billData,
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
        paymentStatus:
          calculations.dueAmount > 0
            ? InvoicePaymentStatus.DUE
            : InvoicePaymentStatus.PAID,
        extraData: {
          customer: {
            name: customerDetails.name,
            phoneNumber: customerDetails.phoneNumber,
            email: customerDetails.email,
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

    // Side effects: inventory tracking + due amount + invoice summary
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
      updateInvoiceSummaryOnCreate(storeId, calculations, tx),
    ]);

    const createdInvoice = await getPopulatedInvoice(invoice.id, tx);
    return toInvoiceDto(createdInvoice);
  });

const updateInvoiceSummaryOnCreate = (
  storeId: string,
  calculations: CalculatedInvoice,
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

export const updateInvoiceDueAmount = async (
  invoiceId: string,
  paidAmount: number,
) =>
  prismaTransaction(async (tx) => {
    const currentInvoice = await tx.invoice.findUnique({
      where: { id: invoiceId },
      select: { dueAmount: true, customerId: true },
    });

    if (!currentInvoice) {
      throw new ApiError(StatusCodes.NOT_FOUND, "Invoice not found");
    }

    if (paidAmount > currentInvoice.dueAmount) {
      throw new ApiError(StatusCodes.BAD_REQUEST, "Invalid paid ammount.");
    }

    const newDueAmount = currentInvoice.dueAmount - paidAmount;
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

    const updatedInvoice = await getPopulatedInvoice(invoice.id, tx);
    return toInvoiceDto(updatedInvoice);
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
  paymentStatus?: string;
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
    paymentStatus,
    customerPrefix,
    customerId,
    sortBy,
    sortOrder,
  } = params;

  const where: any = { storeId };

  if (status) where.status = status;
  if (paymentStatus) where.paymentStatus = paymentStatus;
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
  const summary = await prisma.invoiceSummary.findUniqueOrThrow({
    where: { storeId },
  });

  return toInvoiceCalculationSummaryDto(summary);
};
