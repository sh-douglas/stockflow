import fastify from "fastify";
import envPlugin from "./plugins/env.plugin.js";

export function buildApp() {
  const app = fastify({
    logger: true,
  });

  app.register(envPlugin);

  app.get("/health", (request, reply) => {
    return { status: "ok" };
  });

  return app;
}
