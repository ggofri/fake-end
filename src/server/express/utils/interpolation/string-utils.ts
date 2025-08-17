function isStringifiable(value: unknown): value is string | number | boolean {
  return typeof value === "string" || typeof value === "number" || typeof value === "boolean";
}

export function safeStringify(value: unknown): string {
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
