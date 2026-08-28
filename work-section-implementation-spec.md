# Concepful — Work Section Implementation Design Specification (IDS)

**Document type:** Engineering implementation blueprint
**Status:** Ready for phase-by-phase execution
**Depends on:** *Work Section Architecture Proposal* (approved) — this document does not revisit or re-justify architectural decisions made there; it converts them into buildable work.
**Audience:** Any engineer picking up a phase should be able to implement it without asking "what should this actually do."

---

## 0. How to Use This Document

- §1 defines **workstreams** — ownership boundaries that persist across the whole project.
- §2 defines the **content model** — technology-agnostic, the contract every phase implements against.
- §3 defines **data flow** — how a request becomes rendered content, end to end.
- §4 defines the **final folder structure** — where new code lives and why.
- §5 defines **integration mechanics** — how Payload sits inside the existing Next.js app.
- §6 is the **phase-by-phase plan** — the actual unit of execution. Each phase is scoped to be one pull request.
- §7 is the **cross-cutting testing strategy** referenced by every phase.
- §8 draws the **required-now vs. future** line explicitly.
- §9 is the **project-level Definition of Done**.

No phase in §6 requires a decision that isn't already made in §1–§5 or the architecture proposal. If an implementer finds themselves making a design decision mid-phase, that's a signal this document has a gap — not a signal to improvise.

---

## 1. Workstreams

Nine workstreams. These are ownership boundaries, not phases — several phases in §6 touch one workstream; some phases touch two.

### 1.1 Tooling & Testing Baseline

- **Purpose:** The repository currently has zero automated test infrastructure (no Vitest/Jest/Playwright, no `*.test.*` files anywhere). Every other workstream in this project needs to validate correctness somehow beyond manual QA, especially the data access layer and content migration script, which are pure logic with no UI to eyeball.
- **Responsibilities:** Test runner configuration, test scripts in `package.json`, CI-runnable `typecheck`/`test` commands. Nothing product-specific.
- **Boundaries:** Does not write the tests themselves for other workstreams — it provides the harness. Does not introduce E2E/browser testing (Playwright) — out of scope; manual QA checklists cover UI behavior for this project's size (see §7).
- **Dependencies:** None. This is the first workstream to land.
- **Deliverables:** A working `pnpm test` at the workspace root, scoped to `apps/concepful` and `packages/db`, running on Vitest (chosen for speed and zero-config TypeScript/ESM compatibility with this stack — no Babel config needed, unlike Jest).

### 1.2 Infrastructure

- **Purpose:** Get Payload installed, building, and running inside `apps/concepful` before any content modeling begins, so compatibility risk (§15 of the architecture proposal — Payload 3.x against this specific pnpm/Next.js 15.3.x + patched-`next` setup) is retired early and cheaply.
- **Responsibilities:** Payload package installation, `payload.config.ts` skeleton, the Next.js route handlers Payload requires (`/app/(payload)/...` or equivalent per Payload's Next.js integration convention), environment variable wiring, admin panel reachability.
- **Boundaries:** Does not define collections (that's Content Platform). Does not define the media adapter's storage backend logic (that's Media). Does not touch existing app routes.
- **Dependencies:** Tooling & Testing Baseline (so the phase that lands this can be typechecked/tested in CI from day one).
- **Deliverables:** Payload admin panel loads locally at its configured route with zero collections, authenticated by a manually created first Payload user.

### 1.3 Database

- **Purpose:** Payload and Drizzle share one Postgres instance. This workstream draws the boundary so their migration tooling never collides.
- **Responsibilities:** Postgres schema (namespace) isolation configuration on both sides — Payload's `schemaName` option, `drizzle-kit`'s `schemaFilter` exclusion.
- **Boundaries:** Does not define what tables exist inside Payload's schema (Content Platform's job, executed through Payload's own config, not hand-written SQL). Does not modify any existing Drizzle table.
- **Dependencies:** Infrastructure (Payload must be installed to configure its schema option).
- **Deliverables:** Payload's tables provably live in a separate Postgres schema from Drizzle's; `drizzle-kit generate` provably ignores it.

### 1.4 Content Platform

- **Purpose:** Define the actual content model (§2) inside Payload — the domain-modeling work, expressed through Payload's collection configuration (not hand-written SQL, not application code).
- **Responsibilities:** Categories, Media, and Case Studies collections; field-level validation; the `theme` enum; relationships between collections; publish/draft lifecycle configuration.
- **Boundaries:** Does not decide how the frontend renders any of this. Does not write the data access layer (Data Access Layer workstream's job) or the seed script (Content Migration's job).
- **Dependencies:** Database (schema isolation must exist first, so collections aren't created in the wrong namespace and need to be redone).
- **Deliverables:** Categories, Media, and Case Studies collections exist in Payload's admin panel; a case study can be created, related to a category, given media, and published entirely through the admin UI, with no application code involved.

### 1.5 Media

- **Purpose:** Give Payload's Media collection a real, portable storage backend, and fix the two related gaps the architecture proposal flagged: Replit-sidecar-coupled GCS credentials, and the absence of `next/image` remote-pattern configuration.
- **Responsibilities:** GCS storage adapter configuration for Payload using a portable service-account credential; `next.config.mjs` `images.remotePatterns` entry for the GCS bucket domain.
- **Boundaries:** Does not touch the existing `@workspace/object-storage-web` package or `lib/objectStorage.ts` used by the dashboard — those remain Replit-sidecar-coupled by design of this project's scope; only Payload's *own* media path needs to be portable, since it's the one new thing being built. Does not migrate existing dashboard-uploaded files.
- **Dependencies:** Content Platform (Media collection must exist to attach a storage adapter to it).
- **Deliverables:** An image uploaded through Payload's admin panel lands in GCS and renders via `next/image` on a scratch/test page, using a credential path that does not depend on the Replit sidecar.

### 1.6 Authentication

- **Purpose:** Payload's own user/auth system becomes the real access-control mechanism for content management, per the architecture proposal's §13 — replacing `ADMIN_TOKEN` for content, without attempting to fix the dashboard's `localStorage` session model (explicitly out of scope, tracked separately).
- **Responsibilities:** Payload `Users` collection (or Payload's built-in auth on a collection), role distinction (editor vs. admin, per architecture §13), first-user bootstrap process.
- **Boundaries:** Does not touch `hooks/use-auth-state.ts`, the dashboard, or `/api/work`. Does not remove `ADMIN_TOKEN` itself until Cleanup workstream retires the routes that depend on it (removing it earlier would break `/admin/portfolio` and `/admin/blog` before they're retired).
- **Dependencies:** Infrastructure.
- **Deliverables:** Payload admin panel requires real login; at least two roles exist (editor, admin) with meaningfully different permissions (editors cannot delete collections/manage users; admins can).

### 1.7 Data Access Layer

- **Purpose:** The single, enforced boundary through which Server Components read content — per architecture §11's rule that no component calls Payload's Local API directly.
- **Responsibilities:** `lib/content/` module: typed functions (`getFeaturedCaseStudies()`, `getAllCaseStudies()`, `getCaseStudyBySlug()`, `getAdjacentCaseStudy()`, `getCategories()`), each wrapping a Payload Local API call, each with an explicit return type independent of Payload's internal generated types (so the frontend never imports Payload's types directly).
- **Boundaries:** Does not render anything. Does not know about React, Server Components, or props — pure data functions, testable in isolation without spinning up Next.js.
- **Dependencies:** Content Platform (collections must exist and be queryable).
- **Deliverables:** Every function in `lib/content/` is unit-testable and unit-tested against a seeded local Payload instance, independent of any page that will eventually call them.

### 1.8 Frontend Integration

- **Purpose:** Move the actual Work pages onto the new data access layer, resolving the `WorkMosaic` client-fetch problem identified in the architecture proposal, without regressing the existing UI/animation work.
- **Responsibilities:** `app/(site)/work/page.tsx`, `app/(site)/work/[slug]/page.tsx`, `components/features/work/work-mosaic.tsx` (props refactor only — no visual changes), `generateStaticParams`/`generateMetadata`, on-publish revalidation wiring.
- **Boundaries:** Does not change any visual design, animation, or styling. Does not change `WorkHero`, `WorkFeatured`, `WorkFilters`, `WorkGrid`, `AnimatedHeroCard`, or `AnimatedMetricCard` beyond the prop shape they already accept.
- **Dependencies:** Data Access Layer, Media (images need to render from the new source).
- **Deliverables:** `/work` and `/work/[slug]` are fully backed by Payload, pixel-and-behavior-equivalent to their pre-migration state.

### 1.9 Content Migration & Cleanup

- **Purpose:** Move real content into the new system and then remove everything it supersedes — the phase that actually closes the loop per architecture §7.2/§17.2, so the fragmentation problem doesn't simply relocate.
- **Responsibilities:** Auditing `portfolioItemsTable` for real data; the seed script (including manual `theme` enum mapping from the old free-form gradient strings); deleting `data/case-studies.ts`, `data/work-data.ts`, `/admin/portfolio`, `/api/admin/portfolio/*`; retiring `ADMIN_TOKEN` usage for content routes.
- **Boundaries:** Does not touch `/admin/blog` or `blogPostsTable` — explicitly out of scope per architecture §7.2 (future work, §8 below). Does not touch the dashboard or `/api/work`.
- **Dependencies:** Frontend Integration (nothing can be deleted until the new system is proven equivalent in production).
- **Deliverables:** Zero references to the deleted files/tables/routes anywhere in the codebase; `/admin/portfolio` returns 404.

---

## 2. Content Model Specification

Technology-agnostic. This is the contract §1.4 (Content Platform) implements and §1.7 (Data Access Layer) reads from. No Payload field types below — this is domain modeling.

### 2.1 Category

- **Purpose:** A closed-ish, editor-manageable taxonomy for classifying Case Studies, replacing the current hardcoded `CATEGORY_FILTERS` array and the duplicated `category`/`categoryLabel` string pair on each case study.
- **Ownership:** Content editors manage the list; engineers do not hardcode category values anywhere in frontend code once this ships.
- **Relationships:** One Category has many Case Studies (inverse of Case Study → Category, §2.2). No self-relationships; a flat list, not a hierarchy (nothing in current or foreseeable usage needs nested categories).
- **Required fields:**
  - `name` — human-readable label (e.g., "Product & App"). Must be unique.
  - `slug` — URL/filter-safe identifier (e.g., `product-app`). Must be unique. Used for filter state (`activeFilter`) and any future category-scoped URL.
- **Optional fields:**
  - `sortOrder` — controls display order in filter UI. Defaults to creation order if unset.
- **Validation rules:** `name` and `slug` both required and unique; `slug` restricted to lowercase, hyphen-separated, URL-safe characters.
- **Publishing workflow:** No draft/publish distinction needed — categories are structural, not editorial content; every category that exists is usable immediately. (If this changes — e.g., a category needs to be "coming soon" — that's future work, not required now.)
- **Lifecycle:** Categories are rarely created, essentially never deleted once a Case Study references them (deletion should be blocked or require reassignment first — an implementation-level referential-integrity concern, not a new domain rule).
- **Indexing:** Unique index on `slug` (the one field routing/filtering logic depends on).
- **Future extensibility:** A `description` field if categories ever get their own landing content; hierarchy if the taxonomy ever needs nesting (no evidence this is needed).

### 2.2 Media (Asset)

- **Purpose:** A real, reusable image entity — replacing bare Unsplash URL strings — with its own identity, metadata, and storage-backed file.
- **Ownership:** Content editors upload; the storage backend (GCS, per §1.5) is engineer-configured infrastructure underneath it.
- **Relationships:** Referenced by Case Study (§2.3) via relationship, not by copying a URL. One Media asset may be referenced by multiple Case Studies (e.g., a shared brand photo) without duplication.
- **Required fields:**
  - `file` — the underlying image binary/object.
  - `alt` — accessible alt text. Required, not optional — this is a content-quality and accessibility floor, not a nice-to-have.
- **Optional fields:**
  - `caption` — for any future context where a caption is displayed near the image.
- **Validation rules:** File type restricted to standard web image formats (JPEG/PNG/WebP at minimum); a reasonable max file size (implementation detail, not a domain rule — pick a sane default, e.g., 10MB, and revisit only if it becomes a real constraint).
- **Publishing workflow:** No draft/publish state of its own — a Media asset's visibility is governed entirely by whether the Case Study referencing it is published, not by the asset itself.
- **Lifecycle:** Uploaded, optionally reused across multiple Case Studies, deleted only when no longer referenced (referential-integrity concern at the implementation level, same pattern as Category).
- **Indexing:** None beyond primary key — Media is looked up by relationship, not queried independently at any volume that matters here.
- **Future extensibility:** Auto-generated size variants (Payload's built-in capability, not a new domain concept); video/asset-type expansion if the Work section ever needs motion media (explicitly not required now).

### 2.3 Case Study

- **Purpose:** The core content type — a single piece of portfolio work, published to `/work/[slug]`.
- **Ownership:** Content editors own every field below except `theme`, which is editor-*selected* from an engineer-defined closed set (this is the content/presentation boundary the architecture proposal treats as load-bearing — see architecture §9).
- **Relationships:**
  - `category` — one Case Study belongs to exactly one Category (single relationship, not multi-select; matches current UI, which shows one category pill per case study).
  - `coverImage` — one required relationship to Media.
  - `relatedCaseStudy` — optional, editor-controlled relationship to another Case Study, used as an override for "next project" navigation (architecture §7.3). If unset, "next project" falls back to ordering by `publishedAt`/`sortOrder`.
- **Required fields:**
  - `slug` — unique, URL-safe. Immutable in practice once published (changing it breaks existing inbound links — an editorial process concern, not a technical one, but worth a UI warning if the CMS supports it).
  - `title`
  - `client`
  - `category` (relationship)
  - `teaser` — short-form summary, used on listing/hero cards.
  - `coverImage` (relationship to Media)
  - `theme` — closed enum (e.g., Blue / Emerald / Purple / Amber / Violet), mapped to design tokens entirely in frontend code. **Never** a free-text field, never a raw hex or Tailwind string.
  - `brief` — structured field, "The Brief" section content.
  - `challenges` — ordered list of strings, "The Challenges" section.
  - `deliverables` — ordered list of strings, "What We Made" section.
  - `tools` — ordered list of strings, tool/software tags.
  - `outcome` — structured field, "The Outcome" section.
  - `outcomeMetrics` — ordered list of `{ label, value }` pairs.
  - `status` — draft or published. Governs public visibility.
- **Optional fields:**
  - `featured` — boolean; drives homepage/`WorkHero`/`WorkFeatured` inclusion (top 3 by current logic — see §2.3 lifecycle note below on how this interacts with ordering).
  - `sortOrder` — explicit manual ordering override, used for "next project" fallback and any future manually-curated ordering; falls back to `publishedAt` descending if unset.
  - `relatedCaseStudy` (see Relationships above).
  - `tags` — free-form list, distinct from `category` (single, structural) — present in the current UI as chips (`AnimatedHeroCard`'s `tags` prop) and worth preserving as a separate, lighter-weight field than category.
- **Validation rules:**
  - `slug`, `title`, `client`, `category`, `teaser`, `coverImage`, `theme`, `brief`, `outcome` are required to publish (i.e., required for `status: published`, but a draft may be saved incomplete — see Publishing workflow).
  - `challenges`, `deliverables`, `tools`, `outcomeMetrics` must each contain at least one entry to publish (an empty "Challenges" section would silently break the current UI's `.map()` rendering — this directly encodes the "strict schema adherence" risk the original audit flagged, as a validation rule rather than a runtime UI failure).
  - `slug` uniqueness enforced at the collection level.
- **Publishing workflow:** Draft by default on creation. A Case Study only appears on `/work` or is statically generated at `/work/[slug]` when `status = published` **and** all required-to-publish fields (above) are populated. This is the direct fix for the "strict schema adherence; if a case study is missing a field, it could break the UI" risk called out in the original engineering audit — enforced at the content layer, not discovered at render time.
- **Lifecycle:** Created → drafted (any completeness) → published (full validation) → optionally unpublished (reverts to draft, disappears from public site, remains in the CMS) → optionally deleted. No hard-delete-only workflow — unpublish must be a distinct, reversible action from delete.
- **Indexing:** Unique index on `slug` (routing-critical, same rationale as Category). An index on `status` + `publishedAt`/`sortOrder` is worth having once volume grows past current scale, but not required at nine case studies.
- **Future extensibility:** Rich-text/blocks body (architecture §9 already flags this as intentionally deferred — the current structured-fields approach is the correct choice for this content type's current shape); SEO-specific fields (custom meta title/description, currently derived from `title`/`teaser`) if editorial needs diverge from the automatic derivation; a `services` or `industry` secondary taxonomy if the single `category` relationship ever proves insufficient.

---

## 3. Data Flow Specification

### 3.1 Public read path — `/work` (listing)

```text
Browser request → GET /work
        │
        ▼
Next.js routes to app/(site)/work/page.tsx   (Server Component)
        │
        ▼
lib/content/work.ts
  getAllCaseStudies()        ──┐
  getFeaturedCaseStudies()   ──┼──► Payload Local API (server-only, in-process)
  lib/content/categories.ts    │
  getCategories()            ──┘
        │
        ▼
Payload query layer → Postgres (payload-owned schema)
        │  (validation already enforced at write time; read path trusts
        │   status=published filtering, no re-validation needed on read)
        ▼
Typed plain objects returned up through lib/content/*
        │
        ▼
page.tsx passes data as props to:
  WorkHero(caseStudies)         [Server → Client boundary, data as props]
  WorkFeatured(caseStudies)     [Server → Client boundary, data as props]
  WorkMosaic(caseStudies, categories)  [Server → Client boundary, data as props]
        │
        ▼
WorkMosaic (Client Component) — activeFilter is the ONLY client state;
filters the already-fetched array in-render; no further data fetching.
        │
        ▼
Rendered HTML (ISR-cached; see §5.6)
```

Transformation happens in exactly one place: `lib/content/work.ts`, where Payload's internal shape is mapped to the plain typed objects the frontend consumes (this is also where the frontend is insulated from any future Payload upgrade changing its internal types). Validation happens at write time (§2.3) — the read path does not re-validate, it trusts `status = published` as the sole gate. Caching happens at the Next.js rendering layer (ISR), not inside `lib/content/*` itself (no in-memory or Redis cache layer — unnecessary at this scale per architecture §12).

### 3.2 Public read path — `/work/[slug]` (detail)

```text
Browser request → GET /work/aerosight-drone-ui
        │
        ▼
app/(site)/work/[slug]/page.tsx   (Server Component)
        │
        ▼
lib/content/work.ts
  getCaseStudyBySlug(slug)   → 404 (notFound()) if absent or not published
  getAdjacentCaseStudy(current)
     → relatedCaseStudy if editor-set, else next by sortOrder/publishedAt
        │
        ▼
Payload Local API → Postgres
        │
        ▼
page.tsx renders directly (this page has no client-side filtering need,
so no props-to-client-component handoff of the same complexity as §3.1)
```

`generateStaticParams()` calls `lib/content/work.ts`'s `getAllCaseStudies()` (published only) to enumerate slugs at build time, replacing the hardcoded array map.

### 3.3 Write path — editorial publish

```text
Editor logs into Payload admin (real auth, §1.6)
        │
        ▼
Creates/edits a Case Study; Payload enforces required-to-publish
validation (§2.3) before allowing status=published
        │
        ▼
On save (afterChange hook) → Next.js revalidatePath('/work') and
revalidatePath('/work/[slug]', slug) → ISR cache invalidated
        │
        ▼
Next request to the affected route regenerates from fresh Payload data
```

This is the mechanism that makes ISR (§5.6) compatible with "editors see changes promptly" — without it, published changes would only appear on the next full deploy or ISR's time-based revalidation window, which is a worse editorial experience than what a network-latency-free Local API can actually offer.

---

## 4. Folder & Module Planning

```text
apps/concepful/
├── payload.config.ts                    # NEW — Payload root config (collections, plugins, db adapter)
├── payload-types.ts                     # NEW — Payload-generated types (internal use only;
│                                         #        never imported outside lib/content/)
├── app/
│   ├── (payload)/                       # NEW — Payload's required Next.js route group
│   │   └── admin/[[...segments]]/...    #        (exact structure dictated by Payload's Next.js
│   │                                    #         integration; admin UI + REST/GraphQL endpoints)
│   ├── (site)/
│   │   └── work/
│   │       ├── page.tsx                 # MODIFIED — reads lib/content/work.ts instead of data/
│   │       └── [slug]/page.tsx          # MODIFIED — same
│   └── admin/                           # DELETED in Phase 13 (Cleanup) — legacy hand-rolled admin
│       └── portfolio/                   #   superseded by Payload's own admin UI
├── components/features/work/
│   └── work-mosaic.tsx                  # MODIFIED — props-based, no direct data import
│                                        #   (all other files in this directory: UNCHANGED)
├── lib/
│   └── content/                         # NEW MODULE — the Data Access Layer (§1.7)
│       ├── work.ts                      #   getAllCaseStudies, getFeaturedCaseStudies,
│       │                                #   getCaseStudyBySlug, getAdjacentCaseStudy
│       ├── categories.ts                #   getCategories
│       └── types.ts                     #   Frontend-facing types, decoupled from
│                                        #   Payload's generated types
├── data/
│   ├── case-studies.ts                  # DELETED in Phase 13
│   └── work-data.ts                     # DELETED in Phase 13
└── scripts/
    └── migrate-case-studies.ts          # NEW, TEMPORARY — one-time seed script (Phase 8–9),
                                         #   deleted itself once migration is verified (Phase 13)
```

**Why `lib/content/` and not `lib/cms/`** (departing slightly from the architecture proposal's illustrative naming): "content" describes what the module owns (domain data); "cms" describes the tool that happens to back it today. If the CMS is ever swapped, `lib/content/` doesn't need renaming — only its internals change. This is a naming decision, not an architectural one, and doesn't require sign-off, but is documented here so it isn't second-guessed mid-implementation.

**Why `payload-types.ts` is explicitly called out as internal-only:** Payload generates types from the live collection config. Those types are an implementation detail of Content Platform (§1.4) and must never leak into `app/` or `components/` directly — every consumer goes through `lib/content/types.ts`'s hand-maintained, deliberately-decoupled types. This is what makes the Data Access Layer boundary (§1.7) real instead of aspirational.

---

## 5. Integration Strategy

- **Routing:** Payload's Next.js integration owns a dedicated route group (`app/(payload)/`) for its admin UI and REST/GraphQL endpoints. This is additive — it does not intercept or change any existing route. The public `/work` routes are unaffected at the routing layer; only their internal data source changes.
- **Rendering — Server/Client boundary:** Exactly one Server Component per route (`page.tsx`) is the only place `lib/content/*` is called. Every Client Component below it (`WorkMosaic`, `WorkFilters`, `WorkGrid`, `WorkHero`, `WorkFeatured`) receives data exclusively as props. This is a hard rule, not a preference — Payload's Local API cannot execute in the browser, so any violation of this rule is a runtime failure, not just a style deviation.
- **Media:** Payload's Media collection serves through its own file-serving mechanism (or directly from GCS via `next/image` with the configured `remotePatterns`). No change to how `@workspace/object-storage-web` serves the dashboard's uploads — that pipeline is untouched.
- **Authentication:** Payload's admin UI enforces its own login (§1.6). The public site remains unauthenticated, exactly as today. `ADMIN_TOKEN` continues to gate the legacy `/admin/portfolio` and `/admin/blog` routes until Phase 13 retires the portfolio ones specifically (`/admin/blog` is untouched — out of scope, §1.9).
- **Data access:** Enforced exclusively through `lib/content/*` (§1.7, §4). No Route Handler, no Client Component, and no other Server Component calls Payload's Local API directly.
- **Caching / ISR:** `/work` and `/work/[slug]` use Next.js ISR. Payload's `afterChange`/`afterDelete` hooks on the Case Study and Category collections call `revalidatePath` for the affected routes (§3.3). No additional caching layer (Redis, etc.) is introduced — consistent with architecture §12.
- **Deployment:** Payload runs in-process with `apps/concepful` (architecture §7.1's Option A) — no separate deployable artifact, no separate environment. Postgres connection is shared (same instance, isolated schema, §1.3).
- **Environment variables:** New variables required — a Payload secret (`PAYLOAD_SECRET`), the existing `DATABASE_URL` reused (pointed at the same instance, schema isolation handled in config, not via a second connection string), and GCS service-account credentials for Payload's media adapter (distinct from — not replacing — whatever the Replit-sidecar path uses for the dashboard's uploads). All new variables documented in the relevant phase's deliverables (§6, Phase 1 and Phase 5) and added to `.env.example` if one exists, or created if it doesn't.

---

## 6. Implementation Phases

Fourteen phases, numbered 0–13. Each is scoped to be one independently reviewable, independently mergeable pull request. Phases are listed in required implementation order; parallelization notes are called out where two phases have no dependency on each other.

Legend for **Estimated Complexity**: S (small — under a day for one engineer), M (medium — one to a few days), L (large — the better part of a week). Nothing in this plan is rated XL; that itself is a check on the "avoid giant migrations" requirement — if a phase ever looks XL, it should be split further before work starts.

---

### Phase 0 — Testing & Tooling Baseline

- **Workstream:** Tooling & Testing Baseline
- **Objective:** Establish a working automated-test harness before any migration logic is written, so every subsequent phase has somewhere to put verification beyond manual QA.
- **Rationale:** The repository has no test infrastructure today. The Data Access Layer (Phase 7) and the seed script (Phase 8) are pure logic with real correctness risk (silent data mismatches, broken slugs) and no UI to visually catch mistakes — they need automated tests, which need a runner to exist first.
- **Prerequisites:** None.
- **Estimated complexity:** S.
- **Implementation order:** First. Nothing else depends on it structurally, but every later phase's testing requirements assume it exists.
- **Deliverables:** Vitest configured for `apps/concepful` and `packages/db`; a root-level `pnpm test` script; one trivial smoke test in each package proving the harness actually runs and fails on a failing assertion (not just passes trivially).
- **Affected directories:** `apps/concepful/`, `packages/db/`, repo root.
- **Affected files:** Root `package.json` (new `test` script), `apps/concepful/package.json`, `packages/db/package.json`.
- **New files:** `apps/concepful/vitest.config.ts`, `packages/db/vitest.config.ts`, one smoke test file per package.
- **Deleted files:** None.
- **Public interfaces:** `pnpm test` (root), `pnpm --filter <pkg> test`.
- **Implementation notes:** Vitest chosen over Jest specifically for zero-config ESM/TypeScript compatibility with this stack (Next.js 15, TS 5.9) — avoids the Babel/transform configuration overhead Jest would need here.
- **Testing requirements:** Self-referential — the deliverable *is* the test infrastructure. Verify by intentionally breaking the smoke test and confirming `pnpm test` fails.
- **Manual QA checklist:** Run `pnpm test` locally and in whatever CI mechanism exists (or note explicitly if none exists yet — that's a separate, non-blocking gap, not this phase's responsibility to fix).
- **Regression risk / edge cases:** None — purely additive tooling.
- **Risks:** Negligible.
- **Rollback strategy:** Revert the commit; no other code depends on it yet.
- **Review checkpoint:** Confirm `pnpm test` runs cleanly from a fresh `pnpm install` on a clean checkout (not just the implementer's machine).
- **Production rollout considerations:** None — dev/CI-only change.
- **Definition of Done:** `pnpm test` exists, runs, and a deliberately-broken test fails it. Merged to main with no application behavior change.

---

### Phase 1 — Payload Installation & Compatibility Spike

- **Workstream:** Infrastructure
- **Objective:** Get Payload's Next.js-native integration installed and building inside `apps/concepful`, with zero collections, to retire the single largest unknown in this whole project early: whether Payload 3.x is compatible with this repository's specific setup (pnpm workspace, Next.js 15.3.x, the existing `patches/next@15.5.20.patch`).
- **Rationale:** Architecture §15 flags this explicitly as an unverified risk. Discovering an incompatibility after Content Platform, Media, and Auth work has already been built on top of it would be far more expensive than discovering it now, against an empty skeleton.
- **Prerequisites:** Phase 0.
- **Estimated complexity:** M — genuinely uncertain until attempted; budget for troubleshooting the `next` patch interaction specifically.
- **Implementation order:** Second.
- **Deliverables:** Payload installed as a dependency; `payload.config.ts` skeleton with database adapter pointed at the existing `DATABASE_URL` (schema isolation deferred to Phase 2 — this phase proves it *runs*, not that it's correctly isolated yet); Payload's required Next.js route group present; admin panel loads locally with zero collections and one manually created superuser.
- **Affected directories:** `apps/concepful/` root, `apps/concepful/app/`.
- **Affected files:** `apps/concepful/package.json` (new deps), `next.config.mjs` (any Payload-required config additions), root `.env`/`.env.local` (new `PAYLOAD_SECRET`).
- **New files:** `payload.config.ts`, `payload-types.ts` (auto-generated, gitignored or committed per Payload convention — decide during implementation based on Payload's own recommendation, not a domain decision), `app/(payload)/admin/[[...segments]]/page.tsx` and sibling files per Payload's Next.js integration scaffold.
- **Deleted files:** None.
- **Public interfaces:** Payload admin panel URL (e.g., `/admin`, path exact value confirmed against whatever `/admin` currently resolves to — **note the collision risk**: the legacy hand-rolled admin already lives at `/admin`; this phase must either mount Payload's admin at a distinct path, e.g. `/cms-admin` or `/payload-admin`, until Phase 13 retires the legacy one and the path can be reconsidered, or explicitly confirm no collision exists in Payload's default routing. This decision must be made and documented in this phase's PR description, not left implicit).
- **Implementation notes:** Do the `next@15.5.20.patch` compatibility check first, before writing any other code in this phase — if Payload requires an incompatible `next` version or behavior the patch alters, that changes this phase's shape significantly and should be discovered on day one, not day three.
- **Testing requirements:** Unit tests not meaningful for this phase (no logic yet). Integration check: a scripted or documented manual step confirming `pnpm build` succeeds with Payload installed, and the admin panel is reachable in a local dev server.
- **Manual QA checklist:** Local dev server starts without error; admin panel loads; superuser can log in; `pnpm build` (production build) succeeds; `pnpm typecheck` passes.
- **Regression risk / edge cases:** Risk that Payload's Next.js integration requires a `next` version or config incompatible with the existing patch — this is exactly what this phase exists to surface.
- **Risks:** Real, per Rationale above.
- **Rollback strategy:** Revert the installation commit entirely; no existing route or component depends on Payload yet, so rollback has zero blast radius on the live site.
- **Review checkpoint:** A second engineer confirms the admin panel loads on their own machine from a clean clone, not just the implementer's.
- **Production rollout considerations:** Deploying this phase to production is safe (Payload's admin isn't linked from anywhere public-facing yet) but should still go through the same deploy pipeline as any change, to catch build-environment-specific issues (not just local-dev-environment issues) before later phases build on top of it.
- **Definition of Done:** Payload admin panel is reachable in a deployed (not just local) environment, authenticated, with zero collections, and the `next`/patch compatibility question is answered and documented (either "compatible, no changes needed" or "compatible, here's what changed").

---

### Phase 2 — Postgres Schema Isolation

- **Workstream:** Database
- **Objective:** Configure Payload's database adapter to use a dedicated Postgres schema (namespace), and exclude that schema from Drizzle's migration tooling, so the two migration systems can never collide.
- **Rationale:** Architecture §8.2 and §15 both flag this as a required, non-optional boundary — not doing this is the specific failure mode where `drizzle-kit push` proposes migrations against Payload's own tables (or vice versa).
- **Prerequisites:** Phase 1.
- **Estimated complexity:** S.
- **Implementation order:** Third; blocks Phase 3.
- **Deliverables:** Payload's Postgres adapter configured with an explicit `schemaName` (e.g., `payload`); `packages/db`'s `drizzle-kit` configuration updated with a `schemaFilter` that excludes it; a documented, verified proof that each tool only sees its own tables.
- **Affected directories:** `apps/concepful/` (Payload config), `packages/db/` (Drizzle config).
- **Affected files:** `payload.config.ts` (schema name option), `packages/db/drizzle.config.ts` (schema filter).
- **New files:** None.
- **Deleted files:** None.
- **Public interfaces:** None new — this is internal configuration.
- **Implementation notes:** Verify by running `drizzle-kit generate` after Phase 2 lands (with still-zero Payload collections) and confirming it proposes no changes related to Payload's schema; repeat the equivalent check once Phase 3/4 add real collections, to catch any config drift.
- **Testing requirements:** No unit tests (configuration, not logic). Integration verification: documented manual command output (or a lightweight script) proving schema isolation, kept as part of this phase's PR evidence.
- **Manual QA checklist:** Inspect the Postgres instance directly (e.g., `\dn` in `psql`) and confirm two schemas exist post-Phase-3/4, with Payload's tables exclusively in its own namespace.
- **Regression risk / edge cases:** If this is skipped or misconfigured, the failure mode is silent until someone runs a Drizzle migration that touches Payload's tables — which is exactly why this phase is sequenced before any real collections exist (Phase 3), so the isolation is proven before there's anything to lose.
- **Risks:** Low technical risk, high consequence if skipped — treat review rigor accordingly.
- **Rollback strategy:** Revert config; since no collections exist yet at this point, rollback has no data implications.
- **Review checkpoint:** A second engineer independently verifies the schema separation against the running database, not just reads the config.
- **Production rollout considerations:** Must land before any production data enters Payload's tables (i.e., before Phase 9's seed execution) — this is a hard ordering constraint, not a preference.
- **Definition of Done:** `drizzle-kit generate` run against a database containing both schemas proposes zero changes to Payload's schema; documented proof attached to the PR.

---

### Phase 3 — Categories & Media Collections

- **Workstream:** Content Platform (+ touches Media)
- **Objective:** Implement the Category (§2.1) and Media (§2.2) collections in Payload — the two dependencies Case Study (Phase 4) needs before it can exist.
- **Rationale:** Sequenced before Case Study specifically because Case Study's relationships (`category`, `coverImage`) require these collections to already exist; building them together with Case Study would make that single phase too large (violates "avoid giant migrations").
- **Prerequisites:** Phase 2.
- **Estimated complexity:** M.
- **Deliverables:** Category and Media collections exist in Payload's admin panel, matching §2.1/§2.2's field specifications exactly (including required-field enforcement — `alt` text cannot be skipped, `slug`/`name` uniqueness enforced).
- **Affected directories:** `apps/concepful/` (Payload config only at this point — no application code yet).
- **Affected files:** `payload.config.ts` (collections array).
- **New files:** Collection definition files, organized per Payload's own convention (e.g., a `collections/` directory referenced from `payload.config.ts` — the exact file layout is an implementation detail, not a domain decision, and should follow whatever pattern Payload's own scaffolding/documentation recommends for a project this size).
- **Deleted files:** None.
- **Public interfaces:** None yet consumed by application code (Phase 7 is where that starts) — but this phase is where Payload's auto-generated REST/GraphQL/Local API surface for these two collections comes into existence.
- **Implementation notes:** No storage adapter wiring for Media yet (that's Phase 5) — this phase can use Payload's default local-disk upload handling for Media temporarily, or defer testing file upload entirely until Phase 5, whichever is cleaner given Payload's specific setup requirements. Either is acceptable; document which was chosen.
- **Testing requirements:** Manual verification through the admin UI is sufficient for this phase (no application logic yet to unit test) — create a Category and a Media asset (even without final storage) directly in the admin panel and confirm validation rules from §2.1/§2.2 are enforced (e.g., try to save a Media asset without `alt` text and confirm it's rejected).
- **Manual QA checklist:** Duplicate `slug`/`name` rejected; missing required fields rejected; a valid Category and Media asset can be created and appear correctly in the admin list views.
- **Regression risk / edge cases:** None to existing app — purely additive, not yet consumed anywhere.
- **Risks:** Low.
- **Rollback strategy:** Revert config; no application code depends on these collections yet.
- **Review checkpoint:** Reviewer checks the collection config against §2.1/§2.2 field-by-field, not just that "it works."
- **Production rollout considerations:** Safe to deploy — inert until consumed.
- **Definition of Done:** Both collections match their spec exactly (every required/optional field, every validation rule in §2.1/§2.2), verified through direct admin-panel testing.

---

### Phase 4 — Case Study Collection

- **Workstream:** Content Platform
- **Objective:** Implement the Case Study collection (§2.3) — the core content type — including its relationships to Category and Media, the `theme` enum, and the required-to-publish validation logic.
- **Rationale:** This is the single most important collection in the project and the one place the content/presentation boundary (the `theme` enum, never raw Tailwind/hex) must be enforced correctly at the schema level.
- **Prerequisites:** Phase 3.
- **Estimated complexity:** L — the most field- and validation-rule-dense phase in Content Platform.
- **Deliverables:** Case Study collection matching §2.3 exactly: all required/optional fields, `category`/`coverImage`/`relatedCaseStudy` relationships, `theme` as a closed enum (not free text), draft/published lifecycle with required-to-publish validation (§2.3's specific rule that `challenges`/`deliverables`/`tools`/`outcomeMetrics` must be non-empty to publish).
- **Affected directories:** `apps/concepful/` (Payload config).
- **Affected files:** `payload.config.ts` (collections array).
- **New files:** Case Study collection definition file(s), following the same layout convention established in Phase 3.
- **Deleted files:** None.
- **Public interfaces:** Payload's generated Local/REST/GraphQL API surface for Case Studies now exists (not yet consumed by application code — Phase 7).
- **Implementation notes:** The `theme` enum's exact value set (Blue/Emerald/Purple/Amber/Violet, or a revised set) should be finalized by cross-checking every existing case study's current `gradient` value in `data/case-studies.ts` against a proposed palette, so Phase 8's manual mapping has a real target to map onto — do this cross-check as part of this phase, not deferred to Phase 8, since it affects the enum definition itself.
- **Testing requirements:** Manual admin-panel verification of every validation rule in §2.3 (attempt to publish with each required-to-publish field missing, one at a time, and confirm rejection; confirm draft save succeeds with fields incomplete).
- **Manual QA checklist:** Create a fully valid Case Study through the admin UI, relate it to a Category and a Media asset, set a `theme`, and publish successfully; attempt every "required to publish" violation individually and confirm each is caught.
- **Regression risk / edge cases:** The empty-array validation rule (`challenges`/`deliverables`/`tools`/`outcomeMetrics` must be non-empty) is the one most likely to be under-implemented (easy to forget an array-length check where a simple "field present" check would technically pass with `[]`) — call this out specifically in review.
- **Risks:** Getting the `theme` enum wrong (too narrow or mapped incorrectly) is expensive to fix once real content is seeded on top of it (Phase 8/9) — worth the extra diligence in Implementation Notes above.
- **Rollback strategy:** Revert config; no application code or seeded data depends on it yet.
- **Review checkpoint:** Reviewer independently attempts to publish an intentionally-incomplete Case Study through the admin UI and confirms it's rejected — not just a code read-through.
- **Production rollout considerations:** Safe to deploy — inert until consumed by Phase 8's seeding.
- **Definition of Done:** Every field, relationship, and validation rule in §2.3 is implemented and independently verified against the live admin UI, including the required-to-publish array-non-empty rules.

---

### Phase 5 — Media Storage Adapter (GCS, Portable Credentials)

- **Workstream:** Media
- **Objective:** Wire Payload's Media collection to a real GCS storage adapter using a portable service-account credential, and add `next/image` remote-pattern configuration — resolving both the storage-backend gap left open in Phase 3 and the Replit-sidecar portability risk flagged in the architecture proposal.
- **Rationale:** Architecture §9 and §15 both call out that Payload's media path should not silently inherit the dashboard's Replit-sidecar-coupled credential flow.
- **Prerequisites:** Phase 3 (Media collection must exist).
- **Estimated complexity:** M.
- **Deliverables:** Uploading an image through Payload's admin panel stores it in GCS via a standard service-account credential (not the Replit sidecar); the image renders correctly through `next/image` on a scratch/verification page; `next.config.mjs` has the correct `remotePatterns` entry for the bucket domain.
- **Affected directories:** `apps/concepful/`.
- **Affected files:** `payload.config.ts` (storage adapter plugin config), `next.config.mjs` (`images.remotePatterns`), environment variable files.
- **New files:** GCS service-account credential handling (exact form — env var vs. mounted file — is an implementation detail to resolve against however the deployment environment expects secrets; not a domain decision).
- **Deleted files:** None.
- **Public interfaces:** None new to the application — Media assets already had a public interface as of Phase 3 (relationship-based reference); this phase makes the underlying file actually resolve to a real, portable URL.
- **Implementation notes:** Explicitly do **not** reuse `lib/objectStorage.ts` or `@workspace/object-storage-web`'s Replit-sidecar credential path — this is the specific thing being avoided, not a resource to share for convenience.
- **Testing requirements:** No unit tests meaningful here (adapter configuration, not application logic). Manual verification is the appropriate check.
- **Manual QA checklist:** Upload an image through Payload admin; confirm it appears in the GCS bucket; confirm it renders via `next/image` on a test page with no console errors about unconfigured remote image domains; confirm the credential path used does not reference the Replit sidecar endpoint.
- **Regression risk / edge cases:** If credentials are misconfigured, failure is loud (uploads simply fail) rather than silent — lower risk than it might appear, but still worth explicit verification in a deployed (not just local) environment, since credential availability often differs between the two.
- **Risks:** Environment-specific credential availability differing between local/staging/production — verify in all environments this project actually deploys to, not just locally.
- **Rollback strategy:** Revert config; no production content depends on this path yet (seeding hasn't happened).
- **Review checkpoint:** Reviewer confirms, by inspecting the bucket directly (not just trusting the UI), that an uploaded test file is actually present in GCS.
- **Production rollout considerations:** Confirm the service-account credential and bucket exist and are provisioned in every target deployment environment before this phase is considered done — this is infrastructure provisioning, not just code, and shouldn't be assumed to already exist.
- **Definition of Done:** An image uploaded through Payload's admin panel is verifiably in GCS, renders via `next/image`, and no part of the path depends on the Replit sidecar.

---

### Phase 6 — Payload Authentication & Roles

- **Workstream:** Authentication
- **Objective:** Configure real, role-differentiated authentication for Payload's admin panel — editor and admin roles with meaningfully different permissions — establishing this as the real access-control system for content management.
- **Rationale:** Architecture §13's core recommendation; this is what eventually lets Phase 13 retire `ADMIN_TOKEN` for content routes.
- **Prerequisites:** Phase 1 (Payload installed). Can technically run in parallel with Phases 2–5 (no shared file overlap), but is sequenced here for narrative clarity; team may parallelize if capacity allows.
- **Estimated complexity:** S–M.
- **Deliverables:** A Payload auth-enabled `Users` collection (distinct from the dashboard's client users — no shared identity system, matching architecture §13's explicit scoping) with at least two roles (editor, admin) where editors can create/edit/publish content but cannot manage other users or delete collections, and admins can do both.
- **Affected directories:** `apps/concepful/`.
- **Affected files:** `payload.config.ts` (auth config, access-control functions per collection).
- **New files:** `Users` collection definition (or Payload's built-in auth collection, configured), access-control logic files per Payload's own convention.
- **Deleted files:** None.
- **Public interfaces:** Payload's login flow at its admin route.
- **Implementation notes:** Explicitly confirm this does **not** touch `hooks/use-auth-state.ts` or anything in `app/(dashboard)` — those are a different, out-of-scope identity system per architecture §13 and §1.6 above. Do not attempt to unify them.
- **Testing requirements:** Manual verification of role boundaries — no automated test framework exists yet that meaningfully covers Payload's own access-control internals at this project's current test-maturity level; treat this as a QA-checklist-driven phase.
- **Manual QA checklist:** Create one editor-role and one admin-role user; confirm the editor can create/edit/publish a Case Study but cannot access user management or delete the Category/Media/Case Study collections themselves; confirm the admin can do both.
- **Regression risk / edge cases:** Misconfigured access control that's *too permissive* is the dangerous failure mode (silent) versus too restrictive (loud, immediately reported) — weight review accordingly toward checking for over-permissive defaults.
- **Risks:** Low technical complexity, meaningful consequence if role boundaries are wrong — review rigor should match the security section of the architecture proposal, not the phase's small size.
- **Rollback strategy:** Revert config; no production users exist yet at this point in the sequence.
- **Review checkpoint:** A second engineer, logged in as the test editor account, explicitly attempts (and confirms failure of) an admin-only action.
- **Production rollout considerations:** First real Payload user (bootstrap superuser) must be created through a secure, documented process before this goes live — not left as a default/shared credential.
- **Definition of Done:** Editor and admin roles exist with verified, distinct permission boundaries; bootstrap process for the first real user is documented.

---

### Phase 7 — Content Data Access Layer (`lib/content/`)

- **Workstream:** Data Access Layer
- **Objective:** Build the `lib/content/` module (§1.7, §4) — the enforced, sole boundary through which any Server Component reads Case Study/Category data — with full unit test coverage, independent of any page consuming it yet.
- **Rationale:** This is the direct implementation of architecture §11's rule. Building and testing it in isolation, before touching any existing page (Phase 11–12), separates "does the data layer work" from "does the frontend render it correctly," which is the same isolation principle the architecture proposal used to de-risk Phase 3 in the original roadmap.
- **Prerequisites:** Phase 4 (Case Study collection must fully exist), Phase 0 (test harness).
- **Estimated complexity:** M.
- **Deliverables:** `lib/content/work.ts` (`getAllCaseStudies`, `getFeaturedCaseStudies`, `getCaseStudyBySlug`, `getAdjacentCaseStudy`), `lib/content/categories.ts` (`getCategories`), `lib/content/types.ts` (frontend-facing types, decoupled from `payload-types.ts`) — every function unit-tested against a seeded local/test Payload instance.
- **Affected directories:** `apps/concepful/lib/`.
- **Affected files:** None existing — purely additive.
- **New files:** `lib/content/work.ts`, `lib/content/categories.ts`, `lib/content/types.ts`, corresponding `*.test.ts` files.
- **Deleted files:** None.
- **Public interfaces:** The function signatures listed above — this is the actual contract the rest of the project (Phase 11, 12) is written against. Any signature change after this phase lands should be treated as a breaking change to a public interface, not a casual edit.
- **Implementation notes:** `getFeaturedCaseStudies()` must replicate the exact current behavior (`featured: true`, sliced to top 3) unless a product decision changes it — this phase is not the place to silently change that logic. `getAdjacentCaseStudy()` implements the fallback logic from §2.3/§3.2: editor-set `relatedCaseStudy` first, else ordering by `sortOrder`/`publishedAt`.
- **Testing requirements:** Unit tests for every exported function, run against a real (seeded, test-scoped) Payload instance — not mocked, since the value being tested is largely "does this correctly translate Payload's query results," which a mock would trivially pass without proving anything. At minimum: correct filtering by `status: published` (unpublished content must never be returned), correct `featured`/slice behavior, correct slug lookup including the not-found case, correct adjacency fallback logic (both with and without `relatedCaseStudy` set).
- **Manual QA checklist:** Not primary for this phase (it's the automated-test-driven phase) — but spot-check one function's output against the admin panel's raw data manually, as a sanity check on the automated tests themselves.
- **Regression risk / edge cases:** Draft content leaking into `getAllCaseStudies()`/`getFeaturedCaseStudies()` is the single most important edge case to test explicitly — this is the exact mechanism that would let unpublished/incomplete content reach the public site, which is precisely what the required-to-publish validation in Phase 4 exists to prevent upstream of this layer.
- **Risks:** A subtly wrong `status` filter is the highest-consequence bug this phase could ship — treat its test as non-optional, not just "nice to have."
- **Rollback strategy:** Revert the module; nothing consumes it yet (Phase 11/12 haven't landed).
- **Review checkpoint:** Reviewer specifically checks that a draft Case Study, created in the seeded test instance, is provably absent from every read function's output.
- **Production rollout considerations:** Safe to deploy — unused by any route until Phase 11.
- **Definition of Done:** All five functions exist, are exported with the signatures that Phase 11/12 will consume, and have passing unit tests covering published/draft filtering, featured/slice behavior, slug lookup (found and not-found), and adjacency fallback logic.

---

### Phase 8 — Content Audit & Migration Script

- **Workstream:** Content Migration & Cleanup
- **Objective:** Audit `portfolioItemsTable` for any real (non-test) data, and write a one-time script that seeds Payload's Case Study collection from the nine entries in `data/case-studies.ts`, including the manual mapping from each entry's free-form `gradient` string to the closed `theme` enum defined in Phase 4.
- **Rationale:** Architecture §3.3(a)/§7.2 — `portfolioItemsTable` must be checked before anything is discarded, not assumed empty. The `theme` mapping is inherently manual (a design judgment call per case study), not automatable, and should be done deliberately and documented, not rushed inside a later cutover phase.
- **Prerequisites:** Phase 4 (Case Study collection, including finalized `theme` enum from Phase 4's implementation notes), Phase 3 (Category, Media).
- **Estimated complexity:** M.
- **Deliverables:** A written audit finding (documented in the PR description, not just tribal knowledge) of whether `portfolioItemsTable` contains real production rows; `scripts/migrate-case-studies.ts`, a script that reads `data/case-studies.ts`, uploads each `image` URL's referenced asset into Payload's Media collection (§2.2), creates/reuses the matching Category (§2.1), maps `gradient` → `theme` per a documented mapping table, and creates each Case Study in Payload as a **draft** (not auto-published — publishing is a deliberate, separate action in Phase 9, so a bad seed doesn't go live silently).
- **Affected directories:** `apps/concepful/scripts/`.
- **Affected files:** None existing.
- **New files:** `scripts/migrate-case-studies.ts`, and if `portfolioItemsTable` does contain real data, a corresponding one-time script/inclusion for those rows too (scope determined by the audit finding — cannot be fully specified until the audit itself runs).
- **Deleted files:** None (the script itself is deleted later, in Phase 13, once no longer needed — not in this phase).
- **Public interfaces:** None — this is a one-time operational script, not a reusable module.
- **Implementation notes:** The `gradient` → `theme` mapping table should be written out explicitly (e.g., as a comment or adjacent doc in the script) so it's reviewable as a discrete decision, separate from the script's mechanics. Run the script against a local/staging Payload instance first — never directly against production as the first execution.
- **Testing requirements:** The script itself is exercised, not unit-tested in the traditional sense (it's a migration script, not a long-lived module) — but the target being written to (`lib/content/work.ts`'s underlying collection) already has Phase 7's tests protecting the read side. Verify the script is idempotent or explicitly documented as not-safe-to-rerun, so accidental double-execution doesn't create duplicate content.
- **Manual QA checklist:** Run the script against a local Payload instance; manually compare all nine resulting draft Case Studies against the original `data/case-studies.ts` entries, field by field, including verifying each `theme` mapping is a reasonable visual match for the original `gradient`.
- **Regression risk / edge cases:** Unsplash image URLs may not remain fetchable indefinitely — if any are already broken by the time this phase runs, that's a real data-migration edge case to handle explicitly (fall back to a placeholder and flag for manual editor follow-up, rather than letting the script fail silently or crash entirely partway through).
- **Risks:** The `theme` mapping is subjective and worth a second reviewer's sign-off specifically, separate from a general code review.
- **Rollback strategy:** Since the script creates drafts only (never auto-published), rollback is simply deleting the created draft Case Studies from Payload — no public-facing impact regardless of when this is run.
- **Review checkpoint:** A second person (ideally whoever owns visual/design judgment, not just an engineer) reviews the `theme` mapping table specifically before this is merged.
- **Production rollout considerations:** This phase produces the script; running it against production is Phase 9's job, not this phase's — keep the two separate so "the script exists and is correct" and "the script has been run for real" are independently reviewable facts.
- **Definition of Done:** Script exists, has been run successfully against a local/staging instance producing nine correct draft Case Studies, the `portfolioItemsTable` audit finding is documented, and the `theme` mapping has a second sign-off.

---

### Phase 9 — Seed Execution & Content Verification

- **Workstream:** Content Migration & Cleanup
- **Objective:** Run Phase 8's script against the real target (staging, then production) Payload instance, and formally verify — and publish — the resulting content.
- **Rationale:** Separated from Phase 8 deliberately: writing and validating the migration logic is a different risk profile than executing it against real, persistent infrastructure.
- **Prerequisites:** Phase 8, fully reviewed and merged.
- **Estimated complexity:** S (the work is mostly verification, not new logic).
- **Deliverables:** All nine Case Studies exist in the production Payload instance, in draft state initially, then explicitly published one-by-one (or as a batch) only after field-by-field verification against the original hardcoded data.
- **Affected directories:** None (data-only change, no code).
- **Affected files:** None.
- **New files:** None.
- **Deleted files:** None.
- **Public interfaces:** None new.
- **Implementation notes:** Publish only after Phase 11/12 (frontend cutover) are ready to consume this data — publishing early with the old hardcoded frontend still live has no effect (the old pages don't read Payload yet), so there's no strict ordering requirement forcing this before Phase 11/12, but doing so allows Phase 11/12's QA to test against real seeded content rather than manually-created scratch content.
- **Testing requirements:** N/A (data operation, not code) — verification is manual/checklist-driven.
- **Manual QA checklist:** For each of the nine Case Studies: title, client, teaser, brief, challenges, deliverables, outcome, outcomeMetrics, tools, category, and theme all match the original `data/case-studies.ts` entry exactly; cover image renders correctly; slug matches exactly (critical — a slug mismatch here breaks existing inbound links once cutover happens).
- **Regression risk / edge cases:** Slug mismatch is the highest-consequence possible error in this phase — treat as a required, explicit check per item, not an assumption.
- **Risks:** Executing against production data — take a database backup/snapshot immediately before running, as standard practice for any first production write of a new pipeline.
- **Rollback strategy:** Delete the created records if verification fails; since they're not yet consumed by any live page (Phase 11/12 haven't cut over), there is zero public-facing risk regardless of outcome at this stage.
- **Review checkpoint:** A second person independently re-verifies at least the slug field for all nine entries (the one field where an error has outsized consequences) before anything is published.
- **Production rollout considerations:** Take a database backup before running against production; run against staging first if a staging environment exists.
- **Definition of Done:** Nine Case Studies exist in production Payload, published, field-verified against the original data, with special confirmation on slug accuracy.

---

### Phase 10 — WorkMosaic Data-Fetching Refactor (Isolated)

- **Workstream:** Frontend Integration
- **Objective:** Convert `WorkMosaic` from a client component that directly imports and calls `getAllCaseStudies()`/`getCategoryFilters()` (from the *old* `data/work-data.ts`) into a component that receives that same data as props — **without changing its data source yet**. This phase is deliberately scoped to be a pure refactor against the still-hardcoded data, isolated from the content-source change in Phase 11.
- **Rationale:** Architecture §15/§17.3 explicitly calls for this to be its own reviewable diff, separable from content-source changes, precisely so a regression in the filter UI/interaction is trivially distinguishable from a regression in data correctness. Doing this against the old data source first means the *only* variable in this PR is the props refactor — reviewers can compare before/after behavior with zero other confounds.
- **Prerequisites:** None from other new-system phases — this touches only existing code and can, in principle, be done any time. Sequenced here so it lands shortly before Phase 11 needs it, minimizing the time a partially-refactored state sits unused.
- **Estimated complexity:** S–M.
- **Deliverables:** `app/(site)/work/page.tsx` fetches the full case study list and category list once (still from `data/work-data.ts` at this point) and passes both to `WorkMosaic` as props; `WorkMosaic` no longer imports `getAllCaseStudies`/`getCategoryFilters` directly; `activeFilter` remains its only internal state; visual/interaction behavior is unchanged.
- **Affected directories:** `apps/concepful/app/(site)/work/`, `apps/concepful/components/features/work/`.
- **Affected files:** `app/(site)/work/page.tsx`, `components/features/work/work-mosaic.tsx`.
- **New files:** None.
- **Deleted files:** None.
- **Public interfaces:** `WorkMosaic`'s prop signature changes (now accepts `caseStudies` and `categories` props) — this is an internal component interface, not a public API, but should be treated as a real interface change for review purposes (check every call site, of which there's currently exactly one).
- **Implementation notes:** `WorkFilters` and `WorkGrid` (the components `WorkMosaic` composes) should need **no changes** — they already receive data as props from `WorkMosaic` today; only `WorkMosaic`'s own data-sourcing changes.
- **Testing requirements:** No new automated tests strictly required (no new logic, pure refactor) — but if Phase 0's harness is in place, a lightweight render test confirming `WorkMosaic` renders correctly given props is reasonable and cheap to add here.
- **Manual QA checklist:** Every category filter still works identically to pre-refactor behavior; filtered count display (if present in `WorkFilters`) still updates correctly; no visual or animation regression anywhere in `/work`.
- **Regression risk / edge cases:** This is exactly the kind of change that can pass a superficial glance (renders fine) while subtly breaking filter-count logic or an edge case like "zero results for a filter" — test that specific case manually.
- **Risks:** Low technical risk; the entire point of isolating this phase is to make any risk that does surface easy to attribute correctly.
- **Rollback strategy:** Revert the two-file diff; trivial, since it's a pure refactor with no data/content implications.
- **Review checkpoint:** Reviewer diffs `WorkMosaic` specifically for behavioral equivalence, not just "compiles and looks right" — ideally by testing filter interactions locally before and after.
- **Production rollout considerations:** Safe, low-risk deploy — no content or data-source change, purely internal refactor.
- **Definition of Done:** `WorkMosaic` receives its data as props, contains no direct data-layer imports, and every filter interaction is behaviorally identical to pre-refactor, verified manually.

---

### Phase 11 — Work Listing Page Cutover

- **Workstream:** Frontend Integration
- **Objective:** Switch `app/(site)/work/page.tsx` from `data/work-data.ts` to `lib/content/work.ts` and `lib/content/categories.ts` — the actual content-source cutover for the listing page, now landing on top of Phase 10's already-isolated props refactor.
- **Rationale:** With Phase 10 already merged, this phase's diff is now purely "which module supplies the data," with no simultaneous props-shape change — exactly the isolation the architecture proposal called for.
- **Prerequisites:** Phase 7 (Data Access Layer), Phase 9 (seeded, published content to test against), Phase 10 (isolated props refactor already landed), Phase 5 (Media/`next/image` working, since real images now render).
- **Estimated complexity:** M.
- **Deliverables:** `/work` renders from Payload via `lib/content/work.ts`/`categories.ts`, visually and behaviorally identical to its pre-migration state, using real seeded content from Phase 9.
- **Affected directories:** `apps/concepful/app/(site)/work/`.
- **Affected files:** `app/(site)/work/page.tsx`.
- **New files:** None.
- **Deleted files:** None yet (`data/work-data.ts`/`case-studies.ts` still exist, unused by this route after this phase, fully removed in Phase 13).
- **Public interfaces:** None new.
- **Implementation notes:** `<img>` tags in `work-hero.tsx`/`work-featured.tsx`/`work-grid.tsx` should be migrated to `next/image` as part of this phase (per architecture §9/§10 — "the natural moment to fix it, since it's the same media pipeline change") — scoped here rather than as a separate phase, since it only becomes meaningful once real Payload-sourced, GCS-backed images are flowing through these components.
- **Testing requirements:** No new automated tests required beyond what Phase 7 already covers on the data side; this phase is UI-cutover verification.
- **Manual QA checklist:** Visual comparison against pre-migration `/work` (ideally a side-by-side screenshot diff); every filter still works; featured section shows the correct (up to 3) featured case studies; all images render via `next/image` with no console warnings about unconfigured domains; page load performance is not visibly regressed.
- **Regression risk / edge cases:** If Phase 9's seeded `featured` flags don't exactly match the original data's `featured` values, the homepage-adjacent featured section would silently show the wrong set — explicitly re-verify `featured` flags here, not just at Phase 9's generic field-verification step.
- **Risks:** Visual regression in a well-polished, previously-reviewed UI is the main risk category — mitigate via the side-by-side comparison in QA above.
- **Rollback strategy:** Revert `page.tsx`'s import back to `data/work-data.ts` — trivial single-file revert, since Phase 10 already isolated the props shape from the data source.
- **Review checkpoint:** Reviewer does a live side-by-side of the deployed-preview `/work` against production `/work` before approving.
- **Production rollout considerations:** Deploy behind a preview/staging URL first if available; verify against real seeded content, not scratch test content, before promoting.
- **Definition of Done:** `/work` is fully Payload-backed, visually and functionally equivalent to its pre-migration state, verified via side-by-side comparison, with `next/image` in place for all Work images.

---

### Phase 12 — Case Study Detail Page Cutover

- **Workstream:** Frontend Integration
- **Objective:** Switch `app/(site)/work/[slug]/page.tsx` from the hardcoded `CASE_STUDIES` array to `lib/content/work.ts`, including replacing array-index "next project" logic with `getAdjacentCaseStudy()`, and wiring on-publish revalidation (§3.3).
- **Rationale:** The higher-complexity half of frontend cutover — this page has `generateStaticParams()`, `generateMetadata()`, and the adjacency logic the architecture proposal specifically flagged as needing real replacement, not a mechanical swap.
- **Prerequisites:** Phase 11 (establishes the cutover pattern and proves `lib/content/work.ts` works end-to-end against real content), Phase 9.
- **Estimated complexity:** M–L.
- **Deliverables:** `/work/[slug]` fully Payload-backed; `generateStaticParams()` enumerates published slugs from Payload; `generateMetadata()` derives from Payload data; "next project" uses `getAdjacentCaseStudy()`'s relationship/ordering-based logic instead of array-index math; `afterChange`/`afterDelete` hooks on the Case Study collection call `revalidatePath` for both `/work` and the affected `/work/[slug]`.
- **Affected directories:** `apps/concepful/app/(site)/work/[slug]/`, Payload collection config (for the revalidation hooks).
- **Affected files:** `app/(site)/work/[slug]/page.tsx`, Case Study collection config (adding hooks).
- **New files:** None.
- **Deleted files:** None yet.
- **Public interfaces:** None new to the frontend; the revalidation hook is a new integration point between Payload and Next.js's cache.
- **Implementation notes:** Test the revalidation hook explicitly — publish a change to a seeded Case Study in the deployed environment and confirm `/work/[slug]` reflects it within the expected short window, not just on a redeploy.
- **Testing requirements:** No new unit tests beyond Phase 7's existing coverage of `getAdjacentCaseStudy()` — this phase's own verification is integration/manual.
- **Manual QA checklist:** Every case study's detail page renders identically to pre-migration; "next project" link is correct for every case study, including the one that previously wrapped around via modulo (the last item in the array) — this specific edge case deserves explicit manual verification since it's the one place old and new logic could diverge silently; metadata (`title`/`description`) is correct per case study; publishing a live edit in Payload updates the page within the expected revalidation window.
- **Regression risk / edge cases:** The "last case study wraps to the first" behavior from the old modulo-based logic may or may not be desired going forward now that adjacency is ordering/relationship-based — this is a real product decision, not purely technical, and should be explicitly confirmed (does "next project" on the last item wrap to the first, or is there no "next" at all?) before this phase is considered done, not discovered by a user after launch.
- **Risks:** The adjacency-logic edge case above is the primary risk; the revalidation hook not firing correctly (silent staleness) is the second.
- **Rollback strategy:** Revert `page.tsx` to the hardcoded array; revert the collection hook addition — both cleanly separable single-purpose diffs.
- **Review checkpoint:** Reviewer explicitly tests the last-item "next project" behavior and the revalidation hook against a real publish, not just a code read.
- **Production rollout considerations:** Same staged-preview-then-promote approach as Phase 11.
- **Definition of Done:** `/work/[slug]` fully Payload-backed and equivalent to pre-migration behavior for every existing case study; the wrap-around adjacency question explicitly decided and implemented (not left ambiguous); revalidation verified against a real publish action.

---

### Phase 13 — Cleanup: Retire Legacy Data, Shadow CMS, and Content-Path `ADMIN_TOKEN`

- **Workstream:** Content Migration & Cleanup
- **Objective:** Delete everything the new system supersedes: `data/case-studies.ts`, `data/work-data.ts`, `app/admin/portfolio/*`, `app/api/admin/portfolio/*`, `scripts/migrate-case-studies.ts`, and retire `ADMIN_TOKEN`'s role for content-management routes specifically (leaving it in place for `/admin/blog`, which is untouched and out of scope).
- **Rationale:** Architecture §7.2/§17.2 — this is the phase that actually prevents the fragmentation problem (four disconnected "work" systems) from simply becoming three. Sequenced last, deliberately, and only after Phase 11/12 have been live in production for a soak period, so nothing is deleted before its replacement is proven.
- **Prerequisites:** Phase 11 and Phase 12, both live in production for a reasonable soak period (a deliberate waiting period, not an immediate follow-on merge — e.g., through at least one full editorial publish cycle, so the revalidation hook and the full end-to-end flow are exercised for real, not just in QA).
- **Estimated complexity:** S–M (mechanically simple; risk is in verifying nothing is missed, not in the deletion itself).
- **Deliverables:** No references anywhere in the codebase to the deleted files, the `portfolioItemsTable`-backed admin routes, or the migration script; `ADMIN_TOKEN` no longer gates any content route (only whatever remains, e.g., `/admin/blog`, if it still uses it); `/admin/portfolio` returns 404.
- **Affected directories:** `apps/concepful/data/`, `apps/concepful/app/admin/portfolio/`, `apps/concepful/app/api/admin/portfolio/`, `apps/concepful/scripts/`.
- **Affected files:** `components/features/admin/admin-layout.tsx` (remove the "Portfolio" nav entry, since its target route no longer exists).
- **New files:** None.
- **Deleted files:** `data/case-studies.ts`, `data/work-data.ts`, `app/admin/portfolio/page.tsx`, `app/api/admin/portfolio/route.ts`, `app/api/admin/portfolio/[id]/route.ts`, `scripts/migrate-case-studies.ts`. (Note: `portfolioItemsTable` itself, in `packages/db/src/schema/index.ts`, is a database-schema change and should be handled as its own small, explicitly-reviewed Drizzle migration within this phase — dropping a table is irreversible in a way deleting application files is not, and deserves its own explicit review attention even though it's part of the same phase.)
- **Public interfaces:** `/admin/portfolio` route ceases to exist (404); `/api/admin/portfolio/*` ceases to exist.
- **Implementation notes:** Before dropping `portfolioItemsTable`, re-confirm Phase 8's audit finding (was there ever real data in it?) one more time — if the answer changed between Phase 8 and now for any reason, that must be resolved before the drop, not assumed still accurate.
- **Testing requirements:** A repository-wide search (`grep`/equivalent) for any remaining reference to the deleted files/table/routes, run as an explicit, documented step — treat a clean search result as part of the actual test evidence for this phase, not just a courtesy check.
- **Manual QA checklist:** `/admin/portfolio` returns 404; `/admin` nav no longer shows a "Portfolio" link; `/work` and `/work/[slug]` are unaffected (they've depended on `lib/content/*` since Phase 11/12, not on anything being deleted here); `pnpm build` and `pnpm typecheck` both pass with the files removed (confirms nothing else was silently still importing them).
- **Regression risk / edge cases:** The main risk is an overlooked import of `data/case-studies.ts` or `work-data.ts` from somewhere outside the Work section itself (e.g., a stray reference from another page) — the repo-wide search above is specifically meant to catch this.
- **Risks:** Dropping `portfolioItemsTable` is irreversible without a database restore — treat with backup-first discipline, same as any production schema change.
- **Rollback strategy:** File deletions are trivially revertible via version control. The `portfolioItemsTable` drop is the one non-trivial rollback in this entire project — requires a database backup taken immediately before this phase's migration runs, retained until the team is confident the drop was correct.
- **Review checkpoint:** Reviewer independently runs the repository-wide reference search, not just trusts the PR description; reviewer explicitly confirms a recent backup exists before approving the table-drop migration.
- **Production rollout considerations:** Take a full database backup immediately before applying the `portfolioItemsTable` drop migration in production. Deploy application-file deletions and the schema-drop migration as clearly separable steps within this phase (even if in the same PR), so a problem with one doesn't block rolling back the other independently.
- **Definition of Done:** All listed files are deleted; `portfolioItemsTable` is dropped (with a documented pre-drop backup); `ADMIN_TOKEN` no longer gates any content-management route; a repository-wide search confirms zero remaining references; `pnpm build`/`pnpm typecheck` pass.

---

## 7. Cross-Cutting Testing Strategy

Referenced by every phase above; stated once here to avoid repetition.

- **Unit testing:** Applies primarily to Phase 7 (Data Access Layer) and, optionally, Phase 10 (component render test). This is where automated tests carry the most weight in this project, because it's pure logic with no visual signal to catch mistakes otherwise.
- **Integration testing:** Applies to Phases 1–6, 8, 12 — verified through direct interaction with the running Payload admin panel and (Phase 12) the revalidation hook against a real publish action, rather than a formal integration-test framework (not justified at this project's current scale/maturity — see Phase 0's explicit scoping decision to exclude E2E/Playwright).
- **Manual QA:** The primary verification method for Phases 9, 11, 12, and 13 — each has an explicit checklist above. This is a deliberate choice, not a gap: at this project's size, a well-specified manual QA checklist executed rigorously is more cost-effective than building out browser-automation infrastructure this codebase has never had.
- **Regression testing:** Every frontend-facing phase (10, 11, 12) is explicitly checked for visual/behavioral equivalence against its pre-migration state — this is the operating principle that makes "the site looks and behaves identically, just Payload-backed" verifiable rather than assumed.
- **Edge cases requiring explicit sign-off** (called out individually above, collected here for visibility): draft content never appearing in public reads (Phase 7); empty-array required-to-publish fields (Phase 4); slug accuracy during seeding (Phase 9); the "last item wraps to first" adjacency behavior (Phase 12, a product decision, not just a technical one); stray references to deleted files (Phase 13).

---

## 8. Required for Initial Migration vs. Future Work

### 8.1 Required for this migration (covered by Phases 0–13 above)

- Categories, Media, Case Study collections and their full field/validation specification (§2).
- Postgres schema isolation between Payload and Drizzle.
- A portable (non-Replit-sidecar) GCS credential path for Payload's Media collection specifically.
- Real Payload authentication with editor/admin roles for content management.
- The `lib/content/` data access layer, fully unit-tested.
- `/work` and `/work/[slug]` fully cut over, with `next/image` adopted for Work images.
- ISR + on-publish revalidation.
- Retirement of `data/case-studies.ts`, `data/work-data.ts`, `portfolioItemsTable`, `/admin/portfolio`, and `ADMIN_TOKEN`'s role in content management specifically.

### 8.2 Explicitly future work (not in this plan, not to be pulled in mid-implementation)

- **Blog migration onto the same Payload platform** (`blogPostsTable`, `/admin/blog`). The content model in §2 was deliberately designed so this is a natural follow-on, but it is not part of this implementation and `/admin/blog` is untouched by every phase above.
- **Dashboard/client session security remediation** (`hooks/use-auth-state.ts`'s `localStorage`-based, client-trusted session model; the unauthenticated `companyId` query parameter in `/api/work`). Flagged as a real, separate problem in the architecture proposal and again here — explicitly not addressed by Phase 6's Payload auth work, which is scoped to content management only.
- **Rich-text/blocks body content** for Case Studies, if editorial needs ever outgrow the current structured-fields model (§2.3 already notes the structured-fields choice is deliberate for the *current* content shape, not a permanent constraint).
- **Server-side/URL-driven category filtering** for `/work`, as a replacement for `WorkMosaic`'s client-side filtering-over-already-fetched-data approach — only justified if content volume grows well past current/foreseeable scale (§6 of the architecture proposal already names this threshold explicitly).
- **A secondary taxonomy** (services/industry) beyond the single `category` relationship, if one relationship per Case Study proves insufficient.
- **Automated browser/E2E testing** (Playwright or equivalent) — deliberately excluded from Phase 0's scope; revisit if manual QA checklists stop scaling with the team or the release cadence.

---

## 9. Project-Level Definition of Done

The overall implementation (all fourteen phases) is complete when:

1. `/work` and `/work/[slug]` are fully served from Payload, verified equivalent to their pre-migration behavior and visual design.
2. Every existing case study exists in Payload with field-accurate content, correct `theme` mapping, and correct slugs.
3. No client component anywhere in the Work section calls a data-fetching function directly — every content read goes through `lib/content/*`, called from exactly one Server Component per route.
4. Payload's Postgres tables are provably isolated from Drizzle's, with both migration tools respecting the boundary.
5. Payload's Media collection uses a portable GCS credential, independent of the Replit sidecar.
6. Payload's admin panel is protected by real, role-differentiated authentication.
7. `data/case-studies.ts`, `data/work-data.ts`, `portfolioItemsTable`, `/admin/portfolio`, and the migration script no longer exist in the codebase, with zero remaining references anywhere.
8. `ADMIN_TOKEN` no longer gates any content-management route.
9. Every phase's individual Definition of Done (§6) has been independently satisfied and reviewed — this project's completion is the conjunction of all fourteen, not a separate final check performed only at the end.
