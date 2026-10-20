import type { TypeBoxTypeProvider } from "@fastify/type-provider-typebox";
import type { FastifyPluginAsync } from "fastify";
import { createProductsSchema } from "./products.schema.js";
import { createProductService } from "./products.service.js";

const productsRoutes: FastifyPluginAsync = async (fastify) => {
  const app = fastify.withTypeProvider<TypeBoxTypeProvider>();

  app.post(
    "/",
    {
      schema: {
        body: createProductsSchema,
      },
    },
    async (request, reply) => {
      const product = await createProductService(fastify.prisma, request.body);

      return reply.code(201).send({ product });
    },
  );
};

export { productsRoutes };
