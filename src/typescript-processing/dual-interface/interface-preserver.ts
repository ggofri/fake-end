import { ExistingFileAnalysis } from './file-analyzer';
import { interfaceExtractor } from './interface-extractor';
import { responseInterfaceGenerator } from './response-interface-generator';

export class InterfacePreserver {
  preserveExistingErrorInterface(existingAnalysis: ExistingFileAnalysis): string {
    const errorInterface = existingAnalysis.allInterfaces.find(
      iface => iface.getName() === 'ErrorResponse'
    );
    
    if (errorInterface) {
      const extracted = interfaceExtractor.extractInterface(errorInterface);
      return interfaceExtractor.generateInterfaceCode(extracted, 'ErrorResponse');
    }
    
    return responseInterfaceGenerator.generateGenericErrorInterface();
  }

  preserveExistingSuccessInterface(existingAnalysis: ExistingFileAnalysis): string {
    const successInterface = existingAnalysis.allInterfaces.find(
      iface => iface.getName() === 'SuccessResponse'
    );
    
    if (successInterface) {
      const extracted = interfaceExtractor.extractInterface(successInterface);
      return interfaceExtractor.generateInterfaceCode(extracted, 'SuccessResponse');
    }
    
    return `export interface SuccessResponse {
  id: string;
  message: string;
  success: boolean;
}`;
  }

  preserveExistingDefaultInterface(existingAnalysis: ExistingFileAnalysis, defaultInterfaceName: string): string {
    if (existingAnalysis.hasDefaultExport && existingAnalysis.defaultInterfaceName) {
      const defaultInterface = existingAnalysis.allInterfaces.find(
        iface => iface.getName() === existingAnalysis.defaultInterfaceName
      );
      
      if (defaultInterface) {
        const extracted = interfaceExtractor.extractInterface(defaultInterface);
        const interfaceCode = interfaceExtractor.generateInterfaceCode(extracted, defaultInterfaceName);
        return interfaceCode.replace('export interface', 'interface');
      }
    }
    
    return responseInterfaceGenerator.generateDefaultInterface(defaultInterfaceName);
  }
}

export const interfacePreserver = new InterfacePreserver();
