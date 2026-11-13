import type { Static } from "@sinclair/typebox";
import type { PrismaClient } from "../../generated/prisma/client.js";
import type { createStockMovementSchema } from "./stock-movements.schema.js";
import { AppError } from "../../shared/errors/app-error.js";

type CreateStockMovementInput = Static<typeof createStockMovementSchema>;

async function createStockMovementService(
  prisma: PrismaClient,
  data: CreateStockMovementInput,
) {
  const product = await prisma.product.findUnique({
    where: { id: data.productId },
  });

  if (!product) {
    throw new AppError("Product not found.", 404);
  }

  return prisma.$transaction(async (tx) => {
    if (data.type === "IN") {
      await tx.product.update({
        where: {
          id: data.productId,
        },
        data: {
          quantity: {
            increment: data.quantity,
          },
        },
      });
    }

    if (data.type === "OUT") {
      const result = await tx.product.updateMany({
        where: {
          id: data.productId,
          quantity: {
            gte: data.quantity,
          },
        },
        data: {
          quantity: {
            decrement: data.quantity,
          },
        },
      });

      if (result.count === 0) {
        throw new AppError("Insufficient stock.", 409);
      }
    }

    return tx.stockMovement.create({
      data: {
        productId: data.productId,
        type: data.type,
        quantity: data.quantity,
      },
    });
  });
}

async function listStockMovementsService(
  prisma: PrismaClient,
  productId: string | undefined,
) {
  return prisma.stockMovement.findMany({
    where: productId ? { productId } : {},
    orderBy: {
      createdAt: "desc",
    },
  });
}

export { createStockMovementService, listStockMovementsService };
