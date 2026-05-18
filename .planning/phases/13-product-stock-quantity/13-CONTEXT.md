# Phase 13: Product Stock Quantity - Context

**Gathered:** 2026-05-18
**Status:** Ready for planning

<domain>
## Phase Boundary

Один запис `Product` = один лістинг для кількох **ідентичних** б/у одиниць (без окремих PDP). Адмін задає та бачить `quantity`; storefront **не показує** залишок покупцю. При успішному checkout кількість **зменшується**; коли стає `0` — `status: SOLD` (разом з `quantity: 0`).

**Не в цій фазі:** quantity на картках каталогу/PDP; окремі Product на кожну одиницю; зміна CartItem.quantity > 1.

</domain>

<decisions>
## Implementation Decisions

### Data model
- **D-13-01:** Поле `quantity Int` на `Product`, `@default(1)`, NOT NULL.
- **D-13-02:** Міграція: усі існуючі рядки `quantity = 1`.
- **D-13-03:** CartItem / OrderItem не змінюємо — лінія кошика лишається `quantity: 1` (одна одиниця за замовлення).

### Checkout і SOLD
- **D-13-04:** У `createOrderFromCart` (транзакція): для кожного товару в замовленні `quantity -= 1` (atomic per product id).
- **D-13-05:** Якщо після decrement `quantity === 0` → `status: SOLD` (і `quantity` лишається 0). Якщо `quantity > 0` → `status` не чіпати (лишається `AVAILABLE`).
- **D-13-06:** Перед checkout / add-to-cart: не дозволяти купівлю, якщо `status !== AVAILABLE` або `quantity < 1` (узгодити з існуючими перевірками AVAILABLE).
- **D-13-07:** Scope розширено відносно ROADMAP «decrement out of scope» — **свідомий вибір користувача** на discuss-phase.

### Admin validation (create / edit)
- **D-13-08:** `quantity` — ціле число, `min: 0`, розумний `max` (напр. 999).
- **D-13-09:** **Create:** default `1`, Zod `quantity >= 1` (не створюємо лістинг з нулем).
- **D-13-10:** **Edit:** дозволити `quantity: 0` вручну (напр. списання без продажу); разом з D-13-05 при 0 бажано узгодити з `status` (адмін може виставити SOLD вручну або лишити правило «0 після продажу = SOLD» лише в checkout).

### Admin UI
- **D-13-11:** Поле «Кількість» у `product-form` (поруч із ціною).
- **D-13-12:** Колонка «Кількість» у `/admin/tovary` (`admin-products-table`); без сортування в v1.2 (опційно пізніше).
- **D-13-13:** Storefront без відображення quantity (текст/badge на PDP і в каталозі).

### Claude's Discretion
- Точний `max` для quantity; чи показувати в таблиці badge при `quantity <= 2`; чи блокувати edit quantity вниз нижче кількості в активних кошиках (ймовірно out of scope).

### Folded Todos
_(none)_

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Requirements & roadmap
- `.planning/REQUIREMENTS.md` — ADM-PRD-03
- `.planning/ROADMAP.md` — Phase 13 success criteria (з урахуванням D-13-07 override на decrement)
- `.planning/PROJECT.md` — «Stock quantity admin-only», «декілька однакових одиниць без окремих PDP»

### Existing implementation
- `prisma/schema.prisma` — model `Product` (поля до міграції)
- `src/server/services/order.service.ts` — `createOrderFromCart` (поточний `updateMany` → SOLD)
- `src/server/services/cart.service.ts` — add-to-cart, AVAILABLE checks
- `src/server/validators/admin-product.ts` — `upsertProductSchema` / `updateProductSchema`
- `src/components/admin/product-form.tsx` — create/edit UI
- `src/components/admin/admin-products-table.tsx` — list UI
- `.planning/phases/03-cart-checkout/03-RESEARCH.md` — CartItem.quantity завжди 1

### Prior phase context
- `.planning/phases/12-admin-tables-status-sort/12-CONTEXT.md` — admin table patterns (sort headers; quantity column без sort у 13)

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `product-form.tsx` + `upsertProductSchema` — додати поле quantity за аналогією `priceUah`.
- `admin-products-table.tsx` — нова колонка після «Ціна» або перед «Статус».
- `listAdminProducts` / `admin-product.service.ts` — повернути `quantity` у list DTO.

### Established Patterns
- Ціна в БД у kopiyky; quantity — сире `Int` (штуки).
- Checkout у транзакції з `updateMany` по `id` + `AVAILABLE` — замінити на decrement + умовний SOLD (D-13-04–05).
- Один Product = один slug/PDP; продаж N разів = N checkout, не N окремих записів.

### Integration Points
- `createOrderFromCart` — головна зміна бізнес-логіки.
- `cart.service` / `addToCart` — перевірка `quantity >= 1`.
- Admin actions `createProduct` / `updateProduct` — persist quantity.

</code_context>

<specifics>
## Specific Ideas

- Користувач підтвердив **decrement при checkout**, не лише admin metadata.
- При `quantity → 0` обовʼязково **SOLD + quantity 0**.
- Create: default 1, не нуль; edit: можна 0 вручну.
- Адмінка: **таблиця + форма**.

</specifics>

<deferred>
## Deferred Ideas

- Сортування колонки «Кількість» в admin table — не обговорювали, за бажанням пізніше.
- Показ quantity на storefront (PDP/каталог) — v2 / out of scope.
- Cart line quantity > 1 — суперечить моделі «унікальна б/у одиниця».
- Авто-приховування категорій / каталогу при `quantity=0` але `AVAILABLE` — покладаємось на SOLD після останнього продажу; edge case ручного AVAILABLE+0 — на розсуд planner.

### Reviewed Todos
_(none)_

</deferred>

---

*Phase: 13-Product Stock Quantity*
*Context gathered: 2026-05-18*
