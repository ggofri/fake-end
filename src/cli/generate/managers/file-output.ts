import fs from 'fs/promises';
import { CurlInfo, MockEndpoint, FileManager } from '@/cli/generate/types';
import { generateFilePath, writeYamlFile } from '@/cli/generate/utils/file-utils';

export class FileOutputManager implements FileManager {
  async ensureOutputDirectory(outputPath: string): Promise<void> {
    await fs.mkdir(outputPath, { recursive: true });
  }

  async writeEndpointFile(curlInfo: CurlInfo, output: string, endpoint: MockEndpoint): Promise<string> {
    const filePath = generateFilePath(curlInfo, output);
    await writeYamlFile(filePath, [endpoint]);
    return filePath;
  }
}
