import { faker } from '@faker-js/faker';

export function generateDateStringValue(lowerName: string): string | null {
  if (lowerName.includes('created') || lowerName.includes('start')) {
    return faker.date.past().toISOString();
  }
  if (lowerName.includes('updated') || lowerName.includes('modified')) {
    return faker.date.recent().toISOString();
  }
  if (lowerName.includes('end') || lowerName.includes('expir')) {
    return faker.date.future().toISOString();
  }
  if (lowerName.includes('birth')) {
    return faker.date.birthdate().toISOString();
  }
  if (lowerName.includes('date') || lowerName.includes('time')) {
    return faker.date.recent().toISOString();
  }
  return null;
}
