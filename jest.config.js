const { TEST_CONFIG } = require('./src/config/test.ts');

module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/tests', 'src'],
  testMatch: ['**/*.test.ts', '**/__tests__/*.test.ts'],
  collectCoverageFrom: [
    'src/**/*.{ts,js}',
    '!src/**/*.d.ts',
    '!src/types/**/*',
  ],
  coverageReporters: ['text', 'lcov', 'json-summary'],
  coverageThreshold: {
    global: {
      lines: TEST_CONFIG.COVERAGE,
      functions: TEST_CONFIG.COVERAGE,
      branches: TEST_CONFIG.COVERAGE,
      statements: TEST_CONFIG.COVERAGE,
    },
  },
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '^@/types$': '<rootDir>/src/types/index',
    '^@/server/(.*)$': '<rootDir>/src/server/$1',
    '^@/constants$': '<rootDir>/src/constants/index',
    '^@/cli/(.*)$': '<rootDir>/src/cli/$1',
    '^@/utils$': '<rootDir>/src/utils/index'
  },
  transformIgnorePatterns: [
    'node_modules/(?!(chalk)/)'
  ],
  setupFilesAfterEnv: ['<rootDir>/tests/setup.ts'],
  testTimeout: 30000,
  globalSetup: '<rootDir>/tests/global-setup.ts',
  globalTeardown: '<rootDir>/tests/global-teardown.ts',
  maxWorkers: 4
};