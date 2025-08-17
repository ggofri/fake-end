import { left, right, isLeft, isRight, Either } from '../index';

describe('Either types', () => {
  describe('left', () => {
    it('should create a Left value', () => {
      const result = left('error');
      expect(result._tag).toBe('Left');
      expect(result.value).toBe('error');
    });
  });

  describe('right', () => {
    it('should create a Right value', () => {
      const result = right('success');
      expect(result._tag).toBe('Right');
      expect(result.value).toBe('success');
    });
  });

  describe('isLeft', () => {
    it('should return true for Left values', () => {
      const leftValue: Either<string, number> = left('error');
      expect(isLeft(leftValue)).toBe(true);
    });

    it('should return false for Right values', () => {
      const rightValue: Either<string, number> = right(42);
      expect(isLeft(rightValue)).toBe(false);
    });
  });

  describe('isRight', () => {
    it('should return true for Right values', () => {
      const rightValue: Either<string, number> = right(42);
      expect(isRight(rightValue)).toBe(true);
    });

    it('should return false for Left values', () => {
      const leftValue: Either<string, number> = left('error');
      expect(isRight(leftValue)).toBe(false);
    });
  });
});
