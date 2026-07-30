import { StatusCodes } from "http-status-codes";
import { ApiError } from "../utils/apiErrorHandler";
import { prisma } from "../lib/prisma";
import { CategoryDto, toCategoryDto } from "../dto/category.dto";

export const createCategory = async (
  storeId: string,
  name: string,
): Promise<CategoryDto> => {
  const existingCategory = await prisma.category.findFirst({
    where: { storeId, name: { equals: name, mode: "insensitive" } },
  });
  if (existingCategory) {
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      "Category with this name already exists",
    );
  }

  const newCategory = await prisma.category.create({
    data: { name, storeId },
  });

  if (!newCategory) {
    throw new ApiError(
      StatusCodes.INTERNAL_SERVER_ERROR,
      "Failed to create category.",
    );
  }

  return toCategoryDto(newCategory);
};

export const getCategoriesByStore = async (
  storeId: string,
): Promise<CategoryDto[]> => {
  const categories = await prisma.category.findMany({
    where: { storeId },
  });
  return categories.map(toCategoryDto);
};

export const updateCategory = async (
  storeId: string,
  categoryId: string,
  name: string,
): Promise<CategoryDto> => {
  const existingCategory = await prisma.category.findFirst({
    where: { id: categoryId, storeId },
  });

  if (!existingCategory) {
    throw new ApiError(StatusCodes.NOT_FOUND, "Category not found");
  }

  const duplicateCategory = await prisma.category.findFirst({
    where: {
      storeId,
      name: { equals: name, mode: "insensitive" },
      id: { not: categoryId },
    },
  });

  if (duplicateCategory) {
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      "Category with this name already exists",
    );
  }

  const updatedCategory = await prisma.category.update({
    where: { id: categoryId },
    data: { name },
  });

  return toCategoryDto(updatedCategory);
};

export const deleteCategory = async (
  storeId: string,
  categoryId: string,
): Promise<{ id: string }> => {
  const existingCategory = await prisma.category.findFirst({
    where: { id: categoryId, storeId },
  });

  if (!existingCategory) {
    throw new ApiError(StatusCodes.NOT_FOUND, "Category not found");
  }

  await prisma.category.delete({
    where: { id: categoryId },
  });

  return { id: categoryId };
};
