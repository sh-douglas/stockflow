import { Type } from "@sinclair/typebox";

const createProductsSchema = Type.Object({
  name: Type.String({ minLength: 1, maxLength: 100 }),
  sku: Type.String({ minLength: 1, maxLength: 50 }),
  price: Type.Number({ exclusiveMinimum: 0 }),
  categoryId: Type.String({ format: "uuid" }),
});

export { createProductsSchema };
