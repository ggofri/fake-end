import { inferTypeScriptType } from '../type-inference';

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

    it('should infer object as Record<string, unknown>', () => {
      expect(inferTypeScriptType({ key: 'value' })).toBe('Record<string, unknown>');
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

    it('should infer array of objects', () => {
      expect(inferTypeScriptType([{ id: 1 }, { id: 2 }])).toBe('Record<string, unknown>[]');
    });

    it('should infer nested arrays', () => {
      expect(inferTypeScriptType([[1, 2], [3, 4]])).toBe('number[][]');
    });
  });
});
