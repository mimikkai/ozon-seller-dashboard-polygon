import { defineConfig } from 'vitest/config'
import { fileURLToPath } from 'node:url'

export default defineConfig({
  test: {
    environment: 'happy-dom',
    include: ['test/**/*.test.ts'],
    globals: true
  },
  resolve: {
    alias: {
      '~': fileURLToPath(new URL('./app/', import.meta.url)),
      '~~': fileURLToPath(new URL('./', import.meta.url))
    }
  },
  define: {
    'import.meta.env.LOG_LEVEL': JSON.stringify('debug')
  }
})
