import { exec, spawn, ChildProcess } from 'child_process';
import { promisify } from 'util';
import { existsSync, mkdirSync, rmSync, writeFileSync } from 'fs';
import path from 'path';
import { getPortForTestFile } from './port-manager';
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
  cleanup: () => Promise<void>;
  restart: (newMockDir?: string) => Promise<void>;
}

export class TestServerManager {
  private activeServers: Map<number, ServerInstance> = new Map();
  private testDirsToCleanup: Set<string> = new Set();

  async startServer(options: TestServerOptions = {}): Promise<ServerInstance> {
    const port = options.port ?? getPortForTestFile();
    const mockDir = options.mockDir ?? this.createTempMockDir();
    const timeout = options.timeout ?? 10000;
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
      const binPath = path.join(__dirname, '../../bin.cjs');
      const args = [binPath, 'run', '-p', port.toString(), '-d', mockDir];
      if (dynamicMocks) {
        args.push('--dynamic-mocks');
      }
      const serverProcess = spawn('node', args, {
        stdio: ['pipe', 'pipe', 'pipe'],
        env: { ...process.env, NODE_ENV: 'test' }
      });

      let serverStarted = false;
      const startTimeout = setTimeout(() => {
        if (!serverStarted) {
          serverProcess.kill();
          reject(new Error(`Server failed to start within ${timeout}ms`));
        }
      }, timeout);

      serverProcess.stdout?.on('data', (data: Buffer) => {
        const output = data.toString();
        if (output.includes(`Mock server running on http://localhost:${port}`) && !serverStarted) {
          serverStarted = true;
          clearTimeout(startTimeout);
          
          const instance: ServerInstance = {
            process: serverProcess,
            port,
            mockDir,
            cleanup: () => this.stopServer(port),
            restart: (newMockDir?: string) => this.restartServer(port, newMockDir)
          };
          
          this.activeServers.set(port, instance);
          resolve(instance);
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
        if (!serverStarted && code !== 0) {
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
    
    await this.waitForPortToBeAvailable(port);
    
    const newServer = await this.startServer({ port, mockDir });
    
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
    
    for (const dir of this.testDirsToCleanup) {
      try {
        if (existsSync(dir)) {
          rmSync(dir, { recursive: true, force: true });
        }
      } catch (error) {
        console.warn(`Failed to cleanup directory ${dir}:`, error);
      }
    }
    this.testDirsToCleanup.clear();
  }

  async forceCleanup(): Promise<void> {
    try {
      const { execSync } = await import('child_process');
      execSync('pkill -f "fake-end" || pkill -f "bin.cjs" || true', { stdio: 'pipe' });
    } catch (error) {
      console.error("Error when trying forceCleanup: ", error.message ?? error)
    }
    
    await this.cleanup();
  }

  async waitForServerHealth(port: number, maxAttempts = 10): Promise<boolean> {
    for (let i = 0; i < maxAttempts; i++) {
      try {
        const response = await fetch(`http://localhost:${port}/health`);
        return response.ok;
      } catch {
        await new Promise(resolve => setTimeout(resolve, 500));
      }
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
        return;
      }
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    throw new Error(`Port ${port} did not become available after ${maxAttempts * 100}ms`);
  }
}

export const serverManager = new TestServerManager();
