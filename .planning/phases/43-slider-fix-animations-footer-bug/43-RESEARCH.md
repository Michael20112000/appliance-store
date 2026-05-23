# Phase 43: Slider Fix, Animations & Footer Bug — Research

**Researched:** 2026-05-23
**Domain:** Catalog UI (price slider), CSS page transitions, URL/link bug fix
**Confidence:** HIGH

---

## Summary

Phase 43 addresses three independent, contained changes: (1) a price slider whose step snapping can break when `minUah`/`maxUah` are not multiples of 50, (2) fade-in page transitions scoped to the storefront layout, and (3) a one-line URL bug in the footer address link.

**SLIDER-01** — The root cause is that `@base-ui/react` Slider snaps to multiples of `step` relative to `min`. When `bounds.minUah` is not a multiple of 50 (e.g., 1273), draggable positions become 1273, 1323, 1373 … — not the expected 50 UAH grid. Additionally, if `maxUah` is not a multiple of 50 (e.g., 7890), the user can drag to 7850 but the next valid snap would be 7900 > max, so the handle is blocked before reaching the actual maximum; the URL filter therefore can never be cleared via dragging. Fix: compute `sliderMin = floor(minUah / 50) * 50` and `sliderMax = ceil(maxUah / 50) * 50` and pass those to the `<Slider>` while keeping the real `bounds` for the `atMin`/`atMax` snap-back comparison. This change lives entirely in `catalog-filters.tsx`.

**ANIM-01** — React 19.2.4 (the installed version) does not export `ViewTransition`; that API is canary-only. The canonical non-canary approach for Next.js App Router storefront fade transitions is a CSS `@keyframes` animation applied to the storefront `{children}` wrapper. Because Next.js re-mounts the page subtree (`children`) on every navigation while keeping the shared layout alive, an `animation: page-fade-in` on a wrapping element runs on each page load. `tw-animate-css` (already installed) provides the `@keyframes enter` and `fade-in` utility classes, so no additional library is needed. The `@media (prefers-reduced-motion: reduce)` override sets `animation-duration: 0s !important` following Next.js's own documented guidance.

**BUG-25** — `addressExternalMapUrl` in `store-map.ts` checks `if (address.mapUrl) return address.mapUrl` first. If the admin saved a Google Maps embed URL (e.g., `https://maps.google.com/maps?q=...&output=embed`) in the `mapUrl` field, the footer address `<a href>` points to that embed URL. Fix: strip the `output=embed` query parameter (and/or convert `maps.google.com/maps?...` to `google.com/maps/search/?api=1&query=...`) inside `addressExternalMapUrl`, leaving `addressMapEmbedSrc` untouched. No schema change is required.

**Primary recommendation:** Three self-contained code edits in three files (`catalog-filters.tsx`, `store-map.ts`, `globals.css` + storefront `layout.tsx`) plus new unit tests.

---

## Project Constraints (from CLAUDE.md via AGENTS.md)

- Read `node_modules/next/dist/docs/` before writing any Next.js code; heed deprecation notices.
- This version of Next.js has breaking changes versus training data.

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| SLIDER-01 | Price range slider steps in 50 UAH increments; handles snap to real catalog min/max at extremes | Fix sliderMin/sliderMax calculation in `catalog-filters.tsx`; `normalizeThumbRange` already handles snap-back via `atMin`/`atMax` guards |
| ANIM-01 | Storefront pages show subtle fade transitions; admin excluded; respects prefers-reduced-motion | CSS-only via `@keyframes page-fade-in` + `fill-mode: both` in `globals.css`; wrapper div in storefront layout; zero-duration override for reduced-motion |
| BUG-25 | Footer address link opens standard Google Maps URL, not an embed API URL | One-line fix in `addressExternalMapUrl` to detect and convert embed URLs |
</phase_requirements>

---

## Architectural Responsibility Map

| Capability | Primary Tier | Secondary Tier | Rationale |
|------------|-------------|----------------|-----------|
| Slider step/snap fix (SLIDER-01) | Browser / Client | — | Pure UI state + URL param sync; all logic in `CatalogFiltersPanel` (client component) |
| Page fade transitions (ANIM-01) | Browser / Client (CSS) | Frontend Server (SSR) | Animation declared in CSS (`globals.css`); the layout wrapper that carries the class is rendered server-side; animation itself runs in the browser |
| Footer address URL fix (BUG-25) | Frontend Server (SSR) | — | `StoreFooter` is an RSC that calls `addressExternalMapUrl`; the bug is in the URL-construction utility function |

---

## Standard Stack

### Core (all already installed — no new packages)

| Library | Installed Version | Purpose | Role in Phase 43 |
|---------|------------------|---------|-----------------|
| `@base-ui/react` | 1.4.1 | Accessible slider primitive | The slider already uses `SliderPrimitive.Root`; fix is a prop change (`min`/`max` values) [VERIFIED: node_modules] |
| `tw-animate-css` | 1.4.0 | CSS animation utilities compatible with Tailwind v4 | Provides `@keyframes enter`, `fade-in` utility, and `animate-in` class for storefront page transition [VERIFIED: node_modules] |
| `tailwindcss` | ^4 | CSS framework | `@media (prefers-reduced-motion)` override written in `globals.css` [VERIFIED: node_modules] |
| `nuqs` | ^2.8.9 | URL state management for catalog filters | Already manages `cinaVid`/`cinaDo` sync; no changes needed here [VERIFIED: node_modules] |

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| CSS `@keyframes` fade | `React.ViewTransition` (experimental) | ViewTransition is more expressive but not in React 19.2.4 stable; requires `next.config.ts experimental.viewTransition: true` AND a React canary build — not available in this project's stack [VERIFIED: node_modules/react — `ViewTransition` is undefined in React 19.2.4] |
| CSS `@keyframes` fade | Framer Motion | No Framer Motion in the project; adds a large dependency for a 150ms opacity change |

---

## Package Legitimacy Audit

> No new packages are installed in this phase. All three requirements are fulfilled with existing dependencies. This section is intentionally empty.

**Packages removed due to slopcheck [SLOP] verdict:** none
**Packages flagged as suspicious [SUS]:** none

---

## Architecture Patterns

### System Architecture Diagram

```
[ User browser ]
      |
      | drag slider
      v
[ CatalogFiltersPanel (client) ]
  normalizeSliderBounds(bounds) → sliderMin, sliderMax (50-aligned)
  onValueChange → normalizeThumbRange → setDragValues
  onValueCommitted → syncPriceToUrl (atMin/atMax → null params)
      |
      | URL params (cinaVid, cinaDo)
      v
[ Catalog RSC — server re-render ]
  getCatalogPriceBounds() → bounds (raw UAH)
  listPublicProducts(filters)

[ StoreFooter (RSC) ]
  getPublicStoreContacts() → addresses
  addressExternalMapUrl(address) → google.com/maps URL (fixed)
      |
      | <a href=...> rendered to browser

[ globals.css ]
  @keyframes page-fade-in: opacity 0→1
  @media (prefers-reduced-motion): animation-duration: 0s
[ Storefront layout (RSC) ]
  <main> → <div class="page-transition-wrapper"> → {children}
  children re-mounts on navigation → CSS animation fires
```

### Recommended Project Structure

No new directories needed. Changes are in:

```
src/
├── app/
│   ├── globals.css                    # + @keyframes page-fade-in, prefers-reduced-motion
│   └── (storefront)/
│       └── layout.tsx                 # + div wrapper with animation class around {children}
├── components/
│   └── catalog/
│       └── catalog-filters.tsx        # + normalizeSliderBounds helper, updated Slider min/max
└── lib/
    └── catalog/
        ├── store-map.ts               # + embed URL detection in addressExternalMapUrl
        └── store-map.test.ts          # NEW — unit tests for addressExternalMapUrl fix
```

---

### Pattern 1: Slider Bounds Normalization

**What:** Snap slider `min`/`max` to 50 UAH grid so draggable positions are always multiples of 50; keep original `bounds` for "snap back to real extremes" URL logic.

**When to use:** Any time slider `step` > 1 and `min`/`max` may not be multiples of step.

```typescript
// Source: reasoning from @base-ui/react SliderRoot.d.ts (step snaps to multiples relative to min)
// and catalog-filters.tsx existing normalizeThumbRange logic

const PRICE_STEP_UAH = 50;

function normalizeSliderBounds(bounds: PriceBounds): { sliderMin: number; sliderMax: number } {
  return {
    sliderMin: Math.floor(bounds.minUah / PRICE_STEP_UAH) * PRICE_STEP_UAH,
    sliderMax: Math.ceil(bounds.maxUah / PRICE_STEP_UAH) * PRICE_STEP_UAH,
  };
}

// Usage in CatalogFiltersPanel render:
const { sliderMin, sliderMax } = normalizeSliderBounds(bounds);
// Pass to Slider:
<Slider min={sliderMin} max={sliderMax} step={PRICE_STEP_UAH} ... />
// Keep original bounds for atMin/atMax snap-back in syncPriceToUrl:
const atMin = cinaVid <= bounds.minUah;  // unchanged
const atMax = cinaDo >= bounds.maxUah;   // unchanged
```

**Key insight:** The existing `normalizeThumbRange` function already calls `clampPrice(value, min, max)` where `min`/`max` are from bounds — not slider props. So `thumbValues` will never exceed the real `bounds`, and the URL sync's `atMin`/`atMax` checks against real bounds still work correctly. The only change needed is the Slider's `min`/`max` props.

---

### Pattern 2: CSS Page Fade with prefers-reduced-motion

**What:** A short `opacity: 0 → 1` animation defined in globals.css, applied to the storefront children wrapper. Because Next.js App Router re-mounts only `children` on navigation (shared layout persists), the wrapper element re-mounts and the animation fires.

**When to use:** Storefront-only, non-interactive, entrance animation. Admin is excluded because it uses a different layout (`(admin)/layout.tsx`).

```css
/* Source: Next.js view-transitions.md reduced-motion pattern [VERIFIED: node_modules/next/dist/docs] */
/* and tw-animate-css @keyframes enter [VERIFIED: node_modules/tw-animate-css] */

/* globals.css */
@keyframes page-fade-in {
  from { opacity: 0; }
  to   { opacity: 1; }
}

.page-transition {
  animation: page-fade-in 0.15s ease-out both;
}

@media (prefers-reduced-motion: reduce) {
  .page-transition {
    animation-duration: 0s !important;
    animation-delay: 0s !important;
  }
}
```

```tsx
// Source: Next.js App Router layout pattern [VERIFIED: node_modules/next/dist/docs]
// In src/app/(storefront)/layout.tsx (RSC — no 'use client' needed):
<main id="main-content" className="flex-1">
  <div className="page-transition">   {/* ← add this wrapper */}
    <NuqsAdapter>
      ...
      {children}
      ...
    </NuqsAdapter>
  </div>
</main>
```

**Important:** The `NuqsAdapter` and `Suspense` + `ChatProviderGate` are client components already inside `<main>`. The `.page-transition` div wraps all of them. Since the layout is an RSC and re-renders its `children` on navigation, the wrapper div IS re-created with each navigation — the CSS animation fires correctly.

**Alternative considered:** Wrapping just `{children}` deeper (below NuqsAdapter). This would animate earlier but is harder to target. Wrapping the entire `<main>` content is simpler and visually equivalent for a 150ms fade.

---

### Pattern 3: Embed URL Detection and Conversion

**What:** In `addressExternalMapUrl`, detect embed-style Google Maps URLs and convert to a navigable URL.

**When to use:** Whenever `address.mapUrl` is set (the current code returns it as-is, which is wrong for embed URLs).

```typescript
// Source: reasoning from store-map.ts and Google Maps URL format knowledge [ASSUMED]

// Patterns to detect:
// - https://maps.google.com/maps?q=...&output=embed
// - https://www.google.com/maps/embed?pb=...
// - https://www.google.com/maps?q=...&output=embed

function isEmbedMapUrl(url: string): boolean {
  try {
    const u = new URL(url);
    // Google Maps embed via output=embed query param
    if (u.searchParams.get("output") === "embed") return true;
    // Google Maps embed path: /maps/embed
    if (u.pathname.startsWith("/maps/embed")) return true;
    return false;
  } catch {
    return false;
  }
}

export function addressExternalMapUrl(address: PublicStoreAddress): string {
  if (address.mapUrl && !isEmbedMapUrl(address.mapUrl)) return address.mapUrl;
  // Fall through to lat/lng or text-based URL
  if (address.latitude != null && address.longitude != null) {
    return `https://www.google.com/maps/search/?api=1&query=${address.latitude},${address.longitude}`;
  }
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address.text)}`;
}
```

**Test coverage needed:** Unit tests in `store-map.test.ts` covering: embed URL → falls through to text search, normal maps URL → returned as-is, lat/lng → correct search URL, text-only → encoded search URL.

---

### Anti-Patterns to Avoid

- **Modifying `addressMapEmbedSrc`:** The embed URL fix is only needed in `addressExternalMapUrl`. `addressMapEmbedSrc` deliberately accepts embed URLs for the `<iframe src>` in the footer map. Do not change it.
- **Changing the Slider's `value` range:** `thumbValues` and the `normalizeThumbRange`/`clampPrice` functions use the original `bounds` (not slider props) — leave them unchanged. Only the `min`/`max` props on `<Slider>` change.
- **Adding `prefers-reduced-motion` via JavaScript:** CSS-only is simpler, more reliable, and respects the OS setting without any JS hydration delay.
- **Putting animation on the `<body>` or root layout:** This would animate admin pages too. The animation must be scoped to `(storefront)/layout.tsx` only.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Slider step snapping | Custom drag event math | `@base-ui/react` `step` prop with normalized `min`/`max` | The primitive already handles keyboard, touch, ARIA; custom drag math reintroduces all those edge cases |
| Reduced-motion detection | `useReducedMotion()` hook with conditional animation | `@media (prefers-reduced-motion: reduce)` CSS | CSS media query is evaluated before paint; hook-based detection causes a flash |
| Page fade animation framework | Framer Motion / motion.dev | CSS `@keyframes` + tw-animate-css | 0 new dependencies; Framer Motion not in project |

---

## Common Pitfalls

### Pitfall 1: Slider thumbs stuck before real max
**What goes wrong:** If `sliderMax = sliderMin = 0` (edge case: `bounds` has equal min and max), the slider renders with zero range. The `normalizeSliderBounds` helper must guard `sliderMin === sliderMax` (e.g., add 50 to sliderMax when they're equal).
**Why it happens:** `Math.floor(x/50)*50 === Math.ceil(x/50)*50` when `x` is already a multiple of 50 AND `minUah === maxUah`.
**How to avoid:** `if (sliderMin === sliderMax) sliderMax = sliderMin + PRICE_STEP_UAH`.

### Pitfall 2: Animation fires on admin pages
**What goes wrong:** Adding the `.page-transition` class to the root layout (`app/layout.tsx`) would animate admin navigation too.
**Why it happens:** Root layout wraps both storefront and admin route groups.
**How to avoid:** Place the wrapper div only inside `src/app/(storefront)/layout.tsx`.

### Pitfall 3: `thumbValues` drifts outside Slider min/max
**What goes wrong:** After the slider min/max change to `sliderMin`/`sliderMax`, the existing `thumbValuesFromParams` returns values clamped to original `bounds`. A value like `bounds.minUah=1273` would be returned, which is between `sliderMin=1250` and `sliderMax`, so it IS within the new slider range. No drift issue.
**Why it happens:** Could arise if `bounds.minUah < sliderMin` (impossible by construction: `sliderMin = floor(minUah/50)*50 ≤ minUah`).
**How to avoid:** The math guarantees `sliderMin ≤ bounds.minUah ≤ bounds.maxUah ≤ sliderMax`, so `thumbValues` always falls within the slider range.

### Pitfall 4: Multiple embed URL formats missed
**What goes wrong:** New embed URL formats not covered by the detection function still return embed URLs.
**Why it happens:** Google Maps has multiple embed formats including short `goo.gl/maps` links.
**How to avoid:** The check covers the two primary patterns (`output=embed` param and `/maps/embed` path). Short links (`goo.gl`) are not embed URLs — they redirect to navigable pages. If `address.mapUrl` starts with `https://goo.gl/` it is safe to return as-is.

---

## Code Examples

### Existing slider usage in catalog-filters.tsx (current — shows what changes)

```tsx
// Source: src/components/catalog/catalog-filters.tsx [VERIFIED: codebase]
<Slider
  className="mt-3"
  min={bounds.minUah}   // ← CHANGE: use sliderMin
  max={bounds.maxUah}   // ← CHANGE: use sliderMax
  step={PRICE_STEP_UAH}
  value={thumbValues}
  aria-label="Діапазон ціни"
  onValueChange={(value) => { ... }}
  onValueCommitted={(value) => { ... }}
/>
```

### Existing syncPriceToUrl snap-back logic (no change needed)

```tsx
// Source: src/components/catalog/catalog-filters.tsx [VERIFIED: codebase]
const atMin = cinaVid <= bounds.minUah;  // compare to REAL bounds, not slider props — correct
const atMax = cinaDo >= bounds.maxUah;   // compare to REAL bounds, not slider props — correct
void setParams({
  cinaVid: atMin && atMax ? null : atMin ? null : cinaVid,
  cinaDo: atMin && atMax ? null : atMax ? null : cinaDo,
  storinka: 1,
});
```

### Current addressExternalMapUrl (shows the bug)

```typescript
// Source: src/lib/catalog/store-map.ts [VERIFIED: codebase]
export function addressExternalMapUrl(address: PublicStoreAddress): string {
  if (address.mapUrl) return address.mapUrl;  // ← BUG: returns embed URL if that's what's stored
  ...
}
```

### Reduced-motion CSS pattern from Next.js official docs

```css
/* Source: node_modules/next/dist/docs/01-app/02-guides/view-transitions.md [VERIFIED: codebase] */
@media (prefers-reduced-motion: reduce) {
  ::view-transition-old(*),
  ::view-transition-new(*),
  ::view-transition-group(*) {
    animation-duration: 0s !important;
    animation-delay: 0s !important;
  }
}
/* Adapted for CSS class-based animations: */
@media (prefers-reduced-motion: reduce) {
  .page-transition {
    animation-duration: 0s !important;
    animation-delay: 0s !important;
  }
}
```

---

## State of the Art

| Old Approach | Current Approach | Notes |
|--------------|------------------|-------|
| `react.ViewTransition` (canary) | CSS `@keyframes` + `@media prefers-reduced-motion` | ViewTransition is not in React 19.2.4 stable; CSS-only is the correct approach for this stack |
| Framer Motion page transitions | CSS animation on layout wrapper | Framer Motion not in project; CSS approach has zero bundle cost |

---

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | The Google Maps embed URL formats detected by `isEmbedMapUrl` cover the URL stored in the database (i.e., the admin saved an `output=embed` or `/maps/embed` URL) | Pattern 3 / BUG-25 | If a different format was stored, the fix may not trigger. Mitigation: add a `target="_blank"` check in manual verification to confirm the link opens Google Maps properly |
| A2 | `bounds.minUah` and/or `bounds.maxUah` are not always multiples of 50 (the trigger for SLIDER-01) | Pattern 1 / SLIDER-01 | If they are always multiples of 50 in practice, the fix is still correct (no-op for those cases) — low risk |

---

## Open Questions

1. **Are there other embed URL formats in use?**
   - What we know: The database has `mapUrl` as a free-text URL field. Two embed formats are covered.
   - What's unclear: Whether the operator used a different embed format (e.g., `maps.app.goo.gl` short links, which are NOT embed URLs).
   - Recommendation: Verify during visual verification by checking the address URL in the Neon DB admin panel before shipping.

2. **Should sliderMin/sliderMax affect the text inputs below the slider?**
   - What we know: The `<input type="number">` fields use `min={bounds.minUah}` and `max={bounds.maxUah}` for HTML validation, not for slider alignment.
   - What's unclear: If the user types 1250 in an input with `min=1273`, HTML validation shows an error.
   - Recommendation: Keep inputs using `bounds.minUah`/`bounds.maxUah` — HTML validation should reflect real catalog bounds, not the padded slider range.

---

## Environment Availability

> Step 2.6: SKIPPED — no external dependencies. All changes are to existing source code files. No CLI tools, services, or databases need to be provisioned for this phase.

---

## Validation Architecture

### Test Framework

| Property | Value |
|----------|-------|
| Framework | Vitest 4.1.6 |
| Config file | `vitest.config.ts` |
| Quick run command | `npx vitest run src/lib/catalog/store-map.test.ts` |
| Full suite command | `npx vitest run` |

### Phase Requirements → Test Map

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| SLIDER-01 | `normalizeSliderBounds({minUah:1273, maxUah:7890})` → `{sliderMin:1250, sliderMax:7900}` | unit | `npx vitest run src/components/catalog/catalog-filters.test.ts` | ❌ Wave 0 |
| SLIDER-01 | Equal bounds: `{minUah:1000, maxUah:1000}` → `sliderMin=1000, sliderMax=1050` | unit | `npx vitest run src/components/catalog/catalog-filters.test.ts` | ❌ Wave 0 |
| SLIDER-01 | Already-aligned bounds: `{minUah:1000, maxUah:5000}` → `sliderMin=1000, sliderMax=5000` | unit | `npx vitest run src/components/catalog/catalog-filters.test.ts` | ❌ Wave 0 |
| BUG-25 | `addressExternalMapUrl` with embed URL → returns text-search URL | unit | `npx vitest run src/lib/catalog/store-map.test.ts` | ❌ Wave 0 |
| BUG-25 | `addressExternalMapUrl` with normal URL → returns original URL unchanged | unit | `npx vitest run src/lib/catalog/store-map.test.ts` | ❌ Wave 0 |
| BUG-25 | `addressExternalMapUrl` with lat/lng + embed URL → returns lat/lng URL | unit | `npx vitest run src/lib/catalog/store-map.test.ts` | ❌ Wave 0 |
| ANIM-01 | Animation respects prefers-reduced-motion | manual | — | manual-only (CSS media query) |

### Sampling Rate

- **Per task commit:** `npx vitest run src/lib/catalog/store-map.test.ts src/components/catalog/catalog-filters.test.ts`
- **Per wave merge:** `npx vitest run`
- **Phase gate:** Full suite green before `/gsd:verify-work`

### Wave 0 Gaps

- [ ] `src/lib/catalog/store-map.test.ts` — covers BUG-25 `addressExternalMapUrl` cases
- [ ] `src/components/catalog/catalog-filters.test.ts` — covers SLIDER-01 `normalizeSliderBounds` helper

*(Existing `src/lib/catalog/search-params.test.ts` and `src/lib/catalog/catalog-labels.test.ts` require no changes.)*

---

## Security Domain

> `security_enforcement` is not explicitly false in `.planning/config.json`, so this section is included.

### Applicable ASVS Categories

| ASVS Category | Applies | Control |
|---------------|---------|---------|
| V2 Authentication | no | Phase has no auth changes |
| V3 Session Management | no | Phase has no session changes |
| V4 Access Control | no | No new routes or data access |
| V5 Input Validation | yes — partial | `addressExternalMapUrl` uses `new URL(url)` for embed detection; malformed `mapUrl` in DB is safely caught by `try/catch` |
| V6 Cryptography | no | No cryptographic operations |

### Known Threat Patterns

| Pattern | STRIDE | Mitigation |
|---------|--------|------------|
| Open redirect via `mapUrl` | Spoofing / Elevation | `addressExternalMapUrl` only returns `address.mapUrl` for non-embed URLs stored in DB; no user-supplied URLs are ever rendered as href — admin-only input. Risk is low but should be noted. |

---

## Sources

### Primary (HIGH confidence)

- `node_modules/@base-ui/react/slider/root/SliderRoot.d.ts` — `step` prop semantics and `onValueChange`/`onValueCommitted` API [VERIFIED: codebase]
- `node_modules/next/dist/docs/01-app/02-guides/view-transitions.md` — `@media prefers-reduced-motion` CSS pattern for animations [VERIFIED: codebase]
- `node_modules/next/dist/docs/01-app/03-api-reference/05-config/01-next-config-js/viewTransition.md` — `experimental.viewTransition` requires React ViewTransition component [VERIFIED: codebase]
- `node_modules/tw-animate-css/dist/tw-animate.css` — `@keyframes enter`, `fade-in`, `animate-in` utilities available [VERIFIED: codebase]
- `src/components/catalog/catalog-filters.tsx` — current slider implementation [VERIFIED: codebase]
- `src/lib/catalog/store-map.ts` — current `addressExternalMapUrl` bug [VERIFIED: codebase]
- `src/app/(storefront)/layout.tsx` — current layout structure [VERIFIED: codebase]
- `src/app/globals.css` — no existing page-level animations [VERIFIED: codebase]

### Secondary (MEDIUM confidence)

- React 19.2.4 runtime inspection: `React.ViewTransition === undefined` — confirmed ViewTransition not in this release [VERIFIED: node_modules/react]

### Tertiary (LOW confidence / ASSUMED)

- Google Maps embed URL formats (two patterns covered): the specific URL the admin stored in `mapUrl` is [ASSUMED] to match one of the covered patterns (see Assumptions Log A1)

---

## Metadata

**Confidence breakdown:**

- SLIDER-01 fix: HIGH — root cause confirmed by reading `SliderRoot.d.ts` step semantics and tracing `normalizeThumbRange` / `syncPriceToUrl` logic
- ANIM-01 approach: HIGH — CSS-only approach confirmed by React 19.2.4 runtime check; `prefers-reduced-motion` pattern from official Next.js docs
- BUG-25 fix: HIGH for approach; MEDIUM for specific embed URL format (see Assumptions Log)

**Research date:** 2026-05-23
**Valid until:** 2026-06-22 (Next.js 16.x and React 19.x stable channel — stable for 30 days)
