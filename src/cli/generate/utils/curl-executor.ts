import { exec } from 'child_process';
import { promisify } from 'util';
import chalk from 'chalk';

const execAsync = promisify(exec);

export async function executeCurlCommand(curlCommand: string): Promise<string | null> {
  try {
    const cleanedCommand = curlCommand
      .replace(/\\\s*\n\s*/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();

    console.log(chalk.gray(`   Running: ${cleanedCommand.substring(0, 100)}${cleanedCommand.length > 100 ? '...' : ''}`));
    
    const { stdout, stderr } = await execAsync(cleanedCommand, {
      timeout: 30000,
      maxBuffer: 1024 * 1024,
    });

    if (stderr && !stdout) {
      console.log(chalk.yellow(`⚠️  cURL stderr: ${stderr.substring(0, 200)}`));
      return null;
    }

    if (!stdout.trim()) {
      console.log(chalk.yellow('⚠️  cURL returned empty response'));
      return null;
    }

    return stdout.trim();
    
  } catch (error) {
    console.log(chalk.yellow(`⚠️  cURL execution failed: ${error instanceof Error ? error.message : 'Unknown error'}`));
    return null;
  }
}