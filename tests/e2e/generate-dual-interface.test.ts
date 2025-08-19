import { spawn } from 'child_process';
import { existsSync, readFileSync, rmSync, mkdirSync } from 'fs';
import path from 'path';

describe('Generate Dual Interface E2E', () => {
  const testOutputDir = path.join(process.cwd(), 'test_output_dual');
  const testApiUrl = 'https://rickandmortyapi.com/api/character/1';

  beforeAll(async () => {
    if (existsSync(testOutputDir)) {
      rmSync(testOutputDir, { recursive: true });
    }
    mkdirSync(testOutputDir, { recursive: true });
  });

  afterAll(() => {
    if (existsSync(testOutputDir)) {
      rmSync(testOutputDir, { recursive: true });
    }
  });

  afterEach(() => {
    if (existsSync(testOutputDir)) {
      rmSync(testOutputDir, { recursive: true });
    }
    mkdirSync(testOutputDir, { recursive: true });
  });

  describe('--error flag', () => {
    it('should generate dual interface structure with error response', async () => {
      const command = `bun run dev generate --curl "${testApiUrl}" --error --output "${testOutputDir}"`;
      
      const child = spawn('bash', ['-c', command], {
        stdio: ['pipe', 'pipe', 'pipe'],
        cwd: process.cwd()
      });
      
      child.stdin.write('1\n'); 
      child.stdin.end();

      await new Promise((resolve, reject) => {
        let errorOutput = '';
        
        child.stderr.on('data', (data) => {
          errorOutput += data.toString();
        });
        
        child.on('close', (code) => {
          if (code !== 0) {
            reject(new Error(`Command failed with code ${code}. Stderr: ${errorOutput}`));
          } else {
            resolve(code);
          }
        });
      });
      
      const expectedFile = path.join(testOutputDir, 'api/character/:param1.get.ts');
      expect(existsSync(expectedFile)).toBe(true);
      
      const content = readFileSync(expectedFile, 'utf-8');
      
      expect(content).toContain('export interface ErrorResponse {');
      
      expect(content).toContain('export interface SuccessResponse {');
      
      expect(content).toContain('@guard');
      expect(content).toContain('"interface": "ErrorResponse"');
      expect(content).toContain('"interface": "SuccessResponse"');
      
      expect(content).toContain('interface CharacterGetResponse {');
      expect(content).toContain('export default CharacterGetResponse;');
      
      const guardIndex = content.indexOf('@guard');
      const defaultInterfaceIndex = content.indexOf('interface CharacterGetResponse');
      expect(guardIndex).toBeLessThan(defaultInterfaceIndex);
    });

    it('should update only error interface when file already has dual structure', async () => {
      
      const createCommand = `bun run dev generate --curl "${testApiUrl}" --success --output "${testOutputDir}"`;
      
      let child = spawn('bash', ['-c', createCommand], {
        stdio: ['pipe', 'pipe', 'pipe'],
        cwd: process.cwd()
      });

      child.stdin.write('1\n');
      child.stdin.end();

      await new Promise((resolve) => {
        child.on('close', resolve);
      });

      const expectedFile = path.join(testOutputDir, 'api/character/:param1.get.ts');
      const originalContent = readFileSync(expectedFile, 'utf-8');
      
      const successMatch = originalContent.match(/export interface SuccessResponse \{[\s\S]*?\}/);
      const originalSuccessInterface = successMatch ? successMatch[0] : '';
      
      const updateCommand = `bun run dev generate --curl "${testApiUrl}" --error --output "${testOutputDir}"`;
      
      child = spawn('bash', ['-c', updateCommand], {
        stdio: ['pipe', 'pipe', 'pipe'],
        cwd: process.cwd()
      });

      child.stdin.write('1\n');
      child.stdin.end();

      await new Promise((resolve) => {
        child.on('close', resolve);
      });

      const updatedContent = readFileSync(expectedFile, 'utf-8');
      
      if (originalSuccessInterface) {
        expect(updatedContent).toContain('export interface SuccessResponse {');
        expect(updatedContent).toContain('id: number;');
        expect(updatedContent).toContain('name: string;');
        expect(updatedContent).toContain('status: string;');
      }
      
      expect(updatedContent).toContain('export interface ErrorResponse {');
      expect(updatedContent).toContain('id: number;');
      expect(updatedContent).toContain('name: string;');
    });
  });

  describe('--success flag', () => {
    it('should generate dual interface structure with success response', async () => {
      const command = `bun run dev generate --curl "${testApiUrl}" --success --output "${testOutputDir}"`;
      
      const child = spawn('bash', ['-c', command], {
        stdio: ['pipe', 'pipe', 'pipe'],
        cwd: process.cwd()
      });

      child.stdin.write('1\n');
      child.stdin.end();

      await new Promise((resolve, reject) => {
        let errorOutput = '';
        
        child.stderr.on('data', (data) => {
          errorOutput += data.toString();
        });
        
        child.on('close', (code) => {
          if (code !== 0) {
            reject(new Error(`Command failed with code ${code}. Stderr: ${errorOutput}`));
          } else {
            resolve(code);
          }
        });
      });

      const expectedFile = path.join(testOutputDir, 'api/character/:param1.get.ts');
      expect(existsSync(expectedFile)).toBe(true);

      const content = readFileSync(expectedFile, 'utf-8');
      
      expect(content).toContain('export interface ErrorResponse {');
      expect(content).toContain('error: string;');
      expect(content).toContain('message: string;');
      expect(content).toContain('code: number;');
      
      expect(content).toContain('export interface SuccessResponse {');
      expect(content).toContain('id: number;');
      expect(content).toContain('name: string;');
      expect(content).toContain('status: string;');
      
      expect(content).toContain('"status": 200');
      expect(content).toContain('"status": 400');
    });

    it('should update only success interface when file already has dual structure', async () => {
      
      const createCommand = `bun run dev generate --curl "${testApiUrl}" --error --output "${testOutputDir}"`;
      
      let child = spawn('bash', ['-c', createCommand], {
        stdio: ['pipe', 'pipe', 'pipe'],
        cwd: process.cwd()
      });

      child.stdin.write('1\n');
      child.stdin.end();

      await new Promise((resolve) => {
        child.on('close', resolve);
      });

      const expectedFile = path.join(testOutputDir, 'api/character/:param1.get.ts');
      const originalContent = readFileSync(expectedFile, 'utf-8');
      
      const errorMatch = originalContent.match(/export interface ErrorResponse \{[\s\S]*?\}/);
      const originalErrorInterface = errorMatch ? errorMatch[0] : '';
      
      const updateCommand = `bun run dev generate --curl "${testApiUrl}" --success --output "${testOutputDir}"`;
      
      child = spawn('bash', ['-c', updateCommand], {
        stdio: ['pipe', 'pipe', 'pipe'],
        cwd: process.cwd()
      });

      child.stdin.write('1\n');
      child.stdin.end();

      await new Promise((resolve) => {
        child.on('close', resolve);
      });

      const updatedContent = readFileSync(expectedFile, 'utf-8');
      
      if (originalErrorInterface) {
        expect(updatedContent).toContain('export interface ErrorResponse {');
        expect(updatedContent).toContain('id: number;');
        expect(updatedContent).toContain('name: string;');
      }
      
      expect(updatedContent).toContain('export interface SuccessResponse {');
      expect(updatedContent).toContain('id: number;');
      expect(updatedContent).toContain('species: string;');
    });
  });

  describe('Error handling', () => {
    it('should handle invalid cURL URLs gracefully', async () => {
      const command = `bun run dev generate --curl "invalid-url" --error --output "${testOutputDir}"`;
      
      const child = spawn('bash', ['-c', command], {
        stdio: ['pipe', 'pipe', 'pipe'],
        cwd: process.cwd()
      });

      child.stdin.write('1\n');
      child.stdin.end();

      await new Promise((resolve) => {
        child.on('close', resolve);
      });
      
      const expectedFile = path.join(testOutputDir, 'api/:param1.get.ts');
      expect(existsSync(expectedFile)).toBe(false);
    });

    it('should fallback to generic interfaces when API is unreachable', async () => {
      const command = `bun run dev generate --curl "https://nonexistent-api-12345.com/test" --error --output "${testOutputDir}"`;
      
      const child = spawn('bash', ['-c', command], {
        stdio: ['pipe', 'pipe', 'pipe'],
        cwd: process.cwd()
      });

      child.stdin.write('2\n'); 
      child.stdin.end();

      await new Promise((resolve) => {
        child.on('close', resolve);
      });

      const expectedFile = path.join(testOutputDir, 'test.get.ts');
      if (existsSync(expectedFile)) {
        const content = readFileSync(expectedFile, 'utf-8');
        
        expect(content).toContain('interface');
      }
    });
  });
});
