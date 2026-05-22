import "server-only";
import { NextRequest, NextResponse } from "next/server";
import { asyncHandler } from "../utils/asynchandler";
import { MiddlewareContext } from "@/types/middleware";
import { ApiResponse } from "../utils/response-handler";
import { Product } from "../models/product.model";
import { ApiError } from "../utils/error-handler";
import { StatusCodes } from "http-status-codes";
import { Category } from "../models/category.model";
import { generateGTIN } from "@/utils/gtin-generator";
import mongoose from "mongoose";

export const createProduct = asyncHandler(
  async (
    req: NextRequest,
    context: MiddlewareContext | undefined,
    params: Record<string, any> | undefined,
  ) => {
    const { userId } = await context!;

    const productData = await req.json();
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

    let categoryIds: string[] = [];
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
        "Failed to create store",
      );

    const productWithCategories = await getProductWithCategories(product);

    return NextResponse.json(
      new ApiResponse(StatusCodes.OK, productWithCategories, "Product created"),
    );
  },
);

export const updateProduct = asyncHandler(
  async (
    req: NextRequest,
    context: MiddlewareContext | undefined,
    params: Record<string, any> | undefined,
  ) => {
    const { userId } = await context!;
    const { productId } = await params!;

    const productData = await req.json();
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

    let categoryIds: string[] = [];
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

    return NextResponse.json(
      new ApiResponse(StatusCodes.OK, productWithCategories, "Product updated"),
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

export const getProduct = asyncHandler(
  async (
    req: NextRequest,
    context: MiddlewareContext | undefined,
    params: Record<string, any> | undefined,
  ) => {
    const { productId } = await params!;
    const product = await Product.findById(productId).populate([
      { path: "categories", select: "_id name storeId" },
    ]);

    if (!product)
      throw new ApiError(StatusCodes.BAD_REQUEST, "Invalid product id");

    return NextResponse.json(
      new ApiResponse(StatusCodes.OK, product, "Product fetched"),
    );
  },
);

export const deleteProduct = asyncHandler(
  async (
    req: NextRequest,
    context: MiddlewareContext | undefined,
    params: Record<string, any> | undefined,
  ) => {
    const { productId } = await params!;
    await Product.findByIdAndDelete(productId);

    return NextResponse.json(
      new ApiResponse(200, { productId }, "Product deleted"),
    );
  },
);

const getProductWithCategories = async (product: any) => {
  const categories = await Category.find({ _id: { $in: product.categories } });
  return { ...product.toObject(), categories };
};

export const searchProducts = asyncHandler(
  async (
    req: NextRequest,
    context: MiddlewareContext | undefined,
    params: Record<string, any> | undefined,
  ) => {
    const { searchParams } = new URL(req.url);
    const { storeId } = await params!;
    const query = searchParams.get("query") || "";

    if (!storeId)
      throw new ApiError(StatusCodes.BAD_REQUEST, "storeId is required");

    // 1. Prepare Input
    const lowerTerm = decodeURIComponent(query).toLowerCase();
    const safeTerm = lowerTerm.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

    // FIX: Added 'i' flag for explicit case insensitivity
    const regex = new RegExp(`^${safeTerm}`, "i");

    const searchResults = await Product.aggregate([
      {
        // STAGE 1: Filter Candidates
        // This will now use the Compound Index { storeId: 1, name: 1 } if it exists
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

    return NextResponse.json(
      new ApiResponse(StatusCodes.OK, searchResults, "Products fetched"),
    );
  },
);
