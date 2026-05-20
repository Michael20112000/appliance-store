---
phase: 28
slug: nav-homepage-catalog-labels
status: draft
shadcn_initialized: true
preset: base-nova (style), neutral baseColor, cssVariables, lucide icons — from components.json
created: 2026-05-20
---

# Phase 28 — Nav, homepage & catalog labels — UI Design Contract

> Visual and interaction contract for NAV-01, HOME-04, HOME-05, CAT-02. Generated from `28-CONTEXT.md` (D-01…D-21), Phase 26 UI patterns, codebase. Storefront only — admin layout unaffected.

---

## Design System

| Property | Value |
|----------|-------|
| Tool | shadcn (initialized) |
| Preset | `base-nova`, `neutral`, CSS variables — `components.json` |
| Component library | Base UI primitives via `@/components/ui/*` |
| Icon library | lucide-react |
| Font | Project `--font-sans` (`globals.css`) |
| Toast | sonner — unchanged this phase |

**Registry:** shadcn official only (`registries: {}`). No third-party blocks this phase.

---

## Spacing Scale

Project-standard 8pt scale (Tailwind multiples of 4):

| Token | Value | Usage in this phase |
|-------|-------|---------------------|
| xs | 4px | Badge internal padding (default shadcn) |
| sm | 8px | Auth link row `gap-1`; title+badge row `gap-2` |
| md | 16px | Drawer list `gap-2`; drawer horizontal padding `px-4` |
| lg | 24px | Drawer separator margins `my-6` |
| xl | 32px | — |
| 2xl | 48px | — |
| 3xl | 64px | — |

**Exceptions:**

- Touch targets: auth links and drawer category links — **min-height 44px** (`min-h-11`), matching `StoreHeaderAuth` and Phase 26 drawer rows.
- **`scroll-margin-top` on `#kategorii`:** **72px** (`scroll-mt-[4.5rem]` or `4.5rem`) — compensates sticky header (`py-3` + ~44px row). Executor may tune ±4px; prefer CSS variable `--store-header-offset: 4.5rem` if header height is centralized later (D-21 discretion).

---

## Typography

| Role | Size | Weight | Line height | Usage |
|------|------|--------|-------------|-------|
| Body | 14px (`text-sm`) | 400 | 1.5 | Drawer category links, auth links, sort select trigger |
| Label | 14px (`text-sm`) | 500 (`font-medium`) | 1.5 | Auth text links (`linkClass` in header) |
| Heading | 16px (`text-base`) | 600 (`font-semibold`) | 1.2 | Homepage `CardTitle` (unchanged) |
| Display | — | — | — | Not used this phase |

**Badge text:** 12px (`text-xs`, shadcn Badge default) — category count on homepage cards and drawer (drawer unchanged).

**Weights in phase:** 400 (body), 500 (auth links), 600 (card titles only).

---

## Color

Uses existing CSS variables (`globals.css`). No new tokens.

| Role | Token / class | Usage (60/30/10) |
|------|---------------|-------------------|
| Dominant (60%) | `bg-background` | Page, sticky header shell |
| Secondary (30%) | `bg-muted`, `border-border` | Category card image placeholder, card shells |
| Muted text | `text-muted-foreground` | Count badges (homepage + drawer) |
| Foreground | `text-foreground` | Category names, auth text links |
| Accent (10%) | `bg-primary`, `text-primary-foreground` | **Only** guest «Реєстрація» link/button treatment (same as header) |
| Destructive | — | **Not used** this phase |

**Accent reserved for:** guest registration CTA in header **and** drawer auth block (`bg-primary text-primary-foreground hover:bg-primary/90`). Sort select, category badges, and «Увійти» / «Кабінет» links are **not** accent-filled.

**Category count badges:** `Badge variant="secondary"` + `text-muted-foreground`; multi-count (≥2) add `tabular-nums` (D-13, D-21 discretion).

---

## Scope

| Surface | In scope |
|---------|----------|
| `StoreMobileNav` | Auth block below callback form; session prop |
| `StoreHeaderAuth` / shared `StorefrontAuthLinks` | Extract or `variant="drawer"` — visual parity with header |
| `StoreHeader` | Pass `session` to mobile nav (no header auth removal) |
| `globals.css` (or storefront-scoped CSS) | Smooth scroll + `#kategorii` scroll-margin + reduced-motion |
| `CategoryGrid` | Count badge inline with `CardTitle` |
| `catalog-labels.ts` + `catalog-toolbar.tsx` | Sort label copy only |
| Tests | `catalog-labels.test.ts`; optional badge formatter test |

**Out of scope:** PDP/card hover (Phase 29), footer layout (Phase 30), brand/filter label sweep, sort URL keys, drawer category count UX changes, homepage grid layout changes, removing duplicate header auth on mobile.

---

## Mobile drawer auth (`StoreMobileNav`, NAV-01)

### Structure (top → bottom inside `SheetContent`)

1. `SheetHeader` / `SheetTitle` — **«Категорії»** (unchanged)
2. Category list (`ul`, `mt-4 flex flex-col gap-2 px-4`) — unchanged from Phase 26
3. `Separator` — `className="my-6"`
4. `CallbackRequestForm` — `compact`, `idPrefix="drawer"`, `className="px-4"` wrapper (unchanged)
5. **`Separator` — `className="my-6"`** (new, between callback and auth)
6. **Auth block** — `div` with `px-4 pb-4` (or equivalent padding so links align with form)

**Desktop header:** unchanged; drawer trigger stays `md:hidden`. Auth remains in header for users who prefer it (D-06).

### Auth block visual spec

Reuse **`StoreHeaderAuth`** patterns via shared component or `variant`:

| Session | Elements | Layout | Classes (match header) |
|---------|----------|--------|-------------------------|
| **Guest** | «Увійти» + «Реєстрація» | Horizontal row, `flex items-center gap-1` (or `gap-2` if drawer feels tight) | Text link: `inline-flex min-h-11 min-w-11 items-center justify-center rounded-md px-2 text-sm font-medium hover:bg-muted`. Registration: same + `bg-primary text-primary-foreground hover:bg-primary/90` |
| **Signed-in** | «Кабінет» + «Вийти» | Horizontal row, `flex items-center gap-1` | Cabinet: text link (same `linkClass`). Sign-out: `Button variant="outline" size="sm" className="min-h-11"` |

**Targets (unchanged):**

| Link | href / action |
|------|----------------|
| Увійти | `/uviity` |
| Реєстрація | `/reiestratsiia` |
| Кабінет | `/kabinet` |
| Вийти | `authClient.signOut()` → `/` + refresh (same as header) |

**Drawer behavior:** clicking any auth `Link` closes sheet via existing `pathname` `useEffect` (same as category links). Sign-out button does not need explicit close — navigation refreshes layout.

**Empty / edge:** auth block always renders (guest or signed-in); no loading skeleton (session snapshot from server).

---

## Smooth scroll to `#kategorii` (HOME-04)

### CSS contract (`globals.css` recommended)

Scope smooth scroll to **storefront only** — admin routes must not inherit:

```css
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

| Property | Value | Rationale |
|----------|-------|-----------|
| Mechanism | CSS `scroll-behavior: smooth` on `html` | D-08 — no JS scroll hijack |
| Scope | `html:has(#main-content)` | Storefront layout already sets `id="main-content"` on `<main>` |
| Target | `#kategorii` on `CategoryGrid` `<section>` | Existing id; hero CTA `href="/#kategorii"` unchanged |
| Header offset | `4.5rem` (72px) default | Sticky header ~68px; small buffer for blur/border |
| Reduced motion | `scroll-behavior: auto` | D-10 — instant jump for `prefers-reduced-motion: reduce` |

**Visual change:** none beyond scroll motion and landing position (section heading fully visible below sticky header).

**Applies globally on storefront:** all in-page `#` anchors benefit (D-07), not only hero CTA.

---

## Homepage category counts (`CategoryGrid`, HOME-05)

### Card header row (D-12, D-13)

Replace lone `CardTitle` with a flex row:

```text
<div className="flex min-w-0 items-center gap-2">
  <CardTitle className="truncate text-base">{category.name}</CardTitle>
  <Badge variant="secondary" className="shrink-0 text-muted-foreground [tabular-nums when count >= 2]">
    {badgeContent}
  </Badge>
</div>
```

| Count | Badge content | Example |
|-------|---------------|---------|
| `1` | **`1 товар`** | Singular UA string (locked) |
| `≥ 2` | **Digits only** | `12`, `3` — no «товарів» suffix |

**Data:** `productCount` from `listCategoriesWithProductCounts()`; only categories with `productCount > 0` render (Phase 25 filter unchanged).

**`CardDescription`:** keep **«Переглянути»** — count is additive (D-15).

**Parity note:** drawer badges stay numeric-only for all counts (Phase 26); homepage uses hybrid rule above intentionally (D-13).

### Badge styling

| Property | Spec |
|----------|------|
| Variant | `secondary` |
| Text | `text-muted-foreground` |
| Multi-count | `tabular-nums` (recommended D-21) |
| Singular «1 товар» | no `tabular-nums` required |
| Position | Immediately after title in same row; title truncates first |

**Empty grid:** section not rendered (`return null`) — unchanged.

---

## Catalog sort labels (CAT-02)

### Label map (visual only — URL keys unchanged)

| Key | Old label (remove) | New label (locked) |
|-----|-------------------|-------------------|
| `novi` | Новіші | **Найновіші** |
| `cina-desc` | Ціна ↓ | **Дорожче** |
| `cina-asc` | Ціна ↑ | **Дешевше** |

**Source of truth:** `CATALOG_SORT_LABELS` in `catalog-labels.ts`. **`catalog-toolbar.tsx`** must use `catalogSortLabel()` for both `SelectValue` and every `SelectItem` — remove hardcoded duplicate strings (D-18).

### Select visual spec (unchanged layout)

| Element | Spec |
|---------|------|
| Trigger | `SelectTrigger className="w-36"`, `aria-label="Сортування"` |
| Trigger text | `catalogSortLabel(params.sort)` |
| Items | Three options only; values `novi`, `cina-asc`, `cina-desc` |
| Typography | `text-sm` (inherited) |
| Width | `w-36` — may need `w-40` if «Найновіші» truncates; executor verifies no ellipsis at default zoom |

**No SEO/title changes** — sort label appears only in toolbar (D-19).

---

## Copywriting Contract

| Element | Copy (UA, locked) |
|---------|-------------------|
| Drawer sheet title | Категорії |
| Guest: sign in | Увійти |
| Guest: register | Реєстрація |
| Signed-in: account | Кабінет |
| Signed-in: sign out | Вийти |
| Homepage badge (count = 1) | 1 товар |
| Homepage badge (count ≥ 2) | `{n}` (digits only) |
| Homepage card description | Переглянути |
| Sort: newest | Найновіші |
| Sort: price high | Дорожче |
| Sort: price low | Дешевше |
| Sort trigger aria | Сортування |
| Hero CTA (unchanged) | Переглянути категорії |

| Element | Copy |
|---------|------|
| Empty state (drawer categories) | **None** — empty list, callback + auth still shown |
| Empty state (homepage categories) | **None** — section omitted |
| Error state | **N/A** — no new forms or async UI |
| Destructive confirmation | **N/A** — sign-out matches header (no extra confirm) |

---

## Component Inventory

| Component | Source | Notes |
|-----------|--------|-------|
| `Badge` | `@/components/ui/badge` | Homepage counts; drawer counts unchanged |
| `Button` | `@/components/ui/button` | Drawer «Вийти» |
| `Separator` | `@/components/ui/separator` | Second separator before auth |
| `Sheet*` | `@/components/ui/sheet` | Existing mobile nav |
| `Select*` | `@/components/ui/select` | Sort labels only |
| `Card*` | `@/components/ui/card` | Homepage grid |

**New / refactored (executor):**

- `StorefrontAuthLinks` (or equivalent) — shared header + drawer auth UI
- Update `store-mobile-nav.tsx` — session prop, auth block
- Update `store-header.tsx` — pass session to `StoreMobileNav`
- Update `store-header-auth.tsx` — consume shared component
- Update `category-grid.tsx` — title row + badge
- Update `globals.css` — scroll rules
- Update `catalog-labels.ts`, `catalog-toolbar.tsx`, tests

---

## Registry Safety

| Registry | Blocks Used | Safety Gate |
|----------|-------------|-------------|
| shadcn official | badge, button, separator, sheet, select, card (existing) | not required |
| Third-party | none | — |

---

## Accessibility

| Requirement | Implementation |
|-------------|----------------|
| Menu trigger | Existing `aria-label="Меню"` |
| Sort select | `aria-label="Сортування"` on trigger |
| Auth links | Visible text labels; min 44px touch targets |
| Sign out | `Button type="button"` with visible «Вийти» |
| Reduced motion | `prefers-reduced-motion: reduce` disables smooth scroll |
| Homepage badge | Decorative count; category name remains in `CardTitle` (primary label) |
| Focus | Drawer links/buttons participate in sheet focus trap (shadcn default) |

---

## Responsive

| Breakpoint | Behavior |
|------------|----------|
| `< md` | Drawer visible; auth block at drawer bottom; header auth also visible |
| `≥ md` | Drawer hidden; header auth only; homepage grid `md:grid-cols-4` unchanged |
| Homepage cards | 2-col mobile; badge stays inline with title; title truncates before badge wraps |

---

## Verification (visual / UAT)

1. **Drawer guest:** Open menu on logged-out session → categories → callback → separator → «Увійти» + primary «Реєстрація»; links match header styling and routes.
2. **Drawer signed-in:** «Кабінет» + outline «Вийти»; sign-out behaves like header.
3. **Drawer order:** Auth is **below** callback form, separated by `Separator` — not above categories or between categories and callback.
4. **Header parity:** Desktop/mobile header auth unchanged; drawer is additive entry.
5. **Smooth scroll:** From homepage hero «Переглянути категорії» → `#kategorii` lands with section title visible below sticky header (not hidden under it).
6. **Reduced motion:** With OS «reduce motion» on → anchor jump is instant (no smooth animation).
7. **Storefront scope:** Admin routes do not smooth-scroll all anchors.
8. **Homepage badges:** Single-product category shows **«1 товар»**; multi-product shows digits only; «Переглянути» still present; zero-count categories absent.
9. **Sort labels:** Toolbar shows **Найновіші / Дорожче / Дешевше**; URL params remain `novi`, `cina-asc`, `cina-desc`.
10. **Tests/build:** `npm test` + `npm run build` green.

---

## Checker Sign-Off

- [ ] Dimension 1 Copywriting: PASS
- [ ] Dimension 2 Visuals: PASS
- [ ] Dimension 3 Color: PASS
- [ ] Dimension 4 Typography: PASS
- [ ] Dimension 5 Spacing: PASS
- [ ] Dimension 6 Registry Safety: PASS

**Approval:** pending

---

*Phase: 28-nav-homepage-catalog-labels*  
*Sources: 28-CONTEXT.md (D-01…D-21), 26-UI-SPEC.md (pattern reference), store-mobile-nav, store-header-auth, category-grid, catalog-toolbar, catalog-labels, globals.css, components.json*

## UI-SPEC COMPLETE

**Phase:** 28 - Nav, homepage & catalog labels  
**Design System:** shadcn base-nova / neutral

### Contract Summary
- Spacing: 8pt scale; drawer separators `my-6`; auth/category touch targets 44px; `#kategorii` scroll-margin 4.5rem
- Typography: 3 roles (body 14px, label 14px/500, heading 16px/600); badge 12px
- Color: existing tokens; accent only on «Реєстрація»; badges muted secondary
- Copywriting: 14 locked UA strings; no new empty/error/destructive flows
- Registry: shadcn official only

### File Created
`.planning/phases/28-nav-homepage-catalog-labels/28-UI-SPEC.md`

### Pre-Populated From
| Source | Decisions Used |
|--------|---------------|
| CONTEXT.md | 21 (D-01…D-21) |
| RESEARCH.md | 0 (not provided) |
| components.json | yes (base-nova preset) |
| Phase 26 UI-SPEC | drawer/badge/separator patterns |
| User input | scope + structure directive |

### Ready for Verification
UI-SPEC complete. Checker can now validate.
