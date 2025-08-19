import readline from 'readline';
import chalk from 'chalk';

export async function promptUserForExecution(): Promise<boolean> {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  return new Promise((resolve) => {
    console.log(chalk.cyan('\n🤔 How would you like to generate the mock response?'));
    console.log(chalk.white('  1. Execute the cURL command to capture the actual response (recommended)'));
    console.log(chalk.white('  2. Infer the response structure (faster, but less accurate)'));
    
    rl.question(chalk.yellow('\nChoose an option (1/2) [default: 1]: '), (answer) => {
      rl.close();
      
      const choice = answer.trim();
      const shouldNotExecute = choice === '2' || choice.toLowerCase().includes('no')
      
      if (!shouldNotExecute) {
        console.log(chalk.green('✓ Will execute cURL command to capture actual response'));
      } else {
        console.log(chalk.blue('✓ Will infer response structure'));
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
    console.log(chalk.yellow(`\n⚠️  File already exists: ${filePath}`));
    console.log(chalk.cyan('🤔 How would you like to replace it?'));
    console.log(chalk.white('  1. Replace the entire file (default)'));
    console.log(chalk.white('  2. Replace only the error response (--error flag)'));
    console.log(chalk.white('  3. Replace only the success response (--success flag)'));
    
    rl.question(chalk.yellow('\nChoose an option (1/2/3) [default: 1]: '), (answer) => {
      rl.close();
      
      const choice = answer.trim();
      let mode: ReplacementMode = 'full';
      
      if (choice === '2' || choice.toLowerCase().includes("error")) {
        mode = 'error';
        console.log(chalk.green('✓ Will replace only the error response'));
      } else if (choice === '3' || choice.toLowerCase().includes("success")) {
        mode = 'success';
        console.log(chalk.green('✓ Will replace only the success response'));
      } else {
        console.log(chalk.green('✓ Will replace the entire file'));
      }
      
      resolve(mode);
    });
  });
}
