import { faker } from '@faker-js/faker';

const SENTENCE_COUNT = 2;

export function generateContentStringValue(lowerName: string): string | null {
  if (lowerName.includes('description')) {
    return faker.lorem.paragraph();
  }
  if (lowerName.includes('summary')) {
    return faker.lorem.sentence();
  }
  if (lowerName.includes('bio') || lowerName.includes('about')) {
    return faker.lorem.sentences(SENTENCE_COUNT);
  }
  return null;
}
