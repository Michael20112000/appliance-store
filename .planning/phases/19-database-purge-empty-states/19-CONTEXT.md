# Phase 19: Database Purge & Empty States - Context

**Gathered:** 2026-05-19
**Status:** Ready for planning

<domain>
## Phase Boundary

Оператор може **однією документованою командою** очистити всі бізнес-сутності в PostgreSQL (товари, категорії, замовлення, чати, кошики, wishlist тощо) у безпечному FK-порядку. Після purge **storefront і адмінка** не кидають 500 — показують нулі та зрозумілі empty states на маршрутах з ROADMAP success criteria.

**Не в цій фазі:** видалення ассетів у Cloudinary, purge production без явного override, нові storefront-фічі, зміна логіки фільтрів/пагінації каталогу.

</domain>

<decisions>
## Implementation Decisions

### Scope purge (що видаляємо / що лишаємо)
- **D-19-01:** Видаляти **лише бізнес-таблиці** у FK-безпечному порядку: `Message` → `Conversation` → `OrderItem` → `Order` → `CartItem` → `Cart` → `WishlistItem` → `ProductImage` → `Product` → `Category`.
- **D-19-02:** **Залишити auth-шар без змін:** `User`, `Session`, `Account`, `Verification` — admin (і buyer-акаунти, якщо є) лишаються; після purge оператор **не** проходить signup знову.
- **D-19-03:** **Не видаляти** записи `User` за роллю; окремий «purge users» — out of scope.
- **D-19-04:** Реалізація — **один Prisma-скрипт** (напр. `prisma/purge-business-data.ts`) з `deleteMany` у транзакції; порядок як у D-19-01, без `TRUNCATE CASCADE` по всій БД.
- **D-19-05:** Скрипт **ідемпотентний** — повторний запуск на вже порожніх таблицях завершується успішно (0 rows deleted).

### Безпека команди purge
- **D-19-06:** Окрема npm-команда **`npm run db:purge`** → `tsx prisma/purge-business-data.ts` — **не** змішувати з `prisma db seed`.
- **D-19-07:** Обов’язковий явний прапорець: **`--confirm`** або env **`CONFIRM_DB_PURGE=yes`** — без нього exit 1 з повідомленням.
- **D-19-08:** **Блок за замовчуванням на production:** якщо `NODE_ENV === "production"` — exit 1, доки не встановлено **`ALLOW_PRODUCTION_PURGE=yes`** (другий рівень для рідкісного prod/staging reset).
- **D-19-09:** У stdout — короткий звіт (які таблиці, скільки рядків видалено) + нагадування що Cloudinary **не** чиститься.
- **D-19-10:** Операторська документація — коментар у `prisma/purge-business-data.ts` + рядок у README (розділ dev/staging): backup → purge → optional seed.

### Головна та storefront empty (після повного purge)
- **D-19-11:** **Homepage:** лишити поточну поведінку Phase 15 — `CategoryGrid` не рендериться при 0 категорій з available-товарами (`return null`); Hero + HowToBuy достатньо, **без** нової маркетингової секції «скоро буде».
- **D-19-12:** **`/katalog` і `/katalog/[slug]`:** існуючі empty у `ProductGrid` + copy у фільтрах (`priceBounds === null` → «Немає товарів для фільтра ціни») — **не** міняти copy, лише переконатися що немає 500.
- **D-19-13:** **Кошик / obrane:** існуючі `CartEmpty` / `WishlistEmptyState` — без редизайну; smoke після purge.
- **D-19-14:** **Header / mobile nav:** порожні категорії вже фільтруються (Phase 15) — після purge без категорій dropdown може бути порожнім; **не** падати, не показувати зламаний UI.

### Після purge — workflow оператора
- **D-19-15:** **`db:purge` не запускає seed автоматично** — два окремі кроки оператора.
- **D-19-16:** Рекомендований flow у README: (1) backup БД за потреби (2) `CONFIRM_DB_PURGE=yes npm run db:purge` (3) за бажанням `npx prisma db seed` — категорії-скелет + admin role з env (4) наповнення товарів через `/admin/tovary`.
- **D-19-17:** Після purge **admin login** працює з тими ж `ADMIN_EMAIL` / credentials; seed потрібен лише якщо хочуть **категорії з коробки** (8 категорій з `seed.ts`).
- **D-19-18:** **Manual smoke checklist** (як у ROADMAP п.5): підписати прохід по `/`, `/katalog`, `/katalog/[slug]` (існуючий slug або 404 — не 500), `/koszyk`, `/admin`, `/admin/tovary`, `/admin/kategorii`, `/admin/zamovlennia`, `/admin/chaty` — без unhandled errors.

### Empty states — адмінка (аудит, не редизайн)
- **D-19-19:** Dashboard — StatCard з **0** + «Замовлень ще немає» — достатньо; не додавати нові віджети.
- **D-19-20:** `/admin/tovary`, `/admin/kategorii`, `/admin/zamovlennia`, `/admin/chaty` — існуючі empty copy зберегти; фіксити лише **реальні 500/throw** при 0 rows.
- **D-19-21:** `/admin/tovary/novyi` при 0 категорій — форма не повинна 500; допустимо disabled submit або підказка «спочатку створіть категорію» (мінімальний UX, без нової фічі).

### Claude's Discretion
- Точний текст operator README (українською чи англійською в коментарях).
- Чи додати Vitest smoke на purge script (transaction mock) — за наявності часу в плані.
- Дрібні copy-tweaks empty state **лише** якщо smoke виявить 500 або порожній екран без тексту.
- Формат manual checklist файлу (`19-MANUAL-CHECKLIST.md`) — за зразком Phase 17/18.

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Requirements & roadmap
- `.planning/REQUIREMENTS.md` — DATA-01, DATA-02; Cloudinary purge out of scope
- `.planning/ROADMAP.md` — Phase 19 goal, success criteria (purge script, admin preserved, route smoke, dashboard zeros)
- `.planning/PROJECT.md` — v1.3 milestone intent (чиста БД для реального наповнення)

### Schema & seed
- `prisma/schema.prisma` — FK graph для порядку delete
- `prisma/seed.ts` — категорії + `seedAdmin()`; не плутати з purge
- `prisma/seed-products.ts` — reference для того, що seed **не** є частиною purge

### Prior phase decisions (empty catalog behavior)
- `.planning/phases/15-storefront-catalog-polish/15-CONTEXT.md` — D-15-02…D-15-05 hide empty categories; `CategoryGrid` null when none

### Implementation touchpoints (empty / lists)
- `src/components/home/category-grid.tsx` — homepage categories hidden when empty
- `src/app/(storefront)/katalog/page.tsx` — catalog listing + filters
- `src/app/(admin)/admin/page.tsx` — dashboard stats zeros
- `src/app/(admin)/admin/tovary/page.tsx` — products empty copy
- `src/app/(admin)/admin/kategorii/page.tsx` — categories empty copy
- `src/components/chat/admin-chat-inbox.tsx` — chat empty titles

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `prisma/seed.ts` + `src/lib/db.ts` — Prisma client pattern для нового purge script
- `CartEmpty`, `WishlistEmptyState`, `ProductGrid` `empty` prop — storefront empty UI вже є
- `getAdminDashboardStats()` — повертає 0 без throw при порожній БД (перевірити на smoke)
- `catalog-filters.tsx` — `!hasPriceBounds` гілка для порожнього каталогу

### Established Patterns
- Operator scripts: `tsx prisma/*.ts` + `dotenv/config` (як seed)
- Admin empty: короткий `text-muted-foreground` paragraph, не окремий EmptyState component
- Phase 15: `categoriesWithAvailableProducts()` — єдине джерело «непорожніх» категорій на storefront

### Integration Points
- `package.json` scripts — додати `db:purge`
- README (root) — operator subsection
- E2E/dev: після purge може знадобитися `prisma db seed` для e2e admin-chat (optional note в checklist)

</code_context>

<specifics>
## Specific Ideas

Користувач делегував усі чотири gray areas («все на свій вибір») — рішення вище відповідають DATA-01/02, мінімізують scope (без Cloudinary, без auto-seed, без нової homepage-секції).

</specifics>

<deferred>
## Deferred Ideas

- **Cloudinary asset purge** — з REQUIREMENTS out of scope; окрема фаза/запит оператора
- **Purge non-admin users** — не потрібно для «чистих товарів»; buyers лишаються
- **Marketing empty homepage block** («Каталог наповнюється») — свідомо не додаємо (YAGNI)

</deferred>

---

*Phase: 19-Database Purge & Empty States*
*Context gathered: 2026-05-19*
