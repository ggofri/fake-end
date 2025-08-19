import { parseCurlCommand } from '../../utils/curl-parser';

jest.mock('@/shared/utils', () => ({
  normalizeUrl: jest.fn((url: string) => url),
  extractQueryParams: jest.fn(() => ({})),
  findFirstNonEmptyMatch: jest.fn()
}));

import { findFirstNonEmptyMatch } from '@/shared/utils';
const mockFindFirstNonEmptyMatch = findFirstNonEmptyMatch as jest.MockedFunction<typeof findFirstNonEmptyMatch>;

describe('curl-parser', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    mockFindFirstNonEmptyMatch.mockImplementation((matches: RegExpMatchArray) => {
      const nonEmptyMatches = matches.slice(1).filter(Boolean);
      return nonEmptyMatches[0] ?? '';
    });
  });

  describe('cleanCurlCommand', () => {
    test('should remove line breaks and normalize whitespace', () => {
      const input = 'curl \\\n  http://example.com \\\n  --header "test"';
      const result = parseCurlCommand(input);
      
      expect(result.url).toBe('http://example.com');
    });

    test('should trim whitespace', () => {
      const input = '   curl http://example.com   ';
      const result = parseCurlCommand(input);
      
      expect(result.url).toBe('http://example.com');
    });
  });

  describe('extractMethod', () => {
    test('should extract method from --request flag', () => {
      const input = 'curl --request POST http://example.com';
      const result = parseCurlCommand(input);
      
      expect(result.method).toBe('POST');
    });

    test('should extract method from -X flag', () => {
      const input = 'curl -X PUT http://example.com';
      const result = parseCurlCommand(input);
      
      expect(result.method).toBe('PUT');
    });

    test('should extract method from --X flag', () => {
      const input = 'curl --X DELETE http://example.com';
      const result = parseCurlCommand(input);
      
      expect(result.method).toBe('DELETE');
    });

    test('should default to GET when no method specified', () => {
      const input = 'curl http://example.com';
      const result = parseCurlCommand(input);
      
      expect(result.method).toBe('GET');
    });

    test('should handle case insensitive methods', () => {
      const input = 'curl -X post http://example.com';
      const result = parseCurlCommand(input);
      
      expect(result.method).toBe('POST');
    });
  });

  describe('extractUrl', () => {
    test('should extract URL from --url flag', () => {
      const input = 'curl --url http://example.com/api';
      const result = parseCurlCommand(input);
      
      expect(result.url).toBe('http://example.com/api');
    });

    test('should extract URL from basic curl command', () => {
      const input = 'curl http://example.com/users';
      const result = parseCurlCommand(input);
      
      expect(result.url).toBe('http://example.com/users');
    });

    test('should extract HTTPS URL', () => {
      const input = 'curl https://api.example.com/v1/users';
      const result = parseCurlCommand(input);
      
      expect(result.url).toBe('https://api.example.com/v1/users');
    });

    test('should throw error when URL cannot be extracted', () => {
      const input = 'curl --header "test"';
      
      expect(() => parseCurlCommand(input)).toThrow('Could not extract URL from cURL command');
    });
  });

  describe('extractHeaders', () => {
    test('should extract single header with --header flag and single quotes', () => {
      const input = 'curl --header \'Content-Type: application/json\' http://example.com';
      const result = parseCurlCommand(input);
      
      expect(result.headers).toEqual({
        'content-type': 'application/json'
      });
    });

    test('should extract single header with -H flag and double quotes', () => {
      const input = 'curl -H "Authorization: Bearer token123" http://example.com';
      const result = parseCurlCommand(input);
      
      expect(result.headers).toEqual({
        'authorization': 'Bearer token123'
      });
    });

    test('should extract multiple headers', () => {
      const input = 'curl -H "Content-Type: application/json" -H "Authorization: Bearer token" http://example.com';
      const result = parseCurlCommand(input);
      
      expect(result.headers).toEqual({
        'content-type': 'application/json',
        'authorization': 'Bearer token'
      });
    });

    test('should handle header without quotes', () => {
      const input = 'curl -H Accept:application/json http://example.com';
      const result = parseCurlCommand(input);
      
      expect(result.headers).toEqual({
        'accept': 'application/json'
      });
    });

    test('should handle header values with colons', () => {
      const input = 'curl -H "Time: 12:30:45" http://example.com';
      const result = parseCurlCommand(input);
      
      expect(result.headers).toEqual({
        'time': '12:30:45'
      });
    });

    test('should return empty object when no headers present', () => {
      const input = 'curl http://example.com';
      const result = parseCurlCommand(input);
      
      expect(result.headers).toEqual({});
    });
  });

  describe('extractData', () => {
    test('should extract data with --data flag and single quotes', () => {
      const input = 'curl --data \'{"name": "test"}\' http://example.com';
      const result = parseCurlCommand(input);
      
      expect(result.data).toBe('{"name": "test"}');
    });

    test('should extract data with -d flag and double quotes', () => {
      const input = 'curl -d "key=value" http://example.com';
      const result = parseCurlCommand(input);
      
      expect(result.data).toBe('key=value');
    });

    test('should extract data without quotes', () => {
      const input = 'curl -d name=test http://example.com';
      const result = parseCurlCommand(input);
      
      expect(result.data).toBe('name=test');
    });

    test('should return empty string when no data present', () => {
      const input = 'curl http://example.com';
      const result = parseCurlCommand(input);
      
      expect(result.data).toBe('');
    });
  });

  describe('parseCurlCommand integration', () => {
    test('should parse complete curl command with all components', () => {
      const input = 'curl -X POST -H "Content-Type: application/json" -d \'{"name": "test"}\' http://example.com/api';
      const result = parseCurlCommand(input);
      
      expect(result.method).toBe('POST');
      expect(result.url).toBe('http://example.com/api');
      expect(result.path).toBe('/api');
      expect(result.headers).toEqual({
        'content-type': 'application/json'
      });
      expect(result.data).toBe('{"name": "test"}');
    });
  });
});
