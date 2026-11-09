import test from "node:test";
import assert from "node:assert/strict";
import { buildApp } from "../src/app.js";
import { randomUUID } from "node:crypto";
import { createTestCategory } from "./helpers/create-test-category.js";

test("POST /products should create a product", async () => {
  const app = buildApp();
  const productSku = randomUUID();

  let categoryId: string | undefined;

  try {
    await app.ready();
    const category = await createTestCategory(app.prisma);
    categoryId = category.id;

    const response = await app.inject({
      url: "/products",
      method: "POST",
      payload: {
        name: "Mouse Gamer",
        sku: productSku,
        price: 179.9,
        categoryId,
      },
    });

    assert.strictEqual(response.statusCode, 201);

    const { product } = response.json();
    assert.strictEqual(product.name, "Mouse Gamer");
    assert.strictEqual(product.sku, productSku);
    assert.strictEqual(product.categoryId, categoryId);
    assert.strictEqual(product.quantity, 0);
    assert.strictEqual(product.price, "179.9");
  } finally {
    try {
      await app.prisma.product.deleteMany({
        where: { sku: productSku },
      });

      if (categoryId !== undefined) {
        await app.prisma.category.deleteMany({
          where: { id: categoryId },
        });
      }
    } finally {
      await app.close();
    }
  }
});

test("POST /products should reject duplicate SKU", async () => {
  const app = buildApp();
  const productSku = randomUUID();

  let categoryId: string | undefined;

  try {
    await app.ready();
    const category = await createTestCategory(app.prisma);
    categoryId = category.id;

    await app.prisma.product.create({
      data: {
        name: "Mouse Gamer",
        sku: productSku,
        price: 179.9,
        categoryId,
      },
    });

    const response = await app.inject({
      url: "/products",
      method: "POST",
      payload: {
        name: "Mouse Gamer Pro",
        sku: productSku,
        price: 179.9,
        categoryId,
      },
    });

    assert.strictEqual(response.statusCode, 409);

    const count = await app.prisma.product.count({
      where: { sku: productSku },
    });

    assert.strictEqual(count, 1);
  } finally {
    await app.prisma.product.deleteMany({
      where: { sku: productSku },
    });

    if (categoryId !== undefined) {
      await app.prisma.category.deleteMany({
        where: { id: categoryId },
      });
    }

    await app.close();
  }
});
