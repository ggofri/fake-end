import { GuardFunction, GuardCondition, Either, left, right, isGuardInterfaceResponse } from '@/shared/types';
import { interfaceResolver } from '@/typescript-processing/utils/interface-resolver';
import { generateMockFromInterface } from '@/typescript-processing/mock-generator/generators';

function evaluateCondition(condition: GuardCondition, body: Record<string, unknown>, query: Record<string, unknown> = {}): boolean {
  const { field, operator, value } = condition;
  
  if (field.startsWith('query.')) {
    const QUERY_PREFIX_LENGTH = 6;
    const queryField = field.substring(QUERY_PREFIX_LENGTH);
    const fieldValue = getNestedValue(query, queryField);
    return evaluateFieldCondition(operator, fieldValue, value);
  }
  
  const fieldValue = getNestedValue(body, field);
  return evaluateFieldCondition(operator, fieldValue, value);
}

function evaluateFieldCondition(operator: string, fieldValue: unknown, value: unknown): boolean {
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

export async function executeGuard(
  guard: GuardFunction,
  requestBody: Record<string, unknown>,
  queryParams: Record<string, unknown>,
  mockDir: string
): Promise<Either<{ status: number; body?: unknown }, { status: number; body?: unknown }>> {
  const conditionResult = evaluateCondition(guard.condition, requestBody, queryParams);
  
  if (conditionResult) {
    const resolvedResponse = await resolveGuardResponse(guard.right, mockDir, requestBody);
    return right(resolvedResponse);
  }
  
  const resolvedResponse = await resolveGuardResponse(guard.left, mockDir, requestBody);
  return left(resolvedResponse);
}

async function resolveGuardResponse(
  response: GuardFunction['left']  ,
  mockDir: string,
  requestBody: Record<string, unknown>
): Promise<{ status: number; body?: unknown }> {
  if (isGuardInterfaceResponse(response)) {
    const interfaceDecl = await interfaceResolver.resolveInterface(response.interface, mockDir);
    if (interfaceDecl) {
      const mockBody = generateMockFromInterface(interfaceDecl, true, requestBody);
      return { status: response.status, body: mockBody };
    }
    return { status: response.status, body: {} };
  }
  
  return { status: response.status, body: response.body };
}
