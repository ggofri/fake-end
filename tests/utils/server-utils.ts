import { exec, spawn, ChildProcess } from 'child_process';
import { promisify } from 'util';
import { existsSync, mkdirSync, rmSync, writeFileSync } from 'fs';
import path from 'path';
import { getPortForTestFile, releasePort } from './port-manager';
import { cleanupManager } from './cleanup-manager';
void cleanupManager; 

const execAsync = promisify(exec);

export interface TestServerOptions {
  port?: number;
  mockDir?: string;
  timeout?: number;
  dynamicMocks?: boolean;
}

export interface ServerInstance {
  process: ChildProcess;
  port: number;
  mockDir: string;
  dynamicMocks?: boolean;
  cleanup: () => Promise<void>;
  restart: (newMockDir?: string) => Promise<void>;
}

export class TestServerManager {
  private activeServers: Map<number, ServerInstance> = new Map();
  private testDirsToCleanup: Set<string> = new Set();

  async startServer(options: TestServerOptions = {}): Promise<ServerInstance> {
    const port = options.port ?? getPortForTestFile();
    const mockDir = options.mockDir ?? this.createTempMockDir();
    
    const baseTimeout = options.timeout ?? 10000;
    const timeout = options.dynamicMocks ? Math.max(baseTimeout, 60000) : baseTimeout;
    const dynamicMocks = options.dynamicMocks ?? false;

    if (this.activeServers.has(port)) {
      const existingServer = this.activeServers.get(port)!;
      if (!options.mockDir) {
        return existingServer;
      }
      await existingServer.restart(mockDir);
      return existingServer;
    }

    return new Promise((resolve, reject) => {
      const binPath = path.join(__dirname, '../../src/cli-commands/handlers/index.ts');
      const args = [binPath, 'run', '-p', port.toString(), '-d', mockDir];
      if (dynamicMocks) {
        args.push('--dynamic-mocks');
      }
      const serverProcess = spawn('bun', args, {
        stdio: ['pipe', 'pipe', 'pipe'],
        env: { ...process.env, NODE_ENV: 'test' }
      });

      let serverStarted = false;
      let lastOutput = '';
      const startTimeout = setTimeout(() => {
        if (!serverStarted) {
          serverProcess.kill();
          const errorDetails = lastOutput ? `\nLast output: ${lastOutput.slice(-200)}` : '';
          const mockDirInfo = dynamicMocks ? ` (TypeScript compilation mode)` : '';
          reject(new Error(`Server failed to start within ${timeout}ms on port ${port}${mockDirInfo}${errorDetails}`));
        }
      }, timeout);

      serverProcess.stdout?.on('data', (data: Buffer) => {
        const output = data.toString();
        lastOutput += output; 
        if (output.includes(`Mock server running on http://localhost:${port}`) && !serverStarted) {
          serverStarted = true;
          clearTimeout(startTimeout);
          
          setTimeout(() => {
            const instance: ServerInstance = {
              process: serverProcess,
              port,
              mockDir,
              dynamicMocks,
              cleanup: () => this.stopServer(port),
              restart: (newMockDir?: string) => this.restartServer(port, newMockDir)
            };
            
            this.activeServers.set(port, instance);
            resolve(instance);
          }, 500);
        }
      });

      serverProcess.stderr?.on('data', (data: Buffer) => {
        const error = data.toString();
        if (!serverStarted && error.includes('Error')) {
          clearTimeout(startTimeout);
          reject(new Error(`Server failed to start: ${error}`));
        }
      });

      serverProcess.on('error', (error) => {
        if (!serverStarted) {
          clearTimeout(startTimeout);
          reject(error);
        }
      });

      serverProcess.on('exit', (code) => {
        if (!serverStarted && code !== 0 && code !== null) {
          clearTimeout(startTimeout);
          reject(new Error(`Server process exited with code ${code}`));
        }
      });
    });
  }

  async restartServer(port: number, newMockDir?: string): Promise<void> {
    const server = this.activeServers.get(port);
    if (!server) {
      throw new Error(`No server running on port ${port}`);
    }

    const mockDir = newMockDir || server.mockDir;
    
    await this.stopServer(port);
    
    await this.waitForPortToBeAvailable(port, 50);
    
    await new Promise(resolve => setTimeout(resolve, 200));
    
    const newServer = await this.startServer({ 
      port, 
      mockDir,
      dynamicMocks: server.dynamicMocks
    });
    
    server.process = newServer.process;
    server.mockDir = mockDir;
  }

  async stopServer(port: number): Promise<void> {
    const server = this.activeServers.get(port);
    if (!server) {
      return;
    }

    return new Promise((resolve) => {
      // eslint-disable-next-line prefer-const
      let forceKillTimeout: NodeJS.Timeout;
      
      const cleanup = () => {
        if (forceKillTimeout) {
          clearTimeout(forceKillTimeout);
        }
        this.activeServers.delete(port);
        releasePort(port); 
        resolve();
      };

      server.process.on('exit', cleanup);

      server.process.kill('SIGTERM');
      
      forceKillTimeout = setTimeout(() => {
        if (!server.process.killed) {
          server.process.kill('SIGKILL');
        }
      }, 3000);
    });
  }

  async stopAllServers(): Promise<void> {
    const stopPromises = Array.from(this.activeServers.keys()).map(port => 
      this.stopServer(port)
    );
    await Promise.all(stopPromises);
  }

  createTempMockDir(baseName = 'test-mock'): string {
    const tempDir = path.join(__dirname, '../fixtures', `${baseName}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`);
    mkdirSync(tempDir, { recursive: true });
    this.testDirsToCleanup.add(tempDir);
    return tempDir;
  }

  createMockFile(mockDir: string, fileName: string, content: string): string {
    const filePath = path.join(mockDir, fileName);
    const fileDir = path.dirname(filePath);
    
    if (!existsSync(fileDir)) {
      mkdirSync(fileDir, { recursive: true });
    }
    
    writeFileSync(filePath, content);
    return filePath;
  }

  async cleanup(): Promise<void> {
    
    await this.stopAllServers();
    
    const ports = Array.from(this.activeServers.keys());
    await Promise.all(ports.map(port => 
      this.waitForPortToBeAvailable(port, 10).catch(() => {
        console.warn(`Port ${port} may still be in use after cleanup`);
      })
    ));
    
    const cleanupPromises = Array.from(this.testDirsToCleanup).map(async (dir) => {
      try {
        if (existsSync(dir)) {
          rmSync(dir, { recursive: true, force: true });
        }
      } catch (err) {
        console.warn(`Failed to cleanup directory ${dir}:`, err);
      }
    });
    
    await Promise.all(cleanupPromises);
    this.testDirsToCleanup.clear();
  }

  async forceCleanup(): Promise<void> {
    try {
      const { execSync } = await import('child_process');
      execSync('pkill -f "fake-end" || pkill -f "src/cli-commands/handlers/index.ts" || true', { stdio: 'pipe' });
      
      await new Promise(resolve => setTimeout(resolve, 1000));
    } catch (err) {
      console.error("Error when trying forceCleanup: ", err.message ?? err)
    }
    
    this.activeServers.clear();
    
    await this.cleanup();
  }

  async waitForServerHealth(port: number, maxAttempts = 20): Promise<boolean> {
    for (let i = 0; i < maxAttempts; i++) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 2000);
        
        const response = await fetch(`http://localhost:${port}/`, {
          signal: controller.signal,
          method: 'GET'
        });
        
        clearTimeout(timeoutId);
        
        if (response.status !== undefined) {
          return true;
        }
      } catch (err) {
        
        if (i === maxAttempts - 1) {
          console.warn(`Health check failed for port ${port} after ${maxAttempts} attempts:`, err instanceof Error ? err.message : err);
        }
      }
      await new Promise(resolve => setTimeout(resolve, 250));
    }
    return false;
  }

  async isPortAvailable(port: number): Promise<boolean> {
    try {
      const { stdout } = await execAsync(`lsof -i :${port}`);
      return stdout.trim() === '';
    } catch {
      return true;
    }
  }

  async waitForPortToBeAvailable(port: number, maxAttempts = 20): Promise<void> {
    for (let i = 0; i < maxAttempts; i++) {
      if (await this.isPortAvailable(port)) {
        
        try {
          const net = await import('net');
          const server = net.createServer();
          await new Promise<void>((resolve, reject) => {
            server.listen(port, () => {
              server.close(() => resolve());
            }).on('error', reject);
          });
          return; 
        } catch {
          /* eslint-disable-line no-empty */
        }
      }
      await new Promise(resolve => setTimeout(resolve, 150));
    }
    throw new Error(`Port ${port} did not become available after ${maxAttempts * 150}ms`);
  }
}

export const serverManager = new TestServerManager();
