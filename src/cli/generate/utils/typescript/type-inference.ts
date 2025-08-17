export function inferTypeScriptType(value: unknown): string {
  if (value === null || value === undefined) {
    return 'string | null';
  }
  
  if (Array.isArray(value)) {
    if (value.length === 0) return 'unknown[]';
    const firstType = inferTypeScriptType(value[0]);
    return `${firstType}[]`;
  }
  
  if (typeof value === 'object') {
    return 'Record<string, unknown>';
  }
  
  return typeof value;
}
