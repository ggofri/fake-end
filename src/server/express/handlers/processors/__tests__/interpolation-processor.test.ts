import { processInterpolation } from '../interpolation-processor';
import { interpolateParams } from '@/server/express/utils/parameter-interpolator';

jest.mock('@/server/express/utils/parameter-interpolator');

const mockInterpolateParams = jest.mocked(interpolateParams);

describe('interpolation-processor', () => {
  describe('processInterpolation', () => {
    const mockRequest = {
      params: { id: '123', userId: '456' },
      query: { filter: 'active', limit: '10' },
      body: { name: 'John', email: 'john@example.com' }
    };

    beforeEach(() => {
      jest.clearAllMocks();
      mockInterpolateParams.mockImplementation((body) => body);
    });

    it('should interpolate string response body', () => {
      const responseBody = 'Hello {{body.name}}, your ID is :id';
      const interpolatedResult = 'Hello John, your ID is 123';

      mockInterpolateParams.mockReturnValue(interpolatedResult);

      const result = processInterpolation(responseBody, mockRequest);

      expect(result).toBe(interpolatedResult);
      expect(mockInterpolateParams).toHaveBeenCalledWith(
        responseBody,
        { id: '123', userId: '456' },
        { filter: 'active', limit: '10' },
        { name: 'John', email: 'john@example.com' }
      );
    });

    it('should interpolate object response body', () => {
      const responseBody = {
        message: 'Welcome {{body.name}}',
        userId: ':userId',
        filter: '{{query.filter}}'
      };
      const interpolatedResult = {
        message: 'Welcome John',
        userId: '456',
        filter: 'active'
      };

      mockInterpolateParams.mockReturnValue(interpolatedResult);

      const result = processInterpolation(responseBody, mockRequest);

      expect(result).toBe(interpolatedResult);
      expect(mockInterpolateParams).toHaveBeenCalledWith(
        responseBody,
        { id: '123', userId: '456' },
        { filter: 'active', limit: '10' },
        { name: 'John', email: 'john@example.com' }
      );
    });

    it('should return response body unchanged for non-string/non-object types', () => {
      const numberResponseBody = 42;
      const result1 = processInterpolation(numberResponseBody, mockRequest);
      expect(result1).toBe(42);
      expect(mockInterpolateParams).not.toHaveBeenCalled();

      const booleanResponseBody = true;
      const result2 = processInterpolation(booleanResponseBody, mockRequest);
      expect(result2).toBe(true);
      expect(mockInterpolateParams).not.toHaveBeenCalled();

      const nullResponseBody = null;
      const result3 = processInterpolation(nullResponseBody, mockRequest);
      expect(result3).toBe(null);
    });

    it('should return undefined for undefined response body', () => {
      const result = processInterpolation(undefined, mockRequest);
      expect(result).toBeUndefined();
      expect(mockInterpolateParams).not.toHaveBeenCalled();
    });

    it('should handle request with non-object query', () => {
      const requestWithStringQuery = {
        params: { id: '123' },
        query: 'invalid',
        body: { name: 'John' }
      } as unknown as Request;

      const responseBody = { message: 'Hello {{body.name}}' };

      processInterpolation(responseBody, requestWithStringQuery);

      expect(mockInterpolateParams).toHaveBeenCalledWith(
        responseBody,
        { id: '123' },
        {}, 
        { name: 'John' }
      );
    });

    it('should handle request with non-object body', () => {
      const requestWithStringBody = {
        params: { id: '123' },
        query: { filter: 'active' },
        body: 'invalid'
      } as unknown as Request;

      const responseBody = { message: 'ID: :id' };

      processInterpolation(responseBody, requestWithStringBody);

      expect(mockInterpolateParams).toHaveBeenCalledWith(
        responseBody,
        { id: '123' },
        { filter: 'active' },
        {} 
      );
    });

    it('should handle request with null query and body', () => {
      const requestWithNulls = {
        params: { id: '123' },
        query: null,
        body: null
      } as unknown as Request;

      const responseBody = { id: ':id' };

      processInterpolation(responseBody, requestWithNulls);

      expect(mockInterpolateParams).toHaveBeenCalledWith(
        responseBody,
        { id: '123' },
        {}, 
        {} 
      );
    });

    it('should handle array response body', () => {
      const responseBody = [
        { name: '{{body.name}}', id: ':id' },
        { count: '{{query.limit}}' }
      ];
      const interpolatedResult = [
        { name: 'John', id: '123' },
        { count: '10' }
      ];

      mockInterpolateParams.mockReturnValue(interpolatedResult);

      const result = processInterpolation(responseBody, mockRequest);

      expect(result).toBe(interpolatedResult);
      expect(mockInterpolateParams).toHaveBeenCalledWith(
        responseBody,
        { id: '123', userId: '456' },
        { filter: 'active', limit: '10' },
        { name: 'John', email: 'john@example.com' }
      );
    });
  });
});
