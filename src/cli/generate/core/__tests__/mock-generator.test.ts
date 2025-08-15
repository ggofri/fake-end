import { MockGenerator } from '../mock-generator';
import type { 
  MockGeneratorDependencies, 
  GenerateOptions, 
  CurlInfo, 
  MockEndpoint,
  Logger,
  CurlProcessor,
  ExecutionDecider,
  ResponseGenerator,
  EndpointFactory,
  FileManager
} from '../../types';
import { parseCurlCommand, executeCurlCommand } from '../../utils/';

jest.mock('../../utils/', () => ({
  parseCurlCommand: jest.fn(),
  executeCurlCommand: jest.fn()
}));

const mockParseCurlCommand = parseCurlCommand as jest.MockedFunction<typeof parseCurlCommand>;
const mockExecuteCurlCommand = executeCurlCommand as jest.MockedFunction<typeof executeCurlCommand>;

describe('MockGenerator', () => {
  let mockDependencies: MockGeneratorDependencies;
  let mockGenerator: MockGenerator;

  const mockCurlInfo: CurlInfo = {
    method: 'GET',
    url: 'https://api.example.com/users',
    headers: { 'Accept': 'application/json' },
    path: '/users',
    queryParams: {}
  };

  const mockOptions: GenerateOptions = {
    output: './mocks',
    ollamaModel: 'llama2',
    ollamaHost: 'localhost:11434'
  };

  const mockEndpoint: MockEndpoint = {
    method: 'GET',
    path: '/users',
    status: 200,
    body: { users: [] }
  };

  beforeEach(() => {
    mockDependencies = {
      logger: {
        logAnalyzing: jest.fn(),
        logParsed: jest.fn(),
        logExecuting: jest.fn(),
        logSuccess: jest.fn()
      } as Logger,
      curlProcessor: {
        getCurlCommand: jest.fn()
      } as CurlProcessor,
      executionDecider: {
        shouldExecuteCurl: jest.fn()
      } as ExecutionDecider,
      responseGenerator: {
        generateResponse: jest.fn()
      } as ResponseGenerator,
      endpointFactory: {
        create: jest.fn()
      } as EndpointFactory,
      fileManager: {
        ensureOutputDirectory: jest.fn(),
        writeEndpointFile: jest.fn()
      } as FileManager
    };

    mockGenerator = new MockGenerator(mockDependencies);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('generateMock', () => {
    it('should generate mock without executing curl when execution is disabled', async () => {
      const curlCommand = 'curl -X GET https://api.example.com/users';
      const mockResponse = { users: [] };
      const filePath = './mocks/users.yaml';

      (mockDependencies.curlProcessor.getCurlCommand as jest.Mock).mockResolvedValue(curlCommand);
      mockParseCurlCommand.mockReturnValue(mockCurlInfo);
      (mockDependencies.executionDecider.shouldExecuteCurl as jest.Mock).mockResolvedValue(false);
      (mockDependencies.responseGenerator.generateResponse as jest.Mock).mockResolvedValue(mockResponse);
      (mockDependencies.endpointFactory.create as jest.Mock).mockReturnValue(mockEndpoint);
      (mockDependencies.fileManager.ensureOutputDirectory as jest.Mock).mockResolvedValue(undefined);
      (mockDependencies.fileManager.writeEndpointFile as jest.Mock).mockResolvedValue(filePath);

      await mockGenerator.generateMock(mockOptions);

      expect(mockDependencies.logger.logAnalyzing).toHaveBeenCalledTimes(1);
      expect(mockDependencies.curlProcessor.getCurlCommand).toHaveBeenCalledWith(mockOptions);
      expect(mockParseCurlCommand).toHaveBeenCalledWith(curlCommand);
      expect(mockDependencies.logger.logParsed).toHaveBeenCalledWith('GET', '/users');
      expect(mockDependencies.executionDecider.shouldExecuteCurl).toHaveBeenCalledWith(mockOptions);
      expect(mockExecuteCurlCommand).not.toHaveBeenCalled();
      expect(mockDependencies.responseGenerator.generateResponse).toHaveBeenCalledWith(mockCurlInfo, null, mockOptions);
      expect(mockDependencies.endpointFactory.create).toHaveBeenCalledWith(mockCurlInfo, mockResponse, mockOptions.output);
      expect(mockDependencies.fileManager.ensureOutputDirectory).toHaveBeenCalledWith(mockOptions.output);
      expect(mockDependencies.fileManager.writeEndpointFile).toHaveBeenCalledWith(mockCurlInfo, mockOptions.output, mockEndpoint);
      expect(mockDependencies.logger.logSuccess).toHaveBeenCalledWith(filePath, mockEndpoint);
    });

    it('should generate mock with executing curl when execution is enabled', async () => {
      const curlCommand = 'curl -X GET https://api.example.com/users';
      const actualResponse = '{"users": [{"id": 1, "name": "John"}]}';
      const mockResponse = { users: [{ id: 1, name: 'John' }] };
      const filePath = './mocks/users.yaml';

      (mockDependencies.curlProcessor.getCurlCommand as jest.Mock).mockResolvedValue(curlCommand);
      mockParseCurlCommand.mockReturnValue(mockCurlInfo);
      (mockDependencies.executionDecider.shouldExecuteCurl as jest.Mock).mockResolvedValue(true);
      mockExecuteCurlCommand.mockResolvedValue(actualResponse);
      (mockDependencies.responseGenerator.generateResponse as jest.Mock).mockResolvedValue(mockResponse);
      (mockDependencies.endpointFactory.create as jest.Mock).mockReturnValue(mockEndpoint);
      (mockDependencies.fileManager.ensureOutputDirectory as jest.Mock).mockResolvedValue(undefined);
      (mockDependencies.fileManager.writeEndpointFile as jest.Mock).mockResolvedValue(filePath);

      await mockGenerator.generateMock(mockOptions);

      expect(mockDependencies.logger.logAnalyzing).toHaveBeenCalledTimes(1);
      expect(mockDependencies.logger.logExecuting).toHaveBeenCalledTimes(1);
      expect(mockExecuteCurlCommand).toHaveBeenCalledWith(curlCommand);
      expect(mockDependencies.responseGenerator.generateResponse).toHaveBeenCalledWith(mockCurlInfo, actualResponse, mockOptions);
    });

    it('should throw error when curl processing fails', async () => {
      const errorMessage = 'Invalid curl command';
      (mockDependencies.curlProcessor.getCurlCommand as jest.Mock).mockRejectedValue(new Error(errorMessage));

      await expect(mockGenerator.generateMock(mockOptions)).rejects.toThrow(`Failed to generate mock: ${errorMessage}`);
    });

    it('should throw error when curl parsing fails', async () => {
      const curlCommand = 'invalid curl command';
      const errorMessage = 'Failed to parse curl command';

      (mockDependencies.curlProcessor.getCurlCommand as jest.Mock).mockResolvedValue(curlCommand);
      mockParseCurlCommand.mockImplementation(() => {
        throw new Error(errorMessage);
      });

      await expect(mockGenerator.generateMock(mockOptions)).rejects.toThrow(`Failed to generate mock: ${errorMessage}`);
    });

    it('should throw error when curl execution fails', async () => {
      const curlCommand = 'curl -X GET https://api.example.com/users';
      const errorMessage = 'Network error';

      (mockDependencies.curlProcessor.getCurlCommand as jest.Mock).mockResolvedValue(curlCommand);
      mockParseCurlCommand.mockReturnValue(mockCurlInfo);
      (mockDependencies.executionDecider.shouldExecuteCurl as jest.Mock).mockResolvedValue(true);
      mockExecuteCurlCommand.mockRejectedValue(new Error(errorMessage));

      await expect(mockGenerator.generateMock(mockOptions)).rejects.toThrow(`Failed to generate mock: ${errorMessage}`);
    });

    it('should throw error when response generation fails', async () => {
      const curlCommand = 'curl -X GET https://api.example.com/users';
      const errorMessage = 'Response generation failed';

      (mockDependencies.curlProcessor.getCurlCommand as jest.Mock).mockResolvedValue(curlCommand);
      mockParseCurlCommand.mockReturnValue(mockCurlInfo);
      (mockDependencies.executionDecider.shouldExecuteCurl as jest.Mock).mockResolvedValue(false);
      (mockDependencies.responseGenerator.generateResponse as jest.Mock).mockRejectedValue(new Error(errorMessage));

      await expect(mockGenerator.generateMock(mockOptions)).rejects.toThrow(`Failed to generate mock: ${errorMessage}`);
    });

    it('should throw error when file operations fail', async () => {
      const curlCommand = 'curl -X GET https://api.example.com/users';
      const mockResponse = { users: [] };
      const errorMessage = 'Directory creation failed';

      (mockDependencies.curlProcessor.getCurlCommand as jest.Mock).mockResolvedValue(curlCommand);
      mockParseCurlCommand.mockReturnValue(mockCurlInfo);
      (mockDependencies.executionDecider.shouldExecuteCurl as jest.Mock).mockResolvedValue(false);
      (mockDependencies.responseGenerator.generateResponse as jest.Mock).mockResolvedValue(mockResponse);
      (mockDependencies.endpointFactory.create as jest.Mock).mockReturnValue(mockEndpoint);
      (mockDependencies.fileManager.ensureOutputDirectory as jest.Mock).mockRejectedValue(new Error(errorMessage));

      await expect(mockGenerator.generateMock(mockOptions)).rejects.toThrow(`Failed to generate mock: ${errorMessage}`);
    });

    it('should handle unknown error types', async () => {
      (mockDependencies.curlProcessor.getCurlCommand as jest.Mock).mockRejectedValue('string error');

      await expect(mockGenerator.generateMock(mockOptions)).rejects.toThrow('Failed to generate mock: Unknown error');
    });
  });
});