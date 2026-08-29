import { prisma } from "../lib/prisma";
import { ApiError } from "../utils/apiErrorHandler";
import { StatusCodes } from "http-status-codes";
import { paginate } from "../utils/paginate";
import {
  prismaTransaction,
  TransactionClient,
} from "../utils/transactionHandler";
import {
  OrderCreateDto,
  OrderBillItemDto,
  UpdateOrderStatusDto,
  OrderQueryDto,
} from "../schemas/order.schema";
import {
  toOrderDto,
  toOrderSummaryDto,
  OrderWithAllRelations,
} from "../dto/order.dto";
import * as invoiceService from "./invoice.service";
import * as transactionalEmail from "./transactionalEmail.service";
import {
  DiscountType,
  InvoiceStatus,
  OrderStatus,
  Prisma,
  Coupon,
  Product,
} from "@prisma/client";
import { InvoiceCreateUpdateDto } from "../schemas/invoice.schema";
import { PricePerQuantityType } from "../types/productTypes";

const generateOrderNumber = (prefix: string = "ORD"): string => {
  const timestamp = Date.now().toString(36).toUpperCase();
  const randomPart = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `${prefix}-${timestamp}-${randomPart}`;
};

const generateInvoiceNumber = (
  customInvoiceNumber?: string,
  prefix: string = "INV",
): string => {
  if (customInvoiceNumber && customInvoiceNumber.trim().length > 0) {
    return customInvoiceNumber.trim();
  }
  const timestamp = Date.now().toString(36).toUpperCase();
  const randomPart = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `${prefix}-${timestamp}-${randomPart}`;
};

interface CouponValidationResult {
  coupon: Coupon;
  discountAmount: number;
  discountPercent: number;
}

const validateAndApplyCoupon = async (
  storeId: string,
  couponCode: string,
  subTotal: number,
  customerId: string,
  tx: TransactionClient = prisma,
): Promise<CouponValidationResult> => {
  const coupon = await tx.coupon.findFirst({
    where: {
      storeId,
      code: { equals: couponCode.trim(), mode: "insensitive" },
      isActive: true,
    },
    include: {
      categories: true,
    },
  });

  if (!coupon) {
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      `Coupon "${couponCode}" is invalid or inactive.`,
    );
  }

  const now = new Date();
  if (coupon.startsAt && coupon.startsAt > now) {
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      `Coupon "${coupon.code}" is not yet active.`,
    );
  }

  if (coupon.endsAt && coupon.endsAt < now) {
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      `Coupon "${coupon.code}" has expired.`,
    );
  }

  if (coupon.minOrderValue && subTotal < coupon.minOrderValue) {
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      `Minimum order value of ${coupon.minOrderValue} is required to apply coupon "${coupon.code}".`,
    );
  }

  if (coupon.usageLimit !== null && coupon.usageCount >= coupon.usageLimit) {
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      `Coupon "${coupon.code}" usage limit has been reached.`,
    );
  }

  if (coupon.perCustomerLimit !== null) {
    const customerUsage = await tx.order.count({
      where: {
        storeId,
        couponId: coupon.id,
        customerId,
        status: { not: OrderStatus.REJECTED },
      },
    });

    if (customerUsage >= coupon.perCustomerLimit) {
      throw new ApiError(
        StatusCodes.BAD_REQUEST,
        `You have reached the per-customer usage limit for coupon "${coupon.code}".`,
      );
    }
  }

  let discountAmount = 0;
  let discountPercent = 0;

  if (coupon.discountType === DiscountType.PERCENT) {
    discountPercent = coupon.discountValue;
    discountAmount = Number(((subTotal * discountPercent) / 100).toFixed(2));
    if (coupon.maxDiscount !== null && discountAmount > coupon.maxDiscount) {
      discountAmount = coupon.maxDiscount;
      discountPercent = Number(((discountAmount / subTotal) * 100).toFixed(2));
    }
  } else {
    // FIXED discount
    discountAmount = Number(
      Math.min(coupon.discountValue, subTotal).toFixed(2),
    );
    discountPercent =
      subTotal > 0 ? Number(((discountAmount / subTotal) * 100).toFixed(2)) : 0;
  }

  return { coupon, discountAmount, discountPercent };
};

export const getPopulatedOrder = async (
  orderId: string,
  tx: TransactionClient = prisma,
): Promise<OrderWithAllRelations> => {
  const order = await tx.order.findUnique({
    where: { id: orderId },
    include: {
      customer: true,
      coupon: true,
      store: true,
      invoice: {
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
      },
    },
  });

  if (!order) {
    throw new ApiError(StatusCodes.NOT_FOUND, "Order not found");
  }

  return order;
};

export interface ResolvedOrderBillItem {
  productId: string;
  netQuantity: number;
  totalPrice: number;
  stockUnit: string;
  pricePerQuantity?: PricePerQuantityType;
}

export const calculateOrderBillItem = (
  item: OrderBillItemDto,
  product: Product,
): ResolvedOrderBillItem => {
  let unitPrice = product.buyingPricePerQuantity;
  let stockUnit = item.stockUnit || product.stockUnit;
  let resolvedPricePerQuantity = item.pricePerQuantity;

  if (item.pricePerQuantity) {
    unitPrice =
      item.pricePerQuantity.quantity > 0
        ? item.pricePerQuantity.price / item.pricePerQuantity.quantity
        : item.pricePerQuantity.price;
    stockUnit =
      item.stockUnit || item.pricePerQuantity.unit || product.stockUnit;
  } else {
    const productTiers = (
      Array.isArray(product.pricePerQuantity) ? product.pricePerQuantity : []
    ) as PricePerQuantityType[];

    const matchingTier = item.stockUnit
      ? productTiers.find((t) => t.unit === item.stockUnit)
      : productTiers[0];

    if (matchingTier) {
      unitPrice =
        matchingTier.quantity > 0
          ? matchingTier.price / matchingTier.quantity
          : matchingTier.price;
      stockUnit = item.stockUnit || matchingTier.unit || product.stockUnit;
      resolvedPricePerQuantity = matchingTier;
    } else if (product.mrp && product.mrp > 0) {
      unitPrice = product.mrp;
      stockUnit = item.stockUnit || product.stockUnit;
    }
  }

  const totalPrice = Number((unitPrice * item.netQuantity).toFixed(2));

  return {
    productId: item.productId,
    netQuantity: item.netQuantity,
    totalPrice,
    stockUnit,
    pricePerQuantity: resolvedPricePerQuantity,
  };
};

export const calculateOrderBillItems = (
  billItems: OrderBillItemDto[],
  products: Product[],
): ResolvedOrderBillItem[] => {
  return billItems.map((item) => {
    const product = products.find((p) => p.id === item.productId);
    if (!product) {
      throw new ApiError(
        StatusCodes.BAD_REQUEST,
        `Product not found: ${item.productId}`,
      );
    }
    return calculateOrderBillItem(item, product);
  });
};

export const createOrder = async (
  userId: string,
  storeId: string,
  orderData: OrderCreateDto,
) =>
  prismaTransaction(async (tx) => {
    // 1. Verify customer exists in store, throw if not found
    const customer = await tx.customer.findFirst({
      where: { id: orderData.customerId, storeId },
    });

    if (!customer) {
      throw new ApiError(StatusCodes.NOT_FOUND, "Customer not found");
    }

    // 2. Fetch store and settings
    const store = await tx.store.findUnique({
      where: { id: storeId },
      include: { settings: true },
    });

    if (!store) {
      throw new ApiError(StatusCodes.NOT_FOUND, "Store not found");
    }

    const storeSettings = store.settings;

    // 3. Fetch products and calculate totalPrice for each bill item
    const productIds = orderData.invoiceData.billItems.map(
      (item) => item.productId,
    );
    const products = await tx.product.findMany({
      where: { id: { in: productIds }, storeId },
    });

    if (products.length !== productIds.length) {
      throw new ApiError(
        StatusCodes.BAD_REQUEST,
        "Some products in the order were not found in this store.",
      );
    }

    const calculatedBillItems = calculateOrderBillItems(
      orderData.invoiceData.billItems,
      products,
    );

    // 4. Handle coupon validation if provided
    let appliedCoupon: Coupon | null = null;
    let discountPercent = orderData.invoiceData.discountPercent ?? 0;

    const subTotal = calculatedBillItems.reduce(
      (sum, item) => sum + item.totalPrice,
      0,
    );

    if (orderData.couponCode) {
      const couponResult = await validateAndApplyCoupon(
        storeId,
        orderData.couponCode,
        subTotal,
        customer.id,
        tx,
      );
      appliedCoupon = couponResult.coupon;
      discountPercent = couponResult.discountPercent;
    }

    // 5. Generate invoice number if not provided
    const invoiceNumber = generateInvoiceNumber(
      orderData.invoiceData.invoiceNumber,
      storeSettings?.invoiceNumberPrefix || "INV",
    );

    // 6. Build invoice payload
    const invoicePayload: InvoiceCreateUpdateDto = {
      invoiceNumber,
      issueDate: orderData.invoiceData.issueDate || new Date(),
      paidAmount: orderData.invoiceData.paidAmount ?? 0,
      discountPercent,
      taxRate: orderData.invoiceData.taxRate ?? 0,
      roundupTotal: orderData.invoiceData.roundupTotal ?? false,
      note: orderData.invoiceData.note || orderData.note,
      status: InvoiceStatus.DRAFTED,
      billItems: calculatedBillItems as any,
      customer: {
        id: customer.id,
        name: customer.name,
        phoneNumber: customer.phoneNumber,
        email: customer.email,
        address: customer.address,
      },
    };

    const createdInvoiceDto = await invoiceService.createInvoice(
      userId,
      storeId,
      invoicePayload,
      tx,
    );

    const shippingAmount = orderData.shippingAmount ?? 0;
    const totalAmount = Number(
      (createdInvoiceDto.total + shippingAmount).toFixed(2),
    );

    // Update invoice purpose and extraData
    await tx.invoice.update({
      where: { id: createdInvoiceDto.id },
      data: {
        extraData: {
          purpose: "ORDER",
          shippingAmount,
          customer: {
            name: customer.name,
            phoneNumber: customer.phoneNumber,
            email: customer.email,
            address: customer.address,
          },
        },
      },
    });

    // 6. Generate readable order number and persist order
    const orderNumber = generateOrderNumber(
      storeSettings?.invoiceNumberPrefix || "ORD",
    );

    const order = await tx.order.create({
      data: {
        storeId,
        customerId: customer.id,
        invoiceId: createdInvoiceDto.id,
        couponId: appliedCoupon ? appliedCoupon.id : null,
        status: OrderStatus.PENDING,
        orderNumber,
        subtotal: createdInvoiceDto.subTotal,
        taxAmount: createdInvoiceDto.taxAmount ?? 0,
        discountAmount: createdInvoiceDto.discountAmount ?? 0,
        shippingAmount,
        totalAmount,
        orderDate: new Date(),
        extraData: {
          ...(orderData.extraData || {}),
          note: orderData.note || "",
        },
      },
    });

    const populatedOrder = await getPopulatedOrder(order.id, tx);
    return toOrderDto(populatedOrder);
  });

export const updateOrderStatus = async (
  storeId: string,
  orderId: string,
  data: UpdateOrderStatusDto,
) => {
  switch (data.status) {
    case OrderStatus.PROCESSING:
      return transitionToProcessing(storeId, orderId);

    case OrderStatus.DISPATCHED:
      if (!data.deliveryReference) {
        throw new ApiError(
          StatusCodes.BAD_REQUEST,
          "Delivery reference is required when dispatching an order.",
        );
      }
      return transitionToDispatch(storeId, orderId, {
        deliveryReference: data.deliveryReference,
        note: data.note,
      });

    case OrderStatus.COMPLETED:
      return transitionToComplete(storeId, orderId);

    case OrderStatus.REJECTED:
      return transitionToReject(storeId, orderId, {
        reason: data.reason,
      });

    default:
      throw new ApiError(
        StatusCodes.BAD_REQUEST,
        `Invalid or unsupported order status transition to "${data.status}".`,
      );
  }
};

export const transitionToProcessing = async (
  storeId: string,
  orderId: string,
) => {
  const existingOrder = await getPopulatedOrder(orderId);

  if (existingOrder.storeId !== storeId) {
    throw new ApiError(StatusCodes.NOT_FOUND, "Order not found in this store");
  }

  if (existingOrder.status !== OrderStatus.PENDING) {
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      `Cannot transition order in "${existingOrder.status}" state to PROCESSING. Only PENDING orders can be processed.`,
    );
  }

  const updatedOrder = await prisma.order.update({
    where: { id: orderId },
    data: {
      status: OrderStatus.PROCESSING,
    },
    include: {
      customer: true,
      coupon: true,
      store: true,
      invoice: {
        include: {
          customer: true,
          billItems: {
            include: { product: true },
          },
        },
      },
    },
  });

  // Send Order Processing Email to Customer
  if (updatedOrder.customer && updatedOrder.store) {
    void transactionalEmail.sendOrderProcessingEmail(
      {
        name: updatedOrder.customer.name,
        email: updatedOrder.customer.email,
      },
      updatedOrder.store,
      updatedOrder,
    );
  }

  return toOrderDto(updatedOrder as OrderWithAllRelations);
};

export const transitionToDispatch = async (
  storeId: string,
  orderId: string,
  dispatchData: { deliveryReference: string; note?: string },
) => {
  const existingOrder = await getPopulatedOrder(orderId);

  if (existingOrder.storeId !== storeId) {
    throw new ApiError(StatusCodes.NOT_FOUND, "Order not found in this store");
  }

  if (
    existingOrder.status !== OrderStatus.PENDING &&
    existingOrder.status !== OrderStatus.PROCESSING
  ) {
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      `Cannot dispatch order with status "${existingOrder.status}".`,
    );
  }

  const currentExtraData =
    (existingOrder.extraData as Record<string, unknown>) || {};
  const updatedExtraData = {
    ...currentExtraData,
    delivery_reference: dispatchData.deliveryReference,
    note: dispatchData.note ?? currentExtraData.note ?? "",
  };

  const updatedOrder = await prisma.order.update({
    where: { id: orderId },
    data: {
      status: OrderStatus.DISPATCHED,
      extraData: updatedExtraData,
    },
    include: {
      customer: true,
      coupon: true,
      store: true,
      invoice: {
        include: {
          customer: true,
          billItems: {
            include: { product: true },
          },
        },
      },
    },
  });

  // Send Order Dispatched Email to Customer
  if (updatedOrder.customer && updatedOrder.store) {
    void transactionalEmail.sendOrderDispatchedEmail(
      {
        name: updatedOrder.customer.name,
        email: updatedOrder.customer.email,
      },
      updatedOrder.store,
      updatedOrder,
      dispatchData.deliveryReference,
      dispatchData.note,
    );
  }

  return toOrderDto(updatedOrder as OrderWithAllRelations);
};

export const transitionToComplete = async (storeId: string, orderId: string) =>
  prismaTransaction(async (tx) => {
    const existingOrder = await tx.order.findUnique({
      where: { id: orderId },
      include: {
        customer: true,
        coupon: true,
        store: true,
      },
    });

    if (!existingOrder || existingOrder.storeId !== storeId) {
      throw new ApiError(
        StatusCodes.NOT_FOUND,
        "Order not found in this store",
      );
    }

    if (existingOrder.status === OrderStatus.COMPLETED) {
      throw new ApiError(StatusCodes.BAD_REQUEST, "Order is already COMPLETED");
    }

    if (existingOrder.status === OrderStatus.REJECTED) {
      throw new ApiError(
        StatusCodes.BAD_REQUEST,
        "Cannot complete a REJECTED order",
      );
    }

    // Reuse invoiceService.issueInvoice to issue the draft invoice & run side effects
    const issuedInvoice = await invoiceService.issueInvoice(
      storeId,
      existingOrder.invoiceId,
      tx,
    );

    // Increment coupon usage if applied
    if (existingOrder.couponId) {
      await tx.coupon.update({
        where: { id: existingOrder.couponId },
        data: {
          usageCount: { increment: 1 },
        },
      });
    }

    // Update order status to COMPLETED
    const updatedOrder = await tx.order.update({
      where: { id: orderId },
      data: {
        status: OrderStatus.COMPLETED,
      },
      include: {
        customer: true,
        coupon: true,
        store: true,
        invoice: {
          include: {
            customer: true,
            billItems: {
              include: { product: true },
            },
          },
        },
      },
    });

    // Send Order Completed Email
    if (existingOrder.customer && existingOrder.store) {
      void transactionalEmail.sendOrderCompletedEmail(
        {
          name: existingOrder.customer.name,
          email: existingOrder.customer.email,
        },
        existingOrder.store,
        updatedOrder,
        issuedInvoice.invoiceNumber,
      );
    }

    return toOrderDto(updatedOrder as OrderWithAllRelations);
  });

export const transitionToReject = async (
  storeId: string,
  orderId: string,
  rejectData: { reason?: string },
) => {
  const existingOrder = await getPopulatedOrder(orderId);

  if (existingOrder.storeId !== storeId) {
    throw new ApiError(StatusCodes.NOT_FOUND, "Order not found in this store");
  }

  if (existingOrder.status === OrderStatus.COMPLETED) {
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      "Cannot reject an already COMPLETED order",
    );
  }

  const currentExtraData =
    (existingOrder.extraData as Record<string, unknown>) || {};
  const updatedExtraData = {
    ...currentExtraData,
    rejection_reason: rejectData.reason || "Order cancelled by administrator",
  };

  const updatedOrder = await prisma.order.update({
    where: { id: orderId },
    data: {
      status: OrderStatus.REJECTED,
      extraData: updatedExtraData,
    },
    include: {
      customer: true,
      coupon: true,
      store: true,
      invoice: {
        include: {
          customer: true,
          billItems: {
            include: { product: true },
          },
        },
      },
    },
  });

  // Send Rejection Email to Customer
  if (updatedOrder.customer && updatedOrder.store) {
    void transactionalEmail.sendOrderRejectedEmail(
      {
        name: updatedOrder.customer.name,
        email: updatedOrder.customer.email,
      },
      updatedOrder.store,
      updatedOrder,
      rejectData.reason,
    );
  }

  return toOrderDto(updatedOrder as OrderWithAllRelations);
};

export const searchOrders = async (
  params: OrderQueryDto & { storeId: string },
) => {
  const { storeId, page, limit, status, customerId, query, sortBy, sortOrder } =
    params;

  const where: Prisma.OrderWhereInput = { storeId };

  if (status) {
    where.status = status as OrderStatus;
  }

  if (customerId) {
    where.customerId = customerId;
  }

  if (query) {
    const term = decodeURIComponent(query);
    where.OR = [
      { orderNumber: { contains: term, mode: "insensitive" } },
      { customer: { name: { contains: term, mode: "insensitive" } } },
    ];
  }

  const result = await paginate(
    prisma.order,
    where,
    { [sortBy]: sortOrder },
    { page, limit },
    {
      customer: true,
    },
  );

  return {
    ...result,
    docs: result.docs.map((doc: any) => toOrderSummaryDto(doc)),
  };
};

export const getOrderById = async (storeId: string, orderId: string) => {
  const order = await getPopulatedOrder(orderId);

  if (order.storeId !== storeId) {
    throw new ApiError(StatusCodes.NOT_FOUND, "Order not found in this store");
  }

  return toOrderDto(order);
};

export const deleteOrder = async (storeId: string, orderId: string) =>
  prismaTransaction(async (tx) => {
    const order = await tx.order.findUnique({
      where: { id: orderId },
      include: { invoice: true },
    });

    if (!order || order.storeId !== storeId) {
      throw new ApiError(
        StatusCodes.NOT_FOUND,
        "Order not found in this store",
      );
    }

    if (order.status === OrderStatus.COMPLETED) {
      throw new ApiError(
        StatusCodes.FORBIDDEN,
        "Cannot delete a completed order",
      );
    }

    // Delete draft invoice if drafted
    if (order.invoice && order.invoice.status === InvoiceStatus.DRAFTED) {
      await tx.invoice.delete({ where: { id: order.invoiceId } });
    }

    await tx.order.delete({ where: { id: orderId } });

    return { success: true, message: "Order deleted successfully" };
  });
