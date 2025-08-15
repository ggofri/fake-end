import { 
  validMethods, 
  validLowercaseMethods, 
  isValidMethod, 
  MockEndpoint, 
  ParsedEndpoint,
  ServerOptions 
} from '../index';

describe('Types Module', () => {
  describe('isValidMethod', () => {
    it('should return true for valid HTTP methods', () => {
      expect(isValidMethod('GET')).toBe(true);
      expect(isValidMethod('POST')).toBe(true);
      expect(isValidMethod('PUT')).toBe(true);
      expect(isValidMethod('DELETE')).toBe(true);
      expect(isValidMethod('PATCH')).toBe(true);
    });

    it('should return false for invalid HTTP methods', () => {
      expect(isValidMethod('HEAD')).toBe(false);
      expect(isValidMethod('OPTIONS')).toBe(false);
      expect(isValidMethod('TRACE')).toBe(false);
      expect(isValidMethod('CONNECT')).toBe(false);
    });

    it('should return false for lowercase methods', () => {
      expect(isValidMethod('get')).toBe(false);
      expect(isValidMethod('post')).toBe(false);
      expect(isValidMethod('put')).toBe(false);
      expect(isValidMethod('delete')).toBe(false);
      expect(isValidMethod('patch')).toBe(false);
    });

    it('should return false for mixed case methods', () => {
      expect(isValidMethod('Get')).toBe(false);
      expect(isValidMethod('pOsT')).toBe(false);
      expect(isValidMethod('Put')).toBe(false);
    });

    it('should return false for empty string', () => {
      expect(isValidMethod('')).toBe(false);
    });

    it('should return false for non-string values', () => {
      expect(isValidMethod(null as any)).toBe(false);
      expect(isValidMethod(undefined as any)).toBe(false);
      expect(isValidMethod(123 as any)).toBe(false);
      expect(isValidMethod({} as any)).toBe(false);
      expect(isValidMethod([] as any)).toBe(false);
    });

    it('should type guard correctly', () => {
      const method: string = 'GET';
      
      if (isValidMethod(method)) {
        // TypeScript should know method is validMethods here
        const validMethodVar: validMethods = method;
        expect(['GET', 'POST', 'PUT', 'DELETE', 'PATCH']).toContain(validMethodVar);
      }
    });
  });

  describe('MockEndpoint interface', () => {
    it('should accept valid MockEndpoint objects', () => {
      const endpoint: MockEndpoint = {
        method: 'GET',
        path: '/api/users',
        status: 200,
        body: { users: [] }
      };

      expect(endpoint.method).toBe('GET');
      expect(endpoint.path).toBe('/api/users');
      expect(endpoint.status).toBe(200);
      expect(endpoint.body).toEqual({ users: [] });
    });

    it('should accept optional properties', () => {
      const endpointWithDelay: MockEndpoint = {
        method: 'POST',
        path: '/api/users',
        status: 201,
        body: { id: 1, name: 'John' },
        delayMs: 1000
      };

      expect(endpointWithDelay.delayMs).toBe(1000);
    });

    it('should accept undefined body', () => {
      const endpointWithoutBody: MockEndpoint = {
        method: 'DELETE',
        path: '/api/users/1',
        status: 204
      };

      expect(endpointWithoutBody.body).toBeUndefined();
    });

    it('should accept various body types', () => {
      const stringBody: MockEndpoint = {
        method: 'GET',
        path: '/api/message',
        status: 200,
        body: 'Hello World'
      };

      const numberBody: MockEndpoint = {
        method: 'GET',
        path: '/api/count',
        status: 200,
        body: 42
      };

      const booleanBody: MockEndpoint = {
        method: 'GET',
        path: '/api/active',
        status: 200,
        body: true
      };

      const arrayBody: MockEndpoint = {
        method: 'GET',
        path: '/api/items',
        status: 200,
        body: [1, 2, 3]
      };

      expect(stringBody.body).toBe('Hello World');
      expect(numberBody.body).toBe(42);
      expect(booleanBody.body).toBe(true);
      expect(arrayBody.body).toEqual([1, 2, 3]);
    });
  });

  describe('ParsedEndpoint interface', () => {
    it('should extend MockEndpoint with additional properties', () => {
      const parsedEndpoint: ParsedEndpoint = {
        method: 'GET',
        path: '/api/users',
        status: 200,
        body: { users: [] },
        filePath: '/mock_server/users.yaml',
        fullPath: '/api/v1/users'
      };

      expect(parsedEndpoint.filePath).toBe('/mock_server/users.yaml');
      expect(parsedEndpoint.fullPath).toBe('/api/v1/users');
      expect(parsedEndpoint.method).toBe('GET');
      expect(parsedEndpoint.path).toBe('/api/users');
    });

    it('should inherit all MockEndpoint properties', () => {
      const parsedEndpoint: ParsedEndpoint = {
        method: 'POST',
        path: '/api/users',
        status: 201,
        body: { id: 1, name: 'John' },
        delayMs: 500,
        filePath: '/mock_server/users.yaml',
        fullPath: '/api/v1/users'
      };

      expect(parsedEndpoint.delayMs).toBe(500);
      expect(parsedEndpoint.body).toEqual({ id: 1, name: 'John' });
    });
  });

  describe('ServerOptions interface', () => {
    it('should accept required properties', () => {
      const options: ServerOptions = {
        port: 3000,
        mockDir: './mock_server'
      };

      expect(options.port).toBe(3000);
      expect(options.mockDir).toBe('./mock_server');
    });

    it('should accept optional verbose property', () => {
      const verboseOptions: ServerOptions = {
        port: 8080,
        mockDir: '/path/to/mocks',
        verbose: true
      };

      expect(verboseOptions.verbose).toBe(true);
    });

    it('should handle verbose as false', () => {
      const nonVerboseOptions: ServerOptions = {
        port: 4000,
        mockDir: './mocks',
        verbose: false
      };

      expect(nonVerboseOptions.verbose).toBe(false);
    });

    it('should handle missing verbose property', () => {
      const defaultOptions: ServerOptions = {
        port: 5000,
        mockDir: './default_mocks'
      };

      expect(defaultOptions.verbose).toBeUndefined();
    });
  });

  describe('Type exports', () => {
    it('should export validMethods type', () => {
      const methods: validMethods[] = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'];
      
      methods.forEach(method => {
        expect(['GET', 'POST', 'PUT', 'DELETE', 'PATCH']).toContain(method);
      });
    });

    it('should export validLowercaseMethods type', () => {
      const lowercaseMethods: validLowercaseMethods[] = ['get', 'post', 'put', 'delete', 'patch'];
      
      lowercaseMethods.forEach(method => {
        expect(['get', 'post', 'put', 'delete', 'patch']).toContain(method);
      });
    });
  });
});