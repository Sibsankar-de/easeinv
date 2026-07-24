import { z } from "zod";
import { pricePerQuantityItemSchema } from "./product.schema";
import { invoiceStatusList } from "../enums/invoice.enum";
import { InvoiceStatus } from "@prisma/client";

const billItemSchema = z.object({
  productId: z.uuid("Product id is required."),
  netQuantity: z.number().min(0, "Net quantity must be non-negative"),
  totalPrice: z.number().min(0, "Total price must be non-negative"),
  stockUnit: z.string(),
  pricePerQuantity: pricePerQuantityItemSchema.optional(),
});

const customerDetailsSchema = z.object({
  id: z.string().optional(),
  name: z.string().trim().min(1, "Customer name is required"),
  phoneNumber: z.string().trim().optional().nullable(),
  address: z.string().trim().optional().nullable(),
  email: z.email().optional().nullable(),
});

export const createInvoiceSchema = z.object({
  invoiceNumber: z.string().trim().min(1, "Invoice number is required"),
  issueDate: z
    .string()
    .or(z.date())
    .transform((val) => new Date(val)),
  paidAmount: z.number().min(0, "Paid amount must be non-negative"),
  discountPercent: z.number().optional(),
  taxRate: z.number().optional().default(0),
  roundupTotal: z.boolean().optional().default(false),
  note: z.string().optional(),
  status: z.enum(invoiceStatusList).optional().default(InvoiceStatus.DRAFTED),
  billItems: z
    .array(billItemSchema)
    .min(1, "At least one bill item is required"),
  customer: customerDetailsSchema,
});

export const updateInvoiceDueSchema = z.object({
  paidAmount: z.number().gt(0, "Paid amount must be greater than zero"),
});

export type BillItemCreateDto = z.infer<typeof billItemSchema>;
export type InvoiceCustomerDto = z.infer<typeof customerDetailsSchema>;
export type InvoiceCreateDto = z.infer<typeof createInvoiceSchema>;
export type InvoiceUpdateDueDto = z.infer<typeof updateInvoiceDueSchema>;
