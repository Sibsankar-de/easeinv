import { cache } from "react";
import type { StoreConfigDTO } from "@/types";
import { MOCK_STORE_CONFIG } from "@/data/mock/mock-store";

/**
 * Server-side store configuration service.
 * In production, this fetches from the private backend API using server environment variables,
 * with Next.js revalidation tags and React request deduplication.
 */
export const getStoreConfig = cache(async (): Promise<StoreConfigDTO> => {
  // Placeholder: When backend API is live:
  // const res = await fetch(`${process.env.INTERNAL_API_URL}/api/v1/store/config`, {
  //   headers: { Authorization: `Bearer ${process.env.STORE_API_KEY}` },
  //   next: { tags: ["store-config"], revalidate: 3600 },
  // });
  // return res.json();

  // Returns mock data with guaranteed DTO parity
  return Promise.resolve(MOCK_STORE_CONFIG);
});
