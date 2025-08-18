import { CurlInfo } from '@/cli/generate/types';
import {
  generateInterfaceName,
  generateFieldsFromResponse,
  generateFieldDeclaration
} from './typescript';
import { MockStrategy } from './typescript/mock-value-generator';

export interface TypeScriptField {
  name: string;
  type: string;
  mockValue?: string;
  isOptional?: boolean;
}

export function generateTypeScriptInterface(
  curlInfo: CurlInfo, 
  responseData: unknown,
  interfaceName?: string,
  mockStrategy: MockStrategy = 'sanitize'
): string {
  const name = interfaceName ?? generateInterfaceName(curlInfo);
  const fields = generateFieldsFromResponse(responseData, mockStrategy);
  
  const interfaceContent = `interface ${name} {
${fields.map(field => generateFieldDeclaration(field)).join('\n')}
}

export default ${name};
`;

  return interfaceContent;
}
