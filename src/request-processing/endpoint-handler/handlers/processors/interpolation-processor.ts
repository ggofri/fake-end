import { interpolateParams } from '@/request-processing/parameter-interpolation/parameter-interpolator';
import { RequestLike } from './request-processor';

function isRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

export function processInterpolation(responseBody: unknown, req: RequestLike): unknown {
  if (responseBody !== undefined && (typeof responseBody === "string" || typeof responseBody === "object")) {
    return interpolateParams(
      responseBody,
      req.params ?? {},
      isRecord(req.query) ? req.query : {},
      isRecord(req.body) ? req.body : {}
    );
  }
  return responseBody;
}
