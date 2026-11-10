import test from "node:test";
import assert from "node:assert/strict";
import { buildApp } from "../src/app.js";

test("GET /health returns 200", async () => {
  const app = buildApp();

  try {
    const response = await app.inject({
      url: "/health",
      method: "GET",
      headers: {
        origin: "http://localhost:5173",
      },
    });

    assert.strictEqual(response.statusCode, 200);
    assert.strictEqual(
      response.headers["access-control-allow-origin"],
      "http://localhost:5173",
    );
  } finally {
    await app.close();
  }
});

test("GET /health should not allow unauthorized origin", async () => {
  const app = buildApp();

  try {
    const response = await app.inject({
      url: "/health",
      method: "GET",
      headers: {
        origin: "http://localhost:3000",
      },
    });

    assert.strictEqual(response.statusCode, 200);
    assert.strictEqual(
      response.headers["access-control-allow-origin"],
      undefined,
    );
  } finally {
    await app.close();
  }
});
