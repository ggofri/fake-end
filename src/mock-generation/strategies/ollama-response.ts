import { CurlInfo } from '@/mock-generation/types';
import { ResponseGenerationStrategy } from './base';
import { generateResponseWithOllama } from '@/mock-generation/utils/ollama';
import { log } from '@/shared/utils/logger';

export class OllamaResponseStrategy extends ResponseGenerationStrategy {
  constructor(
    private ollamaHost: string,
    private ollamaModel: string
  ) {
    super();
  }

  async generateResponse(curlInfo: CurlInfo): Promise<Record<string, unknown> | Array<unknown> | string | number | boolean> {
    this.logGenerationStart('Ollama');
    log(`🤖 Generating response using Ollama (${this.ollamaModel})...`);
    
    if (!this.isValidResponse(curlInfo)) {
      throw new Error('Invalid curl info provided for Ollama generation');
    }
    
    return await generateResponseWithOllama(curlInfo, this.ollamaHost, this.ollamaModel);
  }
}
