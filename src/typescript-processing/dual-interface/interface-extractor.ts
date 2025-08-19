import { InterfaceDeclaration, JSDoc } from 'ts-morph';

export interface ExtractedInterface {
  name: string;
  properties: InterfaceProperty[];
  hasJsDocComments: boolean;
  originalDeclaration: InterfaceDeclaration;
}

export interface InterfaceProperty {
  name: string;
  type: string;
  optional: boolean;
  jsDocComment?: string;
}

export class InterfaceExtractor {
  extractInterface(interfaceDecl: InterfaceDeclaration): ExtractedInterface {
    const properties: InterfaceProperty[] = [];
    
    interfaceDecl.getProperties().forEach(prop => {
      const name = prop.getName();
      const type = prop.getType().getText();
      const optional = prop.hasQuestionToken();
      const jsDocComment = this.extractJsDocComment(prop.getJsDocs());

      properties.push({
        name,
        type,
        optional,
        ...(jsDocComment && { jsDocComment })
      });
    });

    return {
      name: interfaceDecl.getName(),
      properties,
      hasJsDocComments: properties.some(p => p.jsDocComment),
      originalDeclaration: interfaceDecl
    };
  }

  generateInterfaceCode(extracted: ExtractedInterface, newName?: string): string {
    const interfaceName = newName ?? extracted.name;
    let code = `export interface ${interfaceName} {\n`;

    extracted.properties.forEach(prop => {
      if (prop.jsDocComment) {
        code += `  /** ${prop.jsDocComment} */\n`;
      }
      const optionalToken = prop.optional ? '?' : '';
      code += `  ${prop.name}${optionalToken}: ${prop.type};\n`;
    });

    code += '}';
    return code;
  }

  renameInterface(extracted: ExtractedInterface, newName: string): ExtractedInterface {
    return {
      ...extracted,
      name: newName
    };
  }

  private extractJsDocComment(jsDocs: JSDoc[]): string | undefined {
    if (jsDocs.length === 0) return undefined;
    
    const [jsDoc] = jsDocs;
    const comment = jsDoc?.getCommentText();
    return comment ?? undefined;
  }
}

export const interfaceExtractor = new InterfaceExtractor();
