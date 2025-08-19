import { faker } from '@faker-js/faker';

export function generateRealisticNumberValue(lowerName: string): number {
  const timeValue = generateTimeNumberValue(lowerName);
  if (timeValue !== null) return timeValue;

  const financialValue = generateFinancialNumberValue(lowerName);
  if (financialValue !== null) return financialValue;

  const measurementValue = generateMeasurementNumberValue(lowerName);
  if (measurementValue !== null) return measurementValue;

  const categoryValue = generateCategoryNumberValue(lowerName);
  if (categoryValue !== null) return categoryValue;

  return faker.number.int({ min: 1, max: 1000 });
}

function generateTimeNumberValue(lowerName: string): number | null {
  if (lowerName.includes('age')) {
    return faker.number.int({ min: 18, max: 100 });
  }
  if (lowerName.includes('year')) {
    return faker.number.int({ min: 1900, max: new Date().getFullYear() });
  }
  if (lowerName.includes('month')) {
    return faker.number.int({ min: 1, max: 12 });
  }
  if (lowerName.includes('day')) {
    return faker.number.int({ min: 1, max: 31 });
  }
  if (lowerName.includes('hour')) {
    return faker.number.int({ min: 0, max: 23 });
  }
  if (lowerName.includes('minute') || lowerName.includes('second')) {
    return faker.number.int({ min: 0, max: 59 });
  }
  return null;
}

function generateFinancialNumberValue(lowerName: string): number | null {
  if (lowerName.includes('price') || lowerName.includes('cost') || lowerName.includes('amount')) {
    return faker.number.float({ min: 1, max: 999.99, fractionDigits: 2 });
  }
  if (lowerName.includes('salary') || lowerName.includes('income')) {
    return faker.number.int({ min: 30000, max: 200000 });
  }
  if (lowerName.includes('percent') || lowerName.includes('rate')) {
    return faker.number.float({ min: 0, max: 100, fractionDigits: 2 });
  }
  return null;
}

function generateMeasurementNumberValue(lowerName: string): number | null {
  if (lowerName.includes('weight')) {
    return faker.number.float({ min: 0.1, max: 1000, fractionDigits: 2 });
  }
  if (lowerName.includes('height') || lowerName.includes('length') || lowerName.includes('width')) {
    return faker.number.float({ min: 1, max: 500, fractionDigits: 2 });
  }
  return null;
}

function generateCategoryNumberValue(lowerName: string): number | null {
  if (lowerName.includes('id')) {
    return faker.number.int({ min: 1, max: 10000 });
  }
  if (lowerName.includes('count') || lowerName.includes('total') || lowerName.includes('quantity')) {
    return faker.number.int({ min: 0, max: 1000 });
  }
  if (lowerName.includes('rating') || lowerName.includes('score')) {
    return faker.number.float({ min: 1, max: 5, fractionDigits: 1 });
  }
  if (lowerName.includes('version')) {
    return faker.number.int({ min: 1, max: 10 });
  }
  if (lowerName.includes('priority')) {
    return faker.number.int({ min: 1, max: 5 });
  }
  return null;
}
