import { getNestedValue } from '../../parameter-interpolation/interpolation/value-extractor';

describe('value-extractor', () => {
  describe('getNestedValue', () => {
    const testObject = {
      user: {
        id: 123,
        profile: {
          name: 'John Doe',
          settings: {
            theme: 'dark'
          }
        }
      },
      items: ['a', 'b', 'c']
    };

    it('should extract top-level values', () => {
      expect(getNestedValue(testObject, 'items')).toEqual(['a', 'b', 'c']);
    });

    it('should extract nested values', () => {
      expect(getNestedValue(testObject, 'user.id')).toBe(123);
      expect(getNestedValue(testObject, 'user.profile.name')).toBe('John Doe');
    });

    it('should extract deeply nested values', () => {
      expect(getNestedValue(testObject, 'user.profile.settings.theme')).toBe('dark');
    });

    it('should return undefined for non-existent paths', () => {
      expect(getNestedValue(testObject, 'nonexistent')).toBeUndefined();
      expect(getNestedValue(testObject, 'user.nonexistent')).toBeUndefined();
      expect(getNestedValue(testObject, 'user.profile.nonexistent')).toBeUndefined();
    });

    it('should return undefined when path goes through non-object', () => {
      expect(getNestedValue(testObject, 'user.id.name')).toBeUndefined();
      expect(getNestedValue(testObject, 'items.length.foo')).toBeUndefined();
    });

    it('should handle empty path', () => {
      expect(getNestedValue(testObject, '')).toEqual(testObject);
    });

    it('should handle single property path', () => {
      expect(getNestedValue(testObject, 'user')).toEqual(testObject.user);
    });

    it('should handle null and undefined values in path', () => {
      const objWithNulls = {
        nullable: null,
        undefinedValue: undefined
      };
      
      expect(getNestedValue(objWithNulls, 'nullable')).toBeNull();
      expect(getNestedValue(objWithNulls, 'undefinedValue')).toBeUndefined();
      expect(getNestedValue(objWithNulls, 'nullable.nested')).toBeUndefined();
    });
  });
});
