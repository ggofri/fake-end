import { faker } from '@faker-js/faker';

export function generateWebStringValue(lowerName: string): string | null {
  if (lowerName.includes('url') || lowerName.includes('link') || lowerName.includes('website')) {
    return faker.internet.url();
  }
  if (lowerName.includes('domain')) {
    return faker.internet.domainName();
  }
  if (lowerName.includes('avatar') || lowerName.includes('image') || lowerName.includes('photo')) {
    return faker.image.avatar();
  }
  return null;
}
