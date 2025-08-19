import { writeFileSync, existsSync, rmSync, mkdirSync } from 'fs';
import { join } from 'path';
import { fileAnalyzer } from '../file-analyzer';

describe('file-analyzer', () => {
  const testDir = join('temp-test-files');
  const testFilePath = join(testDir, 'test-interface.ts');

  beforeAll(() => {
    if (!existsSync(testDir)) {
      mkdirSync(testDir, { recursive: true });
    }
  });

  afterEach(() => {
    if (existsSync(testFilePath)) {
      rmSync(testFilePath);
    }
  });

  afterAll(() => {
    if (existsSync(testDir)) {
      require('fs').rmSync(testDir, { recursive: true, force: true });
    }
  });

  describe('analyzeFile', () => {
    it('should return exists: false for non-existent files', async () => {
      const result = await fileAnalyzer.analyzeFile(join(testDir, 'non-existent.ts'));
      
      expect(result.exists).toBe(false);
      expect(result.hasDefaultExport).toBe(false);
      expect(result.defaultInterfaceName).toBe(null);
      expect(result.allInterfaces).toEqual([]);
      expect(result.hasGuard).toBe(false);
    });

    it('should analyze file with single interface and default export', async () => {
      const content = `interface UserResponse {
  id: string;
  name: string;
  email: string;
}

export default UserResponse;`;
      
      writeFileSync(testFilePath, content, 'utf8'); 
      
      const result = await fileAnalyzer.analyzeFile(testFilePath); 
      
      expect(result.exists).toBe(true);
      expect(result.hasDefaultExport).toBe(true);
      expect(result.defaultInterfaceName).toBe('UserResponse');
      expect(result.allInterfaces).toHaveLength(1);
      expect(result.allInterfaces[0].getName()).toBe('UserResponse');
      expect(result.hasGuard).toBe(false);
    });

    it('should analyze file with multiple interfaces', async () => {
      const content = `export interface ErrorResponse {
  error: string;
  code: number;
}

export interface SuccessResponse {
  data: any;
  success: boolean;
}

interface MainResponse {
  message: string;
}

export default MainResponse;`;
      
      writeFileSync(testFilePath, content, 'utf8');
      
      const result = await fileAnalyzer.analyzeFile(testFilePath);
      
      expect(result.exists).toBe(true);
      expect(result.hasDefaultExport).toBe(true);
      expect(result.defaultInterfaceName).toBe('MainResponse');
      expect(result.allInterfaces).toHaveLength(3);
      expect(result.hasGuard).toBe(false);
    });

    it('should detect guard comments', async () => {
      const content = `/**
 * @guard {
 *   "condition": {"field": "role", "operator": "equals", "value": "admin"}
 * }
 */
interface AdminResponse {
  message: string;
}

export default AdminResponse;`;
      
      writeFileSync(testFilePath, content, 'utf8');
      
      const result = await fileAnalyzer.analyzeFile(testFilePath);
      
      expect(result.exists).toBe(true);
      expect(result.hasGuard).toBe(true);
      expect(result.allInterfaces).toHaveLength(1);
    });

    it('should handle malformed TypeScript files gracefully', async () => {
      const content = 'invalid typescript content {{{';
      
      writeFileSync(testFilePath, content, 'utf8');
      
      const result = await fileAnalyzer.analyzeFile(testFilePath);
      
      expect(result.exists).toBe(true);
      expect(result.hasDefaultExport).toBe(false);
      expect(result.defaultInterfaceName).toBe(null);
      expect(result.allInterfaces).toEqual([]);
      expect(result.hasGuard).toBe(false);
    });
  });
});
