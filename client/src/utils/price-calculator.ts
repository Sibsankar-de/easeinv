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

  // Filter tiers that directly target the selected unit
  const unitTiers = tiers.filter((t) => t.unit === selectedUnit);

  if (unitTiers.length > 0) {
    const sorted = [...unitTiers].sort((a, b) => a.quantity - b.quantity);
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
      ((chosen.profitMargin / 100) * quantity).toFixed(2),
    );
    return { price: totalPrice, profit: totalProfit, chosenTier: chosen };
  }

  // If no tiers for selected unit, calculate for base unit
  let selectedMultiplier = 1;
  if (selectedUnit !== baseUnit) {
    const match = unitGroups.find((g) => g.unit === selectedUnit);
    if (match) selectedMultiplier = match.multiplier;
  }

  const effectiveQuantity = quantity * selectedMultiplier;
  const baseTiers = tiers.filter((t) => t.unit === baseUnit);

  let chosen: PricePerQuantityType;
  let unitPrice: number;

  if (baseTiers.length > 0) {
    // Case 1: Tier with base unit exists
    const sorted = [...baseTiers].sort((a, b) => a.quantity - b.quantity);
    chosen = sorted[0];

    for (const tier of sorted) {
      if (tier.quantity <= effectiveQuantity) {
        chosen = tier;
      } else {
        break;
      }
    }

    unitPrice = chosen.price / chosen.quantity;
  } else {
    // Case 2: Tier with base unit not found -> take first tier with different unit and use its multiplier
    chosen = tiers[0];
    const match = unitGroups.find((g) => g.unit === chosen.unit);
    const tierMultiplier = match ? match.multiplier : 1;
    unitPrice = chosen.price / (chosen.quantity * tierMultiplier);
  }

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
