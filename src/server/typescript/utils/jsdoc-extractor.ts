import { PropertySignature, InterfaceDeclaration } from 'ts-morph';
import type { GuardFunction } from '@/types';

export function extractMockTagValue(prop: PropertySignature): string | null {
  const mockTag = prop.getJsDocs()
    .flatMap(doc => doc.getTags())
    .find(tag => tag.getTagName() === 'mock');
  
  const mockValue = mockTag?.getComment();
  
  if (!mockValue) return null;
  
  return typeof mockValue === 'string' ? mockValue : null;
}

export function extractGuardFromInterface(interfaceDecl: InterfaceDeclaration): GuardFunction | null {
  return extractGuardFromJSDoc(interfaceDecl);
}

function extractGuardFromJSDoc(interfaceDecl: InterfaceDeclaration): GuardFunction | null {
  const guardTag = interfaceDecl.getJsDocs()
    .flatMap(doc => doc.getTags())
    .find(tag => tag.getTagName() === 'guard');
  
  const guardComment = guardTag?.getComment();
  
  if (!guardComment || typeof guardComment !== 'string') return null;
  
  try {
    const guardConfig: unknown = JSON.parse(guardComment);
    return isValidGuardConfig(guardConfig) ? guardConfig : null;
  } catch {
    return null;
  }
}

function isValidGuardConfig(config: unknown): config is GuardFunction {
  if (!isRecord(config)) return false;
  
  if (!isRecord(config['condition'])) return false;
  if (!isRecord(config['left'])) return false;
  if (!isRecord(config['right'])) return false;
  
  return isValidCondition(config['condition']) && 
         isValidResponse(config['left']) && 
         isValidResponse(config['right']);
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

function isValidCondition(condition: Record<string, unknown>): boolean {
  if (typeof condition['field'] !== 'string') return false;
  if (typeof condition['operator'] !== 'string') return false;
  
  const validOperators = ['equals', 'not_equals', 'contains', 'not_contains', 'exists', 'not_exists'];
  return validOperators.includes(condition['operator']);
}

function isValidResponse(response: Record<string, unknown>): boolean {
  return typeof response['status'] === 'number';
}
