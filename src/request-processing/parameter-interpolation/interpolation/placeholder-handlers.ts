import { getNestedValue } from './value-extractor';

export function handleSpecialPlaceholders(
  str: string,
  body: Record<string, unknown>
): unknown {
  if (str === "{{body}}") {
    return body;
  }
  return str;
}

export function handleSinglePlaceholders(
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
  
  const queryMatch = str.match(/^\{\{query\.(\w+)\}\}$/);
  if (queryMatch?.[1]) {
    const value = query[queryMatch[1]];
    return value !== undefined ? value : str;
  }
  
  const pathMatch = str.match(/^:(\w+)$/);
  if (pathMatch?.[1]) {
    const value = params[pathMatch[1]];
    return value !== undefined ? value : str;
  }
  
  return str;
}
