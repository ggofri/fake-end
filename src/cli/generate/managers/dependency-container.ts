import { MockGeneratorDependencies, GenerateOptions } from '@/cli/generate/types';
import { ConsoleLogger } from './logger';
import { MockEndpointFactory } from './endpoint-factory';
import { FileOutputManager } from './file-output';
import { TypeScriptFileManager } from './typescript-file-manager';
import { CurlCommandProcessor, ExecutionDecisionMaker, ResponseGenerator } from '@/cli/generate/processors/';

export class DependencyContainer {
  static create(options?: Pick<GenerateOptions, 'yaml' | 'mockStrategy' | 'error' | 'success'>): MockGeneratorDependencies {
    const useYamlFormat = options?.yaml === true;
    const errorMode = options?.error === true;
    const successMode = options?.success === true;
    
    return {
      logger: new ConsoleLogger(),
      curlProcessor: new CurlCommandProcessor(),
      executionDecider: new ExecutionDecisionMaker(),
      responseGenerator: new ResponseGenerator(),
      endpointFactory: new MockEndpointFactory(),
      fileManager: useYamlFormat ? new FileOutputManager() : new TypeScriptFileManager(useYamlFormat, errorMode, successMode)
    };
  }
}
