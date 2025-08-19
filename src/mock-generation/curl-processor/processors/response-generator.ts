import { CurlInfo, GenerateOptions, ResponseGenerator as IResponseGenerator } from '@/mock-generation/types';
import { ResponseStrategyFactory } from '@/mock-generation/strategies/';

export class ResponseGenerator implements IResponseGenerator {
  async generateResponse(
    curlInfo: CurlInfo,
    actualResponse: string | null,
    options: GenerateOptions
  ): Promise<Record<string, unknown> | Array<unknown> | string | number | boolean> {
    const strategy = ResponseStrategyFactory.create(actualResponse, options);
    return await strategy.generateResponse(curlInfo);
  }
}
