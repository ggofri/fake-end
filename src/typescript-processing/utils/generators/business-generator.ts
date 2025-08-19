import { faker } from '@faker-js/faker';

export function generateBusinessStringValue(lowerName: string): string | null {
  if (lowerName.includes('company')) {
    return faker.company.name();
  }
  if (lowerName.includes('job') || lowerName.includes('title') || lowerName.includes('position')) {
    return faker.person.jobTitle();
  }
  if (lowerName.includes('department')) {
    return faker.commerce.department();
  }
  if (lowerName.includes('product')) {
    return faker.commerce.productName();
  }
  return null;
}
