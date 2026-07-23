import { PricePerQuantityType, UnitGroupType } from "@/types/dto/productDto";

export type UnitOptions = {
  baseUnit: string;
  selectedUnit: string;
  unitGroups: UnitGroupType[];
};

export function calculatePrice(
  quantity: number,
  tiers: PricePerQuantityType[],
  unitOptions: UnitOptions,
): { price: number; profit: number; chosenTier?: PricePerQuantityType } {
  if (tiers.length === 0) return { price: 0, profit: 0 };

  const { baseUnit, selectedUnit, unitGroups } = unitOptions;

  // Resolve multiplier for the selected unit (1 if same as base or not found)
  let multiplier = 1;
  if (selectedUnit !== baseUnit) {
    const match = unitGroups.find((g) => g.unit === selectedUnit);
    if (match) multiplier = match.multiplier;
  }

  // Filter tiers that directly target the selected unit
  const unitTiers = tiers.filter((t) => t.unit === selectedUnit);

  // Choose tier pool and effective quantity:
  //    - unit tiers exist -> match within them using raw quantity
  //    - no unit tiers   -> match across all tiers using quantity × multiplier
  let tierPool = unitTiers;
  let effectiveQuantity = quantity;

  // if no tires for selected unit use the tires with base unit
  if (tierPool.length == 0) {
    tierPool = tiers.filter((t) => t.unit === baseUnit);
    effectiveQuantity = quantity * multiplier;
  }

  // sort tier pool by quantity ascending
  const sorted = tierPool.sort((a, b) => a.quantity - b.quantity);

  // find the tier with the largest quantity <= effectiveQuantity
  let chosen = sorted[0];

  for (const tier of sorted) {
    if (tier.quantity <= effectiveQuantity) {
      chosen = tier;
    } else {
      break;
    }
  }

  const unitPrice = chosen.price / chosen.quantity;
  const totalPrice = Number((effectiveQuantity * unitPrice).toFixed(2));
  const totalProfit = Number(
    ((chosen.profitMargin / 100) * effectiveQuantity).toFixed(2),
  );
  return { price: totalPrice, profit: totalProfit, chosenTier: chosen };
}

export function calculateProfit(
  sellingPrice: number | undefined,
  buyingPrice: number | undefined,
): number {
  if (!sellingPrice || !buyingPrice || sellingPrice === 0 || buyingPrice === 0)
    return 0;
  return Number(
    ((buyingPrice - sellingPrice) * (100 / sellingPrice)).toFixed(2),
  );
}

export function calculateRate(
  price1: number | undefined,
  price2: number | undefined,
): number {
  if (!price2 || !price1 || price2 === 0 || price1 === 0) return 0;
  return Number(((price1 - price2) * (100 / price2)).toFixed(2));
}
