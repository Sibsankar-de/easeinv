import type { Order, Customer, Invoice, Coupon, Store } from "@prisma/client";
import type { InvoiceWithItems } from "./invoice.model";

export interface OrderExtraData {
  delivery_reference?: string;
  note?: string;
  rejection_reason?: string;
  [key: string]: unknown;
}

export type OrderWithRelations = Order & {
  customer?: Customer | null;
  invoice?: (Invoice & Partial<InvoiceWithItems>) | null;
  coupon?: Coupon | null;
  store?: Store | null;
};
