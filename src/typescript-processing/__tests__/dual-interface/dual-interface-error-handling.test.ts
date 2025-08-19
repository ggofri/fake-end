import { dualInterfaceGenerator } from '../../dual-interface/dual-interface-generator';
import { ExistingFileAnalysis } from '../../dual-interface/file-analyzer';
import { CurlInfo } from '@/mock-generation/types';

describe('DualInterfaceGenerator Error Handling', () => {
  const mockCurlInfo: CurlInfo = {
    method: 'GET',
    url: 'https://api.example.com/users/123',
    path: '/users/123',
    headers: {},
    queryParams: {},
  };

  const emptyAnalysis: ExistingFileAnalysis = {
    exists: false,
    hasDefaultExport: false,
    defaultInterfaceName: null,
    allInterfaces: [],
    hasGuard: false,
    sourceFile: undefined,
  };

  describe('updateErrorInterface', () => {
    it('should handle missing existing interfaces gracefully', () => {
      const result = dualInterfaceGenerator.updateErrorInterface(
        mockCurlInfo,
        { error: 'Not found', code: 404 },
        emptyAnalysis,
        'TestResponse'
      );

      expect(result.errorInterface).toContain('export interface ErrorResponse {');
      expect(result.errorInterface).toContain('error: string;');
      expect(result.errorInterface).toContain('code: number;');
      
      expect(result.successInterface).toContain('export interface SuccessResponse {');
      expect(result.successInterface).toContain('id: string;');
      expect(result.successInterface).toContain('message: string;');
      expect(result.successInterface).toContain('success: boolean;');
    });

    it('should preserve existing success interface when available', () => {
      const mockInterface = {
        getName: () => 'SuccessResponse',
        getProperties: () => [],
        getText: () => 'export interface SuccessResponse { data: any[]; total: number; }',
        getFullText: () => 'export interface SuccessResponse { data: any[]; total: number; }',
      } as any;

      const analysisWithSuccess: ExistingFileAnalysis = {
        exists: true,
        hasDefaultExport: false,
        defaultInterfaceName: null,
        allInterfaces: [mockInterface],
        hasGuard: false,
        sourceFile: undefined,
      };

      const result = dualInterfaceGenerator.updateErrorInterface(
        mockCurlInfo,
        { error: 'Validation failed' },
        analysisWithSuccess,
        'TestResponse'
      );

      expect(result.successInterface).toContain('SuccessResponse');
      expect(result.errorInterface).toContain('error: string;');
    });

    it('should handle null/undefined error response', () => {
      const result = dualInterfaceGenerator.updateErrorInterface(
        mockCurlInfo,
        null,
        emptyAnalysis,
        'TestResponse'
      );
      
      expect(result.errorInterface).toContain('export interface ErrorResponse {');
      expect(result.errorInterface).toContain('error: string;');
      expect(result.errorInterface).toContain('message: string;');
    });

    it('should handle complex nested error objects', () => {
      const complexError = {
        error: {
          type: 'validation_error',
          details: {
            field: 'email',
            message: 'Invalid format',
            suggestions: ['user@example.com']
          }
        },
        timestamp: '2023-01-01T00:00:00Z',
        requestId: 'abc-123'
      };

      const result = dualInterfaceGenerator.updateErrorInterface(
        mockCurlInfo,
        complexError,
        emptyAnalysis,
        'TestResponse'
      );

      expect(result.errorInterface).toContain('export interface ErrorResponse {');
      expect(result.errorInterface).toContain('error: { type: string; details: { field: string; message: string; suggestions: string[] } };');
      expect(result.errorInterface).toContain('timestamp: string;');
      expect(result.errorInterface).toContain('requestId: string;');
    });
  });

  describe('updateSuccessInterface', () => {
    it('should handle missing existing interfaces gracefully', () => {
      const result = dualInterfaceGenerator.updateSuccessInterface(
        mockCurlInfo,
        { id: 1, name: 'John', email: 'john@example.com' },
        emptyAnalysis,
        'TestResponse'
      );

      expect(result.successInterface).toContain('export interface SuccessResponse {');
      expect(result.successInterface).toContain('id: number;');
      expect(result.successInterface).toContain('name: string;');
      expect(result.successInterface).toContain('email: string;');
      
      expect(result.errorInterface).toContain('export interface ErrorResponse {');
      expect(result.errorInterface).toContain('error: string;');
      expect(result.errorInterface).toContain('message: string;');
      expect(result.errorInterface).toContain('code: number;');
    });

    it('should preserve existing error interface when available', () => {
      const mockInterface = {
        getName: () => 'ErrorResponse',
        getProperties: () => [],
        getText: () => 'export interface ErrorResponse { errorCode: string; details: string[]; }',
        getFullText: () => 'export interface ErrorResponse { errorCode: string; details: string[]; }',
      } as any;

      const analysisWithError: ExistingFileAnalysis = {
        exists: true,
        hasDefaultExport: false,
        defaultInterfaceName: null,
        allInterfaces: [mockInterface],
        hasGuard: false,
        sourceFile: undefined,
      };

      const result = dualInterfaceGenerator.updateSuccessInterface(
        mockCurlInfo,
        { data: 'success' },
        analysisWithError,
        'TestResponse'
      );

      expect(result.errorInterface).toContain('ErrorResponse');
      expect(result.successInterface).toContain('data: string;');
    });

    it('should handle array response data', () => {
      const arrayResponse = [
        { id: 1, name: 'Item 1' },
        { id: 2, name: 'Item 2' }
      ];

      const result = dualInterfaceGenerator.updateSuccessInterface(
        mockCurlInfo,
        arrayResponse,
        emptyAnalysis,
        'TestResponse'
      );

      expect(result.successInterface).toContain('export interface SuccessResponse');
      
    });
  });

  describe('preserveExistingDefaultInterface', () => {
    it('should fallback to basic interface when no default exists', () => {
      const result = dualInterfaceGenerator.updateErrorInterface(
        mockCurlInfo,
        { error: 'test' },
        emptyAnalysis,
        'CustomResponse'
      );

      expect(result.defaultInterface).toContain('interface CustomResponse {');
      expect(result.defaultInterface).toContain('message: string;');
      expect(result.exportStatement).toBe('export default CustomResponse;');
    });

    it('should handle interface name collisions', () => {
      const mockDefaultInterface = {
        getName: () => 'ErrorResponse', 
        getProperties: () => [],
        getText: () => 'interface ErrorResponse { customField: string; }',
        getFullText: () => 'interface ErrorResponse { customField: string; }',
      } as any;

      const analysisWithCollision: ExistingFileAnalysis = {
        exists: true,
        hasDefaultExport: true,
        defaultInterfaceName: 'ErrorResponse',
        allInterfaces: [mockDefaultInterface],
        hasGuard: false,
        sourceFile: undefined,
      };

      const result = dualInterfaceGenerator.updateErrorInterface(
        mockCurlInfo,
        { error: 'test' },
        analysisWithCollision,
        'ErrorResponse'
      );
      
      expect(result.defaultInterface).toContain('interface ErrorResponse');
      expect(result.exportStatement).toBe('export default ErrorResponse;');
    });
  });

  describe('Guard condition generation', () => {
    it('should generate consistent guard conditions across modes', () => {
      const errorResult = dualInterfaceGenerator.updateErrorInterface(
        mockCurlInfo,
        { error: 'test' },
        emptyAnalysis,
        'TestResponse'
      );

      const successResult = dualInterfaceGenerator.updateSuccessInterface(
        mockCurlInfo,
        { success: true },
        emptyAnalysis,
        'TestResponse'
      );
      
      expect(errorResult.guardComment).toContain('@guard');
      expect(successResult.guardComment).toContain('@guard');
      
      expect(errorResult.guardComment).toContain('"interface": "ErrorResponse"');
      
      expect(successResult.guardComment).toContain('"interface": "SuccessResponse"');
    });

    it('should handle invalid curl info gracefully', () => {
      const invalidCurlInfo: CurlInfo = {
        method: '',
        url: '',
        path: '',
        headers: {},
        queryParams: {},
      };

      const result = dualInterfaceGenerator.updateErrorInterface(
        invalidCurlInfo,
        { error: 'test' },
        emptyAnalysis,
        'TestResponse'
      );

      expect(result.guardComment).toContain('@guard');
      expect(result.guardComment).toContain('"condition"');
    });
  });
});
