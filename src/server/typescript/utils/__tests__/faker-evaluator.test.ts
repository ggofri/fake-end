import { evaluateFakerFunction, isFakerExpression } from '../faker-evaluator';

describe('faker-evaluator', () => {
  describe('isFakerExpression', () => {
    it('should return true for valid faker expressions', () => {
      expect(isFakerExpression('faker.person.firstName()')).toBe(true);
      expect(isFakerExpression('  faker.internet.email()  ')).toBe(true);
      expect(isFakerExpression('faker.number.int({ min: 1, max: 100 })')).toBe(true);
    });

    it('should return false for non-faker expressions', () => {
      expect(isFakerExpression('person.firstName()')).toBe(false);
      expect(isFakerExpression('() => "test"')).toBe(false);
      expect(isFakerExpression('test string')).toBe(false);
      expect(isFakerExpression('')).toBe(false);
    });
  });

  describe('evaluateFakerFunction', () => {
    it('should evaluate simple faker functions', () => {
      const result = evaluateFakerFunction('faker.person.firstName()');
      expect(typeof result).toBe('string');
      expect(result).not.toBe('');
    });

    it('should evaluate faker functions with parameters', () => {
      const result = evaluateFakerFunction('faker.number.int({ min: 10, max: 20 })');
      expect(typeof result).toBe('number');
      expect(result).toBeGreaterThanOrEqual(10);
      expect(result).toBeLessThanOrEqual(20);
    });

    it('should evaluate faker email function', () => {
      const result = evaluateFakerFunction('faker.internet.email()');
      expect(typeof result).toBe('string');
      expect(result).toMatch(/^[^\s@]+@[^\s@]+\.[^\s@]+$/);
    });

    it('should evaluate faker boolean function', () => {
      const result = evaluateFakerFunction('faker.datatype.boolean()');
      expect(typeof result).toBe('boolean');
    });

    it('should evaluate faker date function', () => {
      const result = evaluateFakerFunction('faker.date.recent()');
      expect(result).toBeInstanceOf(Date);
    });

    it('should handle complex faker expressions', () => {
      const result = evaluateFakerFunction('faker.helpers.arrayElement(["admin", "user", "guest"])');
      expect(['admin', 'user', 'guest']).toContain(result);
    });

    it('should return undefined for invalid expressions', () => {
      const result = evaluateFakerFunction('invalid.expression()');
      expect(result).toBeUndefined();
    });

    it('should return undefined for non-faker expressions', () => {
      const result = evaluateFakerFunction('person.firstName()');
      expect(result).toBeUndefined();
    });

    it('should handle syntax errors gracefully', () => {
      const result = evaluateFakerFunction('faker.person.firstName(');
      expect(result).toBeUndefined();
    });

    it('should handle whitespace correctly', () => {
      const result = evaluateFakerFunction('  faker.person.firstName()  ');
      expect(typeof result).toBe('string');
      expect(result).not.toBe('');
    });
  });
});
