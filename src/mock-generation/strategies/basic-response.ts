import { CurlInfo } from '@/mock-generation/types';
import { ResponseGenerationStrategy } from './base';
import { generateBasicMockResponse } from '@/mock-generation/utils/mock-generator';
import { log } from '@/shared/utils/logger';

export class BasicResponseStrategy extends ResponseGenerationStrategy {
  generateResponse(curlInfo: CurlInfo): Record<string, unknown> | Array<unknown> | string | number | boolean {
    this.logGenerationStart('basic');
    log('📝 Generating basic mock response...');
    
    if (!this.isValidResponse(curlInfo)) {
      throw new Error('Invalid curl info provided for basic generation');
    }
    
    return generateBasicMockResponse(curlInfo);
  }
}
