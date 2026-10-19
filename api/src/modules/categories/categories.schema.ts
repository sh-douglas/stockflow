import { Type } from "@sinclair/typebox";

const createCategoriesSchema = Type.Object({
  name: Type.String({ minLength: 1, maxLength: 100 }),
});

export { createCategoriesSchema };
