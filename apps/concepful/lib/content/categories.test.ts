/**
 * Phase 7 — Content Data Access Layer: unit tests for lib/content/categories.ts
 *
 * Runs against the real dev Payload/Supabase instance. No mocking.
 *
 * Test isolation:
 *   - All test categories use slug prefix 'test-p7-cat-' for identification.
 *   - beforeAll cleans up any PREFIX-prefixed debris from previous crashed runs,
 *     then creates fresh test categories.
 *   - Assertions filter results to PREFIX-prefixed categories only, so any
 *     existing production categories in the DB don't affect counts or ordering
 *     assertions.
 *   - sortOrder values use the 8_000_000+ range (distinct from work.test.ts's
 *     9_000_000+ range) to keep test suites isolated.
 */

import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { getCategories } from './categories'

const PREFIX = 'test-p7-cat-'

let catAlphaId: string  // sortOrder=8_000_001
let catBetaId: string   // sortOrder=8_000_002
let catAardvarkId: string // no sortOrder (null), name='Test Category P7 Aardvark'
let catZebraId: string    // no sortOrder (null), name='Test Category P7 Zebra'

async function getPayloadForTest() {
  return getPayload({ config: configPromise as any })
}

// ─── beforeAll ────────────────────────────────────────────────────────────────

beforeAll(async () => {
  const payload = await getPayloadForTest()

  // ── Debris guard: clean up PREFIX-prefixed leftover from previous failed run
  const existing = await (payload as any).find({
    collection: 'categories',
    where: { slug: { contains: PREFIX } },
    pagination: false,
    overrideAccess: true,
  })
  for (const doc of existing.docs) {
    await (payload as any).delete({ collection: 'categories', id: doc.id, overrideAccess: true })
  }

  // ── Create test categories

  const catAlpha = await (payload as any).create({
    collection: 'categories',
    data: {
      name: 'Test Category P7 Alpha',
      slug: `${PREFIX}alpha`,
      sortOrder: 8_000_001,
    },
    overrideAccess: true,
  })
  catAlphaId = String(catAlpha.id)

  const catBeta = await (payload as any).create({
    collection: 'categories',
    data: {
      name: 'Test Category P7 Beta',
      slug: `${PREFIX}beta`,
      sortOrder: 8_000_002,
    },
    overrideAccess: true,
  })
  catBetaId = String(catBeta.id)

  // Aardvark: no sortOrder (null).
  const catAardvark = await (payload as any).create({
    collection: 'categories',
    data: {
      name: 'Test Category P7 Aardvark',
      slug: `${PREFIX}aardvark`,
    },
    overrideAccess: true,
  })
  catAardvarkId = String(catAardvark.id)

  // Zebra: created before/after with no sortOrder (null).
  // Tests that secondary sort ('name' ASC) breaks ties when sortOrder is null:
  // Aardvark ('Test Category P7 Aardvark') must sort before Zebra ('Test Category P7 Zebra').
  const catZebra = await (payload as any).create({
    collection: 'categories',
    data: {
      name: 'Test Category P7 Zebra',
      slug: `${PREFIX}zebra`,
    },
    overrideAccess: true,
  })
  catZebraId = String(catZebra.id)
}, 90_000)

// ─── afterAll ─────────────────────────────────────────────────────────────────

afterAll(async () => {
  const payload = await getPayloadForTest()
  for (const id of [catAlphaId, catBetaId, catAardvarkId, catZebraId].filter(Boolean)) {
    await (payload as any).delete({ collection: 'categories', id, overrideAccess: true }).catch(() => {})
  }
}, 90_000)

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('getCategories()', () => {
  it('returns all four test categories', async () => {
    const categories = await getCategories()
    const slugs = categories.map(c => c.slug)

    expect(slugs).toContain(`${PREFIX}alpha`)
    expect(slugs).toContain(`${PREFIX}beta`)
    expect(slugs).toContain(`${PREFIX}aardvark`)
    expect(slugs).toContain(`${PREFIX}zebra`)
  })

  it('returns categories with correct shape (id, name, slug, sortOrder)', async () => {
    const categories = await getCategories()
    const alpha = categories.find(c => c.slug === `${PREFIX}alpha`)

    expect(alpha).toBeDefined()
    expect(alpha!.id).toBe(catAlphaId)
    expect(alpha!.name).toBe('Test Category P7 Alpha')
    expect(alpha!.slug).toBe(`${PREFIX}alpha`)
    expect(alpha!.sortOrder).toBe(8_000_001)
  })

  it('orders by sortOrder ascending: alpha (8_000_001) appears before beta (8_000_002)', async () => {
    const categories = await getCategories()
    const testCats = categories.filter(c => c.slug.startsWith(PREFIX))

    const alphaIdx = testCats.findIndex(c => c.slug === `${PREFIX}alpha`)
    const betaIdx = testCats.findIndex(c => c.slug === `${PREFIX}beta`)

    expect(alphaIdx).toBeGreaterThanOrEqual(0)
    expect(betaIdx).toBeGreaterThanOrEqual(0)
    expect(alphaIdx).toBeLessThan(betaIdx)
  })

  it('nulls-last: unseeded/null sortOrder categories appear after explicitly sorted categories', async () => {
    const categories = await getCategories()
    const testCats = categories.filter(c => c.slug.startsWith(PREFIX))

    const alphaIdx = testCats.findIndex(c => c.slug === `${PREFIX}alpha`)
    const betaIdx = testCats.findIndex(c => c.slug === `${PREFIX}beta`)
    const aardvarkIdx = testCats.findIndex(c => c.slug === `${PREFIX}aardvark`)
    const zebraIdx = testCats.findIndex(c => c.slug === `${PREFIX}zebra`)

    expect(aardvarkIdx).toBeGreaterThan(alphaIdx)
    expect(aardvarkIdx).toBeGreaterThan(betaIdx)
    expect(zebraIdx).toBeGreaterThan(alphaIdx)
    expect(zebraIdx).toBeGreaterThan(betaIdx)
  })

  it('tiebreaker: when sortOrder is null/equal, secondary sort (name ASC) determines order', async () => {
    // Both Aardvark and Zebra have sortOrder: null.
    // 'Test Category P7 Aardvark' < 'Test Category P7 Zebra' alphabetically,
    // so Aardvark must appear before Zebra in the results.
    const categories = await getCategories()
    const testCats = categories.filter(c => c.slug.startsWith(PREFIX))

    const aardvarkIdx = testCats.findIndex(c => c.slug === `${PREFIX}aardvark`)
    const zebraIdx = testCats.findIndex(c => c.slug === `${PREFIX}zebra`)

    expect(aardvarkIdx).toBeGreaterThanOrEqual(0)
    expect(zebraIdx).toBeGreaterThanOrEqual(0)
    expect(aardvarkIdx).toBeLessThan(zebraIdx)
  })

  it('sortOrder is null for aardvark (no sortOrder set during creation)', async () => {
    const categories = await getCategories()
    const aardvark = categories.find(c => c.slug === `${PREFIX}aardvark`)

    expect(aardvark).toBeDefined()
    expect(aardvark!.sortOrder).toBeNull()
  })
})
