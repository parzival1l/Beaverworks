import type { FastifyPluginAsync } from "fastify";
import type { QuestionnaireStubResponse } from "../types/api.js";

const questionnaireRoutes: FastifyPluginAsync = async (app) => {
  app.post<{ Reply: QuestionnaireStubResponse }>(
    "/questionnaire",
    {
      schema: {
        tags: ["Questionnaire"],
        summary: "Submit questionnaire (stub)",
        description:
          "Stub endpoint. When implemented, answers will drive search parameters; clients should follow `next` to `GET /search`.",
        body: {
          type: "object",
          additionalProperties: true,
        },
        response: {
          200: {
            type: "object",
            properties: {
              implemented: { type: "boolean", enum: [false] },
              message: { type: "string" },
              next: {
                type: "object",
                properties: {
                  method: { type: "string", enum: ["GET"] },
                  path: { type: "string", enum: ["/search"] },
                  description: { type: "string" },
                },
                required: ["method", "path", "description"],
              },
            },
            required: ["implemented", "message", "next"],
          },
        },
      },
    },
    async () => ({
      implemented: false as const,
      message:
        "Questionnaire not implemented yet. When it is, answers will produce search parameters (e.g. session id or structured filters) for GET /search.",
      next: {
        method: "GET" as const,
        path: "/search" as const,
        description:
          "Call with `q` for free text. Later: pass `questionnaireSessionId` or typed filters from the completed questionnaire.",
      },
    }),
  );
};

export default questionnaireRoutes;
