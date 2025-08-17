import { faker } from '@faker-js/faker';

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

const SENTENCE_COUNT = 2;
const ALPHANUMERIC_LENGTH = 8;

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

function generatePersonalStringValue(lowerName: string): string | null {
  const identityValue = generateIdentityStringValue(lowerName);
  if (identityValue) return identityValue;

  const contactValue = generateContactStringValue(lowerName);
  if (contactValue) return contactValue;

  return null;
}

function generateIdentityStringValue(lowerName: string): string | null {
  const nameValue = generateNameStringValue(lowerName);
  if (nameValue) return nameValue;

  const credentialValue = generateCredentialStringValue(lowerName);
  if (credentialValue) return credentialValue;

  if (lowerName.includes('id') && !lowerName.includes('email')) {
    return faker.string.uuid();
  }

  return null;
}

function generateNameStringValue(lowerName: string): string | null {
  if (lowerName.includes('firstname') || lowerName === 'fname') {
    return faker.person.firstName();
  }
  if (lowerName.includes('lastname') || lowerName === 'lname') {
    return faker.person.lastName();
  }
  if (lowerName.includes('fullname') || lowerName === 'name') {
    return faker.person.fullName();
  }
  return null;
}

function generateCredentialStringValue(lowerName: string): string | null {
  if (lowerName.includes('username')) {
    return faker.internet.userName();
  }
  if (lowerName.includes('password')) {
    return faker.internet.password();
  }
  return null;
}

function generateContactStringValue(lowerName: string): string | null {
  if (lowerName.includes('email')) {
    return faker.internet.email();
  }
  if (lowerName.includes('phone')) {
    return faker.phone.number();
  }
  return null;
}

function generateLocationStringValue(lowerName: string): string | null {
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

function generateBusinessStringValue(lowerName: string): string | null {
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

function generateContentStringValue(lowerName: string): string | null {
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

function generateWebStringValue(lowerName: string): string | null {
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

function generateMetadataStringValue(lowerName: string): string | null {
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

function generateDateStringValue(lowerName: string): string | null {
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

function generateFinanceStringValue(lowerName: string): string | null {
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

function generateRealisticNumberValue(lowerName: string): number {
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
