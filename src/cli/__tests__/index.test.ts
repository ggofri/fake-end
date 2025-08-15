import { Command } from 'commander';
import { startServer } from '../run';
import { generateMockFromCurl } from '../generate/';

jest.mock('commander');
jest.mock('chalk', () => ({
  red: jest.fn((text: string) => `RED: ${text}`)
}));
jest.mock('../run');
jest.mock('../generate/');

const mockStartServer = startServer as jest.MockedFunction<typeof startServer>;
const mockGenerateMockFromCurl = generateMockFromCurl as jest.MockedFunction<typeof generateMockFromCurl>;

// Import chalk after mocking
import chalk from 'chalk';
const mockChalkRed = chalk.red as jest.MockedFunction<typeof chalk.red>;

describe('CLI Index', () => {
  let mockProgram: jest.Mocked<Command>;
  let mockCommand: jest.Mocked<Command>;
  let consoleErrorSpy: jest.SpyInstance;
  let processExitSpy: jest.SpyInstance;

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Mock console.error and process.exit
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
    processExitSpy = jest.spyOn(process, 'exit').mockImplementation(() => {
      throw new Error('process.exit'); // Prevent actual exit in tests
    });

    // Create mock command instance
    mockCommand = {
      name: jest.fn().mockReturnThis(),
      description: jest.fn().mockReturnThis(),
      version: jest.fn().mockReturnThis(),
      command: jest.fn().mockReturnThis(),
      option: jest.fn().mockReturnThis(),
      action: jest.fn().mockReturnThis(),
      parse: jest.fn().mockReturnThis()
    } as any;

    // Create mock program
    mockProgram = {
      name: jest.fn().mockReturnThis(),
      description: jest.fn().mockReturnThis(),
      version: jest.fn().mockReturnThis(),
      command: jest.fn().mockReturnValue(mockCommand),
      parse: jest.fn()
    } as any;

    // Mock Commander constructor
    (Command as jest.MockedClass<typeof Command>).mockImplementation(() => mockProgram);

    // Mock chalk
    mockChalkRed.mockImplementation((text: string) => `RED: ${text}`);
  });

  afterEach(() => {
    consoleErrorSpy.mockRestore();
    processExitSpy.mockRestore();
  });

  describe('Program Setup', () => {
    beforeEach(() => {
      // Re-import the module to trigger setup
      jest.isolateModules(() => {
        require('../index');
      });
    });

    it('should create a new Commander instance', () => {
      expect(Command).toHaveBeenCalled();
    });

    it('should configure program with name, description and version', () => {
      expect(mockProgram.name).toHaveBeenCalledWith('fake-end');
      expect(mockProgram.description).toHaveBeenCalledWith('A modern CLI tool for mocking backend APIs using YAML files');
      expect(mockProgram.version).toHaveBeenCalledWith('1.0.0');
    });

    it('should register run command', () => {
      expect(mockProgram.command).toHaveBeenCalledWith('run');
    });

    it('should register generate command', () => {
      expect(mockProgram.command).toHaveBeenCalledWith('generate');
    });

    it('should call parse on the program', () => {
      expect(mockProgram.parse).toHaveBeenCalled();
    });
  });

  describe('Run Command Configuration', () => {
    let runActionCallback: (options: any) => Promise<void>;

    beforeEach(() => {
      jest.isolateModules(() => {
        require('../index');
      });
      
      // Find the run command configuration calls
      const commandCalls = mockProgram.command.mock.calls;
      const runCommandCall = commandCalls.find(call => call[0] === 'run');
      expect(runCommandCall).toBeDefined();
      
      // Get the action callback
      const actionCalls = mockCommand.action.mock.calls;
      runActionCallback = actionCalls[0][0];
    });

    it('should configure run command with correct description', () => {
      expect(mockCommand.description).toHaveBeenCalledWith('Start the mock server');
    });

    it('should configure run command options', () => {
      expect(mockCommand.option).toHaveBeenCalledWith('-p, --port <port>', 'Port to run the server on', '4000');
      expect(mockCommand.option).toHaveBeenCalledWith('-d, --dir <directory>', 'Directory containing mock YAML files', 'mock_server');
      expect(mockCommand.option).toHaveBeenCalledWith('-v, --verbose', 'Enable verbose logging');
    });

    it('should call startServer with correct options', async () => {
      const options = {
        port: '3000',
        dir: 'test_dir',
        verbose: true
      };

      mockStartServer.mockResolvedValue();

      await runActionCallback(options);

      expect(mockStartServer).toHaveBeenCalledWith({
        port: 3000,
        mockDir: 'test_dir',
        verbose: true
      });
    });

    it('should handle options with default verbose value', async () => {
      const options = {
        port: '4000',
        dir: 'mock_server'
        // verbose is undefined
      };

      mockStartServer.mockResolvedValue();

      await runActionCallback(options);

      expect(mockStartServer).toHaveBeenCalledWith({
        port: 4000,
        mockDir: 'mock_server',
        verbose: false
      });
    });

    it('should parse port as integer', async () => {
      const options = {
        port: '8080',
        dir: 'test_dir',
        verbose: false
      };

      mockStartServer.mockResolvedValue();

      await runActionCallback(options);

      expect(mockStartServer).toHaveBeenCalledWith({
        port: 8080,
        mockDir: 'test_dir',
        verbose: false
      });
    });

    it('should handle startServer errors and exit', async () => {
      const options = {
        port: '4000',
        dir: 'mock_server'
      };

      const error = new Error('Server start failed');
      mockStartServer.mockRejectedValue(error);

      await expect(runActionCallback(options)).rejects.toThrow('process.exit');

      expect(consoleErrorSpy).toHaveBeenCalledWith('RED: Error starting server:', error);
      expect(processExitSpy).toHaveBeenCalledWith(1);
    });
  });

  describe('Generate Command Configuration', () => {
    let generateActionCallback: (options: any) => Promise<void>;

    beforeEach(() => {
      jest.isolateModules(() => {
        require('../index');
      });
      
      // Find the generate command configuration calls
      const commandCalls = mockProgram.command.mock.calls;
      const generateCommandCall = commandCalls.find(call => call[0] === 'generate');
      expect(generateCommandCall).toBeDefined();
      
      // Get the action callback
      const actionCalls = mockCommand.action.mock.calls;
      generateActionCallback = actionCalls[1][0]; // Second action call
    });

    it('should configure generate command with correct description', () => {
      const descriptionCalls = mockCommand.description.mock.calls;
      expect(descriptionCalls).toContainEqual(['Generate YAML mock files from cURL commands']);
    });

    it('should configure generate command options', () => {
      expect(mockCommand.option).toHaveBeenCalledWith('-c, --curl <curl>', 'cURL command to analyze and mock');
      expect(mockCommand.option).toHaveBeenCalledWith('-f, --file <file>', 'File containing cURL command');
      expect(mockCommand.option).toHaveBeenCalledWith('-o, --output <output>', 'Output directory for generated YAML files', 'mock_server');
      expect(mockCommand.option).toHaveBeenCalledWith('--execute', 'Force execution of the cURL command to capture actual response');
      expect(mockCommand.option).toHaveBeenCalledWith('--no-execute', 'Skip execution and infer response structure instead');
      expect(mockCommand.option).toHaveBeenCalledWith('--ollama', 'Use Ollama for AI-powered response generation (only used if --execute fails)');
      expect(mockCommand.option).toHaveBeenCalledWith('--ollama-model <model>', 'Ollama model to use', 'qwen2.5-coder:0.5b');
      expect(mockCommand.option).toHaveBeenCalledWith('--ollama-host <host>', 'Ollama host URL', 'http://localhost:11434');
    });

    it('should call generateMockFromCurl with provided options', async () => {
      const options = {
        curl: 'curl -X GET http://example.com/api/users',
        output: 'test_output',
        execute: true,
        ollama: false,
        ollamaModel: 'custom-model',
        ollamaHost: 'http://custom-host:11434'
      };

      mockGenerateMockFromCurl.mockResolvedValue();

      await generateActionCallback(options);

      expect(mockGenerateMockFromCurl).toHaveBeenCalledWith(options);
    });

    it('should call generateMockFromCurl with file option', async () => {
      const options = {
        file: 'curl-commands.txt',
        output: 'mock_server',
        ollama: true,
        ollamaModel: 'qwen2.5-coder:0.5b',
        ollamaHost: 'http://localhost:11434'
      };

      mockGenerateMockFromCurl.mockResolvedValue();

      await generateActionCallback(options);

      expect(mockGenerateMockFromCurl).toHaveBeenCalledWith(options);
    });

    it('should handle generateMockFromCurl errors and exit', async () => {
      const options = {
        curl: 'curl -X GET http://example.com/api/users',
        output: 'mock_server'
      };

      const error = new Error('Generation failed');
      mockGenerateMockFromCurl.mockRejectedValue(error);

      await expect(generateActionCallback(options)).rejects.toThrow('process.exit');

      expect(consoleErrorSpy).toHaveBeenCalledWith('RED: Error generating mock:', error);
      expect(processExitSpy).toHaveBeenCalledWith(1);
    });

    it('should handle minimal options', async () => {
      const options = {
        output: 'mock_server'
      };

      mockGenerateMockFromCurl.mockResolvedValue();

      await generateActionCallback(options);

      expect(mockGenerateMockFromCurl).toHaveBeenCalledWith(options);
    });

    it('should handle all optional flags', async () => {
      const options = {
        curl: 'curl -X POST http://example.com/api/data',
        file: undefined,
        output: 'custom_output',
        execute: false,
        ollama: true,
        ollamaModel: 'llama2',
        ollamaHost: 'http://remote-ollama:11434'
      };

      mockGenerateMockFromCurl.mockResolvedValue();

      await generateActionCallback(options);

      expect(mockGenerateMockFromCurl).toHaveBeenCalledWith(options);
    });
  });

  describe('Error Handling', () => {
    it('should handle synchronous errors in run command', async () => {
      const options = { port: 'invalid', dir: 'test' };
      
      jest.isolateModules(() => {
        require('../index');
      });
      
      const actionCalls = mockCommand.action.mock.calls;
      const runActionCallback = actionCalls[0][0];

      // Mock startServer to throw synchronously
      mockStartServer.mockImplementation(() => {
        throw new Error('Sync error');
      });

      await expect(runActionCallback(options)).rejects.toThrow('process.exit');
      expect(processExitSpy).toHaveBeenCalledWith(1);
    });

    it('should handle synchronous errors in generate command', async () => {
      const options = { output: 'test' };
      
      jest.isolateModules(() => {
        require('../index');
      });
      
      const actionCalls = mockCommand.action.mock.calls;
      const generateActionCallback = actionCalls[1][0];

      // Mock generateMockFromCurl to throw synchronously
      mockGenerateMockFromCurl.mockImplementation(() => {
        throw new Error('Sync generation error');
      });

      await expect(generateActionCallback(options)).rejects.toThrow('process.exit');
      expect(processExitSpy).toHaveBeenCalledWith(1);
    });
  });

  describe('Option Types', () => {
    it('should handle RunOptions interface', async () => {
      jest.isolateModules(() => {
        require('../index');
      });
      
      const actionCalls = mockCommand.action.mock.calls;
      const runActionCallback = actionCalls[0][0];

      const validRunOptions = {
        port: '3000',
        dir: 'custom_dir',
        verbose: true
      };

      mockStartServer.mockResolvedValue();
      await runActionCallback(validRunOptions);

      expect(mockStartServer).toHaveBeenCalledWith({
        port: 3000,
        mockDir: 'custom_dir',
        verbose: true
      });
    });

    it('should handle GenerateOptions interface', async () => {
      jest.isolateModules(() => {
        require('../index');
      });
      
      const actionCalls = mockCommand.action.mock.calls;
      const generateActionCallback = actionCalls[1][0];

      const validGenerateOptions = {
        curl: 'curl -X GET http://test.com',
        file: 'test.txt',
        output: 'output_dir',
        execute: true,
        ollama: false,
        ollamaModel: 'test-model',
        ollamaHost: 'http://test:11434'
      };

      mockGenerateMockFromCurl.mockResolvedValue();
      await generateActionCallback(validGenerateOptions);

      expect(mockGenerateMockFromCurl).toHaveBeenCalledWith(validGenerateOptions);
    });
  });

  describe('Command Registration Order', () => {
    it('should register commands in correct order', () => {
      jest.isolateModules(() => {
        require('../index');
      });

      const commandCalls = mockProgram.command.mock.calls;
      expect(commandCalls[0][0]).toBe('run');
      expect(commandCalls[1][0]).toBe('generate');
    });

    it('should set up program metadata before adding commands', () => {
      jest.isolateModules(() => {
        require('../index');
      });

      // Check call order - program setup should come before command registration
      const nameCallIndex = mockProgram.name.mock.invocationCallOrder[0];
      const commandCallIndex = mockProgram.command.mock.invocationCallOrder[0];
      
      expect(nameCallIndex).toBeLessThan(commandCallIndex);
    });
  });
});