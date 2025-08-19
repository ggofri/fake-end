import { spawn, ChildProcess } from 'child_process';
import { mkdirSync, writeFileSync, rmSync, existsSync } from 'fs';
import { join } from 'path';
import { createYamlMockFile } from '../utils';

describe('CLI Core Functionality', () => {
  const testDir = join(__dirname, '../fixtures/cli-test');
  let serverProcess: ChildProcess | null = null;

  beforeEach(() => {
    
    if (existsSync(testDir)) {
      rmSync(testDir, { recursive: true, force: true });
    }
    mkdirSync(testDir, { recursive: true });
  });

  afterEach(() => {
    
    if (serverProcess && !serverProcess.killed) {
      serverProcess.kill('SIGTERM');
      serverProcess = null;
    }
    
    if (existsSync(testDir)) {
      rmSync(testDir, { recursive: true, force: true });
    }
  });

  describe('Server Startup', () => {
    it('should start server successfully with valid mock directory', async () => {
      
      const yamlContent = createYamlMockFile([
        {
          method: 'GET',
          path: '/health',
          status: 200,
          body: { status: 'ok' }
        }
      ]);
      
      writeFileSync(join(testDir, 'health.yaml'), yamlContent);
      
      const binPath = join(process.cwd(), 'src/cli-commands/handlers/index.ts');
      const testPort = 5001 + Math.floor(Math.random() * 1000); 
      const promise = new Promise<void>((resolve, reject) => {
        serverProcess = spawn('bun', [binPath, 'run', '-p', testPort.toString(), '-d', testDir], {
          stdio: ['pipe', 'pipe', 'pipe']
        });

        let output = '';
        const timeout = setTimeout(() => {
          reject(new Error('Server startup timeout'));
        }, 10000);

        serverProcess.stdout?.on('data', (data) => {
          output += data.toString();
          if (output.includes(`Mock server running on http://localhost:${testPort}`)) {
            clearTimeout(timeout);
            resolve();
          }
        });

        serverProcess.stderr?.on('data', (data) => {
          const error = data.toString();
          if (error.includes('Error')) {
            clearTimeout(timeout);
            reject(new Error(`Server startup failed: ${error}`));
          }
        });

        serverProcess.on('exit', (code) => {
          if (code !== 0) {
            clearTimeout(timeout);
            reject(new Error(`Server exited with code ${code}`));
          }
        });
      });

      await promise;
      
      const response = await fetch(`http://localhost:${testPort}/health`);
      expect(response.status).toBe(200);
      const body = await response.json();
      expect(body.status).toBe('ok');
    });

    it('should fail gracefully when mock directory does not exist', async () => {
      const nonExistentDir = join(testDir, 'does-not-exist');
      
      const binPath = join(process.cwd(), 'src/cli-commands/handlers/index.ts');
      const testPort = 5001 + Math.floor(Math.random() * 1000); 
      const promise = new Promise<string>((resolve, reject) => {
        serverProcess = spawn('bun', [binPath, 'run', '-p', testPort.toString(), '-d', nonExistentDir], {
          stdio: ['pipe', 'pipe', 'pipe']
        });

        let errorOutput = '';
        const timeout = setTimeout(() => {
          reject(new Error('Process did not exit within timeout'));
        }, 5000);

        serverProcess.stderr?.on('data', (data) => {
          errorOutput += data.toString();
        });

        serverProcess.on('exit', (code) => {
          clearTimeout(timeout);
          if (code !== 0) {
            resolve(errorOutput);
          } else {
            reject(new Error('Expected server to fail but it succeeded'));
          }
        });
      });

      const errorOutput = await promise;
      expect(errorOutput).toContain('does not exist');
    });

    it('should handle port already in use scenario', async () => {
      
      const yamlContent = createYamlMockFile([
        {
          method: 'GET',
          path: '/test',
          status: 200,
          body: { message: 'test' }
        }
      ]);
      
      writeFileSync(join(testDir, 'test.yaml'), yamlContent);
      
      const binPath = join(process.cwd(), 'src/cli-commands/handlers/index.ts');
      const testPort = 5001 + Math.floor(Math.random() * 1000); 
      const firstServer = spawn('bun', [binPath, 'run', '-p', testPort.toString(), '-d', testDir], {
        stdio: ['pipe', 'pipe', 'pipe']
      });
      
      await new Promise<void>((resolve, reject) => {
        let output = '';
        const timeout = setTimeout(() => {
          reject(new Error('First server startup timeout'));
        }, 5000);

        firstServer.stdout?.on('data', (data) => {
          output += data.toString();
          if (output.includes(`Mock server running on http://localhost:${testPort}`)) {
            clearTimeout(timeout);
            resolve();
          }
        });
      });
      
      const secondServerPromise = new Promise<string>((resolve, reject) => {
        const secondServer = spawn('bun', [binPath, 'run', '-p', testPort.toString(), '-d', testDir], {
          stdio: ['pipe', 'pipe', 'pipe']
        });

        let output = '';
        const timeout = setTimeout(() => {
          secondServer.kill();
          reject(new Error('Second server did not start within timeout'));
        }, 5000);

        secondServer.stdout?.on('data', (data) => {
          output += data.toString();
        });

        secondServer.on('exit', () => {
          clearTimeout(timeout);
          resolve(output);
        });
        
        setTimeout(() => {
          secondServer.kill();
        }, 2000);
      });

      const output = await secondServerPromise;
      
      firstServer.kill('SIGTERM');
      
      expect(output).toContain('Using fallback port');
      expect(output).toContain(`Mock server running on http://localhost:${testPort + 1}`);
    });
  });

  describe('Basic CLI Commands', () => {
    it('should display version information', async () => {
      const binPath = join(process.cwd(), 'src/cli-commands/handlers/index.ts');
      const promise = new Promise<string>((resolve, reject) => {
        const process = spawn('bun', [binPath, '--version'], {
          stdio: ['pipe', 'pipe', 'pipe']
        });

        let output = '';
        const timeout = setTimeout(() => {
          process.kill();
          reject(new Error('Version command timeout'));
        }, 5000);

        process.stdout?.on('data', (data) => {
          output += data.toString();
        });

        process.on('exit', (code) => {
          clearTimeout(timeout);
          if (code === 0) {
            resolve(output.trim());
          } else {
            reject(new Error(`Version command failed with code ${code}`));
          }
        });
      });

      const version = await promise;
      expect(version).toMatch(/\d+\.\d+\.\d+/); 
    });

    it('should display help information', async () => {
      const binPath = join(process.cwd(), 'src/cli-commands/handlers/index.ts');
      const promise = new Promise<string>((resolve, reject) => {
        const process = spawn('bun', [binPath, '--help'], {
          stdio: ['pipe', 'pipe', 'pipe']
        });

        let output = '';
        const timeout = setTimeout(() => {
          process.kill();
          reject(new Error('Help command timeout'));
        }, 5000);

        process.stdout?.on('data', (data) => {
          output += data.toString();
        });

        process.on('exit', (code) => {
          clearTimeout(timeout);
          if (code === 0) {
            resolve(output);
          } else {
            reject(new Error(`Help command failed with code ${code}`));
          }
        });
      });

      const help = await promise;
      expect(help).toContain('fake-end');
      expect(help).toContain('run');
      expect(help).toContain('generate');
      expect(help).toContain('Commands');
    });
  });
});
