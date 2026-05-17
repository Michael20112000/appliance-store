---
phase: 9
slug: wishlist
status: draft
shadcn_initialized: true
preset: "base-nova · base: neutral · cssVariables · Tailwind v4 · geist (extends Phase 1–2)"
created: 2026-05-17
locale: uk
extends: 02-UI-SPEC.md
---

# Phase 9 — UI Design Contract (Wishlist)

> Обране для гостя (localStorage) і залогіненого (БД) **без merge** при логіні. **Розширює** Phase 1–2 — токени, типографіка, 60/30/10 і spacing **без змін**. Джерела: `09-CONTEXT.md` (D-09-01–24), `REQUIREMENTS.md` (WISH-01–05), `03-UI-SPEC.md` (`CartNavLink` badge), `07-UI-SPEC.md` (каталог), код: `product-card.tsx`, `store-header.tsx`, `sonner.tsx`, `add-to-cart-button.tsx`.

**Out of scope (UI):** merge при логіні, push/email про ціну, порівняння, адмінка wishlist, auto-prune sold/draft, синхронізація між пристроями.

---

## Design System

| Property | Value |
|----------|-------|
| Tool | shadcn/ui (ініціалізовано) |
| Preset | `base-nova`, base `neutral`, `cssVariables: true`, Tailwind v4, font **Geist** |
| Component library | Base UI (via shadcn `base-nova`) |
| Icon library | `lucide-react` — **`Heart`** для wishlist (паралельно `ShoppingCart` у кошика) |
| Font | Geist Sans — без змін |
| Styling | Tailwind v4 + `src/app/globals.css` |
| Theme modes | **Light only** |
| Document | `<html lang="uk">` |
| Toasts | `sonner` через `src/components/ui/sonner.tsx` + **новий** `<Toaster />` у storefront layout |

**Phase 9 shadcn add:** **none** — лише `button`, `badge`, `card`, `alert`, `skeleton` (існуючі).

**Не змінювати** OKLCH токени в `:root` / `@theme`.

---

## Spacing Scale

**Успадковано з Phase 1** — див. `01-UI-SPEC.md` / `02-UI-SPEC.md`.

| Token | Value | Phase 9 usage |
|-------|-------|----------------|
| xs | 4px | Gap між Heart і badge edge |
| sm | 8px | Overlay inset from image corner (`right-2 top-2`) |
| md | 16px | Wishlist grid gap mobile, section `mt-4` у кабінеті |
| lg | 24px | Grid gap desktop на `/obrane`, кабінет-прев’ю |
| xl | 32px | H1 margin-bottom `/obrane` |
| 2xl | 48px | Empty state vertical padding |
| 3xl | 64px | — (рідко) |

**Exceptions (додатково):**

| Exception | Value | Usage |
|-----------|-------|-------|
| Touch target min | 44×44px | `WishlistNavLink`, `WishlistToggleButton` (overlay і PDP) |
| Overlay button size | 40×40px visual / 44×44px hit | `size-10` icon button + `min-h-11 min-w-11` tap area |
| Header icon | `size-5` (20px) | Heart у nav — як ShoppingCart у `CartNavLink` |
| Badge pill | `min-w-5 h-5` | Як кошик; cap label **`99+`** (не `9+`) |
| Cabinet preview max cards | 3 | Горизонтальна сітка `grid-cols-1 sm:grid-cols-3` |

---

## Typography

**Успадковано** — 4 розміри, 2 ваги (400, 600).

| Role | Size | Weight | Line height | Phase 9 usage |
|------|------|--------|-------------|----------------|
| Body | 16px | 400 | 1.5 | Empty body, unavailable row hint |
| Label | 14px | 600 | 1.4 | Section «Обране» у кабінеті, badge text |
| Heading | 20px / 24px desktop | 600 | 1.2 | H1 `/obrane`, H2 кабінет «Обране» |
| Display | 28px | 600 | 1.15 | — (не використовувати на wishlist) |

**Money:** `PriceDisplay` + `tabular-nums` на доступних картках; unavailable — ціна прихована або muted без CTA.

---

## Color

**Успадковано** з Phase 1–2.

| Role | Token | Phase 9 usage |
|------|-------|----------------|
| Dominant (60%) | `--background` | `/obrane`, кабінет-прев’ю |
| Secondary (30%) | `--card`, `--muted` | Product cards, overlay scrim, unavailable row |
| Accent (10%) | `--primary` | Filled Heart when active; badge `bg-primary` |
| Destructive | `--destructive` | Toast error (cap exceeded); не для Heart remove |

**Accent reserved for (Phase 9):**

1. **Wishlist badge** count pill (`bg-primary text-primary-foreground`) — як кошик
2. **Heart у стані «в обраному»** — `fill-primary text-primary` (або `fill-current text-primary`)
3. Focus ring на `WishlistToggleButton` / `WishlistNavLink`

**НЕ accent:** outline Heart (не в обраному), unavailable row (muted only), «Дивитись усе» link (`outline`/`link`), Sonner success toast (semantic success — `richColors`, не primary fill на кнопках).

### Unavailable row (semantic, не primary)

| State | Visual |
|-------|--------|
| `SOLD` / `DRAFT` | Card/row `opacity-80`; image optional grayscale `opacity-60`; banner text `text-muted-foreground` |
| No purchase CTA | Немає `AddToCartButton` / «Купити» |

---

## Copywriting Contract

| Element | Copy |
|---------|------|
| Primary CTA (empty `/obrane`) | **«Перейти до каталогу»** → `/katalog` |
| Secondary CTA (cabinet preview) | **«Дивитись усе»** → `/obrane` |
| Toast — add | **«Додано до обраного»** |
| Toast — remove | **«Прибрано з обраного»** |
| Toast — guest cap | **«У обраному вже максимум 20 товарів»** |
| Empty state heading (`/obrane`) | **«Обране порожнє»** |
| Empty state body (`/obrane`) | **«Збережіть б/у техніку з каталогу — сердечко на картці товару.»** |
| Empty state (cabinet preview) | **«Поки нічого в обраному»** + link **«Перейти до каталогу»** |
| Unavailable row | **«Товар більше недоступний»** |
| Error state (list load) | **«Не вдалося завантажити обране. Оновіть сторінку або спробуйте пізніше.»** |
| Destructive confirmation | **Немає modal** — зняття з обраного через Heart + toast «Прибрано з обраного» |

**Microcopy:**

| UI | Copy |
|----|------|
| Page title `/obrane` | **«Обране»** |
| Metadata `title` `/obrane` | **Обране** |
| Cabinet section H2 | **«Обране»** |
| `WishlistNavLink` `aria-label` (empty) | **«Обране, порожній список»** |
| `WishlistNavLink` `aria-label` (count) | **«Обране, {n} товарів»** / **«Обране, 99+ товарів»** |
| `WishlistToggleButton` add | **«Додати до обраного»** (`aria-label` + `aria-pressed="false"`) |
| `WishlistToggleButton` remove | **«Прибрати з обраного»** (`aria-pressed="true"`) |
| Loading toggle (session) | **«Зберігаємо…»** — `aria-busy="true"` (optional sr-only; icon state still updates optimistically per D-09-12) |

---

## Registry Safety

| Registry | Blocks Used | Safety Gate |
|----------|-------------|-------------|
| shadcn official | — (reuse only) | not required |
| Third-party | **none** | — |

---

## Business Rules (UI-facing)

| Rule | Spec |
|------|------|
| Guest storage | Key `appliance-wishlist-guest`, `{ v: 1, items: { productId }[] }`, **MAX_ITEMS = 20** |
| Session storage | Prisma `WishlistItem`; mutations via `requireBuyer` server actions |
| **No merge on login** | Після логіну UI читає **лише БД**; guest key лишається в localStorage «в тіні» (D-09-06) |
| After logout | Badge + `/obrane` знову з guest localStorage (D-09-07) |
| `/obrane` auth | **Public** — гість і session (D-09-03) |
| `/kabinet` preview | **Logged-in only** (`requireBuyer`) — до 3 останніх карток |
| Toggle auth | Гість — client storage only; session — server action + `router.refresh()` |
| Unavailable products | `SOLD` / `DRAFT` — показати рядок, без купівлі; **не** auto-delete (D-09-19–20) |
| Catalog overlay click | `stopPropagation` + `preventDefault` — **не** навігувати на PDP (D-09-09) |
| Icon sync | Heart state оновлюється **синхронно** з toggle, не лише після toast (D-09-12) |

---

## Routing & URL Contract

| Route | Auth | Purpose |
|-------|------|---------|
| `/obrane` | public | Повний список обраного |
| `/kabinet` | required | Прев’ю «Обране» (max 3) + «Дивитись усе» |
| `/tovar/[slug]` | public | PDP + wishlist toggle |
| `/katalog`, `/katalog/[slug]` | public | ProductCard + overlay Heart |

**Metadata:**

| Route | `title` |
|-------|---------|
| `/obrane` | Обране |

---

## Layout Integration

### Storefront `Toaster` (D-09-21, D-09-22)

У `src/app/(storefront)/layout.tsx` додати **після** `</main>` або всередині fragment **перед** footer:

```tsx
import { Toaster } from "@/components/ui/sonner";

// у layout JSX:
<Toaster position="top-center" richColors closeButton />
```

**Не додавати** `WishlistPendingMergeGate` (анти-патерн `CartPendingMergeGate`).

### Global header (D-09-04)

```
Logo | Nav… | [WishlistNavLink] [CartNavLink?] | Кабінет/Увійти
```

| Element | Visibility |
|---------|------------|
| `WishlistNavLink` | **Усі** відвідувачі (гість + session) |
| `CartNavLink` | Лише session (існуюча поведінка Phase 3) |

**Порядок у `store-header.tsx`:** `StoreMobileNav` → `WishlistNavLink` → `{session ? <CartNavLink /> : null}` → `StoreHeaderAuth`.

**Mobile sheet (`StoreMobileNav`):** опційно додати пункт **«Обране»** → `/obrane` з Heart icon на початку списку (після SheetTitle) — discretion executor; не блокер.

---

## Component Inventory (Phase 9)

### Reused from Phase 1–3

| Component | Usage |
|-----------|--------|
| `button` | Overlay Heart (`variant="secondary"` або `outline` + `bg-background/80`) |
| `badge` | Nav count pill |
| `card` | Product cards, unavailable rows |
| `alert` | List load error |
| `skeleton` | `/obrane` loading grid |
| `ProductCard` | Available items grid (refactor for overlay) |
| `ProductGrid` | `/obrane` layout pattern |
| `PriceDisplay`, `ConditionBadge`, `OptimizedImage` | Як каталог |
| `Toaster` (`ui/sonner`) | Storefront toasts |

### Custom components (Phase 9) — **new**

| Component | Path | Responsibility |
|-----------|------|----------------|
| `WishlistNavLink` | `components/wishlist/wishlist-nav-link.tsx` | Client: Heart + badge → `/obrane`; guest localStorage vs session count |
| `WishlistToggleButton` | `components/wishlist/wishlist-toggle-button.tsx` | Toggle add/remove; overlay + PDP variants; Sonner toasts |
| `WishlistPageContent` | `components/wishlist/wishlist-page-content.tsx` | `/obrane` grid + unavailable rows + empty |
| `WishlistUnavailableCard` | `components/wishlist/wishlist-unavailable-card.tsx` | Sold/draft row з copy D-09-19 |
| `WishlistCabinetPreview` | `components/wishlist/wishlist-cabinet-preview.tsx` | Max 3 cards + «Дивитись усе» |
| `ProductCard` (delta) | `components/catalog/product-card.tsx` | Image wrapper `relative` + slot для overlay |

### New routes

| File | Responsibility |
|------|----------------|
| `app/(storefront)/obrane/page.tsx` | RSC shell: resolve guest vs session list, render `WishlistPageContent` |

### Layout changes

| File | Change |
|------|--------|
| `components/layout/store-header.tsx` | Insert `WishlistNavLink` for all visitors |
| `app/(storefront)/layout.tsx` | Add `<Toaster position="top-center" richColors />` |
| `app/(storefront)/kabinet/page.tsx` | Section «Обране» + `WishlistCabinetPreview` above orders |
| `app/(storefront)/tovar/[slug]/page.tsx` | `WishlistToggleButton` variant `inline` біля `AddToCartButton` |
| `components/catalog/product-grid.tsx` | Pass `productId` / wishlist state into card (or client wrapper) |

---

## Component Specs

### `WishlistNavLink` (header)

**Reference:** `CartNavLink` (`03-UI-SPEC.md`) — **відмінності:** visible для гостя, cap **`99+`**.

| Property | Spec |
|----------|------|
| Type | **Client component** (`"use client"`) — guest count з localStorage |
| Control | `Link href="/obrane"` + `Heart` lucide `size-5` |
| Wrapper class | `relative inline-flex min-h-11 min-w-11 items-center justify-center rounded-md px-3 text-sm font-medium hover:bg-muted` — **ідентично** cart link |
| Badge | `absolute -right-0.5 -top-0.5 min-w-5 justify-center px-1 text-[10px] font-semibold rounded-full bg-primary text-primary-foreground` |
| Badge visibility | **Приховати**, коли `count === 0` (не показувати `0`) |
| Badge cap | `count > 99 ? "99+" : String(count)` |
| Session data | Optional prop `initialCount` з server (`getWishlistCount(userId)`) у `StoreHeader`; client `useEffect` sync guest |
| Guest data | `getGuestWishlistCount()` on mount + `storage` event / custom event після toggle |
| Active route | `aria-current="page"` на `/obrane` |
| Login switch | On session change: recount from DB API or prop refresh — **не** читати guest key |

**Data flow:**

```
[Header mount]
  ├─ session? ──yes──► display DB count (server initial + refresh after toggle)
  └─ no ──► read localStorage count
[Toggle elsewhere] ──► dispatch wishlist-changed ──► NavLink updates badge
```

---

### `WishlistToggleButton`

| Property | Spec |
|----------|------|
| Props | `productId`, `productTitle`, `hasSession`, `initialInWishlist?`, `variant: "overlay" \| "inline"` |
| Icon | `Heart` — outline `stroke-2` when off; on: `fill-primary text-primary` |
| Overlay variant | `absolute right-2 top-2 z-10`; `Button` `size="icon"` `variant="secondary"` + `bg-background/90 shadow-sm backdrop-blur-sm` |
| Inline variant (PDP) | `Button variant="outline" className="min-h-11 w-full sm:w-auto"` + Heart `mr-2 size-4`; **без** absolute positioning |
| Click overlay | `onClick={(e) => { e.preventDefault(); e.stopPropagation(); ... }}` |
| Guest add | `addGuestWishlistItem(productId)` → update local state → toast success; cap → toast error UA |
| Guest remove | `removeGuestWishlistItem` → toast remove |
| Session | `addToWishlistAction` / `removeFromWishlistAction` + `useTransition` + `router.refresh()` |
| State | `aria-pressed={inWishlist}`; labels з copy table |
| Optimistic | Set `inWishlist` **immediately** on click; revert on action error + error toast |
| Disabled | `disabled={isPending}` only; sold PDP: toggle **дозволений** (користувач може прибрати з обраного) |

**Overlay on `ProductCard` (delta wireframe):**

```
┌─────────────────────────┐
│  [Image 4:3]      [♥]  │  ← top-right overlay
│  ConditionBadge (tl)    │
├─────────────────────────┤
│  Title …                │
└─────────────────────────┘
```

**PDP placement** — у `flex flex-col gap-3` з `AddToCartButton`:

```
[ AddToCartButton ]
[ WishlistToggleButton inline ]
[ OpenChatButton ]
```

---

### `ProductCard` (delta for Phase 9)

| Property | Spec |
|----------|------|
| Structure | Зовнішній `div` `group h-full` → `Link` лише на image+text **або** Link з `relative` image block і toggle **поза** посиланням |
| Recommended | Split: `Link` wraps card body; image container `relative` містить `Link` для image click **і** sibling `WishlistToggleButton` **outside** inner link — simplest: wrapper `div.relative` > `Link.block` (image) + absolute toggle sibling |
| Executor discretion | `ProductCardWithWishlist` wrapper acceptable якщо не ламає grid keys |
| Pass-through | `productId`, `initialInWishlist?`, `hasSession` |

---

### `/obrane` — Wishlist page (D-09-01, D-09-03)

**Structure:**

```
H1 Обране
[optional Alert error]
┌─ available: ProductGrid (same cols as catalog) ─┐
├─ unavailable: WishlistUnavailableCard × n ─────┤
└─ empty: centered empty state ───────────────────┘
```

| Area | Spec |
|------|------|
| Container | `mx-auto max-w-6xl px-4 py-12 sm:px-6` (як каталог/PDP) |
| H1 | **«Обране»** — Heading typography |
| Grid (available) | `grid grid-cols-2 gap-4 md:grid-cols-4 md:gap-6` — **як** `product-grid.tsx` |
| Order | Available first (за `addedAt` desc); unavailable block **нижче** з `mt-8` + subheading **«Недоступні»** (`text-lg font-medium`) якщо є обидва типи |
| Loading | `CatalogSkeleton` або 4× card skeleton |
| Empty | Heading + body + primary **«Перейти до каталогу»** |
| Guest | Client fetch product metadata by IDs from storage **або** server action `resolveGuestWishlistProducts` |
| Session | Server `listWishlistForUser` |

---

### `WishlistUnavailableCard` (D-09-19)

**Layout:**

```
┌──────────────────────────────┐
│ [thumb muted]  Title (link?) │
│                «Товар більше недоступний» │
│                [♥ remove only]            │
└──────────────────────────────┘
```

| Property | Spec |
|----------|------|
| Container | `Card` `border-dashed` або `bg-muted/40` |
| Image | 80×80 `rounded-md` optional link disabled |
| Title | `line-clamp-2` `text-base font-medium` — link до PDP **optional** (prefer **no** link if product not public) |
| Notice | `text-sm text-muted-foreground` **«Товар більше недоступний»** |
| Actions | **Тільки** `WishlistToggleButton` inline/remove — **без** `AddToCartButton` |
| Price | Hidden |

---

### `/kabinet` — Wishlist preview (D-09-02)

**Insert** new section **above** «Мої замовлення»:

```
H1 Особистий кабінет
Welcome…
H2 Обране
[WishlistCabinetPreview — max 3 ProductCard or compact cards]
[ Дивитись усе — outline/link ]
H2 Мої замовлення
…
```

| Property | Spec |
|----------|------|
| Max items | **3** most recently added (DB `createdAt desc`) |
| Layout | `grid grid-cols-1 gap-4 sm:grid-cols-3 sm:gap-6` |
| CTA | `Link` / `Button variant="outline"` **«Дивитись усе»** → `/obrane`, `className="mt-4"` |
| Empty | **«Поки нічого в обраному»** + ghost **«Перейти до каталогу»** |
| Guest | Section **не показувати** (cabinet requires auth; guest uses `/obrane` only) |

---

## Sonner / Toast Contract (D-09-21, D-09-22)

| Property | Value |
|----------|-------|
| Provider | `@/components/ui/sonner` `Toaster` in `(storefront)/layout.tsx` |
| Position | **`top-center`** |
| Options | `richColors`, `closeButton` (align admin/chat) |
| Duration | Default sonner (~4s) |
| Success | «Додано до обраного» / «Прибрано з обраного» |
| Error | «У обраному вже максимум 20 товарів»; action failures — generic **«Не вдалося оновити обране»** |
| Import in toggle | `import { toast } from "sonner"` |

**Не дублювати** Toaster в admin — лишається окремо.

---

## States & Interactions

### Loading

| Surface | Pattern |
|---------|---------|
| `/obrane` | 4× card skeleton |
| Toggle (session) | `aria-busy`; icon state already toggled (optimistic) |
| Cabinet preview | 3× small skeleton |

### Empty

| Trigger | UI |
|---------|-----|
| 0 items `/obrane` | Empty copy + catalog CTA |
| 0 items cabinet | Compact empty + catalog link |

### Error

| Trigger | UI |
|---------|-----|
| List fetch fail | `Alert destructive` top |
| Server action fail | Revert Heart + toast error |
| Guest cap | Toast error only (no add) |

### Cross-tab (guest)

Optional: `window.addEventListener("storage", ...)` on `appliance-wishlist-guest` to sync badge — discretion; not required MVP.

---

## Mobile-First Patterns

| Pattern | Implementation |
|---------|----------------|
| Overlay Heart | 44px tap; не перекривати `ConditionBadge` (left vs right) |
| Header | Wishlist before cart; badge не обрізається — `relative` parent |
| `/obrane` grid | 2 cols mobile — як каталог |
| PDP inline toggle | Full width mobile поруч із cart CTA |
| Toasts | `top-center` — не перекривати sticky header критично; `offset` prop discretion if overlap |

---

## Accessibility

| Area | Requirement |
|------|-------------|
| Language | UA; `lang="uk"` |
| Nav Heart | `aria-label` з count або «порожній список» |
| Toggle | `aria-pressed`; dynamic label add/remove |
| Overlay | `type="button"`; not nested inside `<a>` |
| Unavailable | Status text not color-only; include full UA string |
| Toasts | Sonner live region (built-in) |
| Focus | Visible `:focus-visible` on Heart buttons |
| Motion | `prefers-reduced-motion`: no heart pulse animation |

---

## Traceability

| Requirement | UI-SPEC coverage |
|-------------|------------------|
| WISH-01 | Guest toggle, storage, `/obrane`, header badge |
| WISH-02 | Session actions, DB list, cabinet preview |
| WISH-03 | No merge UI; silent switch on login/logout |
| WISH-04 | `/obrane` + `/kabinet` preview |
| WISH-05 | Overlay on card + inline on PDP + toasts |
| UI-01 | UA copy throughout |
| UI-02 | Extends Phase 1–2 tokens |
| UI-03 | Mobile-first overlay + grid |

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

**Phase:** 9 — Wishlist (storefront)
**Design System:** shadcn `base-nova` / neutral / Geist (inherited)

### Contract Summary
- Spacing: 8-point scale inherited; overlay `right-2 top-2`, 44px touch targets
- Typography: 4 sizes / 2 weights inherited
- Color: 60/30/10 inherited; accent on filled Heart + badge only
- Copywriting: 15+ UA strings (toasts, empty, unavailable, aria)
- Registry: shadcn official reuse only; no third-party blocks

### File Created
`.planning/phases/09-wishlist/09-UI-SPEC.md`

### Pre-Populated From
| Source | Decisions Used |
|--------|----------------|
| `09-CONTEXT.md` | 24 (D-09-01–24) |
| `03-UI-SPEC.md` | CartNavLink badge pattern (cap overridden to 99+) |
| `07-UI-SPEC.md` | Catalog grid / ProductCard patterns |
| `02-UI-SPEC.md` | Tokens, typography, spacing |
| `components.json` | yes — base-nova preset |
| User input | 0 (all from CONTEXT + codebase scout) |

### Ready for Verification
UI-SPEC complete. Checker can now validate against 6 dimensions.
