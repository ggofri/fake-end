import { ExistingFileAnalysis } from './file-analyzer';
import { interfaceExtractor } from './interface-extractor';
import { generateFieldsFromResponse } from './field-generator';

export class ResponseInterfaceGenerator {
  generateErrorInterface(errorResponse: unknown): string {
    let code = 'export interface ErrorResponse {\n';
    
    if (typeof errorResponse === 'object' && errorResponse !== null) {
      const fields = generateFieldsFromResponse(errorResponse);
      fields.forEach(field => {
        code += `  ${field.name}: ${field.type};\n`;
      });
    } else {
      code += '  error: string;\n';
      code += '  message: string;\n';
      code += '  code: number;\n';
    }

    code += '}';
    return code;
  }

  generateGenericErrorInterface(): string {
    return `export interface ErrorResponse {
  error: string;
  message: string;
  code: number;
  details?: string[];
}`;
  }

  generateSuccessInterfaceFromResponse(successResponse: unknown): string {
    let code = 'export interface SuccessResponse {\n';
    
    if (typeof successResponse === 'object' && successResponse !== null) {
      const fields = generateFieldsFromResponse(successResponse);
      fields.forEach(field => {
        code += `  ${field.name}: ${field.type};\n`;
      });
    } else {
      code += '  id: string;\n';
      code += '  message: string;\n';  
      code += '  success: boolean;\n';
    }

    code += '}';
    return code;
  }

  generateSuccessInterface(
    existingAnalysis: ExistingFileAnalysis,
    _newName: string
  ): string {
    if (existingAnalysis.hasDefaultExport && existingAnalysis.defaultInterfaceName) {
      
      const defaultInterface = existingAnalysis.allInterfaces.find(
        iface => iface.getName() === existingAnalysis.defaultInterfaceName
      );
      
      if (defaultInterface) {
        const extracted = interfaceExtractor.extractInterface(defaultInterface);
        return interfaceExtractor.generateInterfaceCode(extracted, 'SuccessResponse');
      }
    }
    
    return `export interface SuccessResponse {
  id: string;
  message: string;
  success: boolean;
}`;
  }

  generateDefaultInterface(interfaceName: string): string {
    return `interface ${interfaceName} {
  message: string;
}`;
  }
}

export const responseInterfaceGenerator = new ResponseInterfaceGenerator();
