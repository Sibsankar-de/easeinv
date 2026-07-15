import { z } from "zod";

const billItemSchema = z.object({
  id: z.number().default(1),
  product: z.object({
    id: z.string().min(1, "Product ID is required"),
    name: z.string().optional(),
    sku: z.string().optional(),
  }),
  pricePerQuantity: z
    .object({
      id: z.number().default(1),
      price: z.number().min(0),
      quantity: z.number().min(0),
      profitMargin: z.number().optional().default(0),
    })
    .optional(),
  netQuantity: z.number().min(0, "Net quantity must be non-negative"),
  totalPrice: z.number().min(0, "Total price must be non-negative"),
  stockUnit: z.string().optional(),
  totalProfit: z.number().optional().default(0),
});

const customerDetailsSchema = z.object({
  id: z.string().optional(),
  name: z.string().trim().min(1, "Customer name is required"),
  phoneNumber: z.string().trim().optional(),
  address: z.string().trim().optional(),
  email: z.string().trim().email().optional(),
});

export const createInvoiceSchema = z.object({
  invoiceNumber: z.string().trim().min(1, "Invoice number is required"),
  issueDate: z
    .string()
    .or(z.date())
    .transform((val) => new Date(val)),
  subTotal: z.number().min(0, "Subtotal must be non-negative"),
  total: z.number().min(0, "Total must be non-negative"),
  paidAmount: z.number().min(0, "Paid amount must be non-negative"),
  dueAmount: z.number().min(0, "Due amount must be non-negative"),
  discountAmount: z.number().optional().default(0),
  taxAmount: z.number().optional().default(0),
  taxRate: z.number().optional().default(0),
  totalProfit: z.number().optional().default(0),
  roundupTotal: z.boolean().optional().default(false),
  note: z.string().optional(),
  status: z.enum(["PRINTED", "DRAFTED"]).optional().default("DRAFTED"),
  billItems: z
    .array(billItemSchema)
    .min(1, "At least one bill item is required"),
  customerDetails: customerDetailsSchema,
});

export const updateInvoiceDueSchema = z.object({
  paidAmount: z.number().gt(0, "Paid amount must be greater than zero"),
});

export type CreateInvoiceDTO = z.infer<typeof createInvoiceSchema>;
export type UpdateInvoiceDueDTO = z.infer<typeof updateInvoiceDueSchema>;
