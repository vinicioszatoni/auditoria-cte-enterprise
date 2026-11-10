module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  transform: {
    '^.+\\.ts?$': [
      'ts-jest',
      {
        tsconfig: './tsconfig.json'
      }
    ]
  },
  transformIgnorePatterns: [
    '<rootDir>/node_modules/',
    '<rootDir>/.scafflater/*',
    '<rootDir>/dist/'
  ],
  modulePathIgnorePatterns: [
    '<rootDir>/node_modules/',
    '<rootDir>/.scafflater/*',
    '<rootDir>/dist/'
  ],
  collectCoverageFrom: ['src/**/*.ts', '!src/index.ts'],
  coveragePathIgnorePatterns: [
    'index.ts',
    '.*\\.d.ts',
    '\\.error\\.ts$',
    'logger.ts',
    'app.ts',
    'swagger.ts',
    '.*\\.config\\.(ts|js)$',
    '.*\\Config.ts$',
    '.*\\.logger.ts$',
    '.*\\Connection.ts$',
    'example.ts'
  ],
  workerIdleMemoryLimit: '256MB'
};
