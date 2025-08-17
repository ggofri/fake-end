import { generateLocationStringValue } from '../location-generator';

describe('location-generator', () => {
  describe('generateLocationStringValue', () => {
    it('should generate address', () => {
      const result = generateLocationStringValue('address');
      expect(typeof result).toBe('string');
      expect(result).not.toBeNull();
    });

    it('should generate city', () => {
      const result = generateLocationStringValue('city');
      expect(typeof result).toBe('string');
      expect(result).not.toBeNull();
    });

    it('should generate state', () => {
      const result = generateLocationStringValue('state');
      expect(typeof result).toBe('string');
      expect(result).not.toBeNull();
    });

    it('should generate province', () => {
      const result = generateLocationStringValue('province');
      expect(typeof result).toBe('string');
      expect(result).not.toBeNull();
    });

    it('should generate country', () => {
      const result = generateLocationStringValue('country');
      expect(typeof result).toBe('string');
      expect(result).not.toBeNull();
    });

    it('should generate zip code', () => {
      const result = generateLocationStringValue('zip');
      expect(typeof result).toBe('string');
      expect(result).not.toBeNull();
    });

    it('should generate postal code', () => {
      const result = generateLocationStringValue('postal');
      expect(typeof result).toBe('string');
      expect(result).not.toBeNull();
    });

    it('should return null for unknown location fields', () => {
      const result = generateLocationStringValue('unknown');
      expect(result).toBeNull();
    });

    it('should handle case insensitive matching', () => {
      expect(generateLocationStringValue('ADDRESS')).not.toBeNull();
      expect(generateLocationStringValue('CITY')).not.toBeNull();
    });
  });
});
