import { spawn } from 'child_process';
import { existsSync, readFileSync, rmSync, mkdirSync, writeFileSync } from 'fs';
import path from 'path';

describe('Generate Replacement Prompt E2E', () => {
  const testOutputDir = path.join(process.cwd(), 'test_output_replacement');
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

  describe('File replacement prompts', () => {
    it('should prompt for replacement when file exists and no --error or --success flag is provided', async () => {
      
      const existingFile = path.join(testOutputDir, 'api/character/:param1.get.ts');
      mkdirSync(path.dirname(existingFile), { recursive: true });
      writeFileSync(existingFile, `
interface CharacterGetResponse {
  id: number;
  name: string;
}

export default CharacterGetResponse;
      `.trim());

      const command = `bun run dev generate --curl "${testApiUrl}" --output "${testOutputDir}"`;
      
      const child = spawn('bash', ['-c', command], {
        stdio: ['pipe', 'pipe', 'pipe'],
        cwd: process.cwd()
      });

      let output = '';
      let prompted = false;

      child.stdout.on('data', (data) => {
        const text = data.toString();
        output += text;
        
        if (text.includes('File already exists') && text.includes('How would you like to replace it?')) {
          prompted = true;
          
          child.stdin.write('1\n');
        } else if (text.includes('Choose an option (1/2)')) {
          
          child.stdin.write('1\n');
        }
      });

      child.stderr.on('data', (data) => {
        output += data.toString();
      });

      await new Promise((resolve) => {
        child.on('close', () => {
          child.stdin.end();
          resolve(void 0);
        });
      });
      
      expect(prompted).toBe(true);
      expect(output).toContain('File already exists');
      expect(output).toContain('How would you like to replace it?');
      expect(output).toContain('Replace the entire file');
      expect(output).toContain('Replace only the error response');
      expect(output).toContain('Replace only the success response');
    });

    it('should replace only error response when option 2 is selected', async () => {
      
      const existingFile = path.join(testOutputDir, 'api/character/:param1.get.ts');
      mkdirSync(path.dirname(existingFile), { recursive: true });
      writeFileSync(existingFile, `
export interface ErrorResponse {
  error: string;
  message: string;
  code: number;
}

export interface SuccessResponse {
  id: string;
  message: string;
  success: boolean;
}

/**
 * @guard {
 *  "condition": {
 *   "field": "valid",
 *   "operator": "equals", 
 *   "value": true
 *  },
 *  "left": {
 *   "status": 400,
 *   "interface": "ErrorResponse"
 *  },
 *  "right": {
 *   "status": 200,
 *   "interface": "SuccessResponse"
 *  }
 * }
 */
interface CharacterGetResponse {
  message: string;
}

export default CharacterGetResponse;
      `.trim());

      const originalContent = readFileSync(existingFile, 'utf-8');
      const originalSuccessInterface = originalContent.match(/export interface SuccessResponse \{[\s\S]*?\}/)?.[0];

      const command = `bun run dev generate --curl "${testApiUrl}" --output "${testOutputDir}"`;
      
      const child = spawn('bash', ['-c', command], {
        stdio: ['pipe', 'pipe', 'pipe'],
        cwd: process.cwd()
      });

      child.stdout.on('data', (data) => {
        const text = data.toString();
        
        if (text.includes('How would you like to replace it?')) {
          
          child.stdin.write('2\n');
        } else if (text.includes('Choose an option (1/2)')) {
          
          child.stdin.write('1\n');
        }
      });

      await new Promise((resolve) => {
        child.on('close', () => {
          child.stdin.end();
          resolve(void 0);
        });
      });
      
      expect(existsSync(existingFile)).toBe(true);
      const updatedContent = readFileSync(existingFile, 'utf-8');
      
      if (originalSuccessInterface) {
        expect(updatedContent).toContain(originalSuccessInterface);
      }
      
      expect(updatedContent).toContain('export interface ErrorResponse {');
      expect(updatedContent).toContain('id: number;');
      expect(updatedContent).toContain('name: string;');
    });

    it('should replace only success response when option 3 is selected', async () => {
      
      const existingFile = path.join(testOutputDir, 'api/character/:param1.get.ts');
      mkdirSync(path.dirname(existingFile), { recursive: true });
      writeFileSync(existingFile, `
export interface ErrorResponse {
  error: string;
  message: string;
  code: number;
}

export interface SuccessResponse {
  id: string;
  message: string;
  success: boolean;
}

/**
 * @guard {
 *  "condition": {
 *   "field": "valid",
 *   "operator": "equals",
 *   "value": true
 *  },
 *  "left": {
 *   "status": 400,
 *   "interface": "ErrorResponse"
 *  },
 *  "right": {
 *   "status": 200,
 *   "interface": "SuccessResponse"
 *  }
 * }
 */
interface CharacterGetResponse {
  message: string;
}

export default CharacterGetResponse;
      `.trim());

      const originalContent = readFileSync(existingFile, 'utf-8');
      const originalErrorInterface = originalContent.match(/export interface ErrorResponse \{[\s\S]*?\}/)?.[0];

      const command = `bun run dev generate --curl "${testApiUrl}" --output "${testOutputDir}"`;
      
      const child = spawn('bash', ['-c', command], {
        stdio: ['pipe', 'pipe', 'pipe'],
        cwd: process.cwd()
      });

      child.stdout.on('data', (data) => {
        const text = data.toString();
        
        if (text.includes('How would you like to replace it?')) {
          
          child.stdin.write('3\n');
        } else if (text.includes('Choose an option (1/2)')) {
          
          child.stdin.write('1\n');
        }
      });

      await new Promise((resolve) => {
        child.on('close', () => {
          child.stdin.end();
          resolve(void 0);
        });
      });
      
      expect(existsSync(existingFile)).toBe(true);
      const updatedContent = readFileSync(existingFile, 'utf-8');
      
      if (originalErrorInterface) {
        expect(updatedContent).toContain(originalErrorInterface);
      }
      
      expect(updatedContent).toContain('export interface SuccessResponse {');
      expect(updatedContent).toContain('id: number;');
      expect(updatedContent).toContain('species: string;');
    });

    it('should not prompt when --error flag is explicitly provided', async () => {
      
      const existingFile = path.join(testOutputDir, 'api/character/:param1.get.ts');
      mkdirSync(path.dirname(existingFile), { recursive: true });
      writeFileSync(existingFile, `
interface CharacterGetResponse {
  id: number;
  name: string;
}

export default CharacterGetResponse;
      `.trim());

      const command = `bun run dev generate --curl "${testApiUrl}" --error --output "${testOutputDir}"`;
      
      const child = spawn('bash', ['-c', command], {
        stdio: ['pipe', 'pipe', 'pipe'],
        cwd: process.cwd()
      });

      let output = '';
      let replacementPrompted = false;

      child.stdout.on('data', (data) => {
        const text = data.toString();
        output += text;
        
        if (text.includes('How would you like to replace it?')) {
          replacementPrompted = true;
        } else if (text.includes('Choose an option (1/2)')) {
          child.stdin.write('1\n');
        }
      });

      await new Promise((resolve) => {
        child.on('close', () => {
          child.stdin.end();
          resolve(void 0);
        });
      });
      
      expect(replacementPrompted).toBe(false);
      expect(output).not.toContain('How would you like to replace it?');
      
      const updatedContent = readFileSync(existingFile, 'utf-8');
      expect(updatedContent).toContain('export interface ErrorResponse {');
      expect(updatedContent).toContain('export interface SuccessResponse {');
    });
  });
});
