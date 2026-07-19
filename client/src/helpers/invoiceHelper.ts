import { BillItemType, CreateInvoiceDto } from "@/types/dto/invoiceDto";

export type InvoiceFormState = {
  storeId?: string;
  status?: string;
  invoiceNumber: string;
  issueDate: string | Date;
  subTotal: number;
  total: number;
  totalProfit?: number;
  discountAmount?: number;
  discountPercent?: number;
  taxAmount?: number;
  taxRate?: number;
  dueAmount: number;
  paidAmount: number;
  roundupTotal?: boolean;
  note?: string;
  billItems?: BillItemType[];
  customer?: {
    id?: string;
    name?: string;
    phoneNumber?: string | null;
    address?: string | null;
    email?: string | null;
  };
};

export const transformInvoicePayload = (
  payload: InvoiceFormState,
): CreateInvoiceDto & { storeId: string; status: string } => {
  const { storeId, status, billItems, customer, ...rest } = payload;

  const transformedItems = (billItems || []).map((item) => ({
    productId: item.product?.id,
    netQuantity: item.netQuantity,
    totalPrice: item.totalPrice,
    stockUnit: item.stockUnit,
    pricePerQuantity: item.pricePerQuantity || undefined,
  }));

  const mappedCustomer = {
    id: customer?.id || undefined,
    name: customer?.name || "",
    phoneNumber: customer?.phoneNumber || null,
    address: customer?.address || null,
    email: customer?.email || null,
  };

  return {
    storeId: storeId ?? "",
    status: status ?? "",
    invoiceNumber: rest.invoiceNumber,
    issueDate: rest.issueDate,
    paidAmount: rest.paidAmount,
    discountPercent: rest.discountPercent || 0,
    taxRate: rest.taxRate || 0,
    roundupTotal: rest.roundupTotal || false,
    note: rest.note || "",
    billItems: transformedItems,
    customer: mappedCustomer,
  };
};
