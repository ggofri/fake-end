import {
  CurlSource,
  OutputConfig,
  ExecutionConfig,
  OllamaConfig,
  GenerateOptions,
  CurlInfo,
  MockEndpoint,
  Logger,
  CurlProcessor,
  ExecutionDecider,
  ResponseStrategy,
  EndpointFactory,
  FileManager,
  MockGeneratorDependencies,
  ResponseGenerator,
  OllamaResponse
} from '../index';

describe('Generate Types Module', () => {
  describe('CurlSource interface', () => {
    it('should accept curl string property', () => {
      const curlSource: CurlSource = {
        curl: 'curl -X GET https://api.example.com/users'
      };

      expect(curlSource.curl).toBe('curl -X GET https://api.example.com/users');
    });

    it('should accept file property', () => {
      const curlSource: CurlSource = {
        file: './curl-commands.txt'
      };

      expect(curlSource.file).toBe('./curl-commands.txt');
    });

    it('should accept both properties', () => {
      const curlSource: CurlSource = {
        curl: 'curl -X GET https://api.example.com/users',
        file: './backup-commands.txt'
      };

      expect(curlSource.curl).toBe('curl -X GET https://api.example.com/users');
      expect(curlSource.file).toBe('./backup-commands.txt');
    });

    it('should accept empty object', () => {
      const curlSource: CurlSource = {};

      expect(curlSource.curl).toBeUndefined();
      expect(curlSource.file).toBeUndefined();
    });
  });

  describe('OutputConfig interface', () => {
    it('should require output property', () => {
      const outputConfig: OutputConfig = {
        output: './mock-output'
      };

      expect(outputConfig.output).toBe('./mock-output');
    });
  });

  describe('ExecutionConfig interface', () => {
    it('should accept execute property as true', () => {
      const executionConfig: ExecutionConfig = {
        execute: true
      };

      expect(executionConfig.execute).toBe(true);
    });

    it('should accept execute property as false', () => {
      const executionConfig: ExecutionConfig = {
        execute: false
      };

      expect(executionConfig.execute).toBe(false);
    });

    it('should accept undefined execute property', () => {
      const executionConfig: ExecutionConfig = {};

      expect(executionConfig.execute).toBeUndefined();
    });
  });

  describe('OllamaConfig interface', () => {
    it('should require ollamaModel and ollamaHost properties', () => {
      const ollamaConfig: OllamaConfig = {
        ollamaModel: 'llama2',
        ollamaHost: 'http://localhost:11434'
      };

      expect(ollamaConfig.ollamaModel).toBe('llama2');
      expect(ollamaConfig.ollamaHost).toBe('http://localhost:11434');
    });

    it('should accept optional ollama property', () => {
      const ollamaConfig: OllamaConfig = {
        ollama: true,
        ollamaModel: 'codellama',
        ollamaHost: 'http://localhost:11434'
      };

      expect(ollamaConfig.ollama).toBe(true);
    });
  });

  describe('GenerateOptions interface', () => {
    it('should extend all config interfaces', () => {
      const generateOptions: GenerateOptions = {
        curl: 'curl -X GET https://api.example.com/users',
        output: './output',
        execute: true,
        ollama: true,
        ollamaModel: 'llama2',
        ollamaHost: 'http://localhost:11434'
      };

      expect(generateOptions.curl).toBe('curl -X GET https://api.example.com/users');
      expect(generateOptions.output).toBe('./output');
      expect(generateOptions.execute).toBe(true);
      expect(generateOptions.ollama).toBe(true);
      expect(generateOptions.ollamaModel).toBe('llama2');
      expect(generateOptions.ollamaHost).toBe('http://localhost:11434');
    });

    it('should accept minimal required properties', () => {
      const generateOptions: GenerateOptions = {
        output: './output',
        ollamaModel: 'llama2',
        ollamaHost: 'http://localhost:11434'
      };

      expect(generateOptions.output).toBe('./output');
      expect(generateOptions.ollamaModel).toBe('llama2');
      expect(generateOptions.ollamaHost).toBe('http://localhost:11434');
    });
  });

  describe('CurlInfo interface', () => {
    it('should contain all required curl information', () => {
      const curlInfo: CurlInfo = {
        method: 'POST',
        url: 'https://api.example.com/users',
        headers: { 'Content-Type': 'application/json' },
        data: '{"name": "John"}',
        path: '/users',
        queryParams: { limit: '10', offset: '0' }
      };

      expect(curlInfo.method).toBe('POST');
      expect(curlInfo.url).toBe('https://api.example.com/users');
      expect(curlInfo.headers).toEqual({ 'Content-Type': 'application/json' });
      expect(curlInfo.data).toBe('{"name": "John"}');
      expect(curlInfo.path).toBe('/users');
      expect(curlInfo.queryParams).toEqual({ limit: '10', offset: '0' });
    });

    it('should accept optional data property', () => {
      const curlInfo: CurlInfo = {
        method: 'GET',
        url: 'https://api.example.com/users',
        headers: {},
        path: '/users',
        queryParams: {}
      };

      expect(curlInfo.data).toBeUndefined();
    });
  });

  describe('MockEndpoint interface', () => {
    it('should accept various body types', () => {
      const objectEndpoint: MockEndpoint = {
        method: 'GET',
        path: '/users',
        status: 200,
        body: { users: [] }
      };

      const arrayEndpoint: MockEndpoint = {
        method: 'GET',
        path: '/items',
        status: 200,
        body: [1, 2, 3]
      };

      const stringEndpoint: MockEndpoint = {
        method: 'GET',
        path: '/message',
        status: 200,
        body: 'Hello World'
      };

      const numberEndpoint: MockEndpoint = {
        method: 'GET',
        path: '/count',
        status: 200,
        body: 42
      };

      const booleanEndpoint: MockEndpoint = {
        method: 'GET',
        path: '/active',
        status: 200,
        body: true
      };

      expect(objectEndpoint.body).toEqual({ users: [] });
      expect(arrayEndpoint.body).toEqual([1, 2, 3]);
      expect(stringEndpoint.body).toBe('Hello World');
      expect(numberEndpoint.body).toBe(42);
      expect(booleanEndpoint.body).toBe(true);
    });

    it('should accept optional properties', () => {
      const endpoint: MockEndpoint = {
        method: 'POST',
        path: '/users',
        status: 201,
        body: { id: 1 },
        headers: { 'Location': '/users/1' },
        delayMs: 1000
      };

      expect(endpoint.headers).toEqual({ 'Location': '/users/1' });
      expect(endpoint.delayMs).toBe(1000);
    });
  });

  describe('Logger interface', () => {
    it('should define all required logging methods', () => {
      const mockLogger: Logger = {
        logAnalyzing: jest.fn(),
        logParsed: jest.fn(),
        logExecuting: jest.fn(),
        logSuccess: jest.fn()
      };

      mockLogger.logAnalyzing();
      mockLogger.logParsed('GET', '/users');
      mockLogger.logExecuting();
      mockLogger.logSuccess('./output/users.yaml', {
        method: 'GET',
        path: '/users',
        status: 200,
        body: []
      });

      expect(mockLogger.logAnalyzing).toHaveBeenCalled();
      expect(mockLogger.logParsed).toHaveBeenCalledWith('GET', '/users');
      expect(mockLogger.logExecuting).toHaveBeenCalled();
      expect(mockLogger.logSuccess).toHaveBeenCalledWith('./output/users.yaml', {
        method: 'GET',
        path: '/users',
        status: 200,
        body: []
      });
    });
  });

  describe('CurlProcessor interface', () => {
    it('should define getCurlCommand method', async () => {
      const mockProcessor: CurlProcessor = {
        getCurlCommand: jest.fn().mockResolvedValue('curl -X GET https://api.example.com/users')
      };

      const result = await mockProcessor.getCurlCommand({ curl: 'test' });

      expect(result).toBe('curl -X GET https://api.example.com/users');
      expect(mockProcessor.getCurlCommand).toHaveBeenCalledWith({ curl: 'test' });
    });
  });

  describe('ExecutionDecider interface', () => {
    it('should define shouldExecuteCurl method', async () => {
      const mockDecider: ExecutionDecider = {
        shouldExecuteCurl: jest.fn().mockResolvedValue(true)
      };

      const result = await mockDecider.shouldExecuteCurl({ execute: true });

      expect(result).toBe(true);
      expect(mockDecider.shouldExecuteCurl).toHaveBeenCalledWith({ execute: true });
    });
  });

  describe('ResponseStrategy interface', () => {
    it('should define generateResponse method for sync response', () => {
      const mockStrategy: ResponseStrategy = {
        generateResponse: jest.fn().mockReturnValue({ data: 'test' })
      };

      const curlInfo: CurlInfo = {
        method: 'GET',
        url: 'https://api.example.com/test',
        headers: {},
        path: '/test',
        queryParams: {}
      };

      const result = mockStrategy.generateResponse(curlInfo);

      expect(result).toEqual({ data: 'test' });
      expect(mockStrategy.generateResponse).toHaveBeenCalledWith(curlInfo);
    });

    it('should define generateResponse method for async response', async () => {
      const mockStrategy: ResponseStrategy = {
        generateResponse: jest.fn().mockResolvedValue({ data: 'async test' })
      };

      const curlInfo: CurlInfo = {
        method: 'GET',
        url: 'https://api.example.com/test',
        headers: {},
        path: '/test',
        queryParams: {}
      };

      const result = await mockStrategy.generateResponse(curlInfo);

      expect(result).toEqual({ data: 'async test' });
      expect(mockStrategy.generateResponse).toHaveBeenCalledWith(curlInfo);
    });
  });

  describe('EndpointFactory interface', () => {
    it('should define create method', () => {
      const mockFactory: EndpointFactory = {
        create: jest.fn().mockReturnValue({
          method: 'GET',
          path: '/test',
          status: 200,
          body: { data: 'test' }
        })
      };

      const curlInfo: CurlInfo = {
        method: 'GET',
        url: 'https://api.example.com/test',
        headers: {},
        path: '/test',
        queryParams: {}
      };

      const result = mockFactory.create(curlInfo, { data: 'test' }, './output');

      expect(result).toEqual({
        method: 'GET',
        path: '/test',
        status: 200,
        body: { data: 'test' }
      });
      expect(mockFactory.create).toHaveBeenCalledWith(curlInfo, { data: 'test' }, './output');
    });
  });

  describe('FileManager interface', () => {
    it('should define required file management methods', async () => {
      const mockFileManager: FileManager = {
        ensureOutputDirectory: jest.fn().mockResolvedValue(undefined),
        writeEndpointFile: jest.fn().mockResolvedValue('./output/test.yaml')
      };

      await mockFileManager.ensureOutputDirectory('./output');
      const filePath = await mockFileManager.writeEndpointFile(
        {
          method: 'GET',
          url: 'https://api.example.com/test',
          headers: {},
          path: '/test',
          queryParams: {}
        },
        './output',
        {
          method: 'GET',
          path: '/test',
          status: 200,
          body: { data: 'test' }
        }
      );

      expect(mockFileManager.ensureOutputDirectory).toHaveBeenCalledWith('./output');
      expect(filePath).toBe('./output/test.yaml');
    });
  });

  describe('MockGeneratorDependencies interface', () => {
    it('should contain all required dependencies', () => {
      const dependencies: MockGeneratorDependencies = {
        logger: {
          logAnalyzing: jest.fn(),
          logParsed: jest.fn(),
          logExecuting: jest.fn(),
          logSuccess: jest.fn()
        },
        curlProcessor: {
          getCurlCommand: jest.fn()
        },
        executionDecider: {
          shouldExecuteCurl: jest.fn()
        },
        responseGenerator: {
          generateResponse: jest.fn()
        },
        endpointFactory: {
          create: jest.fn()
        },
        fileManager: {
          ensureOutputDirectory: jest.fn(),
          writeEndpointFile: jest.fn()
        }
      };

      expect(dependencies.logger).toBeDefined();
      expect(dependencies.curlProcessor).toBeDefined();
      expect(dependencies.executionDecider).toBeDefined();
      expect(dependencies.responseGenerator).toBeDefined();
      expect(dependencies.endpointFactory).toBeDefined();
      expect(dependencies.fileManager).toBeDefined();
    });
  });

  describe('ResponseGenerator interface', () => {
    it('should define generateResponse method with all parameters', async () => {
      const mockGenerator: ResponseGenerator = {
        generateResponse: jest.fn().mockResolvedValue({ generated: 'response' })
      };

      const curlInfo: CurlInfo = {
        method: 'POST',
        url: 'https://api.example.com/users',
        headers: { 'Content-Type': 'application/json' },
        path: '/users',
        queryParams: {}
      };

      const options: GenerateOptions = {
        output: './output',
        ollamaModel: 'llama2',
        ollamaHost: 'http://localhost:11434'
      };

      const result = await mockGenerator.generateResponse(curlInfo, '{"actual": "response"}', options);

      expect(result).toEqual({ generated: 'response' });
      expect(mockGenerator.generateResponse).toHaveBeenCalledWith(
        curlInfo,
        '{"actual": "response"}',
        options
      );
    });

    it('should handle null actual response', async () => {
      const mockGenerator: ResponseGenerator = {
        generateResponse: jest.fn().mockResolvedValue('fallback response')
      };

      const curlInfo: CurlInfo = {
        method: 'GET',
        url: 'https://api.example.com/test',
        headers: {},
        path: '/test',
        queryParams: {}
      };

      const options: GenerateOptions = {
        output: './output',
        ollamaModel: 'llama2',
        ollamaHost: 'http://localhost:11434'
      };

      const result = await mockGenerator.generateResponse(curlInfo, null, options);

      expect(result).toBe('fallback response');
      expect(mockGenerator.generateResponse).toHaveBeenCalledWith(curlInfo, null, options);
    });
  });

  describe('OllamaResponse interface', () => {
    it('should contain response property', () => {
      const ollamaResponse: OllamaResponse = {
        response: 'Generated response from Ollama'
      };

      expect(ollamaResponse.response).toBe('Generated response from Ollama');
    });
  });
});