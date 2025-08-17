import { isRecordOfUnknown } from '@/utils';

export function getNestedValue(obj: Record<string, unknown>, path: string): unknown {
  if (path === '') {
    return obj;
  }
  return path.split('.').reduce((current: unknown, key) => {
    if (isRecordOfUnknown(current)) {
      return current[key];
    }
    return undefined;
  }, obj as unknown);
}
