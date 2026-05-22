import "server-only";
import { NextRequest, NextResponse } from "next/server";
import { asyncHandler } from "../utils/asynchandler";
import { MiddlewareContext } from "@/types/middleware";
import { ApiResponse } from "../utils/response-handler";
import { Store } from "../models/store.model";
import { ApiError } from "../utils/error-handler";
import { StatusCodes } from "http-status-codes";
import { Product } from "../models/product.model";
import { Customer } from "../models/customer.model";
import mongoose from "mongoose";
import { Category } from "../models/category.model";
import { StoreSettings } from "../models/storeSettings.model";
import { uploadToCloudinary } from "../utils/coludinary-upload";
import { cloudinaryFolders } from "../constants/cloudinary.constant";
import { StoreUser } from "../models/storeUser.model";
import { userRoles } from "../enums/store.enum";

export const createStore = asyncHandler(
  async (req: NextRequest, context: MiddlewareContext | undefined) => {
    const { userId } = await context!;
    const { name, businessType, address, contactEmail, contactNo } =
      await req.json();

    if (!name)
      throw new ApiError(StatusCodes.BAD_REQUEST, "Store name is required.");

    const store = await Store.create({
      name,
      owner: userId,
      businessType,
      address,
      contactEmail,
      contactNo,
    });

    // create user-store access entry for owner
    await StoreUser.create({
      storeId: store._id,
      userId,
      role: userRoles.OWNER,
    });

    // create store settings
    const storeSettings = await StoreSettings.create({
      storeId: store._id,
    });

    store.settingsId = storeSettings._id;
    await store.save();

    return NextResponse.json(
      new ApiResponse(StatusCodes.OK, store, "Store created successfully!"),
    );
  },
);

export const updateStore = asyncHandler(
  async (
    req: NextRequest,
    context: MiddlewareContext | undefined,
    params: Record<string, any> | undefined,
  ) => {
    const { userId } = await context!;
    const { storeId } = await params!;

    const updateData = await req.json();

    if (!updateData.name)
      throw new ApiError(StatusCodes.BAD_REQUEST, "Store name is required");

    const updatedStore = await Store.findByIdAndUpdate(
      storeId,
      {
        ...updateData,
      },
      { new: true },
    ).select("-accessList");

    return NextResponse.json(
      new ApiResponse(StatusCodes.OK, updatedStore, "Store updated"),
    );
  },
);

const populateStoreSettings = async (store: any) => {
  if (!store.settingsId) return;

  const storeSettings = await StoreSettings.findById(store.settingsId);

  return { ...store.toObject(), storeSettings };
};

export const updateStoreSettings = asyncHandler(
  async (
    req: NextRequest,
    context: MiddlewareContext | undefined,
    params: Record<string, any> | undefined,
  ) => {
    const { userId } = await context!;
    const { storeId } = await params!;

    const updateData = await req.json();

    if (!updateData)
      throw new ApiError(StatusCodes.BAD_REQUEST, "Data is required");

    const updatedStoreSettings = await StoreSettings.findOneAndUpdate(
      { storeId },
      {
        $set: {
          ...updateData,
        },
      },
      { new: true },
    );

    return NextResponse.json(
      new ApiResponse(
        StatusCodes.OK,
        updatedStoreSettings,
        "Store settings updated",
      ),
    );
  },
);

export const uploadStoreLogo = asyncHandler(
  async (
    req: NextRequest,
    context: MiddlewareContext | undefined,
    params: Record<string, any> | undefined,
  ) => {
    const { userId, files } = await context!;
    const { storeId } = await params!;

    const storeLogo = files?.storeLogo;
    if (!storeLogo || !(storeLogo instanceof File)) {
      throw new ApiError(
        StatusCodes.BAD_REQUEST,
        "Store logo file is required",
      );
    }

    const buffer = Buffer.from(await storeLogo.arrayBuffer());
    const logoUrl = (
      await uploadToCloudinary(
        buffer,
        storeLogo.name,
        cloudinaryFolders.STORE_LOGO,
      )
    ).url;

    await StoreSettings.findOneAndUpdate(
      { storeId },
      {
        $set: {
          invoiceStoreLogoUrl: logoUrl,
        },
      },
      { new: true },
    );

    return NextResponse.json(
      new ApiResponse(
        StatusCodes.OK,
        { logoUrl },
        "Logo uploaded successfully!",
      ),
    );
  },
);

export const uploadInvoicePaymentQrCode = asyncHandler(
  async (
    req: NextRequest,
    context: MiddlewareContext | undefined,
    params: Record<string, any> | undefined,
  ) => {
    const { userId, files } = await context!;
    const { storeId } = await params!;

    const qrCodeFile = files?.qrCode;
    if (!qrCodeFile || !(qrCodeFile instanceof File)) {
      throw new ApiError(StatusCodes.BAD_REQUEST, "QR code file is required");
    }

    const buffer = Buffer.from(await qrCodeFile.arrayBuffer());
    const qrCodeUrl = (
      await uploadToCloudinary(
        buffer,
        qrCodeFile.name,
        cloudinaryFolders.PAYMENT_QR,
      )
    ).url;

    await StoreSettings.findOneAndUpdate(
      { storeId },
      {
        $set: {
          invoicePaymentQrCode: qrCodeUrl,
        },
      },
      { new: true },
    );

    return NextResponse.json(
      new ApiResponse(
        StatusCodes.OK,
        { qrCodeUrl },
        "QR code uploaded successfully!",
      ),
    );
  },
);

export const getStoreList = asyncHandler(
  async (req: NextRequest, context: MiddlewareContext | undefined) => {
    const { userId } = await context!;

    const storeList = await StoreUser.aggregate([
      {
        $match: {
          userId: new mongoose.Types.ObjectId(userId),
        },
      },
      {
        $lookup: {
          from: "stores",
          localField: "storeId",
          foreignField: "_id",
          as: "storeDetails",
        },
      },
      {
        $unwind: "$storeDetails",
      },
      {
        $project: {
          _id: "$storeDetails._id",
          role: 1,
          name: "$storeDetails.name",
          businessType: "$storeDetails.businessType",
          address: "$storeDetails.address",
          contactEmail: "$storeDetails.contactEmail",
          contactNo: "$storeDetails.contactNo",
          createdAt: "$storeDetails.createdAt",
        },
      },
    ]);

    if (!storeList) {
      throw new ApiError(StatusCodes.BAD_REQUEST, "Failed to get list");
    }

    return NextResponse.json(
      new ApiResponse(StatusCodes.OK, storeList, "Stores fetched"),
    );
  },
);

export const getStoreById = asyncHandler(
  async (
    req: NextRequest,
    context: MiddlewareContext | undefined,
    params: Record<string, any> | undefined,
  ) => {
    const { userId } = await context!;
    const { storeId } = await params!;

    const store = await Store.findById(storeId).select("-accessList");

    if (!store) {
      throw new ApiError(StatusCodes.BAD_REQUEST, "Failed to get store");
    }

    return NextResponse.json(
      new ApiResponse(
        StatusCodes.OK,
        await populateStoreSettings(store),
        "Store fetched",
      ),
    );
  },
);

export const getProductsByStore = asyncHandler(
  async (
    req: NextRequest,
    context: MiddlewareContext | undefined,
    params: Record<string, any> | undefined,
  ) => {
    const { userId } = await context!;
    const { storeId } = await params!;
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const query = searchParams.get("query") || "";
    const sortBy = searchParams.get("sortBy") || "createdAt";
    const sortOrder = searchParams.get("sortOrder") === "asc" ? 1 : -1;

    const match: any = { storeId: new mongoose.Types.ObjectId(storeId) };

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
      [
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
      ],
      {
        page,
        limit,
        sort: { [sortBy]: sortOrder },
      },
    );

    if (!productList) {
      throw new ApiError(StatusCodes.BAD_REQUEST, "Failed to get list");
    }

    return NextResponse.json(
      new ApiResponse(StatusCodes.OK, productList, "Products fetched"),
    );
  },
);

export const getCustomerList = asyncHandler(
  async (
    req: NextRequest,
    context: MiddlewareContext | undefined,
    params: Record<string, any> | undefined,
  ) => {
    const { storeId } = await params!;

    const customerList = await Customer.find({ storeId });

    return NextResponse.json(
      new ApiResponse(StatusCodes.OK, customerList, "Customer details fetched"),
    );
  },
);

export const createCategory = asyncHandler(
  async (
    req: NextRequest,
    context: MiddlewareContext | undefined,
    params: Record<string, any> | undefined,
  ) => {
    const { storeId } = await params!;

    const { name } = await req.json();

    if (!name) {
      throw new ApiError(StatusCodes.BAD_REQUEST, "Category name is required");
    }

    const existingCategory = await Category.findOne({ name, storeId });
    if (existingCategory) {
      throw new ApiError(
        StatusCodes.BAD_REQUEST,
        "Category with this name already exists",
      );
    }

    const category = await Category.create({ name, storeId });

    return NextResponse.json(
      new ApiResponse(StatusCodes.OK, category, "Category created"),
    );
  },
);

export const getCategoriesByStore = asyncHandler(
  async (
    req: NextRequest,
    context: MiddlewareContext | undefined,
    params: Record<string, any> | undefined,
  ) => {
    const { storeId } = await params!;

    const categories = await Category.find({ storeId }).select(
      "_id name storeId",
    );

    return NextResponse.json(
      new ApiResponse(StatusCodes.OK, categories, "Categories fetched"),
    );
  },
);
