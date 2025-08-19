import express, { Express } from "express";
import { ParsedEndpoint } from "@/types";
import { setupMiddleware, registerEndpoints, handle404 } from "./express/";

export function createServer(endpoints: ParsedEndpoint[], mockDir?: string): Express {
  const app = express();

  setupMiddleware(app);
  registerEndpoints(app, endpoints, mockDir);
  app.use("*", handle404);

  return app;
}
