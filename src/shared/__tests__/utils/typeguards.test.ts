import { isRecordOfUnknown, isRecordOfStrings, isNil } from '@/shared/utils/typeguards';

describe('Typeguards Utils', () => {
  describe('isRecordOfUnknown', () => {
    it('should return true for objects and object instances', () => {
      expect(isRecordOfUnknown({})).toBe(true);
      expect(isRecordOfUnknown({ key: 'value' })).toBe(true);
      expect(isRecordOfUnknown(new Date())).toBe(true);
      expect(isRecordOfUnknown(/regex/)).toBe(true);
    });

    it('should return false for non-objects', () => {
      expect(isRecordOfUnknown(null)).toBe(false);
      expect(isRecordOfUnknown(undefined)).toBe(false);
      expect(isRecordOfUnknown([])).toBe(false);
      expect(isRecordOfUnknown('string')).toBe(false);
      expect(isRecordOfUnknown(123)).toBe(false);
      expect(isRecordOfUnknown(() => {})).toBe(false);
    });
  });

  describe('isRecordOfStrings', () => {
    it('should return true for objects with string keys', () => {
      expect(isRecordOfStrings({})).toBe(true);
      expect(isRecordOfStrings({ key: 'value' })).toBe(true);
      expect(isRecordOfStrings({ a: 1, b: 2 })).toBe(true);
      expect(isRecordOfStrings(new Date())).toBe(true);
    });

    it('should return false for non-objects', () => {
      expect(isRecordOfStrings(null)).toBe(false);
      expect(isRecordOfStrings(undefined)).toBe(false);
      expect(isRecordOfStrings([])).toBe(false);
      expect(isRecordOfStrings('string')).toBe(false);
      expect(isRecordOfStrings(() => {})).toBe(false);
    });
  });

  describe('isNil', () => {
    it('should return true for null and undefined', () => {
      expect(isNil(null)).toBe(true);
      expect(isNil(undefined)).toBe(true);
    });

    it('should return false for all other values', () => {
      expect(isNil('')).toBe(false);
      expect(isNil(0)).toBe(false);
      expect(isNil(false)).toBe(false);
      expect(isNil({})).toBe(false);
      expect(isNil([])).toBe(false);
      expect(isNil('hello')).toBe(false);
    });

    it('should work with filter operations', () => {
      const values: unknown[] = ['hello', null, 42, undefined, '', 0];
      const nilValues = values.filter(isNil);
      expect(nilValues).toEqual([null, undefined]);
    });
  });
});
