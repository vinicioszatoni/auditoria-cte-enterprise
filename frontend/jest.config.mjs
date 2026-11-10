export default {
  collectCoverage: true,
  testEnvironment: 'jest-environment-jsdom',
  testPathIgnorePatterns: ['/node_modules/', '<rootDir>/.scafflater/hooks/'],
  setupFilesAfterEnv: ['./src/setup-tests.ts'],
  coverageReporters: ['text', 'lcov'],
  collectCoverageFrom: [
    'src/**/*.{js,jsx,ts,tsx}',
    '!<rootDir>/node_modules/',
    '!**/test-utils/**/*',
    '!src/index*',
    '!src/main.tsx',
    '!src/**/mock/**',
    '!src/**/*.d.ts',
    '!src/styleMock.ts',
    '!src/**/*.mock.ts',
    '!src/config/envs.ts'
  ],
  moduleNameMapper: {
    '^(.*/)?config/envs$': '<rootDir>/src/config/envs.mock.ts',
    '^@/(.*)$': '<rootDir>/src/$1',
    '^@grupoboticario/flora-tokens/.+/web/css$': '<rootDir>/src/styleMock.ts',
    '\\.css$': '<rootDir>/src/styleMock.ts'
  },
  transform: {
    '^.+\\.tsx?$': 'babel-jest'
  },
  workerIdleMemoryLimit: '256MB'
}
