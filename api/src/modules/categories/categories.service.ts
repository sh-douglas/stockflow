import type { PrismaClient } from "../../generated/prisma/client.js";
import { AppError } from "../../shared/errors/app-error.js";

async function createCategoryService(prisma: PrismaClient, name: string) {
  const normalizedName = name.trim();

  if (normalizedName === "") {
    throw new AppError("The name field cannot be empty.", 400);
  }

  const category = await prisma.category.findUnique({
    where: { name: normalizedName },
  });

  if (category) {
    throw new AppError("This category already registered.", 409);
  }

  const newCategory = await prisma.category.create({
    data: { name: normalizedName },
  });

  return newCategory;
}

async function listCategoriesService(prisma: PrismaClient) {
  return prisma.category.findMany({
    orderBy: {
      name: "asc",
    },
  });
}

async function getCategoryById(prisma: PrismaClient, id: string) {
  const category = await prisma.category.findUnique({
    where: { id },
  });

  if (!category) {
    throw new AppError("Category not found.", 404);
  }

  return category;
}

async function updateCategoryService(
  prisma: PrismaClient,
  id: string,
  name: string,
) {
  const normalizedName = name.trim();

  if (normalizedName === "") {
    throw new AppError("The name field cannot be empty.", 400);
  }

  const category = await prisma.category.findUnique({
    where: { id },
  });

  if (!category) {
    throw new AppError("Category not found.", 404);
  }

  if (normalizedName === category.name) {
    return category;
  }

  const existingCategory = await prisma.category.findUnique({
    where: { name: normalizedName },
  });

  if (existingCategory && existingCategory.id !== id) {
    throw new AppError("This category already registered.", 409);
  }

  const updatedCategory = await prisma.category.update({
    where: { id },
    data: { name: normalizedName },
  });

  return updatedCategory;
}

async function deleteCategoryService(prisma: PrismaClient, id: string) {
  const category = await prisma.category.findUnique({ where: { id } });

  if (!category) {
    throw new AppError("Category not found.", 404);
  }

  const product = await prisma.product.findFirst({
    where: { categoryId: id },
  });

  if (product) {
    throw new AppError(
      "Cannot delete a category with associated products.",
      409,
    );
  }

  return prisma.category.delete({ where: { id } });
}

export {
  createCategoryService,
  listCategoriesService,
  getCategoryById,
  updateCategoryService,
  deleteCategoryService,
};
