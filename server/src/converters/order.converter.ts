export interface ParsedOrderExtraData {
  delivery_reference?: string;
  note?: string;
  rejection_reason?: string;
  [key: string]: unknown;
}

export const orderExtraDataConverter = (raw: unknown): ParsedOrderExtraData => {
  if (!raw || typeof raw !== "object") {
    return {};
  }
  const data = raw as Record<string, unknown>;
  return {
    delivery_reference:
      typeof data.delivery_reference === "string"
        ? data.delivery_reference
        : typeof data.deliveryReference === "string"
          ? data.deliveryReference
          : undefined,
    note: typeof data.note === "string" ? data.note : undefined,
    rejection_reason:
      typeof data.rejection_reason === "string"
        ? data.rejection_reason
        : typeof data.rejectionReason === "string"
          ? data.rejectionReason
          : undefined,
    ...data,
  };
};
