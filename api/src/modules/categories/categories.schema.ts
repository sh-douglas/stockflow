import { Type } from "@sinclair/typebox";

const createCategoriesSchema = Type.Object({
  name: Type.String({ minLength: 1, maxLength: 100 }),
});

const categoryParamsSchema = Type.Object({
  id: Type.String({ format: "uuid" }),
});

export { createCategoriesSchema, categoryParamsSchema };
