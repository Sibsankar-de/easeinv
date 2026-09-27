import { prisma } from "../lib/prisma";
import { getElasticsearchClient } from "../lib/elasticsearch";
import { env } from "../configs/env";
import { createModuleLogger } from "../utils/logger";

const log = createModuleLogger(import.meta.url);

export const reindexProducts = async (): Promise<{ indexed: number }> => {
  const es = getElasticsearchClient();

  const products = await prisma.product.findMany();

  for (const product of products) {
    await es.index({
      index: env.ELASTICSEARCH_PRODUCTS_INDEX,
      id: product.id,
      document: {
        id: product.id,
        storeId: product.storeId,
        name: product.name,
        sku: product.sku,
        gtin: product.gtin,
        description: product.description,
      },
    });
  }

  log.info(`[Admin] Re-indexed ${products.length} products`);
  return { indexed: products.length };
};

export const reindexCustomers = async (): Promise<{ indexed: number }> => {
  const es = getElasticsearchClient();

  const customers = await prisma.customer.findMany();

  for (const customer of customers) {
    await es.index({
      index: env.ELASTICSEARCH_CUSTOMERS_INDEX,
      id: customer.id,
      document: {
        id: customer.id,
        storeId: customer.storeId,
        name: customer.name,
        phoneNumber: customer.phoneNumber,
        email: customer.email,
        address: customer.address,
      },
    });
  }

  log.info(`[Admin] Re-indexed ${customers.length} customers`);
  return { indexed: customers.length };
};
