import fastify from "fastify";
import envPlugin from "./plugins/env.plugin.js";
import prismaPlugin from "./plugins/prisma.plugin.js";
import { errorHandler } from "./shared/errors/error-handler.js";
import { categoriesRoutes } from "./modules/categories/categories.routes.js";
import { productsRoutes } from "./modules/products/products.routes.js";

export function buildApp() {
  const app = fastify({
    logger: true,
  });

  app.setErrorHandler(errorHandler);

  app.register(envPlugin);
  app.register(prismaPlugin);

  app.register(categoriesRoutes, { prefix: "/categories" });
  app.register(productsRoutes, { prefix: "/products" });

  app.get("/health", (request, reply) => {
    return { status: "ok" };
  });

  return app;
}
