import { execSync } from 'child_process';
import { existsSync, mkdirSync } from 'fs';
import path from 'path';
import { cleanupManager } from './utils/cleanup-manager';

export default async function globalSetup(): Promise<void> {
  console.log('🚀 Setting up global test environment...');
  
  cleanupManager.registerCleanupHandlers();
  
  await cleanupManager.cleanupOldTestDirectories(24 * 60 * 60 * 1000);
  
  const fixturesDir = path.join(__dirname, 'fixtures');
  if (!existsSync(fixturesDir)) {
    mkdirSync(fixturesDir, { recursive: true });
  }

  const distDir = path.join(__dirname, '../dist');
  if (!existsSync(distDir)) {
    console.log('Building project for E2E tests...');
    try {
      execSync('bun run build', { 
        cwd: path.join(__dirname, '..'), 
        stdio: 'pipe' 
      });
    } catch (err) {
      console.error('Failed to build project:', err);
      throw err;
    }
  }

  process.env.NODE_ENV = 'test';
  process.env.TEST_MODE = 'true';
  
  console.log('✅ Global test setup complete');
}
