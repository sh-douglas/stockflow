import type { TypeBoxTypeProvider } from "@fastify/type-provider-typebox";
import type { FastifyPluginAsync } from "fastify";
import {
  categoryParamsSchema,
  createCategoriesSchema,
} from "./categories.schema.js";
import {
  createCategoryService,
  deleteCategoryService,
  getCategoryById,
  listCategoriesService,
  updateCategoryService,
} from "./categories.service.js";

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

  app.get("/", async (request, reply) => {
    const categories = await listCategoriesService(fastify.prisma);

    return reply.code(200).send({ categories });
  });

  app.get(
    "/:id",
    {
      schema: {
        params: categoryParamsSchema,
      },
    },
    async (request, reply) => {
      const category = await getCategoryById(fastify.prisma, request.params.id);

      return reply.code(200).send({ category });
    },
  );

  app.patch(
    "/:id",
    {
      schema: {
        params: categoryParamsSchema,
        body: createCategoriesSchema,
      },
    },
    async (request, reply) => {
      const updatedCategory = await updateCategoryService(
        fastify.prisma,
        request.params.id,
        request.body.name,
      );

      return reply.code(200).send({ category: updatedCategory });
    },
  );

  app.delete(
    "/:id",
    {
      schema: {
        params: categoryParamsSchema,
      },
    },
    async (request, reply) => {
      await deleteCategoryService(fastify.prisma, request.params.id);

      return reply.code(204).send();
    },
  );
};

export { categoriesRoutes };
