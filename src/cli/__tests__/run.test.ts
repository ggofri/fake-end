import { createServer } from '@/server';
import { loadMockEndpoints } from '@/server/loader';
import { ServerOptions } from '@/types';
import { setVerbose, startServerWithPortFallback } from '@/utils';
import { METHOD_PADDING_LENGTH, PORT_RETRY_MAX } from '@/constants';
import { existsSync } from 'fs';
import { startServer } from '../run';
import chalk from 'chalk';

jest.mock('@/server');
jest.mock('@/server/loader');
jest.mock('@/utils');
jest.mock('@/constants');
jest.mock('chalk', () => ({
  red: jest.fn((text: string) => `RED: ${text}`),
  blue: jest.fn((text: string) => `BLUE: ${text}`),
  green: jest.fn((text: string) => `GREEN: ${text}`),
  yellow: jest.fn((text: string) => `YELLOW: ${text}`),
  gray: jest.fn((text: string) => `GRAY: ${text}`),
  white: jest.fn((text: string) => `WHITE: ${text}`),
  magenta: jest.fn((text: string) => `MAGENTA: ${text}`)
}));
jest.mock('fs');

const mockCreateServer = createServer as jest.MockedFunction<typeof createServer>;
const mockLoadMockEndpoints = loadMockEndpoints as jest.MockedFunction<typeof loadMockEndpoints>;
const mockSetVerbose = setVerbose as jest.MockedFunction<typeof setVerbose>;
const mockStartServerWithPortFallback = startServerWithPortFallback as jest.MockedFunction<typeof startServerWithPortFallback>;
const mockExistsSync = existsSync as jest.MockedFunction<typeof existsSync>;


describe('CLI Run', () => {
  let consoleLogSpy: jest.SpyInstance;
  let consoleErrorSpy: jest.SpyInstance;
  let processExitSpy: jest.SpyInstance;

  beforeEach(() => {
    jest.clearAllMocks();
    
    consoleLogSpy = jest.spyOn(console, 'log').mockImplementation();
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
    processExitSpy = jest.spyOn(process, 'exit').mockImplementation(() => {
      throw new Error('process.exit');
    });


    // Mock constants
    (METHOD_PADDING_LENGTH as any) = 8;
    (PORT_RETRY_MAX as any) = 5;
  });

  afterEach(() => {
    consoleLogSpy.mockRestore();
    consoleErrorSpy.mockRestore();
    processExitSpy.mockRestore();
  });

  describe('startServer', () => {
    const mockOptions: ServerOptions = {
      port: 4000,
      mockDir: 'mock_server',
      verbose: false
    };

    const mockEndpoints = [
      { method: 'GET', fullPath: '/api/users', path: '/users' },
      { method: 'POST', fullPath: '/api/users', path: '/users' },
      { method: 'PUT', fullPath: '/api/users/:id', path: '/users/:id' }
    ];

    it('should set verbose mode when verbose option is true', async () => {
      const verboseOptions = { ...mockOptions, verbose: true };
      
      mockExistsSync.mockReturnValue(true);
      mockLoadMockEndpoints.mockResolvedValue(mockEndpoints);
      mockCreateServer.mockReturnValue({} as any);
      mockStartServerWithPortFallback.mockResolvedValue({ port: 4000 });

      await startServer(verboseOptions);

      expect(mockSetVerbose).toHaveBeenCalledWith(true);
    });

    it('should not set verbose mode when verbose option is false', async () => {
      mockExistsSync.mockReturnValue(true);
      mockLoadMockEndpoints.mockResolvedValue(mockEndpoints);
      mockCreateServer.mockReturnValue({} as any);
      mockStartServerWithPortFallback.mockResolvedValue({ port: 4000 });

      await startServer(mockOptions);

      expect(mockSetVerbose).not.toHaveBeenCalled();
    });

    it('should exit with error if mock directory does not exist', async () => {
      mockExistsSync.mockReturnValue(false);

      await expect(startServer(mockOptions)).rejects.toThrow('process.exit');

      expect(consoleErrorSpy).toHaveBeenCalledWith('RED: Mock directory "mock_server" does not exist.');
      expect(consoleLogSpy).toHaveBeenCalledWith('YELLOW: Please create the directory and add YAML files or TypeScript interface files with your mock endpoints.');
      expect(processExitSpy).toHaveBeenCalledWith(1);
    });

    it('should load mock endpoints from specified directory', async () => {
      mockExistsSync.mockReturnValue(true);
      mockLoadMockEndpoints.mockResolvedValue(mockEndpoints);
      mockCreateServer.mockReturnValue({} as any);
      mockStartServerWithPortFallback.mockResolvedValue({ port: 4000 });

      await startServer(mockOptions);

      expect(mockLoadMockEndpoints).toHaveBeenCalledWith('mock_server');
      expect(consoleLogSpy).toHaveBeenCalledWith('BLUE: 🔍 Loading mock endpoints from mock_server...');
    });

    it('should display warning when no endpoints are found', async () => {
      mockExistsSync.mockReturnValue(true);
      mockLoadMockEndpoints.mockResolvedValue([]);
      mockCreateServer.mockReturnValue({} as any);
      mockStartServerWithPortFallback.mockResolvedValue({ port: 4000 });

      await startServer(mockOptions);

      expect(consoleLogSpy).toHaveBeenCalledWith('YELLOW: ⚠️  No mock endpoints found in mock_server');
      expect(consoleLogSpy).toHaveBeenCalledWith('GRAY: Create YAML files or TypeScript interface files with your mock API definitions to get started.');
    });

    it('should display success message when endpoints are loaded', async () => {
      mockExistsSync.mockReturnValue(true);
      mockLoadMockEndpoints.mockResolvedValue(mockEndpoints);
      mockCreateServer.mockReturnValue({} as any);
      mockStartServerWithPortFallback.mockResolvedValue({ port: 4000 });

      await startServer(mockOptions);

      expect(consoleLogSpy).toHaveBeenCalledWith('GREEN: ✅ Loaded 3 mock endpoints');
    });

    it('should handle single endpoint correctly', async () => {
      const singleEndpoint = [mockEndpoints[0]];
      
      mockExistsSync.mockReturnValue(true);
      mockLoadMockEndpoints.mockResolvedValue(singleEndpoint);
      mockCreateServer.mockReturnValue({} as any);
      mockStartServerWithPortFallback.mockResolvedValue({ port: 4000 });

      await startServer(mockOptions);

      expect(consoleLogSpy).toHaveBeenCalledWith('GREEN: ✅ Loaded 1 mock endpoint');
    });

    it('should create server with loaded endpoints', async () => {
      mockExistsSync.mockReturnValue(true);
      mockLoadMockEndpoints.mockResolvedValue(mockEndpoints);
      const mockApp = { listen: jest.fn() };
      mockCreateServer.mockReturnValue(mockApp as any);
      mockStartServerWithPortFallback.mockResolvedValue({ port: 4000 });

      await startServer(mockOptions);

      expect(mockCreateServer).toHaveBeenCalledWith(mockEndpoints);
    });

    it('should start server with port fallback', async () => {
      const mockApp = { listen: jest.fn() };
      
      mockExistsSync.mockReturnValue(true);
      mockLoadMockEndpoints.mockResolvedValue(mockEndpoints);
      mockCreateServer.mockReturnValue(mockApp as any);
      mockStartServerWithPortFallback.mockResolvedValue({ port: 4001 });

      await startServer(mockOptions);

      expect(mockStartServerWithPortFallback).toHaveBeenCalledWith(
        mockApp,
        4000,
        5, // PORT_RETRY_MAX
        {
          warn: expect.any(Function),
          info: expect.any(Function)
        }
      );
    });

    it('should display server running message with actual port', async () => {
      mockExistsSync.mockReturnValue(true);
      mockLoadMockEndpoints.mockResolvedValue(mockEndpoints);
      mockCreateServer.mockReturnValue({} as any);
      mockStartServerWithPortFallback.mockResolvedValue({ port: 4001 });

      await startServer(mockOptions);

      expect(consoleLogSpy).toHaveBeenCalledWith('GREEN: 🚀 Mock server running on http://localhost:4001');
    });

    it('should display available endpoints when endpoints exist', async () => {
      mockExistsSync.mockReturnValue(true);
      mockLoadMockEndpoints.mockResolvedValue(mockEndpoints);
      mockCreateServer.mockReturnValue({} as any);
      mockStartServerWithPortFallback.mockResolvedValue({ port: 4000 });

      await startServer(mockOptions);

      expect(consoleLogSpy).toHaveBeenCalledWith('BLUE: \n📋 Available endpoints:');
      expect(consoleLogSpy).toHaveBeenCalledWith('  BLUE: GET      GRAY: /api/users');
      expect(consoleLogSpy).toHaveBeenCalledWith('  GREEN: POST     GRAY: /api/users');
      expect(consoleLogSpy).toHaveBeenCalledWith('  YELLOW: PUT      GRAY: /api/users/:id');
    });

    it('should not display endpoints section when no endpoints exist', async () => {
      mockExistsSync.mockReturnValue(true);
      mockLoadMockEndpoints.mockResolvedValue([]);
      mockCreateServer.mockReturnValue({} as any);
      mockStartServerWithPortFallback.mockResolvedValue({ port: 4000 });

      await startServer(mockOptions);

      expect(consoleLogSpy).not.toHaveBeenCalledWith('BLUE: \n📋 Available endpoints:');
    });

    it('should display control instructions', async () => {
      mockExistsSync.mockReturnValue(true);
      mockLoadMockEndpoints.mockResolvedValue(mockEndpoints);
      mockCreateServer.mockReturnValue({} as any);
      mockStartServerWithPortFallback.mockResolvedValue({ port: 4000 });

      await startServer(mockOptions);

      expect(consoleLogSpy).toHaveBeenCalledWith('GRAY: \nPress Ctrl+C to stop the server');
    });

    it('should handle server startup errors', async () => {
      const error = new Error('Failed to start');
      
      mockExistsSync.mockReturnValue(true);
      mockLoadMockEndpoints.mockRejectedValue(error);

      await expect(startServer(mockOptions)).rejects.toThrow('process.exit');

      expect(consoleErrorSpy).toHaveBeenCalledWith('RED: Failed to start server:', error);
      expect(processExitSpy).toHaveBeenCalledWith(1);
    });

    it('should handle port fallback logger functions', async () => {
      mockExistsSync.mockReturnValue(true);
      mockLoadMockEndpoints.mockResolvedValue([]);
      mockCreateServer.mockReturnValue({} as any);
      
      let warnFn: (msg: string) => void;
      let infoFn: (msg: string) => void;
      
      mockStartServerWithPortFallback.mockImplementation(async (app, port, maxRetries, logger) => {
        warnFn = logger.warn;
        infoFn = logger.info;
        return { port: 4001 };
      });

      await startServer(mockOptions);

      // Test the logger functions
      warnFn!('Warning message');
      infoFn!('Info message');

      expect(consoleLogSpy).toHaveBeenCalledWith('YELLOW: Warning message');
      expect(consoleLogSpy).toHaveBeenCalledWith('BLUE: Info message');
    });
  });

  describe('getMethodColor function', () => {
    it('should return correct color for GET method', async () => {
      const endpoints = [{ method: 'GET', fullPath: '/test', path: '/test' }];
      
      mockExistsSync.mockReturnValue(true);
      mockLoadMockEndpoints.mockResolvedValue(endpoints);
      mockCreateServer.mockReturnValue({} as any);
      mockStartServerWithPortFallback.mockResolvedValue({ port: 4000 });

      await startServer({ port: 4000, mockDir: 'test', verbose: false });

      expect(chalk.blue).toHaveBeenCalledWith('GET     ');
    });

    it('should return correct color for POST method', async () => {
      const endpoints = [{ method: 'POST', fullPath: '/test', path: '/test' }];
      
      mockExistsSync.mockReturnValue(true);
      mockLoadMockEndpoints.mockResolvedValue(endpoints);
      mockCreateServer.mockReturnValue({} as any);
      mockStartServerWithPortFallback.mockResolvedValue({ port: 4000 });

      await startServer({ port: 4000, mockDir: 'test', verbose: false });

      expect(chalk.green).toHaveBeenCalledWith('POST    ');
    });

    it('should return correct color for PUT method', async () => {
      const endpoints = [{ method: 'PUT', fullPath: '/test', path: '/test' }];
      
      mockExistsSync.mockReturnValue(true);
      mockLoadMockEndpoints.mockResolvedValue(endpoints);
      mockCreateServer.mockReturnValue({} as any);
      mockStartServerWithPortFallback.mockResolvedValue({ port: 4000 });

      await startServer({ port: 4000, mockDir: 'test', verbose: false });

      expect(chalk.yellow).toHaveBeenCalledWith('PUT     ');
    });

    it('should return correct color for DELETE method', async () => {
      const endpoints = [{ method: 'DELETE', fullPath: '/test', path: '/test' }];
      
      mockExistsSync.mockReturnValue(true);
      mockLoadMockEndpoints.mockResolvedValue(endpoints);
      mockCreateServer.mockReturnValue({} as any);
      mockStartServerWithPortFallback.mockResolvedValue({ port: 4000 });

      await startServer({ port: 4000, mockDir: 'test', verbose: false });

      expect(chalk.red).toHaveBeenCalledWith('DELETE  ');
    });

    it('should return correct color for PATCH method', async () => {
      const endpoints = [{ method: 'PATCH', fullPath: '/test', path: '/test' }];
      
      mockExistsSync.mockReturnValue(true);
      mockLoadMockEndpoints.mockResolvedValue(endpoints);
      mockCreateServer.mockReturnValue({} as any);
      mockStartServerWithPortFallback.mockResolvedValue({ port: 4000 });

      await startServer({ port: 4000, mockDir: 'test', verbose: false });

      expect(chalk.magenta).toHaveBeenCalledWith('PATCH   ');
    });

    it('should return white color for unknown method', async () => {
      const endpoints = [{ method: 'UNKNOWN', fullPath: '/test', path: '/test' }];
      
      mockExistsSync.mockReturnValue(true);
      mockLoadMockEndpoints.mockResolvedValue(endpoints);
      mockCreateServer.mockReturnValue({} as any);
      mockStartServerWithPortFallback.mockResolvedValue({ port: 4000 });

      await startServer({ port: 4000, mockDir: 'test', verbose: false });

      expect(chalk.white).toHaveBeenCalledWith('UNKNOWN ');
    });
  });

  describe('Error Scenarios', () => {
    it('should handle loadMockEndpoints errors', async () => {
      const error = new Error('Load endpoints failed');
      
      mockExistsSync.mockReturnValue(true);
      mockLoadMockEndpoints.mockRejectedValue(error);

      await expect(startServer({ port: 4000, mockDir: 'test', verbose: false })).rejects.toThrow('process.exit');

      expect(consoleErrorSpy).toHaveBeenCalledWith('RED: Failed to start server:', error);
      expect(processExitSpy).toHaveBeenCalledWith(1);
    });

    it('should handle createServer errors', async () => {
      const error = new Error('Create server failed');
      
      mockExistsSync.mockReturnValue(true);
      mockLoadMockEndpoints.mockResolvedValue([]);
      mockCreateServer.mockImplementation(() => {
        throw error;
      });

      await expect(startServer({ port: 4000, mockDir: 'test', verbose: false })).rejects.toThrow('process.exit');

      expect(consoleErrorSpy).toHaveBeenCalledWith('RED: Failed to start server:', error);
      expect(processExitSpy).toHaveBeenCalledWith(1);
    });

    it('should handle startServerWithPortFallback errors', async () => {
      const error = new Error('Port fallback failed');
      
      mockExistsSync.mockReturnValue(true);
      mockLoadMockEndpoints.mockResolvedValue([]);
      mockCreateServer.mockReturnValue({} as any);
      mockStartServerWithPortFallback.mockRejectedValue(error);

      await expect(startServer({ port: 4000, mockDir: 'test', verbose: false })).rejects.toThrow('process.exit');

      expect(consoleErrorSpy).toHaveBeenCalledWith('RED: Failed to start server:', error);
      expect(processExitSpy).toHaveBeenCalledWith(1);
    });
  });

  describe('Method Padding', () => {
    it('should use METHOD_PADDING_LENGTH for consistent formatting', async () => {
      const endpoints = [
        { method: 'GET', fullPath: '/short', path: '/short' },
        { method: 'DELETE', fullPath: '/longer', path: '/longer' }
      ];
      
      mockExistsSync.mockReturnValue(true);
      mockLoadMockEndpoints.mockResolvedValue(endpoints);
      mockCreateServer.mockReturnValue({} as any);
      mockStartServerWithPortFallback.mockResolvedValue({ port: 4000 });

      await startServer({ port: 4000, mockDir: 'test', verbose: false });

      // Both methods should be padded to METHOD_PADDING_LENGTH (8 characters)
      expect(chalk.blue).toHaveBeenCalledWith('GET     '); // 3 + 5 spaces = 8
      expect(chalk.red).toHaveBeenCalledWith('DELETE  '); // 6 + 2 spaces = 8
    });
  });

  describe('Directory Path Handling', () => {
    it('should handle different directory paths correctly', async () => {
      const customOptions = {
        port: 3000,
        mockDir: 'custom/mock/directory',
        verbose: true
      };
      
      mockExistsSync.mockReturnValue(true);
      mockLoadMockEndpoints.mockResolvedValue([]);
      mockCreateServer.mockReturnValue({} as any);
      mockStartServerWithPortFallback.mockResolvedValue({ port: 3000 });

      await startServer(customOptions);

      expect(mockExistsSync).toHaveBeenCalledWith('custom/mock/directory');
      expect(mockLoadMockEndpoints).toHaveBeenCalledWith('custom/mock/directory');
      expect(consoleLogSpy).toHaveBeenCalledWith('BLUE: 🔍 Loading mock endpoints from custom/mock/directory...');
    });
  });
});