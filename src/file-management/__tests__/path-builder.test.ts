import { buildEndpointPath, extractMethodFromFileName } from '../path-builder/path-builder';

const originalCwd = process.cwd;
beforeAll(() => {
  process.cwd = jest.fn().mockReturnValue('/current/working/directory');
});

afterAll(() => {
  process.cwd = originalCwd;
});

describe('path-builder', () => {
  describe('normalizeMockDir', () => {
    test('should add trailing slash when missing', () => {
      const result = buildEndpointPath('/mock/api/users.yaml', 'mock', '/list');
      
      expect(result).toBe('/api/users/list');
    });

    test('should keep trailing slash when present', () => {
      const result = buildEndpointPath('/mock/api/users.yaml', 'mock/', '/list');
      
      expect(result).toBe('/api/users/list');
    });
  });

  describe('extractRelativePath', () => {
    test('should extract relative path when mockDir is in filePath', () => {
      const result = buildEndpointPath('/project/mock/api/users.yaml', 'mock/', '/list');
      
      expect(result).toBe('/api/users/list');
    });

    test('should handle absolute mock directory paths', () => {
      const result = buildEndpointPath('/current/working/directory/mock/api/users.yaml', 'mock/', '/list');
      
      expect(result).toBe('/api/users/list');
    });

    test('should return original path when no match found', () => {
      const result = buildEndpointPath('/completely/different/path.yaml', 'mock/', '/list');
      
      expect(result).toBe('//completely/different/path/list');
    });
  });

  describe('shouldSkipFileNameInPath', () => {
    test('should skip filename when endpoint path starts with filename', () => {
      const result = buildEndpointPath('/mock/users.yaml', 'mock/', '/users/list');
      
      expect(result).toBe('/users/list');
    });

    test('should skip filename when endpoint path equals filename', () => {
      const result = buildEndpointPath('/mock/users.yaml', 'mock/', '/users');
      
      expect(result).toBe('/users');
    });

    test('should not skip filename when endpoint path does not match', () => {
      const result = buildEndpointPath('/mock/users.yaml', 'mock/', '/list');
      
      expect(result).toBe('/users/list');
    });
  });

  describe('buildPathWithDirectory', () => {
    test('should build path with directory when endpoint starts with filename', () => {
      const result = buildEndpointPath('/mock/api/v1/users.yaml', 'mock/', '/users/list');
      
      expect(result).toBe('/api/v1/users/list');
    });

    test('should build path with directory and filename when endpoint does not start with filename', () => {
      const result = buildEndpointPath('/mock/api/v1/users.yaml', 'mock/', '/list');
      
      expect(result).toBe('/api/v1/users/list');
    });
  });

  describe('buildPathWithFileOnly', () => {
    test('should return endpoint path when it matches filename', () => {
      const result = buildEndpointPath('/mock/users.yaml', 'mock/', '/users');
      
      expect(result).toBe('/users');
    });

    test('should combine filename and endpoint path when they do not match', () => {
      const result = buildEndpointPath('/mock/users.yaml', 'mock/', '/list');
      
      expect(result).toBe('/users/list');
    });
  });

  describe('buildEndpointPath', () => {
    test('should remove file extensions from path', () => {
      const yamlResult = buildEndpointPath('/mock/api/users.yaml', 'mock/', '/list');
      const ymlResult = buildEndpointPath('/mock/api/users.yml', 'mock/', '/list');
      const tsResult = buildEndpointPath('/mock/api/users.ts', 'mock/', '/list');
      
      expect(yamlResult).toBe('/api/users/list');
      expect(ymlResult).toBe('/api/users/list');
      expect(tsResult).toBe('/api/users/list');
    });

    test('should handle complex directory structures', () => {
      const result = buildEndpointPath('/mock/api/v1/admin/users.yaml', 'mock/', '/create');
      
      expect(result).toBe('/api/v1/admin/users/create');
    });

    test('should handle root level files', () => {
      const result = buildEndpointPath('/mock/health.yaml', 'mock/', '/check');
      
      expect(result).toBe('/health/check');
    });

    test('should return endpoint path when no directory or filename', () => {
      
      const result = buildEndpointPath('/mock/.yaml', 'mock/', '/fallback');
      
      expect(result).toBe('/fallback');
    });

    test('should handle paths with multiple slashes', () => {
      const result = buildEndpointPath('/mock//api//users.yaml', 'mock/', '/list');
      
      expect(result).toBe('//api//users/list');
    });
  });

  describe('extractMethodFromFileName', () => {
    test('should extract GET method from filename', () => {
      const result = extractMethodFromFileName('users.get');
      
      expect(result).toEqual({
        method: 'GET',
        baseName: 'users'
      });
    });

    test('should extract POST method from filename', () => {
      const result = extractMethodFromFileName('users.post');
      
      expect(result).toEqual({
        method: 'POST',
        baseName: 'users'
      });
    });

    test('should extract PUT method from filename', () => {
      const result = extractMethodFromFileName('users.put');
      
      expect(result).toEqual({
        method: 'PUT',
        baseName: 'users'
      });
    });

    test('should extract DELETE method from filename', () => {
      const result = extractMethodFromFileName('users.delete');
      
      expect(result).toEqual({
        method: 'DELETE',
        baseName: 'users'
      });
    });

    test('should extract PATCH method from filename', () => {
      const result = extractMethodFromFileName('users.patch');
      
      expect(result).toEqual({
        method: 'PATCH',
        baseName: 'users'
      });
    });

    test('should handle case insensitive method extraction', () => {
      const result = extractMethodFromFileName('users.Post');
      
      expect(result).toEqual({
        method: 'POST',
        baseName: 'users'
      });
    });

    test('should default to GET when no method in filename', () => {
      const result = extractMethodFromFileName('users');
      
      expect(result).toEqual({
        method: 'GET',
        baseName: 'users'
      });
    });

    test('should default to GET when invalid method in filename', () => {
      const result = extractMethodFromFileName('users.invalid');
      
      expect(result).toEqual({
        method: 'GET',
        baseName: 'users.invalid'
      });
    });

    test('should handle multiple dots in filename', () => {
      const result = extractMethodFromFileName('api.v1.users.post');
      
      expect(result).toEqual({
        method: 'POST',
        baseName: 'api.v1.users'
      });
    });

    test('should handle filename with extension and method', () => {
      const result = extractMethodFromFileName('users.get.yaml');
      
      expect(result).toEqual({
        method: 'GET',
        baseName: 'users.get.yaml'
      });
    });
  });
});
