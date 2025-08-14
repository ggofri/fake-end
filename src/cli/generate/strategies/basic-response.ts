import chalk from 'chalk';
import { CurlInfo } from '@/cli/generate/types';
import { ResponseGenerationStrategy } from './base';
import { generateBasicMockResponse } from '@/cli/generate/utils/mock-generator';

export class BasicResponseStrategy extends ResponseGenerationStrategy {
  generateResponse(curlInfo: CurlInfo): Record<string, unknown> | Array<unknown> | string | number | boolean {
    this.logGenerationStart('basic');
    console.log(chalk.blue('📝 Generating basic mock response...'));
    
    if (!this.isValidResponse(curlInfo)) {
      throw new Error('Invalid curl info provided for basic generation');
    }
    
    return generateBasicMockResponse(curlInfo);
  }
}
