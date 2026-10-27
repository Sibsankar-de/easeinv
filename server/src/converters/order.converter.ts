import { parseJson, parseJsonArray } from "../utils/jsonConverter";
import {
  orderExtraDataSchema,
  OrderExtraData,
  orderEventLogsSchema,
  OrderEventLog,
} from "../schemas/order.schema";

export type ParsedOrderExtraData = OrderExtraData;
export type ParsedOrderEventLog = OrderEventLog;

export const orderExtraDataConverter = (raw: unknown): ParsedOrderExtraData =>
  parseJson(orderExtraDataSchema, raw);

export const orderEventLogsConverter = (raw: unknown): ParsedOrderEventLog[] =>
  parseJsonArray(orderEventLogsSchema, raw);

export const orderEventLogConverter = orderEventLogsConverter;
