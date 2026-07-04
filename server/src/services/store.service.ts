import mongoose from "mongoose";
import { Store } from "../models/store.model";
import { StoreSettings } from "../models/storeSettings.model";
import { StoreUser } from "../models/storeUser.model";
import { Product } from "../models/product.model";
import { Customer } from "../models/customer.model";
import { Category } from "../models/category.model";
import { ApiError } from "../utils/ApiError";
import { StatusCodes } from "http-status-codes";
import { uploadToCloudinary } from "./cloudinary.service";
import { cloudinaryFolders } from "../constants/cloudinary.constant";
import { userRoles } from "../enums/store.enum";
import {
  CreateStoreDTO,
  UpdateStoreDTO,
  UpdateStoreSettingsDTO,
} from "../schemas/store.schema";

export const populateStoreSettings = async (store: any) => {
  if (!store.settingsId) return store.toObject();
  const storeSettings = await StoreSettings.findById(store.settingsId);
  return { ...store.toObject(), storeSettings };
};

export const createStore = async (
  userId: string | mongoose.Types.ObjectId,
  storeData: CreateStoreDTO,
) => {
  const { name, businessType, address, contactEmail, contactNo, currencyCode } =
    storeData;

  if (!name || !currencyCode) {
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      "Store name and currency is required.",
    );
  }

  const store = await Store.create({
    name,
    owner: userId,
    businessType,
    address,
    contactEmail,
    contactNo,
    currencyCode,
  });

  await StoreUser.create({
    storeId: store._id,
    userId,
    role: userRoles.OWNER,
  });

  const storeSettings = await StoreSettings.create({
    storeId: store._id,
    invoiceStoreName: store.name,
    invoiceStoreAddress: store.address,
  });

  store.settingsId = storeSettings._id as mongoose.Types.ObjectId;
  await store.save();

  return store;
};

export const updateStore = async (
  storeId: string,
  updateData: UpdateStoreDTO,
  files?: {
    logo?: Express.Multer.File[];
    qrCode?: Express.Multer.File[];
  },
) => {
  if (!updateData.name || !updateData.currencyCode) {
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      "Store name and currency is required",
    );
  }

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

    await StoreSettings.findOneAndUpdate({ storeId }, { $set: settingsUpdate });
  }

  return updatedStore;
};

export const deleteStore = async (storeId: string) => {
  const store = await Store.findById(storeId);
  if (!store) {
    throw new ApiError(StatusCodes.NOT_FOUND, "Store not found");
  }

  await Promise.all([
    Store.findByIdAndDelete(storeId),
    StoreUser.deleteMany({ storeId }),
    StoreSettings.deleteMany({ storeId }),
    Product.deleteMany({ storeId }),
    Customer.deleteMany({ storeId }),
    Category.deleteMany({ storeId }),
  ]);

  return null;
};

export const updateStoreSettings = async (
  storeId: string,
  updateData: UpdateStoreSettingsDTO,
) => {
  if (!updateData) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "Data is required");
  }

  const updatedStoreSettings = await StoreSettings.findOneAndUpdate(
    { storeId },
    {
      $set: {
        ...updateData,
      },
    },
    { new: true },
  );

  return updatedStoreSettings;
};

export const uploadStoreLogo = async (
  storeId: string,
  file?: Express.Multer.File,
) => {
  if (!file) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "Store logo file is required");
  }

  const buffer = file.buffer;
  const uploadData = await uploadToCloudinary(
    buffer,
    file.originalname,
    cloudinaryFolders.STORE_LOGO,
  );

  if (!uploadData) {
    throw new ApiError(
      StatusCodes.INTERNAL_SERVER_ERROR,
      "Failed to upload logo",
    );
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

  return logoUrl;
};

export const uploadInvoicePaymentQrCode = async (
  storeId: string,
  file?: Express.Multer.File,
) => {
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
    throw new ApiError(
      StatusCodes.INTERNAL_SERVER_ERROR,
      "Failed to upload QR code",
    );
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

  return qrCodeUrl;
};

export const getStoreList = async (
  userId: string | mongoose.Types.ObjectId,
) => {
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

  return storeList;
};

export const getStoreDetails = async (storeId: string) => {
  const store = await Store.findById(storeId).select("-accessList");

  if (!store) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "Failed to get store");
  }

  return populateStoreSettings(store);
};

export const getProductsByStore = async (params: {
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

export const createCategory = async (storeId: string, name: string) => {
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

  const category = await Category.create({
    name,
    storeId,
  });

  return category;
};

export const getCategoriesByStore = async (storeId: string) => {
  const categories = await Category.find({ storeId }).select(
    "_id name storeId",
  );
  return categories;
};
