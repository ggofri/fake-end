import { isValidTypeScriptEndpoint, TypeScriptEndpoint } from '../endpoint-validator';
import { isObject, hasRequiredProperties, hasValidPropertyTypes, isValidHttpMethod } from '@/utils';

jest.mock('@/utils', () => ({
  isObject: jest.fn(),
  hasRequiredProperties: jest.fn(),
  hasValidPropertyTypes: jest.fn(),
  isValidHttpMethod: jest.fn()
}));

const mockIsObject = isObject as jest.MockedFunction<typeof isObject>;
const mockHasRequiredProperties = hasRequiredProperties as jest.MockedFunction<typeof hasRequiredProperties>;
const mockHasValidPropertyTypes = hasValidPropertyTypes as jest.MockedFunction<typeof hasValidPropertyTypes>;
const mockIsValidHttpMethod = isValidHttpMethod as jest.MockedFunction<typeof isValidHttpMethod>;

describe('EndpointValidator', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('isValidTypeScriptEndpoint', () => {
    const validEndpoint: TypeScriptEndpoint = {
      method: 'GET',
      path: '/users',
      status: 200,
      body: { users: [] }
    };

    it('should return true for valid TypeScript endpoint', () => {
      mockIsObject.mockReturnValue(true);
      mockHasRequiredProperties.mockReturnValue(true);
      mockHasValidPropertyTypes.mockReturnValue(true);
      mockIsValidHttpMethod.mockReturnValue(true);

      const result = isValidTypeScriptEndpoint(validEndpoint);

      expect(result).toBe(true);
      expect(mockIsObject).toHaveBeenCalledWith(validEndpoint);
      expect(mockHasRequiredProperties).toHaveBeenCalledWith(validEndpoint, ['method', 'path', 'status', 'body']);
      expect(mockHasValidPropertyTypes).toHaveBeenCalledWith(validEndpoint, expect.any(Object));
      expect(mockIsValidHttpMethod).toHaveBeenCalledWith('GET');
    });

    it('should return false when input is not an object', () => {
      mockIsObject.mockReturnValue(false);

      const result = isValidTypeScriptEndpoint('not an object');

      expect(result).toBe(false);
      expect(mockIsObject).toHaveBeenCalledWith('not an object');
      expect(mockHasRequiredProperties).not.toHaveBeenCalled();
    });

    it('should return false when required properties are missing', () => {
      const incompleteEndpoint = {
        method: 'GET',
        path: '/users'
      };

      mockIsObject.mockReturnValue(true);
      mockHasRequiredProperties.mockReturnValue(false);

      const result = isValidTypeScriptEndpoint(incompleteEndpoint);

      expect(result).toBe(false);
      expect(mockHasRequiredProperties).toHaveBeenCalledWith(incompleteEndpoint, ['method', 'path', 'status', 'body']);
    });

    it('should return false when property types are invalid', () => {
      const invalidTypesEndpoint = {
        method: 123,
        path: '/users',
        status: '200',
        body: 'invalid'
      };

      mockIsObject.mockReturnValue(true);
      mockHasRequiredProperties.mockReturnValue(true);
      mockHasValidPropertyTypes.mockReturnValue(false);

      const result = isValidTypeScriptEndpoint(invalidTypesEndpoint);

      expect(result).toBe(false);
    });

    it('should return false when HTTP method is invalid', () => {
      const invalidMethodEndpoint = {
        method: 'INVALID',
        path: '/users',
        status: 200,
        body: {}
      };

      mockIsObject.mockReturnValue(true);
      mockHasRequiredProperties.mockReturnValue(true);
      mockHasValidPropertyTypes.mockReturnValue(true);
      mockIsValidHttpMethod.mockReturnValue(false);

      const result = isValidTypeScriptEndpoint(invalidMethodEndpoint);

      expect(result).toBe(false);
      expect(mockIsValidHttpMethod).toHaveBeenCalledWith('INVALID');
    });

    it('should validate type checking functions correctly', () => {
      mockIsObject.mockReturnValue(true);
      mockHasRequiredProperties.mockReturnValue(true);
      mockHasValidPropertyTypes.mockReturnValue(true);
      mockIsValidHttpMethod.mockReturnValue(true);

      isValidTypeScriptEndpoint(validEndpoint);

      const typeValidationsCall = mockHasValidPropertyTypes.mock.calls[0][1];
      
      expect(typeValidationsCall.method('GET')).toBe(true);
      expect(typeValidationsCall.method(123)).toBe(false);
      expect(typeValidationsCall.method('')).toBe(true);
      expect(typeValidationsCall.method(null)).toBe(false);

      expect(typeValidationsCall.path('/users')).toBe(true);
      expect(typeValidationsCall.path(123)).toBe(false);
      expect(typeValidationsCall.path('')).toBe(true);
      expect(typeValidationsCall.path(null)).toBe(false);

      expect(typeValidationsCall.status(200)).toBe(true);
      expect(typeValidationsCall.status('200')).toBe(false);
      expect(typeValidationsCall.status(0)).toBe(true);
      expect(typeValidationsCall.status(null)).toBe(false);

      expect(typeValidationsCall.body({})).toBe(true);
      expect(typeValidationsCall.body([])).toBe(true);
      expect(typeValidationsCall.body('')).toBe(true);
      expect(typeValidationsCall.body(0)).toBe(true);
      expect(typeValidationsCall.body(false)).toBe(true);
      expect(typeValidationsCall.body(null)).toBe(true);
      expect(typeValidationsCall.body(undefined)).toBe(false);
    });

    it('should handle endpoint with optional properties', () => {
      const endpointWithOptionals: TypeScriptEndpoint = {
        method: 'POST',
        path: '/users',
        status: 201,
        body: { id: 1, name: 'John' },
        headers: { 'Content-Type': 'application/json' },
        delayMs: 1000
      };

      mockIsObject.mockReturnValue(true);
      mockHasRequiredProperties.mockReturnValue(true);
      mockHasValidPropertyTypes.mockReturnValue(true);
      mockIsValidHttpMethod.mockReturnValue(true);

      const result = isValidTypeScriptEndpoint(endpointWithOptionals);

      expect(result).toBe(true);
    });

    it('should handle different HTTP methods', () => {
      const methods = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'];

      methods.forEach(method => {
        const endpoint = { ...validEndpoint, method };
        
        mockIsObject.mockReturnValue(true);
        mockHasRequiredProperties.mockReturnValue(true);
        mockHasValidPropertyTypes.mockReturnValue(true);
        mockIsValidHttpMethod.mockReturnValue(true);

        const result = isValidTypeScriptEndpoint(endpoint);

        expect(result).toBe(true);
        expect(mockIsValidHttpMethod).toHaveBeenCalledWith(method);
      });
    });

    it('should handle different body types', () => {
      const bodyTypes = [
        {},
        [],
        'string body',
        42,
        true,
        null
      ];

      bodyTypes.forEach(body => {
        const endpoint = { ...validEndpoint, body };
        
        mockIsObject.mockReturnValue(true);
        mockHasRequiredProperties.mockReturnValue(true);
        mockHasValidPropertyTypes.mockReturnValue(true);
        mockIsValidHttpMethod.mockReturnValue(true);

        const result = isValidTypeScriptEndpoint(endpoint);

        expect(result).toBe(true);
      });
    });

    it('should handle different status codes', () => {
      const statusCodes = [200, 201, 204, 400, 404, 500];

      statusCodes.forEach(status => {
        const endpoint = { ...validEndpoint, status };
        
        mockIsObject.mockReturnValue(true);
        mockHasRequiredProperties.mockReturnValue(true);
        mockHasValidPropertyTypes.mockReturnValue(true);
        mockIsValidHttpMethod.mockReturnValue(true);

        const result = isValidTypeScriptEndpoint(endpoint);

        expect(result).toBe(true);
      });
    });

    it('should handle complex nested body objects', () => {
      const complexBody = {
        users: [
          { id: 1, name: 'John', profile: { age: 30, address: { city: 'NYC' } } },
          { id: 2, name: 'Jane', profile: { age: 25, address: { city: 'LA' } } }
        ],
        meta: {
          total: 2,
          page: 1,
          hasMore: false
        }
      };

      const endpoint = { ...validEndpoint, body: complexBody };
      
      mockIsObject.mockReturnValue(true);
      mockHasRequiredProperties.mockReturnValue(true);
      mockHasValidPropertyTypes.mockReturnValue(true);
      mockIsValidHttpMethod.mockReturnValue(true);

      const result = isValidTypeScriptEndpoint(endpoint);

      expect(result).toBe(true);
    });

    it('should handle edge cases for null and undefined inputs', () => {
      const edgeCases = [null, undefined, 0, '', false];

      edgeCases.forEach(input => {
        mockIsObject.mockReturnValue(false);

        const result = isValidTypeScriptEndpoint(input);

        expect(result).toBe(false);
      });
    });

    it('should handle arrays as input', () => {
      mockIsObject.mockReturnValue(false);

      const result = isValidTypeScriptEndpoint([validEndpoint]);

      expect(result).toBe(false);
    });

    it('should short-circuit on first validation failure', () => {
      mockIsObject.mockReturnValue(false);

      isValidTypeScriptEndpoint(validEndpoint);

      expect(mockIsObject).toHaveBeenCalled();
      expect(mockHasRequiredProperties).not.toHaveBeenCalled();
      expect(mockHasValidPropertyTypes).not.toHaveBeenCalled();
      expect(mockIsValidHttpMethod).not.toHaveBeenCalled();
    });

    it('should handle case-sensitive method validation', () => {
      const endpoint = { ...validEndpoint, method: 'get' };
      
      mockIsObject.mockReturnValue(true);
      mockHasRequiredProperties.mockReturnValue(true);
      mockHasValidPropertyTypes.mockReturnValue(true);
      mockIsValidHttpMethod.mockReturnValue(false);

      const result = isValidTypeScriptEndpoint(endpoint);

      expect(result).toBe(false);
      expect(mockIsValidHttpMethod).toHaveBeenCalledWith('get');
    });

    it('should handle extra properties gracefully', () => {
      const endpointWithExtra = {
        ...validEndpoint,
        extraProperty: 'should not affect validation',
        anotherExtra: 123
      };
      
      mockIsObject.mockReturnValue(true);
      mockHasRequiredProperties.mockReturnValue(true);
      mockHasValidPropertyTypes.mockReturnValue(true);
      mockIsValidHttpMethod.mockReturnValue(true);

      const result = isValidTypeScriptEndpoint(endpointWithExtra);

      expect(result).toBe(true);
    });

    it('should validate that all required properties are checked', () => {
      mockIsObject.mockReturnValue(true);
      mockHasRequiredProperties.mockReturnValue(true);
      mockHasValidPropertyTypes.mockReturnValue(true);
      mockIsValidHttpMethod.mockReturnValue(true);

      isValidTypeScriptEndpoint(validEndpoint);

      expect(mockHasRequiredProperties).toHaveBeenCalledWith(
        validEndpoint,
        ['method', 'path', 'status', 'body']
      );
    });
  });

  describe('TypeScriptEndpoint interface', () => {
    it('should define correct interface structure', () => {
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

    it('should support optional properties', () => {
      const endpointWithOptionals: TypeScriptEndpoint = {
        method: 'POST',
        path: '/test',
        status: 201,
        body: {},
        headers: { 'Content-Type': 'application/json' },
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
