export type BillItemType = {
  id: string; // local row key
  product: {
    id: string;
    name: string;
    sku: string;
  };
  productName?: string;
  pricePerQuantity?: {
    id: number;
    price: number;
    quantity: number;
    profitMargin?: number;
  };
  netQuantity: number;
  totalPrice: number;
  stockUnit: string;
  totalProfit: number;
};

export type BillItemDto = {
  id: string;
  product: {
    id: string;
    name: string;
    sku: string;
  };
  pricePerQuantity?: {
    id: number;
    price: number;
    quantity: number;
    profitMargin?: number;
  };
  netQuantity: number;
  totalPrice: number;
  stockUnit: string;
  totalProfit: number;
};

export enum InvoiceStatus {
  ISSUED = "ISSUED",
  DRAFTED = "DRAFTED",
}

export enum InvoicePurpose {
  BILLING = "BILLING",
  ORDER = "ORDER",
}

export interface CreateInvoiceDto {
  invoiceNumber: string;
  issueDate: string | Date;
  paidAmount: number;
  discountPercent?: number;
  taxRate?: number;
  roundupTotal?: boolean;
  note?: string;
  status?: InvoiceStatus;
  billItems: {
    productId: string;
    netQuantity: number;
    totalPrice: number;
    stockUnit: string;
    pricePerQuantity?: {
      id: number;
      price: number;
      quantity: number;
      profitMargin?: number;
    };
  }[];
  customer: {
    id?: string;
    name: string;
    phoneNumber?: string | null;
    address?: string | null;
    email?: string | null;
  };
}

export interface InvoiceDto {
  id: string;
  storeId: string;
  customerId?: string;
  customer?: {
    id?: string;
    name: string;
    phoneNumber?: string;
    address?: string;
    email?: string;
  };
  purpose?: InvoicePurpose | string;
  invoiceNumber: string;
  issueDate: Date;
  billItems: BillItemDto[];
  subTotal: number;
  total: number;
  totalProfit: number;
  discountAmount?: number;
  discountPercent?: number;
  taxAmount?: number;
  taxRate?: number;
  dueAmount: number;
  paidAmount: number;
  roundupTotal?: boolean;
  note?: string;
  status: InvoiceStatus;
  createdAt: Date;
  updatedAt: Date;
}

export interface InvoiceSummaryDto {
  id: string;
  invoiceNumber: string;
  customer?: {
    id: string;
    name: string;
  };
  purpose?: InvoicePurpose | string;
  issueDate: Date;
  subTotal: number;
  total: number;
  dueAmount: number;
  paidAmount: number;
  status: InvoiceStatus;
}
