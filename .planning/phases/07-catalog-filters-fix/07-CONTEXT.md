# Phase 7: Catalog Filters Fix - Context

**Gathered:** 2026-05-17
**Status:** Ready for planning

<domain>
## Phase Boundary

Каталог (`/katalog`, `/katalog/[slug]`) **коректно фільтрує** за ціною (сервер + URL sync) і показує **лише релевантні бренди** для поточного контексту. UX ціни — **shadcn dual-thumb Slider** з полями «від/до», межі з реальних цін товарів. Додати **активні чіпси** фільтрів над сіткою.

**Не в цій фазі:** wishlist, адмін Sidebar/Data Table (Phase 8), зображення категорій (Phase 10), Playwright E2E на slider/цену, зміна URL-контракту (`cina-vid`, `brend`, `сторінка`).

</domain>

<decisions>
## Implementation Decisions

### Price filter & Slider (CAT-01, CAT-02)
- **D-07-01:** Встановити shadcn **`slider`**; секція «Ціна, ₴» — **dual-thumb Slider** (мін + макс) **і** поля «від» / «до», синхронізовані з URL `cina-vid` / `cina-do`.
- **D-07-02:** Крок слайдера і полів — **50 ₴** (цілі UAH).
- **D-07-03:** Межі слайдера (`min`/`max` thumb range) = **найдешевший** і **найдорожчий** товар у **поточному контексті**: на `/katalog` — по всіх AVAILABLE; на `/katalog/[slug]` — лише в цій категорії. Порожній контекст — graceful fallback (planner: disable slider або 0–0).
- **D-07-04:** **Mobile** (sheet) — той самий **Slider**, не окремий UX лише з inputs.
- **D-07-05:** Оновлення URL під час перетягування — **throttle 200 ms** (не чекати `onValueCommit`; не debounce-after-idle).
- **D-07-06:** Будь-яка зміна ціни (slider або input) скидає **`сторінка` → 1**.
- **D-07-07:** **CAT-02:** Зафіксувати баг, коли `?cina-vid=13000` не відсікає дешевші товари — success criteria roadmap обовʼязкові; root cause знаходить researcher/planner (логіка вже є в `parsersToFilters` + `buildPublicProductWhere` — перевірити parse/cache/Prisma path).

### Brands per context (CAT-03)
- **D-07-08:** `getDistinctBrands(categoryId?: string)` — без `categoryId` = усі бренди AVAILABLE каталогу; з `categoryId` = лише бренди товарів цієї категорії.
- **D-07-09:** Категорійні сторінки передають `category.id` у `getDistinctBrands`; глобальний `/katalog` — без categoryId.
- **D-07-10:** При переході між категоріями **зберігати `brend` в URL**, якщо бренд є в списку нової категорії (напр. Bosch → інша категорія з Bosch).
- **D-07-11:** Якщо `brend` у URL **не входить** у brands поточної категорії (напр. Bosch на «телефонах») — **тихий `replace` URL** без `brend`, **`сторінка=1`**, **без toast**. Grid показує категорію без фільтра бренду.

### Active filter chips
- **D-07-12:** Додати **активні чіпси** над сіткою товарів: **бренд**, **діапазон ціни** (UAH), **стан** (multi) — кожен знімається окремо (×); «Скинути фільтри» в сайдбарі лишається.
- **D-07-13:** Чіпси синхронізуються з nuqs / тими ж `catalogParsers` (не дублювати стан).

### Verification
- **D-07-14:** **Vitest:** розширити/додати тести `parsersToFilters`, `getDistinctBrands(categoryId?)`, `buildPublicProductWhere` (price gte/lte).
- **D-07-15:** **Без** нового Playwright spec на ціну/slider — **manual checklist** з ROADMAP success criteria (slider → grid оновився).
- **D-07-16:** Існуючий `e2e/catalog-filters-url.spec.ts` — не ламати; опційно розширити лише якщо не суперечить D-07-15.

### Claude's Discretion
- Реалізація `getCatalogPriceBounds(categoryId?)` (один query min/max price у kopiyky → UAH для UI).
- Механізм D-07-11: server `redirect` у RSC category page vs client `useEffect` + `setParams` — обрати найменш blink.
- Компонент чіпсів: новий `active-filter-chips.tsx` vs inline у toolbar.
- Стилі Slider (labels, format `formatPriceKopiyky` для відображення меж).

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Project & requirements
- `.planning/PROJECT.md` — v1.1 catalog bugs, shadcn Slider
- `.planning/REQUIREMENTS.md` — CAT-01, CAT-02, CAT-03
- `.planning/ROADMAP.md` — Phase 7 goal, success criteria, Vitest/Playwright note
- `.planning/STATE.md` — milestone v1.1 position

### Prior phase design
- `.planning/phases/02-catalog-discovery/02-UI-SPEC.md` — URL contract (`cina-vid`, `brend`), Slider + chips inventory, filter UX
- `.planning/phases/02-catalog-discovery/02-04-PLAN.md` — original filter implementation notes (step 500 → **superseded by D-07-02: step 50**)

### Research
- `.planning/research/PITFALLS.md` — thin filter URL / SEO (noindex already on filtered category pages)

### Code (primary touchpoints)
- `src/lib/catalog/search-params.ts` — `catalogParsers`, `parsersToFilters`, `catalogUrlKeys`
- `src/lib/catalog/search-params.test.ts`
- `src/server/services/catalog.service.ts` — `buildPublicProductWhere`, `getDistinctBrands`, `listPublicProducts`
- `src/server/services/catalog.service.test.ts`
- `src/server/validators/product.ts` — `catalogFiltersSchema`
- `src/components/catalog/catalog-filters.tsx` — Slider + inputs
- `src/app/(storefront)/katalog/page.tsx`
- `src/app/(storefront)/katalog/[slug]/page.tsx`
- `src/lib/catalog/metadata.ts` — `hasActiveCatalogFilters` (may extend for chips)
- `e2e/catalog-filters-url.spec.ts` — existing URL sync tests

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `catalogParsers` + `useQueryStates` + `catalogUrlKeys` — URL sync pattern (nuqs)
- `parsersToFilters` — UAH → kopiyky (`×100`)
- `buildPublicProductWhere` — `price.gte` / `price.lte`, `brand`, `categoryId`
- `CatalogFilters` — sidebar; extend with Slider, pass `priceBounds` + `brands` props
- `CatalogToolbar` — mount point for chips above grid
- `formatPriceKopiyky` / `PriceDisplay` — формат ₴ для чіпсів і labels
- `hasActiveCatalogFilters` — metadata noindex when filters active

### Established Patterns
- Server Components fetch filters + products; client islands for interactive filters
- Filter change → `storinka: 1` via `setParams`
- shadcn: `select`/`input` already; **slider not installed yet** — `npx shadcn@latest add slider` in plan

### Integration Points
- Both catalog pages: pass `categoryId` to `getDistinctBrands` + price bounds query on category page
- Category page: enforce D-07-11 before/after `listPublicProducts`
- New/updated: price bounds helper in `catalog.service.ts`, `active-filter-chips.tsx` (or equivalent)

</code_context>

<specifics>
## Specific Ideas

- Slider — **дві точки** (range), не два окремі слайдери.
- Приклад невалідного бренду: **Bosch** в URL на категорії **телефони**, де Bosch немає — URL має очиститись без повідомлення.
- Throttle **200 ms** під час drag — явна вимога користувача.
- Чіпси — як у задумі Phase 2, нарешті в scope v1.1.

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope.

</deferred>

---

*Phase: 07-Catalog Filters Fix*
*Context gathered: 2026-05-17*
