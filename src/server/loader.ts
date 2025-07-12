import { readFile } from 'fs/promises';
import { glob } from 'glob';
import * as yaml from 'js-yaml';
import { MockEndpoint, ParsedEndpoint } from '../types/';
import chalk from 'chalk';

export async function loadMockEndpoints(mockDir: string): Promise<ParsedEndpoint[]> {
  const yamlFiles = await glob(`${mockDir}/**/*.yaml`, { absolute: true });
  const ymlFiles = await glob(`${mockDir}/**/*.yml`, { absolute: true });
  const allFiles = [...yamlFiles, ...ymlFiles];

  const endpoints: ParsedEndpoint[] = [];

  for (const filePath of allFiles) {
    try {
      const content = await readFile(filePath, 'utf-8');
      const parsedContent = yaml.load(content) as MockEndpoint[];

      if (!Array.isArray(parsedContent)) {
        console.warn(chalk.yellow(`⚠️  File ${filePath} does not contain an array of endpoints`));
        continue;
      }

      for (const endpoint of parsedContent) {
        if (!isValidEndpoint(endpoint)) {
          console.warn(chalk.yellow(`⚠️  Invalid endpoint in ${filePath}:`, endpoint));
          continue;
        }

        // Build the full path by combining the directory structure with the endpoint path
        // Extract the relative path from the file path, handling both absolute and relative mockDir
        const normalizedMockDir = mockDir.endsWith('/') ? mockDir : `${mockDir}/`;
        let relativePath = filePath;
        
        // Handle absolute paths (from glob results)
        if (filePath.includes(normalizedMockDir)) {
          relativePath = filePath.split(normalizedMockDir)[1] || '';
        } else {
          // Handle case where mockDir might be relative but glob returns absolute
          const absoluteMockDir = process.cwd() + '/' + normalizedMockDir;
          if (filePath.includes(absoluteMockDir)) {
            relativePath = filePath.split(absoluteMockDir)[1] || '';
          }
        }
        
        // Remove file extension and extract directory path
        relativePath = relativePath.replace(/\.(yaml|yml)$/, '');
        const directoryPath = relativePath.split('/').slice(0, -1).join('/');
        const fullPath = directoryPath ? `/${directoryPath}${endpoint.path}` : endpoint.path;

        endpoints.push({
          ...endpoint,
          filePath,
          fullPath: fullPath.replace(/\/+/g, '/') // Clean up double slashes
        });
      }
    } catch (error) {
      console.error(chalk.red(`❌ Error loading ${filePath}:`), error);
    }
  }

  return endpoints;
}

function isValidEndpoint(endpoint: unknown): endpoint is MockEndpoint {
  return (
    !!endpoint &&
    typeof endpoint === 'object' &&
    'method' in endpoint &&
    'path' in endpoint &&
    'status' in endpoint &&
    'body' in endpoint &&
    typeof endpoint.method === 'string' &&
    ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'].includes(endpoint.method.toUpperCase()) &&
    typeof endpoint.path === 'string' &&
    typeof endpoint.status === 'number' &&
    endpoint.body !== undefined
  );
}
