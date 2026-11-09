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

test("POST /stock-movements should decrease product stock", async () => {
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
        name: "Mouse Gamer Pro Max",
        sku: productSku,
        price: 180,
        categoryId,
      },
    });
    productId = product.id;

    const inResponse = await app.inject({
      url: "/stock-movements",
      method: "POST",
      payload: {
        productId,
        type: "IN",
        quantity: 10,
      },
    });

    assert.strictEqual(inResponse.statusCode, 201);

    const outResponse = await app.inject({
      url: "/stock-movements",
      method: "POST",
      payload: {
        productId,
        type: "OUT",
        quantity: 5,
      },
    });

    assert.strictEqual(outResponse.statusCode, 201);
    const { movement } = outResponse.json();
    assert.strictEqual(movement.type, "OUT");
    assert.strictEqual(movement.quantity, 5);
    assert.strictEqual(movement.productId, product.id);

    const updatedProduct = await app.prisma.product.findUnique({
      where: { id: product.id },
    });

    assert.ok(updatedProduct);
    assert.strictEqual(updatedProduct.quantity, 5);
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

test("POST /stock-movements should reject insufficient stock", async () => {
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
        name: "Mouse Gamer Pro Max",
        sku: productSku,
        price: 180,
        categoryId,
      },
    });
    productId = product.id;

    const inResponse = await app.inject({
      url: "/stock-movements",
      method: "POST",
      payload: {
        productId,
        type: "IN",
        quantity: 5,
      },
    });

    assert.strictEqual(inResponse.statusCode, 201);

    const outResponse = await app.inject({
      url: "/stock-movements",
      method: "POST",
      payload: {
        productId,
        type: "OUT",
        quantity: 6,
      },
    });

    assert.strictEqual(outResponse.statusCode, 409);

    const updatedProduct = await app.prisma.product.findUnique({
      where: { id: productId },
    });
    assert.ok(updatedProduct);
    assert.strictEqual(updatedProduct.quantity, 5);

    const movement = await app.prisma.stockMovement.findMany({
      where: { productId },
    });

    assert.strictEqual(movement.length, 1);
    assert.strictEqual(movement[0]?.type, "IN");
    assert.strictEqual(movement[0]?.quantity, 5);
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

test("POST /stock-movements should handle concurrent withdrawals", async () => {
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
        name: "Mouse Gamer Pro Max",
        sku: productSku,
        price: 180,
        categoryId,
      },
    });
    productId = product.id;

    const inResponse = await app.inject({
      url: "/stock-movements",
      method: "POST",
      payload: {
        productId,
        type: "IN",
        quantity: 10,
      },
    });

    assert.strictEqual(inResponse.statusCode, 201);

    const [firstResponse, secondResponse] = await Promise.all([
      app.inject({
        url: "/stock-movements",
        method: "POST",
        payload: {
          productId,
          type: "OUT",
          quantity: 7,
        },
      }),
      app.inject({
        url: "/stock-movements",
        method: "POST",
        payload: {
          productId,
          type: "OUT",
          quantity: 7,
        },
      }),
    ]);

    const statusCodes = [
      firstResponse.statusCode,
      secondResponse.statusCode,
    ].sort();

    assert.deepStrictEqual(statusCodes, [201, 409]);

    const updatedProduct = await app.prisma.product.findUnique({
      where: { id: productId },
    });

    assert.ok(updatedProduct);
    assert.strictEqual(updatedProduct.quantity, 3);

    const movement = await app.prisma.stockMovement.findMany({
      where: { productId },
    });

    assert.strictEqual(movement.length, 2);

    const inMovement = movement.find((item) => item.type === "IN");
    const outMovement = movement.find((item) => item.type === "OUT");

    assert.ok(inMovement);
    assert.ok(outMovement);

    assert.strictEqual(inMovement.quantity, 10);
    assert.strictEqual(outMovement.quantity, 7);
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
