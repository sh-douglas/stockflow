import fastifyEnv from "@fastify/env";
import type { FastifyPluginAsync } from "fastify";
import fp from "fastify-plugin";

const envPlugin: FastifyPluginAsync = async (fastify) => {
  const schema = {
    type: "object",
    required: ["DATABASE_URL"],
    properties: {
      DATABASE_URL: {
        type: "string",
        minLength: 1,
        pattern: "^postgresql://",
      },
    },
  };

  const options = {
    schema: schema,
    dotenv: true,
  };

  await fastify.register(fastifyEnv, options);
};

export default fp(envPlugin);
