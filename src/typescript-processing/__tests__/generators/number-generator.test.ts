import { generateRealisticNumberValue } from '@/typescript-processing/utils/generators/number-generator';

describe('number-generator', () => {
  describe('generateRealisticNumberValue', () => {
    it('should generate age between 18 and 100', () => {
      const result = generateRealisticNumberValue('age');
      expect(result).toBeGreaterThanOrEqual(18);
      expect(result).toBeLessThanOrEqual(100);
    });

    it('should generate year between 1900 and current year', () => {
      const result = generateRealisticNumberValue('year');
      const currentYear = new Date().getFullYear();
      expect(result).toBeGreaterThanOrEqual(1900);
      expect(result).toBeLessThanOrEqual(currentYear);
    });

    it('should generate month between 1 and 12', () => {
      const result = generateRealisticNumberValue('month');
      expect(result).toBeGreaterThanOrEqual(1);
      expect(result).toBeLessThanOrEqual(12);
    });

    it('should generate day between 1 and 31', () => {
      const result = generateRealisticNumberValue('day');
      expect(result).toBeGreaterThanOrEqual(1);
      expect(result).toBeLessThanOrEqual(31);
    });

    it('should generate hour between 0 and 23', () => {
      const result = generateRealisticNumberValue('hour');
      expect(result).toBeGreaterThanOrEqual(0);
      expect(result).toBeLessThanOrEqual(23);
    });

    it('should generate minute between 0 and 59', () => {
      const result = generateRealisticNumberValue('minute');
      expect(result).toBeGreaterThanOrEqual(0);
      expect(result).toBeLessThanOrEqual(59);
    });

    it('should generate price with decimals', () => {
      const result = generateRealisticNumberValue('price');
      expect(result).toBeGreaterThanOrEqual(1);
      expect(result).toBeLessThanOrEqual(999.99);
    });

    it('should generate salary between 30000 and 200000', () => {
      const result = generateRealisticNumberValue('salary');
      expect(result).toBeGreaterThanOrEqual(30000);
      expect(result).toBeLessThanOrEqual(200000);
    });

    it('should generate percentage between 0 and 100', () => {
      const result = generateRealisticNumberValue('percent');
      expect(result).toBeGreaterThanOrEqual(0);
      expect(result).toBeLessThanOrEqual(100);
    });

    it('should generate weight with decimals', () => {
      const result = generateRealisticNumberValue('weight');
      expect(result).toBeGreaterThanOrEqual(0.1);
      expect(result).toBeLessThanOrEqual(1000);
    });

    it('should generate height with decimals', () => {
      const result = generateRealisticNumberValue('height');
      expect(result).toBeGreaterThanOrEqual(1);
      expect(result).toBeLessThanOrEqual(500);
    });

    it('should generate id between 1 and 10000', () => {
      const result = generateRealisticNumberValue('id');
      expect(result).toBeGreaterThanOrEqual(1);
      expect(result).toBeLessThanOrEqual(10000);
    });

    it('should generate count between 0 and 1000', () => {
      const result = generateRealisticNumberValue('count');
      expect(result).toBeGreaterThanOrEqual(0);
      expect(result).toBeLessThanOrEqual(1000);
    });

    it('should generate rating between 1 and 5', () => {
      const result = generateRealisticNumberValue('rating');
      expect(result).toBeGreaterThanOrEqual(1);
      expect(result).toBeLessThanOrEqual(5);
    });

    it('should generate version between 1 and 10', () => {
      const result = generateRealisticNumberValue('version');
      expect(result).toBeGreaterThanOrEqual(1);
      expect(result).toBeLessThanOrEqual(10);
    });

    it('should generate priority between 1 and 5', () => {
      const result = generateRealisticNumberValue('priority');
      expect(result).toBeGreaterThanOrEqual(1);
      expect(result).toBeLessThanOrEqual(5);
    });

    it('should generate default number for unknown fields', () => {
      const result = generateRealisticNumberValue('unknown');
      expect(result).toBeGreaterThanOrEqual(1);
      expect(result).toBeLessThanOrEqual(1000);
    });
  });
});
