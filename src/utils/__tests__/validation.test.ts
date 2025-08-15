import { isObject, hasRequiredProperties, hasValidPropertyTypes, isValidHttpMethod } from '../validation';

describe('Validation Utils', () => {
  describe('isObject', () => {
    it('should return true for plain objects', () => {
      expect(isObject({})).toBe(true);
      expect(isObject({ key: 'value' })).toBe(true);
      expect(isObject({ nested: { deep: true } })).toBe(true);
    });

    it('should return true for object instances', () => {
      expect(isObject(new Date())).toBe(true);
      expect(isObject(new Error('test'))).toBe(true);
      expect(isObject(/regex/)).toBe(true);
    });

    it('should return false for null', () => {
      expect(isObject(null)).toBe(false);
    });

    it('should return false for undefined', () => {
      expect(isObject(undefined)).toBe(false);
    });

    it('should return false for primitive types', () => {
      expect(isObject('string')).toBe(false);
      expect(isObject(123)).toBe(false);
      expect(isObject(true)).toBe(false);
      expect(isObject(false)).toBe(false);
    });

    it('should return true for arrays (since arrays are objects)', () => {
      expect(isObject([])).toBe(true);
      expect(isObject([1, 2, 3])).toBe(true);
      expect(isObject(['a', 'b'])).toBe(true);
    });

    it('should return false for functions (functions are not objects in this implementation)', () => {
      expect(isObject(() => {})).toBe(false);
      expect(isObject(function() {})).toBe(false);
      expect(isObject(isObject)).toBe(false);
    });

    it('should handle edge cases', () => {
      expect(isObject(0)).toBe(false);
      expect(isObject('')).toBe(false);
      expect(isObject(NaN)).toBe(false);
      expect(isObject(Symbol('test'))).toBe(false);
    });

    it('should return true for complex objects', () => {
      const complexObject = {
        string: 'value',
        number: 42,
        boolean: true,
        array: [1, 2, 3],
        nested: {
          deep: {
            value: 'nested'
          }
        },
        func: () => 'function'
      };
      
      expect(isObject(complexObject)).toBe(true);
    });

    it('should handle class instances', () => {
      class TestClass {
        constructor(public value: string) {}
      }
      
      const instance = new TestClass('test');
      expect(isObject(instance)).toBe(true);
    });
  });

  describe('hasRequiredProperties', () => {
    const testObject = {
      name: 'John',
      age: 30,
      email: 'john@example.com',
      active: true
    };

    it('should return true when all required properties exist', () => {
      expect(hasRequiredProperties(testObject, ['name', 'age'])).toBe(true);
      expect(hasRequiredProperties(testObject, ['email'])).toBe(true);
      expect(hasRequiredProperties(testObject, ['name', 'age', 'email', 'active'])).toBe(true);
    });

    it('should return false when required properties are missing', () => {
      expect(hasRequiredProperties(testObject, ['name', 'missing'])).toBe(false);
      expect(hasRequiredProperties(testObject, ['nonexistent'])).toBe(false);
      expect(hasRequiredProperties(testObject, ['name', 'age', 'missing'])).toBe(false);
    });

    it('should return true for empty required properties array', () => {
      expect(hasRequiredProperties(testObject, [])).toBe(true);
      expect(hasRequiredProperties({}, [])).toBe(true);
    });

    it('should handle empty object', () => {
      expect(hasRequiredProperties({}, ['name'])).toBe(false);
      expect(hasRequiredProperties({}, ['name', 'age'])).toBe(false);
    });

    it('should handle properties with undefined values', () => {
      const objectWithUndefined = {
        name: 'John',
        age: undefined,
        email: null
      };
      
      expect(hasRequiredProperties(objectWithUndefined, ['name'])).toBe(true);
      expect(hasRequiredProperties(objectWithUndefined, ['age'])).toBe(true); // property exists but is undefined
      expect(hasRequiredProperties(objectWithUndefined, ['email'])).toBe(true); // property exists but is null
    });

    it('should handle properties with falsy values', () => {
      const objectWithFalsy = {
        zero: 0,
        empty: '',
        false: false,
        null: null,
        undefined: undefined
      };
      
      expect(hasRequiredProperties(objectWithFalsy, ['zero', 'empty', 'false'])).toBe(true);
      expect(hasRequiredProperties(objectWithFalsy, ['null', 'undefined'])).toBe(true);
    });

    it('should handle numeric property names', () => {
      const objectWithNumbers = {
        0: 'first',
        1: 'second',
        '2': 'third'
      };
      
      expect(hasRequiredProperties(objectWithNumbers, ['0', '1'])).toBe(true);
      expect(hasRequiredProperties(objectWithNumbers, ['2'])).toBe(true);
      expect(hasRequiredProperties(objectWithNumbers, ['3'])).toBe(false);
    });

    it('should handle special property names', () => {
      const objectWithSpecial = {
        'property-with-dash': 'value1',
        'property_with_underscore': 'value2',
        'property.with.dots': 'value3',
        'property with spaces': 'value4'
      };
      
      expect(hasRequiredProperties(objectWithSpecial, [
        'property-with-dash',
        'property_with_underscore',
        'property.with.dots',
        'property with spaces'
      ])).toBe(true);
    });

    it('should handle prototype properties', () => {
      function Parent() {}
      Parent.prototype.inherited = 'inherited value';
      
      function Child() {
        this.own = 'own value';
      }
      Child.prototype = Object.create(Parent.prototype);
      
      const instance = new Child();
      
      expect(hasRequiredProperties(instance, ['own'])).toBe(true);
      expect(hasRequiredProperties(instance, ['inherited'])).toBe(true); // inherited property
    });

    it('should handle arrays as objects', () => {
      const array = ['first', 'second', 'third'];
      
      expect(hasRequiredProperties(array, ['0', '1', '2'])).toBe(true);
      expect(hasRequiredProperties(array, ['length'])).toBe(true);
      expect(hasRequiredProperties(array, ['3'])).toBe(false);
    });
  });

  describe('hasValidPropertyTypes', () => {
    const testObject = {
      name: 'John',
      age: 30,
      email: 'john@example.com',
      active: true,
      scores: [95, 87, 92],
      metadata: { created: '2023-01-01' }
    };

    it('should return true when all property types are valid', () => {
      const validations = {
        name: (value: unknown) => typeof value === 'string',
        age: (value: unknown) => typeof value === 'number',
        active: (value: unknown) => typeof value === 'boolean'
      };
      
      expect(hasValidPropertyTypes(testObject, validations)).toBe(true);
    });

    it('should return false when property types are invalid', () => {
      const validations = {
        name: (value: unknown) => typeof value === 'string',
        age: (value: unknown) => typeof value === 'string', // age is number, not string
        active: (value: unknown) => typeof value === 'boolean'
      };
      
      expect(hasValidPropertyTypes(testObject, validations)).toBe(false);
    });

    it('should handle empty validations object', () => {
      expect(hasValidPropertyTypes(testObject, {})).toBe(true);
    });

    it('should handle complex type validations', () => {
      const validations = {
        name: (value: unknown) => typeof value === 'string' && value.length > 0,
        age: (value: unknown) => typeof value === 'number' && value > 0,
        email: (value: unknown) => typeof value === 'string' && value.includes('@'),
        scores: (value: unknown) => Array.isArray(value) && value.every(v => typeof v === 'number'),
        metadata: (value: unknown) => typeof value === 'object' && value !== null
      };
      
      expect(hasValidPropertyTypes(testObject, validations)).toBe(true);
    });

    it('should handle validation for non-existent properties', () => {
      const validations = {
        nonexistent: (value: unknown) => value === undefined
      };
      
      expect(hasValidPropertyTypes(testObject, validations)).toBe(true);
    });

    it('should handle null and undefined values', () => {
      const objectWithNulls = {
        name: null,
        age: undefined,
        active: false
      };
      
      const validations = {
        name: (value: unknown) => value === null,
        age: (value: unknown) => value === undefined,
        active: (value: unknown) => typeof value === 'boolean'
      };
      
      expect(hasValidPropertyTypes(objectWithNulls, validations)).toBe(true);
    });

    it('should handle custom validation functions', () => {
      const validations = {
        name: (value: unknown) => {
          if (typeof value !== 'string') return false;
          return value.length >= 2 && value.length <= 50;
        },
        age: (value: unknown) => {
          if (typeof value !== 'number') return false;
          return value >= 0 && value <= 150;
        },
        email: (value: unknown) => {
          if (typeof value !== 'string') return false;
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          return emailRegex.test(value);
        }
      };
      
      expect(hasValidPropertyTypes(testObject, validations)).toBe(true);
    });

    it('should handle validation that throws errors', () => {
      const validations = {
        name: (value: unknown) => {
          if (typeof value !== 'string') {
            throw new Error('Not a string');
          }
          return true;
        }
      };
      
      // Should handle thrown errors gracefully
      expect(() => hasValidPropertyTypes(testObject, validations)).not.toThrow();
    });

    it('should return false if any validation fails', () => {
      const validations = {
        name: (value: unknown) => typeof value === 'string', // valid
        age: (value: unknown) => typeof value === 'string', // invalid - age is number
        active: (value: unknown) => typeof value === 'boolean' // valid
      };
      
      expect(hasValidPropertyTypes(testObject, validations)).toBe(false);
    });

    it('should handle array property validations', () => {
      const validations = {
        scores: (value: unknown) => {
          if (!Array.isArray(value)) return false;
          return value.every(score => typeof score === 'number' && score >= 0 && score <= 100);
        }
      };
      
      expect(hasValidPropertyTypes(testObject, validations)).toBe(true);
    });

    it('should handle nested object validations', () => {
      const validations = {
        metadata: (value: unknown) => {
          if (typeof value !== 'object' || value === null) return false;
          const obj = value as Record<string, unknown>;
          return 'created' in obj && typeof obj.created === 'string';
        }
      };
      
      expect(hasValidPropertyTypes(testObject, validations)).toBe(true);
    });
  });

  describe('isValidHttpMethod', () => {
    it('should return true for valid HTTP methods', () => {
      expect(isValidHttpMethod('GET')).toBe(true);
      expect(isValidHttpMethod('POST')).toBe(true);
      expect(isValidHttpMethod('PUT')).toBe(true);
      expect(isValidHttpMethod('DELETE')).toBe(true);
      expect(isValidHttpMethod('PATCH')).toBe(true);
    });

    it('should return true for lowercase HTTP methods', () => {
      expect(isValidHttpMethod('get')).toBe(true);
      expect(isValidHttpMethod('post')).toBe(true);
      expect(isValidHttpMethod('put')).toBe(true);
      expect(isValidHttpMethod('delete')).toBe(true);
      expect(isValidHttpMethod('patch')).toBe(true);
    });

    it('should return true for mixed case HTTP methods', () => {
      expect(isValidHttpMethod('Get')).toBe(true);
      expect(isValidHttpMethod('pOsT')).toBe(true);
      expect(isValidHttpMethod('PuT')).toBe(true);
      expect(isValidHttpMethod('DeLeTe')).toBe(true);
      expect(isValidHttpMethod('pAtCh')).toBe(true);
    });

    it('should return false for invalid HTTP methods', () => {
      expect(isValidHttpMethod('INVALID')).toBe(false);
      expect(isValidHttpMethod('UNKNOWN')).toBe(false);
      expect(isValidHttpMethod('TEST')).toBe(false);
      expect(isValidHttpMethod('HTTP')).toBe(false);
    });

    it('should return false for non-string values', () => {
      expect(isValidHttpMethod(123)).toBe(false);
      expect(isValidHttpMethod(true)).toBe(false);
      expect(isValidHttpMethod(null)).toBe(false);
      expect(isValidHttpMethod(undefined)).toBe(false);
      expect(isValidHttpMethod({})).toBe(false);
      expect(isValidHttpMethod([])).toBe(false);
    });

    it('should return false for empty string', () => {
      expect(isValidHttpMethod('')).toBe(false);
    });

    it('should return false for whitespace-only strings', () => {
      expect(isValidHttpMethod(' ')).toBe(false);
      expect(isValidHttpMethod('   ')).toBe(false);
      expect(isValidHttpMethod('\t')).toBe(false);
      expect(isValidHttpMethod('\n')).toBe(false);
    });

    it('should return false for methods with extra characters', () => {
      expect(isValidHttpMethod('GET ')).toBe(false);
      expect(isValidHttpMethod(' POST')).toBe(false);
      expect(isValidHttpMethod('GET/POST')).toBe(false);
      expect(isValidHttpMethod('GET-POST')).toBe(false);
    });

    it('should handle methods not in the allowed list', () => {
      expect(isValidHttpMethod('HEAD')).toBe(false);
      expect(isValidHttpMethod('OPTIONS')).toBe(false);
      expect(isValidHttpMethod('TRACE')).toBe(false);
      expect(isValidHttpMethod('CONNECT')).toBe(false);
    });

    it('should be case insensitive for validation', () => {
      const mixedCaseMethods = [
        'GeT', 'gEt', 'GET', 'get',
        'PoSt', 'pOsT', 'POST', 'post',
        'PuT', 'pUt', 'PUT', 'put',
        'DeLeTe', 'dElEtE', 'DELETE', 'delete',
        'PaTcH', 'pAtCh', 'PATCH', 'patch'
      ];
      
      mixedCaseMethods.forEach(method => {
        expect(isValidHttpMethod(method)).toBe(true);
      });
    });

    it('should handle unicode and special characters', () => {
      expect(isValidHttpMethod('GÉT')).toBe(false);
      expect(isValidHttpMethod('POST™')).toBe(false);
      expect(isValidHttpMethod('🚀')).toBe(false);
    });

    it('should type guard correctly', () => {
      const value: unknown = 'GET';
      
      if (isValidHttpMethod(value)) {
        // TypeScript should know value is string here
        expect(typeof value).toBe('string');
        expect(value.toUpperCase()).toBe('GET');
      }
    });

    it('should work with variables of unknown type', () => {
      const unknownValues: unknown[] = [
        'GET', 'POST', 'INVALID', 123, null, undefined, {}, []
      ];
      
      const validMethods = unknownValues.filter(isValidHttpMethod);
      
      expect(validMethods).toEqual(['GET', 'POST']);
      expect(validMethods.every(method => typeof method === 'string')).toBe(true);
    });
  });

  describe('Integration scenarios', () => {
    it('should work together for object validation', () => {
      const endpoint = {
        method: 'GET',
        path: '/api/users',
        status: 200,
        body: { users: [] }
      };
      
      // Check if it's an object
      expect(isObject(endpoint)).toBe(true);
      
      // Check required properties
      expect(hasRequiredProperties(endpoint, ['method', 'path', 'status', 'body'])).toBe(true);
      
      // Check property types
      const typeValidations = {
        method: (value: unknown) => typeof value === 'string',
        path: (value: unknown) => typeof value === 'string',
        status: (value: unknown) => typeof value === 'number',
        body: (value: unknown) => typeof value === 'object'
      };
      expect(hasValidPropertyTypes(endpoint, typeValidations)).toBe(true);
      
      // Check HTTP method validity
      expect(isValidHttpMethod(endpoint.method)).toBe(true);
    });

    it('should handle validation pipeline for complex objects', () => {
      const request = {
        method: 'POST',
        url: '/api/users',
        headers: { 'Content-Type': 'application/json' },
        body: { name: 'John', age: 30 }
      };
      
      // Comprehensive validation
      const isValidRequest = 
        isObject(request) &&
        hasRequiredProperties(request, ['method', 'url', 'body']) &&
        hasValidPropertyTypes(request, {
          method: (v) => typeof v === 'string',
          url: (v) => typeof v === 'string',
          headers: (v) => typeof v === 'object',
          body: (v) => typeof v === 'object'
        }) &&
        isValidHttpMethod(request.method);
      
      expect(isValidRequest).toBe(true);
    });
  });
});