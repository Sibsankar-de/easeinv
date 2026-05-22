import { PricePerQuantityType } from "@/types/dto/productDto";

export function calculatePrice(
  quantity: number,
  tiers: PricePerQuantityType[]
): { price: number; profit: number } {
  if (tiers.length === 0) return { price: 0, profit: 0 };

  // sort tiers by quantity ascending
  const sorted = [...tiers].sort((a, b) => a.quantity - b.quantity);

  // find the tier with the largest quantity <= requested quantity
  let chosen = sorted[0];

  for (const tier of sorted) {
    if (tier.quantity <= quantity) {
      chosen = tier;
    } else {
      break;
    }
  }

  const unitPrice = chosen.price / chosen.quantity;
  const totalPrice = Number((quantity * unitPrice).toFixed(2));
  const totalProfit = Number(
    ((chosen.profitMargin / 100) * quantity).toFixed(2)
  );
  return { price: totalPrice, profit: totalProfit };
}

export function calculateProfit(
  sellingPrice: number | undefined,
  buyingPrice: number | undefined
): number {
  if (!sellingPrice || !buyingPrice || sellingPrice === 0 || buyingPrice === 0)
    return 0;
  return Number(
    ((buyingPrice - sellingPrice) * (100 / sellingPrice)).toFixed(2)
  );
}

export function calculateRate(
  price1: number | undefined,
  price2: number | undefined
): number {
  if (!price2 || !price1 || price2 === 0 || price1 === 0) return 0;
  return Number(((price1 - price2) * (100 / price2)).toFixed(2));
}
