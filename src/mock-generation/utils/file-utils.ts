import fs from 'fs/promises';
import path from 'path';
import yaml from 'js-yaml';
import { CurlInfo, isArrayOfMockEndpoints, MockEndpoint } from '@/mock-generation/types';
import { log } from '@/shared/utils/logger';

export function generateFilePath(curlInfo: CurlInfo, outputDir: string): string {
  const { path: urlPath } = curlInfo;
  
  let filePath = urlPath.replace(/^\//, '').replace(/\/$/, '');
  
  filePath = filePath.replace(/\/:\w+/g, '');
  filePath = filePath.replace(/\/\{\w+\}/g, '');
  
  if (!filePath) {
    filePath = 'index';
  }
  
  const pathParts = filePath.split('/');
  const fileName = pathParts.pop() ?? 'index';
  const dirPath = pathParts.length > 0 ? pathParts.join('/') : '';
  
  const fullDirPath = dirPath ? path.join(outputDir, dirPath) : outputDir;
  return path.join(fullDirPath, `${fileName}.yaml`);
}

export function getRelativeEndpointPath(curlInfo: CurlInfo): string {
  const { path: urlPath } = curlInfo;
  
  let filePath = urlPath.replace(/^\//, '').replace(/\/$/, '');
  filePath = filePath.replace(/\/:\w+/g, '');
  filePath = filePath.replace(/\/\{\w+\}/g, '');
  
  if (!filePath) {
    return urlPath;
  }
  
  const pathParts = filePath.split('/');
  const fileName = pathParts.pop() ?? 'index';
  const dirPath = pathParts.length > 0 ? pathParts.join('/') : '';
  
  if (dirPath) {
    const directoryPrefix = `/${dirPath}`;
    if (urlPath.startsWith(directoryPrefix)) {
      const relativePath = urlPath.substring(directoryPrefix.length);
      return relativePath ?? `/${fileName}`;
    }
  }
  
  return urlPath;
}

export async function writeYamlFile(filePath: string, endpoints: MockEndpoint[]): Promise<void> {
  const dirPath = path.dirname(filePath);
  await fs.mkdir(dirPath, { recursive: true });
  
  let existingEndpoints: MockEndpoint[] = [];
  try {
    const existingContent = await fs.readFile(filePath, 'utf8');
    const parsed = yaml.load(existingContent);
    if (isArrayOfMockEndpoints(parsed)) {
      existingEndpoints = parsed;
    }
  } catch {
    log("YAML File doesn't exists, creating it");
  }
  
  const mergedEndpoints = [...existingEndpoints];
  for (const newEndpoint of endpoints) {
    const existingIndex = mergedEndpoints.findIndex(
      ep => ep.method === newEndpoint.method && ep.path === newEndpoint.path
    );
    
    if (existingIndex >= 0) {
      mergedEndpoints[existingIndex] = newEndpoint;
    } else {
      mergedEndpoints.push(newEndpoint);
    }
  }
  
  const yamlContent = yaml.dump(mergedEndpoints, {
    indent: 2,
    lineWidth: -1,
    noRefs: true
  });
  
  await fs.writeFile(filePath, yamlContent, 'utf8');
}
