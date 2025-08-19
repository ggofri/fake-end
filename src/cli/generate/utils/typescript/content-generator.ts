import { CurlInfo, MockEndpoint } from '@/cli/generate/types';
import { generateTypeScriptInterface } from '@/cli/generate/utils/typescript-generator';
import { MockStrategy } from './mock-value-generator';
import { fileAnalyzer } from './file-analyzer';
import { dualInterfaceGenerator } from './dual-interface-generator';

export interface ContentGenerator {
  generate(curlInfo: CurlInfo, endpoint: MockEndpoint, filePath: string): Promise<string>;
}

export class StandardContentGenerator implements ContentGenerator {
  constructor(private mockStrategy: MockStrategy = 'sanitize') {}

  generate(curlInfo: CurlInfo, endpoint: MockEndpoint): Promise<string> {
    return Promise.resolve(generateTypeScriptInterface(curlInfo, endpoint.body, undefined, this.mockStrategy));
  }
}

export class ErrorModeContentGenerator implements ContentGenerator {
  async generate(curlInfo: CurlInfo, endpoint: MockEndpoint, filePath: string): Promise<string> {
    const analysis = await fileAnalyzer.analyzeFile(filePath);
    const defaultInterfaceName = generateDefaultInterfaceName(curlInfo);
    
    const hasErrorInterface = analysis.allInterfaces.some(iface => iface.getName() === 'ErrorResponse');
    const hasSuccessInterface = analysis.allInterfaces.some(iface => iface.getName() === 'SuccessResponse');
    
    let structure;
    if (hasErrorInterface || hasSuccessInterface) {
      structure = dualInterfaceGenerator.updateErrorInterface(
        curlInfo,
        endpoint.body,
        analysis,
        defaultInterfaceName
      );
    } else {
      structure = dualInterfaceGenerator.generate(
        curlInfo,
        endpoint.body,
        analysis,
        defaultInterfaceName
      );
    }
    
    return dualInterfaceGenerator.generateCompleteFile(structure);
  }
}

export class SuccessModeContentGenerator implements ContentGenerator {
  async generate(curlInfo: CurlInfo, endpoint: MockEndpoint, filePath: string): Promise<string> {
    const analysis = await fileAnalyzer.analyzeFile(filePath);
    const defaultInterfaceName = generateDefaultInterfaceName(curlInfo);
    
    const hasErrorInterface = analysis.allInterfaces.some(iface => iface.getName() === 'ErrorResponse');
    const hasSuccessInterface = analysis.allInterfaces.some(iface => iface.getName() === 'SuccessResponse');
    
    let structure;
    if (hasErrorInterface || hasSuccessInterface) {
      structure = dualInterfaceGenerator.updateSuccessInterface(
        curlInfo,
        endpoint.body,
        analysis,
        defaultInterfaceName
      );
    } else {
      structure = dualInterfaceGenerator.generateForSuccess(
        curlInfo,
        endpoint.body,
        defaultInterfaceName
      );
    }
    
    return dualInterfaceGenerator.generateCompleteFile(structure);
  }
}

function generateDefaultInterfaceName(curlInfo: CurlInfo): string {
  const pathParts = curlInfo.path.split('/').filter(part => part && !part.startsWith(':'));
  const meaningfulParts = pathParts.filter(part => isNaN(Number(part)));
  const baseName = meaningfulParts[meaningfulParts.length - 1] ?? 'Api';
  const method = curlInfo.method.charAt(0).toUpperCase() + curlInfo.method.slice(1).toLowerCase();
  
  return `${baseName.charAt(0).toUpperCase() + baseName.slice(1)}${method}Response`;
}

export const contentGenerators = {
  standard: new StandardContentGenerator(),
  error: new ErrorModeContentGenerator(),
  success: new SuccessModeContentGenerator()
} as const;
