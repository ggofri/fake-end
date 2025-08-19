import path from 'path';
import { CurlInfo, MockEndpoint, FileManager } from '@/cli/generate/types';
import { generateFilePath, writeYamlFile } from '@/cli/generate/utils/file-utils';
import { createTypeScriptFilePath } from '@/cli/generate/utils/typescript/file-path-utils';
import { ensureDirectory, writeFileContent } from '@/cli/generate/utils/typescript/file-system-utils';
import { resolveContentMode, type ContentMode } from '@/cli/generate/utils/typescript/mode-resolver';
import { contentGenerators } from '@/cli/generate/utils/typescript/content-generator';

export class TypeScriptFileManager implements FileManager {
  constructor(
    private useYamlFormat: boolean = false, 
    private errorMode: boolean = false,
    private successMode: boolean = false
  ) {}

  private readonly contentGeneratorMap = {
    standard: contentGenerators.standard,
    error: contentGenerators.error,
    success: contentGenerators.success
  } as const;

  async ensureOutputDirectory(outputPath: string): Promise<void> {
    await ensureDirectory(outputPath);
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
    const filePath = createTypeScriptFilePath(curlInfo, output);
    const dirPath = path.dirname(filePath);
    
    await ensureDirectory(dirPath);
    
    const mode = await resolveContentMode({
      errorMode: this.errorMode,
      successMode: this.successMode,
      filePath
    });
    
    const content = await this.generateContent(mode, curlInfo, endpoint, filePath);
    await writeFileContent(filePath, content);
    
    return filePath;
  }

  private async generateContent(
    mode: ContentMode,
    curlInfo: CurlInfo,
    endpoint: MockEndpoint,
    filePath: string
  ): Promise<string> {
    const generator = this.contentGeneratorMap[mode];
    return generator.generate(curlInfo, endpoint, filePath);
  }

}
