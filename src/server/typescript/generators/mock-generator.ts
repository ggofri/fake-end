import { Node, InterfaceDeclaration, TypeNode } from 'ts-morph';
import { 
  MAX_COUNT_VALUE, 
  MAX_ID_VALUE, 
  MAX_PRICE_VALUE, 
  PRICE_PRECISION_MULTIPLIER,
  BOOLEAN_PROBABILITY,
  ID_STRING_BASE,
  ID_SUBSTRING_START,
  ID_SUBSTRING_LENGTH
} from '@/constants';

export function generateMockFromInterface(interfaceDecl: InterfaceDeclaration): Record<string, unknown> {
  const mockData: Record<string, unknown> = {};
  const properties = interfaceDecl.getProperties();
  
  for (const prop of properties) {
    if (Node.isPropertySignature(prop)) {
      const name = prop.getName();
      const typeNode = prop.getTypeNode();
      const isOptional = prop.hasQuestionToken();
      
      if (!isOptional) {
        mockData[name] = generateMockValue(typeNode, name);
      }
    }
  }
  
  return mockData;
}

function generateMockValue(typeNode: TypeNode | undefined, propertyName: string): unknown {
  if (!typeNode) return null;

  const typeText = typeNode.getKindName();
  
  switch (typeText) {
    case 'StringKeyword': return generateStringValue(propertyName);
    case 'NumberKeyword': return generateNumberValue(propertyName);
    case 'BooleanKeyword': return Math.random() < BOOLEAN_PROBABILITY;
    case 'ArrayType': return [generateMockValue(typeNode.getFirstChild(), propertyName)];
    case 'TypeReference': return {};
    default: return null;
  }
}

function generateStringValue(propertyName: string): string {
  const lowerName = propertyName.toLowerCase();
  
  if (lowerName.includes('id')) return Math.random().toString(ID_STRING_BASE).substr(ID_SUBSTRING_START, ID_SUBSTRING_LENGTH);
  if (lowerName.includes('email')) return 'user@example.com';
  if (lowerName.includes('name')) return 'Sample Name';
  if (lowerName.includes('url') || lowerName.includes('link')) return 'https://example.com';
  if (lowerName.includes('date') || lowerName.includes('time')) return new Date().toISOString();
  
  return `sample_${propertyName}`;
}

function generateNumberValue(propertyName: string): number {
  const lowerName = propertyName.toLowerCase();
  
  if (lowerName.includes('id')) return Math.floor(Math.random() * MAX_ID_VALUE) + 1;
  if (lowerName.includes('count') || lowerName.includes('total')) return Math.floor(Math.random() * MAX_COUNT_VALUE);
  if (lowerName.includes('price') || lowerName.includes('amount')) return Math.round(Math.random() * MAX_PRICE_VALUE * PRICE_PRECISION_MULTIPLIER) / PRICE_PRECISION_MULTIPLIER;
  
  return Math.floor(Math.random() * MAX_COUNT_VALUE);
}
