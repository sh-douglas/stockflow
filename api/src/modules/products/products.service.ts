import type { Static } from "@sinclair/typebox";
import { Prisma, type PrismaClient } from "../../generated/prisma/client.js";
import { createProductsSchema } from "./products.schema.js";
import { AppError } from "../../shared/errors/app-error.js";

type CreateProductInput = Static<typeof createProductsSchema>;

async function createProductService(
  prisma: PrismaClient,
  data: CreateProductInput,
) {
  const normalizedName = data.name.trim();
  const normalizedSku = data.sku.trim();

  if (normalizedName === "" || normalizedSku === "") {
    throw new AppError("This field cannot be empty.", 400);
  }

  const registeredProduct = await prisma.product.findUnique({
    where: {
      sku: normalizedSku,
    },
  });

  if (registeredProduct) {
    throw new AppError("This SKU already registered.", 409);
  }

  const category = await prisma.category.findUnique({
    where: { id: data.categoryId },
  });

  if (!category) {
    throw new AppError("Category not found.", 404);
  }

  const price = new Prisma.Decimal(data.price.toString());
  const decimalPlaces = price.decimalPlaces();

  if (decimalPlaces > 2) {
    throw new AppError("Price cannot have more than two decimal places.", 400);
  }

  if (price.greaterThan("99999999.99")) {
    throw new AppError("Price cannot exceed 99,999,999.99.", 400);
  }

  const newProductData = {
    name: normalizedName,
    sku: normalizedSku,
    price,
    categoryId: data.categoryId,
  };

  const newProduct = await prisma.product.create({
    data: newProductData,
  });

  return newProduct;
}

export { createProductService };
