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
      
      const choice = answer.trim() ?? '1';
      const shouldExecute = choice === '1' || choice.toLowerCase() === 'execute' || choice.toLowerCase() === 'e';
      
      if (shouldExecute) {
        console.log(chalk.green('✓ Will execute cURL command to capture actual response'));
      } else {
        console.log(chalk.blue('✓ Will infer response structure'));
      }
      
      resolve(shouldExecute);
    });
  });
}
