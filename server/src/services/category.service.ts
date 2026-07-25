import { StatusCodes } from "http-status-codes";
import { ApiError } from "../utils/apiErrorHandler";
import { prisma } from "../lib/prisma";

export const createCategory = async (storeId: string, name: string) => {
  if (!name) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "Category name is required");
  }

  const existingCategory = await prisma.category.findFirst({
    where: { storeId, name: { equals: name, mode: "insensitive" } },
  });
  if (existingCategory) {
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      "Category with this name already exists",
    );
  }

  const newCategory = prisma.category.create({ data: { name, storeId } });

  if (!newCategory) {
    throw new ApiError(
      StatusCodes.INTERNAL_SERVER_ERROR,
      "Failed to create category.",
    );
  }

  return newCategory;
};

export const getCategoriesByStore = async (storeId: string) => {
  return prisma.category.findMany({
    where: { storeId },
  });
};
