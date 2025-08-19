import { safeStringify } from '../../parameter-interpolation/interpolation/string-utils';

describe('string-utils', () => {
  describe('safeStringify', () => {
    it('should convert string to string', () => {
      expect(safeStringify('hello')).toBe('hello');
    });

    it('should convert number to string', () => {
      expect(safeStringify(42)).toBe('42');
      expect(safeStringify(3.14)).toBe('3.14');
    });

    it('should convert boolean to string', () => {
      expect(safeStringify(true)).toBe('true');
      expect(safeStringify(false)).toBe('false');
    });

    it('should convert null to empty string', () => {
      expect(safeStringify(null)).toBe('');
    });

    it('should convert undefined to empty string', () => {
      expect(safeStringify(undefined)).toBe('');
    });

    it('should convert object to [object]', () => {
      expect(safeStringify({})).toBe('[object]');
      expect(safeStringify({ key: 'value' })).toBe('[object]');
      expect(safeStringify([])).toBe('[object]');
    });

    it('should convert symbol to [object]', () => {
      expect(safeStringify(Symbol('test'))).toBe('[object]');
    });

    it('should convert function to [object]', () => {
      expect(safeStringify(() => {})).toBe('[object]');
    });
  });
});
