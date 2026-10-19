import "fastify";
import type { PrismaClient } from "../generated/prisma/client.js";

declare module "fastify" {
  interface FastifyInstance {
    config: {
      DATABASE_URL: string;
    };
    prisma: PrismaClient;
  }
}
