import { z } from "zod";
import { pricePerQuantityItemSchema } from "./product.schema";
import { OrderStatus } from "../enums/order.enum";
import { shippingAddressSchema } from "./shipping.schema";

export const orderBillItemSchema = z.object({
  productId: z.uuid("Product ID must be a valid UUID"),
  netQuantity: z.number().positive("Net quantity must be greater than zero"),
  stockUnit: z.string().min(1, "Stock unit is required").optional(),
  pricePerQuantity: pricePerQuantityItemSchema.optional(),
});

export const orderInvoiceDataSchema = z.object({
  invoiceNumber: z.string().trim().optional(),
  issueDate: z
    .string()
    .or(z.date())
    .optional()
    .transform((val) => (val ? new Date(val) : new Date())),
  paidAmount: z.number().min(0, "Paid amount must be non-negative").optional(),
  discountPercent: z.number().min(0).optional().default(0),
  taxRate: z.number().min(0).optional(),
  roundupTotal: z.boolean().optional().default(false),
  note: z.string().optional(),
  billItems: z
    .array(orderBillItemSchema)
    .min(1, "At least one bill item is required"),
});

export const orderCreateSchema = z.object({
  customerId: z.uuid("Valid customer ID is required"),
  shippingAddress: shippingAddressSchema,
  invoiceData: orderInvoiceDataSchema,
  couponCode: z.string().trim().optional().nullable(),
  note: z.string().trim().optional(),
  extraData: z.record(z.string(), z.unknown()).optional().default({}),
});

export const updateOrderStatusSchema = z
  .object({
    status: z.enum(OrderStatus),
    deliveryReference: z.string().trim().optional(),
    note: z.string().trim().optional(),
    reason: z.string().trim().optional(),
  })
  .refine(
    (data) => {
      if (data.status === OrderStatus.DISPATCHED && !data.deliveryReference) {
        return false;
      }
      return true;
    },
    {
      message: "Delivery reference is required when dispatching an order",
      path: ["deliveryReference"],
    },
  );

export const orderQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(10),
  status: z.enum(OrderStatus).optional(),
  customerId: z.uuid().optional(),
  query: z.string().optional().default(""),
  sortBy: z.string().default("createdAt"),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
});

export const orderExtraDataSchema = z
  .object({
    delivery_reference: z.string().optional().default(""),
    note: z.string().optional().default(""),
    rejection_reason: z.string().optional().default(""),
    shipping_calculation: z.record(z.string(), z.unknown()).optional(),
  })
  .loose();

export const orderEventLogSchema = z
  .object({
    status: z.enum(OrderStatus),
    timestamp: z.coerce.date(),
    note: z.string().optional(),
  })
  .loose();

export const orderEventLogsSchema = z.array(orderEventLogSchema).default([]);

export type OrderBillItemDto = z.infer<typeof orderBillItemSchema>;
export type OrderInvoiceDataDto = z.infer<typeof orderInvoiceDataSchema>;
export type OrderCreateDto = z.infer<typeof orderCreateSchema>;
export type UpdateOrderStatusDto = z.infer<typeof updateOrderStatusSchema>;
export type OrderQueryDto = z.infer<typeof orderQuerySchema>;
export type OrderExtraData = z.infer<typeof orderExtraDataSchema>;
export type OrderEventLog = z.infer<typeof orderEventLogSchema>;
export type OrderEventLogDto = OrderEventLog;
export type OrderEventLogs = z.infer<typeof orderEventLogsSchema>;
