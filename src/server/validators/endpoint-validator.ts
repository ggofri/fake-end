import { MockEndpoint } from '@/types';
import { isObject, hasRequiredProperties, hasValidPropertyTypes, isValidHttpMethod } from '@/utils';

export function isValidEndpoint(endpoint: unknown): endpoint is MockEndpoint {
  if (!isObject(endpoint)) return false;
  
  const requiredProps = ['method', 'path', 'status'];
  if (!hasRequiredProperties(endpoint, requiredProps)) return false;
  
  const typeValidations = {
    method: (value: unknown): boolean => typeof value === 'string',
    path: (value: unknown): boolean => typeof value === 'string',
    status: (value: unknown): boolean => typeof value === 'number'
  };
  if (!hasValidPropertyTypes(endpoint, typeValidations)) return false;
  
  if (!isValidHttpMethod(endpoint['method'])) return false;

  if (endpoint['guard'] !== undefined && !isValidGuard(endpoint['guard'])) {
    return false;
  }
  
  return true;
}

export function isValidGuard(guard: unknown): boolean {
  if (!isObject(guard)) return false;
  
  const requiredProps = ['condition', 'left', 'right'];
  if (!hasRequiredProperties(guard, requiredProps)) return false;
  
  const { condition, left, right } = guard;
  if (!isValidGuardCondition(condition)) return false;
  
  if (!isValidGuardResponse(left) || !isValidGuardResponse(right)) return false;
  
  return true;
}

export function isValidGuardCondition(condition: unknown): boolean {
  if (!isObject(condition)) return false;
  
  const requiredProps = ['field', 'operator'];
  if (!hasRequiredProperties(condition, requiredProps)) return false;
  
  const typeValidations = {
    field: (value: unknown): boolean => typeof value === 'string',
    operator: (value: unknown): boolean => typeof value === 'string' && 
      ['equals', 'not_equals', 'contains', 'not_contains', 'exists', 'not_exists'].includes(value)
  };
  
  return hasValidPropertyTypes(condition, typeValidations);
}

export function isValidGuardResponse(response: unknown): boolean {
  if (!isObject(response)) return false;
  
  const requiredProps = ['status'];
  if (!hasRequiredProperties(response, requiredProps)) return false;
  
  const typeValidations = {
    status: (value: unknown): boolean => typeof value === 'number'
  };
  
  return hasValidPropertyTypes(response, typeValidations);
}
