import { parseJson } from "../utils/jsonConverter";
import {
  productExtraDataSchema,
  pricePerQuantityItemSchema,
  unitGroupSchema,
} from "../schemas/product.schema";

export const unitGroupConverter = (raw: unknown) =>
  parseJson(unitGroupSchema, raw);

export const pricePerQuantityConverter = (raw: unknown) =>
  parseJson(pricePerQuantityItemSchema, raw);

export const productExtraDataConverter = (raw: unknown) =>
  parseJson(productExtraDataSchema, raw);
