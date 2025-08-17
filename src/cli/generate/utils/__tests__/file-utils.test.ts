import { 
  generateFilePath, 
  getRelativeEndpointPath, 
  writeYamlFile 
} from '../file-utils';
import * as fs from 'fs/promises';
import * as yaml from 'js-yaml';

jest.mock('fs/promises');
jest.mock('js-yaml');

const mockFs = fs as jest.Mocked<typeof fs>;
const mockYaml = yaml as jest.Mocked<typeof yaml>;

describe('File Utils', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('generateFilePath', () => {
    it('should generate correct file path', () => {
      const curlInfo = {
        method: 'GET',
        url: 'http://example.com/api/users',
        headers: {},
        path: '/api/users',
        queryParams: {}
      };

      const result = generateFilePath(curlInfo, '/output');

      expect(result).toBe('/output/api/users.yaml');
    });

    it('should handle root path', () => {
      const curlInfo = {
        method: 'GET',
        url: 'http://example.com/',
        headers: {},
        path: '/',
        queryParams: {}
      };

      const result = generateFilePath(curlInfo, '/output');

      expect(result).toBe('/output/index.yaml');
    });

    it('should handle path parameters', () => {
      const curlInfo = {
        method: 'GET',
        url: 'http://example.com/users/:id',
        headers: {},
        path: '/users/:id',
        queryParams: {}
      };

      const result = generateFilePath(curlInfo, '/output');

      expect(result).toBe('/output/users.yaml');
    });
  });

  describe('getRelativeEndpointPath', () => {
    it('should return relative path for nested endpoints', () => {
      const curlInfo = {
        method: 'GET',
        url: 'http://example.com/api/users/profile',
        headers: {},
        path: '/api/users/profile',
        queryParams: {}
      };

      const result = getRelativeEndpointPath(curlInfo);

      expect(result).toBe('/profile');
    });

    it('should return original path for simple endpoints', () => {
      const curlInfo = {
        method: 'GET',
        url: 'http://example.com/users',
        headers: {},
        path: '/users',
        queryParams: {}
      };

      const result = getRelativeEndpointPath(curlInfo);

      expect(result).toBe('/users');
    });
  });

  describe('writeYamlFile', () => {
    it('should write YAML file with endpoints', async () => {
      const endpoints = [{
        method: 'GET',
        path: '/users',
        status: 200,
        body: { users: [] }
      }];

      mockFs.readFile.mockRejectedValue(new Error('File not found'));
      mockFs.mkdir.mockResolvedValue(undefined);
      mockFs.writeFile.mockResolvedValue(undefined);
      mockYaml.dump.mockReturnValue('yaml content');

      await writeYamlFile('/output/users.yaml', endpoints);

      expect(mockFs.mkdir).toHaveBeenCalledWith('/output', { recursive: true });
      expect(mockFs.writeFile).toHaveBeenCalledWith('/output/users.yaml', 'yaml content', 'utf8');
    });

    it('should merge with existing endpoints', async () => {
      const existingEndpoints = [{
        method: 'GET',
        path: '/users',
        status: 200,
        body: { users: [] }
      }];

      const newEndpoints = [{
        method: 'POST',
        path: '/users',
        status: 201,
        body: { created: true }
      }];

      mockFs.readFile.mockResolvedValue('existing yaml');
      mockYaml.load.mockReturnValue(existingEndpoints);
      mockYaml.dump.mockReturnValue('merged yaml');
      mockFs.mkdir.mockResolvedValue(undefined);
      mockFs.writeFile.mockResolvedValue(undefined);

      await writeYamlFile('/output/users.yaml', newEndpoints);

      expect(mockYaml.dump).toHaveBeenCalledWith([...existingEndpoints, ...newEndpoints], expect.any(Object));
    });
  });
});
