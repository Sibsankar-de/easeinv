import { prisma } from "../lib/prisma";
import { ApiError } from "../utils/ApiError";
import { StatusCodes } from "http-status-codes";
import { generateGTIN } from "../utils/gtin-generator";
import { productLimits } from "../constants/limits.constants";
import { paginate } from "../utils/paginate";
import { CreateProductDTO, UpdateProductDTO } from "../schemas/product.schema";

export const getOrCreateCategory = async (
  categoryName: string,
  storeId: string,
): Promise<string> => {
  let category = await prisma.category.findFirst({
    where: { name: { equals: categoryName, mode: "insensitive" }, storeId },
  });
  if (!category) {
    category = await prisma.category.create({
      data: { name: categoryName, storeId },
    });
  }
  return category.id;
};

export const getProductImages = async (productId: string) => {
  const images = await prisma.productImage.findMany({
    where: { productId },
    orderBy: { priority: "asc" },
    include: {
      image: { select: { id: true, url: true, name: true } },
    },
  });

  return images.map((img) => ({
    id: img.id,
    priority: img.priority,
    imageId: img.imageId,
    url: img.image.url,
    name: img.image.name,
  }));
};

export const getPopulatedProductData = async (productId: string) => {
  const product = await prisma.product.findUnique({
    where: { id: productId },
    include: {
      categories: {
        include: {
          category: { select: { id: true, name: true, storeId: true } },
        },
      },
    },
  });

  if (!product) throw new ApiError(StatusCodes.NOT_FOUND, "Product not found");

  const images = await getProductImages(productId);

  return {
    ...product,
    categories: product.categories.map((pc) => pc.category),
    images,
  };
};

export const addOrRemoveProductImages = async (
  productId: string,
  imageIds: string[],
) => {
  if (imageIds.length > productLimits.MAX_IMAGES) {
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      `You can add maximum ${productLimits.MAX_IMAGES} images to a product.`,
    );
  }

  const existingImages = await prisma.productImage.findMany({
    where: { productId },
  });
  const existingImageIds = existingImages.map((img) => img.imageId);

  const imagesToRemove = existingImageIds.filter(
    (id) => !imageIds.includes(id),
  );
  const imagesToAdd = imageIds.filter((id) => !existingImageIds.includes(id));

  if (imagesToRemove.length > 0) {
    await prisma.productImage.deleteMany({
      where: { productId, imageId: { in: imagesToRemove } },
    });
  }

  if (imagesToAdd.length > 0) {
    await prisma.productImage.createMany({
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
    await prisma.product.update({
      where: { id: productId },
      data: { thumbnailImageId },
    });
  } else {
    await prisma.product.update({
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
    {
      categories: {
        include: {
          category: { select: { id: true, name: true, storeId: true } },
        },
      },
      images: {
        include: { image: { select: { id: true, url: true, name: true } } },
        orderBy: { priority: "asc" as const },
      },
    },
  );

  // Flatten category/image relations
  const docs = (result.docs as any[]).map((p) => ({
    ...p,
    categories: p.categories.map((pc: any) => pc.category),
    images: p.images.map((pi: any) => ({
      id: pi.id,
      priority: pi.priority,
      imageId: pi.imageId,
      url: pi.image.url,
      name: pi.image.name,
    })),
  }));

  return { ...result, docs };
};

export const createProduct = async (
  userId: string,
  productData: CreateProductDTO,
) => {
  const {
    storeId,
    name,
    sku,
    gtin,
    buyingPricePerQuantity,
    enableInventoryTracking,
    totalStock,
    stockUnit,
    pricePerQuantity,
    categories,
    imageIds,
    description,
  } = productData;

  if (
    [
      storeId,
      name,
      sku,
      buyingPricePerQuantity,
      stockUnit,
      pricePerQuantity,
    ].some((e) => !e) ||
    (enableInventoryTracking && !totalStock)
  ) {
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      "Fill all the required fields.",
    );
  }

  if ((pricePerQuantity as any[]).length === 0) {
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      "Price per quantity is required.",
    );
  }

  // Resolve categories
  const categoryIds: string[] = [];
  if (categories && categories.length > 0) {
    for (const category of categories) {
      const categoryId = await getOrCreateCategory(category?.name, storeId);
      categoryIds.push(categoryId);
    }
  }

  const product = await prisma.product.create({
    data: {
      creatorId: userId,
      storeId,
      name,
      sku,
      gtin: gtin || generateGTIN(),
      description,
      buyingPricePerQuantity,
      enabledInventoryTracking: enableInventoryTracking ?? false,
      totalStock,
      stockUnit,
      pricePerQuantity: pricePerQuantity as any,
      categories: {
        create: categoryIds.map((categoryId) => ({ categoryId })),
      },
    },
  });

  if (imageIds && Array.isArray(imageIds) && imageIds.length > 0) {
    await addOrRemoveProductImages(product.id, imageIds);
  }

  return getPopulatedProductData(product.id);
};

export const updateProduct = async (
  productId: string,
  productData: UpdateProductDTO,
) => {
  const {
    storeId,
    name,
    sku,
    gtin,
    buyingPricePerQuantity,
    enableInventoryTracking,
    totalStock,
    stockUnit,
    pricePerQuantity,
    categories,
    imageIds,
    description,
  } = productData;

  if (
    [
      storeId,
      name,
      sku,
      buyingPricePerQuantity,
      stockUnit,
      pricePerQuantity,
    ].some((e) => !e) ||
    (enableInventoryTracking && !totalStock)
  ) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "All fields are required.");
  }

  // Resolve categories
  const categoryIds: string[] = [];
  if (categories && categories.length > 0) {
    for (const category of categories) {
      const categoryId = await getOrCreateCategory(category?.name, storeId);
      categoryIds.push(categoryId);
    }
  }

  // Update product + replace category relations
  await prisma.$transaction([
    prisma.productCategory.deleteMany({ where: { productId } }),
    prisma.product.update({
      where: { id: productId },
      data: {
        name,
        sku,
        gtin: gtin || generateGTIN(),
        description,
        buyingPricePerQuantity,
        enabledInventoryTracking: enableInventoryTracking ?? false,
        totalStock,
        stockUnit,
        pricePerQuantity: pricePerQuantity as any,
        categories: {
          create: categoryIds.map((categoryId) => ({ categoryId })),
        },
      },
    }),
  ]);

  if (imageIds && Array.isArray(imageIds) && imageIds.length > 0) {
    await addOrRemoveProductImages(productId, imageIds);
  }

  return getPopulatedProductData(productId);
};

export const getProductById = async (productId: string) => {
  const product = await prisma.product.findUnique({ where: { id: productId } });
  if (!product) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "Invalid product id");
  }
  return getPopulatedProductData(productId);
};

export const deleteProduct = async (productId: string) => {
  // ProductImage cascades via schema; delete product
  await prisma.product.delete({ where: { id: productId } });
  return { productId };
};

export const rearrangeProductImages = async (
  productId: string,
  imagePriorities: Record<string, number>,
) => {
  if (!imagePriorities || typeof imagePriorities !== "object") {
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      "Image priorities map is required.",
    );
  }

  await Promise.all(
    Object.entries(imagePriorities).map(([imageId, priority]) =>
      prisma.productImage.updateMany({
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
    await prisma.product.update({
      where: { id: productId },
      data: { thumbnailImageId },
    });
  }

  return getProductImages(productId);
};

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
        include: { category: { select: { id: true, name: true } } },
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

  return scored;
};
