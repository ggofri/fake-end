import { dualInterfaceGenerator } from '@/typescript-processing/dual-interface/dual-interface-generator';
import { CurlInfo } from '@/mock-generation/types';
import { ExistingFileAnalysis } from '@/typescript-processing/dual-interface/file-analyzer';

describe('dual-interface-generator', () => {
  describe('generate', () => {
    it('should generate complete dual interface structure for new file', () => {
      const curlInfo: CurlInfo = {
        method: 'POST',
        url: 'https://api.example.com/users',
        headers: {},
        data: '{"name": ""}',
        path: '/users',
        queryParams: {}
      };

      const errorResponse = {
        error: 'Validation failed',
        message: 'Name is required',
        code: 400
      };

      const existingAnalysis: ExistingFileAnalysis = {
        exists: false,
        hasDefaultExport: false,
        defaultInterfaceName: null,
        allInterfaces: [],
        hasGuard: false
      };

      const result = dualInterfaceGenerator.generate(
        curlInfo,
        errorResponse,
        existingAnalysis,
        'UserCreateResponse'
      );

      expect(result.guardComment).toContain('@guard');
      expect(result.guardComment).toContain('ErrorResponse');
      expect(result.guardComment).toContain('SuccessResponse');
      expect(result.errorInterface).toContain('export interface ErrorResponse');
      expect(result.errorInterface).toContain('error: string');
      expect(result.successInterface).toContain('export interface SuccessResponse');
      expect(result.defaultInterface).toContain('interface UserCreateResponse');
      expect(result.exportStatement).toBe('export default UserCreateResponse;');
    });

    it('should extract existing interface for success when file exists', () => {
      const curlInfo: CurlInfo = {
        method: 'PUT',
        url: 'https://api.example.com/users/123',
        headers: {},
        data: '{"name": ""}',
        path: '/users/:id',
        queryParams: {}
      };

      const errorResponse = { error: 'Not found', code: 404 };
      
      const mockInterface = {
        getName: () => 'ExistingUserResponse',
        getProperties: () => [
          {
            getName: () => 'id',
            getType: () => ({ getText: () => 'string' }),
            hasQuestionToken: () => false,
            getJsDocs: () => []
          },
          {
            getName: () => 'name', 
            getType: () => ({ getText: () => 'string' }),
            hasQuestionToken: () => false,
            getJsDocs: () => []
          }
        ]
      } as any;

      const existingAnalysis: ExistingFileAnalysis = {
        exists: true,
        hasDefaultExport: true,
        defaultInterfaceName: 'ExistingUserResponse',
        allInterfaces: [mockInterface],
        hasGuard: false
      };

      const result = dualInterfaceGenerator.generate(
        curlInfo,
        errorResponse,
        existingAnalysis,
        'UserUpdateResponse'
      );

      expect(result.successInterface).toContain('export interface SuccessResponse');
      expect(result.successInterface).toContain('id: string');
      expect(result.successInterface).toContain('name: string');
    });

    it('should infer appropriate error status codes', () => {
      const adminCurlInfo: CurlInfo = {
        method: 'POST',
        url: 'https://api.example.com/admin/settings',
        headers: {},
        data: '{}',
        path: '/admin/settings',
        queryParams: {}
      };

      const errorResponse = { error: 'Access denied' };
      const existingAnalysis: ExistingFileAnalysis = {
        exists: false,
        hasDefaultExport: false,
        defaultInterfaceName: null,
        allInterfaces: [],
        hasGuard: false
      };

      const result = dualInterfaceGenerator.generate(
        adminCurlInfo,
        errorResponse,
        existingAnalysis,
        'AdminSettingsResponse'
      );

      expect(result.guardComment).toContain('"status": 403');
    });
  });

  describe('generateCompleteFile', () => {
    it('should combine all parts into valid TypeScript file', () => {
      const structure = {
        guardComment: '/** @guard {"test": true} */',
        errorInterface: 'export interface ErrorResponse { error: string; }',
        successInterface: 'export interface SuccessResponse { data: any; }',
        defaultInterface: 'interface TestResponse { message: string; }',
        exportStatement: 'export default TestResponse;'
      };

      const result = dualInterfaceGenerator.generateCompleteFile(structure);
      
      expect(result).toContain('/** @guard {"test": true} */');
      expect(result).toContain('export interface ErrorResponse');
      expect(result).toContain('export interface SuccessResponse');
      expect(result).toContain('interface TestResponse');
      expect(result).toContain('export default TestResponse;');
      
      const lines = result.split('\n');
      expect(lines).toContain('');  
    });
  });
});
