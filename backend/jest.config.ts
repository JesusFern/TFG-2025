module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testMatch: ['**/tests/**/*.test.ts'],
  transform: {
    '^.+\\.tsx?$': 'ts-jest'
  },
  setupFilesAfterEnv: ['./tests/setup.ts'],
  maxWorkers: 1,
  workerIdleMemoryLimit: '512MB',
  testTimeout: 30000,
  // Limpiar mocks y caché entre tests
  clearMocks: true,
  resetMocks: true,
  restoreMocks: true,
};