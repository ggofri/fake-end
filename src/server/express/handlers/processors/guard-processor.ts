import { ParsedEndpoint } from '@/types';
import { executeGuard } from '@/server/express/utils/guard-executor';
import { RequestLike } from './request-processor';

function isRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

export function processGuard(endpoint: ParsedEndpoint, req: RequestLike): { status: number; body: unknown } | undefined {
  if (endpoint.guard) {
    const requestBody = isRecord(req.body) ? req.body : {};
    const guardResult = executeGuard(endpoint.guard, requestBody);
    return { status: guardResult.value.status, body: guardResult.value.body ?? null };
  }
  return undefined;
}
