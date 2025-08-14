function isStringifiable(value: unknown): value is string | number | boolean {
  return typeof value === "string" || typeof value === "number" || typeof value === "boolean";
}

function safeStringify(value: unknown): string {
  if (isStringifiable(value)) {
    return String(value);
  }
  if (value === null || value === undefined) {
    return "";
  }
  return "[object]";
}

export function interpolateParams(
  obj: unknown, 
  params: Record<string, unknown>, 
  query: Record<string, unknown>, 
  body: Record<string, unknown>
): unknown {
  if (typeof obj === "string") {
    return obj
      .replace(/:(\w+)/g, (match, key: string) => safeStringify(params[key] ?? match))
      .replace(/\{\{query\.(\w+)\}\}/g, (match, key: string) => safeStringify(query[key] ?? match))
      .replace(/\{\{body\.(\w+)\}\}/g, (match, key: string) => safeStringify(body[key] ?? match));
  }

  if (Array.isArray(obj)) {
    return obj.map((item) => interpolateParams(item, params, query, body));
  }

  if (obj && typeof obj === "object") {
    const result: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(obj)) {
      result[key] = interpolateParams(value, params, query, body);
    }
    return result;
  }

  return obj;
}
