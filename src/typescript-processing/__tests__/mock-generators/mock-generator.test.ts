import { generateMockFromInterface } from '@/typescript-processing/mock-generator/generators/mock-generator';

jest.mock('ts-morph', () => ({
  Node: {
    isPropertySignature: jest.fn()
  }
}));

jest.mock('@/shared/constants', () => ({
  MAX_COUNT_VALUE: 100,
  MAX_ID_VALUE: 1000,
  MAX_PRICE_VALUE: 1000,
  PRICE_PRECISION_MULTIPLIER: 100,
  BOOLEAN_PROBABILITY: 0.5,
  ID_STRING_BASE: 36,
  ID_SUBSTRING_START: 2,
  ID_SUBSTRING_LENGTH: 10
}));

jest.mock('@/typescript-processing/utils', () => ({
  resolveMockValue: jest.fn()
}));

jest.mock('@/typescript-processing/utils/realistic-value-generator', () => ({
  generateRealisticValue: jest.fn()
}));

import { Node } from 'ts-morph';
import { resolveMockValue } from '@/typescript-processing/utils';
import { generateRealisticValue } from '@/typescript-processing/utils/realistic-value-generator';

const mockIsPropertySignature = Node.isPropertySignature as jest.MockedFunction<typeof Node.isPropertySignature>;
const mockResolveMockValue = resolveMockValue as jest.MockedFunction<typeof resolveMockValue>;
const mockGenerateRealisticValue = generateRealisticValue as jest.MockedFunction<typeof generateRealisticValue>;

interface MockPropertySignature {
  getName: () => string;
  getTypeNode: () => MockTypeNode | undefined;
  hasQuestionToken: () => boolean;
}

interface MockTypeNode {
  getKindName: () => string;
  getFirstChild: () => MockTypeNode | undefined;
}

interface MockInterfaceDeclaration {
  getProperties: () => MockPropertySignature[];
}

describe('typescript/mock-generator', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    mockResolveMockValue.mockReturnValue(undefined);
    mockGenerateRealisticValue.mockReturnValue(null);
    
    jest.spyOn(Math, 'random').mockReturnValue(0.5);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('generateMockFromInterface', () => {
    test('should generate mock data for required properties only', () => {
      const mockProperty1: MockPropertySignature = {
        getName: () => 'name',
        getTypeNode: () => ({ getKindName: () => 'StringKeyword', getFirstChild: () => undefined }),
        hasQuestionToken: () => false
      };

      const mockProperty2: MockPropertySignature = {
        getName: () => 'optionalProp',
        getTypeNode: () => ({ getKindName: () => 'StringKeyword', getFirstChild: () => undefined }),
        hasQuestionToken: () => true
      };

      const mockInterface: MockInterfaceDeclaration = {
        getProperties: () => [mockProperty1, mockProperty2]
      };

      mockIsPropertySignature.mockReturnValue(true);

      const result = generateMockFromInterface(mockInterface as any);

      expect(result).toHaveProperty('name');
      expect(result).not.toHaveProperty('optionalProp');
      expect(result.name).toBe('Sample Name');
    });

    test('should skip non-property signature nodes', () => {
      const mockProperty: MockPropertySignature = {
        getName: () => 'name',
        getTypeNode: () => ({ getKindName: () => 'StringKeyword', getFirstChild: () => undefined }),
        hasQuestionToken: () => false
      };

      const mockInterface: MockInterfaceDeclaration = {
        getProperties: () => [mockProperty]
      };

      mockIsPropertySignature.mockReturnValue(false);

      const result = generateMockFromInterface(mockInterface as any);

      expect(result).toEqual({});
    });

    test('should use resolved mock value when available', () => {
      const mockProperty: MockPropertySignature = {
        getName: () => 'customProp',
        getTypeNode: () => ({ getKindName: () => 'StringKeyword', getFirstChild: () => undefined }),
        hasQuestionToken: () => false
      };

      const mockInterface: MockInterfaceDeclaration = {
        getProperties: () => [mockProperty]
      };

      mockIsPropertySignature.mockReturnValue(true);
      mockResolveMockValue.mockReturnValue('resolved-value');

      const result = generateMockFromInterface(mockInterface as any, true, { test: 'body' });

      expect(result.customProp).toBe('resolved-value');
      expect(mockResolveMockValue).toHaveBeenCalledWith(
        mockProperty,
        true,
        { test: 'body' }
      );
    });

    test('should pass isDynamic parameter correctly', () => {
      const mockProperty: MockPropertySignature = {
        getName: () => 'dynamicProp',
        getTypeNode: () => ({ getKindName: () => 'StringKeyword', getFirstChild: () => undefined }),
        hasQuestionToken: () => false
      };

      const mockInterface: MockInterfaceDeclaration = {
        getProperties: () => [mockProperty]
      };

      mockIsPropertySignature.mockReturnValue(true);

      generateMockFromInterface(mockInterface as any, true);

      expect(mockResolveMockValue).toHaveBeenCalledWith(
        mockProperty,
        true,
        undefined
      );
    });
  });

  describe('generateDefaultMockValue', () => {
    test('should return null for undefined type node', () => {
      const mockProperty: MockPropertySignature = {
        getName: () => 'nullProp',
        getTypeNode: () => undefined,
        hasQuestionToken: () => false
      };

      const mockInterface: MockInterfaceDeclaration = {
        getProperties: () => [mockProperty]
      };

      mockIsPropertySignature.mockReturnValue(true);

      const result = generateMockFromInterface(mockInterface as any);

      expect(result.nullProp).toBeNull();
    });

    test('should use realistic value when available', () => {
      const mockProperty: MockPropertySignature = {
        getName: () => 'realisticProp',
        getTypeNode: () => ({ getKindName: () => 'StringKeyword', getFirstChild: () => undefined }),
        hasQuestionToken: () => false
      };

      const mockInterface: MockInterfaceDeclaration = {
        getProperties: () => [mockProperty]
      };

      mockIsPropertySignature.mockReturnValue(true);
      mockGenerateRealisticValue.mockReturnValue('realistic-value');

      const result = generateMockFromInterface(mockInterface as any);

      expect(result.realisticProp).toBe('realistic-value');
      expect(mockGenerateRealisticValue).toHaveBeenCalledWith('realisticProp', 'StringKeyword');
    });

    test('should handle string types with specific property names', () => {
      const testCases = [
        { name: 'userId', expected: expect.any(String) },
        { name: 'email', expected: 'user@example.com' },
        { name: 'fullName', expected: 'Sample Name' },
        { name: 'profileUrl', expected: 'https://example.com' },
        { name: 'createdDate', expected: expect.any(String) },
        { name: 'genericProp', expected: 'sample_genericProp' }
      ];

      testCases.forEach(({ name, expected }) => {
        const mockProperty: MockPropertySignature = {
          getName: () => name,
          getTypeNode: () => ({ getKindName: () => 'StringKeyword', getFirstChild: () => undefined }),
          hasQuestionToken: () => false
        };

        const mockInterface: MockInterfaceDeclaration = {
          getProperties: () => [mockProperty]
        };

        mockIsPropertySignature.mockReturnValue(true);

        const result = generateMockFromInterface(mockInterface as any);

        if (typeof expected === 'string') {
          expect(result[name]).toBe(expected);
        } else {
          expect(result[name]).toEqual(expected);
        }
      });
    });

    test('should handle number types with specific property names', () => {
      const testCases = [
        { name: 'id', expected: expect.any(Number) },
        { name: 'count', expected: expect.any(Number) },
        { name: 'price', expected: expect.any(Number) },
        { name: 'genericNumber', expected: expect.any(Number) }
      ];

      testCases.forEach(({ name }) => {
        const mockProperty: MockPropertySignature = {
          getName: () => name,
          getTypeNode: () => ({ getKindName: () => 'NumberKeyword', getFirstChild: () => undefined }),
          hasQuestionToken: () => false
        };

        const mockInterface: MockInterfaceDeclaration = {
          getProperties: () => [mockProperty]
        };

        mockIsPropertySignature.mockReturnValue(true);

        const result = generateMockFromInterface(mockInterface as any);

        expect(typeof result[name]).toBe('number');
        expect(result[name]).toBeGreaterThanOrEqual(0);
      });
    });

    test('should handle boolean types', () => {
      const mockProperty: MockPropertySignature = {
        getName: () => 'isActive',
        getTypeNode: () => ({ getKindName: () => 'BooleanKeyword', getFirstChild: () => undefined }),
        hasQuestionToken: () => false
      };

      const mockInterface: MockInterfaceDeclaration = {
        getProperties: () => [mockProperty]
      };

      mockIsPropertySignature.mockReturnValue(true);

      const result = generateMockFromInterface(mockInterface as any);

      expect(typeof result.isActive).toBe('boolean');
    });

    test('should handle array types', () => {
      const mockChildTypeNode: MockTypeNode = {
        getKindName: () => 'StringKeyword',
        getFirstChild: () => undefined
      };

      const mockProperty: MockPropertySignature = {
        getName: () => 'items',
        getTypeNode: () => ({ 
          getKindName: () => 'ArrayType', 
          getFirstChild: () => mockChildTypeNode 
        }),
        hasQuestionToken: () => false
      };

      const mockInterface: MockInterfaceDeclaration = {
        getProperties: () => [mockProperty]
      };

      mockIsPropertySignature.mockReturnValue(true);

      const result = generateMockFromInterface(mockInterface as any);

      expect(Array.isArray(result.items)).toBe(true);
      expect((result.items as unknown[]).length).toBe(1);
    });

    test('should handle type references', () => {
      const mockProperty: MockPropertySignature = {
        getName: () => 'complexObject',
        getTypeNode: () => ({ getKindName: () => 'TypeReference', getFirstChild: () => undefined }),
        hasQuestionToken: () => false
      };

      const mockInterface: MockInterfaceDeclaration = {
        getProperties: () => [mockProperty]
      };

      mockIsPropertySignature.mockReturnValue(true);

      const result = generateMockFromInterface(mockInterface as any);

      expect(result.complexObject).toEqual({});
    });

    test('should handle unknown types', () => {
      const mockProperty: MockPropertySignature = {
        getName: () => 'unknownProp',
        getTypeNode: () => ({ getKindName: () => 'UnknownType', getFirstChild: () => undefined }),
        hasQuestionToken: () => false
      };

      const mockInterface: MockInterfaceDeclaration = {
        getProperties: () => [mockProperty]
      };

      mockIsPropertySignature.mockReturnValue(true);

      const result = generateMockFromInterface(mockInterface as any);

      expect(result.unknownProp).toBeNull();
    });
  });
});
