import { readFile } from 'fs/promises';
import { glob } from 'glob';
import { ParsedEndpoint } from '@/types';
import {
  parseInterfaceWithCache,
  generateMockFromInterface,
  extractEndpointInfoFromPath,
  isValidTypeScriptEndpoint
} from './typescript/';
import { extractGuardFromInterface } from './typescript/utils/jsdoc-extractor';
import type { TypeScriptEndpoint } from './typescript/';
import { verboseError } from '@/utils';
import chalk from 'chalk';

export async function loadTypeScriptEndpoints(mockDir: string): Promise<ParsedEndpoint[]> {
  const tsFiles = await glob(`${mockDir}/**/*.ts`, { absolute: true });
  if (tsFiles.length === 0) return [];

  const endpoints: ParsedEndpoint[] = [];

  for (const filePath of tsFiles) {
    const endpoint = await processTypeScriptFile(filePath, mockDir);
    if (endpoint) {
      endpoints.push(endpoint);
    }
  }

  return endpoints;
}

async function processTypeScriptFile(filePath: string, mockDir: string): Promise<ParsedEndpoint | null> {
  try {
    const content = await readFile(filePath, 'utf-8');
    
    const parsed = parseInterfaceWithCache(filePath, content);
    if (!parsed) return null;
    
    const { interface: interfaceDeclaration } = parsed;

    const { httpMethod, endpointPath } = extractEndpointInfoFromPath(filePath, mockDir);
    const mockData = generateMockFromInterface(interfaceDeclaration);
    const guard = extractGuardFromInterface(interfaceDeclaration);
    
    const endpoint: TypeScriptEndpoint = {
      method: httpMethod,
      path: endpointPath,
      status: 200,
      body: mockData,
      ...(guard && { guard })
    };

    return isValidTypeScriptEndpoint(endpoint) ? {
      ...endpoint,
      filePath,
      fullPath: endpoint.path
    } : null;
  } catch (error) {
    verboseError(chalk.red(`❌ Error loading TypeScript interface ${filePath}:`), error);
    return null;
  }
}
