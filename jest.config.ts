const COVERAGE_THRESHOLD = 60;

export default {
  preset: 'ts-jest',
  testEnvironment: 'node',
  extensionsToTreatAsEsm: ['.ts'],
  transform: {
    '^.+\\.ts$': ['ts-jest', {
      useESM: true,
      tsconfig: {
        module: 'esnext'
      }
    }]
  },
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
      lines: COVERAGE_THRESHOLD,
      functions: COVERAGE_THRESHOLD,
      branches: COVERAGE_THRESHOLD,
      statements: COVERAGE_THRESHOLD,
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
