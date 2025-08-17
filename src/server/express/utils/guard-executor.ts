import { GuardFunction, GuardCondition, Either, left, right } from '@/types';

function evaluateCondition(condition: GuardCondition, body: Record<string, unknown>): boolean {
  const { field, operator, value } = condition;
  const fieldValue = getNestedValue(body, field);

  if (operator === 'equals') {
    return fieldValue === value;
  }
  if (operator === 'not_equals') {
    return fieldValue !== value;
  }
  if (operator === 'exists') {
    return fieldValue !== undefined && fieldValue !== null;
  }
  if (operator === 'not_exists') {
    return fieldValue === undefined || fieldValue === null;
  }
  
  return evaluateContainsOperator(operator, fieldValue, value);
}

function evaluateContainsOperator(operator: string, fieldValue: unknown, value: unknown): boolean {
  const isStringContains = typeof fieldValue === 'string' && typeof value === 'string';
  const isArrayContains = Array.isArray(fieldValue);
  
  if (operator === 'contains') {
    return isStringContains ? fieldValue.includes(value) : isArrayContains && fieldValue.includes(value);
  }
  if (operator === 'not_contains') {
    return isStringContains ? !fieldValue.includes(value) : isArrayContains && !fieldValue.includes(value);
  }
  
  return false;
}

function getNestedValue(obj: Record<string, unknown>, path: string): unknown {
  return path.split('.').reduce((current: unknown, key: string) => {
    if (isRecord(current)) {
      return current[key];
    }
    return undefined;
  }, obj);
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

export function executeGuard(
  guard: GuardFunction,
  requestBody: Record<string, unknown>
): Either<{ status: number; body?: unknown }, { status: number; body?: unknown }> {
  const conditionResult = evaluateCondition(guard.condition, requestBody);
  
  if (conditionResult) {
    return right(guard.right);
  }
  return left(guard.left);
}
