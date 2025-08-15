import { isArrayOfMockEndpoints, isOllamaResponse } from '../typeguards';
import { MockEndpoint, OllamaResponse } from '../index';

describe('Generate Type Guards', () => {
  describe('isArrayOfMockEndpoints', () => {
    it('should return true for empty array', () => {
      expect(isArrayOfMockEndpoints([])).toBe(true);
    });

    it('should return true for array of valid MockEndpoints', () => {
      const mockEndpoints: MockEndpoint[] = [
        {
          method: 'GET',
          path: '/users',
          status: 200,
          body: { users: [] }
        },
        {
          method: 'POST',
          path: '/users',
          status: 201,
          body: { id: 1, name: 'John' }
        }
      ];

      expect(isArrayOfMockEndpoints(mockEndpoints)).toBe(true);
    });

    it('should return true for array with various valid body types', () => {
      const mockEndpoints = [
        {
          method: 'GET',
          path: '/message',
          status: 200,
          body: 'Hello World'
        },
        {
          method: 'GET',
          path: '/count',
          status: 200,
          body: 42
        },
        {
          method: 'GET',
          path: '/active',
          status: 200,
          body: true
        },
        {
          method: 'GET',
          path: '/items',
          status: 200,
          body: [1, 2, 3]
        },
        {
          method: 'DELETE',
          path: '/users/1',
          status: 204,
          body: null
        }
      ];

      expect(isArrayOfMockEndpoints(mockEndpoints)).toBe(true);
    });

    it('should return true for array with optional properties', () => {
      const mockEndpoints = [
        {
          method: 'GET',
          path: '/users',
          status: 200,
          body: { users: [] },
          headers: { 'Content-Type': 'application/json' },
          delayMs: 1000
        }
      ];

      expect(isArrayOfMockEndpoints(mockEndpoints)).toBe(true);
    });

    it('should return false for non-arrays', () => {
      expect(isArrayOfMockEndpoints(null)).toBe(false);
      expect(isArrayOfMockEndpoints(undefined)).toBe(false);
      expect(isArrayOfMockEndpoints({})).toBe(false);
      expect(isArrayOfMockEndpoints('not an array')).toBe(false);
      expect(isArrayOfMockEndpoints(123)).toBe(false);
      expect(isArrayOfMockEndpoints(true)).toBe(false);
    });

    it('should return false for array with invalid MockEndpoint - missing method', () => {
      const invalidEndpoints = [
        {
          path: '/users',
          status: 200,
          body: { users: [] }
        }
      ];

      expect(isArrayOfMockEndpoints(invalidEndpoints)).toBe(false);
    });

    it('should return false for array with invalid MockEndpoint - missing path', () => {
      const invalidEndpoints = [
        {
          method: 'GET',
          status: 200,
          body: { users: [] }
        }
      ];

      expect(isArrayOfMockEndpoints(invalidEndpoints)).toBe(false);
    });

    it('should return false for array with invalid MockEndpoint - missing status', () => {
      const invalidEndpoints = [
        {
          method: 'GET',
          path: '/users',
          body: { users: [] }
        }
      ];

      expect(isArrayOfMockEndpoints(invalidEndpoints)).toBe(false);
    });

    it('should return false for array with invalid MockEndpoint - wrong method type', () => {
      const invalidEndpoints = [
        {
          method: 123,
          path: '/users',
          status: 200,
          body: { users: [] }
        }
      ];

      expect(isArrayOfMockEndpoints(invalidEndpoints)).toBe(false);
    });

    it('should return false for array with invalid MockEndpoint - wrong path type', () => {
      const invalidEndpoints = [
        {
          method: 'GET',
          path: 123,
          status: 200,
          body: { users: [] }
        }
      ];

      expect(isArrayOfMockEndpoints(invalidEndpoints)).toBe(false);
    });

    it('should return false for array with invalid MockEndpoint - wrong status type', () => {
      const invalidEndpoints = [
        {
          method: 'GET',
          path: '/users',
          status: '200',
          body: { users: [] }
        }
      ];

      expect(isArrayOfMockEndpoints(invalidEndpoints)).toBe(false);
    });

    it('should return false for array with invalid body type', () => {
      const invalidEndpoints = [
        {
          method: 'GET',
          path: '/users',
          status: 200,
          body: Symbol('invalid')
        }
      ];

      expect(isArrayOfMockEndpoints(invalidEndpoints)).toBe(false);
    });

    it('should return false for array with mixed valid and invalid endpoints', () => {
      const mixedEndpoints = [
        {
          method: 'GET',
          path: '/users',
          status: 200,
          body: { users: [] }
        },
        {
          method: 'POST',
          // missing path
          status: 201,
          body: { id: 1 }
        }
      ];

      expect(isArrayOfMockEndpoints(mixedEndpoints)).toBe(false);
    });

    it('should return false for array containing non-object elements', () => {
      const invalidArray = [
        'not an object',
        123,
        true
      ];

      expect(isArrayOfMockEndpoints(invalidArray)).toBe(false);
    });

    it('should return false for array containing null or undefined elements', () => {
      const invalidArray = [
        {
          method: 'GET',
          path: '/users',
          status: 200,
          body: []
        },
        null,
        undefined
      ];

      expect(isArrayOfMockEndpoints(invalidArray)).toBe(false);
    });

    it('should type guard correctly', () => {
      const value: unknown = [
        {
          method: 'GET',
          path: '/users',
          status: 200,
          body: { users: [] }
        }
      ];

      if (isArrayOfMockEndpoints(value)) {
        // TypeScript should know value is MockEndpoint[] here
        expect(value.length).toBe(1);
        expect(value[0].method).toBe('GET');
        expect(value[0].path).toBe('/users');
        expect(value[0].status).toBe(200);
      }
    });
  });

  describe('isOllamaResponse', () => {
    it('should return true for valid OllamaResponse', () => {
      const ollamaResponse: OllamaResponse = {
        response: 'Generated response from Ollama'
      };

      expect(isOllamaResponse(ollamaResponse)).toBe(true);
    });

    it('should return true for OllamaResponse with string response', () => {
      const response = {
        response: 'Hello from Ollama'
      };

      expect(isOllamaResponse(response)).toBe(true);
    });

    it('should return true for OllamaResponse with empty string response', () => {
      const response = {
        response: ''
      };

      expect(isOllamaResponse(response)).toBe(true);
    });

    it('should return true for OllamaResponse with number response', () => {
      const response = {
        response: 42
      };

      expect(isOllamaResponse(response)).toBe(true);
    });

    it('should return true for OllamaResponse with boolean response', () => {
      const response = {
        response: true
      };

      expect(isOllamaResponse(response)).toBe(true);
    });

    it('should return true for OllamaResponse with null response', () => {
      const response = {
        response: null
      };

      expect(isOllamaResponse(response)).toBe(true);
    });

    it('should return true for OllamaResponse with object response', () => {
      const response = {
        response: { data: 'test' }
      };

      expect(isOllamaResponse(response)).toBe(true);
    });

    it('should return true for OllamaResponse with array response', () => {
      const response = {
        response: [1, 2, 3]
      };

      expect(isOllamaResponse(response)).toBe(true);
    });

    it('should return true for OllamaResponse with additional properties', () => {
      const response = {
        response: 'Generated text',
        model: 'llama2',
        created_at: '2024-01-01T00:00:00Z',
        done: true
      };

      expect(isOllamaResponse(response)).toBe(true);
    });

    it('should return false for missing response property', () => {
      const invalidResponse = {
        model: 'llama2',
        done: true
      };

      expect(isOllamaResponse(invalidResponse)).toBe(false);
    });

    it('should return false for object with undefined response', () => {
      const invalidResponse = {
        response: undefined,
        model: 'llama2'
      };

      expect(isOllamaResponse(invalidResponse)).toBe(false);
    });

    it('should return false for non-objects', () => {
      expect(isOllamaResponse(null)).toBe(false);
      expect(isOllamaResponse(undefined)).toBe(false);
      expect(isOllamaResponse('string')).toBe(false);
      expect(isOllamaResponse(123)).toBe(false);
      expect(isOllamaResponse(true)).toBe(false);
      expect(isOllamaResponse([])).toBe(false);
    });

    it('should return false for empty object', () => {
      expect(isOllamaResponse({})).toBe(false);
    });

    it('should return false for array', () => {
      const array = ['response', 'data'];
      expect(isOllamaResponse(array)).toBe(false);
    });

    it('should return false for functions', () => {
      const func = () => ({ response: 'test' });
      expect(isOllamaResponse(func)).toBe(false);
    });

    it('should return false for Date objects', () => {
      const date = new Date();
      expect(isOllamaResponse(date)).toBe(false);
    });

    it('should return false for RegExp objects', () => {
      const regex = /response/;
      expect(isOllamaResponse(regex)).toBe(false);
    });

    it('should type guard correctly', () => {
      const value: unknown = {
        response: 'Generated response',
        model: 'llama2'
      };

      if (isOllamaResponse(value)) {
        // TypeScript should know value is OllamaResponse here
        expect(typeof value.response).toBe('string');
        expect(value.response).toBe('Generated response');
      }
    });

    it('should handle nested objects properly', () => {
      const complexResponse = {
        response: {
          text: 'Generated text',
          metadata: {
            tokens: 150,
            time: 2.5
          }
        },
        status: 'complete'
      };

      expect(isOllamaResponse(complexResponse)).toBe(true);
    });

    it('should handle objects created with Object.create(null)', () => {
      const nullPrototypeObject = Object.create(null);
      nullPrototypeObject.response = 'test response';

      expect(isOllamaResponse(nullPrototypeObject)).toBe(true);
    });

    it('should handle class instances with response property', () => {
      class ResponseContainer {
        constructor(public response: string) {}
      }

      const instance = new ResponseContainer('class response');
      expect(isOllamaResponse(instance)).toBe(true);
    });
  });

  describe('Integration scenarios', () => {
    it('should work together for filtering mixed data', () => {
      const mixedData: unknown[] = [
        [
          {
            method: 'GET',
            path: '/users',
            status: 200,
            body: { users: [] }
          }
        ],
        {
          response: 'Ollama generated text'
        },
        'not valid data',
        null,
        {
          method: 'POST',
          path: '/invalid'
          // missing status
        },
        {
          response: 'Another Ollama response',
          model: 'llama2'
        }
      ];

      const mockEndpointArrays = mixedData.filter(isArrayOfMockEndpoints);
      const ollamaResponses = mixedData.filter(isOllamaResponse);

      expect(mockEndpointArrays).toHaveLength(1);
      expect(ollamaResponses).toHaveLength(2);
    });

    it('should handle edge cases in combination', () => {
      const edgeCases = [
        [], // empty array - valid for mock endpoints
        { response: '' }, // empty response - valid for ollama
        [{}], // array with invalid mock endpoint
        { response: undefined }, // invalid ollama response
        { otherProperty: 'value' } // neither type
      ];

      const validMockArrays = edgeCases.filter(isArrayOfMockEndpoints);
      const validOllamaResponses = edgeCases.filter(isOllamaResponse);

      expect(validMockArrays).toHaveLength(1); // only empty array
      expect(validOllamaResponses).toHaveLength(1); // only empty response
    });
  });
});