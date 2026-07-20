export type PricePerQuantityType = {
  id: number;
  price: number;
  quantity: number;
  profitMargin: number;
};

export type ProductImageType = {
  id: string;
  imageId: string;
  priority: number;
  url: string;
  name: string;
};

/**
 * Represents a unit group for a product.
 * Each group defines an alternate unit that maps to a fixed quantity of the product's base unit.
 *
 * Example: base unit = KG, group → { name: "Packet", unit: "PKT", multiplier: 10 }
 * means 1 PKT = 10 KG.
 */
export type UnitGroupType = {
  /** Local auto-increment key used as React list key and for edit/delete targeting */
  id: number;
  /** Human-readable group name, e.g. "Packet", "Carton" */
  name: string;
  /** Unit key matching unitMap or a custom unit key, e.g. "PKT", "CARTON" */
  unit: string;
  /** How many base units equal 1 of this group unit. Must be > 0. */
  multiplier: number;
};

export type ProductDto = {
  id: string;
  storeId: string;
  name: string;
  sku: string;
  gtin?: string;
  description?: string;
  categories?: string[];
  buyingPricePerQuantity: number;
  totalStock?: number;
  trackInventory?: boolean;
  alertThreshold?: number;
  emailAlert?: boolean;
  stockUnit: string;
  pricePerQuantity: PricePerQuantityType[];
  /** Optional unit groups; each maps an alternate unit to the base unit via a multiplier */
  unitGroups?: UnitGroupType[];
  images?: ProductImageType[];
  imageIds?: string[];
  createdAt?: Date;
  updatedAt?: Date;
};
