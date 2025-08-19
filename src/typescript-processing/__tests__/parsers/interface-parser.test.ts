import { Project, Node } from 'ts-morph';
import { createTypeScriptProject, extractDefaultInterface, parseInterfaceWithCache } from '../../interface-parser/parsers/interface-parser';
import { interfaceCache } from '@/typescript-processing/cache/interface-cache';

jest.mock('@/typescript-processing/cache/interface-cache', () => ({
  interfaceCache: {
    get: jest.fn(),
    set: jest.fn()
  }
}));

const mockInterfaceCache = interfaceCache as jest.Mocked<typeof interfaceCache>;

describe('InterfaceParser', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('createTypeScriptProject', () => {
    it('should create a TypeScript project with correct configuration', () => {
      const project = createTypeScriptProject();

      expect(project).toBeInstanceOf(Project);
      expect(project.getCompilerOptions()).toMatchObject({
        target: 99,
        module: 99,
        moduleResolution: 2,
        allowSyntheticDefaultImports: true,
        esModuleInterop: true,
        skipLibCheck: true,
        strict: false
      });
    });

    it('should use in-memory file system', () => {
      const project = createTypeScriptProject();
      
      expect(project.getFileSystem().constructor.name).toContain('InMemory');
    });

    it('should create independent project instances', () => {
      const project1 = createTypeScriptProject();
      const project2 = createTypeScriptProject();

      expect(project1).not.toBe(project2);
    });

    it('should have consistent compiler options across instances', () => {
      const project1 = createTypeScriptProject();
      const project2 = createTypeScriptProject();

      expect(project1.getCompilerOptions()).toEqual(project2.getCompilerOptions());
    });
  });

  describe('extractDefaultInterface', () => {
    let project: Project;

    beforeEach(() => {
      project = createTypeScriptProject();
    });

    it('should extract default exported interface', () => {
      const content = `
        interface User {
          id: number;
          name: string;
        }
        export default User;
      `;
      
      const sourceFile = project.createSourceFile('test.ts', content);
      const result = extractDefaultInterface(sourceFile);

      expect(result).not.toBeNull();
      expect(Node.isInterfaceDeclaration(result!)).toBe(true);
      expect(result!.getName()).toBe('User');
    });

    it('should return null when no default export exists', () => {
      const content = `
        interface User {
          id: number;
          name: string;
        }
      `;
      
      const sourceFile = project.createSourceFile('test.ts', content);
      const result = extractDefaultInterface(sourceFile);

      expect(result).toBeNull();
    });

    it('should return null when default export is not an interface', () => {
      const content = `
        const user = { id: 1, name: 'John' };
        export default user;
      `;
      
      const sourceFile = project.createSourceFile('test.ts', content);
      const result = extractDefaultInterface(sourceFile);

      expect(result).toBeNull();
    });

    it('should handle multiple exports with default interface', () => {
      const content = `
        interface User {
          id: number;
          name: string;
        }
        interface Product {
          id: number;
          title: string;
        }
        export { Product };
        export default User;
      `;
      
      const sourceFile = project.createSourceFile('test.ts', content);
      const result = extractDefaultInterface(sourceFile);

      expect(result).not.toBeNull();
      expect(result!.getName()).toBe('User');
    });

    it('should handle default export with alias', () => {
      const content = `
        interface UserInterface {
          id: number;
          name: string;
        }
        export default UserInterface;
      `;
      
      const sourceFile = project.createSourceFile('test.ts', content);
      const result = extractDefaultInterface(sourceFile);

      expect(result).not.toBeNull();
      expect(result!.getName()).toBe('UserInterface');
    });

    it('should return null for empty file', () => {
      const sourceFile = project.createSourceFile('test.ts', '');
      const result = extractDefaultInterface(sourceFile);

      expect(result).toBeNull();
    });

    it('should handle interface with extends clause', () => {
      const content = `
        interface BaseUser {
          id: number;
        }
        interface User extends BaseUser {
          name: string;
        }
        export default User;
      `;
      
      const sourceFile = project.createSourceFile('test.ts', content);
      const result = extractDefaultInterface(sourceFile);

      expect(result).not.toBeNull();
      expect(result!.getName()).toBe('User');
      expect(result!.getExtends().length).toBe(1);
    });

    it('should handle generic interfaces', () => {
      const content = `
        interface ApiResponse<T> {
          data: T;
          status: number;
        }
        export default ApiResponse;
      `;
      
      const sourceFile = project.createSourceFile('test.ts', content);
      const result = extractDefaultInterface(sourceFile);

      expect(result).not.toBeNull();
      expect(result!.getName()).toBe('ApiResponse');
      expect(result!.getTypeParameters().length).toBe(1);
    });

    it('should handle interfaces with complex property types', () => {
      const content = `
        interface User {
          id: number;
          name: string;
          addresses: Address[];
          metadata: Record<string, unknown>;
          createdAt: Date;
        }
        export default User;
      `;
      
      const sourceFile = project.createSourceFile('test.ts', content);
      const result = extractDefaultInterface(sourceFile);

      expect(result).not.toBeNull();
      expect(result!.getProperties().length).toBe(5);
    });

    it('should handle multiple default declarations', () => {
      const content = `
        interface User {
          id: number;
          name: string;
        }
        interface Admin {
          permissions: string[];
        }
        export default User;
      `;
      
      const sourceFile = project.createSourceFile('test.ts', content);
      const result = extractDefaultInterface(sourceFile);

      expect(result).not.toBeNull();
      expect(result!.getName()).toBe('User');
    });
  });

  describe('parseInterfaceWithCache', () => {
    const filePath = '/test/user.ts';
    const content = `
      interface User {
        id: number;
        name: string;
      }
      export default User;
    `;

    it('should return cached result when available', () => {
      const mockProject = createTypeScriptProject();
      const mockInterface = mockProject.createSourceFile('mock.ts', content).getInterfaces()[0];
      const cachedResult = { interface: mockInterface!, project: mockProject };
      
      mockInterfaceCache.get.mockReturnValue(cachedResult);

      const result = parseInterfaceWithCache(filePath, content);

      expect(mockInterfaceCache.get).toHaveBeenCalledWith(filePath, content);
      expect(result).toBe(cachedResult);
      expect(mockInterfaceCache.set).not.toHaveBeenCalled();
    });

    it('should parse and cache new interface when not cached', () => {
      mockInterfaceCache.get.mockReturnValue(null);

      const result = parseInterfaceWithCache(filePath, content);

      expect(mockInterfaceCache.get).toHaveBeenCalledWith(filePath, content);
      expect(result).not.toBeNull();
      expect(result!.interface).toBeDefined();
      expect(result!.project).toBeDefined();
      expect(Node.isInterfaceDeclaration(result!.interface)).toBe(true);
      expect(mockInterfaceCache.set).toHaveBeenCalledWith(
        filePath,
        content,
        result!.interface,
        result!.project
      );
    });

    it('should return null when no default interface found', () => {
      const invalidContent = `
        const user = { id: 1, name: 'John' };
        export default user;
      `;
      
      mockInterfaceCache.get.mockReturnValue(null);

      const result = parseInterfaceWithCache(filePath, invalidContent);

      expect(result).toBeNull();
      expect(mockInterfaceCache.set).not.toHaveBeenCalled();
    });

    it('should handle empty content', () => {
      mockInterfaceCache.get.mockReturnValue(null);

      const result = parseInterfaceWithCache(filePath, '');

      expect(result).toBeNull();
    });

    it('should handle syntax errors gracefully', () => {
      const invalidContent = `
        interface User {
          id: number
          name: string
        }
        export default User;
      `;
      
      mockInterfaceCache.get.mockReturnValue(null);

      expect(() => parseInterfaceWithCache(filePath, invalidContent)).not.toThrow();
    });

    it('should create project with same configuration for each call', () => {
      mockInterfaceCache.get.mockReturnValue(null);

      const result1 = parseInterfaceWithCache('/path1.ts', content);
      const result2 = parseInterfaceWithCache('/path2.ts', content);

      expect(result1?.project.getCompilerOptions()).toEqual(result2?.project.getCompilerOptions());
    });

    it('should handle different file paths with same content', () => {
      mockInterfaceCache.get.mockReturnValue(null);

      const result1 = parseInterfaceWithCache('/path1.ts', content);
      const result2 = parseInterfaceWithCache('/path2.ts', content);

      expect(mockInterfaceCache.set).toHaveBeenCalledTimes(2);
      expect(mockInterfaceCache.set).toHaveBeenNthCalledWith(
        1,
        '/path1.ts',
        content,
        result1!.interface,
        result1!.project
      );
      expect(mockInterfaceCache.set).toHaveBeenNthCalledWith(
        2,
        '/path2.ts',
        content,
        result2!.interface,
        result2!.project
      );
    });

    it('should handle interface with JSDoc comments', () => {
      const contentWithJSDoc = `
        /**
         * User interface with JSDoc
         */
        interface User {
          /** User ID @mock 123 */
          id: number;
          /** User name @mock "John Doe" */
          name: string;
        }
        export default User;
      `;
      
      mockInterfaceCache.get.mockReturnValue(null);

      const result = parseInterfaceWithCache(filePath, contentWithJSDoc);

      expect(result).not.toBeNull();
      expect(result!.interface.getJsDocs().length).toBeGreaterThan(0);
    });

    it('should preserve interface structure and properties', () => {
      const complexContent = `
        interface User {
          id: number;
          name?: string;
          readonly email: string;
          tags: string[];
          metadata: { [key: string]: any };
        }
        export default User;
      `;
      
      mockInterfaceCache.get.mockReturnValue(null);

      const result = parseInterfaceWithCache(filePath, complexContent);

      expect(result).not.toBeNull();
      const properties = result!.interface.getProperties();
      expect(properties.length).toBe(5);
      expect(properties.some(p => p.hasQuestionToken())).toBe(true);
      expect(properties.some(p => p.isReadonly())).toBe(true);
    });
  });
});
