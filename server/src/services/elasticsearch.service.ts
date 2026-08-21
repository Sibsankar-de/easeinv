import { getElasticsearchClient } from "../lib/elasticsearch";
import { env } from "../configs/env";
import { createModuleLogger } from "../utils/logger";
import { prisma } from "../lib/prisma";
import {
  ProductSummaryResponseDto,
  toProductSummaryDto,
} from "../dto/product.dto";
import {
  CustomerSummaryResponseDto,
  toCustomerSummaryDto,
} from "../dto/customer.dto";
import { paginate, PaginatedResult } from "../utils/paginate";
import { Customer } from "@prisma/client";

const log = createModuleLogger(import.meta.url);

type CustomerWithInvoices = Customer & {
  invoices?: Array<{ id: string; dueAmount: number }>;
};

export async function searchProductsInElasticsearch(
  storeId: string,
  query: string,
  limit = 10,
): Promise<ProductSummaryResponseDto[]> {
  try {
    const es = getElasticsearchClient();
    const response = await es.search({
      index: env.ELASTICSEARCH_PRODUCTS_INDEX,
      size: limit,
      _source: false,
      query: {
        bool: {
          filter: [{ term: { storeId } }],
          should: [
            { term: { sku: { value: query, boost: 4 } } },
            { term: { gtin: { value: query, boost: 4 } } },
            { prefix: { sku: { value: query, boost: 2 } } },
            { prefix: { gtin: { value: query, boost: 2 } } },
            { fuzzy: { sku: { value: query, fuzziness: "AUTO" } } },
            {
              match: {
                name: {
                  query,
                  fuzziness: "AUTO",
                  boost: 3,
                },
              },
            },
            {
              match_phrase_prefix: {
                name: {
                  query,
                  boost: 2.5,
                },
              },
            },
            {
              match: {
                description: {
                  query,
                  fuzziness: "AUTO",
                  boost: 1,
                },
              },
            },
          ],
          minimum_should_match: 1,
        },
      },
    });

    const hitIds: string[] = response.hits.hits.flatMap((hit) =>
      hit._id ? [hit._id] : [],
    );

    if (hitIds.length === 0) {
      return [];
    }

    const products = await prisma.product.findMany({
      where: {
        id: { in: hitIds },
        storeId,
      },
      include: {
        categories: {
          include: { category: true },
        },
      },
    });

    const productMap = new Map(products.map((p) => [p.id, p]));
    const result: ProductSummaryResponseDto[] = [];

    for (const id of hitIds) {
      const product = productMap.get(id);
      if (product) {
        result.push(toProductSummaryDto(product));
      }
    }

    return result;
  } catch (err) {
    log.warn(
      `[ES Search] Product search failed, falling back to Prisma: ${err}`,
    );
    return fallbackSearchProducts(storeId, query, limit);
  }
}

async function fallbackSearchProducts(
  storeId: string,
  query: string,
  limit: number,
): Promise<ProductSummaryResponseDto[]> {
  const term = decodeURIComponent(query);
  const results = await prisma.product.findMany({
    where: {
      storeId,
      OR: [
        { name: { contains: term, mode: "insensitive" } },
        { sku: { contains: term, mode: "insensitive" } },
        { gtin: { contains: term, mode: "insensitive" } },
      ],
    },
    take: limit,
    include: {
      categories: {
        include: { category: true },
      },
    },
  });
  return results.map(toProductSummaryDto);
}

export async function searchCustomersInElasticsearch(
  storeId: string,
  query: string,
  page = 1,
  limit = 10,
): Promise<PaginatedResult<CustomerSummaryResponseDto>> {
  const from = (page - 1) * limit;
  try {
    const es = getElasticsearchClient();
    const response = await es.search({
      index: env.ELASTICSEARCH_CUSTOMERS_INDEX,
      from,
      size: limit,
      _source: false,
      query: {
        bool: {
          filter: [{ term: { storeId } }],
          should: [
            { term: { phoneNumber: { value: query, boost: 4 } } },
            { term: { email: { value: query, boost: 4 } } },
            { prefix: { phoneNumber: { value: query, boost: 2 } } },
            { prefix: { email: { value: query, boost: 2 } } },
            {
              match: {
                name: {
                  query,
                  fuzziness: "AUTO",
                  boost: 3,
                },
              },
            },
            {
              match_phrase_prefix: {
                name: {
                  query,
                  boost: 2.5,
                },
              },
            },
            {
              match: {
                address: {
                  query,
                  fuzziness: "AUTO",
                  boost: 1,
                },
              },
            },
          ],
          minimum_should_match: 1,
        },
      },
    });

    const total =
      typeof response.hits.total === "number"
        ? response.hits.total
        : (response.hits.total?.value ?? 0);

    const totalPages = Math.ceil(total / limit);
    const hitIds: string[] = response.hits.hits.flatMap((hit) =>
      hit._id ? [hit._id] : [],
    );

    if (hitIds.length === 0) {
      return {
        docs: [],
        totalDocs: total,
        page,
        limit,
        totalPages,
        hasPrevPage: page > 1,
        hasNextPage: page < totalPages,
      };
    }

    const customers: CustomerWithInvoices[] = await prisma.customer.findMany({
      where: {
        id: { in: hitIds },
        storeId,
      },
      include: {
        invoices: {
          select: { id: true, dueAmount: true },
        },
      },
    });

    const customerMap = new Map(customers.map((c) => [c.id, c]));
    const docs: CustomerSummaryResponseDto[] = [];

    for (const id of hitIds) {
      const customer = customerMap.get(id);
      if (customer) {
        const invoices = customer.invoices ?? [];
        const dueCount = invoices.filter(
          (inv: { id: string; dueAmount: number }) => inv.dueAmount > 0,
        ).length;
        docs.push(toCustomerSummaryDto(customer, invoices.length, dueCount));
      }
    }

    return {
      docs,
      totalDocs: total,
      page,
      limit,
      totalPages,
      hasPrevPage: page > 1,
      hasNextPage: page < totalPages,
    };
  } catch (err) {
    log.warn(
      `[ES Search] Customer search failed, falling back to Prisma: ${err}`,
    );
    return fallbackSearchCustomers(storeId, query, page, limit);
  }
}

async function fallbackSearchCustomers(
  storeId: string,
  query: string,
  page: number,
  limit: number,
): Promise<PaginatedResult<CustomerSummaryResponseDto>> {
  const term = decodeURIComponent(query);
  const result = await paginate<CustomerWithInvoices>(
    prisma.customer,
    {
      storeId,
      OR: [
        { name: { contains: term, mode: "insensitive" } },
        { phoneNumber: { contains: term, mode: "insensitive" } },
      ],
    },
    { name: "asc" },
    { page, limit },
    {
      invoices: {
        select: { id: true, dueAmount: true },
      },
    },
  );

  const docs = result.docs.map((c) => {
    const invoices = c.invoices ?? [];
    const dueCount = invoices.filter(
      (inv: { id: string; dueAmount: number }) => inv.dueAmount > 0,
    ).length;
    return toCustomerSummaryDto(c, invoices.length, dueCount);
  });

  return { ...result, docs };
}
