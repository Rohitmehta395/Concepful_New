/**
 * Frontend-facing content types for the Data Access Layer (lib/content/).
 *
 * These are intentionally decoupled from payload-types.ts (Payload's generated
 * internal types). All code in app/ and components/ that needs Case Study or
 * Category data imports from this file only — never from payload-types.ts directly.
 *
 * Why decoupled: payload-types.ts is an implementation detail of the Payload CMS
 * integration. If Payload upgrades and changes its internal type shape, or a
 * collection field is renamed, only the mapping functions in lib/content/work.ts
 * and lib/content/categories.ts need to change — no downstream component is
 * affected. This is what makes the lib/content/ boundary from §1.7/§4 of the
 * architecture proposal real rather than aspirational.
 *
 * Phase 11/12 imports: import type { CaseStudy, Category } from '@/lib/content/types'
 */

/** Closed enum of valid case study themes, matching CaseStudies collection config. */
export type CaseStudyTheme =
  | 'blue'
  | 'amber'
  | 'purple'
  | 'emerald'
  | 'cyan'
  | 'indigo'
  | 'violet'

export type OutcomeMetric = {
  label: string
  value: string
}

export type MediaAsset = {
  id: string
  alt: string
  url?: string | null
  caption?: string | null
}

export type Category = {
  id: string
  name: string
  slug: string
  /**
   * Controls display order in filter UI. null/undefined means sortOrder was not
   * set. getCategories() orders by this ascending (nulls last).
   *
   * IMPORTANT — Phase 8/9 seeding dependency: The live site's CATEGORY_FILTERS
   * array has a curated, hand-ordered sequence (Brand, Website, Product & App,
   * Content & Story, Marketing & Launch, Experimental). If Phase 8/9 creates
   * category documents without explicitly setting sortOrder to match that curated
   * order, getCategories() will silently return them alphabetically when sortOrder
   * is null — a visible regression in the filter UI that won't break anything but
   * will quietly look different. Phase 8/9 seeding MUST set sortOrder deliberately.
   */
  sortOrder?: number | null
}

/**
 * Frontend-facing representation of a published Case Study.
 * Returned by all functions in lib/content/work.ts.
 *
 * Array fields (challenges, deliverables, tools, tags) are flattened from
 * Payload's internal [{text, id}] array-field shape to plain string[].
 * Components see strings; Payload's internal structure never leaks through.
 */
export type CaseStudy = {
  id: string
  slug: string
  title: string
  client: string
  /** null when the category relationship is not populated or not set. */
  category: Category | null
  teaser: string
  /** null when the coverImage relationship is not populated or not set. */
  coverImage: MediaAsset | null
  theme: CaseStudyTheme | null
  brief: string
  challenges: string[]
  deliverables: string[]
  tools: string[]
  outcome: string
  outcomeMetrics: OutcomeMetric[]
  featured: boolean
  /**
   * Explicit manual ordering override for adjacency and listing order.
   * null/undefined until Phase 8/9 seeding populates it.
   * getAdjacentCaseStudy() uses this for the sortOrder-based fallback chain.
   */
  sortOrder?: number | null
  /**
   * ID of the editor-set related case study, if any.
   * Used internally by getAdjacentCaseStudy() for Priority 1 of the fallback chain.
   * Not intended for direct rendering in components.
   */
  relatedCaseStudyId?: string | null
  tags: string[]
  createdAt: string
  updatedAt: string
}
