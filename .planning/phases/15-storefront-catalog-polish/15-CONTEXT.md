# Phase 15: Storefront Catalog Polish - Context

**Gathered:** 2026-05-18
**Status:** Ready for planning

<domain>
## Phase Boundary

Покупець бачить **лише категорії з хоча б одним доступним товаром** (header, homepage, catalog sidebar/mobile). У сайдбарі каталогу — **shadcn Badge** замість тексту «— N». Сітка `/katalog` і `/katalog/[slug]` — **16 товарів на сторінку** з пагінацією в стилі admin tovary; URL `storinka` синхронізований через nuqs (вже є).

**Не в цій фазі:** нові фільтри, зміна сортування, quantity на картках, редизайн ProductCard, зміна логіки checkout/stock.

</domain>

<decisions>
## Implementation Decisions

### Що рахується «доступним товаром» (CAT-04)
- **D-15-01:** Без змін від Phase 13: `status: AVAILABLE` **і** `quantity >= 1` — використовувати `buildCatalogContextWhere()` / `buildPublicProductWhere()` як єдине джерело правди для count і лістингу.

### Порожні категорії — де ховати (CAT-04)
- **D-15-02:** **Header (desktop):** показувати перші **4 непорожні** категорії за `sortOrder` (пропускати з count 0, не добивати слоты іншими).
- **D-15-03:** **Homepage `CategoryGrid`:** не рендерити картку для категорій з count 0 (сітка стискається; секцію лишаємо, якщо є хоч одна непорожня).
- **D-15-04:** **Catalog sidebar:** не показувати рядки категорій з `productCount === 0`.
- **D-15-05:** **`StoreMobileNav`:** ті самі правила фільтрації, що в catalog sidebar (не показувати порожні).

### Badge у навігації каталогу (CAT-05)
- **D-15-06:** Замінити `formatCategoryLabel` («Назва — N») на **назва + `<Badge variant="secondary">` одразу після назви** (inline).
- **D-15-07:** Рядок **«Усі товари»** — також з Badge `totalProductCount`.
- **D-15-08:** Badge: `variant="secondary"`.
- **D-15-09:** Badge у **catalog sidebar** і в **header / mobile nav** лінках на категорії (поруч із назвою).

### Пагінація 16 (CAT-06)
- **D-15-10:** `pageSize: 16` на `/katalog` і `/katalog/[slug]` (замість поточних 24).
- **D-15-11:** Reuse **`AdminListPagination`** напряму (той самий компонент, що `/admin/tovary`).
- **D-15-12:** Пагінація **під сіткою** товарів.
- **D-15-13:** Не показувати пагінацію, якщо `totalPages <= 1` (включно з 0 товарів — лише empty state).
- **D-15-14:** Якщо `storinka` у URL поза діапазоном — **clamp** до валідної сторінки і **синхронізувати URL** через nuqs.
- **D-15-15:** Параметр `storinka` / ключ `сторінка` — **не змінювати** (вже в `catalogParsers`); скидання на `storinka: 1` при зміні фільтрів — лишити як зараз.

### Deep link на порожню категорію
- **D-15-16:** `/katalog/[slug]` для існуючої категорії з 0 available: **HTTP 200** + порожній стан (UA copy на розсуд planner), **не 404** і не redirect.

### Claude's Discretion
- Sitemap: виключити порожні категорії з генератора **лише якщо** вже є простий хук без роздування scope.
- Точний UA текст empty state для порожньої категорії та глобального «немає товарів».
- Чи потрібен окремий storefront wrapper навколо `AdminListPagination` для prop names — якщо reuse без зміни admin API.

</decisions>

<specifics>
## Specific Ideas

- Пагінація має відчуватися як admin tovary — той самий `AdminListPagination`.
- Badge — ненав'язливий secondary, не акцентний default.
- Header не повинен вести на «мертві» категорії з топ-4 слотів.

</specifics>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Requirements (v1.2 milestone)
- `.planning/REQUIREMENTS.md` — **CAT-04**, **CAT-05**, **CAT-06** (v1.2 definitions: empty categories, badge, pagination 16)
- `.planning/ROADMAP.md` — Phase 15 goal and success criteria

### Upstream phase
- `.planning/phases/13-product-stock-quantity/13-CONTEXT.md` — `quantity >= 1` + AVAILABLE defines storefront visibility

### Catalog implementation
- `src/server/services/catalog.service.ts` — `buildCatalogContextWhere`, `listCategoriesWithProductCounts`, `listPublicProducts`, `DEFAULT_PAGE_SIZE`
- `src/lib/catalog/search-params.ts` — `storinka` / `сторінка` nuqs parsers
- `src/app/(storefront)/katalog/page.tsx` — global catalog page wiring
- `src/app/(storefront)/katalog/[slug]/page.tsx` — category page wiring

### UI touchpoints
- `src/components/catalog/catalog-filters.tsx` — sidebar category list + `formatCategoryLabel`
- `src/components/layout/store-header.tsx` — header top-4 categories
- `src/components/layout/store-mobile-nav.tsx` — mobile category links
- `src/components/home/category-grid.tsx` — homepage category cards
- `src/components/admin/admin-list-pagination.tsx` — pagination UI to reuse

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `getCatalogCategoryCounts()` / `listCategoriesWithProductCounts()` — вже рахують з `buildCatalogContextWhere()`; фільтр порожніх — на рівні UI або додати helper `categoriesWithStock`.
- `AdminListPagination` — готовий UI для CAT-06.
- `catalogParsers` + `storinka` — URL sync вже працює; лишається pageSize і clamp OOB page.

### Established Patterns
- Фільтри скидають `storinka: 1` при зміні (`catalog-filters.tsx`, `catalog-toolbar.tsx`).
- Storefront header/mobile зараз беруть **усі** категорії з Prisma без count — потрібна зміна на filtered list.

### Integration Points
- Header, CategoryGrid, CatalogFiltersPanel, katalog pages — єдине джерело counts з catalog service.
- E2E: розширити catalog specs — hidden empty category, pagination page change.

</code_context>

<deferred>
## Deferred Ideas

- Окрема секція homepage «немає категорій» з CTA — не обговорювали; лише hide cards.
- Badge на ProductCard / PDP — out of scope (Phase 13).
- Сортування категорій у sidebar за count — не в цій фазі.

</deferred>

---

*Phase: 15-storefront-catalog-polish*
*Context gathered: 2026-05-18*
