import { isRecordOfUnknown } from '@/utils';

function isStringifiable(value: unknown): value is string | number | boolean {
  return typeof value === "string" || typeof value === "number" || typeof value === "boolean";
}

function safeStringify(value: unknown): string {
  if (isStringifiable(value)) {
    return String(value);
  }
  if (value === null) {
    return "";
  }
  if (value === undefined) {
    return "";
  }
  return "[object]";
}

function getNestedValue(obj: Record<string, unknown>, path: string): unknown {
  return path.split('.').reduce((current: unknown, key) => {
    if (isRecordOfUnknown(current)) {
      return current[key];
    }
    return undefined;
  }, obj as unknown);
}

function handleSpecialPlaceholders(
  str: string,
  body: Record<string, unknown>
): unknown {
  if (str === "{{body}}") {
    return body;
  }
  return str;
}

function handleSinglePlaceholders(
  str: string,
  params: Record<string, unknown>,
  query: Record<string, unknown>,
  body: Record<string, unknown>
): unknown {
  const bodyMatch = str.match(/^\{\{body\.([\w.]+)\}\}$/);
  if (bodyMatch?.[1]) {
    const value = getNestedValue(body, bodyMatch[1]);
    return value !== undefined ? value : str;
  }
  
  const queryMatch = str.match(/^\{\{query\.([\w.]+)\}\}$/);
  if (queryMatch?.[1]) {
    const value = getNestedValue(query, queryMatch[1]);
    return value !== undefined ? value : str;
  }
  
  const paramMatch = str.match(/^:(\w+)$/);
  if (paramMatch?.[1]) {
    const value = params[paramMatch[1]];
    return value !== undefined ? value : str;
  }
  
  return str;
}

function interpolateStringContent(
  str: string,
  params: Record<string, unknown>,
  query: Record<string, unknown>,
  body: Record<string, unknown>
): string {
  return str
    .replace(/:(\w+)/g, (match, key: string) => {
      const value = params[key];
      if (value === undefined) return match;
      return safeStringify(value);
    })
    .replace(/\{\{query\.([\w.]+)\}\}/g, (match, path: string) => {
      const value = getNestedValue(query, path);
      if (value === undefined) return match;
      return safeStringify(value);
    })
    .replace(/\{\{body\.([\w.]+)\}\}/g, (match, path: string) => {
      const value = getNestedValue(body, path);
      if (value === undefined) return match;
      return safeStringify(value);
    });
}

function interpolateString(
  str: string,
  params: Record<string, unknown>,
  query: Record<string, unknown>,
  body: Record<string, unknown>
): unknown {
  const specialResult = handleSpecialPlaceholders(str, body);
  if (specialResult !== str) {
    return specialResult;
  }
  
  const singlePlaceholderResult = handleSinglePlaceholders(str, params, query, body);
  if (singlePlaceholderResult !== str) {
    return singlePlaceholderResult;
  }
  
  return interpolateStringContent(str, params, query, body);
}

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
    // Check for circular reference
    if (visited.has(obj)) {
      return "[circular]";
    }
    visited.add(obj);
    
    const result = obj.map((item) => interpolateParams(item, params, query, body, visited));
    visited.delete(obj);
    return result;
  }

  if (obj && typeof obj === "object") {
    // Check for circular reference
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
