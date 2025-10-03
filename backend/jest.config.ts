module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testMatch: ['**/tests/**/*.test.ts'],
  transform: {
    '^.+\\.tsx?$': 'ts-jest'
  },
  setupFilesAfterEnv: ['./tests/setup.ts'],
  maxWorkers: 2,
  workerIdleMemoryLimit: '512MB',
};