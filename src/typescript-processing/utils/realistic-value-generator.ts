import { faker } from '@faker-js/faker';
import {
  generatePersonalStringValue,
  generateLocationStringValue,
  generateBusinessStringValue,
  generateContentStringValue,
  generateWebStringValue,
  generateMetadataStringValue,
  generateDateStringValue,
  generateFinanceStringValue,
  generateRealisticNumberValue
} from './generators';

export function generateRealisticValue(propertyName: string, typeText: string): unknown {
  const lowerName = propertyName.toLowerCase();
  
  if (typeText === 'StringKeyword') {
    return generateRealisticStringValue(lowerName);
  }
  
  if (typeText === 'NumberKeyword') {
    return generateRealisticNumberValue(lowerName);
  }
  
  if (typeText === 'BooleanKeyword') {
    return faker.datatype.boolean();
  }
  
  return null;
}

function generateRealisticStringValue(lowerName: string): string {
  const personalValue = generatePersonalStringValue(lowerName);
  if (personalValue) return personalValue;

  const locationValue = generateLocationStringValue(lowerName);
  if (locationValue) return locationValue;

  const businessValue = generateBusinessStringValue(lowerName);
  if (businessValue) return businessValue;

  const contentValue = generateContentStringValue(lowerName);
  if (contentValue) return contentValue;

  const webValue = generateWebStringValue(lowerName);
  if (webValue) return webValue;

  const metadataValue = generateMetadataStringValue(lowerName);
  if (metadataValue) return metadataValue;

  const dateValue = generateDateStringValue(lowerName);
  if (dateValue) return dateValue;

  const financeValue = generateFinanceStringValue(lowerName);
  if (financeValue) return financeValue;

  return faker.lorem.word();
}
