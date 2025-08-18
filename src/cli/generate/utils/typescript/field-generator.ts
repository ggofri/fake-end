import { TypeScriptField } from '@/cli/generate/utils/typescript-generator';
import { inferTypeScriptType } from './type-inference';
import { generateMockValueForType, MockStrategy } from './mock-value-generator';

export function generateFieldsFromResponse(data: unknown, strategy: MockStrategy = 'sanitize'): TypeScriptField[] {
  if (!data || typeof data !== 'object') {
    return generatePrimitiveField(data, strategy);
  }

  if (Array.isArray(data)) {
    return generateArrayField(data, strategy);
  }

  return generateObjectFields(data, strategy);
}

function generatePrimitiveField(data: unknown, strategy: MockStrategy): TypeScriptField[] {
  return [{
    name: 'data',
    type: typeof data === 'string' ? 'string' : 
          typeof data === 'number' ? 'number' :
          typeof data === 'boolean' ? 'boolean' : 'unknown',
    mockValue: generateMockValueForType('data', data, strategy)
  }];
}

function generateArrayField(data: unknown[], strategy: MockStrategy): TypeScriptField[] {
  if (data.length === 0) {
    return [{
      name: 'data',
      type: 'unknown[]',
      mockValue: generateMockValueForType('data', [], strategy)
    }];
  }
  
  const [firstItem] = data;
  const itemFields = generateFieldsFromResponse(firstItem, strategy);
  return [{
    name: 'data',
    type: `Array<{${itemFields.map(f => `${f.name}: ${f.type}`).join('; ')}}>`,
    mockValue: generateMockValueForType('data', data, strategy)
  }];
}

function generateObjectFields(data: object, strategy: MockStrategy): TypeScriptField[] {
  const fields: TypeScriptField[] = [];
  const entries = Object.entries(data);
  
  for (const [key, value] of entries) {
    fields.push({
      name: key,
      type: inferTypeScriptType(value),
      mockValue: generateMockValueForType(key, value, strategy)
    });
  }
  
  return fields;
}
