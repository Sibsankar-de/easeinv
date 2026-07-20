import { prisma } from "../lib/prisma";
import { ApiError } from "../utils/apiErrorHandler";
import { StatusCodes } from "http-status-codes";
import { uploadToCloudinary } from "./cloudinary.service";
import { cloudinaryFolders } from "../constants/cloudinary.constant";
import { paginate } from "../utils/paginate";
import {
  CreateStoreDTO,
  UpdateStoreDTO,
  UpdateStoreSettingsDTO,
} from "../schemas/store.schema";
import { StoreUserRole, User } from "@prisma/client";
import {
  prismaTransaction,
  TransactionClient,
} from "../utils/transactionHandler";
import { toStoreDto, toStoreSummaryDto } from "../dto/store.dto";
import * as transactionalEmailService from "./transactionalEmail.service";

export const createStore = async (user: User, storeData: CreateStoreDTO) =>
  prismaTransaction(async (tx) => {
    const {
      name,
      type,
      addressLine,
      country,
      state,
      city,
      zipCode,
      contactEmail,
      contactNo,
      currencyCode,
    } = storeData;

    const store = await tx.store.create({
      data: {
        name,
        ownerId: user.id,
        type,
        contactEmail,
        contactNo,
        currencyCode,
        addressLine,
        city,
        state,
        zipCode,
        country,
      },
    });

    // Create StoreUser entry for owner
    await tx.storeUser.create({
      data: {
        storeId: store.id,
        userId: user.id,
        role: StoreUserRole.OWNER,
      },
    });

    // Create StoreSettings
    await tx.storeSettings.create({
      data: {
        storeId: store.id,
        invoiceStoreName: store.name,
        invoiceStoreAddress: store.addressLine,
      },
    });

    // send email to owner
    void transactionalEmailService.sendStoreCreatedEmail(user, store);

    return await getStoreByUserAndId(store.id, user.id, tx);
  });

export const updateStore = async (
  storeId: string,
  userId: string,
  updateData: UpdateStoreDTO,
  files?: {
    logo?: Express.Multer.File[];
    qrCode?: Express.Multer.File[];
  },
) =>
  prismaTransaction(async (tx) => {
    if (!updateData.name || !updateData.currencyCode) {
      throw new ApiError(
        StatusCodes.BAD_REQUEST,
        "Store name and currency is required",
      );
    }

    let logoUrl: string | undefined;
    let qrCodeUrl: string | undefined;

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

    await tx.store.update({
      where: { id: storeId },
      data: { ...updateData },
    });

    if (logoUrl || qrCodeUrl) {
      const settingsUpdate: any = {};
      if (logoUrl) settingsUpdate.invoiceStoreLogoUrl = logoUrl;
      if (qrCodeUrl) settingsUpdate.invoicePaymentQrCode = qrCodeUrl;

      await tx.storeSettings.updateMany({
        where: { storeId },
        data: settingsUpdate,
      });
    }

    return await getStoreByUserAndId(storeId, userId, tx);
  });

const getStoreByUserAndId = async (
  storeId: string,
  userId: string,
  tx: TransactionClient = prisma,
) => {
  const storeUser = await tx.storeUser.findFirst({
    where: { storeId, userId },
    include: { store: { include: { settings: true } } },
  });

  if (!storeUser || !storeUser.store) {
    throw new ApiError(StatusCodes.NOT_FOUND, "Failed to fetch store.");
  }

  return toStoreDto(storeUser.store, storeUser.role);
};

export const deleteStore = async (storeId: string) => {
  const store = await prisma.store.findUnique({ where: { id: storeId } });
  if (!store) {
    throw new ApiError(StatusCodes.NOT_FOUND, "Store not found");
  }

  // Cascade deletes are handled by Prisma schema onDelete: Cascade
  await prisma.store.delete({ where: { id: storeId } });
  return null;
};

export const updateStoreSettings = async (
  storeId: string,
  updateData: UpdateStoreSettingsDTO,
) => {
  if (!updateData) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "Data is required");
  }

  return prisma.storeSettings.update({
    where: { storeId },
    data: { ...updateData },
  });
};

export const uploadStoreLogo = async (
  storeId: string,
  file?: Express.Multer.File,
) => {
  if (!file) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "Store logo file is required");
  }

  const uploadData = await uploadToCloudinary(
    file.buffer,
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
  await prisma.storeSettings.updateMany({
    where: { storeId },
    data: { invoiceStoreLogoUrl: logoUrl },
  });

  return logoUrl;
};

export const uploadInvoicePaymentQrCode = async (
  storeId: string,
  file?: Express.Multer.File,
) => {
  if (!file) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "QR code file is required");
  }

  const uploadData = await uploadToCloudinary(
    file.buffer,
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
  await prisma.storeSettings.updateMany({
    where: { storeId },
    data: { invoicePaymentQrCode: qrCodeUrl },
  });

  return qrCodeUrl;
};

export const getStoreList = async (userId: string) => {
  const storeUsers = await prisma.storeUser.findMany({
    where: { userId },
    include: {
      store: true,
    },
  });

  return storeUsers.map((su) => toStoreSummaryDto(su.store, su.role));
};

export const getStoreDetails = async (storeId: string, userId: string) => {
  return await getStoreByUserAndId(storeId, userId);
};

export const getProductsByStore = async (params: {
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

  return paginate(
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
        orderBy: { priority: "asc" },
      },
    },
  );
};

export const createCategory = async (storeId: string, name: string) => {
  if (!name) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "Category name is required");
  }

  const existingCategory = await prisma.category.findFirst({
    where: { name: { equals: name, mode: "insensitive" }, storeId },
  });
  if (existingCategory) {
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      "Category with this name already exists",
    );
  }

  return prisma.category.create({ data: { name, storeId } });
};

export const getCategoriesByStore = async (storeId: string) => {
  return prisma.category.findMany({
    where: { storeId },
    select: { id: true, name: true, storeId: true },
  });
};
