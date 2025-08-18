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

import chalk from 'chalk';
const mockChalkRed = chalk.red as jest.MockedFunction<typeof chalk.red>;

describe('CLI Index', () => {
  let mockProgram: jest.Mocked<Command>;
  let mockCommand: jest.Mocked<Command>;
  let consoleErrorSpy: jest.SpyInstance;
  let processExitSpy: jest.SpyInstance;

  beforeEach(() => {
    jest.clearAllMocks();
    
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
    processExitSpy = jest.spyOn(process, 'exit').mockImplementation(() => {
      throw new Error('process.exit');
    });

    mockCommand = {
      name: jest.fn().mockReturnThis(),
      description: jest.fn().mockReturnThis(),
      version: jest.fn().mockReturnThis(),
      command: jest.fn().mockReturnThis(),
      option: jest.fn().mockReturnThis(),
      action: jest.fn().mockReturnThis(),
      parse: jest.fn().mockReturnThis()
    } as any;

    mockProgram = {
      name: jest.fn().mockReturnThis(),
      description: jest.fn().mockReturnThis(),
      version: jest.fn().mockReturnThis(),
      command: jest.fn().mockReturnValue(mockCommand),
      parse: jest.fn()
    } as any;

    (Command as jest.MockedClass<typeof Command>).mockImplementation(() => mockProgram);
     
    mockChalkRed.mockImplementation((...args: any[]) => `RED: ${args[0]}`);
  });

  afterEach(() => {
    consoleErrorSpy.mockRestore();
    processExitSpy.mockRestore();
  });

  describe('Program Setup', () => {
    beforeEach(() => {
      jest.isolateModules(() => {
        require('../index');
      });
    });

    it('should configure program and register commands', () => {
      expect(Command).toHaveBeenCalled();
      expect(mockProgram.name).toHaveBeenCalledWith('fake-end');
      expect(mockProgram.description).toHaveBeenCalledWith('A modern CLI tool for mocking backend APIs using YAML files');
      expect(mockProgram.version).toHaveBeenCalledWith('1.0.0');
      expect(mockProgram.command).toHaveBeenCalledWith('run');
      expect(mockProgram.command).toHaveBeenCalledWith('generate');
      expect(mockProgram.parse).toHaveBeenCalled();
    });
  });

  describe('Run Command', () => {
    let runActionCallback: (options: any) => Promise<void>;

    beforeEach(() => {
      jest.isolateModules(() => {
        require('../index');
      });
      const actionCalls = mockCommand.action.mock.calls;
      // @ts-ignore - Test mock callback typing
      runActionCallback = actionCalls[0]?.[0];
    });

    it('should configure run command correctly', () => {
      expect(mockCommand.description).toHaveBeenCalledWith('Start the mock server');
      expect(mockCommand.option).toHaveBeenCalledWith('-p, --port <port>', 'Port to run the server on', '4000');
      expect(mockCommand.option).toHaveBeenCalledWith('-d, --dir <directory>', 'Directory containing mock YAML files', 'mock_server');
      expect(mockCommand.option).toHaveBeenCalledWith('-v, --verbose', 'Enable verbose logging');
    });

    it('should call startServer with parsed options', async () => {
      mockStartServer.mockResolvedValue();

      await runActionCallback({ port: '3000', dir: 'test_dir', verbose: true });
      expect(mockStartServer).toHaveBeenCalledWith({ port: 3000, mockDir: 'test_dir', verbose: true, noCache: false, dynamicMocks: false });

      await runActionCallback({ port: '4000', dir: 'mock_server' });
      expect(mockStartServer).toHaveBeenCalledWith({ port: 4000, mockDir: 'mock_server', verbose: false, noCache: false, dynamicMocks: false });
    });

    it('should handle startServer errors', async () => {
      const error = new Error('Server start failed');
      mockStartServer.mockRejectedValue(error);

      await expect(runActionCallback({ port: '4000', dir: 'mock_server' })).rejects.toThrow('process.exit');
      expect(consoleErrorSpy).toHaveBeenCalledWith('RED: Error starting server:', error);
      expect(processExitSpy).toHaveBeenCalledWith(1);
    });
  });

  describe('Generate Command', () => {
    let generateActionCallback: (options: any) => Promise<void>;

    beforeEach(() => {
      jest.isolateModules(() => {
        require('../index');
      });
      const actionCalls = mockCommand.action.mock.calls;
      // @ts-ignore - Test mock callback typing
      generateActionCallback = actionCalls[1]?.[0];
    });

    it('should configure generate command correctly', () => {
      const descriptionCalls = mockCommand.description.mock.calls;
      expect(descriptionCalls).toContainEqual(['Generate TypeScript interface mock files from cURL commands (use --yaml for YAML format)']);
      expect(mockCommand.option).toHaveBeenCalledWith('-c, --curl <curl>', 'cURL command to analyze and mock');
      expect(mockCommand.option).toHaveBeenCalledWith('-o, --output <output>', 'Output directory for generated mock files', 'mock_server');
      expect(mockCommand.option).toHaveBeenCalledWith('--yaml', 'Generate YAML files instead of TypeScript interfaces (default: TypeScript)');
      expect(mockCommand.option).toHaveBeenCalledWith('--ollama-model <model>', 'Ollama model to use', 'qwen2.5-coder:0.5b');
    });

    it('should call generateMockFromCurl with various options', async () => {
      mockGenerateMockFromCurl.mockResolvedValue();

      await generateActionCallback({ curl: 'curl -X GET http://example.com', output: 'test_output' });
      expect(mockGenerateMockFromCurl).toHaveBeenCalledWith({ curl: 'curl -X GET http://example.com', mockStrategy: "sanitize", output: 'test_output' });

      await generateActionCallback({ file: 'curl-commands.txt', ollama: true });
      expect(mockGenerateMockFromCurl).toHaveBeenCalledWith({ file: 'curl-commands.txt', mockStrategy: "sanitize", ollama: true });
    });

    it('should handle generateMockFromCurl errors', async () => {
      const error = new Error('Generation failed');
      mockGenerateMockFromCurl.mockRejectedValue(error);

      await expect(generateActionCallback({ output: 'mock_server' })).rejects.toThrow('process.exit');
      expect(consoleErrorSpy).toHaveBeenCalledWith('RED: Error generating mock:', error);
      expect(processExitSpy).toHaveBeenCalledWith(1);
    });
  });

  describe('Error Handling and Integration', () => {
    it('should handle synchronous errors in both commands', async () => {
      jest.isolateModules(() => {
        require('../index');
      });
      
      const actionCalls = mockCommand.action.mock.calls;
      // @ts-ignore - Test mock callback typing
      const runActionCallback = actionCalls[0]?.[0];
      // @ts-ignore - Test mock callback typing  
      const generateActionCallback = actionCalls[1]?.[0];

      mockStartServer.mockImplementation(() => { throw new Error('Sync error'); });
      await expect(runActionCallback({ port: 'invalid', dir: 'test' })).rejects.toThrow('process.exit');

      mockGenerateMockFromCurl.mockImplementation(() => { throw new Error('Sync generation error'); });
      await expect(generateActionCallback({ output: 'test' })).rejects.toThrow('process.exit');
      
      expect(processExitSpy).toHaveBeenCalledTimes(2);
    });

    it('should maintain correct command registration order', () => {
      jest.isolateModules(() => {
        require('../index');
      });

      const commandCalls = mockProgram.command.mock.calls;
      expect(commandCalls[0][0]).toBe('run');
      expect(commandCalls[1][0]).toBe('generate');
    });
  });
});
