import { CurlInfo, ResponseStrategy } from '@/mock-generation/types';
import { log } from '@/shared/utils/logger';

export abstract class ResponseGenerationStrategy implements ResponseStrategy {
  abstract generateResponse(
    curlInfo: CurlInfo
  ): Record<string, unknown> | Array<unknown> | string | number | boolean | Promise<Record<string, unknown> | Array<unknown> | string | number | boolean>;

  protected isValidResponse(response: unknown): boolean {
    return response !== null && response !== undefined;
  }

  protected logGenerationStart(type: string): void {
    log(`🔄 Starting ${type} response generation...`);
  }
}
