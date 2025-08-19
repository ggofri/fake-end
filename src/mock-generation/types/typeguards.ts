import { MockEndpoint, OllamaResponse } from ".";
import { isRecordOfUnknown, isNil } from '@/shared/utils';

const isValidBodyValue = (value: unknown): boolean => {
  return (
    isNil(value) ||
    isRecordOfUnknown(value) ||
    Array.isArray(value) ||
    typeof value === 'string' ||
    typeof value === 'number' ||
    typeof value === 'boolean'
  );
};

const isMockEndpoint = (value: unknown): value is MockEndpoint => {
  if (!isRecordOfUnknown(value)) {
    return false;
  }

  if (typeof value['method'] !== 'string') {
    return false;
  }

  if (typeof value['path'] !== 'string') {
    return false;
  }

  if (typeof value['status'] !== 'number') {
    return false;
  }

  if ('body' in value && !isValidBodyValue(value['body'])) {
    return false;
  }

  return true;
}

export const isArrayOfMockEndpoints = (value: unknown): value is MockEndpoint[] => {
    if (!Array.isArray(value)) return false;
    if (value.some((element) => !isMockEndpoint(element))) return false;

    return true
}

export const isOllamaResponse = (value: unknown): value is OllamaResponse => {
    if (!isRecordOfUnknown(value)) return false;
    if (value['response'] === undefined) return false;
    
    return true;
}
