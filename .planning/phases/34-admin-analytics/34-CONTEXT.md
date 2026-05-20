# Phase 34: Admin analytics - Context

**Gathered:** 2026-05-20
**Status:** Ready for planning

<domain>
## Phase Boundary

Admin analytics: оператор бачить KPI (замовлення, виручка, дзвінки) та тренди на окремій сторінці `/admin/analityka` (AN-01) і у preview-секції на головному dashboard `/admin` перед «Останні замовлення» (AN-02).

**In scope:** AN-01, AN-02 — сторінка аналітики + dashboard preview.
**Out of scope:** Call management UI (Phase 35 CALL-01…04), sidebar badges (Phase 36), period comparison (YoY), CSV export, mobile chart interactions.

</domain>

<decisions>
## Implementation Decisions

### Metrics scope
- **D-01:** Revenue includes ALL orders regardless of status (PENDING, DELIVERED, CANCELLED, etc.) — простіший запит, відображає загальний обсяг. Формула: `SUM(OrderItem.priceSnapshot × quantity)` per order, grouped by day.
- **D-02:** Revenue display format: `1 200 грн` — цілі числа (priceSnapshot зберігається в Int), пробіл як роздільник тисяч, без копійок.
- **D-03:** KPI summary cards: всього замовлень, загальна виручка, кількість callback-заявок — за вибраний діапазон.

### Time period / selector
- **D-04:** Operator selects period: **7 / 30 / 90 днів** — toggle/tab selector. Default: 30 днів.
- **D-05:** Period selector lives on `/admin/analityka`. Dashboard preview (AN-02) uses a fixed period (30 days, no selector) to keep dashboard clean.

### Analytics page layout (AN-01)
- **D-06:** Layout: KPI summary cards on top → period selector → 2 charts below.
  - Chart 1: line chart — тренд замовлень по днях (count per day).
  - Chart 2: line/area chart — тренд виручки по днях (revenue per day).
  - Callback count shown in KPI card only (not a separate chart — insufficient data volume for a useful trend).

### Dashboard preview (AN-02)
- **D-07:** Insert before «Останні замовлення»: 2 compact mini-charts (замовлення + виручка, last 30 days, no period selector) + link «Детальна аналітика» → `/admin/analityka`.
- **D-08:** Mini-charts should be compact (height ~120px) so they don't overwhelm the dashboard.

### Chart library
- **D-09 (Claude's discretion):** Use **shadcn chart** (recharts-based) — install via `npx shadcn@latest add chart`. Fits the existing shadcn/ui stack, consistent with project design tokens. No other chart library should be added.

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Requirements & roadmap
- `.planning/REQUIREMENTS.md` — AN-01, AN-02 (analytics requirements)
- `.planning/ROADMAP.md` — Phase 34 goal and success criteria

### Primary code touchpoints
- `src/app/(admin)/admin/page.tsx` — dashboard page (AN-02 preview inserted here, before «Останні замовлення»)
- `src/components/admin/stat-card.tsx` — existing KPI card pattern (reuse or extend for analytics KPIs)
- `src/server/services/admin-order.service.ts` — existing aggregation queries; add analytics queries here
- `prisma/schema.prisma` — Order (createdAt, status), OrderItem (priceSnapshot, quantity), CallbackRequest (createdAt)

### Data model notes
- Order has no `total` field — revenue = `SUM(OrderItem.priceSnapshot × quantity)` per order
- CallbackRequest has only `createdAt` + `phone` — no status yet (added in Phase 35)
- Revenue values are stored in Int (грн, no kopecks)

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `StatCard` (`src/components/admin/stat-card.tsx`) — use as KPI card for замовлення/виручка/дзвінки summary
- `getAdminDashboardStats` (`src/server/services/admin-order.service.ts`) — existing aggregation; add analytics queries alongside it
- shadcn/ui already installed — add `chart` component via CLI

### Established Patterns
- Admin pages: `space-y-8` root layout, `text-2xl font-semibold md:text-3xl` H1, section headings `text-lg font-semibold`
- Async RSC pages — server components fetch data directly, no client-side fetching needed for initial render
- Prisma `$queryRaw` or `groupBy` for time-series aggregation by day

### Integration Points
- `/admin/analityka` — new route in `src/app/(admin)/admin/analityka/page.tsx`
- Admin sidebar nav — add «Аналітика» link (nav items in `src/components/admin/admin-nav-items.ts`)
- Dashboard page — insert analytics preview section before `<section>…Останні замовлення…</section>`

</code_context>

<specifics>
## Specific Ideas

- Period selector: simple tab-style toggle (7 / 30 / 90), not a date-picker — keeps UX simple
- Dashboard preview charts: height ~120px, no axes labels or period toggle — purely visual trend
- Dashboard preview includes a single «Детальна аналітика →» link pointing to `/admin/analityka`

</specifics>

<deferred>
## Deferred Ideas

- CSV/Excel export of analytics data — post-v2.0
- Period comparison (поточний vs попередній) — post-v2.0
- Callback trend chart (потребує більше даних для корисності) — може бути додано в Phase 35
- Mobile chart touch interactions — not in scope for v2.0

</deferred>

---

*Phase: 34-admin-analytics*
*Context gathered: 2026-05-20*
