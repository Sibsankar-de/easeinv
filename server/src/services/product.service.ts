import mongoose from "mongoose";
import { Product, ProductDocument } from "../models/product.model";
import { ProductImage } from "../models/productImage.model";
import { Category } from "../models/category.model";
import { GalleryImageDocument } from "../models/galleryImage.model";
import { generateGTIN } from "../utils/gtin-generator";
import { ApiError } from "../utils/ApiError";
import { StatusCodes } from "http-status-codes";
import { productLimits } from "../constants/limits.constants";
import { CreateProductDTO, UpdateProductDTO } from "../schemas/product.schema";

export const getOrCreateCategory = async (
  categoryName: string,
  storeId: string,
) => {
  let category = await Category.findOne({ name: categoryName, storeId });
  if (!category) {
    category = await Category.create({ name: categoryName, storeId });
  }
  return category._id;
};

export const getProductImages = async (productId: string) => {
  const images = await ProductImage.find({ productId })
    .sort({ priority: 1 })
    .populate("imageId");

  return images.map((img) => {
    const imageData = img.imageId as any as GalleryImageDocument;
    return {
      _id: img._id,
      priority: img.priority,
      imageId: imageData._id,
      url: imageData.url,
      name: imageData.name,
    };
  });
};

export const getPopulatedProductData = async (product: ProductDocument) => {
  const categories = await Category.find({
    _id: { $in: product.categories },
  });
  const productImages = await getProductImages(product._id.toString());

  return {
    ...product.toObject(),
    categories,
    images: productImages,
  };
};

export const addOrRemoveProductImages = async (
  product: ProductDocument,
  imageIds: string[],
) => {
  if (imageIds.length > productLimits.MAX_IMAGES) {
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      `You can add maximum ${productLimits.MAX_IMAGES} images to a product.`,
    );
  }

  const productId = product._id.toString();
  const existingImages = await ProductImage.find({ productId });
  const existingImageIds = existingImages.map((img) => img.imageId.toString());

  const imagesToRemove = existingImageIds.filter(
    (id) => !imageIds.includes(id),
  );
  const imagesToAdd = imageIds.filter((id) => !existingImageIds.includes(id));

  if (imagesToRemove.length > 0) {
    await ProductImage.deleteMany({
      productId,
      imageId: { $in: imagesToRemove },
    });
  }

  if (imagesToAdd.length > 0) {
    await ProductImage.insertMany(
      imagesToAdd.map((imageId) => {
        const index = imageIds.indexOf(imageId);
        return {
          productId,
          imageId,
          priority: index !== -1 ? index + 1 : 1,
        };
      }),
    );
  }

  if (imageIds.length > 0) {
    const thumbnailImageId = imageIds[0];
    if (
      mongoose.Types.ObjectId.isValid(thumbnailImageId) &&
      thumbnailImageId !== product.thumbnailImageId?.toString()
    ) {
      await Product.findByIdAndUpdate(productId, {
        thumbnailImageId,
      });
    }
  } else {
    await Product.findByIdAndUpdate(productId, {
      thumbnailImageId: null,
    });
  }
};

export const getProducts = async (params: {
  storeId: string;
  page: number;
  limit: number;
  query: string;
  sortBy: string;
  sortOrder: 1 | -1;
}) => {
  const { storeId, page, limit, query, sortBy, sortOrder } = params;

  const match: any = {
    storeId: new mongoose.Types.ObjectId(storeId),
  };

  if (query) {
    const safeTerm = query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const regex = new RegExp(`^${safeTerm}`, "i");
    match.$or = [
      { name: { $regex: regex } },
      { sku: { $regex: regex } },
      { gtin: { $regex: regex } },
    ];
  }

  const productList = await (Product as any).aggregatePaginate(
    Product.aggregate([
      {
        $match: match,
      },
      {
        $lookup: {
          from: "categories",
          let: { catIds: "$categories" },
          pipeline: [
            {
              $match: {
                $expr: { $in: ["$_id", "$$catIds"] },
              },
            },
            {
              $project: { _id: 1, name: 1, storeId: 1 },
            },
          ],
          as: "categories",
        },
      },
      {
        $lookup: {
          from: "productimages",
          let: { productId: "$_id" },
          pipeline: [
            {
              $match: {
                $expr: { $eq: ["$productId", "$$productId"] },
              },
            },
            {
              $sort: { priority: 1 },
            },
            {
              $lookup: {
                from: "galleryimages",
                localField: "imageId",
                foreignField: "_id",
                as: "image",
              },
            },
            {
              $unwind: "$image",
            },
            {
              $replaceRoot: { newRoot: "$image" },
            },
          ],
          as: "images",
        },
      },
    ]),
    {
      page,
      limit,
      sort: { [sortBy]: sortOrder },
    },
  );

  if (!productList) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "Failed to get list");
  }

  return productList;
};

export const createProduct = async (
  userId: string | mongoose.Types.ObjectId,
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
    throw new ApiError(StatusCodes.BAD_REQUEST, "Fill all the stared fields.");
  }

  if (pricePerQuantity.length === 0) {
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      "Price per quantity is required.",
    );
  }

  const categoryIds: string[] = [];
  if (categories && categories.length > 0) {
    for (const category of categories) {
      const categoryId = await getOrCreateCategory(category?.name, storeId);
      categoryIds.push(categoryId.toString());
    }
  }

  const product = await Product.create({
    creatorId: userId,
    ...productData,
    gtin: gtin || generateGTIN(),
    categories: categoryIds,
  });

  if (!product) {
    throw new ApiError(
      StatusCodes.INTERNAL_SERVER_ERROR,
      "Failed to create product",
    );
  }

  if (imageIds && Array.isArray(imageIds) && imageIds.length > 0) {
    await addOrRemoveProductImages(product, imageIds);
  }

  return getPopulatedProductData(product);
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

  const categoryIds: string[] = [];
  if (categories && categories.length > 0) {
    for (const category of categories) {
      const categoryId = await getOrCreateCategory(category?.name, storeId);
      categoryIds.push(categoryId.toString());
    }
  }

  const updatedProduct = await Product.findByIdAndUpdate(
    productId,
    {
      $set: {
        ...productData,
        categories: categoryIds,
        gtin: gtin || generateGTIN(),
      },
    },
    { new: true },
  );

  if (!updatedProduct) {
    throw new ApiError(
      StatusCodes.INTERNAL_SERVER_ERROR,
      "Failed to update product",
    );
  }

  if (imageIds && Array.isArray(imageIds) && imageIds.length > 0) {
    await addOrRemoveProductImages(updatedProduct, imageIds);
  }

  return getPopulatedProductData(updatedProduct);
};

export const getProductById = async (productId: string) => {
  const product = await Product.findById(productId);
  if (!product) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "Invalid product id");
  }
  return getPopulatedProductData(product);
};

export const deleteProduct = async (productId: string) => {
  await Promise.all([
    Product.findByIdAndDelete(productId),
    ProductImage.deleteMany({ productId }),
  ]);
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

  if (!mongoose.Types.ObjectId.isValid(productId)) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "Invalid product id.");
  }

  const bulkOps = Object.entries(imagePriorities)
    .filter(([imageId]) => mongoose.Types.ObjectId.isValid(imageId))
    .map(([imageId, priority]) => ({
      updateOne: {
        filter: {
          productId: new mongoose.Types.ObjectId(productId),
          imageId: new mongoose.Types.ObjectId(imageId),
        },
        update: { $set: { priority: Number(priority) } },
      },
    }));

  if (bulkOps.length > 0) {
    await ProductImage.bulkWrite(bulkOps);
  }

  const thumbnailImageId = Object.keys(imagePriorities).find(
    (key) => imagePriorities[key] === 1,
  );

  if (thumbnailImageId && mongoose.Types.ObjectId.isValid(thumbnailImageId)) {
    await Product.findByIdAndUpdate(productId, {
      thumbnailImageId: thumbnailImageId,
    });
  }

  return getProductImages(productId);
};

export const searchProducts = async (storeId: string, query: string) => {
  if (!storeId) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "storeId is required");
  }

  const lowerTerm = decodeURIComponent(query).toLowerCase();
  const safeTerm = lowerTerm.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const regex = new RegExp(`^${safeTerm}`, "i");

  const searchResults = await Product.aggregate([
    {
      $match: {
        storeId: new mongoose.Types.ObjectId(storeId),
        $or: [
          { name: { $regex: regex } },
          { sku: { $regex: regex } },
          { gtin: { $regex: regex } },
        ],
      },
    },
    {
      $addFields: {
        searchScore: {
          $add: [
            {
              $cond: [
                { $regexMatch: { input: "$gtin", regex: regex } },
                100,
                0,
              ],
            },
            {
              $cond: [{ $regexMatch: { input: "$sku", regex: regex } }, 50, 0],
            },
            {
              $cond: [{ $regexMatch: { input: "$name", regex: regex } }, 10, 0],
            },
          ],
        },
      },
    },
    {
      $sort: { searchScore: -1, name: 1 },
    },
    {
      $limit: 10,
    },
  ]).collation({ locale: "en", strength: 2 });

  return searchResults;
};
