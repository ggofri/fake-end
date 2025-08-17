import fs from 'fs/promises';
import path from 'path';
import { CurlInfo, MockEndpoint, FileManager } from '@/cli/generate/types';
import { generateFilePath, writeYamlFile } from '@/cli/generate/utils/file-utils';
import { generateTypeScriptInterface } from '@/cli/generate/utils/typescript-generator';

export class TypeScriptFileManager implements FileManager {
  constructor(private useYamlFormat: boolean = false) {}

  async ensureOutputDirectory(outputPath: string): Promise<void> {
    await fs.mkdir(outputPath, { recursive: true });
  }

  async writeEndpointFile(curlInfo: CurlInfo, output: string, endpoint: MockEndpoint): Promise<string> {
    if (this.useYamlFormat) {
      return this.writeYamlFile(curlInfo, output, endpoint);
    }
    
    return this.writeTypeScriptFile(curlInfo, output, endpoint);
  }

  private async writeYamlFile(curlInfo: CurlInfo, output: string, endpoint: MockEndpoint): Promise<string> {
    const filePath = generateFilePath(curlInfo, output);
    await writeYamlFile(filePath, [endpoint]);
    return filePath;
  }

  private async writeTypeScriptFile(curlInfo: CurlInfo, output: string, endpoint: MockEndpoint): Promise<string> {
    const filePath = this.generateTypeScriptFilePath(curlInfo, output);
    const dirPath = path.dirname(filePath);
    
    await fs.mkdir(dirPath, { recursive: true });
    
    const interfaceContent = generateTypeScriptInterface(curlInfo, endpoint.body);
    await fs.writeFile(filePath, interfaceContent, 'utf8');
    return filePath;
  }

  private generateTypeScriptFilePath(curlInfo: CurlInfo, outputDir: string): string {
    const { method, path: urlPath } = curlInfo;
    
    let pathParts = urlPath.split('/').filter(Boolean);
    
    pathParts = pathParts.filter(part => !part.startsWith(':') && isNaN(Number(part)));
    
    if (pathParts.length === 0) {
      pathParts = ['api'];
    }
    
    const fileName = `${pathParts[pathParts.length - 1]}.${method.toLowerCase()}.ts`;
    const dirPath = pathParts.length > 1 ? 
      path.join(outputDir, ...pathParts.slice(0, -1)) : 
      outputDir;
    
    return path.join(dirPath, fileName);
  }
}
