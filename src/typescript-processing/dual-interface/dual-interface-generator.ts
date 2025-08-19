import { CurlInfo } from '@/mock-generation/types';
import { GuardCondition } from '@/shared/types';
import { ExistingFileAnalysis } from './file-analyzer';
import { interfaceExtractor, ExtractedInterface } from './interface-extractor';
import { guardConditionGenerator } from './guard-condition-generator';
import { generateFieldsFromResponse } from './field-generator';
import { HTTP_STATUS } from '@/shared/constants';
import { isRecordOfUnknown } from '@/shared/utils/typeguards';
import { InterfaceDeclaration } from 'ts-morph';

export interface DualInterfaceStructure {
  guardComment: string;
  errorInterface: string;
  successInterface: string;
  defaultInterface: string;
  exportStatement: string;
}

type InterfaceGenerator = (response: unknown) => string;
type InterfacePreserver = (analysis: ExistingFileAnalysis, name?: string) => string;

const inferErrorStatus = (condition: GuardCondition): number => {
  if (condition.field === 'user.role' || condition.field?.includes('admin')) {
    return HTTP_STATUS.FORBIDDEN; 
  }
  
  if (condition.field?.includes('auth') || condition.field?.includes('token')) {
    return HTTP_STATUS.UNAUTHORIZED; 
  }

  if (condition.operator === 'exists' || condition.operator === 'not_equals') {
    return HTTP_STATUS.BAD_REQUEST; 
  }

  return HTTP_STATUS.BAD_REQUEST; 
};

const inferSuccessStatus = (): number => HTTP_STATUS.OK;

const generateGenericErrorInterface = (): string => `export interface ErrorResponse {
  error: string;
  message: string;
  code: number;
  details?: string[];
}`;

const generateDefaultInterface = (interfaceName: string): string => `interface ${interfaceName} {
  message: string;
}`;

export class DualInterfaceGenerator {
  generate(
    curlInfo: CurlInfo,
    errorResponse: unknown,
    existingAnalysis: ExistingFileAnalysis,
    defaultInterfaceName: string
  ): DualInterfaceStructure {
    const guardCondition = guardConditionGenerator.getBestCondition(curlInfo);
    const guardComment = this.generateGuardComment(guardCondition);
    
    const errorInterface = this.generateErrorInterface(errorResponse);
    const successInterface = this.generateSuccessInterface(existingAnalysis, defaultInterfaceName);
    const defaultInterface = generateDefaultInterface(defaultInterfaceName);
    const exportStatement = `export default ${defaultInterfaceName};`;

    return {
      guardComment,
      errorInterface,
      successInterface,
      defaultInterface,
      exportStatement
    };
  }

  generateForSuccess(
    curlInfo: CurlInfo,
    successResponse: unknown,
    defaultInterfaceName: string
  ): DualInterfaceStructure {
    const guardCondition = guardConditionGenerator.getBestCondition(curlInfo);
    const guardComment = this.generateGuardComment(guardCondition, true);
    
    const errorInterface = generateGenericErrorInterface();
    const successInterface = this.generateSuccessInterfaceFromResponse(successResponse);
    const defaultInterface = generateDefaultInterface(defaultInterfaceName);
    const exportStatement = `export default ${defaultInterfaceName};`;

    return {
      guardComment,
      errorInterface,
      successInterface,
      defaultInterface,
      exportStatement
    };
  }

  updateErrorInterface(
    curlInfo: CurlInfo,
    errorResponse: unknown,
    existingAnalysis: ExistingFileAnalysis,
    defaultInterfaceName: string
  ): DualInterfaceStructure {
    const guardCondition = guardConditionGenerator.getBestCondition(curlInfo);
    const guardComment = this.generateGuardComment(guardCondition);
    
    const errorInterface = this.generateErrorInterface(errorResponse);
    const successInterface = this.preserveExistingSuccessInterface(existingAnalysis);
    const defaultInterface = this.preserveExistingDefaultInterface(existingAnalysis, defaultInterfaceName);
    const exportStatement = `export default ${defaultInterfaceName};`;

    return {
      guardComment,
      errorInterface,
      successInterface,
      defaultInterface,
      exportStatement
    };
  }

  updateSuccessInterface(
    curlInfo: CurlInfo,
    successResponse: unknown,
    existingAnalysis: ExistingFileAnalysis,
    defaultInterfaceName: string
  ): DualInterfaceStructure {
    const guardCondition = guardConditionGenerator.getBestCondition(curlInfo);
    const guardComment = this.generateGuardComment(guardCondition, true);
    
    const errorInterface = this.preserveExistingErrorInterface(existingAnalysis);
    const successInterface = this.generateSuccessInterfaceFromResponse(successResponse);
    const defaultInterface = this.preserveExistingDefaultInterface(existingAnalysis, defaultInterfaceName);
    const exportStatement = `export default ${defaultInterfaceName};`;

    return {
      guardComment,
      errorInterface,
      successInterface,
      defaultInterface,
      exportStatement
    };
  }

  private generateGuardComment = (condition: GuardCondition, isSuccessMode: boolean = false): string => {
    const createGuardObject = (condition: GuardCondition, isSuccessMode: boolean): Record<string, unknown> => ({
      condition,
      left: {
        status: isSuccessMode ? inferSuccessStatus() : inferErrorStatus(condition),
        interface: isSuccessMode ? "SuccessResponse" : "ErrorResponse"
      },
      right: {
        status: isSuccessMode ? inferErrorStatus(condition) : inferSuccessStatus(),
        interface: isSuccessMode ? "ErrorResponse" : "SuccessResponse" 
      }
    });

    const formatGuardComment = (guardObj: Record<string, unknown>): string =>
      `/**\n * @guard ${JSON.stringify(guardObj, null, 1).replace(/\n/g, '\n * ')}\n */`;

    return formatGuardComment(createGuardObject(condition, isSuccessMode));
  };

  private generateErrorInterface: InterfaceGenerator = (errorResponse: unknown): string => {
    const generateFromObject = (response: Record<string, unknown>): string => {
      const fields = generateFieldsFromResponse(response);
      return fields.map(field => `  ${field.name}: ${field.type};`).join('\n');
    };

    const generateGenericFields = (): string => [
      '  error: string;',
      '  message: string;',
      '  code: number;',
      '  details?: string[];'
    ].join('\n');

    const fieldsContent = isRecordOfUnknown(errorResponse)
      ? generateFromObject(errorResponse)
      : generateGenericFields();

    return `export interface ErrorResponse {\n${fieldsContent}\n}`;
  };

  private generateSuccessInterfaceFromResponse: InterfaceGenerator = (successResponse: unknown): string => {
    const generateFromObject = (response: Record<string, unknown>): string => {
      const fields = generateFieldsFromResponse(response);
      return fields.map(field => `  ${field.name}: ${field.type};`).join('\n');
    };

    const generateGenericFields = (): string => [
      '  id: string;',
      '  message: string;',
      '  success: boolean;'
    ].join('\n');

    const fieldsContent = isRecordOfUnknown(successResponse)
      ? generateFromObject(successResponse)
      : generateGenericFields();

    return `export interface SuccessResponse {\n${fieldsContent}\n}`;
  };

  private generateSuccessInterface: InterfacePreserver = (
    existingAnalysis: ExistingFileAnalysis,
    _newName?: string
  ): string => {
    const extractExistingInterface = (analysis: ExistingFileAnalysis): ExtractedInterface | null => {
      if (!analysis.hasDefaultExport || !analysis.defaultInterfaceName) return null;
      
      const defaultInterface = analysis.allInterfaces.find(
        iface => iface.getName() === analysis.defaultInterfaceName
      );
      
      return defaultInterface ? interfaceExtractor.extractInterface(defaultInterface) : null;
    };

    const generateDefaultSuccessInterface = (): string => `export interface SuccessResponse {
  id: string;
  message: string;
  success: boolean;
}`;

    const extracted = extractExistingInterface(existingAnalysis);
    return extracted 
      ? interfaceExtractor.generateInterfaceCode(extracted, 'SuccessResponse')
      : generateDefaultSuccessInterface();
  };

  private preserveExistingErrorInterface = (existingAnalysis: ExistingFileAnalysis): string => {
    const findInterfaceByName = (name: string): InterfaceDeclaration | undefined => 
      existingAnalysis.allInterfaces.find(iface => iface.getName() === name);

    const errorInterface = findInterfaceByName('ErrorResponse');
    
    return errorInterface 
      ? interfaceExtractor.generateInterfaceCode(
          interfaceExtractor.extractInterface(errorInterface), 
          'ErrorResponse'
        )
      : generateGenericErrorInterface();
  };

  private preserveExistingSuccessInterface = (existingAnalysis: ExistingFileAnalysis): string => {
    const findInterfaceByName = (name: string): InterfaceDeclaration | undefined => 
      existingAnalysis.allInterfaces.find(iface => iface.getName() === name);

    const generateDefaultSuccessInterface = (): string => `export interface SuccessResponse {
  id: string;
  message: string;
  success: boolean;
}`;

    const successInterface = findInterfaceByName('SuccessResponse');
    
    return successInterface 
      ? interfaceExtractor.generateInterfaceCode(
          interfaceExtractor.extractInterface(successInterface), 
          'SuccessResponse'
        )
      : generateDefaultSuccessInterface();
  };

  private preserveExistingDefaultInterface = (existingAnalysis: ExistingFileAnalysis, defaultInterfaceName: string): string => {
    const extractAndFormat = (analysis: ExistingFileAnalysis, targetName: string): string | null => {
      if (!analysis.hasDefaultExport || !analysis.defaultInterfaceName) return null;
      
      const defaultInterface = analysis.allInterfaces.find(
        iface => iface.getName() === analysis.defaultInterfaceName
      );
      
      if (!defaultInterface) return null;
      
      const extracted = interfaceExtractor.extractInterface(defaultInterface);
      const interfaceCode = interfaceExtractor.generateInterfaceCode(extracted, targetName);
      return interfaceCode.replace('export interface', 'interface');
    };

    return extractAndFormat(existingAnalysis, defaultInterfaceName) 
      ?? generateDefaultInterface(defaultInterfaceName);
  };

  generateCompleteFile(structure: DualInterfaceStructure): string {
    return [
      structure.errorInterface,
      '',
      structure.successInterface, 
      '',
      structure.guardComment,
      structure.defaultInterface,
      '',
      structure.exportStatement,
      ''
    ].join('\n');
  }
}

export const dualInterfaceGenerator = new DualInterfaceGenerator();
