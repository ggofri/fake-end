/**
 * Detects definitely sensitive fields that should be sanitized with faker.js values
 * instead of using real API response values.
 */

import {
  generatePersonalStringValue,
  generateLocationStringValue,
  generateFinanceStringValue,
  generateSecurityStringValue
} from '@/typescript-processing/utils/generators';

/**
 * Determines if a field name contains sensitive information by checking
 * if any of our faker.js generators can handle it.
 */
export function isSensitiveField(fieldName: string): boolean {
  const lowerName = fieldName.toLowerCase();
  
  return !!(
    generateSecurityStringValue(lowerName) || // eslint-disable-line @typescript-eslint/prefer-nullish-coalescing
    generatePersonalStringValue(lowerName) || // eslint-disable-line @typescript-eslint/prefer-nullish-coalescing
    generateLocationStringValue(lowerName) || // eslint-disable-line @typescript-eslint/prefer-nullish-coalescing
    generateFinanceStringValue(lowerName)
  );
}

export function shouldUseRealValueInSanitizeMode(fieldName: string): boolean {
  return !isSensitiveField(fieldName);
}
