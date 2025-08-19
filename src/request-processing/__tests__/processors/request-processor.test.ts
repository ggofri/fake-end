import { ParsedEndpoint } from '@/shared/types';
import { processRequest } from '../../endpoint-handler/handlers/processors/request-processor';
import { processDynamicMocks } from '../../endpoint-handler/handlers/processors/dynamic-mock-processor';
import { processGuard } from '../../endpoint-handler/handlers/processors/guard-processor';
import { processInterpolation } from '../../endpoint-handler/handlers/processors/interpolation-processor';

jest.mock('../../endpoint-handler/handlers/processors/dynamic-mock-processor');
jest.mock('../../endpoint-handler/handlers/processors/guard-processor');
jest.mock('../../endpoint-handler/handlers/processors/interpolation-processor');

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
      mockProcessGuard.mockResolvedValue(undefined);
      mockProcessInterpolation.mockImplementation((body) => body);
    });

    it('should return original endpoint data when no processors modify response', async () => {
      const result = await processRequest(baseEndpoint, mockRequest);

      expect(result).toEqual({
        responseStatus: 200,
        responseBody: { message: 'original' }
      });
      expect(mockProcessDynamicMocks).toHaveBeenCalledWith(baseEndpoint, mockRequest);
      expect(mockProcessGuard).toHaveBeenCalledWith(baseEndpoint, mockRequest, undefined);
      expect(mockProcessInterpolation).toHaveBeenCalledWith({ message: 'original' }, mockRequest);
    });

    it('should use dynamic mock result when available', async () => {
      const dynamicResult = { message: 'dynamic' };
      mockProcessDynamicMocks.mockReturnValue(dynamicResult);

      const result = await processRequest(baseEndpoint, mockRequest);

      expect(result).toEqual({
        responseStatus: 200,
        responseBody: dynamicResult
      });
      expect(mockProcessInterpolation).toHaveBeenCalledWith(dynamicResult, mockRequest);
    });

    it('should use guard result when available', async () => {
      const guardResult = { status: 403, body: { error: 'forbidden' } };
      mockProcessGuard.mockResolvedValue(guardResult);

      const result = await processRequest(baseEndpoint, mockRequest);

      expect(result).toEqual({
        responseStatus: 403,
        responseBody: { error: 'forbidden' }
      });
      expect(mockProcessInterpolation).toHaveBeenCalledWith({ error: 'forbidden' }, mockRequest);
    });

    it('should process interpolation on final response body', async () => {
      const interpolatedResult = { message: 'interpolated' };
      mockProcessInterpolation.mockReturnValue(interpolatedResult);

      const result = await processRequest(baseEndpoint, mockRequest);

      expect(result).toEqual({
        responseStatus: 200,
        responseBody: interpolatedResult
      });
    });

    it('should apply processors in correct order: dynamic mocks, guard, then interpolation', async () => {
      const dynamicResult = { message: 'dynamic' };
      const guardResult = { status: 401, body: { error: 'unauthorized' } };
      const interpolatedResult = { error: 'unauthorized - user 123' };

      mockProcessDynamicMocks.mockReturnValue(dynamicResult);
      mockProcessGuard.mockResolvedValue(guardResult);
      mockProcessInterpolation.mockReturnValue(interpolatedResult);

      const result = await processRequest(baseEndpoint, mockRequest);

      expect(result).toEqual({
        responseStatus: 401,
        responseBody: interpolatedResult
      });
      
      expect(mockProcessDynamicMocks).toHaveBeenCalledWith(baseEndpoint, mockRequest);
      expect(mockProcessGuard).toHaveBeenCalledWith(baseEndpoint, mockRequest, undefined);
      expect(mockProcessInterpolation).toHaveBeenCalledWith({ error: 'unauthorized' }, mockRequest);
    });

    it('should handle both dynamic mocks and guard processing', async () => {
      const dynamicResult = { message: 'dynamic', id: 456 };
      const guardResult = { status: 400, body: { error: 'validation failed' } };

      mockProcessDynamicMocks.mockReturnValue(dynamicResult);
      mockProcessGuard.mockResolvedValue(guardResult);

      const result = await processRequest(baseEndpoint, mockRequest);

      expect(result).toEqual({
        responseStatus: 400,
        responseBody: { error: 'validation failed' }
      });
      expect(mockProcessInterpolation).toHaveBeenCalledWith({ error: 'validation failed' }, mockRequest);
    });
  });
});
