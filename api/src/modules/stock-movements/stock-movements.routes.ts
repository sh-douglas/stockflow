import type { TypeBoxTypeProvider } from "@fastify/type-provider-typebox";
import type { FastifyPluginAsync } from "fastify";
import {
  createStockMovementSchema,
  listStockMovementsSchema,
} from "./stock-movements.schema.js";
import {
  createStockMovementService,
  listStockMovementsService,
} from "./stock-movements.service.js";
import { request } from "node:http";

const stockMovementsRoutes: FastifyPluginAsync = async (fastify) => {
  const app = fastify.withTypeProvider<TypeBoxTypeProvider>();

  app.post(
    "/",
    {
      schema: { body: createStockMovementSchema },
    },
    async (request, reply) => {
      const movement = await createStockMovementService(
        fastify.prisma,
        request.body,
      );

      return reply.code(201).send({ movement });
    },
  );

  app.get(
    "/",
    {
      schema: { querystring: listStockMovementsSchema },
    },
    async (request, reply) => {
      const movements = await listStockMovementsService(
        fastify.prisma,
        request.query.productId,
      );

      return reply.code(200).send({ movements });
    },
  );
};

export { stockMovementsRoutes };
