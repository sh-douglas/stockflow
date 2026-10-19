import type { FastifyError, FastifyRequest, FastifyReply } from "fastify";
import { AppError } from "./app-error.js";

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

  request.log.error(error);

  return reply.code(500).send({
    message: "Internal server error.",
  });
}
