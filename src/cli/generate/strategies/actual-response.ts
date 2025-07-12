import chalk from 'chalk';
import { ResponseGenerationStrategy } from './base';

export class ActualResponseStrategy extends ResponseGenerationStrategy {
  constructor(private actualResponse: string) {
    super();
  }

  async generateResponse(): Promise<Record<string, unknown> | Array<unknown> | string | number | boolean> {
    this.logGenerationStart('actual');
    console.log(chalk.green('✓ Using actual response from cURL execution'));
    
    if (!this.isValidResponse(this.actualResponse)) {
      throw new Error('Invalid actual response provided');
    }
    
    try {
      return JSON.parse(this.actualResponse);
    } catch {
      return this.actualResponse;
    }
  }
}