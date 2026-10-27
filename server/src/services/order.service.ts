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
  OrderInvoiceDataDto,
  UpdateOrderStatusDto,
  OrderQueryDto,
} from "../schemas/order.schema";
import {
  toOrderDto,
  toOrderSummaryDto,
  OrderWithAllRelations,
} from "../dto/order.dto";
import {
  orderExtraDataConverter,
  orderEventLogsConverter,
} from "../converters/order.converter";
import { invoiceExtraDataConverter } from "../converters/invoice.converter";
import * as invoiceService from "./invoice.service";
import * as shippingService from "./shipping.service";
import * as transactionalEmail from "./transactionalEmail.service";
import {
  DiscountType,
  InvoiceStatus,
  InvoicePurpose,
  OrderStatus,
  Prisma,
  Coupon,
  Product,
  StoreSettings,
} from "@prisma/client";
import { InvoiceCreateUpdateDto } from "../schemas/invoice.schema";
import { PricePerQuantityType } from "../types/productTypes";
import {
  CalculatedInvoice,
  CalculatedInvoiceItem,
} from "../utils/invoice-calculator";

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
  applicableProductIds: string[];
}

const validateCoupon = async (
  storeId: string,
  couponCode: string,
  customerId: string,
  productIds: string[],
  initialTotal?: number,
  tx: TransactionClient = prisma,
): Promise<CouponValidationResult> => {
  const coupon = await tx.coupon.findFirst({
    where: {
      storeId,
      code: { equals: couponCode.trim(), mode: "insensitive" },
      isActive: true,
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

  if (
    coupon.minOrderValue &&
    initialTotal !== undefined &&
    initialTotal < coupon.minOrderValue
  ) {
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

  if (coupon.useAllCategories) {
    return { coupon, applicableProductIds: productIds };
  }

  const couponCategories = await tx.couponCategory.findMany({
    where: { couponId: coupon.id },
    select: { categoryId: true },
  });

  if (couponCategories.length === 0) {
    return { coupon, applicableProductIds: productIds };
  }

  const categoryIds = couponCategories.map((c) => c.categoryId);
  const applicableProducts = await tx.product.findMany({
    where: {
      storeId,
      id: { in: productIds },
      categories: { some: { categoryId: { in: categoryIds } } },
    },
    select: { id: true },
  });

  return { coupon, applicableProductIds: applicableProducts.map((p) => p.id) };
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
      address: true,
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
  couponCode?: string;
  couponDiscount?: number;
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

const applyPercentCoupon = (
  billItems: ResolvedOrderBillItem[],
  applicableProductIds: string[],
  coupon: Coupon,
): ResolvedOrderBillItem[] => {
  const applicableSubTotal = billItems
    .filter((item) => applicableProductIds.includes(item.productId))
    .reduce((sum, item) => sum + item.totalPrice, 0);

  const rawTotalDiscount = Number(
    ((applicableSubTotal * coupon.discountValue) / 100).toFixed(2),
  );
  const totalDiscount =
    coupon.maxDiscount !== null
      ? Math.min(rawTotalDiscount, coupon.maxDiscount)
      : rawTotalDiscount;

  return billItems.map((item) => {
    if (!applicableProductIds.includes(item.productId)) return item;

    const itemDiscount = Number(
      ((item.totalPrice / applicableSubTotal) * totalDiscount).toFixed(2),
    );
    return {
      ...item,
      totalPrice: Number((item.totalPrice - itemDiscount).toFixed(2)),
      couponCode: coupon.code,
      couponDiscount: itemDiscount,
    };
  });
};

const applyFixedCoupon = (
  billItems: ResolvedOrderBillItem[],
  applicableProductIds: string[],
  coupon: Coupon,
): ResolvedOrderBillItem[] =>
  billItems.map((item) => {
    if (!applicableProductIds.includes(item.productId)) return item;
    return { ...item, couponCode: coupon.code };
  });

export interface CalculateOrderParams {
  orderBillItems: OrderBillItemDto[];
  products: Product[];
  invoiceData: OrderInvoiceDataDto;
  storeSettings?: StoreSettings | null;
  coupon?: Coupon | null;
  applicableProductIds?: string[];
}

export interface CalculateOrderResult {
  calculations: CalculatedInvoice;
  billItems: CalculatedInvoiceItem[];
}

export const calculateOrder = (
  params: CalculateOrderParams,
): CalculateOrderResult => {
  const {
    orderBillItems,
    products,
    invoiceData,
    storeSettings,
    coupon,
    applicableProductIds = [],
  } = params;

  const initialBillItems = calculateOrderBillItems(orderBillItems, products);
  const initialSubTotal = initialBillItems.reduce(
    (sum, item) => sum + item.totalPrice,
    0,
  );

  let finalBillItems = initialBillItems;
  let invoiceDiscountPercent = invoiceData.discountPercent ?? 0;
  let invoiceDiscountAmount = 0;
  let taxableBase = initialSubTotal;

  if (coupon && applicableProductIds.length > 0) {
    if (coupon.discountType === DiscountType.PERCENT) {
      finalBillItems = applyPercentCoupon(
        initialBillItems,
        applicableProductIds,
        coupon,
      );
      const finalSubTotal = finalBillItems.reduce(
        (sum, item) => sum + item.totalPrice,
        0,
      );
      invoiceDiscountAmount = Number(
        (initialSubTotal - finalSubTotal).toFixed(2),
      );
      invoiceDiscountPercent =
        initialSubTotal > 0
          ? Number(((invoiceDiscountAmount / initialSubTotal) * 100).toFixed(2))
          : 0;
      // For PERCENT: item prices are already reduced - tax base is the post-discount subtotal
      taxableBase = finalSubTotal;
    } else {
      finalBillItems = applyFixedCoupon(
        initialBillItems,
        applicableProductIds,
        coupon,
      );
      invoiceDiscountAmount = Math.min(coupon.discountValue, initialSubTotal);
      invoiceDiscountPercent =
        initialSubTotal > 0
          ? Number(((invoiceDiscountAmount / initialSubTotal) * 100).toFixed(2))
          : 0;
      // For FIXED: item prices unchanged - tax base is subtotal minus the fixed deduction
      taxableBase = initialSubTotal - invoiceDiscountAmount;
    }
  } else if (invoiceDiscountPercent > 0) {
    invoiceDiscountAmount = Number(
      ((invoiceDiscountPercent * initialSubTotal) / 100).toFixed(2),
    );
    taxableBase = initialSubTotal - invoiceDiscountAmount;
  }

  const billItems: CalculatedInvoiceItem[] = finalBillItems.map((item) => {
    const product = products.find((p) => p.id === item.productId)!;
    const totalProfit = Number(
      (
        item.totalPrice -
        product.buyingPricePerQuantity * item.netQuantity
      ).toFixed(2),
    );

    return {
      productId: item.productId,
      netQuantity: item.netQuantity,
      pricePerQuantity: item.pricePerQuantity,
      totalPrice: item.totalPrice,
      totalProfit,
      stockUnit: item.stockUnit,
      couponCode: item.couponCode,
      couponDiscount: item.couponDiscount,
    };
  });

  const subTotal = Number(
    billItems.reduce((sum, item) => sum + item.totalPrice, 0).toFixed(2),
  );
  const subTotalProfit = Number(
    billItems.reduce((sum, item) => sum + item.totalProfit, 0).toFixed(2),
  );

  const taxRate =
    invoiceData.taxRate !== undefined
      ? invoiceData.taxRate
      : (storeSettings?.defaultTaxRate ?? 0);

  const taxAmount = Number(((taxRate * taxableBase) / 100).toFixed(2));

  let total = Number((taxableBase + taxAmount).toFixed(2));

  const roundupTotal =
    invoiceData.roundupTotal !== undefined
      ? invoiceData.roundupTotal
      : (storeSettings?.roundupInvoiceTotal ?? false);

  if (roundupTotal) {
    total = Math.round(total);
  }

  const paidAmount =
    invoiceData.paidAmount !== undefined ? invoiceData.paidAmount : total;
  const dueAmount = Number(Math.max(0, total - paidAmount).toFixed(2));
  const totalProfit = Number(
    (subTotalProfit - invoiceDiscountAmount).toFixed(2),
  );

  const calculations: CalculatedInvoice = {
    subTotal,
    discountAmount: invoiceDiscountAmount,
    discountPercent: invoiceDiscountPercent,
    taxAmount,
    taxRate,
    total,
    paidAmount,
    dueAmount,
    totalProfit,
    roundupTotal,
    billItems,
  };

  return {
    calculations,
    billItems,
  };
};

export const calculateOrderTotal = (
  orderBillItems: OrderBillItemDto[],
  products: Product[],
  invoiceData: OrderInvoiceDataDto,
  storeSettings?: StoreSettings | null,
): number => {
  const billItems = calculateOrderBillItems(orderBillItems, products);
  const subTotal = Number(
    billItems.reduce((sum, item) => sum + item.totalPrice, 0).toFixed(2),
  );

  const discountPercent = invoiceData.discountPercent ?? 0;
  const discountAmount = Number(
    ((discountPercent * subTotal) / 100).toFixed(2),
  );
  const taxableBase = subTotal - discountAmount;

  const taxRate =
    invoiceData.taxRate !== undefined
      ? invoiceData.taxRate
      : (storeSettings?.defaultTaxRate ?? 0);

  const taxAmount = Number(((taxRate * taxableBase) / 100).toFixed(2));
  let total = Number((taxableBase + taxAmount).toFixed(2));

  const roundupTotal =
    invoiceData.roundupTotal !== undefined
      ? invoiceData.roundupTotal
      : (storeSettings?.roundupInvoiceTotal ?? false);

  if (roundupTotal) {
    total = Math.round(total);
  }

  return total;
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

    // 3. Fetch products
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

    // 4. Handle coupon validation if provided
    let appliedCoupon: Coupon | null = null;
    let applicableProductIds: string[] = [];

    if (orderData.couponCode) {
      const initialTotal = calculateOrderTotal(
        orderData.invoiceData.billItems,
        products,
        orderData.invoiceData,
        storeSettings,
      );

      const couponResult = await validateCoupon(
        storeId,
        orderData.couponCode,
        customer.id,
        productIds,
        initialTotal,
        tx,
      );

      if (couponResult.applicableProductIds.length > 0) {
        appliedCoupon = couponResult.coupon;
        applicableProductIds = couponResult.applicableProductIds;
      }
    }

    // 5. Calculate order details
    const { calculations, billItems } = calculateOrder({
      orderBillItems: orderData.invoiceData.billItems,
      products,
      invoiceData: orderData.invoiceData,
      storeSettings,
      coupon: appliedCoupon,
      applicableProductIds,
    });

    // 6. Calculate shipping rates from subtotal
    const shippingCalculation = await shippingService.calculateShippingCharge(
      storeId,
      orderData.shippingAddress,
      calculations.subTotal,
      tx,
    );
    const shippingAmount = shippingCalculation.shippingAmount;

    // 7. Generate invoice number if not provided
    const invoiceNumber = generateInvoiceNumber(
      orderData.invoiceData.invoiceNumber,
      storeSettings?.invoiceNumberPrefix || "INV",
    );

    // 8. Build invoice payload and persist invoice
    const invoicePayload: InvoiceCreateUpdateDto = {
      invoiceNumber,
      issueDate: orderData.invoiceData.issueDate || new Date(),
      paidAmount: calculations.paidAmount,
      discountPercent: calculations.discountPercent,
      taxRate: calculations.taxRate,
      roundupTotal: calculations.roundupTotal,
      note: orderData.invoiceData.note || orderData.note,
      status: InvoiceStatus.DRAFTED,
      billItems: billItems as any,
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
      customer,
      calculations,
      products,
      InvoiceStatus.DRAFTED,
      InvoicePurpose.ORDER,
      tx,
    );

    const totalAmount = Number(
      (createdInvoiceDto.total + shippingAmount).toFixed(2),
    );

    // Update invoice extraData with shipping details
    await tx.invoice.update({
      where: { id: createdInvoiceDto.id },
      data: {
        extraData: invoiceExtraDataConverter({
          shippingAmount,
          shippingCalculation,
          customer: {
            name: customer.name,
            phoneNumber: customer.phoneNumber,
            email: customer.email,
            address: customer.address,
          },
        }) as unknown as Prisma.InputJsonValue,
      },
    });

    // 8. Generate readable order number and persist order
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
        extraData: orderExtraDataConverter({
          ...(orderData.extraData || {}),
          note: orderData.note || "",
          shipping_calculation: shippingCalculation,
        }) as unknown as Prisma.InputJsonValue,
        eventLogs: [
          {
            status: OrderStatus.PENDING,
            timestamp: new Date(),
            ...(orderData.note ? { note: orderData.note } : {}),
          },
        ] as unknown as Prisma.InputJsonValue,
        address: {
          create: {
            addressLine: orderData.shippingAddress.addressLine,
            city: orderData.shippingAddress.city || "",
            state: orderData.shippingAddress.state || "",
            pincode: orderData.shippingAddress.pincode || "",
            country: orderData.shippingAddress.country,
          },
        },
      } as unknown as Prisma.OrderCreateInput,
    });

    if (appliedCoupon) {
      await tx.coupon.update({
        where: { id: appliedCoupon.id },
        data: {
          usageCount: { increment: 1 },
        },
      });
    }

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

  const currentEventLogs = orderEventLogsConverter(existingOrder.eventLogs);
  const updatedEventLogs = [
    ...currentEventLogs,
    {
      status: OrderStatus.PROCESSING,
      timestamp: new Date(),
    },
  ];

  const updatedOrder = await prisma.order.update({
    where: { id: orderId },
    data: {
      status: OrderStatus.PROCESSING,
      eventLogs: updatedEventLogs as unknown as Prisma.InputJsonValue,
    } as unknown as Prisma.OrderUpdateInput,
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

  const currentExtraData = orderExtraDataConverter(existingOrder.extraData);
  const updatedExtraData = orderExtraDataConverter({
    ...currentExtraData,
    delivery_reference: dispatchData.deliveryReference,
    note: dispatchData.note ?? currentExtraData.note ?? "",
  });

  const currentEventLogs = orderEventLogsConverter(existingOrder.eventLogs);
  const updatedEventLogs = [
    ...currentEventLogs,
    {
      status: OrderStatus.DISPATCHED,
      timestamp: new Date(),
      ...(dispatchData.note ? { note: dispatchData.note } : {}),
    },
  ];

  const updatedOrder = await prisma.order.update({
    where: { id: orderId },
    data: {
      status: OrderStatus.DISPATCHED,
      extraData: updatedExtraData as unknown as Prisma.InputJsonValue,
      eventLogs: updatedEventLogs as unknown as Prisma.InputJsonValue,
    } as unknown as Prisma.OrderUpdateInput,
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
    const existingOrder = (await tx.order.findUnique({
      where: { id: orderId },
      include: {
        customer: true,
        coupon: true,
        store: true,
      },
    })) as OrderWithAllRelations | null;

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

    const currentEventLogs = orderEventLogsConverter(existingOrder.eventLogs);
    const updatedEventLogs = [
      ...currentEventLogs,
      {
        status: OrderStatus.COMPLETED,
        timestamp: new Date(),
      },
    ];

    // Update order status to COMPLETED
    const updatedOrder = await tx.order.update({
      where: { id: orderId },
      data: {
        status: OrderStatus.COMPLETED,
        eventLogs: updatedEventLogs as unknown as Prisma.InputJsonValue,
      } as unknown as Prisma.OrderUpdateInput,
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

  const currentExtraData = orderExtraDataConverter(existingOrder.extraData);
  const updatedExtraData = orderExtraDataConverter({
    ...currentExtraData,
    rejection_reason: rejectData.reason || "Order cancelled by administrator",
  });

  const currentEventLogs = orderEventLogsConverter(existingOrder.eventLogs);
  const updatedEventLogs = [
    ...currentEventLogs,
    {
      status: OrderStatus.REJECTED,
      timestamp: new Date(),
      ...(rejectData.reason ? { note: rejectData.reason } : {}),
    },
  ];

  const updatedOrder = await prisma.order.update({
    where: { id: orderId },
    data: {
      status: OrderStatus.REJECTED,
      extraData: updatedExtraData as unknown as Prisma.InputJsonValue,
      eventLogs: updatedEventLogs as unknown as Prisma.InputJsonValue,
    } as unknown as Prisma.OrderUpdateInput,
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

  if (existingOrder.couponId) {
    await prisma.coupon.update({
      where: { id: existingOrder.couponId },
      data: {
        usageCount: { decrement: 1 },
      },
    });
  }

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

    if (order.couponId && order.status !== OrderStatus.REJECTED) {
      await tx.coupon.update({
        where: { id: order.couponId },
        data: {
          usageCount: { decrement: 1 },
        },
      });
    }

    await tx.order.delete({ where: { id: orderId } });

    return { success: true, message: "Order deleted successfully" };
  });
