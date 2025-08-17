import { safeStringify } from './string-utils';
import { getNestedValue } from './value-extractor';
import { handleSpecialPlaceholders, handleSinglePlaceholders } from './placeholder-handlers';

function interpolateStringContent(
  str: string,
  params: Record<string, unknown>,
  query: Record<string, unknown>,
  body: Record<string, unknown>
): string {
  return str
    .replace(/:(\w+)/g, (match, paramName: string) => {
      const value = params[paramName];
      if (value === undefined) return match;
      return safeStringify(value);
    })
    .replace(/\{\{query\.(\w+)\}\}/g, (match, queryParam: string) => {
      const value = query[queryParam];
      if (value === undefined) return match;
      return safeStringify(value);
    })
    .replace(/\{\{body\.([\w.]+)\}\}/g, (match, path: string) => {
      const value = getNestedValue(body, path);
      if (value === undefined) return match;
      return safeStringify(value);
    });
}

export function interpolateString(
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
