import { faker } from '@faker-js/faker';

const TOKEN_LENGTH = 32;
const LONG_TOKEN_LENGTH = 40;
const AUTH_LENGTH = 24;
const PRIVATE_KEY_LENGTH = 64;
const CERTIFICATE_LENGTH = 128;
const SSN_LENGTH = 9;

export function generateSecurityStringValue(lowerName: string): string | null {
  const authValue = generateAuthenticationValue(lowerName);
  if (authValue) return authValue;

  const financialValue = generateFinancialSecurityValue(lowerName);
  if (financialValue) return financialValue;

  const networkValue = generateNetworkSecurityValue(lowerName);
  if (networkValue) return networkValue;

  const personalValue = generatePersonalSecurityValue(lowerName);
  if (personalValue) return personalValue;

  return null;
}

function generateAuthenticationValue(lowerName: string): string | null {
  const passwordValue = generatePasswordValue(lowerName);
  if (passwordValue) return passwordValue;

  const tokenValue = generateTokenValue(lowerName);
  if (tokenValue) return tokenValue;

  const keyValue = generateKeyValue(lowerName);
  if (keyValue) return keyValue;

  return null;
}

function generatePasswordValue(lowerName: string): string | null {
  if (lowerName.includes('password') || lowerName.includes('pwd') || lowerName.includes('pass')) {
    return faker.internet.password();
  }
  return null;
}

function generateTokenValue(lowerName: string): string | null {
  if (lowerName.includes('secret')) {
    return faker.string.alphanumeric(TOKEN_LENGTH);
  }
  if (lowerName.includes('token') || lowerName.includes('jwt')) {
    return faker.string.alphanumeric(LONG_TOKEN_LENGTH);
  }
  if (lowerName.includes('api_key') || lowerName.includes('apikey')) {
    return faker.string.alphanumeric(TOKEN_LENGTH);
  }
  if (lowerName.includes('auth') && !lowerName.includes('email')) {
    return faker.string.alphanumeric(AUTH_LENGTH);
  }
  if (lowerName.includes('session')) {
    return faker.string.uuid();
  }
  if (lowerName.includes('csrf')) {
    return faker.string.alphanumeric(TOKEN_LENGTH);
  }
  return null;
}

function generateKeyValue(lowerName: string): string | null {
  if (lowerName.includes('key') && (lowerName.includes('private') || lowerName.includes('public'))) {
    return faker.string.alphanumeric(PRIVATE_KEY_LENGTH);
  }
  if (lowerName.includes('certificate') || lowerName.includes('cert')) {
    return faker.string.alphanumeric(CERTIFICATE_LENGTH);
  }
  return null;
}

function generateFinancialSecurityValue(lowerName: string): string | null {
  if (lowerName.includes('cvv') || lowerName.includes('cvc') || lowerName.includes('security_code')) {
    return faker.finance.creditCardCVV();
  }
  if (lowerName.includes('credit_card') || lowerName.includes('card_number') || lowerName.includes('card_num')) {
    return faker.finance.creditCardNumber();
  }
  if (lowerName.includes('routing')) {
    return faker.finance.routingNumber();
  }
  if (lowerName.includes('iban')) {
    return faker.finance.iban();
  }
  if (lowerName.includes('swift')) {
    return faker.finance.bic();
  }
  return null;
}

function generateNetworkSecurityValue(lowerName: string): string | null {
  if (lowerName.includes('ip') && !lowerName.includes('zip')) {
    return faker.internet.ip();
  }
  if (lowerName.includes('mac_address')) {
    return faker.internet.mac();
  }
  if (lowerName.includes('hostname') || lowerName.includes('host')) {
    return faker.internet.domainName();
  }
  if (lowerName.includes('device_id')) {
    return faker.string.uuid();
  }
  return null;
}

function generatePersonalSecurityValue(lowerName: string): string | null {
  if (lowerName.includes('ssn') || lowerName.includes('social_security')) {
    return faker.string
      .numeric(SSN_LENGTH)
      .replace(/(\d{3})(\d{2})(\d{4})/, '$1-$2-$3');
  }
  return null;
}
