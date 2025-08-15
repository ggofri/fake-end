import { InterfaceDeclaration, Project } from 'ts-morph';
import { createHash } from 'crypto';
import { CACHE_MAX_AGE_MINUTES, CACHE_MAX_ENTRIES, CACHE_CLEANUP_BUFFER, MILLISECONDS_PER_MINUTE } from '@/constants';

interface CachedInterface {
  interface: InterfaceDeclaration;
  project: Project;
  hash: string;
  timestamp: number;
}

class TypeScriptInterfaceCache {
  private cache = new Map<string, CachedInterface>();
  private maxAge = CACHE_MAX_AGE_MINUTES * MILLISECONDS_PER_MINUTE;
  private maxEntries = CACHE_MAX_ENTRIES;

  private getContentHash(content: string): string {
    return createHash('md5').update(content).digest('hex');
  }

  get(filePath: string, content: string): { interface: InterfaceDeclaration; project: Project } | null {
    const hash = this.getContentHash(content);
    const cached = this.cache.get(filePath);
    
    if (cached && cached.hash === hash && Date.now() - cached.timestamp < this.maxAge) {
      return { interface: cached.interface, project: cached.project };
    }
    
    return null;
  }

  set(filePath: string, content: string, interfaceDecl: InterfaceDeclaration, project: Project): void {
    const hash = this.getContentHash(content);
    
    if (this.cache.size >= this.maxEntries) {
      this.cleanup();
    }
    
    this.cache.set(filePath, {
      interface: interfaceDecl,
      project,
      hash,
      timestamp: Date.now()
    });
  }

  private cleanup(): void {
    const now = Date.now();
    const entriesToDelete: string[] = [];
    
    for (const [key, value] of this.cache.entries()) {
      if (now - value.timestamp > this.maxAge) {
        entriesToDelete.push(key);
      }
    }
    
    if (this.cache.size - entriesToDelete.length >= this.maxEntries) {
      const sortedEntries = Array.from(this.cache.entries())
        .sort((a, b) => a[1].timestamp - b[1].timestamp);
      
      const additionalToDelete = sortedEntries
        .slice(0, this.cache.size - this.maxEntries + entriesToDelete.length + CACHE_CLEANUP_BUFFER)
        .map(([key]) => key);
      
      entriesToDelete.push(...additionalToDelete);
    }
    
    entriesToDelete.forEach(key => this.cache.delete(key));
  }

  clear(): void {
    this.cache.clear();
  }

  size(): number {
    return this.cache.size;
  }
}

export const interfaceCache = new TypeScriptInterfaceCache();

process.on('exit', () => {
  interfaceCache.clear();
});
