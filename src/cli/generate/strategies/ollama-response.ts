import chalk from 'chalk';
import { CurlInfo } from '../types';
import { ResponseGenerationStrategy } from './base';
import { generateResponseWithOllama } from '../utils/ollama';

export class OllamaResponseStrategy extends ResponseGenerationStrategy {
  constructor(
    private ollamaHost: string,
    private ollamaModel: string
  ) {
    super();
  }

  async generateResponse(curlInfo: CurlInfo): Promise<Record<string, unknown> | Array<unknown> | string | number | boolean> {
    this.logGenerationStart('Ollama');
    console.log(chalk.blue(`🤖 Generating response using Ollama (${this.ollamaModel})...`));
    
    if (!this.isValidResponse(curlInfo)) {
      throw new Error('Invalid curl info provided for Ollama generation');
    }
    
    return await generateResponseWithOllama(curlInfo, this.ollamaHost, this.ollamaModel);
  }
}