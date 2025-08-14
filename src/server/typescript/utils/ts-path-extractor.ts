import { validMethods, isValidMethod } from '@/types';
import { extractMethodFromFileName } from '@/server/path-builder';

export function extractEndpointInfoFromPath(filePath: string, mockDir: string): { httpMethod: validMethods; endpointPath: string } {
  const normalizedMockDir = mockDir.endsWith('/') ? mockDir : `${mockDir}/`;
  let relativePath = filePath;
  
  if (filePath.includes(normalizedMockDir)) {
    relativePath = filePath.split(normalizedMockDir)[1] ?? '';
  }
  
  relativePath = relativePath.replace(/\.ts$/, '');
  const pathParts = relativePath.split('/');
  const fileName = pathParts[pathParts.length - 1];
  
  if (!fileName) {
    throw new Error(`Invalid file path: ${filePath}`);
  }
  
  const { method, baseName } = extractMethodFromFileName(fileName);
  const directoryParts = pathParts.slice(0, -1);
  const endpointPath = directoryParts.length > 0 
    ? `/${directoryParts.join('/')}/${baseName}`
    : `/${baseName}`;
  
  if (!isValidMethod(method)) {
    throw new Error(`Invalid HTTP method: ${method} in file ${filePath}`);
  }
  
  return { httpMethod: method, endpointPath };
}
