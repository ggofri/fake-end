import { cleanupManager } from './utils/cleanup-manager';

export default async function globalTeardown(): Promise<void> {
  console.log('🧹 Running global test cleanup...');
  
  await cleanupManager.cleanupTestDirectories();
  
  console.log('✅ Global test cleanup complete');
}