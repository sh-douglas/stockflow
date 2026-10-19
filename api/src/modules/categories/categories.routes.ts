import type { TypeBoxTypeProvider } from "@fastify/type-provider-typebox";
import type { FastifyPluginAsync } from "fastify";
import { createCategoriesSchema } from "./categories.schema.js";
import { createCategoryService } from "./categories.service.js";

const categoriesRoutes: FastifyPluginAsync = async (fastify) => {
  const app = fastify.withTypeProvider<TypeBoxTypeProvider>();

  app.post(
    "/",
    {
      schema: { body: createCategoriesSchema },
    },
    async (request, reply) => {
      const category = await createCategoryService(
        fastify.prisma,
        request.body.name,
      );
      return reply.code(201).send({ category });
    },
  );
};

export { categoriesRoutes };
