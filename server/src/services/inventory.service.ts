import { prisma } from "../lib/prisma";
import { ApiError } from "../utils/apiErrorHandler";
import { StatusCodes } from "http-status-codes";
import { generateGTIN } from "../utils/gtin-generator";
import { productLimits } from "../constants/limits.constants";
import { paginate } from "../utils/paginate";
import { ProductCreateUpdateDTO } from "../schemas/product.schema";
import {
  toProductDto,
  ProductResponseDto,
  toProductSummaryDto,
} from "../dto/product.dto";
import {
  prismaTransaction,
  TransactionClient,
} from "../utils/transactionHandler";
import { Product, Store, User } from "@prisma/client";
import * as transactionalEmailService from "./transactionalEmail.service";
import { clientPages } from "../constants/client.constant";

export const getOrCreateCategory = async (
  categoryName: string,
  storeId: string,
  tx: TransactionClient = prisma,
): Promise<string> => {
  let category = await tx.category.findFirst({
    where: { name: { equals: categoryName, mode: "insensitive" }, storeId },
  });
  if (!category) {
    category = await tx.category.create({
      data: { name: categoryName, storeId },
    });
  }
  return category.id;
};

export const getProductImages = async (
  productId: string,
  tx: TransactionClient = prisma,
) => {
  return await tx.productImage.findMany({
    where: { productId },
    orderBy: { priority: "asc" },
    include: {
      image: true,
    },
  });
};

export const getPopulatedProductById = async (
  productId: string,
  tx: TransactionClient = prisma,
) => {
  const product = await tx.product.findUnique({
    where: { id: productId },
    include: {
      categories: {
        include: {
          category: true,
        },
      },
      images: {
        include: {
          image: true,
        },
      },
    },
  });

  if (!product) {
    throw new ApiError(StatusCodes.NOT_FOUND, "Product not found");
  }
  const categories = product.categories.map((pc) => pc.category);

  return toProductDto(product, categories, product.images);
};

export const addOrRemoveProductImages = async (
  productId: string,
  imageIds: string[],
  tx: TransactionClient = prisma,
) => {
  if (imageIds.length > productLimits.MAX_IMAGES) {
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      `You can add maximum ${productLimits.MAX_IMAGES} images to a product.`,
    );
  }

  const existingImages = await tx.productImage.findMany({
    where: { productId },
  });
  const existingImageIds = existingImages.map((img) => img.imageId);

  const imagesToRemove = existingImageIds.filter(
    (id) => !imageIds.includes(id),
  );
  const imagesToAdd = imageIds.filter((id) => !existingImageIds.includes(id));

  if (imagesToRemove.length > 0) {
    await tx.productImage.deleteMany({
      where: { productId, imageId: { in: imagesToRemove } },
    });
  }

  if (imagesToAdd.length > 0) {
    await tx.productImage.createMany({
      data: imagesToAdd.map((imageId) => ({
        productId,
        imageId,
        priority: imageIds.indexOf(imageId) + 1,
      })),
    });
  }

  // Update thumbnail
  if (imageIds.length > 0) {
    const thumbnailImageId = imageIds[0];
    await tx.product.update({
      where: { id: productId },
      data: { thumbnailImageId },
    });
  } else {
    await tx.product.update({
      where: { id: productId },
      data: { thumbnailImageId: null },
    });
  }
};

export const getProducts = async (params: {
  storeId: string;
  page: number;
  limit: number;
  query: string;
  sortBy: string;
  sortOrder: "asc" | "desc";
}) => {
  const { storeId, page, limit, query, sortBy, sortOrder } = params;

  const where: any = { storeId };
  if (query) {
    where.OR = [
      { name: { contains: query, mode: "insensitive" } },
      { sku: { contains: query, mode: "insensitive" } },
      { gtin: { contains: query, mode: "insensitive" } },
    ];
  }

  const result = await paginate(
    prisma.product,
    where,
    { [sortBy]: sortOrder },
    { page, limit },
  );

  return {
    ...result,
    docs: result.docs.map(toProductSummaryDto),
  };
};

export const createProduct = async (
  userId: string,
  productData: ProductCreateUpdateDTO,
) =>
  prismaTransaction(async (tx) => {
    const {
      storeId,
      name,
      sku,
      gtin,
      buyingPricePerQuantity,
      trackInventory,
      totalStock,
      alertThreshold,
      emailAlert,
      stockUnit,
      unitGroups,
      pricePerQuantity,
      categories,
      imageIds,
      description,
    } = productData;

    // Resolve categories
    const categoryIds: string[] = [];
    if (categories && categories.length > 0) {
      for (const category of categories) {
        const categoryId = await getOrCreateCategory(
          category.name,
          storeId,
          tx,
        );
        categoryIds.push(categoryId);
      }
    }

    const product = await tx.product.create({
      data: {
        userId,
        storeId,
        name,
        sku,
        gtin: gtin || generateGTIN(),
        description,
        buyingPricePerQuantity,
        trackInventory: trackInventory ?? false,
        totalStock: totalStock ?? 0,
        alertThreshold: alertThreshold ?? 0,
        emailAlert: emailAlert ?? false,
        stockUnit,
        unitGroups: unitGroups as any,
        pricePerQuantity: pricePerQuantity as any,
        categories: {
          create: categoryIds.map((categoryId) => ({ categoryId })),
        },
      },
    });

    if (imageIds && Array.isArray(imageIds) && imageIds.length > 0) {
      await addOrRemoveProductImages(product.id, imageIds, tx);
    }

    return await getPopulatedProductById(product.id, tx);
  });

export const updateProduct = async (
  productId: string,
  productData: ProductCreateUpdateDTO,
) =>
  prismaTransaction(async (tx) => {
    const {
      storeId,
      name,
      sku,
      gtin,
      buyingPricePerQuantity,
      trackInventory,
      totalStock,
      alertThreshold,
      emailAlert,
      stockUnit,
      unitGroups,
      pricePerQuantity,
      categories,
      imageIds,
      description,
    } = productData;

    if (!gtin) {
      throw new ApiError(StatusCodes.BAD_REQUEST, "Gtin isrequired.");
    }

    // Resolve categories
    const categoryIds: string[] = [];
    if (categories && categories.length > 0) {
      for (const category of categories) {
        const categoryId = await getOrCreateCategory(
          category?.name,
          storeId,
          tx,
        );
        categoryIds.push(categoryId);
      }
    }

    // Update product + replace category relations
    await tx.productCategory.deleteMany({ where: { productId } });
    await tx.product.update({
      where: { id: productId },
      data: {
        name,
        sku,
        gtin,
        description,
        buyingPricePerQuantity,
        trackInventory: trackInventory ?? false,
        totalStock: totalStock ?? 0,
        alertThreshold: alertThreshold ?? 0,
        emailAlert: emailAlert ?? false,
        stockUnit,
        unitGroups: unitGroups as any,
        pricePerQuantity: pricePerQuantity as any,
        categories: {
          create: categoryIds.map((categoryId) => ({ categoryId })),
        },
      },
    });

    if (imageIds && Array.isArray(imageIds) && imageIds.length > 0) {
      await addOrRemoveProductImages(productId, imageIds, tx);
    }

    return await getPopulatedProductById(productId, tx);
  });

export const getProductById = async (productId: string) => {
  return getPopulatedProductById(productId);
};

export const deleteProduct = async (productId: string) => {
  // Related fields are cascade via relation
  await prisma.product.delete({ where: { id: productId } });
  return { productId };
};

export const rearrangeProductImages = async (
  productId: string,
  imagePriorities: Record<string, number>,
) =>
  prismaTransaction(async (tx) => {
    if (!imagePriorities || typeof imagePriorities !== "object") {
      throw new ApiError(
        StatusCodes.BAD_REQUEST,
        "Image priorities map is required.",
      );
    }

    await Promise.all(
      Object.entries(imagePriorities).map(([imageId, priority]) =>
        tx.productImage.updateMany({
          where: { productId, imageId },
          data: { priority: Number(priority) },
        }),
      ),
    );

    // Set thumbnail to priority=1 image
    const thumbnailImageId = Object.keys(imagePriorities).find(
      (key) => imagePriorities[key] === 1,
    );
    if (thumbnailImageId) {
      await tx.product.update({
        where: { id: productId },
        data: { thumbnailImageId },
      });
    }

    return getProductImages(productId, tx);
  });

export const searchProducts = async (
  storeId: string,
  query: string,
): Promise<ProductResponseDto[]> => {
  if (!storeId) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "storeId is required");
  }

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
    take: 10,
    include: {
      categories: {
        include: { category: true },
      },
    },
  });

  // Apply search score sorting in-memory
  const scored = results
    .map((p) => {
      const lower = term.toLowerCase();
      let score = 0;
      if (p.gtin?.toLowerCase().startsWith(lower)) score += 100;
      if (p.sku?.toLowerCase().startsWith(lower)) score += 50;
      if (p.name?.toLowerCase().startsWith(lower)) score += 10;
      return { ...p, searchScore: score };
    })
    .sort(
      (a, b) => b.searchScore - a.searchScore || a.name.localeCompare(b.name),
    );

  return scored.map((p) => {
    const categories = p.categories.map((pc) => pc.category);
    return toProductDto(p, categories, []);
  });
};

export const updateInventoryStock = async (
  productId: string,
  quantity: number,
  store: Store,
  tx: TransactionClient,
) => {
  let product = await tx.product.findFirst({
    where: {
      id: productId,
    },
    include: {
      user: true,
    },
  });

  if (!product || !product.trackInventory) {
    return product;
  }

  if (product.totalStock >= quantity) {
    product = await tx.product.update({
      where: {
        id: productId,
      },
      data: { totalStock: { decrement: quantity } },
      include: { user: true },
    });
  }

  // send stock alert
  if (product.totalStock <= product.alertThreshold) {
    sendInventoryStockAlert(product, store);
  }

  return product;
};

export const sendInventoryStockAlert = (
  product: Product & {
    user: User;
  },
  store: Store,
) => {
  if (product.totalStock > product.alertThreshold) return;

  // send email
  if (product.emailAlert) {
    const inventoryLink = clientPages.constructProductEditPageUrl(
      store.id,
      product.id,
    );
    transactionalEmailService.sendStockAlertEmail(
      product.user,
      store,
      product,
      inventoryLink,
    );
  }
};
