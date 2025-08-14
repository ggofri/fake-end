export function buildEndpointPath(filePath: string, mockDir: string, endpointPath: string): string {
  const normalizedMockDir = mockDir.endsWith('/') ? mockDir : `${mockDir}/`;
  let relativePath = filePath;
  
  if (filePath.includes(normalizedMockDir)) {
    relativePath = filePath.split(normalizedMockDir)[1] ?? '';
  } else {
    const absoluteMockDir = `${process.cwd()}/${normalizedMockDir}`;
    if (filePath.includes(absoluteMockDir)) {
      relativePath = filePath.split(absoluteMockDir)[1] ?? '';
    }
  }
  
  relativePath = relativePath.replace(/\.(yaml|yml|ts)$/, '');
  const pathParts = relativePath.split('/');
  const fileName = pathParts[pathParts.length - 1];
  const directoryPath = pathParts.slice(0, -1).join('/');
  
  if (directoryPath && fileName) {
    return `/${directoryPath}/${fileName}${endpointPath}`;
  } else if (fileName) {
    return `/${fileName}${endpointPath}`;
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
