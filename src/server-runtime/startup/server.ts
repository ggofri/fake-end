import express, { Express } from "express";
import { ParsedEndpoint } from "@/shared/types";
import { setupMiddleware } from "@/server-runtime/middleware";
import { registerEndpoints, handle404 } from "@/request-processing/endpoint-handler/handlers";

export function createServer(endpoints: ParsedEndpoint[], mockDir?: string): Express {
  const app = express();

  setupMiddleware(app);
  registerEndpoints(app, endpoints, mockDir);
  app.use("*", handle404);

  return app;
}
