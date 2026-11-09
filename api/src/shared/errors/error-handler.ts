import type { FastifyError, FastifyRequest, FastifyReply } from "fastify";
import { AppError } from "./app-error.js";
import { Prisma } from "../../generated/prisma/client.js";

export function errorHandler(
  error: FastifyError,
  request: FastifyRequest,
  reply: FastifyReply,
) {
  if (error instanceof AppError) {
    return reply.code(error.statusCode).send({
      message: error.message,
    });
  }

  if (error.validation) {
    return reply.code(400).send({
      message: "Validation error",
    });
  }

  if (error.statusCode && error.statusCode >= 400 && error.statusCode < 500) {
    return reply.code(error.statusCode).send({
      message: error.message,
    });
  }

  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    if (error.code === "P2002") {
      return reply.code(409).send({
        message: "Resource already exists.",
      });
    }

    if (error.code === "P2003") {
      return reply.code(409).send({
        message: "Operation violates a foreign key constraint.",
      });
    }

    if (error.code === "P2025") {
      return reply.code(404).send({
        message: "Resource not found.",
      });
    }
  }

  request.log.error(error);
  return reply.code(500).send({
    message: "Internal server error.",
  });
}
