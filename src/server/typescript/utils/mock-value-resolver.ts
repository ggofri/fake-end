import { PropertySignature } from 'ts-morph';
import { extractMockTagValue } from './jsdoc-extractor';
import { evaluateArrowFunction, tryParseJson, isArrowFunction } from './mock-value-evaluator';

export function resolveMockValue(prop?: PropertySignature): unknown {
  if (!prop) return undefined;

  const mockValue = extractMockTagValue(prop);
  if (!mockValue) return undefined;

  const parseResult = tryParseJson(mockValue);
  if (parseResult.success) {
    return parseResult.data;
  }

  if (isArrowFunction(mockValue)) {
    return evaluateArrowFunction(mockValue);
  }

  return mockValue;
}
