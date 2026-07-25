import { Product, StoreSettings } from "@prisma/client";
import { PricePerQuantityType } from "../types/productTypes";
import { InvoiceCreateDto } from "../schemas/invoice.schema";

export interface CalculatedInvoiceItem {
  productId: string;
  netQuantity: number;
  pricePerQuantity?: PricePerQuantityType;
  totalPrice: number;
  totalProfit: number;
  stockUnit: string;
}

export interface CalculatedInvoice {
  subTotal: number;
  discountAmount: number;
  discountPercent: number;
  taxAmount: number;
  taxRate: number;
  total: number;
  paidAmount: number;
  dueAmount: number;
  totalProfit: number;
  roundupTotal: boolean;
  billItems: CalculatedInvoiceItem[];
}

export function calculateInvoiceDetails(
  input: InvoiceCreateDto,
  products: Product[],
  storeSettings: StoreSettings,
): CalculatedInvoice {
  const calculatedItems: CalculatedInvoiceItem[] = [];

  for (const item of input.billItems) {
    const product = products.find((p) => p.id === item.productId);
    if (!product) {
      throw new Error(`Product not found: ${item.productId}`);
    }

    const totalPrice = item.totalPrice;
    const totalProfit = Number(
      (totalPrice - product.buyingPricePerQuantity * item.netQuantity).toFixed(
        2,
      ),
    );

    calculatedItems.push({
      productId: item.productId,
      netQuantity: item.netQuantity,
      pricePerQuantity: item.pricePerQuantity,
      totalPrice,
      totalProfit,
      stockUnit: item.stockUnit,
    });
  }

  const subTotal = Number(
    calculatedItems.reduce((sum, item) => sum + item.totalPrice, 0).toFixed(2),
  );
  const subTotalProfit = Number(
    calculatedItems.reduce((sum, item) => sum + item.totalProfit, 0).toFixed(2),
  );

  const discountPercent = input.discountPercent ?? 0;
  const discountAmount = Number(
    ((discountPercent * subTotal) / 100).toFixed(2),
  );

  const taxRate =
    input.taxRate !== undefined
      ? input.taxRate
      : (storeSettings.defaultTaxRate ?? 0);
  // Calculate tax on subtotal after discount
  const taxAmount = Number(
    ((taxRate * (subTotal - discountAmount)) / 100).toFixed(2),
  );

  let total = Number((subTotal - discountAmount + taxAmount).toFixed(2));

  const roundupTotal =
    input.roundupTotal !== undefined
      ? input.roundupTotal
      : (storeSettings.roundupInvoiceTotal ?? false);
  if (roundupTotal) {
    total = Math.round(total);
  }

  const paidAmount = input.paidAmount !== undefined ? input.paidAmount : total;
  const dueAmount = Number(Math.max(0, total - paidAmount).toFixed(2));
  const totalProfit = Number((subTotalProfit - discountAmount).toFixed(2));

  return {
    subTotal,
    discountAmount,
    discountPercent,
    taxAmount,
    taxRate,
    total,
    paidAmount,
    dueAmount,
    totalProfit,
    roundupTotal,
    billItems: calculatedItems,
  };
}
