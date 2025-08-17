import { spawn } from 'child_process';
import { mkdirSync, rmSync, existsSync, readFileSync } from 'fs';
import { join } from 'path';
import { createTestContext, cleanupTestContext, TestContext } from '../utils';
import { serverManager } from '../utils';

describe('CLI Generate TypeScript Functionality', () => {
  const testDir = join(__dirname, '../fixtures/cli-generate-test');
  let context: TestContext;

  beforeEach(() => {
    if (existsSync(testDir)) {
      rmSync(testDir, { recursive: true, force: true });
    }
    mkdirSync(testDir, { recursive: true });
  });

  afterEach(async () => {
    if (context) {
      await cleanupTestContext(context);
    }
    
    if (existsSync(testDir)) {
      rmSync(testDir, { recursive: true, force: true });
    }
  });

  afterAll(async () => {
    await serverManager.cleanup();
  });

  describe('TypeScript Interface Generation', () => {
    it('should generate TypeScript interfaces by default and create functional mock endpoints', async () => {
      const binPath = join(process.cwd(), 'bin.js');
      
      const generatePromise = new Promise<string>((resolve, reject) => {
        const generateProcess = spawn('node', [
          binPath, 
          'generate', 
          '--curl', 'curl -X GET http://example.com/api/users/123',
          '-o', testDir,
          '--no-execute'
        ], {
          stdio: ['pipe', 'pipe', 'pipe']
        });

        let output = '';
        let errorOutput = '';
        const timeout = setTimeout(() => {
          generateProcess.kill();
          reject(new Error('Generate command timeout'));
        }, 10000);

        generateProcess.stdout?.on('data', (data) => {
          output += data.toString();
        });

        generateProcess.stderr?.on('data', (data) => {
          errorOutput += data.toString();
        });

        generateProcess.on('exit', (code) => {
          clearTimeout(timeout);
          if (code === 0) {
            resolve(output);
          } else {
            reject(new Error(`Generate command failed with code ${code}. Error: ${errorOutput}`));
          }
        });
      });

      const output = await generatePromise;
      
      expect(output).toContain('Mock file generated');
      
      const allFiles = require('fs').readdirSync(testDir, { recursive: true });
      const tsFiles = allFiles.filter((file: string) => file.endsWith('.ts'));
      expect(tsFiles.length).toBeGreaterThan(0);
      
      const tsFile = tsFiles[0];
      const tsContent = readFileSync(join(testDir, tsFile), 'utf8');
      
      expect(tsContent).toContain('interface');
      
      expect(tsContent).toContain('@mock');
      
      expect(tsContent).toContain('export default');
      
      context = await createTestContext({ mockDir: testDir });
      
      const response = await context.client.get('/api/users');
      
      expect(response.status).toBe(200);
      expect(response.body).toBeDefined();
      expect(typeof response.body).toBe('object');
    });

    it('should generate YAML files when --yaml flag is specified', async () => {
      const binPath = join(process.cwd(), 'bin.js');
      
      const generatePromise = new Promise<string>((resolve, reject) => {
        const generateProcess = spawn('node', [
          binPath, 
          'generate', 
          '--curl', 'curl -X POST http://example.com/api/products -H "Content-Type: application/json" -d \'{"name":"Test Product","price":29.99}\'',
          '-o', testDir,
          '--yaml',
          '--no-execute'
        ], {
          stdio: ['pipe', 'pipe', 'pipe']
        });

        let output = '';
        let errorOutput = '';
        const timeout = setTimeout(() => {
          generateProcess.kill();
          reject(new Error('Generate command timeout'));
        }, 10000);

        generateProcess.stdout?.on('data', (data) => {
          output += data.toString();
        });

        generateProcess.stderr?.on('data', (data) => {
          errorOutput += data.toString();
        });

        generateProcess.on('exit', (code) => {
          clearTimeout(timeout);
          if (code === 0) {
            resolve(output);
          } else {
            reject(new Error(`Generate command failed with code ${code}. Error: ${errorOutput}`));
          }
        });
      });

      const output = await generatePromise;
      
      expect(output).toContain('Mock file generated');
      
      const generatedFiles = require('fs').readdirSync(testDir, { recursive: true });
      const yamlFiles = generatedFiles.filter((file: string) => file.endsWith('.yaml') || file.endsWith('.yml'));
      const tsFiles = generatedFiles.filter((file: string) => file.endsWith('.ts'));
      
      expect(yamlFiles.length).toBeGreaterThan(0);
      expect(tsFiles.length).toBe(0); 
      
      const yamlFile = yamlFiles[0];
      const yamlContent = readFileSync(join(testDir, yamlFile), 'utf8');
      
      expect(yamlContent).toContain('method:');
      expect(yamlContent).toContain('path:');
      expect(yamlContent).toContain('status:');
      expect(yamlContent).toContain('body:');
      
      context = await createTestContext({ mockDir: testDir });
      
      const response = await context.client.post('/api/products', {
        name: 'Test Product',
        price: 29.99
      });
      
      expect(response.status).toBe(201);
      expect(response.body).toBeDefined();
    });

    it('should generate realistic mock values in TypeScript interfaces', async () => {
      const binPath = join(process.cwd(), 'bin.js');
      
      const generatePromise = new Promise<string>((resolve, reject) => {
        const generateProcess = spawn('node', [
          binPath, 
          'generate', 
          '--curl', 'curl -X GET http://example.com/api/profile -H "Authorization: Bearer token"',
          '-o', testDir,
          '--no-execute'
        ], {
          stdio: ['pipe', 'pipe', 'pipe']
        });

        let output = '';
        let errorOutput = '';
        const timeout = setTimeout(() => {
          generateProcess.kill();
          reject(new Error('Generate command timeout'));
        }, 10000);

        generateProcess.stdout?.on('data', (data) => {
          output += data.toString();
        });

        generateProcess.stderr?.on('data', (data) => {
          errorOutput += data.toString();
        });

        generateProcess.on('exit', (code) => {
          clearTimeout(timeout);
          if (code === 0) {
            resolve(output);
          } else {
            reject(new Error(`Generate command failed with code ${code}. Error: ${errorOutput}`));
          }
        });
      });

      await generatePromise;
      
      const generatedFiles = require('fs').readdirSync(testDir, { recursive: true });
      const tsFiles = generatedFiles.filter((file: string) => file.endsWith('.ts'));
      expect(tsFiles.length).toBeGreaterThan(0);
      
      const tsContent = readFileSync(join(testDir, tsFiles[0]), 'utf8');
      
      expect(tsContent).toContain('@mock');
      
      context = await createTestContext({ mockDir: testDir });
      
      const response = await context.client.get('/api/profile');
      
      expect(response.status).toBe(200);
      expect(response.body).toBeDefined();
      
      if (typeof response.body === 'object' && response.body !== null) {
        const body = response.body as { data?: Array<Record<string, unknown>>; [key: string]: unknown };
        
        if (body.data && Array.isArray(body.data) && body.data.length > 0) {
          const firstItem = body.data[0];
          const itemKeys = Object.keys(firstItem);
          expect(itemKeys.length).toBeGreaterThan(0);
          
          const hasStringValues = itemKeys.some(key => 
            typeof firstItem[key] === 'string' && (firstItem[key] as string).length > 0
          );
          const hasNumberValues = itemKeys.some(key => 
            typeof firstItem[key] === 'number' && (firstItem[key] as number) > 0
          );
          
          expect(hasStringValues || hasNumberValues).toBe(true);
        } else {
          fail('Response body should have a data property with realistic values');
        }
      }
    });

    it('should handle invalid cURL commands gracefully', async () => {
      const binPath = join(process.cwd(), 'bin.js');
      
      const generatePromise = new Promise<string>((resolve, reject) => {
        const generateProcess = spawn('node', [
          binPath, 
          'generate', 
          '--curl', 'invalid-curl-command',
          '-o', testDir,
          '--no-execute'
        ], {
          stdio: ['pipe', 'pipe', 'pipe']
        });

        let output = '';
        let errorOutput = '';
        const timeout = setTimeout(() => {
          generateProcess.kill();
          reject(new Error('Generate command timeout'));
        }, 10000);

        generateProcess.stdout?.on('data', (data) => {
          output += data.toString();
        });

        generateProcess.stderr?.on('data', (data) => {
          errorOutput += data.toString();
        });

        generateProcess.on('exit', () => {
          clearTimeout(timeout);
          
          resolve(errorOutput || output);
        });
      });

      const output = await generatePromise;
      
      expect(output.length).toBeGreaterThan(0);
    });

    it('should create nested directory structure when generating interfaces for paths with multiple segments', async () => {
      const binPath = join(process.cwd(), 'bin.js');
      
      const generatePromise = new Promise<string>((resolve, reject) => {
        const generateProcess = spawn('node', [
          binPath, 
          'generate', 
          '--curl', 'curl -X GET http://example.com/api/v1/admin/users/settings',
          '-o', testDir,
          '--no-execute'
        ], {
          stdio: ['pipe', 'pipe', 'pipe']
        });

        let output = '';
        let errorOutput = '';
        const timeout = setTimeout(() => {
          generateProcess.kill();
          reject(new Error('Generate command timeout'));
        }, 10000);

        generateProcess.stdout?.on('data', (data) => {
          output += data.toString();
        });

        generateProcess.stderr?.on('data', (data) => {
          errorOutput += data.toString();
        });

        generateProcess.on('exit', (code) => {
          clearTimeout(timeout);
          if (code === 0) {
            resolve(output);
          } else {
            reject(new Error(`Generate command failed with code ${code}. Error: ${errorOutput}`));
          }
        });
      });

      await generatePromise;
      
      const nestedDirPath = join(testDir, 'api', 'v1', 'admin', 'users');
      expect(existsSync(nestedDirPath)).toBe(true);
      
      const tsFiles = require('fs').readdirSync(nestedDirPath).filter((file: string) => file.endsWith('.ts'));
      expect(tsFiles.length).toBeGreaterThan(0);
      
      context = await createTestContext({ mockDir: testDir });
      
      const response = await context.client.get('/api/v1/admin/users/settings');
      
      expect(response.status).toBe(200);
      expect(response.body).toBeDefined();
    });
  });
});
