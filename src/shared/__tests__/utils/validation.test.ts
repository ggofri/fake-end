import { isObject, hasRequiredProperties, hasValidPropertyTypes, isValidHttpMethod } from '@/shared/utils/validation';

describe('Validation Utils', () => {
  describe('isObject', () => {
    it('should return true for objects and arrays', () => {
      expect(isObject({})).toBe(true);
      expect(isObject({ key: 'value' })).toBe(true);
      expect(isObject([])).toBe(true);
      expect(isObject(new Date())).toBe(true);
    });

    it('should return false for primitives and null/undefined', () => {
      expect(isObject(null)).toBe(false);
      expect(isObject(undefined)).toBe(false);
      expect(isObject('string')).toBe(false);
      expect(isObject(123)).toBe(false);
      expect(isObject(true)).toBe(false);
      expect(isObject(() => {})).toBe(false);
    });
  });

  describe('hasRequiredProperties', () => {
    const testObject = { name: 'John', age: 30, email: 'john@example.com' };

    it('should return true when all required properties exist', () => {
      expect(hasRequiredProperties(testObject, ['name', 'age'])).toBe(true);
      expect(hasRequiredProperties(testObject, [])).toBe(true);
    });

    it('should return false when required properties are missing', () => {
      expect(hasRequiredProperties(testObject, ['missing'])).toBe(false);
      expect(hasRequiredProperties({}, ['name'])).toBe(false);
    });

    it('should handle properties with falsy values', () => {
      const objectWithFalsy = { zero: 0, empty: '', null: null };
      expect(hasRequiredProperties(objectWithFalsy, ['zero', 'empty', 'null'])).toBe(true);
    });
  });

  describe('hasValidPropertyTypes', () => {
    const testObject = { name: 'John', age: 30, scores: [95, 87] };

    it('should return true when all property types are valid', () => {
      const validations = {
        name: (value: unknown) => typeof value === 'string',
        age: (value: unknown) => typeof value === 'number'
      };
      expect(hasValidPropertyTypes(testObject, validations)).toBe(true);
    });

    it('should return false when property types are invalid', () => {
      const validations = { age: (value: unknown) => typeof value === 'string' };
      expect(hasValidPropertyTypes(testObject, validations)).toBe(false);
    });

    it('should handle empty validations and complex validations', () => {
      expect(hasValidPropertyTypes(testObject, {})).toBe(true);
      
      const complexValidations = {
        scores: (value: unknown) => Array.isArray(value) && value.every(v => typeof v === 'number')
      };
      expect(hasValidPropertyTypes(testObject, complexValidations)).toBe(true);
    });
  });

  describe('isValidHttpMethod', () => {
    it('should return true for valid HTTP methods (case insensitive)', () => {
      expect(isValidHttpMethod('GET')).toBe(true);
      expect(isValidHttpMethod('post')).toBe(true);
      expect(isValidHttpMethod('Put')).toBe(true);
      expect(isValidHttpMethod('DELETE')).toBe(true);
      expect(isValidHttpMethod('patch')).toBe(true);
    });

    it('should return false for invalid methods and non-strings', () => {
      expect(isValidHttpMethod('INVALID')).toBe(false);
      expect(isValidHttpMethod('HEAD')).toBe(false);
      expect(isValidHttpMethod('')).toBe(false);
      expect(isValidHttpMethod(' GET ')).toBe(false);
      expect(isValidHttpMethod(123)).toBe(false);
      expect(isValidHttpMethod(null)).toBe(false);
    });
  });

  describe('Integration', () => {
    it('should work together for endpoint validation', () => {
      const endpoint = { method: 'GET', path: '/api/users', status: 200 };
      
      expect(isObject(endpoint)).toBe(true);
      expect(hasRequiredProperties(endpoint, ['method', 'path'])).toBe(true);
      expect(hasValidPropertyTypes(endpoint, {
        method: (v) => typeof v === 'string',
        status: (v) => typeof v === 'number'
      })).toBe(true);
      expect(isValidHttpMethod(endpoint.method)).toBe(true);
    });
  });
});
