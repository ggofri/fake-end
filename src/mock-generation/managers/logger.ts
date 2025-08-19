import chalk from 'chalk';
import { Logger, MockEndpoint } from '@/mock-generation/types';

export class ConsoleLogger implements Logger {
  logAnalyzing(): void {
    console.log(chalk.blue('🔍 Analyzing cURL command...'));
  }

  logParsed(method: string, path: string): void {
    console.log(chalk.green(`✓ Parsed ${method} request to ${path}`));
  }

  logExecuting(): void {
    console.log(chalk.blue('🚀 Executing cURL command to capture actual response...'));
  }

  logSuccess(filePath: string, endpoint: MockEndpoint): void {
    console.log(chalk.green(`✅ Mock file generated: ${filePath}`));
    console.log(chalk.gray(`   Method: ${endpoint.method}`));
    console.log(chalk.gray(`   Path: ${endpoint.path}`));
    console.log(chalk.gray(`   Status: ${endpoint.status}`));
  }
}
