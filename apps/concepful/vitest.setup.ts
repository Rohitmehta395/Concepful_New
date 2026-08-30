/**
 * Vitest setupFile: runs inside each test worker thread before any test,
 * loading .env and .env.local into the worker's process.env.
 *
 * WHY setupFiles (not globalSetup):
 *   globalSetup runs in the Vitest main process. Test workers are separate
 *   V8 threads with their own process.env — changes made in globalSetup are
 *   NOT inherited by workers. setupFiles runs IN the worker, so its changes
 *   to process.env ARE visible to test code (including Payload's postgres adapter
 *   reading DATABASE_URL) that runs in the same worker.
 *
 * WHY NODE_ENV=test:
 *   Payload's postgres adapter runs pushDevSchema() (automatic Drizzle schema
 *   migrations) when NODE_ENV is 'development'. In the test environment the
 *   schema is already up-to-date (the running dev server keeps it in sync), so
 *   pushDevSchema() hits "constraint does not exist" errors. Setting NODE_ENV
 *   to 'test' (not 'production', to avoid disabling any test-mode affordances)
 *   prevents Payload from calling pushDevSchema().
 */

import { readFileSync, existsSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const appDir = dirname(__filename)

function parseEnvFile(filePath: string, override = false): void {
  if (!existsSync(filePath)) return
  const content = readFileSync(filePath, 'utf8')
  for (const line of content.split('\n')) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) continue
    const eqIdx = trimmed.indexOf('=')
    if (eqIdx === -1) continue
    const key = trimmed.slice(0, eqIdx).trim()
    let value = trimmed.slice(eqIdx + 1).trim()
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1)
    }
    if (override || !(key in process.env) || process.env[key] === '') {
      process.env[key] = value
    }
  }
}

// Load base config (.env), then allow local overrides (.env.local) to take precedence
parseEnvFile(resolve(appDir, '.env'), false)
parseEnvFile(resolve(appDir, '.env.local'), true)

// Prevent Payload from running pushDevSchema() (schema migration) on init.
// In the test environment, the schema is already current (the running dev server
// keeps it in sync). pushDevSchema() runs when NODE_ENV !== 'production' and
// PAYLOAD_MIGRATING !== 'true'. Setting PAYLOAD_MIGRATING = 'true' ensures
// pushDevSchema is completely bypassed without affecting other runtime checks.
process.env.PAYLOAD_MIGRATING = 'true'
if (!process.env.NODE_ENV) {
  (process.env as Record<string, string | undefined>).NODE_ENV = 'test'
}
