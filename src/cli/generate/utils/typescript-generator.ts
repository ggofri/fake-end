import { CurlInfo } from '@/cli/generate/types';
import {
  generateInterfaceName,
  generateFieldsFromResponse,
  generateFieldDeclaration
} from './typescript';

export interface TypeScriptField {
  name: string;
  type: string;
  mockValue?: string;
  isOptional?: boolean;
}

export function generateTypeScriptInterface(
  curlInfo: CurlInfo, 
  responseData: unknown,
  interfaceName?: string
): string {
  const name = interfaceName ?? generateInterfaceName(curlInfo);
  const fields = generateFieldsFromResponse(responseData);
  
  const interfaceContent = `interface ${name} {
${fields.map(field => generateFieldDeclaration(field)).join('\n')}
}

export default ${name};
`;

  return interfaceContent;
}
