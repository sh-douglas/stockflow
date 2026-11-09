import test from "node:test";
import assert from "node:assert/strict";
import { buildApp } from "../src/app.js";
import { AppError } from "../src/shared/errors/app-error.js";
import { Prisma } from "../src/generated/prisma/client.js";

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

test("GET /test-prisma-error should return 409 for Prisma P2002", async () => {
  const app = buildApp();

  app.get("/test-prisma-error", () => {
    throw new Prisma.PrismaClientKnownRequestError(
      "Unique constraint failed.",
      {
        code: "P2002",
        clientVersion: "7.10.1",
      },
    );
  });

  try {
    const response = await app.inject({
      method: "GET",
      url: "/test-prisma-error",
    });

    assert.strictEqual(response.statusCode, 409);
    assert.deepStrictEqual(response.json(), {
      message: "Resource already exists.",
    });
  } finally {
    await app.close();
  }
});

test("GET /test-prisma-foreign-key-error should return 409 for Prisma P2003", async () => {
  const app = buildApp();

  app.get("/test-prisma-foreign-key-error", () => {
    throw new Prisma.PrismaClientKnownRequestError(
      "Foreign key constraint failed",
      {
        code: "P2003",
        clientVersion: "7.10.1",
      },
    );
  });

  try {
    const response = await app.inject({
      method: "GET",
      url: "/test-prisma-foreign-key-error",
    });

    assert.strictEqual(response.statusCode, 409);
    assert.deepStrictEqual(response.json(), {
      message: "Operation violates a foreign key constraint.",
    });
  } finally {
    await app.close();
  }
});

test("GET /test-prisma-not-found-error should return 404 for Prisma P2025", async () => {
  const app = buildApp();

  app.get("/test-prisma-not-found-error", () => {
    throw new Prisma.PrismaClientKnownRequestError(
      "Failed to found resource.",
      {
        code: "P2025",
        clientVersion: "7.10.1",
      },
    );
  });

  try {
    const response = await app.inject({
      method: "GET",
      url: "/test-prisma-not-found-error",
    });

    assert.strictEqual(response.statusCode, 404);
    assert.deepStrictEqual(response.json(), {
      message: "Resource not found.",
    });
  } finally {
    await app.close();
  }
});
