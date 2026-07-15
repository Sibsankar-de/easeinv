import type { Customer } from "@prisma/client";

export type CustomerWithStats = Customer & {
  totalInvoices: number;
  dueCount: number;
};
