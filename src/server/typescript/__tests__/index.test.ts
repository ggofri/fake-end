import { 
  createTypeScriptProject, 
  extractDefaultInterface, 
  parseInterfaceWithCache,
  generateMockFromInterface,
  isValidTypeScriptEndpoint,
  extractEndpointInfoFromPath
} from '../index';
import type { TypeScriptEndpoint } from '../index';

describe('TypeScript Index Module', () => {
  describe('module exports', () => {
    it('should export createTypeScriptProject function', () => {
      expect(createTypeScriptProject).toBeDefined();
      expect(typeof createTypeScriptProject).toBe('function');
    });

    it('should export extractDefaultInterface function', () => {
      expect(extractDefaultInterface).toBeDefined();
      expect(typeof extractDefaultInterface).toBe('function');
    });

    it('should export parseInterfaceWithCache function', () => {
      expect(parseInterfaceWithCache).toBeDefined();
      expect(typeof parseInterfaceWithCache).toBe('function');
    });

    it('should export generateMockFromInterface function', () => {
      expect(generateMockFromInterface).toBeDefined();
      expect(typeof generateMockFromInterface).toBe('function');
    });

    it('should export isValidTypeScriptEndpoint function', () => {
      expect(isValidTypeScriptEndpoint).toBeDefined();
      expect(typeof isValidTypeScriptEndpoint).toBe('function');
    });

    it('should export extractEndpointInfoFromPath function', () => {
      expect(extractEndpointInfoFromPath).toBeDefined();
      expect(typeof extractEndpointInfoFromPath).toBe('function');
    });

    it('should export TypeScriptEndpoint type', () => {
      const endpoint: TypeScriptEndpoint = {
        method: 'GET',
        path: '/test',
        status: 200,
        body: {}
      };
      
      expect(endpoint).toBeDefined();
      expect(typeof endpoint.method).toBe('string');
      expect(typeof endpoint.path).toBe('string');
      expect(typeof endpoint.status).toBe('number');
      expect(typeof endpoint.body).toBe('object');
    });
  });

  describe('function signatures', () => {
    it('should have correct function signatures for all exports', () => {
      expect(createTypeScriptProject.length).toBe(0);
      expect(extractDefaultInterface.length).toBe(1);
      expect(parseInterfaceWithCache.length).toBe(3);
      expect(generateMockFromInterface.length).toBe(2);
      expect(isValidTypeScriptEndpoint.length).toBe(1);
      expect(extractEndpointInfoFromPath.length).toBe(2);
    });
  });

  describe('module structure', () => {
    it('should not export undefined values', () => {
      const exports = { 
        createTypeScriptProject, 
        extractDefaultInterface, 
        parseInterfaceWithCache,
        generateMockFromInterface,
        isValidTypeScriptEndpoint,
        extractEndpointInfoFromPath
      };
      
      Object.values(exports).forEach(exportedValue => {
        expect(exportedValue).toBeDefined();
        expect(exportedValue).not.toBeNull();
      });
    });

    it('should export only functions', () => {
      const exports = { 
        createTypeScriptProject, 
        extractDefaultInterface, 
        parseInterfaceWithCache,
        generateMockFromInterface,
        isValidTypeScriptEndpoint,
        extractEndpointInfoFromPath
      };
      
      Object.values(exports).forEach(exportedValue => {
        expect(typeof exportedValue).toBe('function');
      });
    });
  });

  describe('TypeScriptEndpoint interface', () => {
    it('should accept valid endpoint objects', () => {
      const validEndpoints: TypeScriptEndpoint[] = [
        {
          method: 'GET',
          path: '/users',
          status: 200,
          body: { users: [] }
        },
        {
          method: 'POST',
          path: '/users',
          status: 201,
          body: { id: 1, name: 'John' },
          headers: { 'Content-Type': 'application/json' },
          delayMs: 1000
        },
        {
          method: 'DELETE',
          path: '/users/:id',
          status: 204,
          body: {}
        }
      ];

      validEndpoints.forEach(endpoint => {
        expect(() => {
          const _unused: TypeScriptEndpoint = endpoint;
          void _unused; 
        }).not.toThrow();
      });
    });

    it('should have required properties', () => {
      const endpoint: TypeScriptEndpoint = {
        method: 'GET',
        path: '/test',
        status: 200,
        body: {}
      };

      expect(endpoint).toHaveProperty('method');
      expect(endpoint).toHaveProperty('path');
      expect(endpoint).toHaveProperty('status');
      expect(endpoint).toHaveProperty('body');
    });

    it('should have optional properties', () => {
      const endpointWithOptionals: TypeScriptEndpoint = {
        method: 'GET',
        path: '/test',
        status: 200,
        body: {},
        headers: { 'Accept': 'application/json' },
        delayMs: 500
      };

      expect(endpointWithOptionals.headers).toBeDefined();
      expect(endpointWithOptionals.delayMs).toBeDefined();

      const endpointWithoutOptionals: TypeScriptEndpoint = {
        method: 'GET',
        path: '/test',
        status: 200,
        body: {}
      };

      expect(endpointWithoutOptionals.headers).toBeUndefined();
      expect(endpointWithoutOptionals.delayMs).toBeUndefined();
    });
  });
});
