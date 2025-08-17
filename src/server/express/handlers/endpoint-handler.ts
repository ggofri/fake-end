import { Application, Request, Response } from 'express';
import { ParsedEndpoint, isValidMethod, validLowercaseMethods } from '@/types';
import { logRequest, logResponse } from '@/server/express/utils/logger';
import { interpolateParams } from '@/server/express/utils/parameter-interpolator';
import { executeGuard } from '@/server/express/utils/guard-executor';
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

    await applyDelay(endpoint.delayMs);
    const { responseStatus, responseBody } = processRequest(endpoint, req);
    
    const duration = Date.now() - startTime;
    logResponse(responseStatus, duration);
    sendResponse(res, responseStatus, responseBody);
  };
}

async function applyDelay(delayMs?: number): Promise<void> {
  if (delayMs && delayMs > 0) {
    await new Promise((resolve) => setTimeout(resolve, delayMs));
  }
}

function processRequest(endpoint: ParsedEndpoint, req: Request): { responseStatus: number; responseBody: unknown } {
  let responseStatus = endpoint.status;
  let responseBody = endpoint.body;

  if (endpoint.guard) {
    const requestBody = isRecord(req.body) ? req.body : {};
    const guardResult = executeGuard(endpoint.guard, requestBody);
    
    responseStatus = guardResult.value.status;
    responseBody = guardResult.value.body;
  }

  if (responseBody !== undefined && (typeof responseBody === "string" || typeof responseBody === "object")) {
    responseBody = interpolateParams(
      responseBody,
      req.params,
      isRecord(req.query) ? req.query : {},
      isRecord(req.body) ? req.body : {}
    );
  }

  return { responseStatus, responseBody };
}

function sendResponse(res: Response, status: number, body: unknown): void {
  if (status === HTTP_STATUS.NO_CONTENT || body === undefined) {
    res.status(status).send();
  } else {
    res.status(status).json(body);
  }
}
