import { defineConfig } from 'vitest/config'
import path from 'path'
import { config } from 'dotenv'

// Load environment variables before anything else
config({ path: path.resolve(__dirname, '.env') })

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    setupFiles: ['./tests/setup.ts'],
    exclude: ['**/node_modules/**', '**/dist/**', '**/auth.test.ts'],
    env: {
      DATABASE_URL: process.env.DATABASE_URL || '',
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './'),
    },
  },
})
