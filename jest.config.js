module.exports = {
  testEnvironment: 'node',
  coverageDirectory: './coverage',
  collectCoverageFrom: [
    'src/**/*.js',
    '!src/server.js',
    '!**/node_modules/**'
  ],
  testMatch: [
    '**/__tests__/**/*.test.js'
  ],
  setupFilesAfterEnv: ['./jest.setup.js']
}; 