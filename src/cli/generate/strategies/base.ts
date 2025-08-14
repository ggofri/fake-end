import chalk from 'chalk';
import { CurlInfo, ResponseStrategy } from '@/cli/generate/types';

export abstract class ResponseGenerationStrategy implements ResponseStrategy {
  abstract generateResponse(
    curlInfo: CurlInfo
  ): Record<string, unknown> | Array<unknown> | string | number | boolean | Promise<Record<string, unknown> | Array<unknown> | string | number | boolean>;

  protected isValidResponse(response: unknown): boolean {
    return response !== null && response !== undefined;
  }

  protected logGenerationStart(type: string): void {
    console.log(chalk.blue(`🔄 Starting ${type} response generation...`));
  }
}
