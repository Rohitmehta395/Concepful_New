/**
 * Data Access Layer — Work (Case Studies).
 *
 * This is the sole enforced boundary through which Server Components read
 * Case Study data, per architecture §11/§1.7. No component or page should
 * call Payload's Local API directly — every read goes through one of these
 * named, typed functions.
 *
 * All functions:
 *   - Return frontend-facing types from lib/content/types.ts (never payload-types.ts)
 *   - Filter to published documents only (drafts never returned — see PUBLISHED_WHERE)
 *   - Use overrideAccess: true (Server Components are trusted server code, not
 *     end-user requests; Local API access control override is appropriate here)
 *   - Are independently testable without Next.js (pure async functions, no React)
 */

import { getPayload } from 'payload'
import configPromise from '@payload-config'
import type { CaseStudy, Category, MediaAsset } from './types'

async function getPayloadInstance() {
  // getPayload() handles its own singleton caching internally.
  return getPayload({ config: configPromise as any })
}

// ─── Internal mapping functions ──────────────────────────────────────────────
// These translate Payload's internal document shape to the stable frontend types.
// If Payload's internal shape changes (e.g. an upgrade, a field rename), only
// these functions change — no consuming component is affected.

function mapCategory(doc: any): Category | null {
  if (!doc || typeof doc !== 'object') return null
  return {
    id: String(doc.id),
    name: doc.name ?? '',
    slug: doc.slug ?? '',
    sortOrder: doc.sortOrder ?? null,
  }
}

function mapMedia(doc: any): MediaAsset | null {
  if (!doc || typeof doc !== 'object') return null
  return {
    id: String(doc.id),
    alt: doc.alt ?? '',
    url: doc.url ?? null,
    caption: doc.caption ?? null,
  }
}

function mapCaseStudy(doc: any): CaseStudy {
  return {
    id: String(doc.id),
    slug: doc.slug ?? '',
    title: doc.title ?? '',
    client: doc.client ?? '',
    category: mapCategory(doc.category),
    teaser: doc.teaser ?? '',
    coverImage: mapMedia(doc.coverImage),
    theme: doc.theme ?? null,
    brief: doc.brief ?? '',
    // Flatten Payload's [{text, id}] array-field shape to plain string[]
    challenges: (doc.challenges ?? []).map((c: any) => c.text ?? ''),
    deliverables: (doc.deliverables ?? []).map((d: any) => d.text ?? ''),
    tools: (doc.tools ?? []).map((t: any) => t.text ?? ''),
    outcome: doc.outcome ?? '',
    outcomeMetrics: (doc.outcomeMetrics ?? []).map((m: any) => ({
      label: m.label ?? '',
      value: m.value ?? '',
    })),
    featured: doc.featured ?? false,
    sortOrder: doc.sortOrder ?? null,
    // relatedCaseStudy is expanded to a full object at depth:1 — extract ID only
    relatedCaseStudyId: doc.relatedCaseStudy
      ? typeof doc.relatedCaseStudy === 'object'
        ? String(doc.relatedCaseStudy.id)
        : String(doc.relatedCaseStudy)
      : null,
    tags: (doc.tags ?? []).map((t: any) => t.text ?? ''),
    createdAt: doc.createdAt ?? '',
    updatedAt: doc.updatedAt ?? '',
  }
}

/**
 * Explicit published-only filter applied to every query.
 * With versions.drafts enabled, Payload defaults to published-only, but this
 * makes the intent unambiguous in the code — draft filtering is a first-class
 * concern, not an implicit default that could silently change.
 */
const PUBLISHED_WHERE = { _status: { equals: 'published' } }

// ─── Public API ──────────────────────────────────────────────────────────────

/**
 * Returns all published case studies.
 *
 * Ordering: sortOrder ascending (NULLs last per Postgres ASC default).
 *
 * ⚠ JUDGMENT CALL (flagged): data/work-data.ts returns CASE_STUDIES with no
 * sort applied — pure array-literal order. This function introduces an
 * intentional ordering by sortOrder. Since sortOrder is not yet populated for
 * any real case study (Phase 8/9 seeding hasn't run), all existing docs have
 * null sortOrder and will be ordered by Postgres's natural row order until
 * real values are seeded. This is new, more intentional behavior — not a
 * replication of current site behavior — flagged explicitly per Step 2 review.
 */
export async function getAllCaseStudies(): Promise<CaseStudy[]> {
  const payload = await getPayloadInstance()
  const result = await (payload as any).find({
    collection: 'case-studies',
    where: PUBLISHED_WHERE,
    sort: ['sortOrder', '-createdAt'],
    pagination: false,
    depth: 1,
    overrideAccess: true,
  })
  return (result.docs as any[]).map(mapCaseStudy)
}

/**
 * Returns published case studies with featured: true, sliced to a maximum of 3.
 *
 * Exact replication of current behavior from data/work-data.ts:
 *   CASE_STUDIES.filter(study => study.featured).slice(0, 3)
 *
 * The slice is implemented as `limit: 3` in the query (same semantics: return
 * at most the first 3 matching items). The current dataset has exactly 3
 * featured case studies, so slice never fires today — but the limit correctly
 * enforces the cap if more are ever marked featured.
 */
export async function getFeaturedCaseStudies(): Promise<CaseStudy[]> {
  const payload = await getPayloadInstance()
  const result = await (payload as any).find({
    collection: 'case-studies',
    where: {
      and: [PUBLISHED_WHERE, { featured: { equals: true } }],
    },
    sort: ['sortOrder', '-createdAt'],
    limit: 3,
    depth: 1,
    overrideAccess: true,
  })
  return (result.docs as any[]).map(mapCaseStudy)
}

/**
 * Returns the published case study with the given slug, or null if not found
 * or not published (including drafts, which are treated as not-found).
 */
export async function getCaseStudyBySlug(slug: string): Promise<CaseStudy | null> {
  const payload = await getPayloadInstance()
  const result = await (payload as any).find({
    collection: 'case-studies',
    where: {
      and: [PUBLISHED_WHERE, { slug: { equals: slug } }],
    },
    depth: 1,
    limit: 1,
    overrideAccess: true,
  })
  if (!result.docs || result.docs.length === 0) return null
  return mapCaseStudy(result.docs[0])
}

/**
 * Returns the "next" published case study after the given one, using this
 * fallback chain (per architecture §2.3 / §3.2):
 *
 *   Priority 1 — Editor-set relatedCaseStudy:
 *     If current.relatedCaseStudyId is set, return that case study if it
 *     exists and is published. This gives editors explicit control over the
 *     "next project" narrative.
 *
 *   Priority 2 — Next by sortOrder:
 *     If current.sortOrder is non-null, return the published case study with
 *     the lowest sortOrder greater than current.sortOrder. Requires Phase 8/9
 *     seeding to populate sortOrder values.
 *
 *   Otherwise → null (no adjacent item, no wrap-around).
 *
 * ⚠ JUDGMENT CALL (flagged): The "last item wraps to first" question is
 *   explicitly a product decision deferred to Phase 12 per the spec (§6,
 *   Phase 12 regression risk). This implementation returns null when no
 *   adjacent item exists — no wrap-around.
 *
 * ⚠ JUDGMENT CALL (flagged): When current.sortOrder is null/undefined,
 *   this function returns null from Priority 2. This is correct and intentional:
 *   sortOrder is the defined ordering mechanism, and until Phase 8/9 seeding
 *   populates it, the adjacency fallback cannot operate. Phase 12 tests the
 *   full chain against real seeded content where sortOrder is set.
 */
export async function getAdjacentCaseStudy(current: CaseStudy): Promise<CaseStudy | null> {
  const payload = await getPayloadInstance()

  // Priority 1: editor-set relatedCaseStudy
  if (current.relatedCaseStudyId) {
    const result = await (payload as any).find({
      collection: 'case-studies',
      where: {
        and: [
          PUBLISHED_WHERE,
          { id: { equals: current.relatedCaseStudyId } },
        ],
      },
      depth: 1,
      limit: 1,
      overrideAccess: true,
    })
    if (result.docs && result.docs.length > 0) {
      return mapCaseStudy(result.docs[0])
    }
  }

  // Priority 2: next by sortOrder
  if (current.sortOrder !== null && current.sortOrder !== undefined) {
    const result = await (payload as any).find({
      collection: 'case-studies',
      where: {
        and: [
          PUBLISHED_WHERE,
          { sortOrder: { greater_than: current.sortOrder } },
        ],
      },
      sort: 'sortOrder',
      limit: 1,
      depth: 1,
      overrideAccess: true,
    })
    if (result.docs && result.docs.length > 0) {
      return mapCaseStudy(result.docs[0])
    }
  }

  // No adjacent item found — no wrap-around (product decision deferred to Phase 12)
  return null
}
