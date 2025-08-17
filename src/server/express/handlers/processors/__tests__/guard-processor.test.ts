import { Request } from 'express';
import { ParsedEndpoint, GuardFunction } from '@/types';
import { processGuard } from '../guard-processor';
import { executeGuard } from '@/server/express/utils/guard-executor';

jest.mock('@/server/express/utils/guard-executor');

const mockExecuteGuard = jest.mocked(executeGuard);

describe('guard-processor', () => {
  describe('processGuard', () => {
    const mockRequest = {
      body: { userId: 123, role: 'admin' }
    } as Request;

    beforeEach(() => {
      jest.clearAllMocks();
    });

    it('should return undefined when endpoint has no guard', () => {
      const endpoint: ParsedEndpoint = {
        status: 200,
        body: {},
        method: 'GET',
        path: '/test',
        filePath: '',
        fullPath: ''
      };

      const result = processGuard(endpoint, mockRequest);

      expect(result).toBeUndefined();
      expect(mockExecuteGuard).not.toHaveBeenCalled();
    });

    it('should execute guard and return result when guard exists', () => {
      const guardCondition: GuardFunction = {
        condition: { field: 'role', operator: 'equals', value: 'admin' },
        left: { status: 403, body: { error: 'Forbidden' } },
        right: { status: 200, body: { success: true } }
      };
      const endpoint: ParsedEndpoint = {
        status: 200,
        body: {},
        method: 'GET',
        path: '/admin',
        filePath: '',
        fullPath: '',
        guard: guardCondition
      };

      const guardExecutorResult = {
        _tag: 'Right' as const,
        value: {
          status: 403,
          body: { error: 'Forbidden: Admin access required' }
        }
      };

      mockExecuteGuard.mockReturnValue(guardExecutorResult);

      const result = processGuard(endpoint, mockRequest);

      expect(result).toEqual({
        status: 403,
        body: { error: 'Forbidden: Admin access required' }
      });
      expect(mockExecuteGuard).toHaveBeenCalledWith(
        guardCondition,
        { userId: 123, role: 'admin' }
      );
    });

    it('should handle guard result with null body', () => {
      const guardCondition: GuardFunction = {
        condition: { field: 'userId', operator: 'exists' },
        left: { status: 401, body: null },
        right: { status: 200, body: { success: true } }
      };
      const endpoint: ParsedEndpoint = {
        status: 200,
        body: {},
        method: 'GET',
        path: '/user',
        filePath: '',
        fullPath: '',
        guard: guardCondition
      };

      const guardExecutorResult = {
        _tag: 'Right' as const,
        value: {
          status: 401,
          body: null
        }
      };

      mockExecuteGuard.mockReturnValue(guardExecutorResult);

      const result = processGuard(endpoint, mockRequest);

      expect(result).toEqual({
        status: 401,
        body: null
      });
    });

    it('should handle guard result with undefined body', () => {
      const guardCondition: GuardFunction = {
        condition: { field: 'token', operator: 'exists' },
        left: { status: 400, body: undefined },
        right: { status: 200, body: { success: true } }
      };
      const endpoint: ParsedEndpoint = {
        status: 200,
        body: {},
        method: 'GET',
        path: '/protected',
        filePath: '',
        fullPath: '',
        guard: guardCondition
      };

      const guardExecutorResult = {
        _tag: 'Right' as const,
        value: {
          status: 400,
          body: undefined
        }
      };

      mockExecuteGuard.mockReturnValue(guardExecutorResult);

      const result = processGuard(endpoint, mockRequest);

      expect(result).toEqual({
        status: 400,
        body: null 
      });
    });

    it('should handle request with non-object body', () => {
      const requestWithStringBody = {
        body: 'invalid'
      } as Request;

      const guardCondition: GuardFunction = {
        condition: { field: 'type', operator: 'equals', value: 'string' },
        left: { status: 422, body: { error: 'Invalid request body format' } },
        right: { status: 200, body: { success: true } }
      };
      const endpoint: ParsedEndpoint = {
        status: 200,
        body: {},
        method: 'POST',
        path: '/test',
        filePath: '',
        fullPath: '',
        guard: guardCondition
      };

      const guardExecutorResult = {
        _tag: 'Right' as const,
        value: {
          status: 422,
          body: { error: 'Invalid request body format' }
        }
      };

      mockExecuteGuard.mockReturnValue(guardExecutorResult);

      const result = processGuard(endpoint, requestWithStringBody);

      expect(result).toEqual({
        status: 422,
        body: { error: 'Invalid request body format' }
      });
      expect(mockExecuteGuard).toHaveBeenCalledWith(
        guardCondition,
        {} 
      );
    });

    it('should handle request with null body', () => {
      const requestWithNullBody = {
        body: null
      } as Request;

      const guardCondition: GuardFunction = {
        condition: { field: 'data', operator: 'exists' },
        left: { status: 400, body: { error: 'Body required' } },
        right: { status: 200, body: { success: true } }
      };
      const endpoint: ParsedEndpoint = {
        status: 200,
        body: {},
        method: 'POST',
        path: '/test',
        filePath: '',
        fullPath: '',
        guard: guardCondition
      };

      mockExecuteGuard.mockReturnValue({
        _tag: 'Right' as const,
        value: { status: 400, body: { error: 'Body required' } }
      });

      processGuard(endpoint, requestWithNullBody);

      expect(mockExecuteGuard).toHaveBeenCalledWith(
        guardCondition,
        {} 
      );
    });

    it('should handle request with array body', () => {
      const requestWithArrayBody = {
        body: [1, 2, 3]
      } as Request;

      const guardCondition: GuardFunction = {
        condition: { field: 'items', operator: 'exists' },
        left: { status: 400, body: { error: 'Invalid format' } },
        right: { status: 200, body: { success: true } }
      };
      const endpoint: ParsedEndpoint = {
        status: 200,
        body: {},
        method: 'POST',
        path: '/test',
        filePath: '',
        fullPath: '',
        guard: guardCondition
      };

      mockExecuteGuard.mockReturnValue({
        _tag: 'Right' as const,
        value: { status: 200, body: { success: true } }
      });

      processGuard(endpoint, requestWithArrayBody);

      expect(mockExecuteGuard).toHaveBeenCalledWith(
        guardCondition,
        {} 
      );
    });
  });
});
