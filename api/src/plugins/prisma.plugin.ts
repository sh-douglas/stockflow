import fp from "fastify-plugin";
import type { FastifyPluginAsync } from "fastify";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../generated/prisma/client.js";

const prismaPlugin: FastifyPluginAsync = async (fastify) => {
  const adapter = new PrismaPg({
    connectionString: fastify.config.DATABASE_URL,
  });

  const prisma = new PrismaClient({ adapter });

  fastify.decorate("prisma", prisma);

  fastify.addHook("onClose", async () => {
    await prisma.$disconnect();
  });
};

export default fp(prismaPlugin);
