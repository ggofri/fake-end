import { PropertySignature } from 'ts-morph';
import { extractMockTagValue } from './jsdoc-extractor';
import { evaluateArrowFunction, tryParseJson, isArrowFunction } from './mock-value-evaluator';
import { evaluateFakerFunction, isFakerExpression } from './faker-evaluator';
import { isNil } from '@/utils';

export function resolveMockValue(prop?: PropertySignature, isDynamic?: boolean, body?: unknown): unknown {
  if (!prop) return undefined;

  const mockValue = extractMockTagValue(prop);
  if (isNil(mockValue)) return undefined;

  const parseResult = tryParseJson(mockValue);
  if (parseResult.success) {
    return parseResult.data;
  }

  if (isFakerExpression(mockValue)) {
    if (isDynamic) {
      return { _dynamicFunction: mockValue };
    }
    return evaluateFakerFunction(mockValue);
  }

  if (isArrowFunction(mockValue)) {
    if (isDynamic) {
      return { _dynamicFunction: mockValue };
    }
    return evaluateArrowFunction(mockValue, body);
  }

  return mockValue;
}
