import test from "node:test";
import assert from "node:assert/strict";
import { buildApp } from "../src/app.js";
import { randomUUID } from "node:crypto";

test("POST /categories should create a category", async () => {
  const app = buildApp();
  const categoryName = `Test Category ${randomUUID()}`;

  try {
    const response = await app.inject({
      url: "/categories",
      method: "POST",
      payload: {
        name: categoryName,
      },
    });

    assert.strictEqual(response.statusCode, 201);
    assert.strictEqual(response.json().category.name, categoryName);
  } finally {
    await app.prisma.category.deleteMany({
      where: { name: categoryName },
    });
    await app.close();
  }
});

test("POST /categories should reject duplicate names", async () => {
  const app = buildApp();
  const categoryName = `Test Category ${randomUUID()}`;

  try {
    await app.ready();
    await app.prisma.category.create({
      data: { name: categoryName },
    });

    const response = await app.inject({
      url: "/categories",
      method: "POST",
      payload: {
        name: categoryName,
      },
    });

    assert.strictEqual(response.statusCode, 409);
  } finally {
    await app.prisma.category.deleteMany({
      where: { name: categoryName },
    });
    await app.close();
  }
});

test("PATCH /categories/:id should update category name", async () => {
  const app = buildApp();
  const categoryName = `Test Category ${randomUUID()}`;
  const updatedName = `Updated Category ${randomUUID()}`;
  let categoryId: string | undefined;

  try {
    await app.ready();
    const category = await app.prisma.category.create({
      data: { name: categoryName },
    });

    categoryId = category.id;

    const response = await app.inject({
      url: `/categories/${category.id}`,
      method: "PATCH",
      payload: {
        name: updatedName,
      },
    });

    assert.strictEqual(response.statusCode, 200);
    assert.strictEqual(response.json().category.name, updatedName);

    const updatedCategory = await app.prisma.category.findUnique({
      where: { id: category.id },
    });

    assert.ok(updatedCategory);
    assert.strictEqual(updatedCategory.name, updatedName);
  } finally {
    if (categoryId !== undefined) {
      await app.prisma.category.deleteMany({
        where: { id: categoryId },
      });
    }
    await app.close();
  }
});

test("DELETE /categories/:id should reject deletion with associated products", async () => {
  const app = buildApp();
  const categoryName = `Test Category ${randomUUID()}`;
  const productSku = randomUUID();

  let productId: string | undefined;
  let categoryId: string | undefined;

  try {
    await app.ready();
    const category = await app.prisma.category.create({
      data: { name: categoryName },
    });

    categoryId = category.id;

    const product = await app.prisma.product.create({
      data: {
        name: "Mouse Gamer",
        price: 179.9,
        sku: productSku,
        categoryId: category.id,
      },
    });

    productId = product.id;

    const response = await app.inject({
      url: `/categories/${category.id}`,
      method: "DELETE",
    });

    assert.strictEqual(response.statusCode, 409);

    const existingCategory = await app.prisma.category.findUnique({
      where: { id: category.id },
    });

    assert.ok(existingCategory);
  } finally {
    if (productId !== undefined) {
      await app.prisma.product.deleteMany({
        where: { id: productId },
      });
    }

    if (categoryId !== undefined) {
      await app.prisma.category.deleteMany({
        where: { id: categoryId },
      });
    }

    await app.close();
  }
});
