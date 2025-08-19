import { ResponseGenerationStrategy } from './base';
import { isRecordOfStrings } from '@/shared/utils';
import { log } from '@/shared/utils/logger';

export class ActualResponseStrategy extends ResponseGenerationStrategy {
  constructor(private actualResponse: string) {
    super();
  }

  generateResponse(): Record<string, unknown> | Array<unknown> | string | number | boolean {
    this.logGenerationStart('actual');
    log('✓ Using actual response from cURL execution');
    
    if (!this.isValidResponse(this.actualResponse)) {
      throw new Error('Invalid actual response provided');
    }
    
    try {
      const parsedResponse: unknown = JSON.parse(this.actualResponse)

      if (isRecordOfStrings(parsedResponse)) return parsedResponse
      throw new Error("Invalid JSON")
    } catch {
      return this.actualResponse;
    }
  }
}
