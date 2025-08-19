import { createServer } from '@/server';
import { loadMockEndpoints } from '@/server/loader';
import { ServerOptions } from '@/types';
import { setVerbose, startServerWithPortFallback } from '@/utils';
import { PORT_RETRY_MAX } from '@/constants';
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
      { method: 'GET' as const, fullPath: '/api/users', path: '/users', filePath: 'test.yaml', status: 200 },
      { method: 'POST' as const, fullPath: '/api/users', path: '/users', filePath: 'test.yaml', status: 201 },
      { method: 'PUT' as const, fullPath: '/api/users/:id', path: '/users/:id', filePath: 'test.yaml', status: 200 }
    ];

    it('should handle verbose mode correctly', async () => {
      const verboseOptions = { ...mockOptions, verbose: true };
      
      mockExistsSync.mockReturnValue(true);
      mockLoadMockEndpoints.mockResolvedValue(mockEndpoints);
      mockCreateServer.mockReturnValue({} as any);
      mockStartServerWithPortFallback.mockResolvedValue({ port: 4000, attempted: [4000], fallbackUsed: false, server: {} as any });

      await startServer(verboseOptions);
      expect(mockSetVerbose).toHaveBeenCalledWith(true);

      await startServer(mockOptions);
      expect(mockSetVerbose).toHaveBeenCalledTimes(1);
    });

    it('should exit with error if mock directory does not exist', async () => {
      mockExistsSync.mockReturnValue(false);

      await expect(startServer(mockOptions)).rejects.toThrow('process.exit');

      expect(consoleErrorSpy).toHaveBeenCalledWith('RED: Mock directory "mock_server" does not exist.');
      expect(consoleLogSpy).toHaveBeenCalledWith('YELLOW: Please create the directory and add YAML files or TypeScript interface files with your mock endpoints.');
      expect(processExitSpy).toHaveBeenCalledWith(1);
    });

    it('should load endpoints and display appropriate messages', async () => {
      mockExistsSync.mockReturnValue(true);
      mockCreateServer.mockReturnValue({} as any);
      mockStartServerWithPortFallback.mockResolvedValue({ port: 4000, attempted: [4000], fallbackUsed: false, server: {} as any });

      mockLoadMockEndpoints.mockResolvedValue(mockEndpoints);
      await startServer(mockOptions);
      expect(mockLoadMockEndpoints).toHaveBeenCalledWith('mock_server', {});
      expect(consoleLogSpy).toHaveBeenCalledWith('GREEN: ✅ Loaded 3 mock endpoints');

      mockLoadMockEndpoints.mockResolvedValue([]);
      await startServer(mockOptions);
      expect(consoleLogSpy).toHaveBeenCalledWith('YELLOW: ⚠️  No mock endpoints found in mock_server');
    });

    it('should create and start server with port fallback', async () => {
      const mockApp = { listen: jest.fn() };
      
      mockExistsSync.mockReturnValue(true);
      mockLoadMockEndpoints.mockResolvedValue(mockEndpoints);
      mockCreateServer.mockReturnValue(mockApp as any);
      mockStartServerWithPortFallback.mockResolvedValue({ port: 4001, attempted: [4000, 4001], fallbackUsed: true, server: {} as any });

      await startServer(mockOptions);

      expect(mockCreateServer).toHaveBeenCalledWith(mockEndpoints, 'mock_server');
      expect(mockStartServerWithPortFallback).toHaveBeenCalledWith(
        mockApp,
        4000,
        PORT_RETRY_MAX,
        expect.objectContaining({ warn: expect.any(Function), info: expect.any(Function) })
      );
      expect(consoleLogSpy).toHaveBeenCalledWith('GREEN: 🚀 Mock server running on http://localhost:4001');
    });

    it('should display endpoints and control instructions', async () => {
      mockExistsSync.mockReturnValue(true);
      mockCreateServer.mockReturnValue({} as any);
      mockStartServerWithPortFallback.mockResolvedValue({ port: 4000, attempted: [4000], fallbackUsed: false, server: {} as any });

      mockLoadMockEndpoints.mockResolvedValue(mockEndpoints);
      await startServer(mockOptions);
      expect(consoleLogSpy).toHaveBeenCalledWith('BLUE: \n📋 Available endpoints:');
      expect(consoleLogSpy).toHaveBeenCalledWith('GRAY: Press Ctrl+C to stop the server');
    });

    it('should not display endpoints section when no endpoints exist', async () => {
      consoleLogSpy.mockClear();
      mockExistsSync.mockReturnValue(true);
      mockCreateServer.mockReturnValue({} as any);
      mockStartServerWithPortFallback.mockResolvedValue({ port: 4000, attempted: [4000], fallbackUsed: false, server: {} as any });
      mockLoadMockEndpoints.mockResolvedValue([]);

      await startServer(mockOptions);
      expect(consoleLogSpy).not.toHaveBeenCalledWith('BLUE: \n📋 Available endpoints:');
    });

    it('should handle server startup errors', async () => {
      const error = new Error('Failed to start');
      
      mockExistsSync.mockReturnValue(true);
      mockLoadMockEndpoints.mockRejectedValue(error);

      await expect(startServer(mockOptions)).rejects.toThrow('process.exit');

      expect(consoleErrorSpy).toHaveBeenCalledWith('RED: Failed to start server:', error);
      expect(processExitSpy).toHaveBeenCalledWith(1);
    });
  });

  describe('Method Colors and Formatting', () => {
    it('should display methods with correct colors', async () => {
      const coloredEndpoints = [
        { method: 'GET' as const, fullPath: '/test', path: '/test', filePath: 'test.yaml', status: 200 },
        { method: 'POST' as const, fullPath: '/test', path: '/test', filePath: 'test.yaml', status: 201 },
        { method: 'DELETE' as const, fullPath: '/test', path: '/test', filePath: 'test.yaml', status: 200 }
      ];
      
      mockExistsSync.mockReturnValue(true);
      mockLoadMockEndpoints.mockResolvedValue(coloredEndpoints);
      mockCreateServer.mockReturnValue({} as any);
      mockStartServerWithPortFallback.mockResolvedValue({ port: 4000, attempted: [4000], fallbackUsed: false, server: {} as any });

      await startServer({ port: 4000, mockDir: 'test', verbose: false });

      expect(chalk.blue).toHaveBeenCalledWith('GET   ');
      expect(chalk.green).toHaveBeenCalledWith('POST  ');
      expect(chalk.red).toHaveBeenCalledWith('DELETE');
    });
  });

  describe('Custom Configuration', () => {
    it('should handle custom directory paths and port fallback logger', async () => {
      const customOptions = { port: 3000, mockDir: 'custom/dir', verbose: true };
      
      mockExistsSync.mockReturnValue(true);
      mockLoadMockEndpoints.mockResolvedValue([]);
      mockCreateServer.mockReturnValue({} as any);
      
      let loggerFunctions: any;
      mockStartServerWithPortFallback.mockImplementation(async (_app, _port, _maxRetries, logger) => {
        loggerFunctions = logger;
        return { port: 3001, attempted: [3000, 3001], fallbackUsed: true, server: {} as any };
      });

      await startServer(customOptions);

      expect(mockLoadMockEndpoints).toHaveBeenCalledWith('custom/dir', {});
      loggerFunctions.warn('Test warning');
      loggerFunctions.info('Test info');
      expect(consoleLogSpy).toHaveBeenCalledWith('YELLOW: Test warning');
      expect(consoleLogSpy).toHaveBeenCalledWith('BLUE: Test info');
    });
  });
});
