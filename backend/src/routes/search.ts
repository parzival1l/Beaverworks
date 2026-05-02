import type { FastifyPluginAsync } from "fastify";
import type { SearchResponse } from "../types/api.js";

const searchQuerySchema = {
  type: "object",
  properties: {
    q: { type: "string", default: "" },
    questionnaireSessionId: { type: "string" },
  },
} as const;

const searchRoutes: FastifyPluginAsync = async (app) => {
  app.get<{
    Querystring: { q?: string; questionnaireSessionId?: string };
    Reply: SearchResponse;
  }>(
    "/search",
    {
      schema: {
        tags: ["Search"],
        summary: "Search",
        description:
          "Search placeholder. Accepts free text (`q`) and optional `questionnaireSessionId` once the questionnaire flow persists sessions.",
        querystring: searchQuerySchema,
        response: {
          200: {
            type: "object",
            properties: {
              query: {
                type: "object",
                properties: {
                  q: { type: "string" },
                  questionnaireSessionId: { type: "string" },
                },
                required: ["q"],
              },
              results: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    id: { type: "string" },
                    title: { type: "string" },
                    snippet: { type: "string" },
                  },
                  required: ["id", "title"],
                },
              },
              total: { type: "integer" },
            },
            required: ["query", "results", "total"],
          },
        },
      },
    },
    async (request) => {
      const q = request.query.q ?? "";
      const questionnaireSessionId = request.query.questionnaireSessionId;

      // Placeholder results until search is backed by real indexes / agents.
      const results =
        q.trim().length > 0
          ? [
              {
                id: "stub-1",
                title: `Stub match for “${q}”`,
                snippet: "Replace with real search once questionnaire → search pipeline is wired.",
              },
            ]
          : [];

      return {
        query: { q, ...(questionnaireSessionId ? { questionnaireSessionId } : {}) },
        results,
        total: results.length,
      };
    },
  );
};

export default searchRoutes;
