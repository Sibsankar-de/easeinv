import {
  Invoice,
  InvoiceItem,
  Product,
  Customer,
  InvoiceSummary,
} from "@prisma/client";
import {
  CustomerSummaryResponseDto,
  toCustomerSummaryDto,
} from "./customer.dto";
import { invoiceExtraDataConverter } from "../converters/invoice.converter";

export type InvoiceItemWithProduct = InvoiceItem & {
  product?: Pick<
    Product,
    "id" | "name" | "sku" | "stockUnit" | "unitGroups" | "pricePerQuantity"
  > | null;
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
    stockUnit?: string;
    unitGroups?: any;
    pricePerQuantity?: any;
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
  customer?: CustomerSummaryResponseDto;
  purpose: string;
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
  paymentStatus: string;
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
          stockUnit: item.product.stockUnit,
          unitGroups: item.product.unitGroups as any,
          pricePerQuantity: item.product.pricePerQuantity as any,
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

const getInvoiceCustomer = (
  customerRelation?: Customer | null,
  rawExtraData?: any,
): CustomerSummaryResponseDto | undefined => {
  if (customerRelation) {
    return toCustomerSummaryDto(customerRelation);
  }
  if (rawExtraData) {
    const extraData = invoiceExtraDataConverter(rawExtraData);
    if (extraData.customer && extraData.customer.name) {
      return {
        id: "",
        name: extraData.customer.name,
        phoneNumber: extraData.customer.phoneNumber,
        address: extraData.customer.address,
        email: "",
        totalDue: 0,
        totalInvoices: 0,
        dueCount: 0,
      };
    }
  }
  return undefined;
};

export const toInvoiceDto = (
  invoice: InvoiceWithRelations,
): InvoiceResponseDto => {
  return {
    id: invoice.id,
    storeId: invoice.storeId,
    customerId: invoice.customerId || undefined,
    customer: getInvoiceCustomer(invoice.customer, invoice.extraData),
    purpose: invoice.purpose,
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
    paymentStatus: invoice.paymentStatus,
    createdAt: invoice.createdAt,
    updatedAt: invoice.updatedAt,
  };
};

export interface InvoiceSummaryResponseDto {
  id: string;
  invoiceNumber: string;
  customer?: CustomerSummaryResponseDto;
  purpose: string;
  issueDate: Date;
  subTotal: number;
  total: number;
  dueAmount: number;
  paidAmount: number;
  status: string;
  paymentStatus: string;
}

export const toInvoiceSummaryDto = (
  invoice: any,
): InvoiceSummaryResponseDto => {
  return {
    id: invoice.id,
    invoiceNumber: invoice.invoiceNumber,
    customer: getInvoiceCustomer(invoice.customer, invoice.extraData),
    purpose: invoice.purpose,
    issueDate: invoice.issueDate,
    subTotal: invoice.subTotal,
    total: invoice.total,
    dueAmount: invoice.dueAmount,
    paidAmount: invoice.paidAmount,
    status: invoice.status,
    paymentStatus: invoice.paymentStatus,
  };
};

export interface InvoiceCalculationSummaryDto {
  totalInvoices: number;
  totalRevenue: number;
  totalPaid: number;
  totalDue: number;
  totalProfit: number;
  totalProductsSold: number;
  totalCustomers: number;
  paidCount: number;
  partialCount: number;
  unpaidCount: number;
}

export const toInvoiceCalculationSummaryDto = (
  summary: InvoiceSummary,
): InvoiceCalculationSummaryDto => ({
  totalInvoices: summary.invoiceCount,
  totalRevenue: summary.totalRevenue,
  totalPaid: summary.totalPaid,
  totalDue: summary.totalDue,
  totalProfit: summary.totalProfit,
  totalProductsSold: summary.totalProductsSold,
  totalCustomers: summary.totalCustomers,
  paidCount: summary.paidInvoices,
  partialCount: summary.partialInvoices,
  unpaidCount: summary.unpaidInvoices,
});
