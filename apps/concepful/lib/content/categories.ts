/**
 * Data Access Layer — Categories.
 *
 * Part of the enforced lib/content/ boundary (architecture §11/§1.7).
 * Server Components call getCategories() — never payload.find() directly.
 */

import { getPayload } from 'payload'
import configPromise from '@payload-config'
import type { Category } from './types'

async function getPayloadInstance() {
  return getPayload({ config: configPromise as any })
}

function mapCategory(doc: any): Category {
  return {
    id: String(doc.id),
    name: doc.name ?? '',
    slug: doc.slug ?? '',
    sortOrder: doc.sortOrder ?? null,
  }
}

/**
 * Returns all categories ordered by sortOrder ascending.
 *
 * ⚠ NULLS-FIRST BEHAVIOR: Payload's Drizzle adapter puts null sortOrder values
 * FIRST (not last) when sorting ASC. Categories without sortOrder will appear
 * at the top of results, before any explicitly-ordered ones.
 *
 * ⚠ PHASE 8/9 SEEDING DEPENDENCY (CRITICAL): The live site's CATEGORY_FILTERS
 * array has a deliberate, curated display order:
 *   Brand → Website → Product & App → Content & Story → Marketing & Launch → Experimental
 * This order is NOT alphabetical. If Phase 8/9 creates category documents
 * without explicitly setting sortOrder, those categories will appear FIRST in
 * the filter UI (not last) — an even more disruptive regression than expected.
 *
 * Phase 8/9 MUST explicitly set sortOrder on every category during seeding,
 * matching the curated order above. This is a required prerequisite for Phase 11
 * correctness, not optional cleanup.
 */
export async function getCategories(): Promise<Category[]> {
  try {
    const payload = await getPayloadInstance()
    const result = await (payload as any).find({
      collection: 'categories',
      sort: ['sortOrder', 'name'],
      pagination: false,
      depth: 0,
      overrideAccess: true,
    })
    return (result.docs as any[]).map(mapCategory)
  } catch (error) {
    console.error('[getCategories] Error querying categories:', error)
    return []
  }
}
