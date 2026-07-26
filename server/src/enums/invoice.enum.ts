import { InvoiceStatus, InvoicePaymentStatus } from "@prisma/client";

export const invoiceStatusList = Object.values(InvoiceStatus);
export const invoicePaymentStatusList = Object.values(InvoicePaymentStatus);
