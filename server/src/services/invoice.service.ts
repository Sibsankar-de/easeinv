import { prisma } from "../lib/prisma";
import { ApiError } from "../utils/ApiError";
import { StatusCodes } from "http-status-codes";
import { paginate } from "../utils/paginate";
import { CreateInvoiceDTO } from "../schemas/invoice.schema";

export const createInvoice = async (
  userId: string,
  storeId: string,
  billData: CreateInvoiceDTO,
) => {
  const { invoiceNumber, issueDate, total, subTotal, paidAmount, dueAmount } =
    billData;

  if (!invoiceNumber || !issueDate) {
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      "Invoice number and issue date is required",
    );
  }

  if ([total, subTotal, paidAmount, dueAmount].some((e) => e === null)) {
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      "Calculated amounts are required",
    );
  }

  if (!billData?.billItems || billData.billItems.length === 0) {
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      "Atleast one bill item is required",
    );
  }

  const customerDetails = billData.customerDetails;
  if (!customerDetails?.name) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "Customer name is required");
  }

  // Update store lastInvoiceNumber
  const store = await prisma.store.update({
    where: { id: storeId },
    data: { lastInvoiceNumber: invoiceNumber },
    include: { settings: true },
  });

  const storeSettings = store.settings;

  // Create or reuse customer
  let customerId: string | undefined = customerDetails?.id;
  if (!customerId) {
    const customer = await prisma.customer.create({
      data: {
        storeId,
        name: customerDetails.name,
        phoneNumber: customerDetails.phoneNumber,
        address: customerDetails.address,
        email: customerDetails.email,
      },
    });
    customerId = customer.id;
  }

  // Create invoice + items in a transaction
  const newInvoice = await prisma.$transaction(async (tx) => {
    const invoice = await tx.invoice.create({
      data: {
        creatorId: userId,
        storeId,
        customerId,
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
        status: (billData.status as any) ?? "DRAFTED",
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
      data: billData.billItems.map((item: any, i: number) => ({
        invoiceId: invoice.id,
        sortOrder: i + 1,
        productId: item.product?.id ?? null,
        productName: item.product?.name ?? null,
        productSku: item.product?.sku ?? null,
        pricePerQty: item.pricePerQuantity ?? null,
        netQuantity: item.netQuantity,
        totalPrice: item.totalPrice,
        stockUnit: item.stockUnit ?? null,
        totalProfit: item.totalProfit ?? 0,
      })),
    });

    return invoice;
  });

  // Side effects: inventory tracking + due amount
  await Promise.all([
    ...(storeSettings?.enableInventoryTracking
      ? billData.billItems.map((item: any) =>
          prisma.product.updateMany({
            where: {
              id: item.product?.id,
              enabledInventoryTracking: true,
              totalStock: { gte: item.netQuantity },
            },
            data: { totalStock: { decrement: item.netQuantity } },
          }),
        )
      : []),
    ...(dueAmount > 0 && customerId
      ? [
          prisma.customer.update({
            where: { id: customerId },
            data: { totalDue: { increment: dueAmount } },
          }),
        ]
      : []),
  ]);

  return newInvoice;
};

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
