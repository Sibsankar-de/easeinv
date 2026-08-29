import { Order, Customer, Invoice, Coupon } from "@prisma/client";
import {
  CustomerSummaryResponseDto,
  toCustomerSummaryDto,
} from "./customer.dto";
import {
  InvoiceResponseDto,
  toInvoiceDto,
  InvoiceWithRelations,
} from "./invoice.dto";
import {
  orderExtraDataConverter,
  ParsedOrderExtraData,
} from "../converters/order.converter";

export interface OrderCouponSummaryDto {
  id: string;
  code: string;
  name: string;
  discountType: string;
  discountValue: number;
}

export interface OrderResponseDto {
  id: string;
  storeId: string;
  customerId: string;
  customer?: CustomerSummaryResponseDto;
  invoiceId: string;
  invoice?: InvoiceResponseDto;
  couponId?: string | null;
  coupon?: OrderCouponSummaryDto | null;
  status: string;
  orderNumber: string;
  subtotal: number;
  taxAmount: number;
  discountAmount: number;
  shippingAmount: number;
  totalAmount: number;
  orderDate: Date;
  extraData: ParsedOrderExtraData;
  createdAt: Date;
  updatedAt: Date;
}

export interface OrderSummaryResponseDto {
  id: string;
  storeId: string;
  orderNumber: string;
  customerId: string;
  customer?: CustomerSummaryResponseDto;
  invoiceId: string;
  status: string;
  subtotal: number;
  taxAmount: number;
  discountAmount: number;
  shippingAmount: number;
  totalAmount: number;
  orderDate: Date;
  extraData: ParsedOrderExtraData;
  createdAt: Date;
  updatedAt: Date;
}

export type OrderWithAllRelations = Order & {
  customer?: Customer | null;
  invoice?: (Invoice & Partial<InvoiceWithRelations>) | null;
  coupon?: Coupon | null;
};

export const toOrderDto = (order: OrderWithAllRelations): OrderResponseDto => {
  return {
    id: order.id,
    storeId: order.storeId,
    customerId: order.customerId,
    customer: order.customer ? toCustomerSummaryDto(order.customer) : undefined,
    invoiceId: order.invoiceId,
    invoice: order.invoice
      ? toInvoiceDto(order.invoice as InvoiceWithRelations)
      : undefined,
    couponId: order.couponId,
    coupon: order.coupon
      ? {
          id: order.coupon.id,
          code: order.coupon.code,
          name: order.coupon.name,
          discountType: order.coupon.discountType,
          discountValue: order.coupon.discountValue,
        }
      : null,
    status: order.status,
    orderNumber: order.orderNumber,
    subtotal: order.subtotal,
    taxAmount: order.taxAmount,
    discountAmount: order.discountAmount,
    shippingAmount: order.shippingAmount,
    totalAmount: order.totalAmount,
    orderDate: order.orderDate,
    extraData: orderExtraDataConverter(order.extraData),
    createdAt: order.createdAt,
    updatedAt: order.updatedAt,
  };
};

export const toOrderSummaryDto = (
  order: Order & { customer?: Customer | null },
): OrderSummaryResponseDto => {
  return {
    id: order.id,
    storeId: order.storeId,
    orderNumber: order.orderNumber,
    customerId: order.customerId,
    customer: order.customer ? toCustomerSummaryDto(order.customer) : undefined,
    invoiceId: order.invoiceId,
    status: order.status,
    subtotal: order.subtotal,
    taxAmount: order.taxAmount,
    discountAmount: order.discountAmount,
    shippingAmount: order.shippingAmount,
    totalAmount: order.totalAmount,
    orderDate: order.orderDate,
    extraData: orderExtraDataConverter(order.extraData),
    createdAt: order.createdAt,
    updatedAt: order.updatedAt,
  };
};
