import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { ApiResponse } from "../utils/ApiResponse";
import { Product, ProductDocument } from "../models/product.model";
import { ProductImage } from "../models/productImage.model";
import { ApiError } from "../utils/ApiError";
import { StatusCodes } from "http-status-codes";
import { Category } from "../models/category.model";
import { generateGTIN } from "../utils/gtin-generator";
import mongoose from "mongoose";
import { productLimits } from "../constants/limits.constants";
import { GalleryImageDocument } from "../models/galleryImage.model";

export const getProducts = asyncHandler(async (req: Request, res: Response) => {
  const { storeId } = req.params;
  const page = parseInt((req.query.page as string) || "1");
  const limit = parseInt((req.query.limit as string) || "20");
  const query = (req.query.query as string) || "";
  const sortBy = (req.query.sortBy as string) || "createdAt";
  const sortOrder = req.query.sortOrder === "asc" ? 1 : -1;

  const match: any = {
    storeId: new mongoose.Types.ObjectId(storeId as string),
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

  const productList = await Product.aggregatePaginate(
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

  return res
    .status(StatusCodes.OK)
    .json(new ApiResponse(StatusCodes.OK, productList, "Products fetched"));
});

export const createProduct = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.user?._id;
    const productData = req.body;
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
    )
      throw new ApiError(
        StatusCodes.BAD_REQUEST,
        "Fill all the stared fields.",
      );

    if (pricePerQuantity.length === 0)
      throw new ApiError(
        StatusCodes.BAD_REQUEST,
        "Price per quantity is required.",
      );

    const categoryIds: string[] = [];
    if (categories && categories.length > 0) {
      for (const category of categories) {
        const categoryId = await getOrCreateCategory(category?.name, storeId);
        categoryIds.push(categoryId.toString());
      }
    }

    const product = await Product.create({
      creatorId: userId,
      storeId,
      ...productData,
      gtin: gtin || generateGTIN(),
      categories: categoryIds,
    });

    if (!product)
      throw new ApiError(
        StatusCodes.INTERNAL_SERVER_ERROR,
        "Failed to create product",
      );

    if (imageIds && Array.isArray(imageIds) && imageIds.length > 0) {
      await addOrRemoveProductImages(product, imageIds);
    }

    const productWithCategories = await getPopulatedProductData(product);

    return res
      .status(StatusCodes.OK)
      .json(
        new ApiResponse(
          StatusCodes.OK,
          productWithCategories,
          "Product created",
        ),
      );
  },
);

export const updateProduct = asyncHandler(
  async (req: Request, res: Response) => {
    const { productId } = req.params;
    const productData = req.body;
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
    )
      throw new ApiError(StatusCodes.BAD_REQUEST, "All fields are required.");

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

    // add product images
    if (imageIds && Array.isArray(imageIds) && imageIds.length > 0) {
      await addOrRemoveProductImages(updatedProduct, imageIds);
    }

    const productWithCategories = await getPopulatedProductData(updatedProduct);

    return res
      .status(StatusCodes.OK)
      .json(
        new ApiResponse(
          StatusCodes.OK,
          productWithCategories,
          "Product updated",
        ),
      );
  },
);

const addOrRemoveProductImages = async (
  product: ProductDocument,
  imageIds: string[],
) => {
  // check product image add limit
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

  // Update thumbnail image in product
  if (imageIds.length > 0) {
    // Update image with priority 1 image if changed
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
    // if no images left, remove thumbnail image reference
    await Product.findByIdAndUpdate(productId, {
      thumbnailImageId: null,
    });
  }
};

const getOrCreateCategory = async (categoryName: string, storeId: string) => {
  // Check if category exists
  let category = await Category.findOne({ name: categoryName, storeId });

  // If not, create it
  if (!category) {
    category = await Category.create({ name: categoryName, storeId });
  }

  return category._id;
};

export const getProductById = asyncHandler(
  async (req: Request, res: Response) => {
    const { productId } = req.params;
    const product = await Product.findById(productId);

    if (!product)
      throw new ApiError(StatusCodes.BAD_REQUEST, "Invalid product id");

    const populatedProduct = await getPopulatedProductData(product);

    return res
      .status(StatusCodes.OK)
      .json(
        new ApiResponse(StatusCodes.OK, populatedProduct, "Product fetched"),
      );
  },
);

export const deleteProduct = asyncHandler(
  async (req: Request, res: Response) => {
    const { productId } = req.params;
    await Promise.all([
      Product.findByIdAndDelete(productId),
      ProductImage.deleteMany({ productId }),
    ]);

    return res
      .status(StatusCodes.OK)
      .json(new ApiResponse(StatusCodes.OK, { productId }, "Product deleted"));
  },
);

export const rearrangeProductImages = asyncHandler(
  async (req: Request, res: Response) => {
    const { productId } = req.params;
    const { imagePriorities } = req.body;

    if (!imagePriorities || typeof imagePriorities !== "object") {
      throw new ApiError(
        StatusCodes.BAD_REQUEST,
        "Image priorities map is required.",
      );
    }

    if (!mongoose.Types.ObjectId.isValid(productId as string)) {
      throw new ApiError(StatusCodes.BAD_REQUEST, "Invalid product id.");
    }

    const bulkOps = Object.entries(imagePriorities)
      .filter(([imageId]) => mongoose.Types.ObjectId.isValid(imageId))
      .map(([imageId, priority]) => ({
        updateOne: {
          filter: {
            productId: new mongoose.Types.ObjectId(productId as string),
            imageId: new mongoose.Types.ObjectId(imageId),
          },
          update: { $set: { priority: Number(priority) } },
        },
      }));

    if (bulkOps.length > 0) {
      await ProductImage.bulkWrite(bulkOps);
    }

    // update the thumbnail image with priority 1
    const thumbnailImageId = Object.keys(imagePriorities).find(
      (key) => imagePriorities[key] === 1,
    );

    if (thumbnailImageId && mongoose.Types.ObjectId.isValid(thumbnailImageId)) {
      await Product.findByIdAndUpdate(productId, {
        thumbnailImageId: thumbnailImageId,
      });
    }

    const productImages = await getProductImages(productId as string);

    return res
      .status(StatusCodes.OK)
      .json(
        new ApiResponse(
          StatusCodes.OK,
          productImages,
          "Images rearranged successfully",
        ),
      );
  },
);

const getPopulatedProductData = async (product: ProductDocument) => {
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

const getProductImages = async (productId: string) => {
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

export const searchProducts = asyncHandler(
  async (req: Request, res: Response) => {
    const { storeId } = req.params;
    const query = (req.query.query as string) || "";

    if (!storeId)
      throw new ApiError(StatusCodes.BAD_REQUEST, "storeId is required");

    const lowerTerm = decodeURIComponent(query).toLowerCase();
    const safeTerm = lowerTerm.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

    // FIX: Added 'i' flag for explicit case insensitivity
    const regex = new RegExp(`^${safeTerm}`, "i");

    const searchResults = await Product.aggregate([
      {
        // STAGE 1: Filter Candidates
        // This will now use the Compound Index { storeId: 1, name: 1 } if it exists
        $match: {
          storeId: new mongoose.Types.ObjectId(storeId as string),
          $or: [
            { name: { $regex: regex } },
            { sku: { $regex: regex } },
            { gtin: { $regex: regex } },
          ],
        },
      },
      {
        // STAGE 2: Assign Priority Scores
        $addFields: {
          searchScore: {
            $add: [
              // Priority 1: GTIN Match (100 points)
              {
                $cond: [
                  { $regexMatch: { input: "$gtin", regex: regex } },
                  100,
                  0,
                ],
              },

              // Priority 2: SKU Match (50 points)
              {
                $cond: [
                  { $regexMatch: { input: "$sku", regex: regex } },
                  50,
                  0,
                ],
              },

              // Priority 3: Name Match (10 points)
              {
                $cond: [
                  { $regexMatch: { input: "$name", regex: regex } },
                  10,
                  0,
                ],
              },
            ],
          },
        },
      },
      {
        // STAGE 3: Sort by Score
        $sort: { searchScore: -1, name: 1 },
      },
      {
        $limit: 10,
      },
    ]).collation({ locale: "en", strength: 2 });

    return res
      .status(StatusCodes.OK)
      .json(new ApiResponse(StatusCodes.OK, searchResults, "Products fetched"));
  },
);
