import { loadTypeScriptEndpoints } from '../loader/ts-loader';
import { InterfaceDeclaration, Project } from 'ts-morph';

interface MockInterfaceDeclaration {
  getName: () => string;
}

jest.mock('fs/promises', () => ({
  readFile: jest.fn()
}));

jest.mock('glob', () => ({
  glob: jest.fn()
}));

jest.mock('@/typescript-processing', () => ({
  parseInterfaceWithCache: jest.fn(),
  generateMockFromInterface: jest.fn(),
  extractEndpointInfoFromPath: jest.fn(),
  isValidTypeScriptEndpoint: jest.fn()
}));

jest.mock('@/typescript-processing/utils/jsdoc-extractor', () => ({
  extractGuardFromInterface: jest.fn()
}));

jest.mock('@/shared/utils', () => ({
  verboseError: jest.fn()
}));

jest.mock('chalk', () => {
  const mockChalk = {
    red: jest.fn((...args: any[]) => args.join(' '))
  };
  return {
    default: mockChalk,
    ...mockChalk
  };
});

import { readFile } from 'fs/promises';
import { glob } from 'glob';
import {
  parseInterfaceWithCache,
  generateMockFromInterface,
  extractEndpointInfoFromPath,
  isValidTypeScriptEndpoint
} from '@/typescript-processing';
import { extractGuardFromInterface } from '@/typescript-processing/utils/jsdoc-extractor';
import { verboseError } from '@/shared/utils';

const mockReadFile = readFile as jest.MockedFunction<typeof readFile>;
const mockGlob = glob as jest.MockedFunction<typeof glob>;
const mockParseInterfaceWithCache = parseInterfaceWithCache as jest.MockedFunction<typeof parseInterfaceWithCache>;
const mockGenerateMockFromInterface = generateMockFromInterface as jest.MockedFunction<typeof generateMockFromInterface>;
const mockExtractEndpointInfoFromPath = extractEndpointInfoFromPath as jest.MockedFunction<typeof extractEndpointInfoFromPath>;
const mockIsValidTypeScriptEndpoint = isValidTypeScriptEndpoint as jest.MockedFunction<typeof isValidTypeScriptEndpoint>;
const mockExtractGuardFromInterface = extractGuardFromInterface as jest.MockedFunction<typeof extractGuardFromInterface>;
const mockVerboseError = verboseError as jest.MockedFunction<typeof verboseError>;

describe('ts-loader', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('loadTypeScriptEndpoints', () => {
    test('should return empty array when no TypeScript files found', async () => {
      mockGlob.mockResolvedValue([]);

      const result = await loadTypeScriptEndpoints('/test/mock');

      expect(result).toEqual([]);
      expect(mockGlob).toHaveBeenCalledWith('/test/mock/**/*.ts', { absolute: true });
    });

    test('should process single TypeScript file successfully', async () => {
      const mockInterface: MockInterfaceDeclaration = { getName: () => 'TestInterface' };

      mockGlob.mockResolvedValue(['/test/mock/api/test.ts']);
      mockReadFile.mockResolvedValue('interface TestInterface { id: number; name: string; }');
      mockParseInterfaceWithCache.mockReturnValue({ interface: mockInterface as unknown as InterfaceDeclaration, project: {} as Project });
      mockExtractEndpointInfoFromPath.mockReturnValue({ httpMethod: 'GET', endpointPath: '/api/test' });
      mockGenerateMockFromInterface.mockReturnValue({ id: 1, name: 'test' });
      mockExtractGuardFromInterface.mockReturnValue(null);
      mockIsValidTypeScriptEndpoint.mockReturnValue(true);

      const result = await loadTypeScriptEndpoints('/test/mock');

      expect(result).toHaveLength(1);
      expect(result[0]).toMatchObject({
        method: 'GET',
        path: '/api/test',
        status: 200,
        body: { id: 1, name: 'test' },
        filePath: '/test/mock/api/test.ts',
        fullPath: '/api/test'
      });
    });

    test('should process multiple TypeScript files', async () => {
      const mockInterface1: MockInterfaceDeclaration = { getName: () => 'Interface1' };
      const mockInterface2: MockInterfaceDeclaration = { getName: () => 'Interface2' };

      mockGlob.mockResolvedValue(['/test/mock/api/users.ts', '/test/mock/api/posts.ts']);
      mockReadFile.mockResolvedValueOnce('interface Interface1 {}');
      mockReadFile.mockResolvedValueOnce('interface Interface2 {}');
      
      mockParseInterfaceWithCache.mockReturnValueOnce({ interface: mockInterface1 as unknown as InterfaceDeclaration, project: {} as Project });
      mockParseInterfaceWithCache.mockReturnValueOnce({ interface: mockInterface2 as unknown as InterfaceDeclaration, project: {} as Project });
      
      mockExtractEndpointInfoFromPath.mockReturnValueOnce({ httpMethod: 'GET', endpointPath: '/api/users' });
      mockExtractEndpointInfoFromPath.mockReturnValueOnce({ httpMethod: 'POST', endpointPath: '/api/posts' });
      
      mockGenerateMockFromInterface.mockReturnValueOnce({ userId: 1 });
      mockGenerateMockFromInterface.mockReturnValueOnce({ postId: 1 });
      
      mockExtractGuardFromInterface.mockReturnValue(null);
      mockIsValidTypeScriptEndpoint.mockReturnValue(true);

      const result = await loadTypeScriptEndpoints('/test/mock');

      expect(result).toHaveLength(2);
      expect(result[0].path).toBe('/api/users');
      expect(result[1].path).toBe('/api/posts');
    });

    test('should skip files that cannot be parsed', async () => {
      mockGlob.mockResolvedValue(['/test/mock/invalid.ts']);
      mockReadFile.mockResolvedValue('invalid typescript content');
      mockParseInterfaceWithCache.mockReturnValue(null);

      const result = await loadTypeScriptEndpoints('/test/mock');

      expect(result).toEqual([]);
    });

    test('should skip invalid endpoints', async () => {
      const mockInterface: MockInterfaceDeclaration = { getName: () => 'TestInterface' };

      mockGlob.mockResolvedValue(['/test/mock/api/test.ts']);
      mockReadFile.mockResolvedValue('interface TestInterface {}');
      mockParseInterfaceWithCache.mockReturnValue({ interface: mockInterface as unknown as InterfaceDeclaration, project: {} as Project });
      mockExtractEndpointInfoFromPath.mockReturnValue({ httpMethod: 'GET', endpointPath: '/api/test' });
      mockGenerateMockFromInterface.mockReturnValue({});
      mockExtractGuardFromInterface.mockReturnValue(null);
      mockIsValidTypeScriptEndpoint.mockReturnValue(false);

      const result = await loadTypeScriptEndpoints('/test/mock');

      expect(result).toEqual([]);
    });

    test('should handle file reading errors', async () => {
      const error = new Error('File read failed');
      mockGlob.mockResolvedValue(['/test/mock/error.ts']);
      mockReadFile.mockRejectedValue(error);

      const result = await loadTypeScriptEndpoints('/test/mock');

      expect(result).toEqual([]);
      expect(mockVerboseError).toHaveBeenCalledWith(
        expect.stringContaining('❌ Error loading TypeScript interface /test/mock/error.ts:'),
        error
      );
    });

    test('should pass noCache option to parseInterfaceWithCache', async () => {
      const mockInterface: MockInterfaceDeclaration = { getName: () => 'TestInterface' };

      mockGlob.mockResolvedValue(['/test/mock/api/test.ts']);
      mockReadFile.mockResolvedValue('interface TestInterface {}');
      mockParseInterfaceWithCache.mockReturnValue({ interface: mockInterface as unknown as InterfaceDeclaration, project: {} as Project });
      mockExtractEndpointInfoFromPath.mockReturnValue({ httpMethod: 'GET', endpointPath: '/api/test' });
      mockGenerateMockFromInterface.mockReturnValue({});
      mockExtractGuardFromInterface.mockReturnValue(null);
      mockIsValidTypeScriptEndpoint.mockReturnValue(true);

      await loadTypeScriptEndpoints('/test/mock', { noCache: true });

      expect(mockParseInterfaceWithCache).toHaveBeenCalledWith(
        '/test/mock/api/test.ts',
        'interface TestInterface {}',
        true
      );
    });

    test('should pass dynamicMocks option to generateMockFromInterface', async () => {
      const mockInterface: MockInterfaceDeclaration = { getName: () => 'TestInterface' };

      mockGlob.mockResolvedValue(['/test/mock/api/test.ts']);
      mockReadFile.mockResolvedValue('interface TestInterface {}');
      mockParseInterfaceWithCache.mockReturnValue({ interface: mockInterface as unknown as InterfaceDeclaration, project: {} as Project });
      mockExtractEndpointInfoFromPath.mockReturnValue({ httpMethod: 'GET', endpointPath: '/api/test' });
      mockGenerateMockFromInterface.mockReturnValue({});
      mockExtractGuardFromInterface.mockReturnValue(null);
      mockIsValidTypeScriptEndpoint.mockReturnValue(true);

      await loadTypeScriptEndpoints('/test/mock', { dynamicMocks: true });

      expect(mockGenerateMockFromInterface).toHaveBeenCalledWith(mockInterface, true);
    });

    test('should include guard when present', async () => {
      const mockInterface: MockInterfaceDeclaration = { getName: () => 'TestInterface' };
      const mockGuard = {
        condition: { field: 'role', operator: 'equals' as const, value: 'admin' },
        left: { status: 403 },
        right: { status: 200 }
      };

      mockGlob.mockResolvedValue(['/test/mock/api/test.ts']);
      mockReadFile.mockResolvedValue('interface TestInterface {}');
      mockParseInterfaceWithCache.mockReturnValue({ interface: mockInterface as unknown as InterfaceDeclaration, project: {} as Project });
      mockExtractEndpointInfoFromPath.mockReturnValue({ httpMethod: 'GET', endpointPath: '/api/test' });
      mockGenerateMockFromInterface.mockReturnValue({});
      mockExtractGuardFromInterface.mockReturnValue(mockGuard);
      mockIsValidTypeScriptEndpoint.mockReturnValue(true);

      const result = await loadTypeScriptEndpoints('/test/mock');

      expect(result[0]).toHaveProperty('guard', mockGuard);
    });

    test('should include dynamic mock properties when dynamicMocks enabled', async () => {
      const mockInterface: MockInterfaceDeclaration = { getName: () => 'TestInterface' };

      mockGlob.mockResolvedValue(['/test/mock/api/test.ts']);
      mockReadFile.mockResolvedValue('interface TestInterface {}');
      mockParseInterfaceWithCache.mockReturnValue({ interface: mockInterface as unknown as InterfaceDeclaration, project: {} as Project });
      mockExtractEndpointInfoFromPath.mockReturnValue({ httpMethod: 'GET', endpointPath: '/api/test' });
      mockGenerateMockFromInterface.mockReturnValue({});
      mockExtractGuardFromInterface.mockReturnValue(null);
      mockIsValidTypeScriptEndpoint.mockReturnValue(true);

      const result = await loadTypeScriptEndpoints('/test/mock', { dynamicMocks: true });

      expect(result[0]).toHaveProperty('_interfaceDeclaration', mockInterface);
      expect(result[0]).toHaveProperty('_dynamicMocks', true);
    });

    test('should not include dynamic properties when dynamicMocks disabled', async () => {
      const mockInterface: MockInterfaceDeclaration = { getName: () => 'TestInterface' };

      mockGlob.mockResolvedValue(['/test/mock/api/test.ts']);
      mockReadFile.mockResolvedValue('interface TestInterface {}');
      mockParseInterfaceWithCache.mockReturnValue({ interface: mockInterface as unknown as InterfaceDeclaration, project: {} as Project });
      mockExtractEndpointInfoFromPath.mockReturnValue({ httpMethod: 'GET', endpointPath: '/api/test' });
      mockGenerateMockFromInterface.mockReturnValue({});
      mockExtractGuardFromInterface.mockReturnValue(null);
      mockIsValidTypeScriptEndpoint.mockReturnValue(true);

      const result = await loadTypeScriptEndpoints('/test/mock', { dynamicMocks: false });

      expect(result[0]).not.toHaveProperty('_interfaceDeclaration');
      expect(result[0]).not.toHaveProperty('_dynamicMocks');
    });

    test('should handle parsing errors gracefully', async () => {
      const error = new Error('Parse failed');
      mockGlob.mockResolvedValue(['/test/mock/api/test.ts']);
      mockReadFile.mockResolvedValue('interface TestInterface {}');
      mockParseInterfaceWithCache.mockImplementation(() => { throw error; });

      const result = await loadTypeScriptEndpoints('/test/mock');

      expect(result).toEqual([]);
      expect(mockVerboseError).toHaveBeenCalledWith(
        expect.stringContaining('❌ Error loading TypeScript interface /test/mock/api/test.ts:'),
        error
      );
    });

    test('should set correct endpoint properties', async () => {
      const mockInterface: MockInterfaceDeclaration = { getName: () => 'TestInterface' };
      const mockData = { id: 1, name: 'test' };

      mockGlob.mockResolvedValue(['/test/mock/api/test.ts']);
      mockReadFile.mockResolvedValue('interface TestInterface {}');
      mockParseInterfaceWithCache.mockReturnValue({ interface: mockInterface as unknown as InterfaceDeclaration, project: {} as Project });
      mockExtractEndpointInfoFromPath.mockReturnValue({ httpMethod: 'POST', endpointPath: '/api/test' });
      mockGenerateMockFromInterface.mockReturnValue(mockData);
      mockExtractGuardFromInterface.mockReturnValue(null);
      mockIsValidTypeScriptEndpoint.mockReturnValue(true);

      const result = await loadTypeScriptEndpoints('/test/mock');

      expect(result[0]).toMatchObject({
        method: 'POST',
        path: '/api/test',
        status: 200,
        body: mockData,
        filePath: '/test/mock/api/test.ts',
        fullPath: '/api/test'
      });
    });
  });
});
