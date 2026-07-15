import type { Invoice, InvoiceItem } from "@prisma/client";

export type InvoiceWithItems = Invoice & {
  billItems: InvoiceItem[];
};

// JSON field shape stored in Invoice.extraData
export interface InvoiceExtraData {
  customer?: {
    name?: string;
    phoneNumber?: string;
    address?: string;
  };
}
