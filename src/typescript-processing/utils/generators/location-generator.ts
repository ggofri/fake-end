import { faker } from '@faker-js/faker';

export function generateLocationStringValue(fieldName: string): string | null {
  const lowerName = fieldName.toLowerCase();
  if (lowerName.includes('address')) {
    return faker.location.streetAddress();
  }
  if (lowerName.includes('city')) {
    return faker.location.city();
  }
  if (lowerName.includes('state') || lowerName.includes('province')) {
    return faker.location.state();
  }
  if (lowerName.includes('country')) {
    return faker.location.country();
  }
  if (lowerName.includes('zip') || lowerName.includes('postal')) {
    return faker.location.zipCode();
  }
  return null;
}
