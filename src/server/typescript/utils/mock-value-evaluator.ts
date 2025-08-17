export function evaluateArrowFunction(expression: string): unknown {
  try {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call
    return eval(expression)();
  } catch {
    return null;
  }
}

export function tryParseJson(value: string): { success: boolean; data?: unknown } {
  try {
    return { success: true, data: JSON.parse(value) };
  } catch {
    return { success: false };
  }
}

export function isArrowFunction(value: string): boolean {
  return value.startsWith('() =>');
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isDynamicFunction(value: unknown): value is { _dynamicFunction: string } {
  return isRecord(value) && '_dynamicFunction' in value && typeof value['_dynamicFunction'] === 'string';
}

export function evaluateDynamicMocks(data: unknown): unknown {
  if (typeof data === 'object' && data !== null) {
    if (Array.isArray(data)) {
      return data.map(evaluateDynamicMocks);
    }
    
    if (isRecord(data)) {
      const result: Record<string, unknown> = {};
      
      for (const [key, value] of Object.entries(data)) {
        if (isDynamicFunction(value)) {
          result[key] = evaluateArrowFunction(value._dynamicFunction);
        } else if (typeof value === 'object' && value !== null) {
          result[key] = evaluateDynamicMocks(value);
        } else {
          result[key] = value;
        }
      }
      
      return result;
    }
  }
  
  return data;
}
