---
phase: 2
slug: catalog-discovery
status: draft
shadcn_initialized: true
preset: "base-nova · base: neutral · cssVariables · Tailwind v4 · geist (extends Phase 1)"
created: 2026-05-17
locale: uk
extends: 01-UI-SPEC.md
---

# Phase 2 — UI Design Contract

> Каталог, пошук, фільтри, картка товару, PDP, SEO-оболонка. **Розширює** Phase 1 — токени, типографіка, 60/30/10 і spacing **не змінюються** без явної причини. Джерела: `01-UI-SPEC.md`, `01-CONTEXT.md` (D-01–D-04), `REQUIREMENTS.md` (CAT-01–07, SEO-01–02), `ROADMAP.md` Phase 2, `research/ARCHITECTURE.md`.

---

## Design System

| Property | Value |
|----------|-------|
| Tool | shadcn/ui (ініціалізовано в Phase 1) |
| Preset | `base-nova`, base `neutral`, `cssVariables: true`, Tailwind v4, font **Geist** |
| Component library | Base UI (via shadcn `base-nova`) |
| Icon library | `lucide-react` |
| Font | Geist Sans (`--font-sans` у layout), fallback `system-ui` |
| Styling | Tailwind v4 + `src/app/globals.css` — **ті самі** `--primary`, `--radius`, spacing |
| Theme modes | **Light only** (D-04) — storefront без `dark:` |
| URL state | **nuqs** 2.8.x — фільтри та пошук у query string (CAT-06) |
| Document | `<html lang="uk">` — без змін |

**Phase 2 shadcn add (executor):**

```bash
npx shadcn@latest add breadcrumb checkbox select slider pagination separator
```

Опційно для галереї PDP (якщо немає власного light carousel): `carousel` — лише official registry.

**Не змінювати** OKLCH токени в `:root` / `@theme` — лише додати utility-класи для catalog-specific (напр. `.price-tabular` через `font-variant-numeric: tabular-nums`).

---

## Spacing Scale

**Успадковано з Phase 1** — див. `01-UI-SPEC.md`. Усі значення кратні 4.

| Token | Value | Phase 2 usage |
|-------|-------|----------------|
| xs | 4px | Gap між badge і ціною на картці |
| sm | 8px | Chip gap, filter row compact |
| md | 16px | Grid gap mobile, filter panel padding |
| lg | 24px | Grid gap desktop, PDP section spacing |
| xl | 32px | Catalog page header margin-bottom |
| 2xl | 48px | Empty state vertical padding |
| 3xl | 64px | — (рідко на catalog) |

**Exceptions (додатково до Phase 1):**

| Exception | Value | Usage |
|-----------|-------|-------|
| Touch target min | 44×44px | Filter chips, gallery thumbs, pagination |
| Product card image aspect | **4:3** | Єдиний ratio сітки каталогу |
| Filter bar sticky offset | `top-16` (64px) | Під sticky header на mobile |
| PDP gallery main aspect | **4:3** mobile / **1:1** optional desktop | Головне фото |
| Thumbnail size | 56×56px | Галерея PDP, `rounded-md` |

---

## Typography

**Успадковано з Phase 1** — 4 розміри, 2 ваги (400, 600).

| Role | Size | Weight | Line height | Phase 2 usage |
|------|------|--------|-------------|----------------|
| Body | 16px | 400 | 1.5 | Опис товару, filter hints |
| Label | 14px | 600 | 1.4 | Filter labels, meta рядок (бренд), breadcrumb |
| Heading | 20px / 24px desktop | 600 | 1.2 | H1 категорії, блок «Схожі» |
| Display | 28px / 36px desktop | 600 | 1.15 | H1 PDP (назва товару) |

**Price typography:**

| Element | Classes | Notes |
|---------|---------|-------|
| Card price | `text-lg font-semibold tabular-nums` | Формат `12 500 ₴` |
| PDP price | `text-2xl md:text-3xl font-semibold tabular-nums` | Під H1 |
| Price filter inputs | `text-base` | Цілі числа UAH, без копійок у UI |

---

## Color

**Успадковано з Phase 1** (`globals.css` + `01-UI-SPEC.md`).

| Role | Token | Phase 2 usage |
|------|-------|----------------|
| Dominant (60%) | `--background` | Сторінки каталогу, PDP |
| Secondary (30%) | `--card`, `--muted` | Product cards, filter panel, skeleton |
| Accent (10%) | `--primary` | Primary CTA, active filter chip, focus ring |
| Destructive | `--destructive` | Помилки завантаження каталогу |

**Accent reserved for (Phase 2):**

1. Primary buttons: «Застосувати фільтри», «Показати результати», «На головну» (error recovery)
2. Active filter chip / selected sort option (filled `bg-primary text-primary-foreground`)
3. Focus ring на search input, slider thumbs, select
4. Посилання в breadcrumb current — **не** accent; останній crumb `text-foreground font-semibold`

**НЕ accent:** condition badges (semantic muted variants), ціни, card borders, inactive chips (`outline` + `bg-background`).

### Condition badge colors (semantic, не primary)

| Enum | UA label | Badge variant |
|------|----------|---------------|
| `LIKE_NEW` | Як нова | `secondary` + optional `border-primary/20` |
| `GOOD` | Добрий стан | `secondary` |
| `FAIR` | Задовільний | `outline` |

---

## Copywriting Contract

| Element | Copy |
|---------|------|
| Primary CTA (catalog empty recovery) | **«Скинути фільтри»** |
| Primary CTA (PDP back) | **«До каталогу»** |
| Search placeholder | **«Пошук за назвою або описом…»** |
| Filter apply (mobile sheet) | **«Показати результати»** |
| Sort label | **«Сортування»** |
| Empty state (no products) heading | **«Товарів не знайдено»** |
| Empty state (no products) body | **«Спробуйте змінити фільтри або скиньте їх, щоб побачити весь каталог.»** |
| Empty state (category empty) heading | **«У цій категорії поки немає товарів»** |
| Empty state (category empty) body | **«Перегляньте інші категорії або поверніться пізніше — асортимент оновлюється.»** |
| Error state (catalog load) | **«Не вдалося завантажити каталог. Перевірте з’єднання та оновіть сторінку.»** |
| Error state (PDP not found) heading | **«Товар не знайдено»** |
| Error state (PDP not found) body | **«Можливо, товар уже продано або посилання застаріло. Перегляньте актуальний каталог.»** |
| Sold / unavailable | Не показувати в UI (CAT-07) — 404 або redirect на каталог |
| Loading (search button) | **«Шукаємо…»** |
| Results count | **«Знайдено: {n}»** / **«Знайдено: {n} товарів»** (plural UA: 1 товар, 2–4 товари, 5+ товарів) |
| Destructive confirmation | **Немає** у Phase 2 |

**Microcopy:**

| UI | Copy |
|----|------|
| Filter: category | **«Категорія»** |
| Filter: brand | **«Бренд»** |
| Filter: price | **«Ціна, ₴»** |
| Filter: condition | **«Стан»** |
| Price from / to | **«Від»** / **«До»** |
| All brands | **«Усі бренди»** |
| Clear filters | **«Скинути»** |
| Breadcrumb root | **«Каталог»** |
| PDP section description | **«Опис»** |
| PDP section specs | **«Характеристики»** (brand, category, condition) |
| SEO location hint (footer/meta) | **«м. Львів»** — без зміни footer Phase 1 |

---

## Registry Safety

| Registry | Blocks Used | Safety Gate |
|----------|-------------|-------------|
| shadcn official | breadcrumb, checkbox, select, slider, pagination, carousel (optional) | not required |
| Third-party | **none** | — |

`registries: {}` у `components.json` — vetting third-party **не потрібен**.

---

## Routing & URL Contract (CAT-06)

| Route | Purpose |
|-------|---------|
| `/katalog` | Повний каталог + пошук + фільтри (query) |
| `/katalog/[categorySlug]` | Каталог у межах категорії (path = `kategoria`) |
| `/tovar/[productSlug]` | Product detail (PDP) |

**Query params (nuqs)** — українські ключі для shareable UA URLs:

| Param | Type | Example | Notes |
|-------|------|---------|-------|
| `q` | string | `?q=lg+холодильник` | Текстовий пошук (CAT-04) |
| `brend` | string | `?brend=Samsung` | Exact brand match |
| `cina-vid` | number | `?cina-vid=5000` | Min price UAH (integer) |
| `cina-do` | number | `?cina-do=15000` | Max price UAH |
| `stan` | string[] | `?stan=GOOD&stan=LIKE_NEW` | Repeat keys або comma — parser у executor |
| `sort` | enum | `novi` \| `cina-asc` \| `cina-desc` | Default: `novi` |
| `сторінка` | number | `?сторінка=2` | Page-based pagination (1-based) |

**Path + query:** На `/katalog/pralky` param `kategoria` **не дублювати** — категорія з path. Фільтри `brend`, `cina-*`, `stan`, `q`, `sort` додаються до URL категорії.

**Canonical:** Category pages — canonical URL без зайвих empty params; `robots` noindex для thin filter combos — executor (SEO plan), UI показує `<link rel="canonical">` via metadata API.

**Back button:** nuqs sync → browser back відновлює фільтри.

---

## Component Inventory (Phase 2)

### shadcn (new)

| Component | Usage |
|-----------|--------|
| `breadcrumb` | Catalog → category → product |
| `checkbox` | Condition multi-select |
| `select` | Brand, sort |
| `slider` | Price range (desktop filter panel); mobile — number inputs |
| `pagination` | Page navigation |
| `carousel` | Optional PDP gallery swipe |

### Reused from Phase 1

| Component | Usage |
|-----------|--------|
| `button` | CTAs, mobile filter trigger |
| `card` | ProductCard wrapper |
| `input` | Search, price min/max |
| `badge` | Condition, «Б/у» optional |
| `skeleton` | Grid + PDP loading |
| `sheet` | Mobile filters drawer |
| `separator` | Filter sections |
| `alert` | Catalog error banner |

### Custom components (Phase 2)

| Component | Path | Responsibility |
|-----------|------|----------------|
| `ProductCard` | `components/catalog/product-card.tsx` | Grid tile: image, title, brand, price, condition |
| `ProductGrid` | `components/catalog/product-grid.tsx` | Responsive grid + empty slot |
| `CatalogToolbar` | `components/catalog/catalog-toolbar.tsx` | Search, sort, filter toggle, results count |
| `CatalogFilters` | `components/catalog/catalog-filters.tsx` | Desktop sidebar / mobile sheet body |
| `CatalogFiltersSheet` | `components/catalog/catalog-filters-sheet.tsx` | Sheet wrapper + apply footer |
| `ActiveFilterChips` | `components/catalog/active-filter-chips.tsx` | Removable chips above grid |
| `ProductGallery` | `components/catalog/product-gallery.tsx` | Main image + thumbnails |
| `ConditionBadge` | `components/catalog/condition-badge.tsx` | UA label from enum |
| `PriceDisplay` | `components/catalog/price-display.tsx` | Format kopiyky → `X XXX ₴` |
| `CatalogSkeleton` | `components/catalog/catalog-skeleton.tsx` | Grid of card skeletons |
| `ProductDetailSkeleton` | `components/catalog/product-detail-skeleton.tsx` | PDP layout skeleton |

---

## Component Specs

### `ProductCard`

**Layout (mobile-first):**

```
┌─────────────────────────┐
│  [Image 4:3]            │
│  ConditionBadge (tl)    │
├─────────────────────────┤
│  Title (2 lines clamp)  │
│  Brand · Label          │
│  Price                  │
└─────────────────────────┘
```

| Property | Spec |
|----------|------|
| Container | `Card` + `overflow-hidden` + `h-full` + `transition-shadow hover:shadow-md` |
| Link | Entire card → `/tovar/[slug]`; `aria-label` = повна назва + ціна |
| Image | `OptimizedImage`, `fill`, `object-cover`, `aspect-[4/3]`, first image `sortOrder` |
| sizes | `(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw` |
| Title | `text-base font-semibold line-clamp-2` |
| Brand | `text-sm text-muted-foreground` |
| Price | `PriceDisplay` |
| Condition | `ConditionBadge` absolute `top-2 left-2` on image |
| States | default, hover (shadow), focus-within ring on link |

**Grid density:**

| Breakpoint | Columns |
|------------|---------|
| default | 2 |
| `md` | 3 |
| `lg` | 4 |

Gap: `gap-4 md:gap-6` (як category grid Phase 1).

---

### `CatalogToolbar`

**Desktop (`md+`):** один ряд — search (flex-1) | sort select | «Фільтри» не потрібна (sidebar visible).

**Mobile:** search full width; рядок: `[Фільтри (N)]` outline + sort icon/select.

| Element | Spec |
|---------|------|
| Search | `Input` + `Search` icon, `type="search"`, submit on Enter + debounce 300ms → nuqs `q` |
| Sort `Select` | Options: Нові спочатку, Ціна ↑, Ціна ↓ |
| Results | `text-sm text-muted-foreground` під toolbar |
| Filter button | `Button variant="outline"` → opens `CatalogFiltersSheet`; badge count active filters |

---

### `CatalogFilters` (desktop sidebar + sheet content)

**Width desktop:** `w-full md:w-64 shrink-0`, sticky `top-20`, `max-h-[calc(100vh-5rem)] overflow-y-auto`.

| Section | Control | Behavior |
|---------|---------|----------|
| Категорія | Links list | На `/katalog` — links to `/katalog/[slug]`; на category page — highlight active |
| Бренд | `Select` | Options from DB distinct brands (available products only) |
| Ціна | `Slider` min-max + 2× `Input type="number"` | Step 500 UAH; max from catalog stats or 100000 cap |
| Стан | `Checkbox` group × 3 | Multi-select → `stan` param |
| Actions | `Скинути` ghost + `Показати результати` primary (mobile only) | Desktop: live apply on change (nuqs push) |

**Active filters:** mirror in `ActiveFilterChips` with `X` remove per chip.

---

### `ProductGallery` (PDP)

| Zone | Spec |
|------|------|
| Main | `aspect-[4/3] md:aspect-square` max, `rounded-xl border`, `OptimizedImage` priority LCP |
| Thumbs | Horizontal scroll row, `gap-2`, 56px, `ring-2 ring-primary` on selected |
| Keyboard | Arrow keys switch image; `aria-label` «Фото {i} з {n}» |
| Single image | Hide thumb row |
| `prefers-reduced-motion` | No autoplay carousel |

---

### `ProductDetail` page blocks

**Layout:**

```
Breadcrumb
┌──────────────────┬──────────────────┐
│ ProductGallery   │ Title (Display)  │
│                  │ Brand            │
│                  │ Price            │
│                  │ ConditionBadge   │
│                  │ Meta (category)  │
└──────────────────┴──────────────────┘
Description (prose)
Specs table (dl)
[Phase 3: Add to cart — not in Phase 2]
```

| Element | Spec |
|---------|------|
| Breadcrumb | `Каталог` → `{Category}` → `{Product title truncated}` |
| H1 | Product `title`, Display typography |
| Category link | Link to `/katalog/[categorySlug]` |
| Description | `prose prose-neutral max-w-none` or `text-base leading-relaxed whitespace-pre-wrap` |
| Specs `dl` | Brand, Category, Condition (UA), SKU optional later |

**Out of scope Phase 2 UI:** кнопка «Додати в кошик» (CART-01 Phase 3), чат (Phase 5).

---

## Page Layouts

### Global

- Той самий `(storefront)/layout.tsx`: `StoreHeader` + `main` + `StoreFooter`
- Container: `mx-auto max-w-6xl px-4 sm:px-6 lg:px-8`
- Header: додати prominent link **«Каталог»** → `/katalog` (desktop nav, mobile sheet top)

---

### `/katalog` — Catalog listing (all products)

**Structure:**

```
CatalogToolbar
┌─────────────┬──────────────────────────────┐
│ Filters     │ ActiveFilterChips (optional)   │
│ (sidebar)   │ ProductGrid                  │
│ md+ only    │ Pagination                   │
└─────────────┴──────────────────────────────┘
```

| Area | Spec |
|------|------|
| H1 | **«Каталог б/у техніки»** |
| Subcopy | One line muted: **«Усі товари в наявності у Львові»** |
| Loading | `CatalogSkeleton` — 8 cards |
| Empty | Copywriting empty state + `Скинути фільтри` primary |
| Error | `Alert destructive` + retry via `router.refresh()` |
| Pagination | Bottom centered; show prev/next + page numbers max 5 visible |

**Data:** лише `isPublished === true` AND `status !== SOLD` (або еквівалент CAT-07 — executor узгодити з Prisma migration).

---

### `/katalog/[categorySlug]` — Category view

- Replace Phase 1 stub (remove «Незабаром» badge)
- H1 = `category.name`
- Optional `category.description` as muted paragraph
- Same grid/filters as `/katalog` with category pre-applied from path
- Empty: category-specific copy
- 404 unknown slug: **«Категорію не знайдено»** (reuse Phase 1 pattern) + link каталог

---

### `/tovar/[productSlug]` — Product detail

| Area | Spec |
|------|------|
| Metadata | `generateMetadata` — title `{product.title} | Техніка б/у Львів`, description truncate 155 chars |
| JSON-LD | `Product` + `Offer` + `itemCondition: UsedCondition` (SEO-02) — server component script |
| 404 / sold | Soft 404 copy; no product card in listings |

**Revalidate:** ISR `revalidate = 3600` or on-demand tag — executor.

---

## States & Interactions

### Loading

| Surface | Pattern |
|---------|---------|
| Catalog grid | `CatalogSkeleton` — 8× card skeleton (`Skeleton` image block + 3 lines) |
| PDP | `ProductDetailSkeleton` — gallery rect + title lines |
| Filter apply | Disable toolbar inputs; optional subtle `opacity-50` on grid |
| Search | Debounce; no full-page flash — keep layout shell |

### Empty

| Trigger | UI |
|---------|-----|
| Filters too narrow | «Товарів не знайдено» + `Скинути фільтри` |
| Empty category | Category-specific heading/body |
| Search no hits | Same as filters + hint «Спробуйте інші ключові слова» |

### Error

| Trigger | UI |
|---------|-----|
| Server error catalog | Alert top + refresh |
| PDP not found | Centered message + **«До каталогу»** primary → `/katalog` |

### Hover / focus

- ProductCard: `hover:shadow-md`, `motion-reduce:transition-none`
- Filter chips: `hover:bg-muted`
- Gallery thumbs: `hover:opacity-80`, focus ring

---

## Mobile-First Patterns

| Pattern | Implementation |
|---------|----------------|
| Filters | `CatalogFiltersSheet` — full-height sheet, sticky footer «Показати результати» |
| Grid | 2 columns always on phone |
| Search | Full width; avoid horizontal scroll on filter chips (`flex-wrap gap-2`) |
| PDP | Stack gallery above info; thumbs horizontal scroll |
| Toolbar sticky | Optional `sticky top-16 z-30 bg-background/95 backdrop-blur py-2` on mobile after scroll |
| Touch | 44px min on chips, pagination, thumbs |

---

## Accessibility

| Area | Requirement |
|------|-------------|
| Language | UA copy; `lang="uk"` |
| Product cards | Single focusable link per card; descriptive `aria-label` |
| Search | `<label class="sr-only">` «Пошук товарів» |
| Filters | Fieldset + legend per group; checkboxes linked with `Label` |
| Slider | `aria-valuemin/max/now`; paired inputs for exact values |
| Gallery | Selected thumb `aria-current="true"`; main image `alt` from product |
| Live region | Optional `aria-live="polite"` on results count update |
| Focus | Visible `:focus-visible` ring; trap focus in filter sheet |
| Motion | `prefers-reduced-motion`: no card translate hover |
| Contrast | Condition badges meet AA on `secondary`/`outline` |
| Pagination | `nav aria-label="Пагінація"`; current page `aria-current="page"` |

---

## SEO UI Hooks (SEO-01, SEO-02)

| Page | metadata | JSON-LD |
|------|----------|---------|
| `/katalog` | title **«Каталог б/у техніки у Львові»**, description з keywords Lviv | `WebSite` + `SearchAction` optional |
| `/katalog/[slug]` | `{category.name} у Львові — б/у техніка` | `BreadcrumbList` |
| `/tovar/[slug]` | `{title} — {brand}, {price} ₴` | `Product`, `Offer`, `BreadcrumbList` |
| Site-wide | — | `LocalBusiness` on home (Phase 2 add if missing): address Lviv, `areaServed` |

**UI-only:** не рендерити прихований keyword stuffing; structured data в `<script type="application/ld+json">` server-side.

---

## Cloudinary (PERF-01)

| Usage | sizes | priority |
|-------|-------|----------|
| ProductCard | `(max-width: 640px) 50vw, 25vw` | false |
| PDP main | `(max-width: 768px) 100vw, 50vw` | **true** (LCP) |
| PDP thumb | `56px` | false |

`alt`: `{title} — {brand}, б/у, Львів` (truncate ~120 chars).

---

## Traceability

| Requirement | UI-SPEC coverage |
|-------------|------------------|
| CAT-01 | ProductCard grid, price, brand, condition |
| CAT-02 | PDP gallery, description, condition |
| CAT-03 | `/katalog/[slug]` category view |
| CAT-04 | Search `q` in toolbar |
| CAT-05 | Filters: category, brand, price, condition |
| CAT-06 | nuqs URL params |
| CAT-07 | Hide sold — empty/404, not in grid |
| SEO-01 | `generateMetadata` per route |
| SEO-02 | JSON-LD Product + LocalBusiness |
| UI-01 | UA copy throughout |
| UI-02 | Extends Phase 1 tokens |
| UI-03 | Mobile-first grid, sheet filters |
| PERF-01 | OptimizedImage sizes per surface |
| AUTH-01 | Catalog public without login |

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

## UI-SPEC COMPLETE

**Phase:** 2 — Catalog & Discovery  
**Design System:** shadcn base-nova (extends Phase 1)

### Contract Summary
- Spacing: Phase 1 scale + catalog exceptions (4:3 cards, 56px thumbs)
- Typography: 4 sizes / 2 weights inherited; tabular nums for prices
- Color: 60/30/10 inherited; condition badges semantic secondary/outline
- Copywriting: 15+ UA strings (search, filters, empty, error, PDP)
- Registry: shadcn official only; 6–7 components to add

### File Created
`.planning/phases/02-catalog-discovery/02-UI-SPEC.md`

### Pre-Populated From
| Source | Decisions Used |
|--------|----------------|
| 01-UI-SPEC.md | Spacing, typography, color, layout shell, OptimizedImage |
| 01-CONTEXT.md | D-01–D-04 light airy, Geist, UA |
| REQUIREMENTS.md | CAT-01–07, SEO-01–02 |
| ROADMAP.md | Phase 2 success criteria, routes |
| components.json / globals.css | base-nova, actual tokens |
| research/ARCHITECTURE.md | Product model, nuqs, `/tovar/[slug]`, condition enum |
| Codebase | store-header, category grid patterns, max-w-6xl |

### Ready for Verification
UI-SPEC complete. Checker can now validate against 6 dimensions.
