import { faker } from '@faker-js/faker';

const ALPHANUMERIC_LENGTH = 8;

export function generateMetadataStringValue(lowerName: string): string | null {
  if (lowerName.includes('color') || lowerName.includes('colour')) {
    return faker.color.human();
  }
  if (lowerName.includes('tag') || lowerName.includes('category')) {
    return faker.commerce.productAdjective();
  }
  if (lowerName.includes('status')) {
    return faker.helpers.arrayElement(['active', 'inactive', 'pending', 'approved', 'rejected']);
  }
  if (lowerName.includes('type')) {
    return faker.helpers.arrayElement(['basic', 'premium', 'standard', 'advanced']);
  }
  if (lowerName.includes('sku') || lowerName.includes('code')) {
    return faker.string.alphanumeric(ALPHANUMERIC_LENGTH).toUpperCase();
  }
  return null;
}
