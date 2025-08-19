import { createServer } from '@/server-runtime/startup';
import { loadMockEndpoints } from '@/file-management/loader/loader';
import { ServerOptions } from '@/shared/types';
import { setVerbose, startServerWithPortFallback } from '@/shared/utils';
import { PORT_RETRY_MAX } from '@/shared/constants';
import { existsSync } from 'fs';
import { startServer } from '../handlers/run';
import chalk from 'chalk';

jest.mock('@/server-runtime/startup');
jest.mock('@/file-management/loader/loader');
jest.mock('@/shared/utils');
jest.mock('@/shared/constants');
jest.mock('chalk', () => ({
  red: jest.fn((...args: any[]) => `RED: ${args.join(' ')}`),
  blue: jest.fn((...args: any[]) => `BLUE: ${args.join(' ')}`),
  green: jest.fn((...args: any[]) => `GREEN: ${args.join(' ')}`),
  yellow: jest.fn((...args: any[]) => `YELLOW: ${args.join(' ')}`),
  gray: jest.fn((...args: any[]) => `GRAY: ${args.join(' ')}`),
  white: jest.fn((...args: any[]) => `WHITE: ${args.join(' ')}`),
  magenta: jest.fn((...args: any[]) => `MAGENTA: ${args.join(' ')}`),
  cyan: jest.fn((...args: any[]) => `CYAN: ${args.join(' ')}`)
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
  let consoleWarnSpy: jest.SpyInstance;
  let processExitSpy: jest.SpyInstance;

  beforeEach(() => {
    jest.clearAllMocks();
    
    consoleLogSpy = jest.spyOn(console, 'log').mockImplementation();
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
    consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation();
    processExitSpy = jest.spyOn(process, 'exit').mockImplementation(() => {
      throw new Error('process.exit');
    });

  });

  afterEach(() => {
    consoleLogSpy.mockRestore();
    consoleErrorSpy.mockRestore();
    consoleWarnSpy.mockRestore();
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
      expect(consoleWarnSpy).toHaveBeenCalledWith('YELLOW: Please create the directory and add YAML files or TypeScript interface files with your mock endpoints.');
      expect(processExitSpy).toHaveBeenCalledWith(1);
    });

    it('should load endpoints and display appropriate messages', async () => {
      mockExistsSync.mockReturnValue(true);
      mockCreateServer.mockReturnValue({} as any);
      mockStartServerWithPortFallback.mockResolvedValue({ port: 4000, attempted: [4000], fallbackUsed: false, server: {} as any });

      mockLoadMockEndpoints.mockResolvedValue(mockEndpoints);
      await startServer(mockOptions);
      expect(mockLoadMockEndpoints).toHaveBeenCalledWith('mock_server', {});
      expect(consoleLogSpy).toHaveBeenCalledWith('BLUE: ✅ Loaded 3 mock endpoints');

      mockLoadMockEndpoints.mockResolvedValue([]);
      await startServer(mockOptions);
      expect(consoleWarnSpy).toHaveBeenCalledWith('YELLOW: ⚠️  No mock endpoints found in mock_server');
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
      expect(consoleLogSpy).toHaveBeenCalledWith('BLUE: 🚀 Mock server running on http://localhost:4001');
    });

    it('should display endpoints and control instructions', async () => {
      mockExistsSync.mockReturnValue(true);
      mockCreateServer.mockReturnValue({} as any);
      mockStartServerWithPortFallback.mockResolvedValue({ port: 4000, attempted: [4000], fallbackUsed: false, server: {} as any });

      mockLoadMockEndpoints.mockResolvedValue(mockEndpoints);
      await startServer(mockOptions);
      expect(consoleLogSpy).toHaveBeenCalledWith('BLUE: \n📋 Available endpoints:');
      expect(consoleLogSpy).toHaveBeenCalledWith('BLUE: Press Ctrl+C to stop the server');
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

      expect(consoleErrorSpy).toHaveBeenCalledWith('RED: Failed to start server: Error: Failed to start');
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
      expect(consoleWarnSpy).toHaveBeenCalledWith('YELLOW: Test warning');
      expect(consoleLogSpy).toHaveBeenCalledWith('BLUE: Test info');
    });
  });
});
