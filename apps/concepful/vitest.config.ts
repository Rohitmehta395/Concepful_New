import { defineConfig } from 'vitest/config'
import path from 'path'

export default defineConfig({
  test: {
    environment: 'node',
    // setupFiles loads .env + .env.local into process.env inside the worker
    // thread, where Payload's postgres adapter can see DATABASE_URL. It also
    // sets NODE_ENV=test to prevent Payload from running pushDevSchema().
    setupFiles: ['./vitest.setup.ts'],
    // Extended timeouts: Payload initialisation + Supabase round-trips can be slow.
    testTimeout: 30_000,
    hookTimeout: 90_000,
    // Serial execution: all test files share the real dev Postgres instance.
    // Parallel workers would race on create/delete of test documents.
    poolOptions: {
      threads: {
        singleThread: true,
      },
    },
  },
  resolve: {
    alias: {
      // Mirrors the tsconfig.json path so `import configPromise from '@payload-config'`
      // resolves correctly inside Vitest's module graph.
      '@payload-config': path.resolve(__dirname, './payload.config.ts'),
      // Mirrors the '@/*' tsconfig path used elsewhere in the app.
      '@': path.resolve(__dirname, './'),
    },
  },
})
