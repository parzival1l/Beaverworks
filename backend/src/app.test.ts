import { afterAll, describe, expect, it } from "vitest";
import { buildApp } from "./app.js";

describe("API routes", () => {
  const appPromise = buildApp({ logger: false });
  afterAll(async () => {
    const app = await appPromise;
    await app.close();
  });

  it("GET /health", async () => {
    const app = await appPromise;
    const res = await app.inject({ method: "GET", url: "/health" });
    expect(res.statusCode).toBe(200);
    expect(JSON.parse(res.body)).toMatchObject({ status: "ok" });
  });

  it("GET /home", async () => {
    const app = await appPromise;
    const res = await app.inject({ method: "GET", url: "/home" });
    expect(res.statusCode).toBe(200);
    const body = JSON.parse(res.body) as { headline: string };
    expect(body.headline).toBeTruthy();
  });

  it("GET /search returns results when q is non-empty", async () => {
    const app = await appPromise;
    const res = await app.inject({ method: "GET", url: "/search?q=hello" });
    expect(res.statusCode).toBe(200);
    const body = JSON.parse(res.body) as { total: number; results: unknown[] };
    expect(body.total).toBeGreaterThan(0);
    expect(body.results.length).toBe(body.total);
  });

  it("POST /questionnaire stub", async () => {
    const app = await appPromise;
    const res = await app.inject({
      method: "POST",
      url: "/questionnaire",
      payload: {},
    });
    expect(res.statusCode).toBe(200);
    expect(JSON.parse(res.body)).toMatchObject({ implemented: false, next: { path: "/search" } });
  });

  it("GET /docs/json returns OpenAPI document", async () => {
    const app = await appPromise;
    const res = await app.inject({ method: "GET", url: "/docs/json" });
    expect(res.statusCode).toBe(200);
    const doc = JSON.parse(res.body) as { openapi: string; paths: Record<string, unknown> };
    expect(doc.openapi).toMatch(/^3\./);
    expect(doc.paths["/health"]).toBeDefined();
    expect(doc.paths["/docs/json"]).toBeUndefined();
  });

  it("GET /docs serves Swagger UI HTML", async () => {
    const app = await appPromise;
    const res = await app.inject({ method: "GET", url: "/docs/" });
    expect(res.statusCode).toBe(200);
    expect(res.headers["content-type"]).toMatch(/text\/html/);
    expect(res.body).toContain("Swagger");
  });
});
