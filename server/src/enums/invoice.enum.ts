import {
  InvoiceStatus,
  InvoicePaymentStatus,
  InvoicePurpose,
} from "@prisma/client";

export const invoiceStatusList = Object.values(InvoiceStatus);
export const invoicePaymentStatusList = Object.values(InvoicePaymentStatus);
export const invoicePurposeList = Object.values(InvoicePurpose);
