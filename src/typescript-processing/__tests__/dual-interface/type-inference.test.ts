import { inferTypeScriptType } from '@/typescript-processing/dual-interface/type-inference';

describe('type-inference', () => {
  describe('inferTypeScriptType', () => {
    it('should infer string type', () => {
      expect(inferTypeScriptType('hello')).toBe('string');
    });

    it('should infer number type', () => {
      expect(inferTypeScriptType(42)).toBe('number');
      expect(inferTypeScriptType(3.14)).toBe('number');
    });

    it('should infer boolean type', () => {
      expect(inferTypeScriptType(true)).toBe('boolean');
      expect(inferTypeScriptType(false)).toBe('boolean');
    });

    it('should infer null as string | null', () => {
      expect(inferTypeScriptType(null)).toBe('string | null');
    });

    it('should infer undefined as string | null', () => {
      expect(inferTypeScriptType(undefined)).toBe('string | null');
    });

    it('should infer object with specific interface structure', () => {
      expect(inferTypeScriptType({ key: 'value' })).toBe('{ key: string }');
    });

    it('should infer empty array as unknown[]', () => {
      expect(inferTypeScriptType([])).toBe('unknown[]');
    });

    it('should infer array of strings', () => {
      expect(inferTypeScriptType(['a', 'b', 'c'])).toBe('string[]');
    });

    it('should infer array of numbers', () => {
      expect(inferTypeScriptType([1, 2, 3])).toBe('number[]');
    });

    it('should infer array of objects with specific structure', () => {
      expect(inferTypeScriptType([{ id: 1 }, { id: 2 }])).toBe('{ id: number }[]');
    });

    it('should infer nested arrays', () => {
      expect(inferTypeScriptType([[1, 2], [3, 4]])).toBe('number[][]');
    });
  });
});
