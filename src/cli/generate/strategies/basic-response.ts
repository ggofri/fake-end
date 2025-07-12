import chalk from 'chalk';
import { CurlInfo } from '../types';
import { ResponseGenerationStrategy } from './base';
import { generateBasicMockResponse } from '../utils/mock-generator';

export class BasicResponseStrategy extends ResponseGenerationStrategy {
  async generateResponse(curlInfo: CurlInfo): Promise<Record<string, unknown> | Array<unknown> | string | number | boolean> {
    this.logGenerationStart('basic');
    console.log(chalk.blue('📝 Generating basic mock response...'));
    
    if (!this.isValidResponse(curlInfo)) {
      throw new Error('Invalid curl info provided for basic generation');
    }
    
    return generateBasicMockResponse(curlInfo);
  }
}