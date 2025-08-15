import { jest } from '@jest/globals';

jest.setTimeout(30000);

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
