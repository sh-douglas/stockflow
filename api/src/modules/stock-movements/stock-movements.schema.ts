import { Type } from "@sinclair/typebox";
import { MovementType } from "../../generated/prisma/enums.js";

export const createStockMovementSchema = Type.Object({
  productId: Type.String({ format: "uuid" }),
  type: Type.Enum(MovementType),
  quantity: Type.Integer({ exclusiveMinimum: 0 }),
});

export const listStockMovementsSchema = Type.Object({
  productId: Type.String({ format: "uuid" }),
});
