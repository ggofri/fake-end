import { normalizeUrl, extractQueryParams, findFirstNonEmptyMatch } from '../url-parser';

type matchesType = [string, string, string]

describe('URL Parser Utils', () => {
  describe('normalizeUrl', () => {
    it('should add https prefix to URLs without protocol', () => {
      expect(normalizeUrl('example.com/api')).toBe('https://example.com/api');
      expect(normalizeUrl('api.test.com')).toBe('https://api.test.com');
    });

    it('should preserve existing protocols', () => {
      expect(normalizeUrl('http://example.com/api')).toBe('http://example.com/api');
      expect(normalizeUrl('https://example.com/api')).toBe('https://example.com/api');
    });

    it('should handle empty or invalid URLs', () => {
      expect(normalizeUrl('')).toBe('https://');
      expect(normalizeUrl('not-a-url')).toBe('https://not-a-url');
    });
  });

  describe('extractQueryParams', () => {
    it('should extract basic query parameters', () => {
      const url = new URL('http://example.com/api?name=john&age=30&active=true');
      const result = extractQueryParams(url);
      
      expect(result).toEqual({
        name: 'john',
        age: '30',
        active: 'true'
      });
    });

    it('should handle URLs without query parameters', () => {
      const url = new URL('http://example.com/api');
      const result = extractQueryParams(url);
      
      expect(result).toEqual({});
    });

    it('should handle special characters in values', () => {
      const url = new URL('http://example.com/api?search=hello%20world&filter=name%3Djohn');
      const result = extractQueryParams(url);
      
      expect(result).toEqual({
        search: 'hello world',
        filter: 'name=john'
      });
    });

    it('should handle multiple values for same key', () => {
      const url = new URL('http://example.com/api?tag=js&tag=node&tag=api');
      const result = extractQueryParams(url);
      
      expect(result.tag).toBe('api');
    });
  });

  describe('findFirstNonEmptyMatch', () => {
    it('should return first non-empty match', () => {
      const matches: matchesType = ['', 'second', 'third'];
      const result = findFirstNonEmptyMatch(matches);
      
      expect(result).toBe('second');
    });

    it('should handle all empty matches', () => {
      const matches: matchesType = ['', '', ''];
      const result = findFirstNonEmptyMatch(matches);
      
      expect(result).toBe('');
    });

    it('should handle matches with falsy but non-empty values', () => {
      const matches: matchesType = ['', '0', 'third'];
      const result = findFirstNonEmptyMatch(matches);
      
      expect(result).toBe('0');
    });

    it('should work with real regex match results', () => {
      const text = 'abc123def';
      const regex = /(abc)?(\d+)?(def)?/;
      const matches = text.match(regex);
      
      if (matches) {
        const result = findFirstNonEmptyMatch(matches);
        expect(result).toBe('abc');
      }
    });
  });
});
