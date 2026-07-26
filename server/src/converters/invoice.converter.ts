import { parseJson } from "../utils/jsonConverter";
import { invoiceExtraDataSchema } from "../schemas/invoice.schema";

export const invoiceExtraDataConverter = (raw: unknown) =>
  parseJson(invoiceExtraDataSchema, raw);
