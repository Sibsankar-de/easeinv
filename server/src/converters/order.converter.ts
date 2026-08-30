import { parseJson } from "../utils/jsonConverter";
import { orderExtraDataSchema, OrderExtraData } from "../schemas/order.schema";

export type ParsedOrderExtraData = OrderExtraData;

export const orderExtraDataConverter = (raw: unknown): ParsedOrderExtraData =>
  parseJson(orderExtraDataSchema, raw);
