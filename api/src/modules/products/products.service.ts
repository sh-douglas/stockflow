import type { Static } from "@sinclair/typebox";
import { Prisma, type PrismaClient } from "../../generated/prisma/client.js";
import {
  createProductsSchema,
  updateProductSchema,
} from "./products.schema.js";
import { AppError } from "../../shared/errors/app-error.js";

type CreateProductInput = Static<typeof createProductsSchema>;
type UpdateProductInput = Static<typeof updateProductSchema>;

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

async function listProductsService(prisma: PrismaClient) {
  return prisma.product.findMany({
    select: {
      id: true,
      name: true,
      price: true,
      sku: true,
      quantity: true,
      categoryId: true,
      createdAt: true,
      updatedAt: true,
      category: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  });
}

async function getProductById(prisma: PrismaClient, id: string) {
  const product = await prisma.product.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      price: true,
      sku: true,
      quantity: true,
      categoryId: true,
      createdAt: true,
      updatedAt: true,
      category: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  });

  if (!product) {
    throw new AppError("Product not found.", 404);
  }

  return product;
}

async function updateProductService(
  prisma: PrismaClient,
  id: string,
  data: UpdateProductInput,
) {
  const product = await prisma.product.findUnique({
    where: { id },
  });

  let normalizedName: string | undefined;
  let normalizedSku: string | undefined;
  let price: Prisma.Decimal | undefined;
  let categoryId: string | undefined;

  if (!product) {
    throw new AppError("Product not found.", 404);
  }

  if (data.name !== undefined) {
    normalizedName = data.name.trim();
  }

  if (data.sku !== undefined) {
    normalizedSku = data.sku.trim();
  }

  if (normalizedName === "") {
    throw new AppError("Product name cannot be empty.", 400);
  }

  if (normalizedSku === "") {
    throw new AppError("Product SKU cannot be empty.", 400);
  }

  if (normalizedSku !== undefined && normalizedSku !== product.sku) {
    const productSku = await prisma.product.findUnique({
      where: { sku: normalizedSku },
    });

    if (productSku) {
      throw new AppError("This SKU already registered.", 409);
    }
  }

  if (data.price !== undefined) {
    price = new Prisma.Decimal(data.price.toString());
    const decimalPlaces = price.decimalPlaces();

    if (decimalPlaces > 2) {
      throw new AppError(
        "Price cannot have more than two decimal places.",
        400,
      );
    }

    if (price.greaterThan("99999999.99")) {
      throw new AppError("Price cannot exceed 99,999,999.99.", 400);
    }
  }

  if (categoryId !== undefined) {
    const category = await prisma.category.findUnique({
      where: { id: categoryId },
    });

    if (!category) {
      throw new AppError("Category not found.", 404);
    }
  }

  const updateProductData = {
    ...(normalizedName !== undefined && { name: normalizedName }),
    ...(normalizedSku !== undefined && { sku: normalizedSku }),
    ...(price !== undefined && { price }),
    ...(categoryId !== undefined && { categoryId }),
  };

  const updatedProduct = await prisma.product.update({
    where: { id },
    data: updateProductData,
  });

  return updatedProduct;
}

async function deleteProductService(prisma: PrismaClient, id: string) {
  const product = await prisma.product.findUnique({ where: { id } });

  if (!product) {
    throw new AppError("Product not found.", 404);
  }

  const movement = await prisma.stockMovement.findFirst({
    where: { productId: product.id },
  });

  if (movement) {
    throw new AppError("Cannot delete a product with stock movements.", 409);
  }

  return prisma.product.delete({ where: { id } });
}

export {
  createProductService,
  listProductsService,
  getProductById,
  updateProductService,
  deleteProductService,
};
