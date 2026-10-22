import type { TypeBoxTypeProvider } from "@fastify/type-provider-typebox";
import type { FastifyPluginAsync } from "fastify";
import {
  createProductsSchema,
  productParamsSchema,
  updateProductSchema,
} from "./products.schema.js";
import {
  createProductService,
  deleteProductService,
  getProductById,
  listProductsService,
  updateProductService,
} from "./products.service.js";

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

  app.get("/", async (request, reply) => {
    const products = await listProductsService(fastify.prisma);

    return reply.code(200).send({ products });
  });

  app.get(
    "/:id",
    {
      schema: {
        params: productParamsSchema,
      },
    },
    async (request, reply) => {
      const product = await getProductById(fastify.prisma, request.params.id);

      return reply.code(200).send({ product });
    },
  );

  app.patch(
    "/:id",
    {
      schema: {
        body: updateProductSchema,
        params: productParamsSchema,
      },
    },
    async (request, reply) => {
      const updatedProduct = await updateProductService(
        fastify.prisma,
        request.params.id,
        request.body,
      );

      return reply.code(200).send({ product: updatedProduct });
    },
  );

  app.delete(
    "/:id",
    {
      schema: {
        params: productParamsSchema,
      },
    },
    async (request, reply) => {
      await deleteProductService(fastify.prisma, request.params.id);

      return reply.code(204).send();
    },
  );
};

export { productsRoutes };
