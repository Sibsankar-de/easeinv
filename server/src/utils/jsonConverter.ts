import { z } from "zod";

function isObject(val: unknown): val is Record<string, unknown> {
  return typeof val === "object" && val !== null && !Array.isArray(val);
}

export function parseJson<T>(schema: z.ZodType<T>, raw: unknown): T {
  const input = isObject(raw) ? raw : {};

  const result = schema.safeParse(input);
  if (result.success) return result.data;

  // Fallback: parse an empty object to collect all schema defaults
  const fallback = schema.safeParse({});
  if (fallback.success) return fallback.data;

  throw result.error;
}

export function parseJsonArray<T>(schema: z.ZodType<T>, raw: unknown): T {
  let input = raw;
  if (typeof raw === "string") {
    try {
      input = JSON.parse(raw);
    } catch {
      input = [];
    }
  }

  const arrayInput = Array.isArray(input) ? input : [];

  const result = schema.safeParse(arrayInput);
  if (result.success) return result.data;

  const fallback = schema.safeParse([]);
  if (fallback.success) return fallback.data;

  throw result.error;
}
