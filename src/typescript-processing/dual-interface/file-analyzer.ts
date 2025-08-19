import { readFile } from "fs/promises";
import { existsSync } from "fs";
import {
  Project,
  InterfaceDeclaration,
  SourceFile,
  ExportDeclaration,
  ExportAssignment,
} from "ts-morph";

export interface ExistingFileAnalysis {
  exists: boolean;
  hasDefaultExport: boolean;
  defaultInterfaceName: string | null;
  allInterfaces: InterfaceDeclaration[];
  hasGuard: boolean;
  sourceFile?: SourceFile;
  project?: Project;
}

export class TypeScriptFileAnalyzer {
  async analyzeFile(filePath: string): Promise<ExistingFileAnalysis> {
    if (!existsSync(filePath)) {
      return {
        exists: false,
        hasDefaultExport: false,
        defaultInterfaceName: null,
        allInterfaces: [],
        hasGuard: false,
      };
    }

    try {
      const content = await readFile(filePath, "utf-8");
      const project = new Project({
        useInMemoryFileSystem: true,
      });
      const sourceFile = project.createSourceFile(`temp-${Date.now()}.ts`, content);

      const allInterfaces = sourceFile.getInterfaces();
      const defaultExportedInterface =
        this.findDefaultExportedInterface(sourceFile);
      const hasGuard = this.hasGuardComment(content);

      return {
        exists: true,
        hasDefaultExport: !!defaultExportedInterface,
        defaultInterfaceName: defaultExportedInterface?.getName() ?? null,
        allInterfaces,
        hasGuard,
        sourceFile,
        project,
      };
    } catch {
      return {
        exists: true,
        hasDefaultExport: false,
        defaultInterfaceName: null,
        allInterfaces: [],
        hasGuard: false,
      };
    }
  }

  private getInterfaceFromDefaultExportAssignment(
    defaultExportAssignment: ExportAssignment,
    sourceFile: SourceFile
  ): InterfaceDeclaration | null {
    const identifier = defaultExportAssignment.getExpression();
    if (identifier) {
      const interfaceName = identifier.getText();
      return sourceFile.getInterface(interfaceName) ?? null;
    }
    return null;
  }

  private getInterfaceFromDefaultExportDeclarations(
    defaultExportDeclarations: ExportDeclaration[],
    sourceFile: SourceFile
  ): InterfaceDeclaration | null {
    const namedExports = defaultExportDeclarations[0]?.getNamedExports();
    if (namedExports && namedExports.length > 0) {
      const exportName = namedExports[0]?.getName();
      return exportName ? sourceFile.getInterface(exportName) ?? null : null;
    }
    return null;
  }

  private findDefaultExportedInterface(
    sourceFile: SourceFile
  ): InterfaceDeclaration | null {
    const defaultExportAssignment = sourceFile
      .getExportAssignments()
      .find((exp) => exp.isExportEquals() === false);

    if (defaultExportAssignment) {
      return this.getInterfaceFromDefaultExportAssignment(
        defaultExportAssignment,
        sourceFile
      );
    }

    const defaultExportDeclarations = sourceFile
      .getExportDeclarations()
      .filter((exp) => exp.getModuleSpecifier() === undefined);

    if (defaultExportDeclarations.length > 0) {
      return this.getInterfaceFromDefaultExportDeclarations(
        defaultExportDeclarations,
        sourceFile
      );
    }

    return null;
  }

  private hasGuardComment(content: string): boolean {
    return content.includes("@guard");
  }
}

export const fileAnalyzer = new TypeScriptFileAnalyzer();
