---
phase: 3
slug: cart-checkout
status: draft
shadcn_initialized: true
preset: "base-nova · base: neutral · cssVariables · Tailwind v4 · geist (extends Phase 1–2)"
created: 2026-05-17
locale: uk
extends: 02-UI-SPEC.md
---

# Phase 3 — UI Design Contract

> Кошик, checkout без онлайн-оплати, підтвердження замовлення, історія в кабінеті. **Розширює** Phase 1–2 — токени, типографіка, 60/30/10 і spacing **без змін**. Джерела: `02-UI-SPEC.md`, `ROADMAP.md` Phase 3, `REQUIREMENTS.md` (AUTH-03, CART-01–03, CHK-01–04), `research/ARCHITECTURE.md`, код: `tovar/[slug]/page.tsx`, `store-header.tsx`, `kabinet/page.tsx`.

**Out of scope (UI):** адмін-замовлення (Phase 4), чат (Phase 5), онлайн-оплата, зміна статусу замовлення покупцем.

---

## Design System

| Property | Value |
|----------|-------|
| Tool | shadcn/ui (ініціалізовано) |
| Preset | `base-nova`, base `neutral`, `cssVariables: true`, Tailwind v4, font **Geist** |
| Component library | Base UI (via shadcn `base-nova`) |
| Icon library | `lucide-react` |
| Font | Geist Sans — без змін |
| Styling | Tailwind v4 + `src/app/globals.css` |
| Theme modes | **Light only** |
| Document | `<html lang="uk">` |

**Phase 3 shadcn add (executor):**

```bash
npx shadcn@latest add radio-group textarea field
```

`field` — якщо ще немає з auth-форм; інакше лише `radio-group`, `textarea`.

**Не змінювати** OKLCH токени в `:root` / `@theme`.

---

## Spacing Scale

**Успадковано з Phase 1** — див. `01-UI-SPEC.md` / `02-UI-SPEC.md`.

| Token | Value | Phase 3 usage |
|-------|-------|----------------|
| xs | 4px | Gap між qty кнопками |
| sm | 8px | Cart line meta gap |
| md | 16px | Cart row padding, form field gap |
| lg | 24px | Checkout two-column gap |
| xl | 32px | Page title margin-bottom |
| 2xl | 48px | Empty cart vertical padding |
| 3xl | 64px | Confirmation hero spacing |

**Exceptions (додатково):**

| Exception | Value | Usage |
|-----------|-------|-------|
| Touch target min | 44×44px | Qty ±, remove, cart icon, radio cards |
| Cart line thumb | 80×80px mobile / 96×96px desktop | `rounded-md`, `object-cover` |
| Sticky checkout summary | `top-20` desktop | Під header 64px + відступ |
| Order card min height | auto | `Card` padding `p-4 md:p-6` |

---

## Typography

**Успадковано** — 4 розміри, 2 ваги (400, 600).

| Role | Size | Weight | Line height | Phase 3 usage |
|------|------|--------|-------------|----------------|
| Body | 16px | 400 | 1.5 | Checkout hints, order notes |
| Label | 14px | 600 | 1.4 | Form labels, fulfillment options, status badge |
| Heading | 20px / 24px desktop | 600 | 1.2 | H1 кошик/checkout, секції форми |
| Display | 28px | 600 | 1.15 | H1 підтвердження («Дякуємо!») |

**Money:** `PriceDisplay` + `tabular-nums` для subtotal, line totals, order total.

---

## Color

**Успадковано** з Phase 1–2.

| Role | Token | Phase 3 usage |
|------|-------|----------------|
| Dominant (60%) | `--background` | Cart, checkout, confirmation, cabinet orders |
| Secondary (30%) | `--card`, `--muted` | Line items, order summary card, fulfillment radio cards |
| Accent (10%) | `--primary` | Primary CTAs, selected fulfillment card border, focus rings |
| Destructive | `--destructive` | Remove item, validation errors, sold-unavailable alert |

**Accent reserved for (Phase 3):**

1. **«Додати в кошик»**, **«Оформити замовлення»**, **«Підтвердити замовлення»**, **«Увійти, щоб додати»** (outline variant — не accent fill; filled primary лише для головних CTA)
2. Cart badge count pill (`bg-primary text-primary-foreground`)
3. Selected fulfillment option (`border-primary ring-2 ring-primary/20`)
4. Focus ring на phone input, radio group, submit

**НЕ accent:** subtotal labels, order status badges (semantic variants), qty controls (`outline`/`ghost`), remove link (`ghost` + `text-destructive` on hover).

### Order status badges (semantic, не primary)

| Enum | UA label | Badge variant |
|------|----------|---------------|
| `PENDING` | Очікує підтвердження | `secondary` |
| `CONFIRMED` | Підтверджено | `secondary` |
| `READY_FOR_PICKUP` | Готово до самовивозу | `outline` |
| `OUT_FOR_DELIVERY` | Передано в доставку | `outline` |
| `COMPLETED` | Виконано | `secondary` + muted |
| `CANCELLED` | Скасовано | `outline` + `text-muted-foreground` |

---

## Copywriting Contract

| Element | Copy |
|---------|------|
| Primary CTA (PDP) | **«Додати в кошик»** |
| Primary CTA (cart) | **«Оформити замовлення»** |
| Primary CTA (checkout submit) | **«Підтвердити замовлення»** |
| Primary CTA (empty cart) | **«Перейти до каталогу»** |
| Primary CTA (confirmation) | **«До кабінету»** |
| Secondary CTA (confirmation) | **«Продовжити покупки»** → `/katalog` |
| Auth gate CTA (logged out on PDP) | **«Увійти, щоб додати»** |
| Empty cart heading | **«Кошик порожній»** |
| Empty cart body | **«Додайте б/у техніку з каталогу — кожна одиниця в наявності одна.»** |
| Empty orders (cabinet) heading | **«Замовлень ще немає»** |
| Empty orders body | **«Оформіть перше замовлення з каталогу — історія з’явиться тут.»** |
| Error state (cart load) | **«Не вдалося завантажити кошик. Оновіть сторінку або спробуйте пізніше.»** |
| Error state (checkout submit) | **«Не вдалося оформити замовлення. Перевірте дані та спробуйте ще раз.»** |
| Error state (product sold) | **«Цей товар уже недоступний. Перегляньте інші позиції в каталозі.»** |
| Error state (orders load) | **«Не вдалося завантажити замовлення. Оновіть сторінку.»** |
| Destructive confirmation | **«Видалити з кошика»**: inline — без modal; одразу видалення + optional `toast` **«Товар прибрано з кошика»** (якщо додано sonner у Phase 3 — optional) |
| Loading (add to cart) | **«Додаємо…»** |
| Loading (submit order) | **«Оформлюємо…»** |

**Microcopy:**

| UI | Copy |
|----|------|
| Header cart link `aria-label` | **«Кошик, {n} товарів»** / **«Кошик, порожній»** |
| Qty label (sr-only) | **«Кількість»** |
| Phone label | **«Телефон для зв’язку»** |
| Phone placeholder | **«+380 XX XXX XX XX»** |
| Phone hint | **«Магазин зателефонує для підтвердження замовлення.»** |
| Fulfillment section | **«Спосіб отримання»** |
| `PICKUP` | **«Самовивіз з магазину»** + hint **«м. Львів, адресу повідомимо після підтвердження»** |
| `LVIV_DELIVERY` | **«Доставка по Львову»** |
| Address label (delivery) | **«Адреса доставки»** |
| Address placeholder | **«вул. …, буд., кв.»** |
| Comment label | **«Коментар до замовлення»** (optional) |
| Comment placeholder | **«Зручний час дзвінка, під’їзд, домофон…»** |
| Cart subtotal | **«Разом»** |
| Checkout summary title | **«Ваше замовлення»** |
| Line item remove | **«Прибрати»** |
| Max qty hint | **«Одна одиниця на позицію — б/у товар унікальний.»** |
| Payment notice (confirmation + checkout footer) | **«Оплата при отриманні. Онлайн-оплата не потрібна.»** |
| Confirmation title | **«Дякуємо за замовлення!»** |
| Confirmation body | **«Номер замовлення: {orderNumber}. Ми зв’яжемося з вами за вказаним телефоном.»** |
| Cabinet section orders | **«Мої замовлення»** |
| Order card date | **«від {date}»** (UA locale `uk-UA`) |
| Order card items | **«{n} поз.»** / **«1 позиція»** |
| Link to product from cart | title as link → `/tovar/[slug]` |

---

## Registry Safety

| Registry | Blocks Used | Safety Gate |
|----------|-------------|-------------|
| shadcn official | radio-group, textarea, field (if needed) | not required |
| Third-party | **none** | — |

---

## Business Rules (UI-facing)

| Rule | Spec |
|------|------|
| Auth for cart actions | **AUTH-03:** додавання в кошик, `/koszyk`, `/zamovlennia` — лише з сесією |
| Max quantity | **1** на `CartItem` / line (б/у одиниця). UI: приховати «+» на qty=1; не показувати input >1 |
| Sold / unavailable | Не додавати в кошик; PDP кнопка disabled + copy sold error; server rejects |
| Guest intent (**CART-03**) | Cookie `cart_pending` (JSON: `{ productIds: string[] }`, max 20, httpOnly, 7d). Після успішного login/register — server merge у `Cart`, clear cookie, toast optional **«Кошик оновлено»** |
| Unauthenticated «Додати» | Redirect `/uviity?callbackUrl={encodeURIComponent(currentPath)}` + append `productId` to `cart_pending` via Server Action before redirect |
| Checkout empty cart | Redirect `/koszyk` |
| Post-submit | Redirect `/zamovlennia/pidtverdzhennia/[orderNumber]`; cart cleared |
| Money | Integer kopiyky in DB; `PriceDisplay` in UI |
| Delivery enum (Prisma) | `PICKUP` \| `LVIV_DELIVERY` — UA labels у copy table |

---

## Routing & URL Contract

| Route | Auth | Purpose |
|-------|------|---------|
| `/koszyk` | required | Cart page |
| `/zamovlennia` | required | Checkout form |
| `/zamovlennia/pidtverdzhennia/[orderNumber]` | required | Order confirmation (CHK-03) |
| `/kabinet` | required | Profile + **order history** (CHK-04) |
| `/uviity` | public | Login; honor `callbackUrl` query |
| `/tovar/[slug]` | public | PDP + Add to cart |

**Metadata titles:**

| Route | `title` |
|-------|---------|
| `/koszyk` | Кошик |
| `/zamovlennia` | Оформлення замовлення |
| `/zamovlennia/pidtverdzhennia/[orderNumber]` | Замовлення підтверджено |
| `/kabinet` | Особистий кабінет (існуюче) |

**Confirmation access:** лише власник `order.userId === session.userId`; інакше 404.

---

## Component Inventory (Phase 3)

### shadcn (new)

| Component | Usage |
|-----------|--------|
| `radio-group` | Fulfillment picker (`PICKUP` / `LVIV_DELIVERY`) |
| `textarea` | Comment / address (delivery) |
| `field` | Checkout form field wrapper (if not present) |

### Reused from Phase 1–2

| Component | Usage |
|-----------|--------|
| `button` | CTAs, qty ±, remove |
| `card` | Line items, summary, order cards |
| `input` | Phone, address |
| `label` | Form accessibility |
| `badge` | Order status |
| `alert` | Errors (cart, checkout, sold) |
| `separator` | Summary sections |
| `skeleton` | Cart / orders loading |
| `PriceDisplay` | All monetary values |
| `ConditionBadge` | Optional on cart line (compact) |
| `OptimizedImage` | Cart thumbnails |

### Custom components (Phase 3) — **new**

| Component | Path | Responsibility |
|-----------|------|----------------|
| `AddToCartButton` | `components/cart/add-to-cart-button.tsx` | PDP CTA; auth check; pending cookie + redirect; loading/success |
| `CartNavLink` | `components/cart/cart-nav-link.tsx` | Header icon + badge count; link `/koszyk` |
| `CartLineItem` | `components/cart/cart-line-item.tsx` | Thumb, title link, price, qty, remove |
| `CartQuantityControl` | `components/cart/cart-quantity-control.tsx` | ± buttons, max 1, disabled states |
| `CartSummary` | `components/cart/cart-summary.tsx` | Subtotal, CTA checkout, payment notice |
| `CartEmpty` | `components/cart/cart-empty.tsx` | Empty state block |
| `CartPageContent` | `components/cart/cart-page-content.tsx` | Client wrapper for optimistic qty (optional) or server children |
| `CheckoutForm` | `components/checkout/checkout-form.tsx` | Phone, fulfillment, conditional fields, submit |
| `FulfillmentPicker` | `components/checkout/fulfillment-picker.tsx` | Radio cards for PICKUP / LVIV_DELIVERY |
| `CheckoutOrderSummary` | `components/checkout/checkout-order-summary.tsx` | Sticky sidebar: lines + total |
| `OrderConfirmation` | `components/checkout/order-confirmation.tsx` | Thank you + order number + CTAs |
| `OrderHistoryList` | `components/account/order-history-list.tsx` | CHK-04 list in cabinet |
| `OrderHistoryCard` | `components/account/order-history-card.tsx` | Single order row: number, date, status, total, item count |

### Layout changes (existing files)

| File | Change |
|------|--------|
| `components/layout/store-header.tsx` | Insert `CartNavLink` before `StoreHeaderAuth` (desktop + mobile) |
| `app/(storefront)/tovar/[slug]/page.tsx` | Replace «До каталогу» sole CTA area with `AddToCartButton` + secondary link |
| `app/(storefront)/kabinet/page.tsx` | Replace placeholder copy with `OrderHistoryList` |

### New routes (pages)

| File | Responsibility |
|------|----------------|
| `app/(storefront)/koszyk/page.tsx` | Cart page shell |
| `app/(storefront)/zamovlennia/page.tsx` | Checkout page |
| `app/(storefront)/zamovlennia/pidtverdzhennia/[orderNumber]/page.tsx` | Confirmation |

---

## Component Specs

### `AddToCartButton` (PDP)

**Placement:** у правій колонці PDP після `ConditionBadge`, перед секцією «Опис» (або одразу під ціною — візуально головний action).

| Property | Spec |
|----------|------|
| Variant | `Button` **default** (primary), full width on mobile `w-full md:w-auto` |
| Icon | `ShoppingCart` lucide, `size-4`, `mr-2` |
| Min height | 44px (`min-h-11`) |
| Logged in | Server Action `addToCartAction(productId)` → success: optional brief **«Додано»** state 2s або `router.refresh()` для badge |
| Logged out | Client: call `stagePendingCartAction(productId)` then `router.push('/uviity?callbackUrl=...')` |
| Sold / unavailable | `disabled` + `Alert` destructive below button |
| Loading | `aria-busy="true"`, label **«Додаємо…»** |
| `aria-label` | **«Додати {productTitle} в кошик»** |

**Auth redirect flow (diagram):**

```
[PDP] Tap «Додати в кошик»
  ├─ session? ──yes──► addToCartAction → refresh badge → (optional toast)
  └─ no ──► stagePendingCart → /uviity?callbackUrl=/tovar/{slug}
              └─ login OK → merge pending → redirect callbackUrl
                    └─ auto-add product if not yet in DB cart
```

---

### `CartNavLink` (header)

| Property | Spec |
|----------|------|
| Position | `flex items-center` між nav і `StoreHeaderAuth`; visible **logged in only** (cart requires auth for meaningful count; logged out: hide badge or show link to `/uviity` — **hide entirely when logged out** to reduce noise) |
| Control | `Link href="/koszyk"` + `ShoppingCart` icon |
| Badge | `absolute -top-1 -right-1` min-w-5 h-5 rounded-full `bg-primary text-primary-foreground text-xs font-semibold`; show count if `n > 0`, cap display **«9+»** |
| Touch | `min-h-11 min-w-11` icon button area |
| Active route | `aria-current="page"` on `/koszyk` |

**Data:** server: `getCartItemCount(userId)` in `StoreHeader` parallel to categories.

---

### `CartLineItem`

**Layout (mobile):**

```
┌──────┬────────────────────────────┐
│ thumb│ Title (link)               │
│      │ Brand · Condition (opt)    │
│      │ Price                      │
│      │ [−] 1 [+]   Прибрати      │
└──────┴────────────────────────────┘
```

| Property | Spec |
|----------|------|
| Container | `Card` or `border-b py-4` row in list — prefer **border-b** list inside one `Card` for airy feel |
| Thumb | 80px, `rounded-md`, first product image |
| Qty | `CartQuantityControl` — at 1: minus disabled; plus hidden or disabled |
| Remove | `Button variant="ghost" size="sm"` `text-destructive` **«Прибрати»** |
| Price change | Show line total = unit × qty (always qty=1 → unit price) |

---

### `/koszyk` — Cart page

**Structure:**

```
H1 Кошик
┌─────────────────────────────┬──────────────┐
│ CartLineItem × n            │ CartSummary  │
│                             │ (sticky md)  │
└─────────────────────────────┴──────────────┘
```

| Area | Spec |
|------|------|
| Container | `max-w-6xl` (як каталог) |
| H1 | **«Кошик»** — Heading typography |
| Layout | Mobile: summary **below** list; Desktop: `grid md:grid-cols-[1fr_320px] gap-8`, summary `md:sticky md:top-20` |
| Loading | 2–3 skeleton rows |
| Empty | `CartEmpty` centered, `2xl` padding |
| Error | `Alert destructive` top |
| CTA | Summary **«Оформити замовлення»** → `/zamovlennia`; disabled if cart empty |

---

### `/zamovlennia` — Checkout page

**Structure:**

```
H1 Оформлення замовлення
┌─────────────────────────────┬──────────────┐
│ CheckoutForm                │ CheckoutOrder│
│  - phone                    │ Summary      │
│  - FulfillmentPicker        │ (sticky)     │
│  - address (conditional)    │              │
│  - comment                  │              │
│  - payment notice           │              │
│  - submit                   │              │
└─────────────────────────────┴──────────────┘
```

| Field | Control | Validation (UI + Zod) |
|-------|---------|------------------------|
| Phone | `Input type="tel" inputMode="tel" autocomplete="tel"` | Required; UA pattern `+380XXXXXXXXX` or `0XX…`; show inline error **«Вкажіть коректний номер телефону»** |
| Fulfillment | `FulfillmentPicker` radio cards | Required |
| Address | `Textarea` or `Input` | Required iff `LVIV_DELIVERY`; min 10 chars |
| Comment | `Textarea` rows={3} | Optional, max 500 chars |
| Name | Pre-fill from `session.user.name` hidden field or readonly display **«Отримувач: {name}»** — not editable in MVP unless CHK requires |

**FulfillmentPicker:**

| Option | Card UI |
|--------|---------|
| Selected | `border-primary bg-primary/5 ring-2 ring-primary/20` |
| Unselected | `border-border bg-card hover:bg-muted/50` |
| Layout | Stack on mobile; 2-column `sm:grid-cols-2` on desktop |

**Submit:** full-width primary mobile; desktop align start. Footer muted: payment notice.

**Empty cart guard:** server redirect `/koszyk`.

---

### `/zamovlennia/pidtverdzhennia/[orderNumber]` — Confirmation

| Element | Spec |
|---------|------|
| Layout | `max-w-lg` centered, airy vertical spacing `3xl` top |
| Icon | `CheckCircle2` lucide `text-primary`, 48px, decorative `aria-hidden` |
| H1 | Display: **«Дякуємо за замовлення!»** |
| Order number | `text-lg font-semibold tabular-nums` |
| Body | Copywriting confirmation body |
| Notice | Muted box: payment notice + fulfillment summary (UA label) |
| CTAs | Primary **«До кабінету»**; outline **«Продовжити покупки»** |
| No auto-redirect | User stays until navigation |

---

### `/kabinet` — Orders (CHK-04)

**Replace** placeholder paragraph with:

```
H1 Особистий кабінет
Welcome line (existing)
H2 Мої замовлення
OrderHistoryList | OrderHistoryEmpty
```

| `OrderHistoryCard` | Spec |
|--------------------|------|
| Container | `Card` hover `shadow-sm` |
| Header row | `#{orderNumber}` + `OrderStatusBadge` |
| Meta | Date **«від 17 травня 2026»**, **«3 поз.»**, total `PriceDisplay` |
| Detail link | Optional Phase 3: **no** separate order detail page — card only; Phase 4 admin has detail |
| Sort | `createdAt desc` |
| Empty | Empty orders copy + **«Перейти до каталогу»** primary |

---

## Page Layouts (wireframes)

### PDP (`/tovar/[slug]`) — delta

```
… Price, ConditionBadge
[ AddToCartButton — primary full width mobile ]
[ До каталогу — outline/link secondary ]
Опис …
```

### Global header delta

```
Logo | Nav… | [CartNavLink] | Кабінет/Увійти
```

Mobile sheet: add **«Кошик»** link top if logged in (before categories).

---

## States & Interactions

### Loading

| Surface | Pattern |
|---------|---------|
| Cart page | 3× row skeleton |
| Checkout | Form disabled + submit **«Оформлюємо…»** |
| Add to cart | Button loading |
| Cabinet orders | 2× card skeleton |

### Empty

| Trigger | UI |
|---------|-----|
| No cart items | `CartEmpty` |
| No orders | Empty orders in cabinet |

### Error

| Trigger | UI |
|---------|-----|
| Cart fetch fail | Alert + refresh |
| Submit fail | Alert inline above submit; preserve form values |
| Product became sold on submit | Alert **sold** + link catalog |
| Order list fail | Alert in cabinet section |

### Optimistic UI (optional)

Qty/remove may use `useTransition` + `router.refresh()` — **not required** for MVP; prefer simple refresh after Server Action.

---

## Mobile-First Patterns

| Pattern | Implementation |
|---------|----------------|
| Cart list | Single column; thumb + text stack |
| Summary | Below items on mobile; sticky right on `md+` |
| Checkout form | Full-width inputs; radio cards stack |
| Header cart | Icon always visible (logged in); badge must not clip — `relative` wrapper |
| Confirmation | Single column, large tap targets for CTAs |
| Cabinet orders | Full-width cards, status badge wraps |

---

## Accessibility

| Area | Requirement |
|------|-------------|
| Language | UA; `lang="uk"` |
| Cart icon | Descriptive `aria-label` with count |
| Add to cart | `aria-label` with product name; `aria-busy` when loading |
| Qty control | `role="group"` + `aria-label="Кількість"`; buttons **«Зменшити»** / **«Збільшити»** (sr-only); announce max 1 |
| Remove | **«Прибрати {title} з кошика»** |
| Phone | Visible `<Label htmlFor>` + `aria-describedby` for hint |
| Fulfillment | `RadioGroup` + `Label` per option; fieldset `legend` **«Спосіб отримання»** |
| Address | `aria-required="true"` when delivery selected |
| Errors | `aria-invalid` + `aria-describedby` on fields; `Alert role="alert"` |
| Focus | Visible `:focus-visible`; trap not needed (no modal cart) |
| Confirmation | `h1` first; status messages not color-only (badge + text) |
| Motion | `prefers-reduced-motion`: no success confetti animations |

---

## Traceability

| Requirement | UI-SPEC coverage |
|-------------|------------------|
| AUTH-03 | Auth gate on add, cart, checkout; login redirect + callbackUrl |
| CART-01 | `AddToCartButton` on PDP |
| CART-02 | `/koszyk` lines, qty (max 1), remove, summary |
| CART-03 | `cart_pending` cookie + merge on login |
| CHK-01 | Checkout phone + fulfillment form |
| CHK-02 | `FulfillmentPicker` PICKUP / LVIV_DELIVERY + address |
| CHK-03 | Confirmation page, payment copy |
| CHK-04 | `OrderHistoryList` in `/kabinet` |
| UI-01 | UA copy throughout |
| UI-02 | Extends Phase 1–2 tokens |
| UI-03 | Mobile-first cart/checkout |

---

## Checker Sign-Off

- [ ] Dimension 1 Copywriting: PASS
- [ ] Dimension 2 Visuals: PASS
- [ ] Dimension 3 Color: PASS
- [ ] Dimension 4 Typography: PASS
- [ ] Dimension 5 Spacing: PASS
- [ ] Dimension 6 Registry Safety: PASS

**Approval:** pending
