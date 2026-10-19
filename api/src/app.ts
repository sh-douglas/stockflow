import fastify from "fastify";

export function buildApp() {
  const app = fastify({
    logger: true,
  });

  app.get("/health", (request, reply) => {
    return { status: "ok" };
  });

  return app;
}
