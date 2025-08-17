import { TypeScriptField } from '@/cli/generate/utils/typescript-generator';
import { inferTypeScriptType } from './type-inference';
import { generateMockValueForType } from './mock-value-generator';

export function generateFieldsFromResponse(data: unknown): TypeScriptField[] {
  if (!data || typeof data !== 'object') {
    return generatePrimitiveField(data);
  }

  if (Array.isArray(data)) {
    return generateArrayField(data);
  }

  return generateObjectFields(data);
}

function generatePrimitiveField(data: unknown): TypeScriptField[] {
  return [{
    name: 'data',
    type: typeof data === 'string' ? 'string' : 
          typeof data === 'number' ? 'number' :
          typeof data === 'boolean' ? 'boolean' : 'unknown',
    mockValue: JSON.stringify(data)
  }];
}

function generateArrayField(data: unknown[]): TypeScriptField[] {
  if (data.length === 0) {
    return [{
      name: 'data',
      type: 'unknown[]',
      mockValue: '[]'
    }];
  }
  
  const [firstItem] = data;
  const itemFields = generateFieldsFromResponse(firstItem);
  return [{
    name: 'data',
    type: `Array<{${itemFields.map(f => `${f.name}: ${f.type}`).join('; ')}}>`,
    mockValue: `[${generateMockObject(itemFields)}]`
  }];
}

function generateObjectFields(data: object): TypeScriptField[] {
  const fields: TypeScriptField[] = [];
  const entries = Object.entries(data);
  
  for (const [key, value] of entries) {
    fields.push({
      name: key,
      type: inferTypeScriptType(value),
      mockValue: generateMockValueForType(key, value)
    });
  }
  
  return fields;
}

function generateMockObject(fields: TypeScriptField[]): string {
  const props = fields.map(f => `${f.name}: ${f.mockValue ?? 'null'}`);
  return `{${props.join(', ')}}`;
}
