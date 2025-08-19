import path from 'path';
import { CurlInfo } from '@/mock-generation/types';
import { isNil } from '@/shared/utils';

export const createTypeScriptFilePath = (curlInfo: CurlInfo, outputDir: string): string => {
  const { method, path: urlPath } = curlInfo;
  
  const pathParts = generatePathParts(urlPath);
  const fileName = generateFileName(pathParts, method);
  const dirPath = generateDirectoryPath(pathParts, outputDir);
  
  return path.join(dirPath, fileName);
};

const generatePathParts = (urlPath: string): string[] => {
  const pathParts: string[] = [];
  let paramCount = 1;
  
  urlPath.split('/').forEach(part => {
    if (isNil(part) || !part.trim()) return;
    if (isNaN(Number(part))) return pathParts.push(part);
    pathParts.push(`:param${paramCount}`);
    return paramCount++;
  });
  
  return pathParts.length === 0 ? ['api'] : pathParts;
};

const generateFileName = (pathParts: string[], method: string): string => {
  const baseName = pathParts[pathParts.length - 1];
  return `${baseName}.${method.toLowerCase()}.ts`;
};

const generateDirectoryPath = (pathParts: string[], outputDir: string): string => {
  return pathParts.length > 1 
    ? path.join(outputDir, ...pathParts.slice(0, -1))
    : outputDir;
};

export const generateDefaultInterfaceName = (curlInfo: CurlInfo): string => {
  const pathParts = curlInfo.path.split('/').filter(part => part && !part.startsWith(':'));
  const meaningfulParts = pathParts.filter(part => isNaN(Number(part)));
  const baseName = meaningfulParts[meaningfulParts.length - 1] ?? 'Api';
  const method = curlInfo.method.charAt(0).toUpperCase() + curlInfo.method.slice(1).toLowerCase();
  
  return `${baseName.charAt(0).toUpperCase() + baseName.slice(1)}${method}Response`;
};
