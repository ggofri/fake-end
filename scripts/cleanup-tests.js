#!/usr/bin/env node

const { existsSync, rmSync, readdirSync } = require('fs');
const { join } = require('path');
const { execSync } = require('child_process');

async function cleanup() {
  console.log('🧹 Starting cleanup of test artifacts...\n');

  let totalCleaned = 0;

  const fixturesDir = join(__dirname, '../tests/fixtures');
  
  if (existsSync(fixturesDir)) {
    console.log('📁 Cleaning test fixtures directory...');
    
    const entries = readdirSync(fixturesDir);
    const testDirs = entries.filter(entry => entry.startsWith('test-mock-'));
    
    if (testDirs.length > 0) {
      console.log(`   Found ${testDirs.length} temporary test directories`);
      
      for (const dir of testDirs) {
        const fullPath = join(fixturesDir, dir);
        try {
          rmSync(fullPath, { recursive: true, force: true });
          totalCleaned++;
          process.stdout.write('.');
        } catch (error) {
          console.warn(`\n   ⚠️  Failed to remove ${dir}: ${error.message}`);
        }
      }
      console.log(`\n   ✅ Cleaned ${totalCleaned} directories`);
    } else {
      console.log('   ✅ No temporary test directories found');
    }
  }

  console.log('\n🔪 Killing any running fake-end processes...');
  try {
    execSync('pkill -f "fake-end" 2>/dev/null || pkill -f "bin.js" 2>/dev/null || true', { stdio: 'pipe' });
    console.log('   ✅ Process cleanup completed');
  } catch (error) {
    console.log('   ✅ No running processes found');
  }

  console.log('\n📊 Cleanup Summary:');
  console.log(`   🗂️  Directories cleaned: ${totalCleaned}`);
  console.log(`   💾  Space reclaimed: ~${(totalCleaned * 0.1).toFixed(1)} MB (estimated)`);
  
  if (totalCleaned === 0) {
    console.log('\n🎉 Everything was already clean!');
  } else {
    console.log('\n✨ Cleanup completed successfully!');
  }
}

cleanup().catch(error => {
  console.error('❌ Cleanup failed:', error);
  process.exit(1);
});
