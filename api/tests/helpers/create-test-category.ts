import { randomUUID } from "node:crypto";
import type { PrismaClient } from "../../src/generated/prisma/client.js";

export async function createTestCategory(prisma: PrismaClient) {
  const categoryName = `Test Category: ${randomUUID()}`;
  const category = await prisma.category.create({
    data: { name: categoryName },
  });

  return category;
}
