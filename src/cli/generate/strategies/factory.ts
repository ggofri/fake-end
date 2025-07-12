import { GenerateOptions } from '../types';
import { ResponseGenerationStrategy } from './base';
import { ActualResponseStrategy } from './actual-response';
import { OllamaResponseStrategy } from './ollama-response';
import { BasicResponseStrategy } from './basic-response';

export class ResponseStrategyFactory {
  static create(
    actualResponse: string | null,
    options: GenerateOptions
  ): ResponseGenerationStrategy {
    if (actualResponse) {
      return new ActualResponseStrategy(actualResponse);
    } else if (options.ollama) {
      return new OllamaResponseStrategy(options.ollamaHost, options.ollamaModel);
    } else {
      return new BasicResponseStrategy();
    }
  }
}