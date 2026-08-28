import { describe, it, expect } from 'vitest'

describe('DB Package Smoke test', () => {
  it('should pass to prove the test harness executes in packages/db', () => {
    // Deliberately breaking this to 3 will cause the test to fail, 
    // confirming the harness works per the phase 0 requirements.
    expect(1 + 1).toBe(2)
  })
})
