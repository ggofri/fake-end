function normalizeMockDir(mockDir: string): string {
  return mockDir.endsWith('/') ? mockDir : `${mockDir}/`;
}

function extractRelativePath(filePath: string, normalizedMockDir: string): string {
  if (filePath.includes(normalizedMockDir)) {
    return filePath.split(normalizedMockDir)[1] ?? '';
  }
  
  const absoluteMockDir = `${process.cwd()}/${normalizedMockDir}`;
  if (filePath.includes(absoluteMockDir)) {
    return filePath.split(absoluteMockDir)[1] ?? '';
  }
  
  return filePath;
}

function shouldSkipFileNameInPath(endpointPath: string, fileName: string): boolean {
  return endpointPath.startsWith(`/${fileName}`) || endpointPath === `/${fileName}`;
}

function buildPathWithDirectory(directoryPath: string, fileName: string, endpointPath: string): string {
  if (endpointPath.startsWith(`/${fileName}`)) {
    return `/${directoryPath}${endpointPath}`;
  }
  return `/${directoryPath}/${fileName}${endpointPath}`;
}

function buildPathWithFileOnly(fileName: string, endpointPath: string): string {
  if (shouldSkipFileNameInPath(endpointPath, fileName)) {
    return endpointPath;
  }
  return `/${fileName}${endpointPath}`;
}

export function buildEndpointPath(filePath: string, mockDir: string, endpointPath: string): string {
  const normalizedMockDir = normalizeMockDir(mockDir);
  let relativePath = extractRelativePath(filePath, normalizedMockDir);
  
  relativePath = relativePath.replace(/\.(yaml|yml|ts)$/, '');
  const pathParts = relativePath.split('/');
  const fileName = pathParts[pathParts.length - 1];
  const directoryPath = pathParts.slice(0, -1).join('/');
  
  if (directoryPath && fileName) {
    return buildPathWithDirectory(directoryPath, fileName, endpointPath);
  } else if (fileName) {
    return buildPathWithFileOnly(fileName, endpointPath);
  }
  
  return endpointPath;
}

export function extractMethodFromFileName(fileName: string): { method: string; baseName: string } {
  const fileNameParts = fileName.split('.');
  
  if (fileNameParts.length > 1) {
    const lastPart = fileNameParts[fileNameParts.length - 1]?.toUpperCase();
    if (lastPart && ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'].includes(lastPart)) {
      return {
        method: lastPart,
        baseName: fileNameParts.slice(0, -1).join('.')
      };
    }
  }
  
  return { method: 'GET', baseName: fileName };
}
