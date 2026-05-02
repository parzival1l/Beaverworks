import type { FastifyPluginAsync } from "fastify";
import type { HomeResponse } from "../types/api.js";

const homeRoutes: FastifyPluginAsync = async (app) => {
  app.get<{ Reply: HomeResponse }>(
    "/home",
    {
      schema: {
        tags: ["Home"],
        summary: "Home payload",
        description: "Data for the landing / home experience; replace with product content as it solidifies.",
        response: {
          200: {
            type: "object",
            properties: {
              headline: { type: "string" },
              subheading: { type: "string" },
              primaryCta: {
                type: "object",
                properties: {
                  label: { type: "string" },
                  href: { type: "string" },
                },
                required: ["label", "href"],
              },
            },
            required: ["headline", "subheading", "primaryCta"],
          },
        },
      },
    },
    async () => ({
      headline: "Beaverworks",
      subheading: "API home payload — replace with real content and Botpress-driven data when ready.",
      primaryCta: { label: "Start questionnaire", href: "/questionnaire" },
    }),
  );
};

export default homeRoutes;
