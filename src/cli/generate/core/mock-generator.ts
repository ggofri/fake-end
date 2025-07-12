import { GenerateOptions, MockGeneratorDependencies } from '../types';
import { parseCurlCommand, executeCurlCommand } from '../utils/';

export class MockGenerator {
  constructor(private dependencies: MockGeneratorDependencies) {}

  async generateMock(options: GenerateOptions): Promise<void> {
    const {
      logger,
      curlProcessor,
      executionDecider,
      responseGenerator,
      endpointFactory,
      fileManager
    } = this.dependencies;

    try {
      logger.logAnalyzing();
      
      const curlCommand = await curlProcessor.getCurlCommand(options);
      const curlInfo = parseCurlCommand(curlCommand);
      
      logger.logParsed(curlInfo.method, curlInfo.path);

      const shouldExecute = await executionDecider.shouldExecuteCurl(options);
      
      let actualResponse: string | null = null;
      if (shouldExecute) {
        logger.logExecuting();
        actualResponse = await executeCurlCommand(curlCommand);
      }
      
      const mockResponse = await responseGenerator.generateResponse(curlInfo, actualResponse, options);
      const mockEndpoint = endpointFactory.create(curlInfo, mockResponse, options.output);

      await fileManager.ensureOutputDirectory(options.output);
      const filePath = await fileManager.writeEndpointFile(curlInfo, options.output, mockEndpoint);
      
      logger.logSuccess(filePath, mockEndpoint);

    } catch (error) {
      throw new Error(`Failed to generate mock: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}