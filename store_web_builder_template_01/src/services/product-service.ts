import { cache } from "react";
import type { ProductDTO, ProductCategoryDTO, ProductListResponseDTO } from "@/types";
import { MOCK_PRODUCTS, MOCK_CATEGORIES } from "@/data/mock/mock-products";

/**
 * Server-side products service.
 * All API interactions are kept strictly on the server to keep API secrets, backend routing,
 * and rate limits private from client bundles.
 */
export const getProducts = cache(
  async (options?: {
    categorySlug?: string;
    featuredOnly?: boolean;
    sort?: "price-asc" | "price-desc" | "rating" | "latest";
    search?: string;
  }): Promise<ProductListResponseDTO> => {
    let items = [...MOCK_PRODUCTS];

    if (options?.featuredOnly) {
      items = items.filter((p) => p.isFeatured);
    }

    if (options?.categorySlug) {
      items = items.filter((p) =>
        p.categories.some((c) => c.slug === options.categorySlug)
      );
    }

    if (options?.search) {
      const q = options.search.toLowerCase();
      items = items.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q) ||
          p.tags.some((t) => t.toLowerCase().includes(q))
      );
    }

    if (options?.sort) {
      switch (options.sort) {
        case "price-asc":
          items.sort((a, b) => a.price - b.price);
          break;
        case "price-desc":
          items.sort((a, b) => b.price - a.price);
          break;
        case "rating":
          items.sort((a, b) => (b.averageRating ?? 0) - (a.averageRating ?? 0));
          break;
        case "latest":
          items.sort(
            (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );
          break;
      }
    }

    return Promise.resolve({
      items,
      total: items.length,
      page: 1,
      pageSize: 20,
      totalPages: 1,
    });
  }
);

export const getProductBySlug = cache(
  async (slug: string): Promise<ProductDTO | null> => {
    const product = MOCK_PRODUCTS.find((p) => p.slug === slug) ?? null;
    return Promise.resolve(product);
  }
);

export const getRelatedProducts = cache(
  async (productId: string, limit = 3): Promise<ProductDTO[]> => {
    const current = MOCK_PRODUCTS.find((p) => p.id === productId);
    if (!current) return Promise.resolve(MOCK_PRODUCTS.slice(0, limit));

    const categoryId = current.categories[0]?.id;
    const related = MOCK_PRODUCTS.filter(
      (p) => p.id !== productId && p.categories.some((c) => c.id === categoryId)
    );

    if (related.length < limit) {
      const fallback = MOCK_PRODUCTS.filter(
        (p) => p.id !== productId && !related.some((r) => r.id === p.id)
      );
      return Promise.resolve([...related, ...fallback].slice(0, limit));
    }

    return Promise.resolve(related.slice(0, limit));
  }
);

export const getCategories = cache(async (): Promise<ProductCategoryDTO[]> => {
  return Promise.resolve(MOCK_CATEGORIES);
});

export const getCategoryBySlug = cache(
  async (slug: string): Promise<ProductCategoryDTO | null> => {
    const category = MOCK_CATEGORIES.find((c) => c.slug === slug) ?? null;
    return Promise.resolve(category);
  }
);
