export function evaluateArrowFunction(expression: string, body?: unknown): unknown {
  try {
    if (isBodyAwareFunction(expression)) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-call
      return eval(expression)(body);
    }
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
  return value.startsWith('() =>') || value.startsWith('(body) =>');
}

export function isBodyAwareFunction(value: string): boolean {
  return value.startsWith('(body) =>');
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isDynamicFunction(value: unknown): value is { _dynamicFunction: string } {
  return isRecord(value) && '_dynamicFunction' in value && typeof value['_dynamicFunction'] === 'string';
}

export function evaluateDynamicMocks(data: unknown, body?: unknown): unknown {
  if (typeof data === 'object' && data !== null) {
    if (Array.isArray(data)) {
      return data.map(item => evaluateDynamicMocks(item, body));
    }
    
    if (isDynamicFunction(data)) {
      return evaluateArrowFunction(data._dynamicFunction, body);
    }
    
    if (isRecord(data)) {
      const result: Record<string, unknown> = {};
      
      for (const [key, value] of Object.entries(data)) {
        if (isDynamicFunction(value)) {
          result[key] = evaluateArrowFunction(value._dynamicFunction, body);
        } else if (typeof value === 'object' && value !== null) {
          result[key] = evaluateDynamicMocks(value, body);
        } else {
          result[key] = value;
        }
      }
      
      return result;
    }
  }
  
  return data;
}
