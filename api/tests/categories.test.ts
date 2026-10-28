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
