import type { FastifyPluginAsync } from "fastify";
import type { HealthResponse } from "../types/api.js";

const healthRoutes: FastifyPluginAsync = async (app) => {
  app.get<{ Reply: HealthResponse }>(
    "/health",
    {
      schema: {
        tags: ["Health"],
        summary: "Health check",
        description: "Returns service liveness for load balancers and monitors.",
        response: {
          200: {
            type: "object",
            properties: {
              status: { type: "string", enum: ["ok"] },
              service: { type: "string" },
            },
            required: ["status", "service"],
          },
        },
      },
    },
    async () => ({
      status: "ok" as const,
      service: "beaverworks-api",
    }),
  );
};

export default healthRoutes;
