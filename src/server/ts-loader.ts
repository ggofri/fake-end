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

export async function loadTypeScriptEndpoints(
  mockDir: string,
  options?: { noCache?: boolean; dynamicMocks?: boolean }
): Promise<ParsedEndpoint[]> {
  const tsFiles = await glob(`${mockDir}/**/*.ts`, { absolute: true });
  if (tsFiles.length === 0) return [];

  const endpoints: ParsedEndpoint[] = [];

  for (const filePath of tsFiles) {
    const endpoint = await processTypeScriptFile(filePath, mockDir, options);
    if (endpoint) {
      endpoints.push(endpoint);
    }
  }

  return endpoints;
}

async function processTypeScriptFile(
  filePath: string, 
  mockDir: string,
  options?: { noCache?: boolean; dynamicMocks?: boolean }
): Promise<ParsedEndpoint | null> {
  try {
    const content = await readFile(filePath, 'utf-8');
    
    const parsed = parseInterfaceWithCache(filePath, content, options?.noCache);
    if (!parsed) return null;
    
    const { interface: interfaceDeclaration } = parsed;

    const { httpMethod, endpointPath } = extractEndpointInfoFromPath(filePath, mockDir);
    const mockData = generateMockFromInterface(interfaceDeclaration, options?.dynamicMocks);
    const guard = extractGuardFromInterface(interfaceDeclaration);
    
    const endpoint: TypeScriptEndpoint = {
      method: httpMethod,
      path: endpointPath,
      status: 200,
      body: mockData,
      ...(guard && { guard }),
      ...(options?.dynamicMocks && { 
        _interfaceDeclaration: interfaceDeclaration,
        _dynamicMocks: true 
      })
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
