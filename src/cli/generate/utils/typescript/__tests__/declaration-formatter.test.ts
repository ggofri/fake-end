import { generateFieldDeclaration } from '../declaration-formatter';
import { TypeScriptField } from '@/cli/generate/utils/typescript-generator';

describe('declaration-formatter', () => {
  describe('generateFieldDeclaration', () => {
    it('should generate simple field declaration', () => {
      const field: TypeScriptField = {
        name: 'id',
        type: 'number',
        mockValue: '"123"'
      };

      const result = generateFieldDeclaration(field);

      expect(result).toBe('  /** @mock "123" */\n  id: number;');
    });

    it('should generate optional field declaration', () => {
      const field: TypeScriptField = {
        name: 'description',
        type: 'string',
        mockValue: '"Test description"',
        isOptional: true
      };

      const result = generateFieldDeclaration(field);

      expect(result).toBe('  /** @mock "Test description" */\n  description?: string;');
    });

    it('should generate field declaration without mock value', () => {
      const field: TypeScriptField = {
        name: 'data',
        type: 'unknown'
      };

      const result = generateFieldDeclaration(field);

      expect(result).toBe('  data: unknown;');
    });

    it('should handle complex types', () => {
      const field: TypeScriptField = {
        name: 'items',
        type: 'Array<{id: number; name: string}>',
        mockValue: '[{id: "mock-id-123", name: "Sample Name"}]'
      };

      const result = generateFieldDeclaration(field);

      expect(result).toBe('  /** @mock [{id: "mock-id-123", name: "Sample Name"}] */\n  items: Array<{id: number; name: string}>;');
    });

    it('should handle union types', () => {
      const field: TypeScriptField = {
        name: 'value',
        type: 'string | null',
        mockValue: 'null'
      };

      const result = generateFieldDeclaration(field);

      expect(result).toBe('  /** @mock null */\n  value: string | null;');
    });
  });
});
