# Concepful — Work Section Architecture Proposal
### Content Platform Redesign & Payload CMS Integration Strategy

**Document type:** Internal architecture proposal
**Prepared for:** Concepful engineering
**Status:** Draft for review — pre-implementation
**Scope:** Work section (`/work`, `/work/[slug]`) and its role in a unified content platform for the next 3–5 years

---

## 1. Executive Summary

The Work section is functionally complete but architecturally isolated: it is a well-designed frontend sitting on top of a single hardcoded TypeScript array. That much matches the existing audit. What the repository review surfaced beyond the audit is more important than the array itself:

- **This is not a greenfield CMS integration.** The repository already contains a second, disconnected content system for portfolio work — a Drizzle-backed `portfolioItemsTable` with a full hand-built CRUD admin at `/admin/portfolio` — that nothing on the public site reads from. A third, adjacent system (`completedWorkTable` + `/dashboard`) tracks operational client work. A fourth (`blogPostsTable`) already implements the draft/publish/slug pattern the Work section lacks. Four systems, one concern — "work our agency has done, in some form" — with no shared model.
- **Authentication across the admin/dashboard surface is not production-grade.** The `/admin` panel has no login screen; access control is a single shared bearer token checked only in `NODE_ENV=production`, and is bypassed entirely otherwise. The client dashboard's session, including the `isAdmin` flag, is stored and trusted client-side in `localStorage` with no server verification. This matters directly to this project because Payload will introduce the first real authentication system in the codebase, and the temptation will be to bolt it onto Work content only. That would be a mistake — it's the highest-leverage fix available and should be scoped in explicitly.
- **A client component currently owns data fetching for the filterable grid** (`WorkMosaic`), calling the hardcoded data functions directly from `"use client"` code. This works today because the "data" is a synchronous in-memory array. It will not survive a CMS migration unchanged — Payload's Local API is server-only. This is a real rendering-architecture decision, not a search-and-replace.
- **The database story is more contested than "add Payload's tables."** The project already has an opinionated Drizzle + Postgres + typed-API-client (OpenAPI/Zod/React Query via Orval) convention for its operational data. Introducing Payload means two ORMs, two migration systems, and potentially two philosophies of "what is content" living in the same Postgres instance. This needs an explicit boundary, not an implicit one.

This document proposes: a single, config-driven **Content Platform layer** (Payload) that owns all editorial/marketing content — Work, Blog, and (by extension) future case-adjacent content types — cleanly separated from the operational/CRM schema that Drizzle continues to own; a **server-owned data access layer** that eliminates client-side content fetching; a **real authentication boundary** introduced as part of this work rather than deferred; and a **four-phase migration** that treats correctness, not speed, as the success criterion.

---

## 2. Current System Assessment

### 2.1 What the repository actually is

Concepful is a pnpm/Turborepo-style monorepo:

```text
concepful/
├── apps/concepful/            # Next.js 15 (App Router), React 19, Tailwind v4
├── packages/
│   ├── db/                    # Drizzle ORM schema + Postgres (operational data)
│   ├── api-spec/              # Hand-authored OpenAPI spec (openapi.yaml) + Orval config
│   ├── api-zod/               # Generated Zod schemas from the OpenAPI spec
│   ├── api-client-react/      # Generated React Query hooks + typed fetch client
│   └── object-storage-web/    # Uppy + GCS upload utilities (Replit-sidecar-authenticated)
└── scripts/
```

The app itself has three route groups with genuinely different trust levels and rendering needs:

| Route group | Purpose | Auth model | Rendering |
|---|---|---|---|
| `app/(site)` | Public marketing (home, work, pricing, contact, checkout) | None | Server Components, static-friendly |
| `app/(dashboard)` | Client-facing operational portal (projects, requests, brand center, messages) | `localStorage`-based session (client-trusted, unverified) | Mostly client components |
| `app/admin` | Internal ops console (portfolio, blog, CRM, leads) | Single shared bearer token, prod-only, no login UI | Client components calling authenticated API routes |

Data access today has two live conventions:
1. **Drizzle direct queries** inside Next.js Route Handlers (`app/api/**/route.ts`), used for everything operational (companies, onboarding, plans, work requests, completed work, brand profiles, CRM, blog, portfolio).
2. **A generated typed client** (OpenAPI → Zod → React Query, via Orval) that some dashboard/onboarding surfaces use to call those same route handlers from client components.

The Work section belongs to neither convention. It reads a static array at build/render time, in-process, with no network hop and no database at all.

### 2.2 What the Work section actually is

- `app/(site)/work/page.tsx` — a Server Component. Calls `getFeaturedCaseStudies()` synchronously and passes the result to `WorkHero`, `WorkFeatured`, and (with no data) `WorkMosaic`, followed by `WorkCTA`.
- `WorkMosaic` (`components/features/work/work-mosaic.tsx`) — a **Client Component**. It does *not* receive data as props. It calls `getAllCaseStudies()` and `getCategoryFilters()` directly, holds `activeFilter` in `useState`, filters in-render, and composes `WorkFilters` + `WorkGrid`. This is the one place the existing audit's language ("likely static or fetches internally") undersells what's actually happening: it's not ambiguous, it's a confirmed client-side, client-imported data dependency.
- `app/(site)/work/[slug]/page.tsx` — a Server Component using `generateStaticParams()` and `generateMetadata()` against the same in-memory `CASE_STUDIES` array, with "next project" computed via `(currentIdx + 1) % CASE_STUDIES.length` — a pure array-adjacency operation with no persisted ordering concept.
- `data/case-studies.ts` — nine `CaseStudy` objects. Content fields (title, client, teaser, brief, challenges, deliverables, outcome, outcomeMetrics, tools) sit in the same object as presentation fields (`gradient`: a raw Tailwind arbitrary-value string; `accentColor`: a hex string; `image`: an Unsplash URL) with no separation.
- Images are rendered with plain `<img>` tags, not `next/image` — consistent with there being no `next.config.mjs` remote-image configuration at all today.

This part of the existing audit is accurate and the repository review confirms it field-for-field.

---

## 3. Repository Observations (Audit Verification)

Task 2 asked for the audit to be checked against the repository, not taken as given. The audit is good — accurate everywhere it looked — but it scoped itself to the Work page, the case study page, the data layer, the database schema it found, one API route, and the dashboard. It did not look at `/admin`, at authentication anywhere in the app, at the blog content model, or at the client-side data-fetching boundary inside `WorkMosaic`. Those gaps materially change the recommended architecture, so they're called out explicitly below.

### 3.1 Confirmed accurate

- Component hierarchy, hardcoded data dependency, and static generation behavior of `/work` and `/work/[slug]`.
- `CaseStudy` type shape and the content/presentation field mixing (`gradient`, `accentColor`).
- `packages/db` schema contents (`companiesTable` through `crmContactsTable`), including `portfolioItemsTable`'s shape.
- `/api/work/route.ts` serves the dashboard (`completedWorkTable`) and is unrelated to the marketing page.
- Media is currently Unsplash URLs; GCS (`@google-cloud/storage`) and `@workspace/object-storage-web` exist for uploads elsewhere in the app.
- No authentication exists on the public marketing site itself.
- Turborepo/pnpm workspace structure, and that Payload would be a new addition to it.

### 3.2 Corrected or refined

| Audit statement | Correction |
|---|---|
| "`WorkMosaic` currently takes no props, likely static or fetches internally" | Confirmed, not speculative: `WorkMosaic` is a `"use client"` component that synchronously imports and calls `getAllCaseStudies()`/`getCategoryFilters()` and owns filter state itself. This is a concrete migration blocker (see §11), not an open question. |
| "State management for filters is likely handled within `WorkGrid` or `WorkFilters`" | Filter *state* lives in `WorkMosaic`; `WorkFilters` and `WorkGrid` are presentational/controlled children. |
| "The project is highly ready for a CMS, as the hardcoded data is well-structured" | True for the *shape* of the data. Less true for the *rendering architecture* — the client-side data dependency in `WorkMosaic` and the array-index-based "next project" logic both need real design decisions, not a mechanical swap. |

### 3.3 Missing from the audit — material to the architecture

**(a) A disconnected, already-built portfolio CMS exists.**
`packages/db` defines `portfolioItemsTable` (`title`, `clientName`, `type`, `description`, `coverImageUrl`, `featured`, `sortOrder`, `status`, `tags`, timestamps). There is a full CRUD API for it (`app/api/admin/portfolio/route.ts` and `[id]/route.ts` — GET/POST/PATCH/DELETE, Zod-validated via `drizzle-zod`) and a working admin UI at `/admin/portfolio` (`PortfolioClient`, reachable from `AdminLayout`'s nav). **Nothing on the public site reads this table.** It is a second, parallel "portfolio" concept, already schema-compatible with most of what a CMS collection would need (it even has `sortOrder`, which solves the "next project" problem the audit flagged as needing a database query). This is the single most important thing the audit missed: before designing a new Payload collection, the team needs to explicitly decide whether `portfolioItemsTable` is superseded by Payload, migrated into it, or was actually an earlier attempt at solving exactly this problem that stalled before the frontend cutover happened.

**(b) The blog already has the content-lifecycle pattern the audit wants to introduce for Work.**
`blogPostsTable` has `slug` (unique), `status` (draft-default), `publishedAt`, `content`, `excerpt`, `coverImageUrl`, `tags` — i.e., a working draft/publish model, admin CRUD (`/admin/blog`, `/api/admin/blog`), but still hand-rolled (plain `text("content")`, no rich-text/blocks, no relationships, no media collection). This raises a scope question the audit doesn't ask: **is this a Work-section migration, or a content-platform migration that starts with Work?** The two adjacent content types (Portfolio, Blog) are close enough in shape that solving Payload architecture for Work only, and re-solving it again for Blog eighteen months later, would be a foreseeable and avoidable second migration.

**(c) Authentication is not production-ready anywhere it currently exists, and this is directly relevant, not tangential.**
- `/admin/*` pages render unconditionally on the client (`AdminLayout` has no auth gate); protection exists only at the API layer via `requireAdmin()`, which checks a single static `ADMIN_TOKEN` env var against an `x-admin-token` header — and explicitly **skips the check entirely when `NODE_ENV !== "production"`**.
- The client dashboard's entire session model (`hooks/use-auth-state.ts`) lives in `localStorage`, including a `role` field that determines `isAdmin`. There is no server-issued, server-verified session anywhere in the app today. A user can grant themselves admin in devtools.
- `/api/work/route.ts` (dashboard "completed work" feed) takes `companyId` as a plain query parameter with no verification that the caller is entitled to that company's data.

None of this is Work-section-specific, but it is squarely relevant: Payload's admin panel requires real authenticated users, and this project is the natural, lowest-risk place to introduce that — rather than adding a fifth parallel auth mechanism.

**(d) `packages/object-storage-web` / `lib/objectStorage.ts` is coupled to a Replit-specific credential sidecar** (`http://127.0.0.1:1106`), not a portable GCS service-account flow. This is a deployment-environment assumption worth surfacing now, since Payload's media strategy (§9) needs a storage adapter and shouldn't inherit an environment-coupled auth path silently.

**(e) The app already has an established typed-API convention** (OpenAPI spec → Orval → generated Zod schemas + React Query hooks, in `packages/api-spec` / `api-zod` / `api-client-react`) used for dashboard/client-side data fetching. Any new client-side interactive Work-editing surface should be evaluated against this convention rather than introducing a third pattern.

**(f) `next.config.mjs` has no `images.remotePatterns` configuration**, and the Work components use plain `<img>` tags rather than `next/image`. This is consistent with the current setup but is a real prerequisite for any media strategy involving optimized delivery.

---

## 4. Architectural Problems

Stated plainly, in priority order:

1. **No content/presentation separation.** Editors would need to paste Tailwind arbitrary-value gradient strings and raw hex codes into a CMS field. This is a design-integrity risk and, if the field is ever rendered unsanitized as a class string, a styling-injection risk.
2. **Client-side content fetching.** `WorkMosaic` cannot call an async server-only data layer (Payload Local API) from a `"use client"` component. The rendering boundary has to move.
3. **Four disconnected "work" concepts** (`data/case-studies.ts`, `portfolioItemsTable`, `completedWorkTable`, and implicitly `blogPostsTable` as a sibling content type) with no shared vocabulary, shared admin, or shared migration path.
4. **No enforced content lifecycle.** Nothing prevents an incomplete case study from being "live" the moment it's saved; there's no draft/publish separation for Work at all today (Blog has a primitive version of one).
5. **Implicit ordering.** "Next project" is array-position, not data. Any edit to authoring order (or removal of an item) silently changes navigation for unrelated pages.
6. **No real access control layer to build on.** Introducing Payload's admin means introducing the first real authentication in the app; doing that narrowly (Payload users only) leaves three other insecure surfaces (`/admin`, dashboard sessions, `/api/work`) untouched and creates a fifth auth mechanism instead of consolidating.
7. **Two ORMs, one database, no boundary defined yet.** Drizzle (`packages/db`) and Payload's Postgres adapter would both run migrations against the same Postgres instance unless explicitly isolated.
8. **Media has no managed pipeline.** Hardcoded Unsplash URLs today; no image collection, no resizing/format strategy, no `next/image` configuration.

---

## 5. Design Principles

These govern every decision from here on:

1. **Content and presentation are different concerns and must live in different fields, owned by different people.** Editors own words, images, and structured facts. Engineers own how those are styled. A CMS field should never contain a Tailwind class or a raw hex code unless it is selecting from a closed, engineer-defined set (an enum/theme token).
2. **Data fetching belongs on the server unless there is a specific, justified reason for it to be on the client.** Filtering a list of case studies is a UI interaction, not a reason to move the underlying fetch to the client — it can be done server-side via URL search params, or client-side over an already-fetched, server-provided dataset.
3. **One content platform, not one collection.** Design Payload's information architecture to hold Work *and* Blog (and reasonably anticipated future types) under a coherent, shared content model, even though only Work ships first.
4. **The database boundary between "content" and "operations" must be explicit, not incidental.** Content (Payload) and CRM/operational data (Drizzle) are different bounded contexts with different lifecycles, different editors, and different consistency requirements. They should not merely happen to coexist in the same schema by default.
5. **Authentication is solved once, correctly, not once per surface.** This project should not ship a fifth ad hoc access-control mechanism alongside `ADMIN_TOKEN`, `localStorage` sessions, and unauthenticated query params.
6. **Ordering, relationships, and identity are data, not code.** "Featured," "next project," and "category" should be queryable, explicit, and editable — never derived from array position or duplicated string literals.
7. **Migrations are additive and reversible until the cutover phase.** Nothing about the existing hardcoded rendering should break while the new system is being built alongside it.
8. **Optimize for the person maintaining this in three years**, not for the fastest path to a working Payload demo today.

---

## 6. Proposed Future Architecture

### 6.1 High-level shape

```text
┌─────────────────────────────────────────────────────────────┐
│  Postgres                                                     │
│  ┌────────────────────────┐   ┌──────────────────────────┐   │
│  │  Payload-owned schema   │   │  Drizzle-owned schema     │   │
│  │  (content platform)     │   │  (operational / CRM)      │   │
│  │  case_studies, media,   │   │  companies, work_requests,│   │
│  │  categories, blog_posts,│   │  completed_work, crm_*,   │   │
│  │  users (CMS editors)    │   │  brand_*, plan_selections │   │
│  └────────────────────────┘   └──────────────────────────┘   │
│         isolated via dedicated Postgres schema (namespace)    │
└─────────────────────────────────────────────────────────────┘
             ▲                              ▲
             │ Local API (server-only)      │ Drizzle queries
             │                              │
┌────────────┴──────────────────────────────┴──────────────────┐
│  Next.js (apps/concepful)                                     │
│                                                                 │
│  Content Data Access Layer          Operational Data Access    │
│  lib/content/work.ts                Layer (existing pattern)   │
│  lib/content/categories.ts          app/api/**/route.ts +      │
│  lib/content/blog.ts                Orval-generated client     │
│         │                                                       │
│         ▼                                                       │
│  Server Components (app/(site)/work/*)                         │
│         │  fetch once, pass data down as props                │
│         ▼                                                       │
│  Client Components (WorkMosaic, WorkFilters, WorkGrid)         │
│  — receive data as props, own only UI/interaction state        │
└──────────────────────────────────────────────────────────────┘
```

### 6.2 Key structural decisions

- **Payload runs as a Next.js-native integration inside `apps/concepful`**, not as a separate `apps/cms` application. Rationale in §7.1.
- **A new `lib/content/` data access layer** (analogous in spirit to the existing `lib/dashboard/` and `lib/pricing.ts` conventions already in the app) wraps every Payload Local API call. No Server Component or Route Handler calls `payload.find()` directly — every call goes through a named, typed function (`getFeaturedCaseStudies()`, `getCaseStudyBySlug()`, `getAdjacentCaseStudy()`, etc.). This is precisely the abstraction the audit's §11 proposed, generalized to cover Blog as well and made a firm rule rather than a recommendation.
- **`WorkMosaic` becomes a thin client component that receives its full dataset as a prop from its Server Component parent**, and either (a) filters client-side over already-fetched data (acceptable at current and reasonably foreseeable content volume — dozens, not thousands, of case studies), or (b) is replaced with server-side filtering via `searchParams` if volume or SEO-per-filter ever justifies it. This decision is deferred to implementation with a stated default (client-side filtering over server-fetched data) rather than left ambiguous.
- **Categories become a real Payload collection**, not a hardcoded array, with case studies relating to them — not duplicating `category` + `categoryLabel` as two parallel strings.

---

## 7. Payload CMS Strategy

### 7.1 Where Payload lives in the monorepo

Two real options exist. The audit correctly identifies both without choosing:

| Option | Pros | Cons |
|---|---|---|
| **A — Next.js-native, inside `apps/concepful`** (Payload 3.x pattern) | Local API with no network hop; single deploy artifact; single Postgres connection pool; simplest for a team of this size | Couples CMS admin panel uptime/build to the marketing app; larger app bundle/build surface |
| **B — Separate `apps/cms`** | Clean process/deploy isolation; CMS can be redeployed independently | Loses the zero-latency Local API benefit (must go over REST/GraphQL from `apps/concepful`); doubles deploy surface area and env-var management; no current justification given team size and traffic |

**Recommendation: Option A.** Nothing about this project's scale (a single marketing site, a handful of content editors) justifies the operational overhead of a second deployed application. Revisit only if Payload's admin panel needs to be independently scaled or independently access-controlled from the marketing app at the infrastructure level — not a near-term concern.

### 7.2 What changes about existing code

Directly answering the "should existing code remain" question from the prompt:

- **`data/case-studies.ts` and `data/work-data.ts`**: removed at the end of the migration, not before. They remain the source of truth until Phase 3 cutover is verified (§13).
- **`components/features/work/*`**: presentation layer stays almost entirely as-is. The only required change is the data-fetching boundary in `WorkMosaic` (§6.2) — not the visual design, not the animation logic.
- **`portfolioItemsTable` and its admin surface**: **do not extend this table into the new architecture.** It should be treated as a superseded prototype of the same idea Payload now solves properly (real content modeling, real media handling, real relationships, real drafts). Recommendation: migrate its handful of rows (if any exist in production) into Payload during Phase 2 seeding, then deprecate `/admin/portfolio` and its API routes in Phase 4 cleanup, alongside the hardcoded array. Keeping both alive after Payload ships would recreate exactly the fragmentation problem being solved here.
- **`blogPostsTable` and `/admin/blog`**: out of scope for this migration's *implementation*, but the collection schema proposed in §9 is deliberately designed so Blog can follow the same pattern later without a second architectural redesign. Treat this document's content model as the platform's, not just Work's.

### 7.3 Collections (structural recommendation, not schema code)

Building on the audit's §11 proposal, with corrections:

- **Case Studies** — content fields as the audit lists, plus: a `sortOrder` (or `publishedAt`-driven) field to replace array-index "next project" logic; a proper `status` field (draft/published) rather than relying on `featured` to imply visibility; a `relatedCaseStudy` relationship (optional, editor-controlled) as an alternative to purely automatic adjacency, giving editors control over the "next project" narrative rather than leaving it to publish order alone.
- **Categories** — as the audit proposes; case studies relate to *one* category via relationship field, replacing the current duplicated `category`/`categoryLabel` string pair.
- **Media** — as the audit proposes, GCS-backed (see §9).
- **(Forward-looking, not built now) Blog Posts** — same shape as Case Studies where it overlaps (slug, status, publishedAt, media), so the eventual Blog migration reuses this platform rather than inventing a second one.

The audit's `theme` enum recommendation (replacing raw Tailwind gradient strings with a closed set like Blue/Emerald/Purple/Amber/Violet, mapped to design tokens in the frontend) is correct and should be adopted as specified — this is the single most important content/presentation boundary decision in the whole migration, and the audit got it right.

---

## 8. Database Strategy

### 8.1 Should the existing schema stay as-is?

**Yes, for operational data. No, implicitly, for content** — content should never have been modeled as raw application tables reachable only by hand-authored CRUD routes with no lifecycle or relationship support. `portfolioItemsTable` and `blogPostsTable` are the evidence: both were reasonable attempts, both hit the same ceiling (no rich content blocks, no real media entity, no relationships, no revisions) that a real CMS solves.

### 8.2 Isolation strategy

Payload and Drizzle will both run migrations against the same Postgres instance. To prevent them from colliding (as the audit correctly flags in §13):

- Use a **dedicated Postgres schema (namespace)** for Payload's tables — e.g., `payload.*` — separate from the default/public schema Drizzle uses. Both Postgres and Payload's Postgres adapter support this natively via a `schemaName` configuration.
- Drizzle's `drizzle-kit` migration tooling should be scoped to exclude the Payload-owned schema (via its `schemaFilter` config) so `drizzle-kit generate`/`push` never proposes migrations against Payload's tables, and vice versa.
- Both remain in the same physical database (no case for a second database instance at this scale) purely for operational simplicity — one connection string, one backup/restore boundary — while remaining logically and tooling-wise separate.

### 8.3 Normalization and relationships

- Categories become a real relationship, not a duplicated string pair.
- Media becomes a real entity with its own table (owned by Payload), referenced by ID, not a bare URL string — enabling reuse of the same image across multiple case studies, alt text, and structured metadata without duplication.
- Ordering (`sortOrder` or `publishedAt`) becomes a real, queryable column rather than array position.

### 8.4 Indexing

At the current and reasonably foreseeable content volume (dozens of case studies, not thousands), indexing is not a near-term performance concern. The only index worth calling out explicitly now: a unique index on `slug` (Payload will generate this by default for a unique text field) — this is the one field a broken index would actually break (routing, `generateStaticParams`).

---

## 9. Content Modeling Strategy

Directly restating and slightly extending the audit's content/presentation boundary, since it's the load-bearing decision of this whole document:

| Belongs in the CMS as content | Belongs in code as design tokens |
|---|---|
| Title, client, teaser, brief, challenges, deliverables, outcome, outcome metrics, tools, category (relationship), media (relationship) | Tailwind gradient strings, raw hex accent colors |
| `theme` (a closed enum: Blue / Emerald / Purple / Amber / Violet, or however many the design system defines) | The actual CSS/Tailwind class mapping for each theme value |
| `status` (draft/published), `featured` (boolean), ordering | Animation implementation, layout, responsive behavior |

The rule for any future field: **if it requires design judgment to produce correctly (a specific hex value, a specific class string), it's not a CMS field — it's a fixed set the CMS field selects from.**

Content blocks (Brief / Challenges / Deliverables / Outcome) as the audit proposes are reasonable as a first pass. Given the current UI treats each of these as fairly rigid, structured sections (not free-form rich text), a **structured group of fields per section is preferable to Payload's rich-text/blocks editor for this collection specifically** — it maps more directly to the existing component props, is easier for non-technical editors to fill in correctly, and avoids the "missing field breaks the UI" risk the audit already flagged. Reserve full rich-text/blocks for content types that genuinely need arbitrary structure (Blog, later) rather than defaulting to it everywhere.

---

## 10. Media Strategy

- Payload's Media collection, backed by a GCS adapter, replaces hardcoded Unsplash URLs.
- **The GCS credential path needs to be decoupled from the Replit sidecar dependency identified in §3.3(d)** before or during this work — Payload's storage adapter should authenticate via a standard service-account credential, not an environment-specific sidecar, so the CMS isn't silently non-portable.
- Add `images.remotePatterns` to `next.config.mjs` for the GCS bucket domain, and migrate the plain `<img>` tags in `work-hero.tsx`, `work-featured.tsx`, and `work-grid.tsx` to `next/image` as part of this work — not strictly required for Payload to function, but the natural moment to fix it, since it's the same media pipeline change.
- Payload's automatic image size generation removes the need for any hand-rolled resizing logic, and should be used rather than reproducing size variants manually.

---

## 11. Data Access Strategy

This is where the audit's proposal needs the most extension, because of the `WorkMosaic` finding in §3.2.

**The rule:** exactly one Server Component per route fetches content (via the `lib/content/*` data access layer), and every client component below it receives data as props. No client component calls the data access layer directly, ever — that layer is server-only (Payload's Local API cannot run in the browser).

Concretely for the Work section:

- `app/(site)/work/page.tsx` (Server Component) fetches **all** case studies once (not just featured), passing the featured subset to `WorkHero`/`WorkFeatured` and the full set plus category list to `WorkMosaic` as props.
- `WorkMosaic` becomes a controlled client component: it receives `caseStudies` and `categories` as props, keeps only `activeFilter` as local UI state, and filters over the already-fetched array — the same interaction pattern as today, with the fetch relocated to the server boundary above it.
- `app/(site)/work/[slug]/page.tsx` fetches the single case study by slug, plus (if the "editor-controlled related case study" field from §7.3 is adopted) its explicit related item, or otherwise queries the next item by `sortOrder`/`publishedAt` — never array index.
- `generateStaticParams()` queries Payload for all published slugs instead of mapping the hardcoded array.

This keeps the existing, already-good UI/animation code untouched while resolving the one real rendering-architecture blocker.

---

## 12. Caching & Performance Strategy

- **Rendering strategy:** Incremental Static Regeneration (ISR) is the right default for `/work` and `/work/[slug]` — content changes on an editorial cadence (hours/days), not per-request, and these pages have no per-user personalization.
- **Revalidation:** Payload supports afterChange/afterDelete hooks that can call Next.js's `revalidatePath`/`revalidateTag` on publish — use this so editors see changes reflected promptly (seconds, not the next deploy) without falling back to fully dynamic rendering.
- **Local API avoids network latency** for the server-side fetch itself, which is the main performance argument for the Option A monorepo placement in §7.1.
- No additional caching layer (Redis, etc.) is justified by this migration alone — current and reasonably foreseeable content volume doesn't warrant it. Revisit if the platform later needs to serve high-frequency, highly personalized, or very large catalogs.

---

## 13. Security & Permissions Considerations

This section goes beyond the audit's "let Payload manage its own admin users separately" recommendation, because the repository review found the surrounding auth landscape is a bigger, directly relevant problem.

- **Payload's built-in authentication should become the real authentication system for `/admin`**, replacing the single shared `ADMIN_TOKEN` header check — not living alongside it as a fifth mechanism. Concretely: Payload users with role-based access (editor vs. admin) gate the CMS admin panel itself; the existing hand-rolled `/admin/portfolio`, `/admin/blog` surfaces are retired in Phase 4 as their underlying tables are superseded, removing the need for `ADMIN_TOKEN` entirely for content management.
- **This does not, by itself, fix the client dashboard's `localStorage`-based session** (`hooks/use-auth-state.ts`) or the unauthenticated `companyId` query parameter in `/api/work`. Those are real findings and should be tracked, but they belong to the dashboard/CRM domain, not this migration's scope — flagged here so they're not mistaken for "solved" once Payload auth ships for content editors. Recommend a follow-up scoped specifically to dashboard session security.
- **Payload's role-based access control** should distinguish content editors (can create/edit/publish Case Studies, Categories, Media) from any future elevated role, rather than a single flat "admin" concept — this is a low-cost decision to make correctly now versus retrofitting later.

---

## 14. Scalability Considerations

At current scale (nine case studies, a handful of categories, one editor persona), almost nothing here is urgent — but the architecture should not foreclose growth:

- **Content volume:** the proposed collection/relationship model scales to hundreds of case studies without redesign; only the `WorkMosaic` client-side-filtering default (§6.2) would need revisiting past a few hundred items, and the fallback (server-side filtered fetch via `searchParams`) is already identified.
- **Content types:** the platform-not-just-collection framing (§5, §7.2) means Blog, and reasonably any future "Services" or "Team" content type, extends this same Payload instance rather than starting a fifth system.
- **Editorial team growth:** role-based access in Payload (§13) accommodates more editors without re-architecture.
- **Traffic:** ISR + on-publish revalidation scales read traffic independently of editorial write frequency, which is the right shape for a marketing site.

---

## 15. Risks & Trade-offs

| Risk | Mitigation |
|---|---|
| Payload 3.x compatibility with this specific monorepo setup (pnpm workspaces, Next.js 15.3.x with a patched `next` package — see `patches/next@15.5.20.patch`) is unverified | Spike Payload's installation and Local API in a throwaway branch before committing to Phase 1's timeline; the existing `next` patch is a specific, concrete compatibility risk worth checking first, not assuming away |
| Retiring `portfolioItemsTable`/`/admin/portfolio` could lose in-progress editorial work if anyone has been using it unknowingly | Audit production data in that table before Phase 2 seeding; if it has real rows, migrate them into Payload rather than discarding |
| Moving `WorkMosaic`'s data dependency changes a working, already-polished client component | Scope this as its own reviewable, isolated diff (data plumbing only) before content-source changes, so animation/UI regressions are trivially separable from data-layer regressions |
| Introducing real authentication touches more of the app than "just Work" | Explicitly scope Phase 1 to Payload's own auth for its own admin panel only; do not attempt to fix dashboard `localStorage` sessions in the same phase — different risk profile, different rollback plan |
| Two migration systems (Drizzle, Payload) against one Postgres instance | Schema-level isolation (§8.2) plus a documented rule: nobody runs `drizzle-kit push` without first checking it against the Payload-owned schema is excluded |
| GCS credential coupling to the Replit sidecar is a portability risk independent of this migration | Decouple during Phase 1/2's media setup rather than deferring — it blocks the Media collection from working outside the current deployment environment |

---

## 16. Migration Roadmap

Each phase is independently shippable and leaves the site fully functional throughout — the hardcoded array remains live and authoritative until Phase 3's explicit cutover.

### Phase 1 — Payload Foundation & Schema Design
- **Objective:** Install Payload's Next.js-native integration into `apps/concepful`; define Case Studies, Categories, and Media collections per §7.3/§9; configure schema-level Postgres isolation from Drizzle (§8.2); wire GCS media adapter with a portable credential path (§9, §15).
- **Rationale:** Establishes the platform before any content migrates onto it; the compatibility spike (Payload 3.x + this specific pnpm/Next.js/patch setup) happens here, cheaply, before dependent work is scheduled on top of it.
- **Affected areas:** New Payload config, `packages/db`'s migration tooling config (schema exclusion), `next.config.mjs` (image domains), env/credentials.
- **Dependencies:** None — can start immediately.
- **Risks:** Monorepo/Payload compatibility (see §15); resolved by spiking first, not by discovering mid-phase.
- **Validation:** Payload admin panel loads locally, gated by real Payload authentication; collections match the schema in §7.3/§9; a manually-created test Case Study round-trips through the admin UI and the GCS media adapter successfully.

### Phase 2 — Data Access Layer & Content Seeding
- **Objective:** Build `lib/content/work.ts` (and `categories.ts`) per §11, wrapping every Payload Local API call. Audit `portfolioItemsTable` for real data; migrate any existing rows plus all nine hardcoded case studies into Payload. Convert raw gradient/hex values to the `theme` enum during seeding (this is the actual content-migration step, not a mechanical copy).
- **Rationale:** Separates "does the data layer work" from "does the frontend render it" — this phase is fully verifiable without touching a single existing page.
- **Affected areas:** New `lib/content/` directory; Payload seed script; no changes to `app/(site)/work/*` yet.
- **Dependencies:** Phase 1 complete.
- **Risks:** Data mismatch between the hardcoded array's free-form gradient strings and the new closed `theme` enum — requires a manual mapping decision per case study, not an automated one.
- **Validation:** All source case studies exist in Payload with correct field mapping, verified against the original array field-by-field; `lib/content/work.ts` functions return correctly-typed data in isolation (e.g., via a scratch script or test), independent of any page using them yet.

### Phase 3 — Frontend Cutover
- **Objective:** Swap `app/(site)/work/page.tsx` and `app/(site)/work/[slug]/page.tsx` from `data/work-data.ts` to `lib/content/work.ts`. Relocate `WorkMosaic`'s data fetch to its Server Component parent per §11, converting it to receive props. Replace array-index "next project" logic with the `sortOrder`/relationship-based approach from §7.3. Add on-publish revalidation hooks (§12).
- **Rationale:** The single highest-risk phase, isolated deliberately: content and data-layer correctness were already validated in Phase 2, so this phase is purely about the rendering/props boundary, keeping the blast radius contained.
- **Affected areas:** `app/(site)/work/page.tsx`, `app/(site)/work/[slug]/page.tsx`, `components/features/work/work-mosaic.tsx`.
- **Dependencies:** Phase 2 complete and validated.
- **Risks:** Static generation breaking if slugs mismatch between the old array and Payload; `WorkMosaic` prop-drilling regressing the existing filter UX if not tested against the same interaction cases.
- **Validation:** Site is visually and functionally identical to pre-migration behavior (filter interactions, next-project navigation, metadata) while fully backed by Payload; `generateStaticParams()` reflects Payload's published slugs.

### Phase 4 — Cleanup & Consolidation
- **Objective:** Delete `data/case-studies.ts` and `data/work-data.ts`. Retire `portfolioItemsTable`, `/admin/portfolio`, and its API routes (superseded per §7.2). Retire `ADMIN_TOKEN`-based auth for content management now that Payload's own auth is live (§13).
- **Rationale:** Prevents the exact fragmentation problem identified in §3.3(a) from persisting after the "real" migration is done — this phase is what actually closes the loop, not an optional tidy-up.
- **Affected areas:** `data/`, `app/admin/portfolio/*`, `app/api/admin/portfolio/*`, `lib/admin-auth.ts` usage for content routes.
- **Dependencies:** Phase 3 verified in production for a reasonable soak period.
- **Risks:** Low, given everything downstream was already cut over in Phase 3 — this is deletion of now-dead code, not behavior change.
- **Validation:** No remaining references to the deleted files/tables anywhere in the app (`grep`-verifiable); `/admin/portfolio` route returns 404; site behavior unchanged from end of Phase 3.

*Not included in this roadmap, deliberately:* migrating Blog onto the same platform, and fixing dashboard session security. Both are natural follow-ons the architecture in this document supports, but scoping them into this roadmap would violate the same scope discipline this document is arguing for elsewhere.

---

## 17. Final Recommendations

1. **Treat this as a content-platform decision, not a Work-page decision.** Design Payload's collections (§7–9) so Blog can adopt the same platform later without a second redesign, even though only Work ships now.
2. **Resolve the `portfolioItemsTable` question explicitly, in Phase 1–2, before building anything new.** It's the closest thing this codebase has to a completed first attempt at this exact problem, and ignoring it risks recreating the fragmentation this migration is meant to fix.
3. **Fix the data-fetching boundary (`WorkMosaic`) as its own isolated step (Phase 3)**, not bundled invisibly into the content cutover — it's the one place existing, working, well-designed UI code needs a real architectural change, and it deserves to be reviewable on its own.
4. **Introduce Payload's authentication as the first real access-control system in the app**, scoped to content management, with an explicit note (not a fix, in this phase) that dashboard session security is a separate, tracked problem.
5. **Isolate Payload and Drizzle at the schema level from day one** (§8.2) — this is cheap to do correctly now and expensive to retrofit once both have real production data.
6. **Hold the `theme` enum line.** The single most important content/presentation boundary in this entire proposal is refusing to let raw Tailwind strings or hex codes become CMS-editable fields — this is where "CMS-friendly" and "design-integrity-preserving" are in tension, and the enum-mapped-to-tokens approach resolves it correctly.
7. **Don't schedule Blog migration or dashboard-auth remediation into this roadmap.** Both are legitimate, both are now easier because of the platform this proposal establishes — but scope discipline is what makes each phase's acceptance criteria actually verifiable, and that's worth protecting.
