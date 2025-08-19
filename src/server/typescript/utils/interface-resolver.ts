import { InterfaceDeclaration } from 'ts-morph';
import { glob } from 'glob';
import { readFile } from 'fs/promises';

const SCAN_COOLDOWN_MS = 5000;

interface InterfaceRegistry {
  [name: string]: {
    interface: InterfaceDeclaration;
    filePath: string;
  };
}

class TypeScriptInterfaceResolver {
  private registry: InterfaceRegistry = {};
  private lastScanTime = 0;
  private scanCooldown = SCAN_COOLDOWN_MS;

  async resolveInterface(interfaceName: string, mockDir: string): Promise<InterfaceDeclaration | null> {
    const now = Date.now();
    
    if (now - this.lastScanTime > this.scanCooldown || !this.registry[interfaceName]) {
      await this.scanInterfaces(mockDir);
      this.lastScanTime = now;
    }

    return this.registry[interfaceName]?.interface ?? null;
  }

  private async scanInterfaces(mockDir: string): Promise<void> {
    try {
      const tsFiles = await glob(`${mockDir}/**/*.ts`, { absolute: true });
      const newRegistry: InterfaceRegistry = {};

      for (const filePath of tsFiles) {
        const content = await readFile(filePath, 'utf-8');
        const interfaces = await this.extractAllInterfaces(filePath, content);
        
        for (const interfaceDecl of interfaces) {
          const interfaceName = interfaceDecl.getName();
          newRegistry[interfaceName] = {
            interface: interfaceDecl,
            filePath
          };
        }
      }

      this.registry = { ...this.registry, ...newRegistry };
    } catch {
      this.registry = {};
    }
  }

  private async extractAllInterfaces(_filePath: string, content: string): Promise<InterfaceDeclaration[]> {
    try {
      const { Project } = await import('ts-morph');
      const project = new Project({
        useInMemoryFileSystem: true,
      });
      const sourceFile = project.createSourceFile(`temp-${Date.now()}.ts`, content);
      return sourceFile.getInterfaces();
    } catch {
      return [];
    }
  }

  getAllInterfaces(): InterfaceRegistry {
    return { ...this.registry };
  }

  clearCache(): void {
    this.registry = {};
    this.lastScanTime = 0;
  }
}

export const interfaceResolver = new TypeScriptInterfaceResolver();
