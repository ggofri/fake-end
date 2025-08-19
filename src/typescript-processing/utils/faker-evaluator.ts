import { faker } from '@faker-js/faker';

export function evaluateFakerFunction(fakerExpression: string): unknown {
  try {
    const trimmed = fakerExpression.trim();
    
    if (!trimmed.startsWith('faker.')) {
      return undefined;
    }
    
    const fakerObj = createFakerProxy();
    
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-implied-eval, @typescript-eslint/no-unsafe-call
    const result = new Function('faker', `return ${trimmed}`)(fakerObj);
    return result;
  } catch {
    return undefined;
  }
}

export function isFakerExpression(value: string): boolean {
  return value.trim().startsWith('faker.');
}

function createFakerProxy(): typeof faker {
  return faker;
}
