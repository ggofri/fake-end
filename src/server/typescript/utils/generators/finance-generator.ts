import { faker } from '@faker-js/faker';

export function generateFinanceStringValue(lowerName: string): string | null {
  if (lowerName.includes('currency')) {
    return faker.finance.currencyCode();
  }
  if (lowerName.includes('account')) {
    return faker.finance.accountNumber();
  }
  if (lowerName.includes('isbn')) {
    return faker.commerce.isbn();
  }
  return null;
}
