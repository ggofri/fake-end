import { Request } from 'express';
import { ParsedEndpoint } from '@/shared/types';
import { processDynamicMocks } from '../../endpoint-handler/handlers/processors/dynamic-mock-processor';
import { evaluateDynamicMocks } from '@/typescript-processing/utils/mock-value-evaluator';
import { generateMockFromInterface } from '@/typescript-processing/mock-generator/generators';
import { InterfaceDeclaration } from 'ts-morph';

jest.mock('@/typescript-processing/utils/mock-value-evaluator');
jest.mock('@/typescript-processing/mock-generator/generators');

const mockEvaluateDynamicMocks = jest.mocked(evaluateDynamicMocks);
const mockGenerateMockFromInterface = jest.mocked(generateMockFromInterface);

describe('dynamic-mock-processor', () => {
  describe('processDynamicMocks', () => {
    const mockRequest = {
      body: { userId: 123, name: 'John' }
    } as Request;

    const mockInterfaceDeclaration = {
      getName: jest.fn().mockReturnValue('TestInterface')
    } as unknown as InterfaceDeclaration;

    beforeEach(() => {
      jest.clearAllMocks();
    });

    it('should return undefined when endpoint has no dynamic mocks', () => {
      const endpoint: ParsedEndpoint = {
        status: 200,
        body: {},
        method: 'GET',
        path: '/test',
        filePath: '',
        fullPath: ''
      };

      const result = processDynamicMocks(endpoint, mockRequest);

      expect(result).toBeUndefined();
      expect(mockGenerateMockFromInterface).not.toHaveBeenCalled();
      expect(mockEvaluateDynamicMocks).not.toHaveBeenCalled();
    });

    it('should return undefined when endpoint has no interface declaration', () => {
      const endpoint: ParsedEndpoint = {
        status: 200,
        body: {},
        method: 'GET',
        path: '/test',
        filePath: '',
        fullPath: '',
        _dynamicMocks: true
      };

      const result = processDynamicMocks(endpoint, mockRequest);

      expect(result).toBeUndefined();
      expect(mockGenerateMockFromInterface).not.toHaveBeenCalled();
      expect(mockEvaluateDynamicMocks).not.toHaveBeenCalled();
    });

    it('should process dynamic mocks when both conditions are met', () => {
      const endpoint: ParsedEndpoint = {
        status: 200,
        body: {},
        method: 'GET',
        path: '/test',
        filePath: '',
        fullPath: '',
        _dynamicMocks: true,
        _interfaceDeclaration: mockInterfaceDeclaration
      };

      const mockResponseBody = { id: 1, name: 'Generated User' };
      const mockEvaluatedResult = { id: 123, name: 'John Doe' };

      mockGenerateMockFromInterface.mockReturnValue(mockResponseBody);
      mockEvaluateDynamicMocks.mockReturnValue(mockEvaluatedResult);

      const result = processDynamicMocks(endpoint, mockRequest);

      expect(result).toBe(mockEvaluatedResult);
      expect(mockGenerateMockFromInterface).toHaveBeenCalledWith(
        mockInterfaceDeclaration,
        true,
        { userId: 123, name: 'John' }
      );
      expect(mockEvaluateDynamicMocks).toHaveBeenCalledWith(
        mockResponseBody,
        { userId: 123, name: 'John' }
      );
    });

    it('should handle request with non-object body', () => {
      const requestWithStringBody = {
        body: 'string body'
      } as Request;

      const endpoint: ParsedEndpoint = {
        status: 200,
        body: {},
        method: 'POST',
        path: '/test',
        filePath: '',
        fullPath: '',
        _dynamicMocks: true,
        _interfaceDeclaration: mockInterfaceDeclaration
      };

      const mockResponseBody = { id: 1, message: 'success' };
      const mockEvaluatedResult = { id: 1, message: 'success' };

      mockGenerateMockFromInterface.mockReturnValue(mockResponseBody);
      mockEvaluateDynamicMocks.mockReturnValue(mockEvaluatedResult);

      const result = processDynamicMocks(endpoint, requestWithStringBody);

      expect(result).toBe(mockEvaluatedResult);
      expect(mockGenerateMockFromInterface).toHaveBeenCalledWith(
        mockInterfaceDeclaration,
        true,
        {} 
      );
    });

    it('should handle request with null body', () => {
      const requestWithNullBody = {
        body: null
      } as Request;

      const endpoint: ParsedEndpoint = {
        status: 200,
        body: {},
        method: 'POST',
        path: '/test',
        filePath: '',
        fullPath: '',
        _dynamicMocks: true,
        _interfaceDeclaration: mockInterfaceDeclaration
      };

      mockGenerateMockFromInterface.mockReturnValue({});
      mockEvaluateDynamicMocks.mockReturnValue({});

      processDynamicMocks(endpoint, requestWithNullBody);

      expect(mockGenerateMockFromInterface).toHaveBeenCalledWith(
        mockInterfaceDeclaration,
        true,
        {} 
      );
    });

    it('should handle request with array body', () => {
      const requestWithArrayBody = {
        body: [1, 2, 3]
      } as Request;

      const endpoint: ParsedEndpoint = {
        status: 200,
        body: {},
        method: 'POST',
        path: '/test',
        filePath: '',
        fullPath: '',
        _dynamicMocks: true,
        _interfaceDeclaration: mockInterfaceDeclaration
      };

      mockGenerateMockFromInterface.mockReturnValue({});
      mockEvaluateDynamicMocks.mockReturnValue({});

      processDynamicMocks(endpoint, requestWithArrayBody);

      expect(mockGenerateMockFromInterface).toHaveBeenCalledWith(
        mockInterfaceDeclaration,
        true,
        {} 
      );
    });
  });
});
