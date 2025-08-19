import { jest } from '@jest/globals';

jest.setTimeout(30000);

jest.mock('chalk', () => ({
  gray: jest.fn((...args: any[]) => args.map(arg => arg instanceof Error ? arg.toString() : arg).join(' ')),
  cyan: jest.fn((...args: any[]) => args.map(arg => arg instanceof Error ? arg.toString() : arg).join(' ')),
  blue: jest.fn((...args: any[]) => args.map(arg => arg instanceof Error ? arg.toString() : arg).join(' ')),
  yellow: jest.fn((...args: any[]) => args.map(arg => arg instanceof Error ? arg.toString() : arg).join(' ')),
  red: jest.fn((...args: any[]) => args.map(arg => arg instanceof Error ? arg.toString() : arg).join(' ')),
  green: jest.fn((...args: any[]) => args.map(arg => arg instanceof Error ? arg.toString() : arg).join(' ')),
}));

(global as any).fail = (reason?: string) => {
  throw new Error(reason || 'Test failed');
};

beforeAll(() => {
  if (!process.env.TEST_VERBOSE) {
    global.console = {
      ...console,
      log: jest.fn(),
      info: jest.fn(),
      warn: jest.fn(),
      error: jest.fn(),
    };
  }
});
