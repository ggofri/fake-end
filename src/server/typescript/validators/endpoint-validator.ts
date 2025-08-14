import { validMethods } from '@/types';
import { isObject, hasRequiredProperties, hasValidPropertyTypes, isValidHttpMethod } from '@/utils';

export interface TypeScriptEndpoint {
  method: validMethods;
  path: string;
  status: number;
  body: Record<string, unknown>;
  headers?: Record<string, string>;
  delayMs?: number;
}

export function isValidTypeScriptEndpoint(endpoint: unknown): endpoint is TypeScriptEndpoint {
  if (!isObject(endpoint)) return false;
  
  const requiredProps = ['method', 'path', 'status', 'body'];
  if (!hasRequiredProperties(endpoint, requiredProps)) return false;
  
  const typeValidations = {
    method: (value: unknown): boolean => typeof value === 'string',
    path: (value: unknown): boolean => typeof value === 'string',
    status: (value: unknown): boolean => typeof value === 'number',
    body: (value: unknown): boolean => value !== undefined
  };
  if (!hasValidPropertyTypes(endpoint, typeValidations)) return false;
  
  return isValidHttpMethod(endpoint['method']);
}
