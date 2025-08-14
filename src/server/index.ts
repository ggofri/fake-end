import express, { Express } from "express";
import { ParsedEndpoint } from "@/types";
import { setupMiddleware, registerEndpoints, handle404 } from "./express/";

export function createServer(endpoints: ParsedEndpoint[]): Express {
  const app = express();

  setupMiddleware(app);
  registerEndpoints(app, endpoints);
  app.use("*", handle404);

  return app;
}
