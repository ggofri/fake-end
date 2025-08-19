import { generateRealisticValue } from '../../utils/realistic-value-generator';

describe('generateRealisticValue', () => {
  describe('string values', () => {
    it('should generate realistic email for email properties', () => {
      const result = generateRealisticValue('email', 'StringKeyword');
      expect(typeof result).toBe('string');
      expect(result).toMatch(/^[^\s@]+@[^\s@]+\.[^\s@]+$/);
    });

    it('should generate realistic name for name properties', () => {
      const result = generateRealisticValue('name', 'StringKeyword');
      expect(typeof result).toBe('string');
      expect(result).not.toBe('sample_name');
    });

    it('should generate realistic firstName for firstName properties', () => {
      const result = generateRealisticValue('firstName', 'StringKeyword');
      expect(typeof result).toBe('string');
      expect(result).not.toBe('sample_firstName');
    });

    it('should generate realistic lastName for lastName properties', () => {
      const result = generateRealisticValue('lastName', 'StringKeyword');
      expect(typeof result).toBe('string');
      expect(result).not.toBe('sample_lastName');
    });

    it('should generate realistic phone for phone properties', () => {
      const result = generateRealisticValue('phone', 'StringKeyword');
      expect(typeof result).toBe('string');
      expect(result).not.toBe('sample_phone');
    });

    it('should generate realistic address for address properties', () => {
      const result = generateRealisticValue('address', 'StringKeyword');
      expect(typeof result).toBe('string');
      expect(result).not.toBe('sample_address');
    });

    it('should generate realistic company for company properties', () => {
      const result = generateRealisticValue('company', 'StringKeyword');
      expect(typeof result).toBe('string');
      expect(result).not.toBe('sample_company');
    });

    it('should generate realistic URL for url properties', () => {
      const result = generateRealisticValue('url', 'StringKeyword');
      expect(typeof result).toBe('string');
      expect(result).toMatch(/^https?:\/\//);
    });

    it('should generate realistic description for description properties', () => {
      const result = generateRealisticValue('description', 'StringKeyword');
      expect(typeof result).toBe('string');
      expect(result).not.toBe('sample_description');
    });

    it('should generate UUID for user_id properties', () => {
      const result = generateRealisticValue('user_id', 'StringKeyword');
      expect(typeof result).toBe('string');
      expect(result).toMatch(/^[a-f0-9-]{36}$/);
    });

    it('should generate realistic date for date properties', () => {
      const result = generateRealisticValue('createdAt', 'StringKeyword');
      expect(typeof result).toBe('string');
      expect(result).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/);
    });

    it('should generate realistic status for status properties', () => {
      const result = generateRealisticValue('status', 'StringKeyword');
      expect(typeof result).toBe('string');
      expect(['active', 'inactive', 'pending', 'approved', 'rejected']).toContain(result);
    });
  });

  describe('number values', () => {
    it('should generate realistic id for id properties', () => {
      const result = generateRealisticValue('id', 'NumberKeyword');
      expect(typeof result).toBe('number');
      expect(result).toBeGreaterThan(0);
      expect(result).toBeLessThanOrEqual(10000);
    });

    it('should generate realistic age for age properties', () => {
      const result = generateRealisticValue('age', 'NumberKeyword');
      expect(typeof result).toBe('number');
      expect(result).toBeGreaterThanOrEqual(18);
      expect(result).toBeLessThanOrEqual(100);
    });

    it('should generate realistic price for price properties', () => {
      const result = generateRealisticValue('price', 'NumberKeyword');
      expect(typeof result).toBe('number');
      expect(result).toBeGreaterThan(0);
      expect(result).toBeLessThanOrEqual(999.99);
    });

    it('should generate realistic rating for rating properties', () => {
      const result = generateRealisticValue('rating', 'NumberKeyword');
      expect(typeof result).toBe('number');
      expect(result).toBeGreaterThanOrEqual(1);
      expect(result).toBeLessThanOrEqual(5);
    });

    it('should generate realistic count for count properties', () => {
      const result = generateRealisticValue('count', 'NumberKeyword');
      expect(typeof result).toBe('number');
      expect(result).toBeGreaterThanOrEqual(0);
      expect(result).toBeLessThanOrEqual(1000);
    });

    it('should generate realistic year for year properties', () => {
      const result = generateRealisticValue('year', 'NumberKeyword');
      expect(typeof result).toBe('number');
      expect(result).toBeGreaterThanOrEqual(1900);
      expect(result).toBeLessThanOrEqual(new Date().getFullYear());
    });
  });

  describe('boolean values', () => {
    it('should generate boolean for boolean properties', () => {
      const result = generateRealisticValue('isActive', 'BooleanKeyword');
      expect(typeof result).toBe('boolean');
    });
  });

  describe('fallback values', () => {
    it('should return null for unsupported types', () => {
      const result = generateRealisticValue('someProperty', 'UnknownType');
      expect(result).toBeNull();
    });
  });
});
