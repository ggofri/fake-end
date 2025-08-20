import { ParsedEndpoint } from '@/shared/types';
import { executeGuard } from '@/request-processing/guard-processor/guard-executor';
import { RequestLike } from './request-processor';

function isRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

export async function processGuard(endpoint: ParsedEndpoint, req: RequestLike, mockDir?: string): Promise<{ status: number; body: unknown } | undefined> {
  if (endpoint.guard) {
    const requestBody = isRecord(req.body) ? req.body : {};
    const queryParams = isRecord(req.query) ? req.query : {};
    const guardResult = await executeGuard(endpoint.guard, requestBody, queryParams, mockDir ?? '');
    return { status: guardResult.value.status, body: guardResult.value.body ?? null };
  }
  return undefined;
}
