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

export { createCategoryService };
