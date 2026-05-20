# Phase 28: Nav, homepage & catalog labels — Research

**Researched:** 2026-05-20  
**Domain:** Storefront navigation UX, CSS scroll, Ukrainian copy, RSC category counts (Next.js 16 App Router)  
**Confidence:** HIGH (codebase-verified patterns); MEDIUM (CSS `:has()` scoping edge cases)

## Summary

Phase 28 is a **copy-and-layout polish slice** on existing storefront infrastructure from Phases 25–26. No new routes, APIs, Prisma models, or npm packages. Four requirements map cleanly to four touch surfaces: mobile drawer auth (NAV-01), global storefront smooth scroll + sticky header offset (HOME-04), homepage category card badges (HOME-05), and centralized catalog sort labels (CAT-02).

The codebase already has the hard parts: `listCategoriesWithProductCounts()` + `categoriesWithAvailableProducts()` for counts, `#kategorii` on `CategoryGrid`, `main#main-content` in storefront layout, drawer category badges from Phase 26, and `CATALOG_SORT_LABELS` in `catalog-labels.ts`. Gaps are **UI wiring only**: drawer lacks auth block and second separator; homepage cards lack count badges; `globals.css` lacks scroll rules; sort labels and `catalog-toolbar.tsx` `SelectItem` text are stale.

**Locked copy note:** REQUIREMENTS.md CAT-02 says «Новіше»; `28-CONTEXT.md` D-16 locks **«Найновіші»** — implement CONTEXT, optionally sync REQUIREMENTS in a doc-only task.

**Primary recommendation:** Extract shared `StorefrontAuthLinks` (or `variant` on `StoreHeaderAuth`), pass `session` from `StoreHeader` into `StoreMobileNav`, add scoped CSS in `globals.css`, badge row in `category-grid.tsx`, update `CATALOG_SORT_LABELS` + dedupe toolbar `SelectItem` labels via `catalogSortLabel()`, extend Vitest — no hand-rolled scroll JS.

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

#### Mobile drawer auth (NAV-01)
- **D-01:** Keep current drawer order: **categories list** → **separator** → **`CallbackRequestForm`** → **separator** → **auth block**.
- **D-02:** **Guest:** show **«Увійти»** + **«Реєстрація»** (same targets and visual treatment as `StoreHeaderAuth` — text link + primary registration button).
- **D-03:** **Signed-in:** show **«Кабінет»** + **«Вийти»** in the drawer (sign-out same behavior as header).
- **D-04:** Reuse header auth styling/classes; prefer extracting a small shared **`StorefrontAuthLinks`** (or passing `variant="drawer"`) used by `StoreHeaderAuth` and `StoreMobileNav` to avoid drift.
- **D-05:** Pass **session** into `StoreMobileNav` from `StoreHeader` (server) — drawer is client sheet but auth links are static per session snapshot.
- **D-06:** **Desktop header unchanged** — drawer trigger stays `md:hidden`; do not remove auth from header on mobile (user may use either entry).

#### Smooth scroll to `#kategorii` (HOME-04)
- **D-07:** Enable **smooth scroll for all storefront routes** — not only hero CTA. Scope via CSS so admin layout is unaffected (e.g. `html:has(#main-content)` where `#main-content` is the storefront layout main id).
- **D-08:** Implementation = **CSS `scroll-behavior: smooth`** on `html` (no global JS scroll hijack for all anchors).
- **D-09:** Compensate **sticky header** on target: add **`scroll-margin-top`** on `#kategorii` (tune to header height — sticky header in `store-header.tsx`).
- **D-10:** **`prefers-reduced-motion: reduce`** → **instant scroll** (disable smooth via `@media (prefers-reduced-motion: reduce) { scroll-behavior: auto; }`).

#### Homepage category counts (HOME-05)
- **D-11:** Keep **Phase 25 filter** — only categories with `productCount > 0`; zero-count categories **not rendered** (no change to `categoriesWithAvailableProducts`).
- **D-12:** Show count on each homepage category card: **`Badge`** in the **same row as `CardTitle`**, immediately after the category name (flex row, gap, title truncates if needed).
- **D-13:** Badge content:
  - **`count === 1`** → **`1 товар`** (UA singular, per user).
  - **`count >= 2`** → **digits only** in badge (e.g. `12`) — matches drawer numeric style for multi-item counts.
- **D-14:** Reuse existing **`productCount`** from `listCategoriesWithProductCounts()` — same definition as header/drawer (catalog-visible in-stock rules).
- **D-15:** Keep **«Переглянути»** in `CardDescription`; count is additive, not a replacement for description.

#### Catalog sort labels (CAT-02)
- **D-16:** Update **`CATALOG_SORT_LABELS`** to: **`novi` → «Найновіші»**, **`cina-desc` → «Дорожче»**, **`cina-asc` → «Дешевше»** (user choice; note REQUIREMENTS text said «Новіше» — **discussion locks «Найновіші»**).
- **D-17:** **URL sort keys unchanged** (`novi`, `cina-asc`, `cina-desc`) — labels only.
- **D-18:** **Label surface area:** central map in `catalog-labels.ts` + **`catalog-toolbar.tsx`** select items via `catalogSortLabel()`; update **`catalog-labels.test.ts`**. No other catalog strings in this phase (brand/filters out of scope).
- **D-19:** No SEO/title changes unless sort label is duplicated there today (grep shows **only toolbar** — no extra work).

#### Tests & quality
- **D-20:** Update `catalog-labels.test.ts` for new sort strings; add/extend test for homepage count badge rendering or a small `formatCategoryCountBadge(count)` helper if extracted.
- **D-21:** `npm test` + `npm run build` green; manual: mobile drawer guest auth, hero → categories scroll, homepage badges, catalog sort labels.

### Claude's Discretion
- Exact `scroll-margin-top` value and whether to use CSS variable tied to header height.
- Shared auth component name/split between header and drawer.
- Whether `count >= 2` badge uses `tabular-nums` like drawer (recommended for alignment).
- Placing smooth-scroll rules in `globals.css` vs storefront-specific CSS module.

### Deferred Ideas (OUT OF SCOPE)
- Shortening brand filter label «Усі бренди» / other `catalog-labels` strings — user limited phase to CAT-02 sort only.
- Removing duplicate mobile header auth — user chose to keep header as-is.
- Changing REQUIREMENTS wording «Новіше» → «Найновіші» in REQUIREMENTS.md — optional doc sync in plan, not blocking implementation.
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| NAV-01 | У mobile drawer під формою зворотного дзвінка є кнопки входу та реєстрації (як у хедері для неавторизованих) | Add auth block after second `Separator` in `StoreMobileNav`; reuse `StoreHeaderAuth` patterns; pass `session` from `StoreHeader`; extend `store-mobile-nav.test.tsx` |
| HOME-04 | Якір `#kategorii` на головній плавно скролить до секції категорій | `scroll-behavior: smooth` on `html:has(#main-content)`; `scroll-margin-top` on `#kategorii`; `prefers-reduced-motion` override; hero `href="/#kategorii"` unchanged |
| HOME-05 | На картках категорій на головній показано кількість доступних товарів; категорії з 0 товарів не рендеряться | `CategoryGrid` already filters via `categoriesWithAvailableProducts`; add `Badge` + optional `formatCategoryCountBadge()` per D-13 |
| CAT-02 | На `/katalog` у select сортування підписи: «Найновіші», «Дорожче», «Дешевше» | Update `CATALOG_SORT_LABELS`; fix hardcoded `SelectItem` children in `catalog-toolbar.tsx` to use `catalogSortLabel()` |
</phase_requirements>

## Architectural Responsibility Map

| Capability | Primary Tier | Secondary Tier | Rationale |
|------------|-------------|----------------|-----------|
| Mobile drawer auth links | Browser / Client (`StoreMobileNav`) | Frontend Server (`StoreHeader` passes session) | Links and sign-out are client interactions; session snapshot resolved on server in RSC header |
| Smooth scroll to hash | Browser (CSS on `html` / `#kategorii`) | — | No server or API involvement; MDN documents `scroll-behavior` on viewport when set on root |
| Homepage category counts | Frontend Server (`CategoryGrid` RSC) | Database (Prisma via `listCategoriesWithProductCounts`) | Counts fetched server-side; badge is presentational |
| Catalog sort labels | Browser (`CatalogToolbar` client) | Shared lib (`catalog-labels.ts`) | Labels are UI copy; URL state stays in `nuqs` parsers (unchanged keys) |
| Category availability filter | Frontend Server | API/DB (`buildCatalogContextWhere` in catalog service) | Existing Phase 25 rule; phase only consumes `productCount` |

## Standard Stack

### Core

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| Next.js | 16.2.6 `[VERIFIED: package.json]` | App Router, RSC header/grid | Project stack; header already async server component |
| React | 19.2.4 `[VERIFIED: package.json]` | Client drawer, auth, toolbar | Peer of Next 16 |
| Better Auth | 1.6.11 `[VERIFIED: package.json]` | Session + `authClient.signOut` | Existing `StoreHeaderAuth` pattern |
| Tailwind CSS | 4.x `[VERIFIED: package.json]` | Layout, `scroll-mt-*`, flex badge row | `globals.css` uses `@import "tailwindcss"` |
| shadcn/ui | CLI 4.7 `[VERIFIED: package.json]` | `Sheet`, `Badge`, `Button`, `Select` | Already used in drawer and toolbar |
| nuqs | 2.8.9 `[VERIFIED: package.json]` | Catalog sort URL state | Sort **keys** unchanged per D-17 |
| Vitest | 4.1.6 `[VERIFIED: package.json]` | Unit tests for labels, drawer, formatter | `npm test` = `vitest run` |

### Supporting

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| @testing-library/react | 16.3.2 | Drawer auth DOM tests | Extend `store-mobile-nav.test.tsx` |
| lucide-react | 1.16.0 | Menu icon | Unchanged |

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| CSS `scroll-behavior` | `scrollIntoView({ behavior: 'smooth' })` in JS | Rejected by D-08; would hijack all anchors inconsistently and fight reduced-motion |
| `html:has(#main-content)` | Body class from storefront layout | `:has()` is simpler, no layout prop drilling; admin has no `#main-content` `[VERIFIED: admin/layout.tsx]` |
| Inline toolbar sort strings | Only `CATALOG_SORT_LABELS` | Toolbar currently duplicates strings in `SelectItem` — violates D-18 until fixed |

**Installation:** None — phase uses existing dependencies only.

## Package Legitimacy Audit

> No new external packages in this phase.

| Package | Registry | slopcheck | Disposition |
|---------|----------|-----------|-------------|
| — | — | — | N/A |

**Packages removed due to slopcheck [SLOP] verdict:** none  
**Packages flagged as suspicious [SUS]:** none

## Architecture Patterns

### System Architecture Diagram

```text
[Browser: Storefront page]
    │
    ├─► StoreHeader (RSC)
    │       ├─ auth.api.getSession()
    │       ├─ listCategoriesWithProductCounts()
    │       ├─ categoriesWithAvailableProducts()
    │       ├─► StoreMobileNav (client) ← session + categories
    │       │       ├─ category links + count badges
    │       │       ├─ CallbackRequestForm
    │       │       └─ StorefrontAuthLinks (new/shared)
    │       └─► StoreHeaderAuth (client) ← same auth links
    │
    ├─► main#main-content (storefront layout)
    │       ├─ CSS: html:has(#main-content) { scroll-behavior: smooth }
    │       └─ children (home, katalog, …)
    │
    ├─► HeroSection: Link href="/#kategorii"
    │
    └─► CategoryGrid (RSC)
            ├─ listCategoriesWithProductCounts() + filter
            ├─ section#kategorii + scroll-margin-top
            └─ CardTitle row + Badge(productCount)

[Browser: /katalog]
    └─► CatalogToolbar (client)
            ├─ nuqs sort param (novi | cina-asc | cina-desc)
            └─ catalogSortLabel(sort) → Select UI
```

### Recommended Project Structure

```text
src/components/layout/
  store-header.tsx          # pass session to StoreMobileNav
  store-header-auth.tsx     # thin wrapper → StorefrontAuthLinks
  store-mobile-nav.tsx      # + Separator + auth block
  storefront-auth-links.tsx # NEW (optional name per discretion)

src/components/home/
  category-grid.tsx         # title + Badge row

src/lib/catalog/
  catalog-labels.ts         # CATALOG_SORT_LABELS update
  format.ts                 # + formatCategoryCountBadge (optional)

src/app/globals.css         # smooth scroll + #kategorii scroll-margin
```

### Pattern 1: Shared storefront auth links

**What:** Extract link/sign-out markup from `StoreHeaderAuth` into a shared client component; header and drawer both render it with the same `linkClass` and primary registration styling.

**When to use:** NAV-01 D-04 — any time two surfaces must stay visually identical.

**Example (from existing `store-header-auth.tsx`):**

```typescript
// src/components/layout/store-header-auth.tsx (reference)
const linkClass =
  "inline-flex min-h-11 min-w-11 items-center justify-center rounded-md px-2 text-sm font-medium hover:bg-muted";

// Guest: /uviity + /reiestratsiia (primary)
// Signed-in: /kabinet + Button signOut → authClient.signOut(); router.push("/"); router.refresh();
```

### Pattern 2: Storefront-scoped smooth scroll (CSS only)

**What:** Apply smooth scrolling only when storefront `main#main-content` exists; respect reduced motion.

**When to use:** HOME-04 D-07–D-10.

**Example:**

```css
/* src/app/globals.css — Source: [CITED: developer.mozilla.org/en-US/docs/Web/CSS/scroll-behavior] */
html:has(#main-content) {
  scroll-behavior: smooth;
}

@media (prefers-reduced-motion: reduce) {
  html:has(#main-content) {
    scroll-behavior: auto;
  }
}

#kategorii {
  scroll-margin-top: var(--store-header-offset, 4.5rem);
}
```

`28-UI-SPEC.md` recommends **4.5rem (72px)** for sticky header offset (`store-header.tsx`: `sticky top-0`, `py-3`, ~44px touch row).

### Pattern 3: Homepage count badge (hybrid UA rule)

**What:** Formatter encodes D-13; grid stays thin.

**When to use:** HOME-05; keeps plural logic out of JSX.

**Example:**

```typescript
// src/lib/catalog/format.ts (proposed)
export function formatCategoryCountBadge(count: number): string {
  if (count === 1) return "1 товар";
  return String(count);
}
```

```tsx
// src/components/home/category-grid.tsx (structure per 28-UI-SPEC.md)
<div className="flex min-w-0 items-center gap-2">
  <CardTitle className="truncate text-base">{category.name}</CardTitle>
  <Badge variant="secondary" className="shrink-0 tabular-nums text-muted-foreground">
    {formatCategoryCountBadge(category.productCount)}
  </Badge>
</div>
```

Drawer keeps **numeric-only** badges for all counts (Phase 26) — intentional asymmetry per D-13.

### Pattern 4: Single source for sort labels

**What:** `catalogSortLabel()` reads `CATALOG_SORT_LABELS`; toolbar must not hardcode duplicate strings.

**When to use:** CAT-02 D-18.

**Current gap:** `catalog-toolbar.tsx` lines 87–89 hardcode «Новіші», «Ціна ↑», «Ціна ↓» while `SelectValue` uses `catalogSortLabel()` — planner should fix both map and items:

```tsx
{(["novi", "cina-asc", "cina-desc"] as const).map((value) => (
  <SelectItem key={value} value={value}>
    {catalogSortLabel(value)}
  </SelectItem>
))}
```

### Anti-Patterns to Avoid

- **JS scroll hijack on every anchor:** Conflicts with D-08 and accessibility; use CSS only.
- **Removing header auth on mobile:** Explicitly forbidden (D-06).
- **Using `pluralResultsUa` for card badges:** Full phrase like «12 товарів» conflicts with D-13 numeric-only rule for ≥2.
- **Changing `catalogParsers.sort` enum:** Breaks URLs and bookmarks (D-17).
- **Showing zero-count categories on homepage:** Regresses Phase 25 HOME-03.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Smooth hash navigation | Custom `useEffect` + `scrollTo` | CSS `scroll-behavior` + `scroll-margin-top` | Native, respects `prefers-reduced-motion`, works for all in-page `#` links on storefront |
| UA plural for badge | Ad-hoc strings in JSX | `formatCategoryCountBadge(count)` (small helper) | One testable place for hybrid 1 vs N rule |
| Auth link markup twice | Copy-paste in drawer | Shared `StorefrontAuthLinks` | Drift broke NAV-01 parity in past phases |
| Sort label strings in toolbar | Hardcoded `SelectItem` text | `catalogSortLabel()` + `CATALOG_SORT_LABELS` | Already partially done; duplicate strings are a bug today |

**Key insight:** Phase 28 is consolidation of existing patterns (Phase 26 drawer counts, Phase 25 empty filter, central labels file) — not new subsystems.

## Common Pitfalls

### Pitfall 1: Toolbar labels out of sync with `CATALOG_SORT_LABELS`

**What goes wrong:** `SelectValue` shows new copy but dropdown items show old «Ціна ↑↓».  
**Why it happens:** `SelectItem` children are hardcoded in `catalog-toolbar.tsx`.  
**How to avoid:** Render items only via `catalogSortLabel()`.  
**Warning signs:** `catalog-labels.test.ts` passes but UI dropdown unchanged.

### Pitfall 2: Admin pages get smooth scroll

**What goes wrong:** Long admin tables feel sluggish on anchor jumps.  
**Why it happens:** `scroll-behavior: smooth` on unscoped `html`.  
**How to avoid:** Scope with `html:has(#main-content)` — admin layout has no `#main-content` `[VERIFIED: src/app/(admin)/admin/layout.tsx]`.  
**Warning signs:** Smooth scroll on `/admin/*`.

### Pitfall 3: `#kategorii` hidden under sticky header

**What goes wrong:** After hero CTA click, section title sits under header.  
**Why it happens:** Missing `scroll-margin-top`.  
**How to avoid:** Set on `#kategorii` (4.5rem default per UI-SPEC).  
**Warning signs:** Manual HOME-04 check fails on mobile.

### Pitfall 4: Drawer auth above callback form

**What goes wrong:** Violates locked order D-01.  
**Why it happens:** Placing auth before `CallbackRequestForm`.  
**How to avoid:** Categories → sep → callback → sep → auth.  
**Warning signs:** Visual regression vs Phase 26 UAT.

### Pitfall 5: Signed-in drawer missing sign-out parity

**What goes wrong:** Only guest links added.  
**Why it happens:** NAV-01 text mentions login/register only; CONTEXT D-03 requires cabinet/sign-out too.  
**How to avoid:** Test both session states in `store-mobile-nav.test.tsx`.

### Pitfall 6: REQUIREMENTS vs CONTEXT sort wording

**What goes wrong:** UAT checks «Новіше» while code ships «Найновіші».  
**Why it happens:** REQUIREMENTS.md not updated after discuss.  
**How to avoid:** Treat CONTEXT as source of truth; optional REQUIREMENTS sync task.

## Code Examples

Verified patterns from codebase and MDN:

### Pass session into mobile nav

```typescript
// src/components/layout/store-header.tsx (integration point)
<StoreMobileNav
  categories={availableCategories}
  session={session}
/>
```

### Drawer structure after change

```tsx
// src/components/layout/store-mobile-nav.tsx (target structure)
<ul>{/* categories + badges */}</ul>
<Separator className="my-6" />
<div className="px-4"><CallbackRequestForm compact idPrefix="drawer" /></div>
<Separator className="my-6" />
<div className="px-4 pb-4">
  <StorefrontAuthLinks session={session} />
</div>
```

### Category count pipeline (unchanged)

```typescript
// src/server/services/catalog.service.ts — listCategoriesWithProductCounts()
productCount: counts.byCategoryId[category.id] ?? 0,

// src/lib/catalog/categories.ts
export function categoriesWithAvailableProducts<T extends { productCount: number }>(categories: T[]) {
  return categories.filter((category) => category.productCount > 0);
}
```

### Sort labels (target)

```typescript
// src/lib/catalog/catalog-labels.ts
export const CATALOG_SORT_LABELS = {
  novi: "Найновіші",
  "cina-asc": "Дешевше",
  "cina-desc": "Дорожче",
} as const;
```

### Existing drawer count test pattern

```typescript
// src/components/layout/store-mobile-nav.test.tsx — extend for auth
fireEvent.click(screen.getByRole("button", { name: "Меню" }));
expect(screen.getByRole("link", { name: "Увійти" })).toBeDefined();
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Long sort labels («Ціна ↑↓») | Short UA («Дешевше» / «Дорожче») | Phase 28 | Toolbar width `w-36` likely still sufficient |
| Homepage categories without counts | Badge on card title row | Phase 28 | Drawer vs homepage badge rules differ for count=1 |
| Instant hash jump | CSS smooth scroll (storefront only) | Phase 28 | All storefront `#` anchors smooth unless reduced motion |

**Deprecated/outdated:**
- Hardcoded sort strings in `catalog-toolbar.tsx` `SelectItem` — replace with `catalogSortLabel()` in this phase.

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | `html:has(#main-content)` excludes admin from smooth scroll | Smooth scroll | Admin layout could get smooth scroll if an admin page adds `id="main-content"` |
| A2 | 4.5rem `scroll-margin-top` clears sticky header | HOME-04 | Title partially hidden — tune ±4px |
| A3 | `:has()` support is acceptable for storefront audience | CSS scope | Very old browsers ignore rule; scroll stays `auto` (acceptable degradation) `[MEDIUM]` |
| A4 | ROADMAP «Новіше» is superseded by CONTEXT «Найновіші» | CAT-02 | UAT wording mismatch |

**If A3 matters:** Fallback is adding `className="storefront"` on storefront layout `<html>` via a client-free wrapper — out of discretion unless `:has()` rejected.

## Open Questions

1. **Shared component name: `StorefrontAuthLinks` vs `variant="drawer"` on `StoreHeaderAuth`**
   - What we know: Both consumers are client components; sign-out needs `useRouter`.
   - What's unclear: File split only.
   - Recommendation: Extract `StorefrontAuthLinks`; keep `StoreHeaderAuth` as thin wrapper for header placement (planner discretion D-04).

2. **Optional REQUIREMENTS.md sync for CAT-02 wording**
   - What we know: Implementation uses «Найновіші».
   - Recommendation: Non-blocking doc checkbox in plan.

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| Node.js | build/test | ✓ | v24.14.0 | — |
| npm / vitest | D-20 tests | ✓ | vitest 4.1.6 | — |
| jsdom | `store-mobile-nav.test.tsx` | ✓ | 29.1.1 | — |
| Playwright | manual/e2e optional | ✓ `[VERIFIED: package.json]` | 1.60.0 | Manual UAT only |

**Missing dependencies with no fallback:** none  

Step 2.6 note: SKIPPED for blocking externals — phase is code/CSS only.

## Validation Architecture

### Test Framework

| Property | Value |
|----------|-------|
| Framework | Vitest 4.1.6 + @testing-library/react 16.3.2 |
| Config file | `vitest.config.ts` |
| Quick run command | `npm test` |
| Full suite command | `npm test` (same; no split suite) |

### Phase Requirements → Test Map

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| NAV-01 | Guest drawer shows Увійти/Реєстрація | unit (jsdom) | `npm test -- src/components/layout/store-mobile-nav.test.tsx` | ✅ extend |
| NAV-01 | Signed-in drawer shows Кабінет/Вийти | unit (jsdom) | same | ❌ Wave 0 — add case |
| HOME-04 | Smooth scroll + header offset | manual | Hero CTA → `#kategorii` visible below header | N/A (CSS) |
| HOME-05 | Badge «1 товар» vs digits | unit | `npm test -- src/lib/catalog/format.test.ts` (or inline in catalog-labels area) | ❌ Wave 0 if helper extracted |
| HOME-05 | Zero-count categories hidden | unit | `npm test -- src/lib/catalog/categories.test.ts` | ✅ |
| CAT-02 | Sort label strings | unit | `npm test -- src/lib/catalog/catalog-labels.test.ts` | ✅ update |
| CAT-02 | Toolbar shows new labels | manual / optional RTL | Open `/katalog`, inspect sort select | — |

### Sampling Rate

- **Per task commit:** `npm test -- src/lib/catalog/catalog-labels.test.ts` (+ touched test files)
- **Per wave merge:** `npm test`
- **Phase gate:** `npm test` + `npm run build` green; manual checklist from D-21

### Wave 0 Gaps

- [ ] Extend `src/components/layout/store-mobile-nav.test.tsx` — signed-in session + auth links
- [ ] Add `src/lib/catalog/format.test.ts` — `formatCategoryCountBadge` if extracted (D-20)
- [ ] Update `src/lib/catalog/catalog-labels.test.ts` — all three sort values including «Дорожче»/«Дешевше»
- [ ] Optional: dedupe toolbar labels test via shallow render of `CatalogToolbar` (not required if map + manual suffice)

## Security Domain

### Applicable ASVS Categories

| ASVS Category | Applies | Standard Control |
|---------------|---------|------------------|
| V2 Authentication | yes (surface only) | Reuse Better Auth session snapshot; no new auth endpoints |
| V3 Session Management | no change | Existing sign-out flow |
| V4 Access Control | no change | No new routes |
| V5 Input Validation | no | Copy-only phase |
| V6 Cryptography | no | — |

### Known Threat Patterns for {stack}

| Pattern | STRIDE | Standard Mitigation |
|---------|--------|---------------------|
| Session fixation via drawer | Spoofing | No change — same session object as header |
| XSS via sort labels | Tampering | Static UA strings in TS map, not user input |
| Open redirect on auth links | Elevation | Fixed paths `/uviity`, `/reiestratsiia`, `/kabinet` only |

## Project Constraints (from .cursor/rules/)

- **Locale:** UI only Ukrainian — all new copy in UA per CONTEXT.
- **Stack:** Next.js App Router, TypeScript, Tailwind 4, shadcn, Better Auth — no stack changes.
- **Next.js:** Read `node_modules/next/dist/docs/` for API changes before altering framework usage `[AGENTS.md]`.
- **GSD / phase scope:** Do not expand to brand labels, footer, PDP, or admin (deferred in CONTEXT).

## Sources

### Primary (HIGH confidence)

- Codebase: `store-mobile-nav.tsx`, `store-header.tsx`, `store-header-auth.tsx`, `category-grid.tsx`, `catalog-labels.ts`, `catalog-toolbar.tsx`, `(storefront)/layout.tsx`, `globals.css`
- [MDN scroll-behavior](https://developer.mozilla.org/en-US/docs/Web/CSS/scroll-behavior) — smooth scroll on scrolling box / viewport
- `.planning/phases/28-nav-homepage-catalog-labels/28-CONTEXT.md` — locked decisions
- `.planning/phases/28-nav-homepage-catalog-labels/28-UI-SPEC.md` — visual contract (4.5rem offset, badge layout)

### Secondary (MEDIUM confidence)

- CSS `:has()` for storefront scoping — standard in baseline browsers; admin exclusion verified by layout inspection
- Phase 25/26 planning docs — count filter and drawer order

### Tertiary (LOW confidence)

- None blocking planning

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — no new packages; versions from `package.json`
- Architecture: HIGH — files and data paths verified in repo
- Pitfalls: HIGH — includes known toolbar duplication bug

**Research date:** 2026-05-20  
**Valid until:** 2026-06-20 (stable CSS/UI patterns)
