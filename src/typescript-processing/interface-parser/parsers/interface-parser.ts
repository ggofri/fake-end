import { Project, Node, InterfaceDeclaration, SourceFile } from 'ts-morph';
import { interfaceCache } from '@/typescript-processing/cache/interface-cache';

export function createTypeScriptProject(): Project {
  return new Project({
    useInMemoryFileSystem: true,
    compilerOptions: {
      target: 99,
      module: 99,
      moduleResolution: 2,
      allowSyntheticDefaultImports: true,
      esModuleInterop: true,
      skipLibCheck: true,
      strict: false
    }
  });
}

export function extractDefaultInterface(sourceFile: SourceFile): InterfaceDeclaration | null {
  const defaultExportSymbol = sourceFile.getDefaultExportSymbol();
  if (!defaultExportSymbol) return null;

  const exportedDeclarations = sourceFile.getExportedDeclarations();
  const defaultExports = exportedDeclarations.get('default');
  
  if (defaultExports && defaultExports.length > 0) {
    for (const exportedDecl of defaultExports) {
      if (Node.isInterfaceDeclaration(exportedDecl)) {
        return exportedDecl;
      }
    }
  }
  
  return null;
}

export function parseInterfaceWithCache(filePath: string, content: string, noCache?: boolean): { interface: InterfaceDeclaration; project: Project } | null {
  if (!noCache) {
    const cached = interfaceCache.get(filePath, content);
    if (cached) {
      return cached;
    }
  }

  const project = createTypeScriptProject();
  const sourceFile = project.createSourceFile(filePath, content);
  const interfaceDecl = extractDefaultInterface(sourceFile);
  
  if (interfaceDecl) {
    const result = { interface: interfaceDecl, project };
    if (!noCache) {
      interfaceCache.set(filePath, content, interfaceDecl, project);
    }
    return result;
  }
  
  return null;
}
