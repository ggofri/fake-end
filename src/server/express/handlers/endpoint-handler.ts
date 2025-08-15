import { Application, Request, Response } from 'express';
import { ParsedEndpoint, isValidMethod, validLowercaseMethods } from '@/types';
import { logRequest, logResponse } from '@/server/express/utils/logger';
import { interpolateParams } from '@/server/express/utils/parameter-interpolator';
import { HTTP_STATUS } from '@/constants';

function isValidLowercaseMethod(method: string): method is validLowercaseMethods {
  return ['get', 'post', 'put', 'delete', 'patch'].includes(method);
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

export function registerEndpoints(app: Application, endpoints: ParsedEndpoint[]): void {
  for (const endpoint of endpoints) {
    if (!isValidMethod(endpoint.method.toUpperCase())) {
      continue;
    }
    
    const lowercaseMethod = endpoint.method.toLowerCase();
    if (!isValidLowercaseMethod(lowercaseMethod)) {
      continue;
    }
    
    app[lowercaseMethod](endpoint.fullPath, (req: Request, res: Response) => {
      void createEndpointHandler(endpoint)(req, res);
    });
  }
}

function createEndpointHandler(endpoint: ParsedEndpoint) {
  return async (req: Request, res: Response): Promise<void> => {
    const startTime = Date.now();

    logRequest(endpoint.method, req.path, endpoint.filePath);

    if (endpoint.delayMs && endpoint.delayMs > 0) {
      await new Promise((resolve) => setTimeout(resolve, endpoint.delayMs));
    }

    let responseBody = endpoint.body;

    if (responseBody !== undefined && (typeof responseBody === "string" || typeof responseBody === "object")) {
      responseBody = interpolateParams(
        responseBody,
        req.params,
        isRecord(req.query) ? req.query : {},
        isRecord(req.body) ? req.body : {},
      );
    }

    const duration = Date.now() - startTime;
    logResponse(endpoint.status, duration);

    if (endpoint.status === HTTP_STATUS.NO_CONTENT || responseBody === undefined) {
      res.status(endpoint.status).send();
    } else {
      res.status(endpoint.status).json(responseBody);
    }
  };
}
