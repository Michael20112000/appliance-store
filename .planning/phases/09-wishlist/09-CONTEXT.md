# Phase 9: Wishlist - Context

**Gathered:** 2026-05-17
**Status:** Ready for planning

<domain>
## Phase Boundary

Обране для **гостя** (localStorage `appliance-wishlist-guest`) і **залогіненого** (Prisma `WishlistItem`). При логіні **без merge** — гостєвий список лишається в localStorage окремо від БД.

Доставляємо: toggle на картці каталогу й PDP, іконка з badge в header, сторінка `/obrane`, прев’ю в `/kabinet`, unit-тести storage/actions.

**Не в цій фазі:** merge при логіні, push/email про зміну ціни, порівняння товарів, адмінка wishlist, синхронізація між пристроями, auto-remove sold з БД без відображення рядка «недоступний».

</domain>

<decisions>
## Implementation Decisions

### Wishlist pages & navigation (WISH-04)
- **D-09-01:** **Основний список** — окрема сторінка **`/obrane`** (повна сітка/список товарів).
- **D-09-02:** У **`/kabinet`** — короткий блок **«Обране»** (прев’ю останніх товарів; planner: **до 3** карток) + кнопка/лінк **«Дивитись усе»** → `/obrane`.
- **D-09-03:** **`/obrane` доступна без логіну** — гість бачить товари з localStorage; залогінений — з БД (лише AVAILABLE для «активних» рядків; див. D-09-11).
- **D-09-04:** У **`StoreHeader`** — лінк на `/obrane` (Heart + badge) для **всіх** відвідувачів (не лише session).

### Header badge (WISH-01, WISH-02)
- **D-09-05:** **`WishlistNavLink`** (client): badge count з **localStorage** (гість / до логіну) або з **БД** (session); той самий Heart у header.
- **D-09-06:** Після **логіну** — badge і `/obrane` показують **лише DB wishlist**; guest-key **не читається** і **не merge’иться** (тихе перемикання).
- **D-09-07:** Після **logout** — знову guest localStorage для badge і `/obrane` (ключ лишався «в тіні» — D-09-06).
- **D-09-08:** Badge приховати або `0`, коли порожньо; при count > 99 показувати **`99+`** (як типовий e-commerce).

### Toggle UX — catalog & PDP (WISH-05)
- **D-09-09:** **`WishlistToggleButton`** — Heart **overlay** у правому верхньому куті зображення на **`ProductCard`**; `e.stopPropagation()` / `preventDefault`, щоб **не відкривати** PDP.
- **D-09-10:** Той самий компонент (або варіант без overlay wrapper) на **PDP** (`/tovar/[slug]`).
- **D-09-11:** Стан: outline Heart → filled (або `fill-current`) коли в обраному; `aria-pressed`, українські `aria-label` («Додати до обраного» / «Прибрати з обраного»).
- **D-09-12:** Після toggle — **Sonner toast**: **«Додано до обраного»** / **«Прибрано з обраного»** (storefront; див. D-09-15). Іконка **завжди** оновлюється синхронно зі станом (не лише toast).

### Guest storage (WISH-01, WISH-03)
- **D-09-13:** Ключ **`appliance-wishlist-guest`**, структура як у cart pending: `{ v: 1, items: { productId: string }[] }` у `src/lib/wishlist/guest-storage.ts` (аналог `pending-storage.ts`).
- **D-09-14:** **MAX_ITEMS = 20** для гостя (як `appliance-cart-pending`); при спробі додати 21-й — toast помилки українською (напр. «У обраному вже максимум 20 товарів»), без додавання.
- **D-09-15:** **Немає** `WishlistPendingMerge` / merge action при логіні — явна протилежність `CartPendingMergeGate`.

### Logged-in persistence (WISH-02)
- **D-09-16:** Prisma **`WishlistItem`**: `userId`, `productId`, `@@unique([userId, productId])`, relation до `User` і `Product`.
- **D-09-17:** Server actions: `addToWishlistAction`, `removeFromWishlistAction`, `listWishlistForUser` (або service); Zod validators; `requireBuyer` на mutations (гість — лише client storage).
- **D-09-18:** Toggle для session — server action + `router.refresh()` (патерн `AddToCartButton`).

### Unavailable products on `/obrane` (success criteria #4)
- **D-09-19:** Товари **SOLD** або **DRAFT** (не AVAILABLE) — **не приховувати повністю**; показувати **рядок/картку** з текстом **«Товар більше недоступний»**, **без** кнопки «В кошик» / «Купити».
- **D-09-20:** Не auto-delete з wishlist (ні guest, ні DB) у цій фазі — лише відображення стану; користувач може прибрати вручну Heart.

### Storefront Sonner (WISH-05 UX)
- **D-09-21:** Додати **`<Toaster />`** у **`(storefront)/layout.tsx`** (пакет `sonner` і `src/components/ui/sonner.tsx` уже в проєкті; зараз Toaster лише в admin layout).
- **D-09-22:** Позиція toast — **`top-center`**, `richColors` (узгоджено з admin/chat).

### Verification
- **D-09-23:** **Vitest:** guest storage key, add/remove/idempotent, max cap; server actions / service для logged-in toggle.
- **D-09-24:** Manual checklist: гість 3 товари → reload → login → DB list **без** цих 3; logout → guest list знову в header/`/obrane`.

### Claude's Discretion
- Точна кількість прев’ю в `/kabinet` (зафіксовано **до 3** якщо planner не бачить причин змінити).
- `WishlistNavLink` server prefetch count vs client-only badge (мінімум client JS для guest).
- Чи виносити overlay wrapper у `ProductCardImage` vs окремий `ProductCardWithWishlist` — головне D-09-09.
- Empty state copy на `/obrane` і в кабінеті.

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Project & requirements
- `.planning/PROJECT.md` — wishlist no merge, v1.1 milestone
- `.planning/REQUIREMENTS.md` — WISH-01–05
- `.planning/ROADMAP.md` — Phase 9 goal, success criteria, Prisma notes
- `.planning/STATE.md` — milestone v1.1

### Prior phase context
- `.planning/phases/07-catalog-filters-fix/07-CONTEXT.md` — ProductCard, catalog grid
- `.planning/phases/08-admin-ux-chat-lifecycle/08-CONTEXT.md` — shadcn patterns; wishlist explicitly Phase 9

### Code (primary touchpoints)
- `src/lib/cart/pending-storage.ts` — guest storage pattern (NO merge counterpart for wishlist)
- `src/components/cart/add-to-cart-button.tsx` — guest vs session toggle pattern
- `src/components/cart/cart-pending-merge.tsx` — **anti-pattern** for wishlist (do not replicate)
- `src/components/cart/cart-nav-link.tsx` — nav badge reference
- `src/components/catalog/product-card.tsx` — overlay heart integration
- `src/app/(storefront)/tovar/[slug]/page.tsx` — PDP toggle
- `src/app/(storefront)/kabinet/page.tsx` — preview block
- `src/app/(storefront)/layout.tsx` — add Toaster; no wishlist merge gate
- `src/components/layout/store-header.tsx` — WishlistNavLink
- `src/components/ui/sonner.tsx` — Toaster wrapper
- `src/components/chat/chat-thread.tsx` — `toast` from sonner usage example
- `prisma/schema.prisma` — add WishlistItem + User relation

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `src/lib/cart/pending-storage.ts` — template for `guest-storage.ts` (key, v:1, max, read/write)
- `src/components/cart/add-to-cart-button.tsx` — `hasSession` branch, `useTransition`, optimistic UI
- `src/components/cart/cart-nav-link.tsx` — server count + Badge in nav
- `src/components/ui/sonner.tsx` + `sonner` package — toasts (wire Toaster in storefront)
- `src/components/catalog/product-card.tsx` — Card + image area for overlay
- `src/app/(storefront)/kabinet/page.tsx` — section layout for «Обране» block

### Established Patterns
- Guest = localStorage client-only; session = server actions + `router.refresh()`
- **Cart** merges on login; **wishlist must not** — no gate in layout
- RSC pages + client islands; Ukrainian copy; `requireBuyer` for protected routes
- Lucide icons (Heart) consistent with cart (ShoppingCart)

### Integration Points
- `StoreHeader`: WishlistNavLink beside CartNavLink / auth
- `ProductCard`: wrap image `relative` + absolute Heart button
- New route `src/app/(storefront)/obrane/page.tsx`
- Prisma migration before wishlist service
- Vitest colocated or `src/lib/wishlist/*.test.ts`

</code_context>

<specifics>
## Specific Ideas

- Користувач (2026-05-17): `/obrane` + кабінет-прев’ю «Дивитись усе»; header heart+badge для гостя й юзера; overlay heart + Sonner; тихе перемикання на БД без merge; рядок «Товар більше недоступний»; cap 20 + toast «Додано»/«Прибрано».

</specifics>

<deferred>
## Deferred Ideas

- Auto-prune sold items from wishlist on page load — deferred (D-09-20: manual remove only)
- Wishlist merge on login — explicitly out of scope (PROJECT.md)
- Price-drop notifications — v2
- Compare products — v2 (research/FEATURES.md)

</deferred>

---

*Phase: 09-wishlist*
*Context gathered: 2026-05-17*
