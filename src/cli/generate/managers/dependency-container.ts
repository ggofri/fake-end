import { MockGeneratorDependencies } from '@/cli/generate/types';
import { ConsoleLogger } from './logger';
import { MockEndpointFactory } from './endpoint-factory';
import { FileOutputManager } from './file-output';
import { CurlCommandProcessor, ExecutionDecisionMaker, ResponseGenerator } from '@/cli/generate/processors/';

export class DependencyContainer {
  static create(): MockGeneratorDependencies {
    return {
      logger: new ConsoleLogger(),
      curlProcessor: new CurlCommandProcessor(),
      executionDecider: new ExecutionDecisionMaker(),
      responseGenerator: new ResponseGenerator(),
      endpointFactory: new MockEndpointFactory(),
      fileManager: new FileOutputManager()
    };
  }
}
