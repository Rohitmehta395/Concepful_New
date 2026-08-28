import { describe, it, expect } from 'vitest'

describe('Smoke test', () => {
  it('should pass if the harness is working', () => {
    // Deliberately breaking this to 3 will cause the test to fail, 
    // confirming the harness works per the phase 0 requirements.
    expect(1 + 1).toBe(2)
  })
})
