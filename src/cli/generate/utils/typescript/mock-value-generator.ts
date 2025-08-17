import { inferTypeScriptType } from './type-inference';

export function generateMockValueForType(fieldName: string, value: unknown): string {
  const mockFromFieldName = generateMockFromFieldName(fieldName);
  if (mockFromFieldName) {
    return mockFromFieldName;
  }
  
  if (value !== null && value !== undefined) {
    return JSON.stringify(value);
  }
  
  return generateMockFromType(inferTypeScriptType(value));
}

function generateMockFromFieldName(fieldName: string): string | null {
  const lowerName = fieldName.toLowerCase();
  
  const mockMap: Record<string, string> = {
    id: '"mock-id-123"',
    email: '"user@example.com"',
    name: '"Sample Name"',
    url: '"https://example.com"',
    link: '"https://example.com"',
    date: '"2024-01-01T00:00:00Z"',
    time: '"2024-01-01T00:00:00Z"',
    phone: '"+1-555-123-4567"',
    price: '"99.99"',
    amount: '"99.99"',
    count: '"10"',
    total: '"10"',
    active: '"true"',
    enabled: '"true"'
  };
  
  for (const [key, value] of Object.entries(mockMap)) {
    if (lowerName.includes(key)) {
      return value;
    }
  }
  
  return null;
}

function generateMockFromType(type: string): string {
  if (type.includes('string')) return '"sample value"';
  if (type.includes('number')) return '"42"';
  if (type.includes('boolean')) return '"true"';
  if (type.includes('[]')) return '"[]"';
  
  return '"null"';
}
