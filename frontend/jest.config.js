module.exports = {
  testEnvironment: 'jsdom',
  testMatch: ['**/tests/**/*.test.js'],
  setupFilesAfterEnv: ['<rootDir>/tests/setup.js'],
  moduleNameMapper: {
    '\\.(css|less|scss|sass)$': '<rootDir>/tests/__mocks__/styleMock.js',
  },
  collectCoverageFrom: [
    'src/**/*.{js,jsx}',
    '!src/index.js',
    '!src/index.jsx',
  ],
  testEnvironmentOptions: {
    url: 'http://localhost/',
  },
  transformIgnorePatterns: [
    'node_modules/(?!(dom-accessibility-api|@testing-library|jsdom)/)',
  ],
};
