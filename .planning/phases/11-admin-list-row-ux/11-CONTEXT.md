# Phase 11: Admin List Row UX - Context

**Gathered:** 2026-05-18
**Status:** Ready for planning

<domain>
## Phase Boundary

Єдиний UX адмін-списків: **клік по рядку** відкриває деталі; колонки «Відкрити» / «Редагувати» **прибрані**; CTA «Додати категорію» / «Додати товар» з **іконкою Plus**; клікабельні рядки з **`cursor-pointer`** і **keyboard-accessible** hover/focus (як у таблиці товарів).

**В scope:** `/admin/zamovlennia`, `/admin/kategorii`, `/admin/tovary`, **`/admin` dashboard** (блок «Останні замовлення»).

**Не в цій фазі:** inline зміна статусу замовлення в таблиці (Phase 12), сортування товарів (Phase 12), stock quantity (Phase 13), chat context menu (Phase 14), рефактор усіх admin tables на Data Table, нові action-колонки.

</domain>

<decisions>
## Implementation Decisions

### Unified row-click pattern (ADM-ORD-01, ADM-CAT-02, UX-02)
- **D-11-01:** **Один канонічний патерн** для всіх admin row-click таблиць цієї фази — не три різні підходи. Еталон поведінки: `src/components/admin/admin-products-table.tsx` (`role="link"`, `tabIndex={0}`, Enter/Space → navigate, `cursor-pointer`, hover/focus класи).
- **D-11-02:** Винести спільну логіку в **один shared модуль** (planner вибирає форму): напр. `lib/admin/clickable-table-row.ts` з `getAdminClickableRowProps(href)` **або** thin wrapper `AdminClickableTableRow` — мета: orders/categories/dashboard/products **не дублюють** розбіжні handler-и.
- **D-11-03:** **Мінімум client JS по всьому проєкту** (глобальний принцип оператора). Де page вже RSC — не робити всю сторінку client; найменша межа client (лише таблиця/рядок) або **server-friendly** навігація без `useRouter`, якщо еквівалентна за a11y.
- **D-11-04:** **Категорії** (`/admin/kategorii`): row → `/admin/kategorii/[id]`; прибрати колонку/лінк «Редагувати». Planner: пріоритет **мінімального client** (напр. client лише для `<tbody>` або stretched-link патерн) — не client-ити всю page без потреби.
- **D-11-05:** **Замовлення** (`orders-data-table.tsx`): прибрати колонку `actions` / «Відкрити»; row → `/admin/zamovlennia/[orderNumber]`. Таблиця вже client — row-click тут ок.
- **D-11-06:** **Dashboard** (`/admin` recent orders): теж **без «Відкрити»**, row-click на той самий detail URL — консистентність з основною таблицею замовлень.
- **D-11-07:** **Товари** — існуючий row-click **зберегти**; підключити до shared патерну (refactor props/classes, не змінювати UX).
- **D-11-08:** Візуальні стани рядка — **ті самі класи** що в `admin-products-table.tsx`: `hover:bg-muted/40 focus-visible:bg-muted/40 focus-visible:outline-none` (+ `cursor-pointer`, `transition-colors`).

### Plus on create CTAs (ADM-CAT-01, ADM-PRD-01)
- **D-11-09:** `lucide-react` **`Plus`**, **`className="size-4"`**, **зліва від тексту** на:
  - `/admin/kategorii` — «Додати категорію»
  - `/admin/tovary` — «Додати товар»
- **D-11-10:** **Той самий `Button` variant/size** що зараз (default primary на list pages) — лише додати іконку, не міняти hierarchy.
- **D-11-11:** Dashboard outline «Додати товар» — **Plus не обовʼязковий** у success criteria; planner **may** додати для симетрії, але не блокер фази.

### Interactive cells inside rows
- **D-11-12:** **Будь-який інтерактивний control у комірці рядка** (`Select`, `Button`, `Link`, майбутній status picker) — **`stopPropagation` на pointer events** (як `ProductListStatusSelect`). Зафіксувати як **обовʼязкове правило** для цієї фази і Phase 12.
- **D-11-13:** На orders у Phase 11 статус лишається **read-only badge** (inline edit — Phase 12); row-click не конфліктує.

### Verification
- **D-11-14:** Vitest за наявністю — smoke на shared row props/helper (якщо винесено); інакше component test на один table.
- **D-11-15:** Manual: orders/categories/dashboard row відкриває detail; Plus видно на create CTA; Tab+Enter на рядку працює; клік по status Select на товарах **не** навігує.

### Claude's Discretion
- Точна форма shared модуля (helper vs component).
- Реалізація categories/dashboard з найменшим client boundary.
- Чи додати Plus на dashboard «Додати товар» (D-11-11).

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Project & requirements
- `.planning/PROJECT.md` — v1.2 admin row UX, cursor-pointer
- `.planning/REQUIREMENTS.md` — ADM-ORD-01, ADM-CAT-01, ADM-CAT-02, ADM-PRD-01, UX-02
- `.planning/ROADMAP.md` — Phase 11 goal, success criteria
- `.planning/STATE.md` — current milestone v1.2

### Prior phase context
- `.planning/phases/08-admin-ux-chat-lifecycle/08-CONTEXT.md` — orders Data Table, categories plain table (D-08-14)
- `.planning/phases/08-admin-ux-chat-lifecycle/08-PATTERNS.md` — admin table patterns

### Code (MUST read)
- `src/components/admin/admin-products-table.tsx` — **canonical row-click** (reference)
- `src/components/admin/product-list-status-select.tsx` — `stopPropagation` on SelectTrigger
- `src/components/admin/orders-data-table.tsx` — remove actions column; add row navigation
- `src/app/(admin)/admin/kategorii/page.tsx` — categories table + create CTA
- `src/app/(admin)/admin/tovary/page.tsx` — products create CTA
- `src/app/(admin)/admin/page.tsx` — dashboard recent orders + optional create CTA
- `src/lib/admin/orders-url.ts` — orders list URL builder (unchanged filters)

### Downstream (read for integration, do not implement in Phase 11)
- `.planning/ROADMAP.md` Phase 12 — inline order status + `stopPropagation` on badge control

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `AdminProductsTable` — повний row-click + keyboard; рефакторити на shared helper, не переписувати з нуля.
- `ProductListStatusSelect` — зразок `stopPropagation` для nested controls.
- `OrdersDataTable` — client + TanStack; додати row props на `TableRow`.
- shadcn `Button` + `render={<Link />}` — патерн CTA на list pages.

### Established Patterns
- Admin list pages: RSC fetch + client table лише де потрібна інтерактивність.
- Українські лейбли; без окремих action-колонок після цієї фази (крім майбутніх inline controls у Phase 12).

### Integration Points
- Orders detail: `/admin/zamovlennia/[orderNumber]`
- Category edit: `/admin/kategorii/[id]`
- Product edit: `/admin/tovary/[id]` (вже)
- Dashboard recent orders → той самий order detail URL

</code_context>

<specifics>
## Specific Ideas

- Оператор: **один патерн**, не copy-paste три різні реалізації.
- **Мінімум client** — принцип на весь проєкт; categories/dashboard планувати server-first.
- Dashboard **включено** в row-click консистентність.
- Plus: зліва, `size-4` — підтверджено.

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope.

</deferred>

---

*Phase: 11-Admin List Row UX*
*Context gathered: 2026-05-18*
