import { loadMockEndpoints } from '../loader';

jest.mock('fs/promises', () => ({
  readFile: jest.fn()
}));

jest.mock('glob', () => ({
  glob: jest.fn()
}));

jest.mock('js-yaml', () => ({
  load: jest.fn()
}));

jest.mock('../ts-loader', () => ({
  loadTypeScriptEndpoints: jest.fn()
}));

jest.mock('../path-builder', () => ({
  buildEndpointPath: jest.fn()
}));

jest.mock('@/utils', () => ({
  verboseLog: jest.fn(),
  verboseError: jest.fn(),
  verboseWarn: jest.fn()
}));

jest.mock('chalk', () => {
  const mockChalk = {
    green: jest.fn((str) => str),
    red: jest.fn((str) => str),
    yellow: jest.fn((str) => str)
  };
  return {
    default: mockChalk,
    ...mockChalk
  };
});

jest.mock('@/cli/generate', () => ({
  isArrayOfMockEndpoints: jest.fn()
}));

jest.mock('../validators', () => ({
  isValidEndpoint: jest.fn()
}));

import { readFile } from 'fs/promises';
import { glob } from 'glob';
import * as yaml from 'js-yaml';
import { loadTypeScriptEndpoints } from '../ts-loader';
import { buildEndpointPath } from '../path-builder';
import { verboseLog, verboseError, verboseWarn } from '@/utils';
import { isArrayOfMockEndpoints } from '@/cli/generate';
import { isValidEndpoint } from '../validators';

const mockReadFile = readFile as jest.MockedFunction<typeof readFile>;
const mockGlob = glob as jest.MockedFunction<typeof glob>;
const mockYamlLoad = yaml.load as jest.MockedFunction<typeof yaml.load>;
const mockLoadTypeScriptEndpoints = loadTypeScriptEndpoints as jest.MockedFunction<typeof loadTypeScriptEndpoints>;
const mockBuildEndpointPath = buildEndpointPath as jest.MockedFunction<typeof buildEndpointPath>;
const mockVerboseLog = verboseLog as jest.MockedFunction<typeof verboseLog>;
const mockVerboseError = verboseError as jest.MockedFunction<typeof verboseError>;
const mockVerboseWarn = verboseWarn as jest.MockedFunction<typeof verboseWarn>;
const mockIsArrayOfMockEndpoints = isArrayOfMockEndpoints as jest.MockedFunction<typeof isArrayOfMockEndpoints>;
const mockIsValidEndpoint = isValidEndpoint as jest.MockedFunction<typeof isValidEndpoint>;

describe('loader', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('loadMockEndpoints', () => {
    test('should load TypeScript and YAML endpoints', async () => {
      
      const mockTsEndpoints = [
        { method: 'GET' as const, path: '/api/ts', filePath: '/test/ts.ts', fullPath: '/api/ts', status: 200, body: {} }
      ];
      const mockYamlEndpoint = {
        method: 'GET',
        path: '/api/test',
        response: { data: 'test' }
      };

      mockLoadTypeScriptEndpoints.mockResolvedValue(mockTsEndpoints);
      mockGlob.mockResolvedValueOnce(['/test/file.yaml']);
      mockGlob.mockResolvedValueOnce([]);
      mockReadFile.mockResolvedValue('- method: GET\n  path: /api/test\n  response:\n    data: test');
      mockYamlLoad.mockReturnValue([mockYamlEndpoint]);
      mockIsArrayOfMockEndpoints.mockReturnValue(true);
      mockIsValidEndpoint.mockReturnValue(true);
      mockBuildEndpointPath.mockReturnValue('/api/test');

      const result = await loadMockEndpoints('/test/mock');

      expect(result).toHaveLength(2);
      expect(result[0]).toEqual(mockTsEndpoints[0]);
      expect(result[1]).toMatchObject({
        method: 'GET',
        path: '/api/test',
        response: { data: 'test' },
        filePath: '/test/file.yaml',
        fullPath: '/api/test'
      });
      expect(mockLoadTypeScriptEndpoints).toHaveBeenCalledWith('/test/mock', undefined);
    });

    test('should handle TypeScript loading errors', async () => {
      const error = new Error('TS loading failed');
      mockLoadTypeScriptEndpoints.mockRejectedValue(error);
      mockGlob.mockResolvedValueOnce([]);
      mockGlob.mockResolvedValueOnce([]);

      const result = await loadMockEndpoints('/test/mock');

      expect(result).toHaveLength(0);
      expect(mockVerboseError).toHaveBeenCalledWith(
        expect.anything(),
        error
      );
    });

    test('should pass options to TypeScript loader', async () => {
      const options = { noCache: true, dynamicMocks: false };
      mockLoadTypeScriptEndpoints.mockResolvedValue([]);
      mockGlob.mockResolvedValueOnce([]);
      mockGlob.mockResolvedValueOnce([]);

      await loadMockEndpoints('/test/mock', options);

      expect(mockLoadTypeScriptEndpoints).toHaveBeenCalledWith('/test/mock', options);
    });

    test('should log success message for TypeScript endpoints', async () => {
      const mockTsEndpoints = [
        { method: 'GET' as const, path: '/api/ts1', filePath: '/test/ts1.ts', fullPath: '/api/ts1', status: 200, body: {} },
        { method: 'POST' as const, path: '/api/ts2', filePath: '/test/ts2.ts', fullPath: '/api/ts2', status: 200, body: {} }
      ];
      mockLoadTypeScriptEndpoints.mockResolvedValue(mockTsEndpoints);
      mockGlob.mockResolvedValueOnce([]);
      mockGlob.mockResolvedValueOnce([]);

      await loadMockEndpoints('/test/mock');

      expect(mockVerboseLog).toHaveBeenCalledWith(
        expect.stringContaining('✅ Loaded 2 TypeScript interface endpoints')
      );
    });
  });

  describe('loadYamlEndpoints (via loadMockEndpoints)', () => {
    beforeEach(() => {
      mockLoadTypeScriptEndpoints.mockResolvedValue([]);
    });

    test('should load YAML files from both .yaml and .yml extensions', async () => {
      mockGlob.mockResolvedValueOnce(['/test/file.yaml']);
      mockGlob.mockResolvedValueOnce(['/test/file.yml']);
      mockReadFile.mockResolvedValue('[]');
      mockYamlLoad.mockReturnValue([]);
      mockIsArrayOfMockEndpoints.mockReturnValue(true);

      await loadMockEndpoints('/test/mock');

      expect(mockGlob).toHaveBeenCalledWith('/test/mock/**/*.yaml', { absolute: true });
      expect(mockGlob).toHaveBeenCalledWith('/test/mock/**/*.yml', { absolute: true });
      expect(mockReadFile).toHaveBeenCalledWith('/test/file.yaml', 'utf-8');
      expect(mockReadFile).toHaveBeenCalledWith('/test/file.yml', 'utf-8');
    });

    test('should skip files that do not contain array of endpoints', async () => {
      mockGlob.mockResolvedValueOnce(['/test/invalid.yaml']);
      mockGlob.mockResolvedValueOnce([]);
      mockReadFile.mockResolvedValue('invalid: content');
      mockYamlLoad.mockReturnValue({ invalid: 'content' });
      mockIsArrayOfMockEndpoints.mockReturnValue(false);

      const result = await loadMockEndpoints('/test/mock');

      expect(result).toHaveLength(0);
      expect(mockVerboseWarn).toHaveBeenCalledWith(
        expect.stringContaining('⚠️  File /test/invalid.yaml does not contain an array of endpoints')
      );
    });

    test('should skip invalid endpoints', async () => {
      const mockEndpoint = { method: 'INVALID', path: '/test' };
      mockGlob.mockResolvedValueOnce(['/test/file.yaml']);
      mockGlob.mockResolvedValueOnce([]);
      mockReadFile.mockResolvedValue('content');
      mockYamlLoad.mockReturnValue([mockEndpoint]);
      mockIsArrayOfMockEndpoints.mockReturnValue(true);
      mockIsValidEndpoint.mockReturnValue(false);

      const result = await loadMockEndpoints('/test/mock');

      expect(result).toHaveLength(0);
      expect(mockVerboseWarn).toHaveBeenCalledWith(
        expect.stringContaining('⚠️  Invalid endpoint in /test/file.yaml:')
      );
    });

    test('should build full path and normalize slashes', async () => {
      const mockEndpoint = { method: 'GET', path: '/api/test', response: {} };
      mockGlob.mockResolvedValueOnce(['/test/file.yaml']);
      mockGlob.mockResolvedValueOnce([]);
      mockReadFile.mockResolvedValue('content');
      mockYamlLoad.mockReturnValue([mockEndpoint]);
      mockIsArrayOfMockEndpoints.mockReturnValue(true);
      mockIsValidEndpoint.mockReturnValue(true);
      mockBuildEndpointPath.mockReturnValue('/api//test//');

      const result = await loadMockEndpoints('/test/mock');

      expect(result[0].fullPath).toBe('/api/test/');
      expect(mockBuildEndpointPath).toHaveBeenCalledWith('/test/file.yaml', '/test/mock', '/api/test');
    });

    test('should handle file reading errors', async () => {
      const error = new Error('File read failed');
      mockGlob.mockResolvedValueOnce(['/test/error.yaml']);
      mockGlob.mockResolvedValueOnce([]);
      mockReadFile.mockRejectedValue(error);

      const result = await loadMockEndpoints('/test/mock');

      expect(result).toHaveLength(0);
      expect(mockVerboseError).toHaveBeenCalledWith(
        expect.stringContaining('❌ Error loading /test/error.yaml:'),
        error
      );
    });

    test('should handle YAML parsing errors', async () => {
      const error = new Error('YAML parse failed');
      mockGlob.mockResolvedValueOnce(['/test/invalid.yaml']);
      mockGlob.mockResolvedValueOnce([]);
      mockReadFile.mockResolvedValue('invalid: yaml: content:');
      mockYamlLoad.mockImplementation(() => { throw error; });

      const result = await loadMockEndpoints('/test/mock');

      expect(result).toHaveLength(0);
      expect(mockVerboseError).toHaveBeenCalledWith(
        expect.stringContaining('❌ Error loading /test/invalid.yaml:'),
        error
      );
    });
  });
});
