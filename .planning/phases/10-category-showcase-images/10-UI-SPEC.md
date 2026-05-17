---
phase: 10
slug: category-showcase-images
status: draft
shadcn_initialized: true
preset: "base-nova · base: neutral · cssVariables · Tailwind v4 · geist (extends Phase 1–2)"
created: 2026-05-17
locale: uk
extends: 02-UI-SPEC.md
---

# Phase 10 — UI Design Contract (Category Showcase Images)

> Зображення категорій на головній (`CategoryGrid`) + адмін-завантаження на `/admin/kategorii/[id]`. **Розширює** Phase 1–2 — токени, типографіка, 60/30/10 і spacing **без змін**. Джерела: `10-CONTEXT.md` (D-10-01–14), `REQUIREMENTS.md` (HOME-01, HOME-02), `02-UI-SPEC.md`, `09-UI-SPEC.md`, код: `category-grid.tsx`, `product-card.tsx`, `product-image-upload.tsx`, `optimized-image.tsx`.

**Out of scope (UI):** banner на `/katalog/[slug]`, кілька фото на категорію, crop UI, media library, drag-drop sortOrder, thumbnail у списку `/admin/kategorii`.

---

## Design System

| Property | Value |
|----------|-------|
| Tool | shadcn/ui (ініціалізовано) |
| Preset | `base-nova`, base `neutral`, `cssVariables: true`, Tailwind v4, font **Geist** |
| Component library | Base UI (via shadcn `base-nova`) |
| Icon library | `lucide-react` — опційно **`ImageOff`** або **`Image`** у placeholder (discretion); admin без нових іконок |
| Font | Geist Sans — без змін |
| Styling | Tailwind v4 + `src/app/globals.css` |
| Theme modes | **Light only** (storefront + admin) |
| Media delivery | `OptimizedImage` / `CldImage` + signed upload `CldUploadWidget` → `/api/upload/sign` |
| Document | `<html lang="uk">` |

**Phase 10 shadcn add:** **none** — reuse `card`, `button`, `alert`, `label`, `input`, `separator` (optional між form і image block).

**Не змінювати** OKLCH токени в `:root` / `@theme`.

---

## Spacing Scale

**Успадковано з Phase 1** — див. `01-UI-SPEC.md` / `02-UI-SPEC.md`.

| Token | Value | Phase 10 usage |
|-------|-------|----------------|
| xs | 4px | Gap між preview thumb і alt field |
| sm | 8px | Admin section internal gaps |
| md | 16px | `CategoryGrid` gap mobile (`gap-4`), card header padding |
| lg | 24px | Section `space-y-6` на admin edit page |
| xl | 32px | H2 «Категорії» margin-bottom на головній |
| 2xl | 48px | — (рідко) |
| 3xl | 64px | — |

**Exceptions (додатково):**

| Exception | Value | Usage |
|-----------|-------|-------|
| Category card image aspect | **4:3** | Як `ProductCard` (D-10-04) |
| Placeholder min height | `min-h-48` | Узгоджено з product card image block |
| Admin preview thumb | **160×120** (4:3) | `aspect-[4/3] w-40` rounded-md border |
| Admin upload button row | `gap-3` | Як `ProductImageUpload` toolbar |
| Section divider | `mt-8 pt-8 border-t` | Між `CategoryForm` і блоком зображення |

---

## Typography

**Успадковано** — 4 розміри, 2 ваги (400, 600).

| Role | Size | Weight | Line height | Phase 10 usage |
|------|------|--------|-------------|----------------|
| Body | 16px | 400 | 1.5 | Placeholder «Без фото», admin hints |
| Label | 14px | 600 | 1.4 | Section H2 «Зображення категорії», alt label |
| Heading | 20px / 24px desktop | 600 | 1.2 | H2 «Категорії» на головній (існуючий `text-2xl`) |
| Display | 28px | 600 | 1.15 | — (не використовувати) |

**Card title на категорії:** `text-base font-semibold` (як `ProductCard` title) — `CardTitle` у `CardHeader` **під** зображенням.

---

## Color

**Успадковано** з Phase 1–2.

| Role | Token | Phase 10 usage |
|------|-------|----------------|
| Dominant (60%) | `--background` | Homepage section, admin page |
| Secondary (30%) | `--card`, `--muted` | Category cards, placeholder `bg-muted` |
| Accent (10%) | `--primary` | Admin **«Завантажити»** primary лише якщо executor обере `default`; рекомендовано **`outline`** для upload (як product) — accent **не** на homepage cards |
| Destructive | `--destructive` | «Прибрати фото», upload/save errors |

**Accent reserved for (Phase 10):**

1. Focus ring на admin upload / alt input / card link
2. **Не** використовувати primary fill на homepage category tiles

**НЕ accent:** category card hover shadow, placeholder text (`text-muted-foreground`), preview border (`border-border`).

### Placeholder (semantic)

| State | Visual |
|-------|--------|
| No `imagePublicId` | `bg-muted` + centered `text-sm text-muted-foreground` **«Без фото»** (як product card) |
| Optional icon | `ImageOff` `size-8` `opacity-50` над текстом — discretion executor |

---

## Copywriting Contract

| Element | Copy |
|---------|------|
| Primary CTA (admin upload) | **«Завантажити»** |
| Secondary CTA (admin remove) | **«Прибрати фото»** |
| Primary CTA (storefront) | — (картка = link на каталог; без окремої кнопки) |
| Empty state (homepage card) | **«Без фото»** (in-place placeholder, не page-level empty) |
| Empty state (admin, no image) | **«Ще немає зображення для головної. Завантажте фото категорії.»** |
| Error state (upload/save) | **«Не вдалося зберегти зображення. Спробуйте ще раз.»** |
| Error state (Cloudinary env) | **«Завантаження фото недоступне: додайте NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME і NEXT_PUBLIC_CLOUDINARY_API_KEY…»** (як `ProductImageUpload`) |
| Destructive confirmation | **«Прибрати фото»** — `window.confirm`: **«Прибрати зображення категорії з головної?»** |

**Microcopy:**

| UI | Copy |
|----|------|
| Homepage section H2 | **«Категорії»** (без змін) |
| Card link `aria-label` | **«{category.name}, категорія»** |
| Image `alt` fallback | **`{category.name} — категорія, Львів`** (D-10-02) |
| Admin section title | **«Зображення категорії»** |
| Admin section hint | **«Показується на головній у блоці «Категорії». Одне фото на категорію.»** |
| Alt field label | **«Опис для доступності (alt)»** |
| Alt placeholder | **«Наприклад: Холодильники — б/у техніка, Львів»** |
| Saving (admin) | **«Збереження…»** на disabled кнопках під час `useTransition` |
| Remove success | **Не toast** — достатньо оновлення preview + homepage revalidate (discretion: Sonner **не** додавати в admin для parity з product images) |

**Прибрати** з поточного `CategoryGrid`: `CardDescription` **«Переглянути»** — замінити візуальним image block (менше шуму, D-10-04).

---

## Registry Safety

| Registry | Blocks Used | Safety Gate |
|----------|-------------|-------------|
| shadcn official | — (reuse only) | not required |
| Third-party | **none** | — |

`registries: {}` у `components.json` — vetting third-party **не потрібен**.

---

## Business Rules (UI-facing)

| Rule | Spec |
|------|------|
| Storage | Prisma `Category.imagePublicId` nullable; optional `imageAlt` |
| Homepage | Показувати image або placeholder — **ніколи** порожню білу картку без блоку |
| Grid | `grid-cols-2 gap-4 md:grid-cols-4` — **без змін** (D-10-07) |
| Link | `/katalog/${slug}` — вся картка клікабельна |
| Admin scope | Лише **edit** `/admin/kategorii/[id]` — не на `novyi` (create спочатку, потім image) |
| Upload | `maxFiles: 1`, `multiple: false`, `signatureEndpoint="/api/upload/sign"` |
| Replace | Новий upload **замінює** попередній `public_id` (не галерея) |
| Clear | «Прибрати фото» → `imagePublicId: null` (+ optional clear `imageAlt` discretion) |
| Revalidate | Після зміни image — `/`, `/admin/kategorii`, `/katalog/${slug}` |

---

## Routing & URL Contract

| Route | Auth | Purpose |
|-------|------|---------|
| `/` (home) | public | `CategoryGrid` з images |
| `/admin/kategorii/[id]` | admin | `CategoryForm` + `CategoryImageUpload` |
| `/katalog/[slug]` | public | **Без** category hero у Phase 10 — лише revalidate target |

---

## Component Inventory (Phase 10)

### Reused from Phase 1–2

| Component | Usage |
|-----------|--------|
| `card`, `CardHeader`, `CardTitle` | Category homepage tiles |
| `button` | Admin upload / remove |
| `alert` | Errors, Cloudinary misconfig |
| `label`, `input` | Alt text |
| `OptimizedImage` | Storefront delivery |
| `CldImage` | Admin preview thumb |
| `CldUploadWidget` | Signed upload |

### Custom components (Phase 10) — **new / delta**

| Component | Path | Responsibility |
|-----------|------|----------------|
| `CategoryGrid` (delta) | `components/home/category-grid.tsx` | Image 4:3 + title under; placeholder |
| `CategoryImageUpload` | `components/admin/category-image-upload.tsx` | Single image upload/clear/preview/alt |

### Page changes

| File | Change |
|------|--------|
| `app/(admin)/admin/kategorii/[id]/page.tsx` | Pass `imagePublicId`, `imageAlt`, `slug` into upload; render section below form |
| `components/home/category-grid.tsx` | Prisma select image fields; layout per spec |

---

## Component Specs

### `CategoryGrid` — homepage category cards (HOME-01)

**Wireframe (per card):**

```
┌─────────────────────────┐
│  [Image 4:3]            │  ← OptimizedImage or placeholder
├─────────────────────────┤
│  Category name          │  ← CardHeader / CardTitle only
└─────────────────────────┘
```

| Property | Spec |
|----------|------|
| Section | `id="kategorii"` `mx-auto max-w-6xl px-4 py-12 sm:px-6` — **без змін** |
| H2 | **«Категорії»** `mb-6 text-2xl font-semibold` |
| Grid | `grid grid-cols-2 gap-4 md:grid-cols-4` — **без змін** |
| Container | `Card` `h-full overflow-hidden pt-0 transition-shadow hover:shadow-md` — як product card shell |
| Link | Зовнішній `Link` обгортає всю картку → `/katalog/${slug}` |
| `aria-label` | **«{name}, категорія»** |
| Image block | `relative aspect-[4/3] min-h-48 w-full bg-muted` |
| With image | `OptimizedImage` `fill` `object-cover` `src={imagePublicId}` |
| `sizes` | **`(max-width: 768px) 50vw, 25vw`** (D-10-05, success criteria #4) |
| `alt` | `imageAlt?.trim()` або **`{name} — категорія, Львів`** |
| Without image | `flex h-full items-center justify-center text-sm text-muted-foreground` — **«Без фото»** |
| Title | `CardHeader` `p-4` → `CardTitle` `text-base font-semibold line-clamp-2` |
| Removed | `CardDescription` «Переглянути» |
| States | default, `hover:shadow-md`, `focus-visible:ring-2 ring-ring` на link |
| Motion | `motion-reduce:transition-none` на shadow |

**Data:** `findMany` з `imagePublicId`, `imageAlt`, `name`, `slug`, `sortOrder` — order unchanged.

---

### `CategoryImageUpload` — admin (HOME-02)

**Reference:** `ProductImageUpload` — спрощена версія: **1 файл**, без grid сортування.

**Placement на `/admin/kategorii/[id]`:**

```
H1 Редагувати категорію
CategoryForm (max-w-lg)
─── border-t mt-8 pt-8 ───
H2 Зображення категорії
hint paragraph
CategoryImageUpload
```

| Property | Spec |
|----------|------|
| Type | **Client component** (`"use client"`) |
| Props | `categoryId: string`, `categorySlug: string`, `categoryName: string`, `initialImagePublicId: string \| null`, `initialImageAlt: string \| null` |
| Wrapper | `section` `aria-labelledby="category-image-heading"` |
| Heading | `h2` `id="category-image-heading"` `text-lg font-semibold` — **«Зображення категорії»** |
| Hint | `p` `text-sm text-muted-foreground` під заголовком |
| Misconfig | Той самий `Alert` pattern що product — early return |
| Preview | Якщо `imagePublicId`: `div` `relative aspect-[4/3] w-40 overflow-hidden rounded-md border` + `CldImage` `crop="fill"` |
| Upload | `CldUploadWidget` `options={{ multiple: false, maxFiles: 1, sources: ["local"] }}` `signatureEndpoint="/api/upload/sign"` |
| Upload button | `Button variant="outline"` **«Завантажити»**; disabled під час pending або якщо widget unavailable |
| On success | Server action `updateCategoryImageAction` з новим `public_id`; replace preview |
| Remove | `Button variant="destructive"` **«Прибрати фото»**; `confirm()` copy з таблиці; action `imagePublicId: null` |
| Alt | Один `Label` + `Input`; save on **blur** або окрема «Зберегти alt» **не** потрібна — blur → action з поточним `imagePublicId` |
| Error | `Alert variant="destructive"` над controls |
| Pending | Disable buttons; optional `aria-busy` на section |
| Count hint | **Не** потрібен `n/8` — замість цього лише hint «одне фото» |

**Layout (admin block):**

```
Зображення категорії
[hint]
[Alert error?]
┌──────────┐
│ preview  │  4:3 w-40 (if image)
└──────────┘
[ Завантажити ]  [ Прибрати фото ]   ← remove only if image exists
Label: Опис для доступності (alt)
[ Input ]
```

| Control | Visibility |
|---------|------------|
| Preview + Remove | Лише коли `imagePublicId != null` |
| Upload | Завжди (replace allowed) |
| Alt input | Завжди на edit page; якщо немає фото — disabled або hidden until first upload (executor: **enabled only when image exists** — простіше) |

---

## States & Interactions

### Storefront

| Surface | Pattern |
|---------|---------|
| Loading homepage | RSC — без skeleton на category grid (швидкий block); optional `Skeleton` `aspect-[4/3]` discretion |
| Missing image | In-card placeholder «Без фото» — не error |
| Broken Cloudinary id | Fallback до placeholder + log server-side (executor) |

### Admin

| Trigger | UI |
|---------|-----|
| No image | Hint + «Завантажити» only |
| Upload in progress | Disable buttons, `Збереження…` |
| Upload fail | Destructive alert |
| Remove confirm cancel | No op |
| Remove success | Preview hidden; placeholder state on next homepage visit |

---

## Mobile-First Patterns

| Pattern | Implementation |
|---------|----------------|
| Homepage grid | 2 cols mobile — image readable at 50vw |
| Card tap | Full card link — min height from `min-h-48` image + title |
| Admin preview | `w-40` fixed; stack buttons `flex-wrap gap-3` |
| Admin page | `px-4` inherited from admin layout — no horizontal scroll |

---

## Responsive

| Surface | Breakpoint | Layout / behavior |
|---------|------------|-------------------|
| `CategoryGrid` | default (`<768px`) | `grid-cols-2` `gap-4`; image `sizes` **50vw** |
| `CategoryGrid` | `md` (`≥768px`) | `md:grid-cols-4`; image `sizes` **25vw** |
| Category card | all | `aspect-[4/3]` + `min-h-48` — не стискати title під зображенням |
| Admin edit | all | Одна колонка: `CategoryForm` `max-w-lg` (form internal), image section **full width** під `border-t` |
| Admin preview thumb | all | `w-40` (`160px`) 4:3 — не scale на mobile |
| Admin actions | `<640px` | `flex flex-wrap gap-3` — кнопки в два ряди за потреби |
| Admin alt input | all | `max-w-md` — не на всю ширину viewport |

**Не змінювати** homepage `max-w-6xl` container — узгоджено з каталогом (Phase 1–2).

---

## Accessibility

| Area | Requirement |
|------|-------------|
| Language | UA copy; `lang="uk"` |
| Category cards | One link per card; `aria-label` з назвою категорії |
| Images | Meaningful `alt` або fallback D-10-02; decorative placeholder icon `aria-hidden` |
| Placeholder text | Visible «Без фото» — не лише колір |
| Admin section | `h2` + `aria-labelledby` на section |
| Alt field | `<Label htmlFor="category-image-alt">` linked to input |
| Upload widget | Trigger — native `Button type="button"` |
| Remove | Confirm dialog (browser) before destructive action |
| Focus | `:focus-visible` на link, buttons, alt input |
| Motion | No parallax/zoom on category images |

---

## Cloudinary (PERF-01)

| Usage | sizes | priority |
|-------|-------|----------|
| CategoryGrid card | `(max-width: 768px) 50vw, 25vw` | false |
| Admin preview | fixed width ~160px | false |

`format="auto"` `quality="auto"` via `OptimizedImage` / `CldImage` defaults.

---

## Traceability

| Requirement | UI-SPEC coverage |
|-------------|------------------|
| HOME-01 | CategoryGrid 4:3, OptimizedImage, placeholder, grid unchanged |
| HOME-02 | CategoryImageUpload, signed widget, admin section copy |
| UI-01 | UA copy throughout |
| UI-02 | Extends Phase 1–2 tokens |
| UI-03 | Mobile-first 2/4 grid |
| PERF-01 | `sizes` on homepage cards |

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

**Phase:** 10 — Category Showcase Images  
**Design System:** shadcn `base-nova` / neutral / Geist (inherited)

### Contract Summary
- Spacing: 8-point scale inherited; 4:3 category tiles; admin preview `w-40`
- Typography: 4 sizes / 2 weights inherited; card title `text-base font-semibold`
- Color: 60/30/10 inherited; `bg-muted` placeholder; destructive only on remove/errors
- Copywriting: 12+ UA strings (placeholder, admin CTAs, confirm, errors, alt)
- Registry: shadcn official reuse only; **no** new shadcn adds

### File Created
`.planning/phases/10-category-showcase-images/10-UI-SPEC.md`

### Pre-Populated From
| Source | Decisions Used |
|--------|----------------|
| `10-CONTEXT.md` | 14 (D-10-01–14) |
| `02-UI-SPEC.md` | ProductCard 4:3, OptimizedImage, tokens |
| `09-UI-SPEC.md` | Format, extends pattern, registry |
| `product-card.tsx` | Placeholder «Без фото», aspect, sizes |
| `product-image-upload.tsx` | CldUploadWidget, Alert, preview pattern |
| `category-grid.tsx` | Current grid/section structure |
| `components.json` | base-nova preset |
| User input | 0 (roadmap-derived CONTEXT) |

### Ready for Verification
UI-SPEC complete. Checker can now validate against 6 dimensions.
