import { interpolateString } from './interpolation';

// eslint-disable-next-line max-params
export function interpolateParams(
  obj: unknown, 
  params: Record<string, unknown>,
  query: Record<string, unknown>,
  body: Record<string, unknown>,
  visited: WeakSet<object> = new WeakSet()
): unknown {
  if (typeof obj === "string") {
    return interpolateString(obj, params, query, body);
  }

  if (Array.isArray(obj)) {
    if (visited.has(obj)) {
      return "[circular]";
    }
    visited.add(obj);
    
    const result = obj.map((item) => interpolateParams(item, params, query, body, visited));
    visited.delete(obj);
    return result;
  }

  if (obj && typeof obj === "object") {
    if (visited.has(obj)) {
      return "[circular]";
    }
    visited.add(obj);
    
    const result: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(obj)) {
      result[key] = interpolateParams(value, params, query, body, visited);
    }
    visited.delete(obj);
    return result;
  }

  return obj;
}
