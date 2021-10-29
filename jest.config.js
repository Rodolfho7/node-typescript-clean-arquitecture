module.exports = {
  roots: ['<rootDir>/src'],
  clearMocks: true,
  collectCoverage: false,
  collectCoverageFrom: [
    '<rootDir>/src/**/*.ts',
    '!<rootDir>/src/main/**',
    '!**/test/**'
  ],
  coverageDirectory: "coverage",
  coverageProvider: "v8",
  preset: '@shelf/jest-mongodb',
  transform: {
    '.+\\.ts$': 'ts-jest'
  }
};
