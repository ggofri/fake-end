import { Application, Request, Response } from 'express';
import { ParsedEndpoint, isValidMethod, validLowercaseMethods } from '@/shared/types';
import { logRequest, logResponse } from '@/request-processing/utils/logger';
import { processRequest } from './processors';
import { applyDelay, sendResponse } from './utils/response-utils';

function isValidLowercaseMethod(method: string): method is validLowercaseMethods {
  return ['get', 'post', 'put', 'delete', 'patch'].includes(method);
}

export function registerEndpoints(app: Application, endpoints: ParsedEndpoint[], mockDir?: string): void {
  for (const endpoint of endpoints) {
    if (!isValidMethod(endpoint.method.toUpperCase())) {
      continue;
    }
    
    const lowercaseMethod = endpoint.method.toLowerCase();
    if (!isValidLowercaseMethod(lowercaseMethod)) {
      continue;
    }
    
    app[lowercaseMethod](endpoint.fullPath, (req: Request, res: Response) => {
      void createEndpointHandler(endpoint, mockDir)(req, res);
    });
  }
}

function createEndpointHandler(endpoint: ParsedEndpoint, mockDir?: string) {
  return async (req: Request, res: Response): Promise<void> => {
    const startTime = Date.now();
    logRequest(endpoint.method, req.path, endpoint.filePath);

    await applyDelay(endpoint.delayMs);
    const { responseStatus, responseBody } = await processRequest(endpoint, req, mockDir);
    
    const duration = Date.now() - startTime;
    logResponse(responseStatus, duration);
    sendResponse(res, responseStatus, responseBody);
  };
}
