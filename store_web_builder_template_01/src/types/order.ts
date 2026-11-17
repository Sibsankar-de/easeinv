export type OrderStatus =
  | "pending"
  | "processing"
  | "shipped"
  | "delivered"
  | "cancelled"
  | "refunded";

export type PaymentStatus =
  | "pending"
  | "authorized"
  | "paid"
  | "failed"
  | "refunded";

export interface CustomerDTO {
  id: string;
  storeId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  notes?: string;
}

export interface AddressDTO {
  street: string;
  apartment?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

export interface OrderItemDTO {
  id: string;
  productId: string;
  variantId?: string;
  productTitle: string;
  sku: string;
  price: number;
  quantity: number;
  total: number;
  imageUrl?: string;
}

export interface InvoiceDTO {
  id: string;
  invoiceNumber: string;
  orderId: string;
  storeId: string;
  subtotal: number;
  taxAmount: number;
  discountAmount: number;
  shippingFee: number;
  grandTotal: number;
  currency: string;
  paymentMethod: string;
  paymentStatus: PaymentStatus;
  issuedAt: string;
  dueAt?: string;
  paidAt?: string;
  pdfUrl?: string;
}

export interface OrderDTO {
  id: string;
  orderNumber: string;
  storeId: string;
  customer: CustomerDTO;
  shippingAddress: AddressDTO;
  billingAddress: AddressDTO;
  items: OrderItemDTO[];
  subtotal: number;
  shippingFee: number;
  taxAmount: number;
  discountAmount: number;
  total: number;
  currency: string;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  invoice?: InvoiceDTO;
  placedAt: string;
  updatedAt: string;
}
