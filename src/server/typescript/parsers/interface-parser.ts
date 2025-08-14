import { Project, Node, InterfaceDeclaration, SourceFile } from 'ts-morph';

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
