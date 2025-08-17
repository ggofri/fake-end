import { generateBasicMockResponse } from '../mock-generator';
import { CurlInfo } from '@/cli/generate/types';

jest.mock('@/utils', () => ({
  isRecordOfStrings: jest.fn(),
  createResourceResponse: jest.fn(),
  createSuccessResponse: jest.fn(),
  createCreatedResponse: jest.fn(),
  createUpdatedResponse: jest.fn()
}));

import { 
  isRecordOfStrings, 
  createResourceResponse, 
  createSuccessResponse, 
  createCreatedResponse, 
  createUpdatedResponse 
} from '@/utils';

const mockIsRecordOfStrings = isRecordOfStrings as jest.MockedFunction<typeof isRecordOfStrings>;
const mockCreateResourceResponse = createResourceResponse as jest.MockedFunction<typeof createResourceResponse>;
const mockCreateSuccessResponse = createSuccessResponse as jest.MockedFunction<typeof createSuccessResponse>;
const mockCreateCreatedResponse = createCreatedResponse as jest.MockedFunction<typeof createCreatedResponse>;
const mockCreateUpdatedResponse = createUpdatedResponse as jest.MockedFunction<typeof createUpdatedResponse>;

describe('mock-generator', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    mockCreateResourceResponse.mockReturnValue({ id: 'mock-id', name: 'Mock Resource' });
    mockCreateSuccessResponse.mockReturnValue({ success: true, message: 'Mock Success' });
    mockCreateCreatedResponse.mockReturnValue({ id: 'new-id', success: true });
    mockCreateUpdatedResponse.mockReturnValue({ id: 'updated-id', success: true });
  });

  describe('parseRequestBody', () => {
    test('should return empty object when data is undefined', () => {
      const curlInfo: CurlInfo = {
        method: 'GET',
        url: 'http://example.com',
        path: '/test',
        headers: {},
        queryParams: {},
        data: ''
      };

      generateBasicMockResponse(curlInfo);
      
      expect(mockCreateResourceResponse).toHaveBeenCalled();
    });

    test('should return empty object when data is empty string', () => {
      const curlInfo: CurlInfo = {
        method: 'POST',
        url: 'http://example.com',
        path: '/test',
        headers: {},
        queryParams: {},
        data: ''
      };

      generateBasicMockResponse(curlInfo);

      expect(mockCreateCreatedResponse).toHaveBeenCalledWith('new-resource-id', {});
    });

    test('should parse valid JSON data', () => {
      const validJsonData = '{"name": "test", "value": "123"}';
      mockIsRecordOfStrings.mockReturnValue(true);

      const curlInfo: CurlInfo = {
        method: 'POST',
        url: 'http://example.com',
        path: '/test',
        headers: {},
        queryParams: {},
        data: validJsonData
      };

      generateBasicMockResponse(curlInfo);

      expect(mockIsRecordOfStrings).toHaveBeenCalledWith({ name: 'test', value: '123' });
      expect(mockCreateCreatedResponse).toHaveBeenCalledWith('new-resource-id', { name: 'test', value: '123' });
    });

    test('should handle invalid JSON by wrapping in data field', () => {
      const invalidJsonData = 'invalid-json-string';
      
      const curlInfo: CurlInfo = {
        method: 'POST',
        url: 'http://example.com',
        path: '/test',
        headers: {},
        queryParams: {},
        data: invalidJsonData
      };

      generateBasicMockResponse(curlInfo);

      expect(mockCreateCreatedResponse).toHaveBeenCalledWith('new-resource-id', { data: invalidJsonData });
    });

    test('should handle JSON that is not a record of strings', () => {
      const validJsonData = '{"name": "test", "nested": {"value": 123}}';
      mockIsRecordOfStrings.mockReturnValue(false);

      const curlInfo: CurlInfo = {
        method: 'POST',
        url: 'http://example.com',
        path: '/test',
        headers: {},
        queryParams: {},
        data: validJsonData
      };

      generateBasicMockResponse(curlInfo);

      expect(mockCreateCreatedResponse).toHaveBeenCalledWith('new-resource-id', { data: validJsonData });
    });
  });

  describe('generateGetResponse', () => {
    test('should generate single resource response for path with :id', () => {
      const curlInfo: CurlInfo = {
        method: 'GET',
        url: 'http://example.com',
        path: '/users/:id',
        headers: {},
        queryParams: {},
        data: ''
      };

      generateBasicMockResponse(curlInfo);

      expect(mockCreateResourceResponse).toHaveBeenCalledWith(':id');
    });

    test('should generate single resource response for path ending with number', () => {
      const curlInfo: CurlInfo = {
        method: 'GET',
        url: 'http://example.com',
        path: '/users/123',
        headers: {},
        queryParams: {},
        data: ''
      };

      generateBasicMockResponse(curlInfo);

      expect(mockCreateResourceResponse).toHaveBeenCalledWith('1');
    });

    test('should generate resource list response for collection path', () => {
      const curlInfo: CurlInfo = {
        method: 'GET',
        url: 'http://example.com',
        path: '/users',
        headers: {},
        queryParams: {},
        data: ''
      };

      const result = generateBasicMockResponse(curlInfo);

      expect(mockCreateResourceResponse).toHaveBeenCalledWith('1');
      expect(mockCreateResourceResponse).toHaveBeenCalledWith('2');
      expect(result).toEqual({
        data: [
          { id: 'mock-id', name: 'Mock Resource' },
          { id: 'mock-id', name: 'Mock Resource' }
        ],
        pagination: {
          page: 1,
          limit: 10,
          total: 2
        }
      });
    });
  });

  describe('generatePostResponse', () => {
    test('should create response with new resource ID and request body', () => {
      const requestBody = { name: 'New User', email: 'user@example.com' };
      const curlInfo: CurlInfo = {
        method: 'POST',
        url: 'http://example.com',
        path: '/users',
        headers: {},
        queryParams: {},
        data: JSON.stringify(requestBody)
      };

      mockIsRecordOfStrings.mockReturnValue(true);
      generateBasicMockResponse(curlInfo);

      expect(mockCreateCreatedResponse).toHaveBeenCalledWith('new-resource-id', requestBody);
    });
  });

  describe('generateUpdateResponse', () => {
    test('should handle PUT method with :id in path', () => {
      const requestBody = { name: 'Updated User' };
      const curlInfo: CurlInfo = {
        method: 'PUT',
        url: 'http://example.com',
        path: '/users/:id',
        headers: {},
        queryParams: {},
        data: JSON.stringify(requestBody)
      };

      mockIsRecordOfStrings.mockReturnValue(true);
      generateBasicMockResponse(curlInfo);

      expect(mockCreateUpdatedResponse).toHaveBeenCalledWith(':id', requestBody);
    });

    test('should handle PATCH method with default ID', () => {
      const requestBody = { name: 'Patched User' };
      const curlInfo: CurlInfo = {
        method: 'PATCH',
        url: 'http://example.com',
        path: '/users/update',
        headers: {},
        queryParams: {},
        data: JSON.stringify(requestBody)
      };

      mockIsRecordOfStrings.mockReturnValue(true);
      generateBasicMockResponse(curlInfo);

      expect(mockCreateUpdatedResponse).toHaveBeenCalledWith('1', requestBody);
    });
  });

  describe('generateDeleteResponse', () => {
    test('should create success response for DELETE method', () => {
      const curlInfo: CurlInfo = {
        method: 'DELETE',
        url: 'http://example.com',
        path: '/users/123',
        headers: {},
        queryParams: {},
        data: ''
      };

      generateBasicMockResponse(curlInfo);

      expect(mockCreateSuccessResponse).toHaveBeenCalledWith('Resource deleted successfully');
    });
  });

  describe('generateDefaultResponse', () => {
    test('should create default success response for unknown method', () => {
      const curlInfo: CurlInfo = {
        method: 'OPTIONS',
        url: 'http://example.com',
        path: '/users',
        headers: {},
        queryParams: {},
        data: ''
      };

      generateBasicMockResponse(curlInfo);

      expect(mockCreateSuccessResponse).toHaveBeenCalledWith('Success');
    });
  });

  describe('generateBasicMockResponse integration', () => {
    test('should handle complete workflow for each HTTP method', () => {
      const methods = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'] as const;
      
      methods.forEach(method => {
        jest.clearAllMocks();
        
        const curlInfo: CurlInfo = {
          method,
          url: 'http://example.com',
          path: '/users',
          headers: {},
          queryParams: {},
          data: method === 'GET' || method === 'DELETE' ? '' : '{"name": "test"}'
        };

        if (method !== 'GET' && method !== 'DELETE') {
          mockIsRecordOfStrings.mockReturnValue(true);
        }

        const result = generateBasicMockResponse(curlInfo);

        expect(result).toBeDefined();
        expect(typeof result).toBe('object');
      });
    });
  });
});
