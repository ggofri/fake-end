import { readFile } from 'fs/promises';
import { glob } from 'glob';
import * as yaml from 'js-yaml';
import { ParsedEndpoint } from '@/types';
import { loadTypeScriptEndpoints } from './ts-loader';
import { buildEndpointPath } from './path-builder';
import { verboseLog, verboseError, verboseWarn } from '@/utils';
import { JSON_STRINGIFY_INDENT } from '@/constants';
import chalk from 'chalk';
import { isArrayOfMockEndpoints } from '@/cli/generate';
import { isValidEndpoint } from './validators';

export async function loadMockEndpoints(mockDir: string): Promise<ParsedEndpoint[]> {
  const endpoints: ParsedEndpoint[] = [];

  try {
    const tsEndpoints = await loadTypeScriptEndpoints(mockDir);
    endpoints.push(...tsEndpoints);
    if (tsEndpoints.length > 0) {
      verboseLog(chalk.green(`✅ Loaded ${tsEndpoints.length} TypeScript interface endpoint${tsEndpoints.length > 1 ? 's' : ''}`));
    }
  } catch (error) {
    verboseError(chalk.red('❌ Error loading TypeScript interfaces:'), error);
  }

  const yamlEndpoints = await loadYamlEndpoints(mockDir);
  endpoints.push(...yamlEndpoints);

  return endpoints;
}

async function loadYamlEndpoints(mockDir: string): Promise<ParsedEndpoint[]> {
  const yamlFiles = await glob(`${mockDir}/**/*.yaml`, { absolute: true });
  const ymlFiles = await glob(`${mockDir}/**/*.yml`, { absolute: true });
  const allFiles = [...yamlFiles, ...ymlFiles];
  const endpoints: ParsedEndpoint[] = [];

  for (const filePath of allFiles) {
    try {
      const content = await readFile(filePath, 'utf-8');
      
      const parsedContent = yaml.load(content);
      
      if (!isArrayOfMockEndpoints(parsedContent)) {
        verboseWarn(chalk.yellow(`⚠️  File ${filePath} does not contain an array of endpoints`));
        continue;
      }

      for (const endpoint of parsedContent) {
        if (!isValidEndpoint(endpoint)) {
          verboseWarn(chalk.yellow(`⚠️  Invalid endpoint in ${filePath}:`, JSON.stringify(endpoint, null, JSON_STRINGIFY_INDENT)));
          continue;
        }

        const fullPath = buildEndpointPath(filePath, mockDir, endpoint.path);

        endpoints.push({
          ...endpoint,
          filePath,
          fullPath: fullPath.replace(/\/+/g, '/')
        });
      }
    } catch (error) {
      verboseError(chalk.red(`❌ Error loading ${filePath}:`), error);
    }
  }

  return endpoints;
}
