import { ParsedEndpoint } from '@/shared/types';
import { processDynamicMocks } from './dynamic-mock-processor';
import { processGuard } from './guard-processor';
import { processInterpolation } from './interpolation-processor';

export interface RequestLike {
  params?: Record<string, string>;
  query?: Record<string, unknown>;
  body?: unknown;
}

export async function processRequest(endpoint: ParsedEndpoint, req: RequestLike, mockDir?: string): Promise<{ responseStatus: number; responseBody: unknown }> {
  let responseStatus = endpoint.status;
  let responseBody = endpoint.body;
  
  const result = processDynamicMocks(endpoint, req);
  if (result) {
    responseBody = result;
  }

  const guardResult = await processGuard(endpoint, req, mockDir);
  if (guardResult) {
    responseStatus = guardResult.status;
    responseBody = guardResult.body;
  }

  responseBody = processInterpolation(responseBody, req);

  return { responseStatus, responseBody };
}
