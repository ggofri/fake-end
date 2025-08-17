import { evaluateFakerFunction, isFakerExpression } from './faker-evaluator';

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
  if (typeof data !== 'object' || data === null) {
    return data;
  }

  if (Array.isArray(data)) {
    return data.map(item => evaluateDynamicMocks(item, body));
  }

  if (isDynamicFunction(data)) {
    return evaluateDynamicFunction(data, body);
  }

  if (isRecord(data)) {
    return evaluateRecord(data, body);
  }

  return data;
}

function evaluateDynamicFunction(data: { _dynamicFunction: string }, body?: unknown): unknown {
  const expression = data._dynamicFunction;
  if (isFakerExpression(expression)) {
    return evaluateFakerFunction(expression);
  }
  return evaluateArrowFunction(expression, body);
}

function evaluateRecord(data: Record<string, unknown>, body?: unknown): Record<string, unknown> {
  const result: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(data)) {
    if (isDynamicFunction(value)) {
      result[key] = evaluateDynamicFunction(value, body);
    } else if (typeof value === 'object' && value !== null) {
      result[key] = evaluateDynamicMocks(value, body);
    } else {
      result[key] = value;
    }
  }

  return result;
}
