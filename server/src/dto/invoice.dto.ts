import { Invoice, InvoiceItem, Product, Customer } from "@prisma/client";

export type InvoiceItemWithProduct = InvoiceItem & {
  product?: Pick<Product, "id" | "name" | "sku"> | null;
};

export type InvoiceWithRelations = Invoice & {
  customer?: Customer | null;
  billItems?: InvoiceItemWithProduct[];
};

export interface BillItemDto {
  id: string;
  product?: {
    id: string;
    name: string;
    sku: string;
  };
  productName: string;
  pricePerQuantity?: any;
  netQuantity: number;
  totalPrice: number;
  stockUnit: string;
  totalProfit: number;
}

export interface InvoiceResponseDto {
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
  status: string;
  createdAt: Date;
  updatedAt: Date;
}

export const toBillItemDto = (item: InvoiceItemWithProduct): BillItemDto => {
  return {
    id: item.id,
    product: item.product
      ? {
          id: item.product.id,
          name: item.product.name,
          sku: item.product.sku,
        }
      : undefined,
    productName: item.productName,
    pricePerQuantity: item.pricePerQty ? (item.pricePerQty as any) : undefined,
    netQuantity: item.netQuantity,
    totalPrice: item.totalPrice,
    stockUnit: item.stockUnit,
    totalProfit: item.totalProfit,
  };
};

export const toInvoiceDto = (
  invoice: InvoiceWithRelations,
): InvoiceResponseDto => {
  return {
    id: invoice.id,
    storeId: invoice.storeId,
    customerId: invoice.customerId || undefined,
    customer: invoice.customer
      ? {
          id: invoice.customer.id,
          name: invoice.customer.name,
          phoneNumber: invoice.customer.phoneNumber || undefined,
          address: invoice.customer.address || undefined,
          email: invoice.customer.email || undefined,
        }
      : undefined,
    invoiceNumber: invoice.invoiceNumber,
    issueDate: invoice.issueDate,
    billItems: (invoice.billItems || []).map(toBillItemDto),
    subTotal: invoice.subTotal,
    total: invoice.total,
    totalProfit: invoice.totalProfit,
    discountAmount: invoice.discountAmount,
    discountPercent: invoice.discountPercent,
    taxAmount: invoice.taxAmount,
    taxRate: invoice.taxRate,
    dueAmount: invoice.dueAmount,
    paidAmount: invoice.paidAmount,
    roundupTotal: invoice.roundupTotal,
    note: invoice.note || undefined,
    status: invoice.status,
    createdAt: invoice.createdAt,
    updatedAt: invoice.updatedAt,
  };
};

export const toInvoiceListDto = (
  invoices: InvoiceWithRelations[],
): InvoiceResponseDto[] => {
  return invoices.map(toInvoiceDto);
};

export const toPaginatedInvoicesDto = (paginatedResult: any) => {
  return {
    ...paginatedResult,
    docs: toInvoiceListDto(paginatedResult.docs),
  };
};

export interface InvoiceSummaryResponseDto {
  id: string;
  invoiceNumber: string;
  customer?: {
    id: string;
    name: string;
  };
  issueDate: Date;
  subTotal: number;
  total: number;
  dueAmount: number;
  paidAmount: number;
  status: string;
}

export const toInvoiceSummaryDto = (
  invoice: any,
): InvoiceSummaryResponseDto => {
  return {
    id: invoice.id,
    invoiceNumber: invoice.invoiceNumber,
    customer: {
      id: invoice?.customer.id,
      name: invoice?.customer.name,
    },
    issueDate: invoice.issueDate,
    subTotal: invoice.subTotal,
    total: invoice.total,
    dueAmount: invoice.dueAmount,
    paidAmount: invoice.paidAmount,
    status: invoice.status,
  };
};
