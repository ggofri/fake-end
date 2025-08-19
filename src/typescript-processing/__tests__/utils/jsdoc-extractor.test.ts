import { extractMockTagValue, extractGuardFromInterface } from '../../utils/jsdoc-extractor';

jest.mock('ts-morph', () => ({}));

interface MockJSDocTag {
  getTagName: () => string;
  getComment: () => string | undefined;
}

interface MockJSDoc {
  getTags: () => MockJSDocTag[];
}

interface MockPropertySignature {
  getJsDocs: () => MockJSDoc[];
}

interface MockInterfaceDeclaration {
  getJsDocs: () => MockJSDoc[];
}

describe('jsdoc-extractor', () => {
  describe('extractMockTagValue', () => {
    test('should extract mock tag value when present', () => {
      const mockTag: MockJSDocTag = {
        getTagName: () => 'mock',
        getComment: () => 'faker.name.firstName()'
      };

      const mockJSDoc: MockJSDoc = {
        getTags: () => [mockTag]
      };

      const mockProperty: MockPropertySignature = {
        getJsDocs: () => [mockJSDoc]
      };

      const result = extractMockTagValue(mockProperty as any);

      expect(result).toBe('faker.name.firstName()');
    });

    test('should return null when mock tag is not present', () => {
      const mockTag: MockJSDocTag = {
        getTagName: () => 'description',
        getComment: () => 'Some description'
      };

      const mockJSDoc: MockJSDoc = {
        getTags: () => [mockTag]
      };

      const mockProperty: MockPropertySignature = {
        getJsDocs: () => [mockJSDoc]
      };

      const result = extractMockTagValue(mockProperty as any);

      expect(result).toBeNull();
    });

    test('should return null when mock tag has no comment', () => {
      const mockTag: MockJSDocTag = {
        getTagName: () => 'mock',
        getComment: () => undefined
      };

      const mockJSDoc: MockJSDoc = {
        getTags: () => [mockTag]
      };

      const mockProperty: MockPropertySignature = {
        getJsDocs: () => [mockJSDoc]
      };

      const result = extractMockTagValue(mockProperty as any);

      expect(result).toBeNull();
    });

    test('should return null when mock comment is not a string', () => {
      const mockTag: MockJSDocTag = {
        getTagName: () => 'mock',
        getComment: () => undefined
      };

      const mockJSDoc: MockJSDoc = {
        getTags: () => [mockTag]
      };

      const mockProperty: MockPropertySignature = {
        getJsDocs: () => [mockJSDoc]
      };

      const result = extractMockTagValue(mockProperty as any);

      expect(result).toBeNull();
    });

    test('should handle property with no JSDoc', () => {
      const mockProperty: MockPropertySignature = {
        getJsDocs: () => []
      };

      const result = extractMockTagValue(mockProperty as any);

      expect(result).toBeNull();
    });

    test('should find mock tag among multiple tags', () => {
      const mockTags: MockJSDocTag[] = [
        {
          getTagName: () => 'description',
          getComment: () => 'Some description'
        },
        {
          getTagName: () => 'mock',
          getComment: () => 'faker.internet.email()'
        },
        {
          getTagName: () => 'example',
          getComment: () => 'user@example.com'
        }
      ];

      const mockJSDoc: MockJSDoc = {
        getTags: () => mockTags
      };

      const mockProperty: MockPropertySignature = {
        getJsDocs: () => [mockJSDoc]
      };

      const result = extractMockTagValue(mockProperty as any);

      expect(result).toBe('faker.internet.email()');
    });

    test('should handle multiple JSDoc blocks', () => {
      const mockTag: MockJSDocTag = {
        getTagName: () => 'mock',
        getComment: () => 'faker.random.uuid()'
      };

      const mockJSDocs: MockJSDoc[] = [
        {
          getTags: () => []
        },
        {
          getTags: () => [mockTag]
        }
      ];

      const mockProperty: MockPropertySignature = {
        getJsDocs: () => mockJSDocs
      };

      const result = extractMockTagValue(mockProperty as any);

      expect(result).toBe('faker.random.uuid()');
    });
  });

  describe('extractGuardFromInterface', () => {
    test('should extract valid guard configuration', () => {
      const validGuardConfig = JSON.stringify({
        condition: {
          field: 'role',
          operator: 'equals',
          value: 'admin'
        },
        left: {
          status: 403,
          body: { error: 'Forbidden' }
        },
        right: {
          status: 200,
          body: { success: true }
        }
      });

      const mockTag: MockJSDocTag = {
        getTagName: () => 'guard',
        getComment: () => validGuardConfig
      };

      const mockJSDoc: MockJSDoc = {
        getTags: () => [mockTag]
      };

      const mockInterface: MockInterfaceDeclaration = {
        getJsDocs: () => [mockJSDoc]
      };

      const result = extractGuardFromInterface(mockInterface as any);

      expect(result).not.toBeNull();
      expect(result).toHaveProperty('condition');
      expect(result).toHaveProperty('left');
      expect(result).toHaveProperty('right');
    });

    test('should return null when guard tag is not present', () => {
      const mockTag: MockJSDocTag = {
        getTagName: () => 'description',
        getComment: () => 'Some description'
      };

      const mockJSDoc: MockJSDoc = {
        getTags: () => [mockTag]
      };

      const mockInterface: MockInterfaceDeclaration = {
        getJsDocs: () => [mockJSDoc]
      };

      const result = extractGuardFromInterface(mockInterface as any);

      expect(result).toBeNull();
    });

    test('should return null when guard comment is not valid JSON', () => {
      const mockTag: MockJSDocTag = {
        getTagName: () => 'guard',
        getComment: () => 'invalid json string'
      };

      const mockJSDoc: MockJSDoc = {
        getTags: () => [mockTag]
      };

      const mockInterface: MockInterfaceDeclaration = {
        getJsDocs: () => [mockJSDoc]
      };

      const result = extractGuardFromInterface(mockInterface as any);

      expect(result).toBeNull();
    });

    test('should return null when guard config is missing required fields', () => {
      const invalidGuardConfig = JSON.stringify({
        condition: {
          field: 'role'
          
        },
        left: { status: 403 },
        right: { status: 200 }
      });

      const mockTag: MockJSDocTag = {
        getTagName: () => 'guard',
        getComment: () => invalidGuardConfig
      };

      const mockJSDoc: MockJSDoc = {
        getTags: () => [mockTag]
      };

      const mockInterface: MockInterfaceDeclaration = {
        getJsDocs: () => [mockJSDoc]
      };

      const result = extractGuardFromInterface(mockInterface as any);

      expect(result).toBeNull();
    });

    test('should return null when guard has invalid operator', () => {
      const invalidGuardConfig = JSON.stringify({
        condition: {
          field: 'role',
          operator: 'invalid_operator'
        },
        left: { status: 403 },
        right: { status: 200 }
      });

      const mockTag: MockJSDocTag = {
        getTagName: () => 'guard',
        getComment: () => invalidGuardConfig
      };

      const mockJSDoc: MockJSDoc = {
        getTags: () => [mockTag]
      };

      const mockInterface: MockInterfaceDeclaration = {
        getJsDocs: () => [mockJSDoc]
      };

      const result = extractGuardFromInterface(mockInterface as any);

      expect(result).toBeNull();
    });

    test('should return null when guard response is missing status', () => {
      const invalidGuardConfig = JSON.stringify({
        condition: {
          field: 'role',
          operator: 'equals'
        },
        left: { body: { error: 'Forbidden' } }, 
        right: { status: 200 }
      });

      const mockTag: MockJSDocTag = {
        getTagName: () => 'guard',
        getComment: () => invalidGuardConfig
      };

      const mockJSDoc: MockJSDoc = {
        getTags: () => [mockTag]
      };

      const mockInterface: MockInterfaceDeclaration = {
        getJsDocs: () => [mockJSDoc]
      };

      const result = extractGuardFromInterface(mockInterface as any);

      expect(result).toBeNull();
    });

    test('should validate all supported operators', () => {
      const validOperators = ['equals', 'not_equals', 'contains', 'not_contains', 'exists', 'not_exists'];

      validOperators.forEach(operator => {
        const validGuardConfig = JSON.stringify({
          condition: {
            field: 'testField',
            operator
          },
          left: { status: 403 },
          right: { status: 200 }
        });

        const mockTag: MockJSDocTag = {
          getTagName: () => 'guard',
          getComment: () => validGuardConfig
        };

        const mockJSDoc: MockJSDoc = {
          getTags: () => [mockTag]
        };

        const mockInterface: MockInterfaceDeclaration = {
          getJsDocs: () => [mockJSDoc]
        };

        const result = extractGuardFromInterface(mockInterface as any);

        expect(result).not.toBeNull();
        expect(result?.condition.operator).toBe(operator);
      });
    });

    test('should return null when guard comment is not a string', () => {
      const mockTag: MockJSDocTag = {
        getTagName: () => 'guard',
        getComment: () => undefined
      };

      const mockJSDoc: MockJSDoc = {
        getTags: () => [mockTag]
      };

      const mockInterface: MockInterfaceDeclaration = {
        getJsDocs: () => [mockJSDoc]
      };

      const result = extractGuardFromInterface(mockInterface as any);

      expect(result).toBeNull();
    });

    test('should handle interface with no JSDoc', () => {
      const mockInterface: MockInterfaceDeclaration = {
        getJsDocs: () => []
      };

      const result = extractGuardFromInterface(mockInterface as any);

      expect(result).toBeNull();
    });
  });
});
