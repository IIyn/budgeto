import { defineConfig } from 'vitest/config'

// Kept separate from vite.config.ts: unit tests don't need the Start, Nitro or React plugins.
export default defineConfig({
  resolve: { tsconfigPaths: true },
  test: {
    include: ['src/**/*.test.ts'],
  },
})
