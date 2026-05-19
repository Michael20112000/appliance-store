# Phase 16: Shadcn Select Audit & Verify - Context

**Gathered:** 2026-05-19
**Status:** Ready for planning

<domain>
## Phase Boundary

Замінити **усі native `<select>` у `src/components`** (storefront catalog + admin forms) на shadcn `Select`. **Верифікувати** PDP gallery (Carousel + Dialog) і політику auto slug (create без поля, immutable на edit). Закрити milestone gate: `npm run build` і тести green.

**Не в цій фазі:** нові фільтри, редизайн PDP, зміна логіки slug collision на бекенді, swipe-gestures як обовʼязкова вимога, playwright для gallery (лише manual checklist), shared FormSelect wrapper, зміна checkout/delivery UI.

</domain>

<decisions>
## Implementation Decisions

### Native select → shadcn (UX-01)
- **D-16-01:** **5 відомих місць** для міграції: `catalog-toolbar.tsx` (sort), `catalog-filters.tsx` (brand), `product-form.tsx` (categoryId, condition, status).
- **D-16-02:** **Catalog (nuqs):** controlled `Select` + `onValueChange` → `setParams` (той самий підхід, що `OrderListStatusSelect`); **без** react-hook-form на storefront catalog.
- **D-16-03:** **Product form (RHF):** `Controller` з `Select` / `SelectTrigger` / `SelectValue` / `SelectContent` / `SelectItem` для categoryId, condition, status.
- **D-16-04:** **Без shared wrapper** (`FormSelectField` тощо) — inline у `product-form.tsx` (YAGNI, 3 поля).
- **D-16-05:** При зміні sort або brand — **скидати `storinka: 1`** (як зараз у native onChange).
- **D-16-06:** Brand filter: `SelectItem` для «Усі бренди» з sentinel value; `onValueChange` мапить у `brend: null` у nuqs (еквівалент `value=""` зараз).

### Select UX / layout
- **D-16-07:** **catalog-toolbar** sort: компактна фіксована ширина (~`w-36` / `w-[9rem]`), узгоджена з поточним inline select.
- **D-16-08:** **catalog-filters** brand: `w-full` у сайдбарі (як native).
- **D-16-09:** **product-form** selects: full width як `Input` (`w-full` на trigger).
- **D-16-10:** Зберегти **UA aria-label** на sort (`Сортування`); опції — ті самі UA labels («Новіші», «Ціна ↑», «Ціна ↓», «Усі бренди», condition labels з `conditionLabelUa`).

### Grep audit (success criteria #1)
- **D-16-11:** CI/plan verify: `grep -r '<select' src/components` — **0 matches** після міграції (ROADMAP literal scope).
- **D-16-12:** Якщо `<select>` зʼявиться в `src/app` — **не блокер** цієї фази, але зафіксувати в plan notes; не розширювати scope без окремої фази.

### PDP gallery verify (POL-01)
- **D-16-13:** Підхід: **`16-MANUAL-CHECKLIST.md`** — сценарії: 1 фото; 3+ фото; mobile ~375px; tap main → dialog; стрілки в dialog; sync thumb ↔ main після close.
- **D-16-14:** **Фіксимо лише blocking баги**, знайдені під час manual pass (не рефакторинг gallery «про всяк випадок»).
- **D-16-15:** **Swipe в dialog — nice-to-have**, не acceptance blocker; tap + carousel arrows достатньо.
- **D-16-16:** **Без playwright** для gallery в цій фазі — manual checklist як gate.

### Auto slug (POL-02)
- **D-16-17:** **Create:** поля slug **немає** в UI (вже так); додати **hint під title/name**: «URL згенерується з назви» (UA copy на розсуд planner).
- **D-16-18:** **Edit:** slug **immutable** — без input; product edit лишає read-only URL `/tovar/{slug}`; category — без slug UI.
- **D-16-19:** Backend `slugFromName` / `resolveUniqueProductSlug` — **не змінювати** в цій фазі, лише verify що create path не очікує slug з форми.
- **D-16-20:** Optional `slug` у Zod/API для programmatic use — лишити; UI на create **ніколи не надсилає** slug.

### Build gate
- **D-16-21:** Плани закінчуються **`npm run build` + unit tests green** (ROADMAP success #5); e2e smoke для selects — на розсуд planner (мінімум grep + існуючі catalog tests).

### Claude's Discretion
- Точний UA текст hint для auto slug.
- Чи потрібен `SelectGroup` / separators у product-form (ймовірно ні).
- Vitest для catalog Select wiring — лише якщо trivial mock nuqs; не обовʼязково окремий plan.

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Requirements (v1.2 milestone)
- `.planning/REQUIREMENTS.md` — **UX-01**, **POL-01**, **POL-02**
- `.planning/ROADMAP.md` — Phase 16 goal and success criteria
- `.planning/PROJECT.md` — v1.2 cross-cutting shadcn Select + verify/polish

### Select migration targets (grep baseline)
- `src/components/catalog/catalog-toolbar.tsx` — native sort select
- `src/components/catalog/catalog-filters.tsx` — native brand select
- `src/components/admin/product-form.tsx` — native categoryId, condition, status

### Reference implementations (shadcn Select)
- `src/components/admin/order-list-status-select.tsx` — controlled Select, `stopPropagation` pattern (admin table; not needed on forms)
- `src/components/admin/product-list-status-select.tsx` — product status in table
- `src/components/ui/select.tsx` — shadcn primitive

### Slug (verify only)
- `src/server/services/admin-product.service.ts` — `createProduct`, `slugFromName`, `resolveUniqueProductSlug`
- `src/server/services/admin-catalog.service.ts` — `createCategory`, `slugFromName`
- `src/components/admin/category-form.tsx` — no slug field (create/edit)
- `src/server/validators/admin-product.ts` — optional `slug` in schema

### Gallery (verify only)
- `src/components/catalog/product-gallery.tsx` — Carousel + Dialog lightbox
- `.planning/phases/02-catalog-discovery/02-UI-SPEC.md` — ProductGallery specs (reference for manual checklist)
- `.planning/phases/06-polish-launch/06-04-PLAN.md` — prior PERF/gallery work

### Catalog URL state (Select must preserve)
- `src/lib/catalog/search-params.ts` — `sort`, `brend`, `storinka` nuqs parsers

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `src/components/ui/select.tsx` — вже встановлений (Phase 12 admin status)
- `OrderListStatusSelect` / `ProductListStatusSelect` — еталон controlled Select + toast/errors
- `catalogParsers` + `useQueryStates` — catalog toolbar/filters must keep URL sync

### Established Patterns
- Admin table status: `SelectTrigger` + `SelectContent finalFocus={false}` + `SelectItem`
- Product form: react-hook-form + `Input`/`Label`; selects зараз `register()` на native — міграція на `Controller`
- Slug: server auto on create; edit shows storefront URL read-only in product-form

### Integration Points
- `catalog-toolbar` / `catalog-filters` — client components, nuqs `setParams`
- `product-form` — `createProductAction` / `updateProductAction`; no slug in form values today
- `product-gallery` — used on PDP `/tovar/[slug]`; verify only unless blocker found

</code_context>

<specifics>
## Specific Ideas

- Select у каталозі має відчуватися як решта shadcn admin/storefront — не ламати nuqs deep links.
- Gallery verify — швидкий manual pass на реальному девайсі/375px, не роздувати scope swipe.
- Hint про auto slug — короткий, під полем назви, не окремий блок.

</specifics>

<deferred>
## Deferred Ideas

- Playwright smoke для PDP gallery dialog — окрема фаза / post-milestone
- Shared `FormSelectField` wrapper — YAGNI відхилено
- Swipe gestures у gallery dialog — nice-to-have, не v1.2 gate
- Grep `<select>` по всьому `src/` — за межами ROADMAP; лише `src/components`

</deferred>

---

*Phase: 16-Shadcn Select Audit & Verify*
*Context gathered: 2026-05-19*
