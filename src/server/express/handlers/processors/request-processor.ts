import { ParsedEndpoint } from '@/types';
import { processDynamicMocks } from './dynamic-mock-processor';
import { processGuard } from './guard-processor';
import { processInterpolation } from './interpolation-processor';

export interface RequestLike {
  params?: Record<string, string>;
  query?: Record<string, unknown>;
  body?: unknown;
}

export function processRequest(endpoint: ParsedEndpoint, req: RequestLike): { responseStatus: number; responseBody: unknown } {
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
