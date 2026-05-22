import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { ApiResponse } from "../utils/ApiResponse";
import { Store } from "../models/store.model";
import { ApiError } from "../utils/ApiError";
import { StatusCodes } from "http-status-codes";
import { Product } from "../models/product.model";
import { Customer } from "../models/customer.model";
import mongoose from "mongoose";
import { Category } from "../models/category.model";
import { StoreSettings } from "../models/storeSettings.model";
import { uploadToCloudinary } from "../utils/cloudinary";
import { cloudinaryFolders } from "../constants/cloudinary.constant";
import { StoreUser } from "../models/storeUser.model";
import { userRoles } from "../enums/store.enum";

export const createStore = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.user?._id;
    const { name, businessType, address, contactEmail, contactNo } = req.body;

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

    store.settingsId = storeSettings._id as mongoose.Types.ObjectId;
    await store.save();

    return res.status(StatusCodes.OK).json(
      new ApiResponse(StatusCodes.OK, store, "Store created successfully!"),
    );
  },
);

export const updateStore = asyncHandler(
  async (req: Request, res: Response) => {
    const { storeId } = req.params;
    const updateData = req.body;

    if (!updateData.name)
      throw new ApiError(StatusCodes.BAD_REQUEST, "Store name is required");

    const files = req.files as { [fieldname: string]: Express.Multer.File[] };
    let logoUrl, qrCodeUrl;

    if (files) {
      if (files.logo && files.logo[0]) {
        const uploadData = await uploadToCloudinary(
          files.logo[0].buffer,
          files.logo[0].originalname,
          cloudinaryFolders.STORE_LOGO,
        );
        if (uploadData) logoUrl = uploadData.url;
      }
      if (files.qrCode && files.qrCode[0]) {
        const uploadData = await uploadToCloudinary(
          files.qrCode[0].buffer,
          files.qrCode[0].originalname,
          cloudinaryFolders.PAYMENT_QR,
        );
        if (uploadData) qrCodeUrl = uploadData.url;
      }
    }

    const updatedStore = await Store.findByIdAndUpdate(
      storeId,
      {
        ...updateData,
      },
      { new: true },
    ).select("-accessList");

    if (logoUrl || qrCodeUrl) {
      const settingsUpdate: any = {};
      if (logoUrl) settingsUpdate.invoiceStoreLogoUrl = logoUrl;
      if (qrCodeUrl) settingsUpdate.invoicePaymentQrCode = qrCodeUrl;

      await StoreSettings.findOneAndUpdate(
        { storeId },
        { $set: settingsUpdate },
      );
    }

    return res.status(StatusCodes.OK).json(
      new ApiResponse(StatusCodes.OK, updatedStore, "Store updated"),
    );
  },
);

export const deleteStore = asyncHandler(
  async (req: Request, res: Response) => {
    const { storeId } = req.params;

    const store = await Store.findById(storeId);
    if (!store) {
      throw new ApiError(StatusCodes.NOT_FOUND, "Store not found");
    }

    // Delete related data
    await Promise.all([
      Store.findByIdAndDelete(storeId),
      StoreUser.deleteMany({ storeId }),
      StoreSettings.deleteMany({ storeId }),
      Product.deleteMany({ storeId }),
      Customer.deleteMany({ storeId }),
      Category.deleteMany({ storeId }),
      // Note: Invoices are usually kept for records, but for a full delete:
      // Invoice.deleteMany({ storeId }),
    ]);

    return res.status(StatusCodes.OK).json(
      new ApiResponse(StatusCodes.OK, null, "Store deleted successfully"),
    );
  },
);

const populateStoreSettings = async (store: any) => {
  if (!store.settingsId) return store.toObject();

  const storeSettings = await StoreSettings.findById(store.settingsId);

  return { ...store.toObject(), storeSettings };
};

export const updateStoreSettings = asyncHandler(
  async (req: Request, res: Response) => {
    const { storeId } = req.params;
    const updateData = req.body;

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

    return res.status(StatusCodes.OK).json(
      new ApiResponse(
        StatusCodes.OK,
        updatedStoreSettings,
        "Store settings updated",
      ),
    );
  },
);

export const uploadStoreLogo = asyncHandler(
  async (req: Request, res: Response) => {
    const { storeId } = req.params;

    const file = req.file;
    if (!file) {
      throw new ApiError(
        StatusCodes.BAD_REQUEST,
        "Store logo file is required",
      );
    }

    const buffer = file.buffer;
    const uploadData = await uploadToCloudinary(
      buffer,
      file.originalname,
      cloudinaryFolders.STORE_LOGO,
    );

    if (!uploadData) {
      throw new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, "Failed to upload logo");
    }

    const logoUrl = uploadData.url;

    await StoreSettings.findOneAndUpdate(
      { storeId },
      {
        $set: {
          invoiceStoreLogoUrl: logoUrl,
        },
      },
      { new: true },
    );

    return res.status(StatusCodes.OK).json(
      new ApiResponse(
        StatusCodes.OK,
        { logoUrl },
        "Logo uploaded successfully!",
      ),
    );
  },
);

export const uploadInvoicePaymentQrCode = asyncHandler(
  async (req: Request, res: Response) => {
    const { storeId } = req.params;

    const file = req.file;
    if (!file) {
      throw new ApiError(StatusCodes.BAD_REQUEST, "QR code file is required");
    }

    const buffer = file.buffer;
    const uploadData = await uploadToCloudinary(
      buffer,
      file.originalname,
      cloudinaryFolders.PAYMENT_QR,
    );

    if (!uploadData) {
      throw new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, "Failed to upload QR code");
    }

    const qrCodeUrl = uploadData.url;

    await StoreSettings.findOneAndUpdate(
      { storeId },
      {
        $set: {
          invoicePaymentQrCode: qrCodeUrl,
        },
      },
      { new: true },
    );

    return res.status(StatusCodes.OK).json(
      new ApiResponse(
        StatusCodes.OK,
        { qrCodeUrl },
        "QR code uploaded successfully!",
      ),
    );
  },
);

export const getStoreList = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.user?._id;

    const storeList = await StoreUser.aggregate([
      {
        $match: {
          userId: new mongoose.Types.ObjectId(userId as any),
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

    return res.status(StatusCodes.OK).json(
      new ApiResponse(StatusCodes.OK, storeList, "Stores fetched"),
    );
  },
);

export const getStoreDetails = asyncHandler(
  async (req: Request, res: Response) => {
    const { storeId } = req.params;

    const store = await Store.findById(storeId).select("-accessList");

    if (!store) {
      throw new ApiError(StatusCodes.BAD_REQUEST, "Failed to get store");
    }

    return res.status(StatusCodes.OK).json(
      new ApiResponse(
        StatusCodes.OK,
        await populateStoreSettings(store),
        "Store fetched",
      ),
    );
  },
);

export const getProductsByStore = asyncHandler(
  async (req: Request, res: Response) => {
    const { storeId } = req.params;
    const page = parseInt(req.query.page as string || "1");
    const limit = parseInt(req.query.limit as string || "20");
    const query = req.query.query as string || "";
    const sortBy = req.query.sortBy as string || "createdAt";
    const sortOrder = req.query.sortOrder === "asc" ? 1 : -1;

    const match: any = { storeId: new mongoose.Types.ObjectId(storeId as string) };

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
      (Product as any).aggregate([
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

    return res.status(StatusCodes.OK).json(
      new ApiResponse(StatusCodes.OK, productList, "Products fetched"),
    );
  },
);

export const getCustomerList = asyncHandler(
  async (req: Request, res: Response) => {
    const { storeId } = req.params;

    const customerList = await Customer.find({ storeId });

    return res.status(StatusCodes.OK).json(
      new ApiResponse(StatusCodes.OK, customerList, "Customer details fetched"),
    );
  },
);

export const createCategory = asyncHandler(
  async (req: Request, res: Response) => {
    const { storeId } = req.params;
    const { name } = req.body;

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

    const category = await Category.create({ name, storeId: storeId as string });

    return res.status(StatusCodes.OK).json(
      new ApiResponse(StatusCodes.OK, category, "Category created"),
    );
  },
);

export const getCategoriesByStore = asyncHandler(
  async (req: Request, res: Response) => {
    const { storeId } = req.params;

    const categories = await Category.find({ storeId }).select(
      "_id name storeId",
    );

    return res.status(StatusCodes.OK).json(
      new ApiResponse(StatusCodes.OK, categories, "Categories fetched"),
    );
  },
);
