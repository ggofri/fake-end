const MAX_RECURSION_DEPTH = 5;

export function inferTypeScriptType(value: unknown, depth = 0): string {
  if (value === null || value === undefined) {
    return 'string | null';
  }
  
  if (Array.isArray(value)) {
    if (value.length === 0) return 'unknown[]';
    const firstType = inferTypeScriptType(value[0], depth + 1);
    return `${firstType}[]`;
  }
  
  if (typeof value === 'object') {
    
    if (depth > MAX_RECURSION_DEPTH) {
      return 'Record<string, unknown>';
    }
    
    return generateInlineObjectType(value, depth);
  }
  
  return typeof value;
}

function generateInlineObjectType(obj: unknown, depth: number): string {
  if (typeof obj !== 'object' || obj === null) {
    return 'Record<string, unknown>';
  }
  
  const entries = Object.entries(obj);
  
  if (entries.length === 0) {
    return 'Record<string, unknown>';
  }
  
  const fields = entries.map(([key, value]) => {
    const type = inferTypeScriptType(value, depth + 1);
    
    const optional = value === null || value === undefined ? '?' : '';
    
    const quotedKey = /^[a-zA-Z_$][a-zA-Z0-9_$]*$/.test(key) ? key : `"${key}"`;
    return `${quotedKey}${optional}: ${type}`;
  });
  
  return `{ ${fields.join('; ')} }`;
}
