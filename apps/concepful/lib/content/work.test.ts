/**
 * Phase 7 — Content Data Access Layer: unit tests for lib/content/work.ts
 *
 * These tests run against the REAL dev Payload instance (Supabase Postgres,
 * payload schema). No mocking. The value being tested is "does this correctly
 * translate Payload's query results" — a mock would trivially pass without
 * proving the actual filtering logic.
 *
 * Test isolation strategy:
 *   - All test documents use the PREFIX slug prefix for identification.
 *   - beforeAll deletes any PREFIX-prefixed leftover docs first (debris guard
 *     for previous crashed runs), then creates fresh test data.
 *   - afterAll deletes everything created by this suite.
 *   - Case studies are deleted before categories/media (FK order).
 *
 * Database state assumptions:
 *   - The dev DB may already contain published case studies from manual testing.
 *   - Assertions filter results to PREFIX-prefixed docs only (no count assumptions
 *     on the total dataset), so pre-existing docs don't pollute assertions.
 *   - sortOrder values use the 9_000_000+ range to stay above any manually
 *     created docs (which have null sortOrder and therefore sort LAST in ASC).
 */

import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import { getPayload } from 'payload'
import configPromise from '@payload-config'
import {
  getAllCaseStudies,
  getFeaturedCaseStudies,
  getCaseStudyBySlug,
  getAdjacentCaseStudy,
} from './work'

// ─── Constants ───────────────────────────────────────────────────────────────

/** Slug prefix for ALL case studies created by this suite. */
const CS_PREFIX = 'test-p7-work-'
/** Slug for the fixture category (shared across all test case studies). */
const FIXTURE_CAT_SLUG = 'test-p7-work-fixture-cat'
/** Alt text for the fixture media doc (used as identifier for cleanup). */
const FIXTURE_MEDIA_ALT = 'test-p7-work-fixture-media'

// ─── IDs captured from beforeAll ─────────────────────────────────────────────

let testCategoryId: any
let testMediaId: any
let csAId: string   // published, non-featured, sortOrder=9_000_001
let csBId: string   // published, non-featured, sortOrder=9_000_002, no related
let csCId: string   // published, featured=true, sortOrder=9_000_003
let csDId: string   // published, featured=true, sortOrder=9_000_004
let csEId: string   // published, featured=true, sortOrder=9_000_005
let csFExtraId: string // published, featured=true, sortOrder=9_000_006 (4th featured → tests slice)
let csDraftId: string  // draft, featured=true → must NEVER appear in public reads
let csTieOlderId: string // published, sortOrder=9_000_010, created earlier
let csTieNewerId: string // published, sortOrder=9_000_010, created later (tests -createdAt tiebreaker)

// ─── Helpers ─────────────────────────────────────────────────────────────────

async function getPayloadForTest() {
  return getPayload({ config: configPromise as any })
}

/**
 * Returns the minimal valid data for a published case study.
 * Required-to-publish fields (category, coverImage) are set by the caller
 * after this factory runs (they depend on IDs created in beforeAll).
 */
function publishedCsData(opts: {
  slugSuffix: string
  featured?: boolean
  sortOrder?: number | null
  relatedCaseStudy?: string | null
}) {
  return {
    slug: `${CS_PREFIX}${opts.slugSuffix}`,
    title: `Test CS ${opts.slugSuffix}`,
    client: 'Test Client',
    teaser: 'Test teaser.',
    brief: 'Test brief.',
    outcome: 'Test outcome.',
    theme: 'blue',
    challenges: [{ text: 'Test challenge' }],
    deliverables: [{ text: 'Test deliverable' }],
    tools: [{ text: 'Test tool' }],
    outcomeMetrics: [{ label: 'Test metric', value: '100%' }],
    tags: [],
    featured: opts.featured ?? false,
    sortOrder: opts.sortOrder ?? null,
    relatedCaseStudy: opts.relatedCaseStudy ?? null,
    _status: 'published',
  }
}

// ─── beforeAll ────────────────────────────────────────────────────────────────

beforeAll(async () => {
  const payload = await getPayloadForTest()

  // ── Step 1: Debris guard ────────────────────────────────────────────────────
  // Delete any docs left over from a previous run that crashed before afterAll.
  // Find published docs first (default find), then drafts.

  // Find published case studies with prefix (default find = published only)
  const existingPublished = await (payload as any).find({
    collection: 'case-studies',
    where: { slug: { contains: CS_PREFIX } },
    pagination: false,
    overrideAccess: true,
  })
  for (const doc of existingPublished.docs) {
    await (payload as any).delete({ collection: 'case-studies', id: doc.id, overrideAccess: true })
  }

  // Find draft case studies with prefix (draft: true returns latest version of each doc)
  const existingDrafts = await (payload as any).find({
    collection: 'case-studies',
    where: { slug: { contains: CS_PREFIX } },
    pagination: false,
    overrideAccess: true,
    draft: true,
  })
  for (const doc of existingDrafts.docs) {
    await (payload as any).delete({ collection: 'case-studies', id: doc.id, overrideAccess: true }).catch(() => {/* already deleted above */})
  }

  // Clean up fixture category
  const existingCats = await (payload as any).find({
    collection: 'categories',
    where: { slug: { equals: FIXTURE_CAT_SLUG } },
    pagination: false,
    overrideAccess: true,
  })
  for (const doc of existingCats.docs) {
    await (payload as any).delete({ collection: 'categories', id: doc.id, overrideAccess: true })
  }

  // Clean up fixture media
  const existingMedia = await (payload as any).find({
    collection: 'media',
    where: { alt: { equals: FIXTURE_MEDIA_ALT } },
    pagination: false,
    overrideAccess: true,
  })
  for (const doc of existingMedia.docs) {
    await (payload as any).delete({ collection: 'media', id: doc.id, overrideAccess: true })
  }

  // ── Step 2: Create fixture category ────────────────────────────────────────
  const cat = await (payload as any).create({
    collection: 'categories',
    data: {
      name: 'Test Category P7 Work Fixture',
      slug: FIXTURE_CAT_SLUG,
      sortOrder: 9_999_999,
    },
    overrideAccess: true,
  })
  testCategoryId = cat.id

  // ── Step 3: Create fixture media
  // Payload's upload collection requires a file object even via Local API.
  // A minimal 1x1 transparent PNG (68 bytes) satisfies the upload handler.
  const TINY_PNG = Buffer.from(
    'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
    'base64'
  )
  const media = await (payload as any).create({
    collection: 'media',
    data: {
      alt: FIXTURE_MEDIA_ALT,
    },
    file: {
      data: TINY_PNG,
      mimetype: 'image/png',
      name: 'test-p7-fixture.png',
      size: TINY_PNG.length,
    },
    overrideAccess: true,
  })
  testMediaId = media.id

  // ── Step 4: Create published test case studies ──────────────────────────────

  const csA = await (payload as any).create({
    collection: 'case-studies',
    data: {
      ...publishedCsData({ slugSuffix: 'cs-a', featured: false, sortOrder: 9_000_001 }),
      category: testCategoryId,
      coverImage: testMediaId,
    },
    overrideAccess: true,
  })
  csAId = String(csA.id)

  const csB = await (payload as any).create({
    collection: 'case-studies',
    data: {
      ...publishedCsData({ slugSuffix: 'cs-b', featured: false, sortOrder: 9_000_002 }),
      category: testCategoryId,
      coverImage: testMediaId,
    },
    overrideAccess: true,
  })
  csBId = String(csB.id)

  const csC = await (payload as any).create({
    collection: 'case-studies',
    data: {
      ...publishedCsData({ slugSuffix: 'cs-c', featured: true, sortOrder: 9_000_003 }),
      category: testCategoryId,
      coverImage: testMediaId,
    },
    overrideAccess: true,
  })
  csCId = String(csC.id)

  const csD = await (payload as any).create({
    collection: 'case-studies',
    data: {
      ...publishedCsData({ slugSuffix: 'cs-d', featured: true, sortOrder: 9_000_004 }),
      category: testCategoryId,
      coverImage: testMediaId,
    },
    overrideAccess: true,
  })
  csDId = String(csD.id)

  const csE = await (payload as any).create({
    collection: 'case-studies',
    data: {
      ...publishedCsData({ slugSuffix: 'cs-e', featured: true, sortOrder: 9_000_005 }),
      category: testCategoryId,
      coverImage: testMediaId,
    },
    overrideAccess: true,
  })
  csEId = String(csE.id)

  // csFExtra is the 4th featured published doc — proves getFeaturedCaseStudies()
  // slices to max 3 and does not return this one.
  const csFExtra = await (payload as any).create({
    collection: 'case-studies',
    data: {
      ...publishedCsData({ slugSuffix: 'cs-fextra', featured: true, sortOrder: 9_000_006 }),
      category: testCategoryId,
      coverImage: testMediaId,
    },
    overrideAccess: true,
  })
  csFExtraId = String(csFExtra.id)

  // ── Step 5: Create draft case study (featured=true) ─────────────────────────
  // This is the highest-consequence fixture: a draft that has featured=true.
  // It must NEVER appear in getAllCaseStudies() or getFeaturedCaseStudies().
  // Using draft: true creates it in draft state without triggering
  // required-to-publish validation (no category/coverImage needed).
  const csDraft = await (payload as any).create({
    collection: 'case-studies',
    data: {
      slug: `${CS_PREFIX}cs-draft`,
      title: 'Draft Test Case Study',
      featured: true,
    },
    draft: true,
    overrideAccess: true,
  })
  csDraftId = String(csDraft.id)

  // ── Step 6: Create tiebreaker fixtures (equal sortOrder) ───────────────────
  // Both have sortOrder: 9_000_010.
  // csTieOlder is created first, then a delay, then csTieNewer.
  // Secondary sort ('-createdAt' DESC) must place csTieNewer BEFORE csTieOlder.
  const csTieOlder = await (payload as any).create({
    collection: 'case-studies',
    data: {
      ...publishedCsData({ slugSuffix: 'cs-tie-older', featured: false, sortOrder: 9_000_010 }),
      category: testCategoryId,
      coverImage: testMediaId,
    },
    overrideAccess: true,
  })
  csTieOlderId = String(csTieOlder.id)

  await new Promise(resolve => setTimeout(resolve, 100))

  const csTieNewer = await (payload as any).create({
    collection: 'case-studies',
    data: {
      ...publishedCsData({ slugSuffix: 'cs-tie-newer', featured: false, sortOrder: 9_000_010 }),
      category: testCategoryId,
      coverImage: testMediaId,
    },
    overrideAccess: true,
  })
  csTieNewerId = String(csTieNewer.id)

  // ── Step 7: Set relatedCaseStudy on csA → csC ──────────────────────────────
  // Used by getAdjacentCaseStudy() Priority 1 test:
  // csA.sortOrder=9_000_001 so ordering-based "next" would be csB (9_000_002),
  // but relatedCaseStudy=csC must WIN over sortOrder ordering.
  await (payload as any).update({
    collection: 'case-studies',
    id: csA.id,
    data: { relatedCaseStudy: csC.id },
    overrideAccess: true,
  })
}, 90_000)

// ─── afterAll ────────────────────────────────────────────────────────────────

afterAll(async () => {
  const payload = await getPayloadForTest()

  // Delete case studies first (they reference category and media)
  const csIds = [
    csAId,
    csBId,
    csCId,
    csDId,
    csEId,
    csFExtraId,
    csDraftId,
    csTieOlderId,
    csTieNewerId,
  ].filter(Boolean)
  for (const id of csIds) {
    await (payload as any).delete({ collection: 'case-studies', id, overrideAccess: true }).catch(() => {})
  }

  if (testCategoryId) {
    await (payload as any).delete({ collection: 'categories', id: testCategoryId, overrideAccess: true }).catch(() => {})
  }
  if (testMediaId) {
    await (payload as any).delete({ collection: 'media', id: testMediaId, overrideAccess: true }).catch(() => {})
  }
}, 90_000)

// ─── getAllCaseStudies() ──────────────────────────────────────────────────────

describe('getAllCaseStudies()', () => {
  it('draft case study is absent from results — highest-consequence check', async () => {
    const all = await getAllCaseStudies()
    const slugs = all.map(cs => cs.slug)
    // The draft (featured=true, _status=draft) must not appear regardless of featured flag
    expect(slugs).not.toContain(`${CS_PREFIX}cs-draft`)
  })

  it('all 8 published test fixtures appear; draft (9th) does not', async () => {
    const all = await getAllCaseStudies()
    const testDocs = all.filter(cs => cs.slug.startsWith(CS_PREFIX))
    const testSlugs = testDocs.map(cs => cs.slug)

    expect(testSlugs).toContain(`${CS_PREFIX}cs-a`)
    expect(testSlugs).toContain(`${CS_PREFIX}cs-b`)
    expect(testSlugs).toContain(`${CS_PREFIX}cs-c`)
    expect(testSlugs).toContain(`${CS_PREFIX}cs-d`)
    expect(testSlugs).toContain(`${CS_PREFIX}cs-e`)
    expect(testSlugs).toContain(`${CS_PREFIX}cs-fextra`)
    expect(testSlugs).toContain(`${CS_PREFIX}cs-tie-older`)
    expect(testSlugs).toContain(`${CS_PREFIX}cs-tie-newer`)
    expect(testSlugs).not.toContain(`${CS_PREFIX}cs-draft`)
    // Exactly 8 test documents (8 published, 0 draft)
    expect(testDocs).toHaveLength(8)
  })

  it('test docs are ordered by sortOrder ascending (9_000_001 → 9_000_010)', async () => {
    const all = await getAllCaseStudies()
    const testDocs = all.filter(cs => cs.slug.startsWith(CS_PREFIX))
    const sortOrders = testDocs.map(cs => cs.sortOrder).filter(
      (s): s is number => s !== null && s !== undefined
    )
    for (let i = 1; i < sortOrders.length; i++) {
      expect(sortOrders[i]).toBeGreaterThanOrEqual(sortOrders[i - 1])
    }
  })

  it('tiebreaker: when sortOrder is identical/null, secondary sort (createdAt DESC) determines order', async () => {
    // Both csTieOlder and csTieNewer have sortOrder: 9_000_010.
    // csTieNewer was created after csTieOlder, so its createdAt timestamp is newer.
    // With sort: ['sortOrder', '-createdAt'], csTieNewer must appear BEFORE csTieOlder.
    const all = await getAllCaseStudies()
    const testDocs = all.filter(cs => cs.slug.startsWith(CS_PREFIX))

    const newerIdx = testDocs.findIndex(cs => cs.slug === `${CS_PREFIX}cs-tie-newer`)
    const olderIdx = testDocs.findIndex(cs => cs.slug === `${CS_PREFIX}cs-tie-older`)

    expect(newerIdx).toBeGreaterThanOrEqual(0)
    expect(olderIdx).toBeGreaterThanOrEqual(0)
    expect(newerIdx).toBeLessThan(olderIdx)
  })

  it('returns plain string arrays for challenges, deliverables, tools, tags', async () => {
    const all = await getAllCaseStudies()
    const testDoc = all.find(cs => cs.slug === `${CS_PREFIX}cs-a`)
    expect(testDoc).toBeDefined()
    expect(testDoc!.challenges).toEqual(['Test challenge'])
    expect(testDoc!.deliverables).toEqual(['Test deliverable'])
    expect(testDoc!.tools).toEqual(['Test tool'])
    // tags was seeded as [] (empty array)
    expect(Array.isArray(testDoc!.tags)).toBe(true)
  })
})

// ─── getFeaturedCaseStudies() ─────────────────────────────────────────────────

describe('getFeaturedCaseStudies()', () => {
  it('draft featured case study is absent from results', async () => {
    const featured = await getFeaturedCaseStudies()
    const slugs = featured.map(cs => cs.slug)
    expect(slugs).not.toContain(`${CS_PREFIX}cs-draft`)
  })

  it('returns at most 3 items (slice behavior)', async () => {
    const featured = await getFeaturedCaseStudies()
    // This is the global count (may include non-test featured docs)
    expect(featured.length).toBeLessThanOrEqual(3)
    expect(featured.length).toBeGreaterThan(0)
  })

  it('all returned docs have featured: true', async () => {
    const featured = await getFeaturedCaseStudies()
    expect(featured.every(cs => cs.featured === true)).toBe(true)
  })

  it('csFExtra (4th featured by sortOrder) is sliced off — proves limit:3', async () => {
    // We have 4 published featured test docs (csC 9_000_003, csD 9_000_004,
    // csE 9_000_005, csFExtra 9_000_006). With limit:3, csFExtra must be absent.
    const featured = await getFeaturedCaseStudies()
    const testFeatured = featured.filter(cs => cs.slug.startsWith(CS_PREFIX))
    const testSlugs = testFeatured.map(cs => cs.slug)

    // The 4th (highest sortOrder among our test featured docs) must not appear
    expect(testSlugs).not.toContain(`${CS_PREFIX}cs-fextra`)
    // The first 3 by sortOrder should be present (assuming no other featured docs
    // have sortOrder between 9_000_002 and 9_000_005 in the DB)
    expect(testSlugs).toContain(`${CS_PREFIX}cs-c`)
    expect(testSlugs).toContain(`${CS_PREFIX}cs-d`)
    expect(testSlugs).toContain(`${CS_PREFIX}cs-e`)
  })
})

// ─── getCaseStudyBySlug() ─────────────────────────────────────────────────────

describe('getCaseStudyBySlug()', () => {
  it('returns the correct case study when found (published)', async () => {
    const cs = await getCaseStudyBySlug(`${CS_PREFIX}cs-b`)
    expect(cs).not.toBeNull()
    expect(cs!.slug).toBe(`${CS_PREFIX}cs-b`)
    expect(cs!.title).toBe('Test CS cs-b')
    expect(cs!.id).toBe(csBId)
    expect(cs!.featured).toBe(false)
  })

  it('returns null when slug does not exist', async () => {
    const cs = await getCaseStudyBySlug('nonexistent-slug-test-p7-zzz-99999')
    expect(cs).toBeNull()
  })

  it('returns null for a draft case study — draft must not be publicly accessible', async () => {
    const cs = await getCaseStudyBySlug(`${CS_PREFIX}cs-draft`)
    expect(cs).toBeNull()
  })

  it('correctly maps outcomeMetrics, challenges, deliverables, tools', async () => {
    const cs = await getCaseStudyBySlug(`${CS_PREFIX}cs-c`)
    expect(cs).not.toBeNull()
    expect(cs!.outcomeMetrics).toHaveLength(1)
    expect(cs!.outcomeMetrics[0]).toEqual({ label: 'Test metric', value: '100%' })
    expect(cs!.challenges).toEqual(['Test challenge'])
    expect(cs!.deliverables).toEqual(['Test deliverable'])
    expect(cs!.tools).toEqual(['Test tool'])
  })

  it('correctly maps the populated category relationship', async () => {
    const cs = await getCaseStudyBySlug(`${CS_PREFIX}cs-c`)
    expect(cs).not.toBeNull()
    expect(cs!.category).not.toBeNull()
    expect(cs!.category!.id).toBe(String(testCategoryId))
    expect(cs!.category!.slug).toBe(FIXTURE_CAT_SLUG)
    expect(cs!.category!.name).toBe('Test Category P7 Work Fixture')
  })

  it('returns sortOrder correctly', async () => {
    const cs = await getCaseStudyBySlug(`${CS_PREFIX}cs-c`)
    expect(cs!.sortOrder).toBe(9_000_003)
  })
})

// ─── getAdjacentCaseStudy() ───────────────────────────────────────────────────

describe('getAdjacentCaseStudy()', () => {
  it('Priority 1: returns editor-set relatedCaseStudy when present', async () => {
    // csA was updated in beforeAll: relatedCaseStudy = csC
    const csA = await getCaseStudyBySlug(`${CS_PREFIX}cs-a`)
    expect(csA).not.toBeNull()
    expect(csA!.relatedCaseStudyId).toBe(csCId)

    const adjacent = await getAdjacentCaseStudy(csA!)
    expect(adjacent).not.toBeNull()
    expect(adjacent!.id).toBe(csCId)
    expect(adjacent!.slug).toBe(`${CS_PREFIX}cs-c`)
  })

  it('Priority 1 overrides sortOrder ordering: related (csC) wins over next-by-sortOrder (csB)', async () => {
    // csA.sortOrder=9_000_001 → ordering-based next would be csB (9_000_002)
    // but csA.relatedCaseStudy=csC — relatedCaseStudy must take priority
    const csA = await getCaseStudyBySlug(`${CS_PREFIX}cs-a`)
    const adjacent = await getAdjacentCaseStudy(csA!)

    expect(adjacent!.id).toBe(csCId)   // csC returned (related)
    expect(adjacent!.id).not.toBe(csBId) // csB NOT returned (would be next by sortOrder)
  })

  it('Priority 2: falls back to sortOrder when relatedCaseStudy is not set', async () => {
    // csB has no relatedCaseStudy, sortOrder=9_000_002
    // The next published doc with sortOrder > 9_000_002 is csC (9_000_003)
    const csB = await getCaseStudyBySlug(`${CS_PREFIX}cs-b`)
    expect(csB).not.toBeNull()
    expect(csB!.relatedCaseStudyId).toBeNull()
    expect(csB!.sortOrder).toBe(9_000_002)

    const adjacent = await getAdjacentCaseStudy(csB!)
    expect(adjacent).not.toBeNull()
    expect(adjacent!.id).toBe(csCId)
    expect(adjacent!.slug).toBe(`${CS_PREFIX}cs-c`)
  })

  it('returns null when there is no sortOrder and no relatedCaseStudy', async () => {
    // Create a temporary published case study with null sortOrder and no related
    const payload = await getPayloadForTest()
    const tempCs = await (payload as any).create({
      collection: 'case-studies',
      data: {
        ...publishedCsData({ slugSuffix: 'cs-no-order', sortOrder: null }),
        category: testCategoryId,
        coverImage: testMediaId,
      },
      overrideAccess: true,
    })
    const tempId = String(tempCs.id)

    try {
      const tempFrontend = await getCaseStudyBySlug(`${CS_PREFIX}cs-no-order`)
      expect(tempFrontend).not.toBeNull()
      expect(tempFrontend!.sortOrder).toBeNull()
      expect(tempFrontend!.relatedCaseStudyId).toBeNull()

      // With no sortOrder and no relatedCaseStudy, adjacency returns null
      const adjacent = await getAdjacentCaseStudy(tempFrontend!)
      expect(adjacent).toBeNull()
    } finally {
      // Always clean up the temporary doc
      await (payload as any).delete({ collection: 'case-studies', id: tempId, overrideAccess: true })
    }
  })

  it('draft is not returned even if it is the relatedCaseStudy target', async () => {
    // Construct a CaseStudy object that points to the draft doc's ID
    // (simulates an editor accidentally relating to a draft)
    const csBRaw = await getCaseStudyBySlug(`${CS_PREFIX}cs-b`)
    const csWithDraftRelated = {
      ...csBRaw!,
      relatedCaseStudyId: csDraftId,
      sortOrder: null, // also null sortOrder so fallback doesn't fire
    }

    const adjacent = await getAdjacentCaseStudy(csWithDraftRelated)
    // Draft is not published — PUBLISHED_WHERE filter must exclude it
    expect(adjacent).toBeNull()
  })
})
