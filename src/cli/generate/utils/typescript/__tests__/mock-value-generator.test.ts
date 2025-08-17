import { generateMockValueForType } from '../mock-value-generator';

describe('mock-value-generator', () => {
  describe('generateMockValueForType', () => {
    it('should generate mock values based on field names', () => {
      expect(generateMockValueForType('userId', null)).toBe('"mock-id-123"');
      expect(generateMockValueForType('email', null)).toBe('"user@example.com"');
      expect(generateMockValueForType('userName', null)).toBe('"Sample Name"');
      expect(generateMockValueForType('websiteUrl', null)).toBe('"https://example.com"');
      expect(generateMockValueForType('createdDate', null)).toBe('"2024-01-01T00:00:00Z"');
      expect(generateMockValueForType('phoneNumber', null)).toBe('"+1-555-123-4567"');
      expect(generateMockValueForType('price', null)).toBe('"99.99"');
      expect(generateMockValueForType('totalCount', null)).toBe('"10"');
      expect(generateMockValueForType('isActive', null)).toBe('"true"');
      expect(generateMockValueForType('enabled', null)).toBe('"true"');
    });

    it('should use actual value when provided', () => {
      expect(generateMockValueForType('title', 'Test Title')).toBe('"Test Title"');
      expect(generateMockValueForType('count', 42)).toBe('"10"');
      expect(generateMockValueForType('active', true)).toBe('"true"');
    });

    it('should generate default values based on type when no field name match', () => {
      expect(generateMockValueForType('unknownField', null)).toBe('"sample value"');
      expect(generateMockValueForType('unknownField', undefined)).toBe('"sample value"');
    });

    it('should handle complex objects', () => {
      const complexObject = { nested: { value: 'test' } };
      const result = generateMockValueForType('data', complexObject);
      expect(result).toBe('{"nested":{"value":"test"}}');
    });

    it('should handle arrays', () => {
      const array = [1, 2, 3];
      const result = generateMockValueForType('items', array);
      expect(result).toBe('[1,2,3]');
    });

    it('should prioritize field name patterns over actual values for common patterns', () => {
      expect(generateMockValueForType('id', 'actual-id-value')).toBe('"mock-id-123"');
      expect(generateMockValueForType('email', 'actual@email.com')).toBe('"user@example.com"');
    });

    it('should handle case insensitive field names', () => {
      expect(generateMockValueForType('ID', null)).toBe('"mock-id-123"');
      expect(generateMockValueForType('EMAIL', null)).toBe('"user@example.com"');
      expect(generateMockValueForType('NAME', null)).toBe('"Sample Name"');
    });
  });
});
