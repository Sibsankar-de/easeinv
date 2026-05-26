import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { ApiResponse } from "../utils/ApiResponse";
import { Product } from "../models/product.model";
import { ApiError } from "../utils/ApiError";
import { StatusCodes } from "http-status-codes";
import { Category } from "../models/category.model";
import { generateGTIN } from "../utils/gtin-generator";
import mongoose from "mongoose";

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

    const productWithCategories = await getProductWithCategories(product);

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

    const productWithCategories =
      await getProductWithCategories(updatedProduct);

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
    const product = await Product.findById(productId).populate([
      { path: "categories", select: "_id name storeId" },
    ]);

    if (!product)
      throw new ApiError(StatusCodes.BAD_REQUEST, "Invalid product id");

    return res
      .status(StatusCodes.OK)
      .json(new ApiResponse(StatusCodes.OK, product, "Product fetched"));
  },
);

export const deleteProduct = asyncHandler(
  async (req: Request, res: Response) => {
    const { productId } = req.params;
    await Product.findByIdAndDelete(productId);

    return res
      .status(StatusCodes.OK)
      .json(new ApiResponse(StatusCodes.OK, { productId }, "Product deleted"));
  },
);

const getProductWithCategories = async (product: any) => {
  const categories = await Category.find({ _id: { $in: product.categories } });
  return { ...product.toObject(), categories };
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
