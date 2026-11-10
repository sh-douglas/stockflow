import fastify from "fastify";
import cors from "@fastify/cors";
import envPlugin from "./plugins/env.plugin.js";
import prismaPlugin from "./plugins/prisma.plugin.js";
import { errorHandler } from "./shared/errors/error-handler.js";
import { categoriesRoutes } from "./modules/categories/categories.routes.js";
import { productsRoutes } from "./modules/products/products.routes.js";
import { stockMovementsRoutes } from "./modules/stock-movements/stock-movements.routes.js";

export function buildApp() {
  const app = fastify({
    logger: true,
  });

  app.setErrorHandler(errorHandler);

  app.register(envPlugin);
  app.register(prismaPlugin);
  app.register(cors, {
    origin: ["http://localhost:5173"],
    methods: ["GET", "HEAD", "POST", "PATCH", "DELETE"],
  });

  app.register(categoriesRoutes, { prefix: "/categories" });
  app.register(productsRoutes, { prefix: "/products" });
  app.register(stockMovementsRoutes, { prefix: "/stock-movements" });

  app.get("/health", (request, reply) => {
    return { status: "ok" };
  });

  return app;
}
