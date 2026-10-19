import test from "node:test";
import assert from "node:assert/strict";
import { buildApp } from "../src/app.js";
import { AppError } from "../src/shared/errors/app-error.js";

test("GET /test-error returns 404", async () => {
  const app = buildApp();

  app.get("/test-error", () => {
    throw new AppError("Product not found", 404);
  });

  try {
    const response = await app.inject({
      method: "GET",
      url: "/test-error",
    });

    assert.strictEqual(response.statusCode, 404);
    assert.deepStrictEqual(response.json(), { message: "Product not found" });
  } finally {
    await app.close();
  }
});
