import { InvoiceDto } from "./invoiceDto";

export enum OrderStatus {
  PENDING = "PENDING",
  PROCESSING = "PROCESSING",
  DISPATCHED = "DISPATCHED",
  COMPLETED = "COMPLETED",
  REJECTED = "REJECTED",
}

export interface OrderCustomerDto {
  id: string;
  name: string;
  phoneNumber?: string | null;
  email?: string | null;
  address?: string | null;
}

export interface OrderCouponDto {
  id: string;
  code: string;
  discountType: "PERCENT" | "FIXED";
  discountValue: number;
}

export interface OrderAddressDto {
  id?: string;
  orderId?: string;
  addressLine: string;
  city?: string;
  state?: string;
  pincode?: string;
  country: string;
  createdAt?: string | Date;
  updatedAt?: string | Date;
}

export interface OrderExtraDataDto {
  delivery_reference?: string;
  note?: string;
  rejection_reason?: string;
  shipping_address?: OrderAddressDto;
  [key: string]: unknown;
}

export interface OrderDto {
  id: string;
  storeId: string;
  customerId: string;
  invoiceId: string;
  couponId?: string | null;
  status: OrderStatus;
  orderNumber: string;
  subtotal: number;
  taxAmount: number;
  discountAmount: number;
  shippingAmount: number;
  totalAmount: number;
  orderDate: string | Date;
  extraData?: OrderExtraDataDto;
  customer?: OrderCustomerDto | null;
  coupon?: OrderCouponDto | null;
  invoice?: InvoiceDto | null;
  address?: OrderAddressDto | null;
  createdAt: string | Date;
  updatedAt: string | Date;
}

export interface OrderSummaryDto {
  id: string;
  orderNumber: string;
  customerId: string;
  customer?: {
    id: string;
    name: string;
    phoneNumber?: string | null;
    email?: string | null;
  } | null;
  status: OrderStatus;
  subtotal: number;
  discountAmount: number;
  taxAmount: number;
  shippingAmount: number;
  totalAmount: number;
  orderDate: string | Date;
  createdAt: string | Date;
}

export interface UpdateOrderStatusDto {
  status: OrderStatus;
  deliveryReference?: string;
  note?: string;
  reason?: string;
}
