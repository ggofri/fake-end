import readline from 'readline';
import { log } from '@/shared/utils/logger';

export async function promptUserForExecution(): Promise<boolean> {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  return new Promise((resolve) => {
    log('\n🤔 How would you like to generate the mock response?');
    log('  1. Execute the cURL command to capture the actual response (recommended)');
    log('  2. Infer the response structure (faster, but less accurate)');
    
    rl.question('\nChoose an option (1/2) [default: 1]: ', (answer) => {
      rl.close();
      
      const choice = answer.trim();
      const shouldNotExecute = choice === '2' || choice.toLowerCase().includes('no')
      
      if (!shouldNotExecute) {
        log('✓ Will execute cURL command to capture actual response');
      } else {
        log('✓ Will infer response structure');
      }
      
      resolve(!shouldNotExecute);
    });
  });
}

export type ReplacementMode = 'full' | 'error' | 'success';

export async function promptUserForReplacement(filePath: string): Promise<ReplacementMode> {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  return new Promise((resolve) => {
    log(`\n⚠️  File already exists: ${filePath}`);
    log('🤔 How would you like to replace it?');
    log('  1. Replace the entire file (default)');
    log('  2. Replace only the error response (--error flag)');
    log('  3. Replace only the success response (--success flag)');
    
    rl.question('\nChoose an option (1/2/3) [default: 1]: ', (answer) => {
      rl.close();
      
      const choice = answer.trim();
      let mode: ReplacementMode = 'full';
      
      if (choice === '2' || choice.toLowerCase().includes("error")) {
        mode = 'error';
        log('✓ Will replace only the error response');
      } else if (choice === '3' || choice.toLowerCase().includes("success")) {
        mode = 'success';
        log('✓ Will replace only the success response');
      } else {
        log('✓ Will replace the entire file');
      }
      
      resolve(mode);
    });
  });
}
