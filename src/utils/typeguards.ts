/**
 * Shared type guards for common validation patterns
 */

export const isRecordOfUnknown = (value: unknown): value is Record<string, unknown> => {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
};

export const isRecordOfStrings = (value: unknown): value is Record<string, unknown> => {
  if (typeof value !== 'object' || value === null) {
    return false;
  }

  if (Array.isArray(value)) {
    return false;
  }

  for (const key in value) {
    if (typeof key !== 'string') {
      return false;
    }
  }

  return true;
};

export type Nil = null | undefined;

export const isNil = (value: unknown): value is Nil => value === null || value === undefined;
