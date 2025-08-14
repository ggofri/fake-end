import { readFile } from 'fs/promises';
import { glob } from 'glob';
import { Project } from 'ts-morph';
import { ParsedEndpoint } from '@/types';
import { 
  createTypeScriptProject, 
  extractDefaultInterface,
  generateMockFromInterface,
  extractEndpointInfoFromPath,
  isValidTypeScriptEndpoint
} from './typescript/';
import type { TypeScriptEndpoint } from './typescript/';
import { verboseError } from '@/utils';
import chalk from 'chalk';

export async function loadTypeScriptEndpoints(mockDir: string): Promise<ParsedEndpoint[]> {
  const tsFiles = await glob(`${mockDir}/**/*.ts`, { absolute: true });
  if (tsFiles.length === 0) return [];

  const project = createTypeScriptProject();
  const endpoints: ParsedEndpoint[] = [];

  for (const filePath of tsFiles) {
    const endpoint = await processTypeScriptFile(filePath, mockDir, project);
    if (endpoint) {
      endpoints.push(endpoint);
    }
  }

  return endpoints;
}

async function processTypeScriptFile(filePath: string, mockDir: string, project: Project): Promise<ParsedEndpoint | null> {
  try {
    const content = await readFile(filePath, 'utf-8');
    const sourceFile = project.createSourceFile(filePath, content);
    
    const interfaceDeclaration = extractDefaultInterface(sourceFile);
    if (!interfaceDeclaration) return null;

    const { httpMethod, endpointPath } = extractEndpointInfoFromPath(filePath, mockDir);
    const mockData = generateMockFromInterface(interfaceDeclaration);
    
    const endpoint: TypeScriptEndpoint = {
      method: httpMethod,
      path: endpointPath,
      status: 200,
      body: mockData
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
