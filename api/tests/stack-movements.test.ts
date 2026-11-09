import test from "node:test";
import assert from "node:assert/strict";
import { buildApp } from "../src/app.js";
import { randomUUID } from "node:crypto";
import { createTestCategory } from "./helpers/create-test-category.js";

test("POST /stock-movements should increase product stock", async () => {
  const app = buildApp();
  const productSku = randomUUID();

  let categoryId: string | undefined;
  let productId: string | undefined;

  try {
    await app.ready();

    const category = await createTestCategory(app.prisma);
    categoryId = category.id;

    const product = await app.prisma.product.create({
      data: {
        name: "Mouse Gamer",
        sku: productSku,
        price: 179.9,
        categoryId,
      },
    });
    productId = product.id;

    const response = await app.inject({
      url: "/stock-movements",
      method: "POST",
      payload: {
        productId,
        type: "IN",
        quantity: 10,
      },
    });

    assert.strictEqual(response.statusCode, 201);

    const { movement } = response.json();

    assert.strictEqual(movement.type, "IN");
    assert.strictEqual(movement.quantity, 10);
    assert.strictEqual(movement.productId, product.id);

    const updatedProduct = await app.prisma.product.findUnique({
      where: { id: product.id },
    });

    assert.ok(updatedProduct);
    assert.strictEqual(updatedProduct.quantity, 10);
  } finally {
    try {
      if (productId !== undefined) {
        await app.prisma.stockMovement.deleteMany({
          where: { productId },
        });
      }

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
