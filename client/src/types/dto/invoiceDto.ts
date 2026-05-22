import { CustomerDto } from "./customerDto";

export type BillItemType = {
  id: string;
  product: {
    id: string;
    name: string;
    sku: string;
  };
  netQuantity: number;
  totalPrice: number;
  stockUnit: string;
  totalProfit: number;
};

export interface CreateInvoiceDto {
  storeId?: string;
  customerId?: string;
  customerDetails?: CustomerDto;
  invoiceNumber: string;
  issueDate: Date;
  billItems: BillItemType[];
  subTotal: number;
  total: number;
  totalProfit: number;
  discountAmount?: number;
  taxAmount?: number;
  taxRate?: number;
  dueAmount: number;
  paidAmount: number;
  roundupTotal?: boolean;
  status?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface InvoiceDto extends CreateInvoiceDto {
  _id: string;
}
