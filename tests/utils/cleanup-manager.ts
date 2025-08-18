import { existsSync, rmSync, readdirSync, statSync } from 'fs';
import { join } from 'path';
import { execSync } from 'child_process';

export class CleanupManager {
  private static instance: CleanupManager;
  private isCleanupRegistered = false;

  static getInstance(): CleanupManager {
    if (!CleanupManager.instance) {
      CleanupManager.instance = new CleanupManager();
    }
    return CleanupManager.instance;
  }

  registerCleanupHandlers(): void {
    if (this.isCleanupRegistered) {
      return;
    }

    process.on('exit', () => {
      this.cleanupSync();
    });

    process.on('SIGINT', () => {
      console.log('\n🧹 Cleaning up test files before exit...');
      this.cleanupSync();
      process.exit(0);
    });

    process.on('SIGTERM', () => {
      this.cleanupSync();
      process.exit(0);
    });

    process.on('uncaughtException', (error) => {
      console.error('Uncaught Exception:', error);
      this.cleanupSync();
      process.exit(1);
    });

    process.on('unhandledRejection', (reason, promise) => {
      console.error('Unhandled Rejection at:', promise, 'reason:', reason);
      this.cleanupSync();
      process.exit(1);
    });

    this.isCleanupRegistered = true;
  }

  async cleanup(): Promise<void> {
    try {
      await this.cleanupTestDirectories();
      await this.cleanupRunningServers();
      console.log('✅ Test cleanup completed');
    } catch (error) {
      console.warn('⚠️  Some cleanup operations failed:', error);
    }
  }

  cleanupSync(): void {
    try {
      this.cleanupTestDirectoriesSync();
      this.cleanupRunningServersSync();
    } catch (error) {
      console.warn('⚠️  Some cleanup operations failed:', error);
    }
  }

  async cleanupTestDirectories(): Promise<void> {
    const fixturesDir = join(__dirname, '../fixtures');
    
    if (!existsSync(fixturesDir)) {
      return;
    }

    const entries = readdirSync(fixturesDir);
    const testDirs = entries.filter(entry => entry.startsWith('test-mock-'));
    
    if (testDirs.length === 0) {
      return;
    }

    console.log(`🧹 Cleaning up ${testDirs.length} temporary test directories...`);
    
    for (const dir of testDirs) {
      const fullPath = join(fixturesDir, dir);
      try {
        if (existsSync(fullPath)) {
          rmSync(fullPath, { recursive: true, force: true });
        }
      } catch (error) {
        console.warn(`Failed to remove ${dir}:`, error);
      }
    }
  }

  cleanupTestDirectoriesSync(): void {
    const fixturesDir = join(__dirname, '../fixtures');
    
    if (!existsSync(fixturesDir)) {
      return;
    }

    try {
      const entries = readdirSync(fixturesDir);
      const testDirs = entries.filter(entry => entry.startsWith('test-mock-'));
      
      for (const dir of testDirs) {
        const fullPath = join(fixturesDir, dir);
        try {
          if (existsSync(fullPath)) {
            rmSync(fullPath, { recursive: true, force: true });
          }
        } catch (error) {
          console.error("Error when cleaning tests directories: ", error.message ?? error)
        }
      }
    } catch (error) {
      console.error("Error when cleaning tests directories: ", error.message ?? error)
    }
  }

  async cleanupRunningServers(): Promise<void> {
    try {
      execSync('pkill -f "fake-end" || pkill -f "src/cli/index.ts" || true', { stdio: 'pipe' });
    } catch (error) {
      console.error("Error when cleaning running servers: ", error.message ?? error)
    }
  }

  cleanupRunningServersSync(): void {
    try {
      execSync('pkill -f "fake-end" || pkill -f "src/cli/index.ts" || true', { stdio: 'pipe' });
    } catch (error) {
      console.error("Error when cleaning running servers sync: ", error.message ?? error)
    }
  }

  async cleanupOldTestDirectories(maxAgeMs: number = 24 * 60 * 60 * 1000): Promise<void> {
    const fixturesDir = join(__dirname, '../fixtures');
    
    if (!existsSync(fixturesDir)) {
      return;
    }

    const now = Date.now();
    const entries = readdirSync(fixturesDir);
    const testDirs = entries.filter(entry => entry.startsWith('test-mock-'));
    
    let cleanedCount = 0;
    
    for (const dir of testDirs) {
      const fullPath = join(fixturesDir, dir);
      try {
        const stats = statSync(fullPath);
        const ageMs = now - stats.ctimeMs;
        
        if (ageMs > maxAgeMs) {
          rmSync(fullPath, { recursive: true, force: true });
          cleanedCount++;
        }
      } catch (error) {
        console.warn(`Failed to check/remove old directory ${dir}:`, error);
      }
    }
    
    if (cleanedCount > 0) {
      console.log(`🧹 Cleaned up ${cleanedCount} old test directories`);
    }
  }

  async forceCleanupAll(): Promise<void> {
    console.log('🧹 Starting force cleanup of all test resources...');
    
    try {
      await this.cleanupRunningServers();
      await this.cleanupTestDirectories();
      
      const fixturesDir = join(__dirname, '../fixtures');
      if (existsSync(fixturesDir)) {
        const entries = readdirSync(fixturesDir);
        
        const tempFiles = entries.filter(entry => 
          entry.includes('temp') || 
          entry.includes('test') ||
          entry.match(/^\d+/)
        );
        
        for (const file of tempFiles) {
          const fullPath = join(fixturesDir, file);
          try {
            const stats = statSync(fullPath);
            if (stats.isDirectory()) {
              rmSync(fullPath, { recursive: true, force: true });
            } else {
              rmSync(fullPath, { force: true });
            }
          } catch (error) {
            console.error("Error when trying to force clean all: ", error.message ?? error)
          }
        }
      }
      
      console.log('✅ Force cleanup completed');
    } catch (error) {
      console.error('❌ Force cleanup failed:', error);
    }
  }
}

export const cleanupManager = CleanupManager.getInstance();
