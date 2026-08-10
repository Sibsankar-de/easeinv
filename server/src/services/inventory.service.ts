import ExcelJS from "exceljs";
import { Response } from "express";
import { prisma } from "../lib/prisma";
import { ApiError } from "../utils/apiErrorHandler";
import { StatusCodes } from "http-status-codes";
import { generateGTIN } from "../utils/gtin-generator";
import { productLimits } from "../constants/limits.constants";
import { paginate } from "../utils/paginate";
import {
  ProductCreateUpdateDTO,
  ProductExportQueryDTO,
  ProductExtraData,
} from "../schemas/product.schema";

import { toProductDto, toProductSummaryDto } from "../dto/product.dto";
import {
  prismaTransaction,
  TransactionClient,
} from "../utils/transactionHandler";
import {
  Product,
  ProductStockStatus,
  Store,
  User,
  Prisma,
} from "@prisma/client";

import * as transactionalEmailService from "./transactionalEmail.service";
import * as transactionalNotification from "./transactionalNotification.service";
import { clientPages } from "../constants/client.constant";
import { productExtraDataConverter } from "../converters/product.converter";

export const getProducts = async (params: {
  storeId: string;
  page: number;
  limit: number;
  query: string;
  sortBy: string;
  sortOrder: "asc" | "desc";
  categoryId?: string;
}) => {
  const { storeId, page, limit, query, sortBy, sortOrder, categoryId } = params;

  const where: any = { storeId };
  if (query) {
    where.OR = [
      { name: { contains: query, mode: "insensitive" } },
      { sku: { contains: query, mode: "insensitive" } },
      { gtin: { contains: query, mode: "insensitive" } },
    ];
  }
  if (categoryId) {
    where.categories = { some: { categoryId } };
  }

  const result = await paginate(
    prisma.product,
    where,
    { [sortBy]: sortOrder },
    { page, limit },
    {
      categories: {
        include: { category: true },
      },
    },
  );

  return {
    ...result,
    docs: result.docs.map(toProductSummaryDto),
  };
};

export const createProduct = async (
  userId: string,
  storeId: string,
  productData: ProductCreateUpdateDTO,
) =>
  prismaTransaction(async (tx) => {
    const {
      name,
      sku,
      gtin,
      buyingPricePerQuantity,
      mrp,
      trackInventory,
      totalStock,
      alertThreshold,
      emailAlert,
      stockUnit,
      unitGroups,
      pricePerQuantity,
      categoryIds,
      imageIds,
      description,
    } = productData;

    await ensureUniqueSKU(storeId, sku, undefined, tx);

    // add last stock update status
    let extraData: ProductExtraData = productExtraDataConverter({});
    if (trackInventory && totalStock) {
      extraData = {
        ...extraData,
        lastStockAmount: totalStock,
        lastStockAddedAt: new Date(),
      };
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
        mrp,
        trackInventory: trackInventory ?? false,
        totalStock: totalStock ?? 0,
        alertThreshold: alertThreshold ?? 0,
        emailAlert: emailAlert ?? false,
        stockStatus: trackInventory
          ? getProductStockStatus(totalStock, alertThreshold)
          : ProductStockStatus.AVAILABLE,
        stockUnit,
        unitGroups: unitGroups,
        pricePerQuantity: pricePerQuantity,
        extraData: extraData,
      },
    });

    // add categories
    if (categoryIds && categoryIds.length > 0) {
      await addOrRemoveProductCategories(product.id, categoryIds, tx);
    }

    // add images
    if (imageIds && imageIds.length > 0) {
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
      name,
      sku,
      gtin,
      buyingPricePerQuantity,
      mrp,
      trackInventory,
      totalStock,
      alertThreshold,
      emailAlert,
      stockUnit,
      unitGroups,
      pricePerQuantity,
      categoryIds,
      imageIds,
      description,
    } = productData;

    if (!gtin) {
      throw new ApiError(StatusCodes.BAD_REQUEST, "Gtin isrequired.");
    }

    const product = await tx.product.findFirst({ where: { id: productId } });
    if (!product) {
      throw new ApiError(StatusCodes.BAD_REQUEST, "Product not found.");
    }

    await ensureUniqueSKU(product.storeId, sku, productId, tx);

    // update last stock update status
    let extraData: ProductExtraData = productExtraDataConverter(
      product.extraData,
    );
    if (trackInventory && product.totalStock !== totalStock) {
      extraData = {
        ...extraData,
        lastStockAmount: product.totalStock,
        lastStockAddedAt: new Date(),
      };
    }

    await tx.product.update({
      where: { id: productId },
      data: {
        name,
        sku,
        gtin,
        description,
        buyingPricePerQuantity,
        mrp,
        trackInventory: trackInventory ?? false,
        totalStock: totalStock ?? 0,
        alertThreshold: alertThreshold ?? 0,
        emailAlert: emailAlert ?? false,
        stockStatus: trackInventory
          ? getProductStockStatus(totalStock, alertThreshold)
          : ProductStockStatus.AVAILABLE,
        stockUnit,
        unitGroups: unitGroups as any,
        pricePerQuantity: pricePerQuantity as any,
        extraData,
      },
    });

    // add categories
    if (categoryIds && categoryIds.length > 0) {
      await addOrRemoveProductCategories(productId, categoryIds, tx);
    }

    // add images
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

export const ensureUniqueSKU = async (
  storeId: string,
  sku: string,
  excludeProductId?: string,
  tx: TransactionClient = prisma,
) => {
  const existingProduct = await tx.product.findFirst({
    where: {
      storeId,
      sku,
      ...(excludeProductId ? { id: { not: excludeProductId } } : {}),
    },
  });

  if (existingProduct) {
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      "Product with this SKU already exists",
    );
  }
};

export const getProductStockStatus = (
  totalStock: number,
  threshold: number,
): ProductStockStatus => {
  if (totalStock <= 0) return ProductStockStatus.OUT_OF_STOCK;
  if (totalStock <= threshold) return ProductStockStatus.LOW_STOCK;
  return ProductStockStatus.AVAILABLE;
};

export const addOrRemoveProductCategories = async (
  productId: string,
  categoryIds: string[],
  tx: TransactionClient = prisma,
) => {
  const existingCategories = await tx.productCategory.findMany({
    where: { productId },
  });
  const existingCategoryIds = existingCategories.map((c) => c.categoryId);

  const categoriesToAdd = categoryIds.filter(
    (c) => !existingCategoryIds.includes(c),
  );
  const categoriesToRemove = existingCategoryIds.filter(
    (c) => !categoryIds.includes(c),
  );

  // create required categories
  if (categoriesToAdd.length > 0) {
    await tx.productCategory.createMany({
      data: categoriesToAdd.map((categoryId) => ({
        productId,
        categoryId,
      })),
    });
  }

  // delete categories
  if (categoriesToRemove.length > 0) {
    await tx.productCategory.deleteMany({
      where: {
        productId,
        categoryId: { in: categoriesToRemove },
      },
    });
  }
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

export const searchProducts = async (storeId: string, query: string) => {
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

  return scored.map(toProductSummaryDto);
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

  if (product.totalStock > 0) {
    const newStock = Math.max(product.totalStock - quantity, 0);
    product = await tx.product.update({
      where: {
        id: productId,
      },
      data: {
        totalStock: newStock,
        stockStatus: getProductStockStatus(newStock, product.alertThreshold),
      },
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

  // Send in-app notification (always, regardless of emailAlert setting)
  if (product.totalStock <= 0) {
    transactionalNotification.notifyStockOut(product.user, product, store);
  } else {
    transactionalNotification.notifyStockLow(product.user, product, store);
  }

  // send email (only if emailAlert is enabled for this product)
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

export const exportProductsStream = async (
  storeId: string,
  params: ProductExportQueryDTO,
  res: Response,
) => {
  const { format, query, categoryId, stockStatus, sortBy, sortOrder } = params;

  const where: Prisma.ProductWhereInput = { storeId };


  if (query) {
    where.OR = [
      { name: { contains: query, mode: "insensitive" } },
      { sku: { contains: query, mode: "insensitive" } },
      { gtin: { contains: query, mode: "insensitive" } },
    ];
  }

  if (categoryId) {
    where.categories = { some: { categoryId } };
  }

  if (stockStatus) {
    where.stockStatus = stockStatus;
  }

  const products = await prisma.product.findMany({
    where,
    orderBy: { [sortBy]: sortOrder },
    include: {
      categories: {
        include: { category: true },
      },
    },
  });

  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet("Products");

  worksheet.columns = [
    { header: "ID", key: "id", width: 36 },
    { header: "Product Name", key: "name", width: 30 },
    { header: "SKU", key: "sku", width: 18 },
    { header: "GTIN / Barcode", key: "gtin", width: 18 },
    { header: "Categories", key: "categories", width: 25 },
    { header: "Stock Status", key: "stockStatus", width: 15 },
    { header: "Total Stock", key: "totalStock", width: 12 },
    { header: "Stock Unit", key: "stockUnit", width: 12 },
    { header: "Buying Price", key: "buyingPrice", width: 15 },
    { header: "MRP", key: "mrp", width: 15 },
    { header: "Track Inventory", key: "trackInventory", width: 15 },
    { header: "Alert Threshold", key: "alertThreshold", width: 15 },
    { header: "Email Alert", key: "emailAlert", width: 12 },
    { header: "Description", key: "description", width: 35 },
    { header: "Created At", key: "createdAt", width: 22 },
  ];

  // Bold headers
  worksheet.getRow(1).font = { bold: true };

  products.forEach((p) => {
    const categoryNames = p.categories
      .map((c) => c.category.name)
      .join(", ");

    worksheet.addRow({
      id: p.id,
      name: p.name,
      sku: p.sku,
      gtin: p.gtin || "",
      categories: categoryNames,
      stockStatus: p.stockStatus,
      totalStock: p.totalStock,
      stockUnit: p.stockUnit,
      buyingPrice: p.buyingPricePerQuantity,
      mrp: p.mrp ?? "",
      trackInventory: p.trackInventory ? "Yes" : "No",
      alertThreshold: p.alertThreshold,
      emailAlert: p.emailAlert ? "Yes" : "No",
      description: p.description || "",
      createdAt: p.createdAt.toISOString(),
    });
  });

  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  if (format === "xlsx") {
    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    );
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="products_${storeId}_${timestamp}.xlsx"`,
    );
    await workbook.xlsx.write(res);
  } else {
    res.setHeader("Content-Type", "text/csv; charset=utf-8");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="products_${storeId}_${timestamp}.csv"`,
    );
    await workbook.csv.write(res);
  }
};

