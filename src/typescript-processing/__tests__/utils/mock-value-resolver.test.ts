import { PropertySignature, Project } from 'ts-morph';
import { resolveMockValue } from '../../utils/mock-value-resolver';
import { extractMockTagValue } from '../../utils/jsdoc-extractor';
import { evaluateArrowFunction, tryParseJson, isArrowFunction } from '../../utils/mock-value-evaluator';

jest.mock('../../utils/jsdoc-extractor');
jest.mock('../../utils/mock-value-evaluator');

const mockExtractMockTagValue = extractMockTagValue as jest.MockedFunction<typeof extractMockTagValue>;
const mockEvaluateArrowFunction = evaluateArrowFunction as jest.MockedFunction<typeof evaluateArrowFunction>;
const mockTryParseJson = tryParseJson as jest.MockedFunction<typeof tryParseJson>;
const mockIsArrowFunction = isArrowFunction as jest.MockedFunction<typeof isArrowFunction>;

describe('MockValueResolver', () => {
  let project: Project;
  let mockProperty: PropertySignature;

  beforeEach(() => {
    project = new Project({ useInMemoryFileSystem: true });
    jest.clearAllMocks();
    
    const sourceFile = project.createSourceFile('test.ts', `
      interface Test {
        prop: string;
      }
    `);
    mockProperty = sourceFile.getInterfaces()[0].getProperties()[0];
  });

  describe('resolveMockValue', () => {
    it('should return undefined when no property is provided', () => {
      const result = resolveMockValue();

      expect(result).toBeUndefined();
      expect(mockExtractMockTagValue).not.toHaveBeenCalled();
    });

    it('should return undefined when no mock value is found', () => {
      mockExtractMockTagValue.mockReturnValue(null);

      const result = resolveMockValue(mockProperty);

      expect(result).toBeUndefined();
      expect(mockExtractMockTagValue).toHaveBeenCalledWith(mockProperty);
    });

    it('should return parsed JSON when valid JSON is provided', () => {
      const jsonValue = '{"name": "John", "age": 30}';
      const parsedValue = { name: 'John', age: 30 };
      
      mockExtractMockTagValue.mockReturnValue(jsonValue);
      mockTryParseJson.mockReturnValue({ success: true, data: parsedValue });

      const result = resolveMockValue(mockProperty);

      expect(result).toEqual(parsedValue);
      expect(mockTryParseJson).toHaveBeenCalledWith(jsonValue);
    });

    it('should evaluate arrow function when arrow function is provided', () => {
      const arrowFunction = '() => "generated value"';
      const evaluatedValue = 'generated value';
      
      mockExtractMockTagValue.mockReturnValue(arrowFunction);
      mockTryParseJson.mockReturnValue({ success: false });
      mockIsArrowFunction.mockReturnValue(true);
      mockEvaluateArrowFunction.mockReturnValue(evaluatedValue);

      const result = resolveMockValue(mockProperty);

      expect(result).toBe(evaluatedValue);
      expect(mockIsArrowFunction).toHaveBeenCalledWith(arrowFunction);
      expect(mockEvaluateArrowFunction).toHaveBeenCalledWith(arrowFunction, undefined);
    });

    it('should return raw string when not JSON and not arrow function', () => {
      const rawValue = 'simple string value';
      
      mockExtractMockTagValue.mockReturnValue(rawValue);
      mockTryParseJson.mockReturnValue({ success: false });
      mockIsArrowFunction.mockReturnValue(false);

      const result = resolveMockValue(mockProperty);

      expect(result).toBe(rawValue);
    });

    it('should prioritize JSON parsing over arrow function detection', () => {
      const jsonValue = '{"func": "() => value"}';
      const parsedValue = { func: '() => value' };
      
      mockExtractMockTagValue.mockReturnValue(jsonValue);
      mockTryParseJson.mockReturnValue({ success: true, data: parsedValue });
      mockIsArrowFunction.mockReturnValue(true);

      const result = resolveMockValue(mockProperty);

      expect(result).toEqual(parsedValue);
      expect(mockIsArrowFunction).not.toHaveBeenCalled();
      expect(mockEvaluateArrowFunction).not.toHaveBeenCalled();
    });

    it('should handle complex JSON objects', () => {
      const complexJson = '{"users": [{"id": 1, "name": "John"}, {"id": 2, "name": "Jane"}], "meta": {"total": 2}}';
      const parsedValue = {
        users: [
          { id: 1, name: 'John' },
          { id: 2, name: 'Jane' }
        ],
        meta: { total: 2 }
      };
      
      mockExtractMockTagValue.mockReturnValue(complexJson);
      mockTryParseJson.mockReturnValue({ success: true, data: parsedValue });

      const result = resolveMockValue(mockProperty);

      expect(result).toEqual(parsedValue);
    });

    it('should handle JSON arrays', () => {
      const jsonArray = '[1, 2, 3, "test", true]';
      const parsedValue = [1, 2, 3, 'test', true];
      
      mockExtractMockTagValue.mockReturnValue(jsonArray);
      mockTryParseJson.mockReturnValue({ success: true, data: parsedValue });

      const result = resolveMockValue(mockProperty);

      expect(result).toEqual(parsedValue);
    });

    it('should handle JSON primitives', () => {
      const testCases = [
        { input: '42', output: 42 },
        { input: 'true', output: true },
        { input: 'false', output: false },
        { input: 'null', output: null },
        { input: '"string value"', output: 'string value' }
      ];

      testCases.forEach(({ input, output }) => {
        mockExtractMockTagValue.mockReturnValue(input);
        mockTryParseJson.mockReturnValue({ success: true, data: output });

        const result = resolveMockValue(mockProperty);

        expect(result).toBe(output);
      });
    });

    it('should handle complex arrow functions', () => {
      const complexArrowFunction = '() => ({ id: Math.random(), timestamp: Date.now() })';
      const evaluatedValue = { id: 0.123, timestamp: 1672531200000 };
      
      mockExtractMockTagValue.mockReturnValue(complexArrowFunction);
      mockTryParseJson.mockReturnValue({ success: false });
      mockIsArrowFunction.mockReturnValue(true);
      mockEvaluateArrowFunction.mockReturnValue(evaluatedValue);

      const result = resolveMockValue(mockProperty);

      expect(result).toEqual(evaluatedValue);
    });

    it('should handle arrow functions with parameters', () => {
      const parameterizedFunction = '(x, y) => x + y';
      const evaluatedValue = 'function result';
      
      mockExtractMockTagValue.mockReturnValue(parameterizedFunction);
      mockTryParseJson.mockReturnValue({ success: false });
      mockIsArrowFunction.mockReturnValue(true);
      mockEvaluateArrowFunction.mockReturnValue(evaluatedValue);

      const result = resolveMockValue(mockProperty);

      expect(result).toBe(evaluatedValue);
    });

    it('should handle empty string mock values', () => {
      mockExtractMockTagValue.mockReturnValue('');
      mockTryParseJson.mockReturnValue({ success: false });
      mockIsArrowFunction.mockReturnValue(false);

      const result = resolveMockValue(mockProperty);

      expect(result).toBe('');
    });

    it('should handle whitespace-only mock values', () => {
      const whitespaceValue = '   \n\t  ';
      
      mockExtractMockTagValue.mockReturnValue(whitespaceValue);
      mockTryParseJson.mockReturnValue({ success: false });
      mockIsArrowFunction.mockReturnValue(false);

      const result = resolveMockValue(mockProperty);

      expect(result).toBe(whitespaceValue);
    });

    it('should handle special characters in string values', () => {
      const specialValue = '!@#$%^&*()_+-=[]{}|;\':",./<>?';
      
      mockExtractMockTagValue.mockReturnValue(specialValue);
      mockTryParseJson.mockReturnValue({ success: false });
      mockIsArrowFunction.mockReturnValue(false);

      const result = resolveMockValue(mockProperty);

      expect(result).toBe(specialValue);
    });

    it('should handle unicode characters in string values', () => {
      const unicodeValue = '🚀 Unicode test: café, naïve, résumé';
      
      mockExtractMockTagValue.mockReturnValue(unicodeValue);
      mockTryParseJson.mockReturnValue({ success: false });
      mockIsArrowFunction.mockReturnValue(false);

      const result = resolveMockValue(mockProperty);

      expect(result).toBe(unicodeValue);
    });

    it('should handle malformed JSON gracefully', () => {
      const malformedJson = '{"incomplete": json';
      
      mockExtractMockTagValue.mockReturnValue(malformedJson);
      mockTryParseJson.mockReturnValue({ success: false });
      mockIsArrowFunction.mockReturnValue(false);

      const result = resolveMockValue(mockProperty);

      expect(result).toBe(malformedJson);
    });

    it('should handle edge case where isArrowFunction returns true but evaluateArrowFunction returns undefined', () => {
      const arrowFunction = '() => undefined';
      
      mockExtractMockTagValue.mockReturnValue(arrowFunction);
      mockTryParseJson.mockReturnValue({ success: false });
      mockIsArrowFunction.mockReturnValue(true);
      mockEvaluateArrowFunction.mockReturnValue(undefined);

      const result = resolveMockValue(mockProperty);

      expect(result).toBeUndefined();
    });

    it('should handle null property input', () => {
      const result = resolveMockValue(null as any);

      expect(result).toBeUndefined();
      expect(mockExtractMockTagValue).not.toHaveBeenCalled();
    });

    it('should handle undefined property input', () => {
      const result = resolveMockValue(undefined);

      expect(result).toBeUndefined();
      expect(mockExtractMockTagValue).not.toHaveBeenCalled();
    });

    it('should handle JSON parsing success but with undefined data', () => {
      mockExtractMockTagValue.mockReturnValue('undefined');
      mockTryParseJson.mockReturnValue({ success: true, data: undefined });

      const result = resolveMockValue(mockProperty);

      expect(result).toBeUndefined();
    });

    it('should handle JSON parsing success with null data', () => {
      mockExtractMockTagValue.mockReturnValue('null');
      mockTryParseJson.mockReturnValue({ success: true, data: null });

      const result = resolveMockValue(mockProperty);

      expect(result).toBeNull();
    });

    it('should handle arrow function evaluation returning null', () => {
      const arrowFunction = '() => null';
      
      mockExtractMockTagValue.mockReturnValue(arrowFunction);
      mockTryParseJson.mockReturnValue({ success: false });
      mockIsArrowFunction.mockReturnValue(true);
      mockEvaluateArrowFunction.mockReturnValue(null);

      const result = resolveMockValue(mockProperty);

      expect(result).toBeNull();
    });
  });
});
