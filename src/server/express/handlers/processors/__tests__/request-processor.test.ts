import { ParsedEndpoint } from '@/types';
import { processRequest } from '../request-processor';
import { processDynamicMocks } from '../dynamic-mock-processor';
import { processGuard } from '../guard-processor';
import { processInterpolation } from '../interpolation-processor';

jest.mock('../dynamic-mock-processor');
jest.mock('../guard-processor');
jest.mock('../interpolation-processor');

const mockProcessDynamicMocks = jest.mocked(processDynamicMocks);
const mockProcessGuard = jest.mocked(processGuard);
const mockProcessInterpolation = jest.mocked(processInterpolation);

describe('request-processor', () => {
  describe('processRequest', () => {
    const mockRequest = {
      params: { id: '123' },
      query: { filter: 'active' },
      body: { name: 'test' }
    };

    const baseEndpoint: ParsedEndpoint = {
      status: 200,
      body: { message: 'original' },
      method: 'GET',
      path: '/test',
      filePath: '',
      fullPath: ''
    };

    beforeEach(() => {
      jest.clearAllMocks();
      mockProcessDynamicMocks.mockReturnValue(undefined);
      mockProcessGuard.mockReturnValue(undefined);
      mockProcessInterpolation.mockImplementation((body) => body);
    });

    it('should return original endpoint data when no processors modify response', () => {
      const result = processRequest(baseEndpoint, mockRequest);

      expect(result).toEqual({
        responseStatus: 200,
        responseBody: { message: 'original' }
      });
      expect(mockProcessDynamicMocks).toHaveBeenCalledWith(baseEndpoint, mockRequest);
      expect(mockProcessGuard).toHaveBeenCalledWith(baseEndpoint, mockRequest);
      expect(mockProcessInterpolation).toHaveBeenCalledWith({ message: 'original' }, mockRequest);
    });

    it('should use dynamic mock result when available', () => {
      const dynamicResult = { message: 'dynamic' };
      mockProcessDynamicMocks.mockReturnValue(dynamicResult);

      const result = processRequest(baseEndpoint, mockRequest);

      expect(result).toEqual({
        responseStatus: 200,
        responseBody: dynamicResult
      });
      expect(mockProcessInterpolation).toHaveBeenCalledWith(dynamicResult, mockRequest);
    });

    it('should use guard result when available', () => {
      const guardResult = { status: 403, body: { error: 'forbidden' } };
      mockProcessGuard.mockReturnValue(guardResult);

      const result = processRequest(baseEndpoint, mockRequest);

      expect(result).toEqual({
        responseStatus: 403,
        responseBody: { error: 'forbidden' }
      });
      expect(mockProcessInterpolation).toHaveBeenCalledWith({ error: 'forbidden' }, mockRequest);
    });

    it('should process interpolation on final response body', () => {
      const interpolatedResult = { message: 'interpolated' };
      mockProcessInterpolation.mockReturnValue(interpolatedResult);

      const result = processRequest(baseEndpoint, mockRequest);

      expect(result).toEqual({
        responseStatus: 200,
        responseBody: interpolatedResult
      });
    });

    it('should apply processors in correct order: dynamic mocks, guard, then interpolation', () => {
      const dynamicResult = { message: 'dynamic' };
      const guardResult = { status: 401, body: { error: 'unauthorized' } };
      const interpolatedResult = { error: 'unauthorized - user 123' };

      mockProcessDynamicMocks.mockReturnValue(dynamicResult);
      mockProcessGuard.mockReturnValue(guardResult);
      mockProcessInterpolation.mockReturnValue(interpolatedResult);

      const result = processRequest(baseEndpoint, mockRequest);

      expect(result).toEqual({
        responseStatus: 401,
        responseBody: interpolatedResult
      });
      
      expect(mockProcessDynamicMocks).toHaveBeenCalledWith(baseEndpoint, mockRequest);
      expect(mockProcessGuard).toHaveBeenCalledWith(baseEndpoint, mockRequest);
      expect(mockProcessInterpolation).toHaveBeenCalledWith({ error: 'unauthorized' }, mockRequest);
    });

    it('should handle both dynamic mocks and guard processing', () => {
      const dynamicResult = { message: 'dynamic', id: 456 };
      const guardResult = { status: 400, body: { error: 'validation failed' } };

      mockProcessDynamicMocks.mockReturnValue(dynamicResult);
      mockProcessGuard.mockReturnValue(guardResult);

      const result = processRequest(baseEndpoint, mockRequest);

      expect(result).toEqual({
        responseStatus: 400,
        responseBody: { error: 'validation failed' }
      });
      expect(mockProcessInterpolation).toHaveBeenCalledWith({ error: 'validation failed' }, mockRequest);
    });
  });
});
