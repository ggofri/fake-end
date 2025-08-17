import { Application, Request, Response } from 'express';
import { ParsedEndpoint, isValidMethod, validLowercaseMethods } from '@/types';
import { logRequest, logResponse } from '@/server/express/utils/logger';
import { interpolateParams } from '@/server/express/utils/parameter-interpolator';
import { executeGuard } from '@/server/express/utils/guard-executor';
import { HTTP_STATUS } from '@/constants';
import { evaluateDynamicMocks } from '@/server/typescript/utils/mock-value-evaluator';
import { generateMockFromInterface } from '@/server/typescript/generators';
import { InterfaceDeclaration } from 'ts-morph';

function isValidLowercaseMethod(method: string): method is validLowercaseMethods {
  return ['get', 'post', 'put', 'delete', 'patch'].includes(method);
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

function isInterfaceDeclaration(value: unknown): value is InterfaceDeclaration {
  return value !== null && typeof value === 'object' && 'getName' in value;
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
  
  const result = processDynamicMocks(endpoint, req);
  if (result) {
    responseBody = result;
  }

  const guardResult = processGuard(endpoint, req);
  if (guardResult) {
    responseStatus = guardResult.status;
    responseBody = guardResult.body;
  }

  responseBody = processInterpolation(responseBody, req);

  return { responseStatus, responseBody };
}

function processDynamicMocks(endpoint: ParsedEndpoint, req: Request): unknown {
  if (endpoint._dynamicMocks && isInterfaceDeclaration(endpoint._interfaceDeclaration)) {
    const requestBody = isRecord(req.body) ? req.body : {};
    const responseBody = generateMockFromInterface(endpoint._interfaceDeclaration, true, requestBody);
    return evaluateDynamicMocks(responseBody, requestBody);
  }
  return undefined;
}

function processGuard(endpoint: ParsedEndpoint, req: Request): { status: number; body: unknown } | undefined {
  if (endpoint.guard) {
    const requestBody = isRecord(req.body) ? req.body : {};
    const guardResult = executeGuard(endpoint.guard, requestBody);
    return { status: guardResult.value.status, body: guardResult.value.body ?? null };
  }
  return undefined;
}

function processInterpolation(responseBody: unknown, req: Request): unknown {
  if (responseBody !== undefined && (typeof responseBody === "string" || typeof responseBody === "object")) {
    return interpolateParams(
      responseBody,
      req.params,
      isRecord(req.query) ? req.query : {},
      isRecord(req.body) ? req.body : {}
    );
  }
  return responseBody;
}

function sendResponse(res: Response, status: number, body: unknown): void {
  if (status === HTTP_STATUS.NO_CONTENT || body === undefined) {
    res.status(status).send();
  } else {
    res.status(status).json(body);
  }
}
