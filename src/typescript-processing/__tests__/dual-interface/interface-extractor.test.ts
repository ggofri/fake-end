import { interfaceExtractor } from '@/typescript-processing/dual-interface/interface-extractor';
import { Project } from 'ts-morph';

describe('interface-extractor', () => {
  describe('extractInterface', () => {
    it('should extract interface with all properties', () => {
      const project = new Project();
      const sourceFile = project.createSourceFile('test.ts', `
        interface UserResponse {
          id: string;
          name: string;
          email?: string;
          age: number;
        }
      `);

      const interfaceDecl = sourceFile.getInterface('UserResponse')!;
      const extracted = interfaceExtractor.extractInterface(interfaceDecl);

      expect(extracted.name).toBe('UserResponse');
      expect(extracted.properties).toHaveLength(4);
      expect(extracted.properties[0]).toEqual({
        name: 'id',
        type: 'string',
        optional: false
      });
      expect(extracted.properties[2]).toEqual({
        name: 'email',
        type: 'string',
        optional: true
      });
      expect(extracted.hasJsDocComments).toBe(false);
    });

    it('should extract JSDoc comments from properties', () => {
      const project = new Project();
      const sourceFile = project.createSourceFile('test.ts', `
        interface UserResponse {
          /** The unique identifier */
          id: string;
          /** User's full name */
          name: string;
          email: string;
        }
      `);

      const interfaceDecl = sourceFile.getInterface('UserResponse')!;
      const extracted = interfaceExtractor.extractInterface(interfaceDecl);

      expect(extracted.hasJsDocComments).toBe(true);
      expect(extracted.properties[0].jsDocComment).toBe('The unique identifier');
      expect(extracted.properties[1].jsDocComment).toBe("User's full name");
      expect(extracted.properties[2].jsDocComment).toBeUndefined();
    });

    it('should handle empty interfaces', () => {
      const project = new Project();
      const sourceFile = project.createSourceFile('test.ts', `
        interface EmptyResponse {}
      `);

      const interfaceDecl = sourceFile.getInterface('EmptyResponse')!;
      const extracted = interfaceExtractor.extractInterface(interfaceDecl);

      expect(extracted.name).toBe('EmptyResponse');
      expect(extracted.properties).toHaveLength(0);
      expect(extracted.hasJsDocComments).toBe(false);
    });
  });

  describe('generateInterfaceCode', () => {
    it('should generate TypeScript interface code', () => {
      const extracted = {
        name: 'TestResponse',
        properties: [
          { name: 'id', type: 'string', optional: false },
          { name: 'name', type: 'string', optional: false },
          { name: 'email', type: 'string | undefined', optional: true }
        ],
        hasJsDocComments: false,
        originalDeclaration: {} as any
      };

      const code = interfaceExtractor.generateInterfaceCode(extracted);

      expect(code).toContain('export interface TestResponse {');
      expect(code).toContain('  id: string;');
      expect(code).toContain('  name: string;');
      expect(code).toContain('  email?: string | undefined;');
      expect(code).toContain('}');
    });

    it('should generate interface code with custom name', () => {
      const extracted = {
        name: 'OriginalName',
        properties: [
          { name: 'message', type: 'string', optional: false }
        ],
        hasJsDocComments: false,
        originalDeclaration: {} as any
      };

      const code = interfaceExtractor.generateInterfaceCode(extracted, 'NewName');

      expect(code).toContain('export interface NewName {');
      expect(code).toContain('  message: string;');
    });

    it('should include JSDoc comments in generated code', () => {
      const extracted = {
        name: 'DocumentedResponse',
        properties: [
          { 
            name: 'id', 
            type: 'string', 
            optional: false,
            jsDocComment: 'Unique identifier'
          },
          { name: 'name', type: 'string', optional: false }
        ],
        hasJsDocComments: true,
        originalDeclaration: {} as any
      };

      const code = interfaceExtractor.generateInterfaceCode(extracted);

      expect(code).toContain('/** Unique identifier */');
      expect(code).toContain('  id: string;');
      expect(code).not.toContain('/** name comment');
    });
  });

  describe('renameInterface', () => {
    it('should create new interface with different name', () => {
      const original = {
        name: 'OriginalName',
        properties: [
          { name: 'data', type: 'any', optional: false }
        ],
        hasJsDocComments: false,
        originalDeclaration: {} as any
      };

      const renamed = interfaceExtractor.renameInterface(original, 'NewName');

      expect(renamed.name).toBe('NewName');
      expect(renamed.properties).toEqual(original.properties);
      expect(renamed.hasJsDocComments).toBe(false);
      expect(renamed.originalDeclaration).toBe(original.originalDeclaration);
    });

    it('should preserve all other properties when renaming', () => {
      const original = {
        name: 'ComplexInterface',
        properties: [
          { 
            name: 'field1', 
            type: 'string', 
            optional: true,
            jsDocComment: 'First field'
          },
          { name: 'field2', type: 'number', optional: false }
        ],
        hasJsDocComments: true,
        originalDeclaration: {} as any
      };

      const renamed = interfaceExtractor.renameInterface(original, 'RenamedInterface');

      expect(renamed.name).toBe('RenamedInterface');
      expect(renamed.properties).toHaveLength(2);
      expect(renamed.properties[0].jsDocComment).toBe('First field');
      expect(renamed.hasJsDocComments).toBe(true);
    });
  });
});
