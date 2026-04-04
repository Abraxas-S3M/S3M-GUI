import { defineConfig } from 'vitest/config'
import path from 'path'

export default defineConfig({
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./vitest.setup.ts'],
    include: ['src/services/**/__tests__/**/*.test.ts'],
    pool: 'threads',
    maxWorkers: 1,
    reporters: ['default', 'junit'],
    outputFile: {
      junit: 'reports/integration/junit.xml',
    },
    coverage: {
      enabled: false,
      provider: 'v8',
      reporter: ['text', 'json-summary', 'lcov'],
      reportsDirectory: 'reports/integration/coverage',
      include: ['src/services/**/*.ts'],
    },
    testTimeout: 5_000,
    hookTimeout: 5_000,
  },
})
