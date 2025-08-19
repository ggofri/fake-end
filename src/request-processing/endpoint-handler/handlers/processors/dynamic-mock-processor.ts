import { ParsedEndpoint } from '@/shared/types';
import { evaluateDynamicMocks } from '@/typescript-processing/utils/mock-value-evaluator';
import { generateMockFromInterface } from '@/typescript-processing/mock-generator/generators';
import { InterfaceDeclaration } from 'ts-morph';
import { RequestLike } from './request-processor';

function isRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

function isInterfaceDeclaration(value: unknown): value is InterfaceDeclaration {
  return value !== null && typeof value === 'object' && 'getName' in value;
}

export function processDynamicMocks(endpoint: ParsedEndpoint, req: RequestLike): unknown {
  if (endpoint._dynamicMocks && isInterfaceDeclaration(endpoint._interfaceDeclaration)) {
    const requestBody = isRecord(req.body) ? req.body : {};
    const responseBody = generateMockFromInterface(endpoint._interfaceDeclaration, true, requestBody);
    return evaluateDynamicMocks(responseBody, requestBody);
  }
  return undefined;
}
