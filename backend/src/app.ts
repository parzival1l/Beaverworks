import cors from "@fastify/cors";
import swagger from "@fastify/swagger";
import swaggerUi from "@fastify/swagger-ui";
import Fastify from "fastify";
import healthRoutes from "./routes/health.js";
import homeRoutes from "./routes/home.js";
import questionnaireRoutes from "./routes/questionnaire.js";
import searchRoutes from "./routes/search.js";

export type BuildAppOptions = {
  /** Defaults to true; set false in tests to avoid log noise. */
  logger?: boolean;
};

export async function buildApp(options: BuildAppOptions = {}) {
  const app = Fastify({ logger: options.logger ?? true });

  // Must register before route plugins so paths appear in the OpenAPI document.
  await app.register(swagger, {
    openapi: {
      openapi: "3.0.3",
      info: {
        title: "Beaverworks API",
        description:
          "HTTP API for Beaverworks (questionnaire → search → results). Specification is generated from Fastify route schemas.",
        version: "0.1.0",
      },
      servers: [
        {
          url: "http://127.0.0.1:{port}",
          description: "Local dev (set `port` to match `PORT`, default 3001)",
          variables: {
            port: { default: "3001" },
          },
        },
      ],
      tags: [
        { name: "Health", description: "Liveness" },
        { name: "Home", description: "Home payload for the client shell" },
        { name: "Search", description: "Search and results" },
        { name: "Questionnaire", description: "User intake (stub until implemented)" },
      ],
    },
  });

  await app.register(cors, { origin: true });
  await app.register(healthRoutes);
  await app.register(homeRoutes);
  await app.register(searchRoutes);
  await app.register(questionnaireRoutes);

  await app.register(swaggerUi, {
    routePrefix: "/docs",
    uiConfig: {
      docExpansion: "list",
      deepLinking: true,
    },
  });

  return app;
}
