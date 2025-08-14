import { MockEndpoint, OllamaResponse } from ".";

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
}

const isRecordOfUnknown = (value: unknown): value is Record<string, unknown> => {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

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

  const isBodyValid = 
    isRecordOfUnknown(value['body']) ||
    Array.isArray(value['body']) ||
    typeof value['body'] === 'string' ||
    typeof value['body'] === 'number' ||
    typeof value['body'] === 'boolean';

  if (!isBodyValid) {
    return false;
  }

  return true;
}

export const isArrayOfMockEndpoints = (value: unknown): value is MockEndpoint[] => {
    if (!Array.isArray(value)) return false;
    if (value.find((element) => !isMockEndpoint(element))) return false;

    return true
}

export const isOllamaResponse = (value: unknown): value is OllamaResponse => {
    if (!isRecordOfUnknown(value)) return false;
    if (value['response'] === undefined) return false;
    
    return true;
}
