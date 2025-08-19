import { inferTypeScriptType } from './type-inference';
import { shouldUseRealValueInSanitizeMode } from './sensitive-field-detector';
import { isNil } from '@/shared/utils';
import {
  generatePersonalStringValue,
  generateLocationStringValue,
  generateFinanceStringValue,
  generateSecurityStringValue
} from '@/typescript-processing/utils/generators';

export type MockStrategy = 'sanitize' | 'real' | 'faker';

const PHONE_NUMBER_MIN = 1000000000;
const PHONE_NUMBER_MAX = 9000000000;
const ID_NUMBER_MIN = 100000;
const ID_NUMBER_MAX = 900000;
const SSN_NUMBER_MIN = 100000000;
const SSN_NUMBER_MAX = 900000000;
const ACCOUNT_NUMBER_MIN = 1000000000000000;
const ACCOUNT_NUMBER_MAX = 9000000000000000;
const DEFAULT_ID_MIN = 10000;
const DEFAULT_ID_MAX = 90000;

export function generateMockValueForType(
  fieldName: string, 
  value: unknown, 
  strategy: MockStrategy = 'sanitize'
): string {
  switch (strategy) {
    case 'real': {
      if (!isNil(value)) {
        return JSON.stringify(value);
      }
      return generateMockFromType(inferTypeScriptType(value));
    }
      
    case 'faker': {
      const mockFromFieldName = generateMockFromFieldName(fieldName);
      if (mockFromFieldName) {
        return mockFromFieldName;
      }
      return generateMockFromType(inferTypeScriptType(value));
    }
      
    case 'sanitize':
    default:
      return handleSanitizeStrategy(fieldName, value);
  }
}

function handleSanitizeStrategy(fieldName: string, value: unknown): string {
  if (isNil(value)) {
    return JSON.stringify(value);
  }
  
  if (shouldUseRealValueInSanitizeMode(fieldName)) {
    return JSON.stringify(value);
  }
  
  const mockValue = generateMockFromFieldName(fieldName);
  if (mockValue) {
    if (typeof value === 'number' && typeof JSON.parse(mockValue) === 'string') {
      return generateNumberForSensitiveField(fieldName);
    }
    return mockValue;
  }
  
  return generateMockFromType(inferTypeScriptType(value));
}

function generateMockFromFieldName(fieldName: string): string | null {
  const lowerName = fieldName.toLowerCase();
  
  const securityValue = generateSecurityStringValue(lowerName);
  if (securityValue) {
    return JSON.stringify(securityValue);
  }
  
  const personalValue = generatePersonalStringValue(lowerName);
  if (personalValue) {
    return JSON.stringify(personalValue);
  }
  
  const locationValue = generateLocationStringValue(lowerName);
  if (locationValue) {
    return JSON.stringify(locationValue);
  }
  
  const financeValue = generateFinanceStringValue(lowerName);
  if (financeValue) {
    return JSON.stringify(financeValue);
  }
  
  const mockMap: Record<string, string> = {
    url: '"https://example.com"',
    link: '"https://example.com"',
    date: '"2024-01-01T00:00:00Z"',
    time: '"2024-01-01T00:00:00Z"',
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

function generateNumberForSensitiveField(fieldName: string): string {
  const lowerName = fieldName.toLowerCase();
  
  if (lowerName.includes('phone')) {
    return (Math.floor(Math.random() * PHONE_NUMBER_MAX) + PHONE_NUMBER_MIN).toString();
  }
  
  if (lowerName.includes('id')) {
    return (Math.floor(Math.random() * ID_NUMBER_MAX) + ID_NUMBER_MIN).toString();
  }
  
  if (lowerName.includes('ssn') || lowerName.includes('social_security')) {
    return (Math.floor(Math.random() * SSN_NUMBER_MAX) + SSN_NUMBER_MIN).toString();
  }
  
  if (lowerName.includes('account') || lowerName.includes('card')) {
    return (Math.floor(Math.random() * ACCOUNT_NUMBER_MAX) + ACCOUNT_NUMBER_MIN).toString();
  }
  
  return (Math.floor(Math.random() * DEFAULT_ID_MAX) + DEFAULT_ID_MIN).toString();
}

function generateMockFromType(type: string): string {
  if (type.includes('string')) return '"sample value"';
  if (type.includes('number')) return '"42"';
  if (type.includes('boolean')) return '"true"';
  if (type.includes('[]')) return '"[]"';
  
  return '"null"';
}
