import { faker } from '@faker-js/faker';

export function generatePersonalStringValue(lowerName: string): string | null {
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
