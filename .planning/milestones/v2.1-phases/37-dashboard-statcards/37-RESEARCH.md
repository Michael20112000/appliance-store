# Phase 37: Dashboard StatCards - Research

**Researched:** 2026-05-21
**Domain:** Admin dashboard RSC — extending StatCard grid with calls and chat counts
**Confidence:** HIGH

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| ADM-DASH-05 | Адмін-дашборд відображає StatCard з кількістю нових дзвінків (непрочитані / нові) | `unresolvedCallbacks` from `getAdminSidebarCounts()` counts `CallbackRequest` where `status=PENDING` AND `archivedAt=null` — directly usable |
| ADM-DASH-06 | Адмін-дашборд відображає StatCard з кількістю активних чатів (непрочитані повідомлення) | `unreadChats` from `getAdminSidebarCounts()` counts `Conversation` with `status=OPEN`, `lastMessageSender=BUYER`, `lastMessageAt > adminLastReadAt` — directly usable |
</phase_requirements>

---

## Summary

Phase 37 adds two StatCards to the admin dashboard at `/admin`. The entire phase is a single-file RSC edit: `src/app/(admin)/admin/page.tsx`.

The admin layout (`src/app/(admin)/admin/layout.tsx`) already calls `getAdminSidebarCounts()` to power sidebar badges. That service returns `unresolvedCallbacks` (pending+non-archived CallbackRequest count) and `unreadChats` (open conversations with unread buyer messages). These are exactly the values needed for the two new StatCards.

The current dashboard page calls `getAdminDashboardStats()` from `admin-order.service`, which covers orders and products. The strategy for Phase 37 is to add a second parallel fetch of `getAdminSidebarCounts()` in the page's `Promise.all`, then render two additional `<StatCard>` components in the grid using data from that second fetch. The grid is already responsive (`sm:grid-cols-2 lg:grid-cols-3`) and expanding from 3 to 5 cards only requires the grid to reflow — no layout changes needed.

**Primary recommendation:** Add `getAdminSidebarCounts()` to the `Promise.all` in `admin/page.tsx`, destructure `unresolvedCallbacks` and `unreadChats`, and render two more `<StatCard>` instances after the existing three. No new services, no schema changes.

---

## Architectural Responsibility Map

| Capability | Primary Tier | Secondary Tier | Rationale |
|------------|-------------|----------------|-----------|
| Fetch counts for StatCards | API/Backend (RSC) | — | Page is an `async` RSC; data fetched server-side before render |
| Render StatCard grid | Frontend Server (SSR/RSC) | — | `StatCard` is a pure presentational RSC component, no client state |
| Count new calls | Database/Storage | — | Prisma query in `getAdminSidebarCounts()`, already live |
| Count active chats | Database/Storage | — | `countUnreadForAdmin()` in `chat.service`, already live |

---

## Standard Stack

### Core (all already in project — no new installs)

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| Next.js (RSC) | 16 | Async RSC page for server data fetch | Project standard [ASSUMED] |
| Prisma | 7 | ORM powering existing service queries | Project standard [ASSUMED] |
| lucide-react | project version | Icons for StatCards | Already used: `Phone`, `MessageSquare` in nav [VERIFIED: codebase] |
| Tailwind CSS | project version | Layout/responsive grid | Project standard [ASSUMED] |

### No New Packages

This phase requires zero new dependencies. All data access, UI components, and icons are already in the project.

---

## Package Legitimacy Audit

No packages are installed in this phase. Audit: N/A.

---

## Architecture Patterns

### Data Flow Diagram

```
GET /admin
  └─> AdminDashboardPage (RSC, async)
        └─> Promise.all([
              getAdminDashboardStats()        ← admin-order.service (orders, products)
              getAdminSidebarCounts()         ← admin-sidebar.service (calls, chats) [NEW]
            ])
              └─> DB queries (Prisma, parallel)
        └─> <StatCard> ×5 in responsive grid
              ├─ Нові замовлення  (stats.pendingOrders)
              ├─ Товари в наявності (stats.inStockProducts)
              ├─ Розпродано       (stats.outOfStockProducts)
              ├─ Нові дзвінки     (sidebarCounts.unresolvedCallbacks) [NEW]
              └─ Активні чати     (sidebarCounts.unreadChats)         [NEW]
```

### Existing StatCard Component

`src/components/admin/stat-card.tsx` [VERIFIED: codebase] — pure RSC, no client directives.

```typescript
// Source: src/components/admin/stat-card.tsx
type StatCardProps = {
  label: string;
  count: number;
  href?: string;
  className?: string;
  icon?: React.ElementType;
};
```

- Renders as `<Link>` when `href` is provided, plain `<div>` otherwise
- `icon` prop: any `React.ElementType` (Lucide icon component reference, not JSX)
- `count` is `number` — both `unresolvedCallbacks` and `unreadChats` are `number` [VERIFIED: codebase]

### Existing Grid Layout

```tsx
// Source: src/app/(admin)/admin/page.tsx (lines 20-39)
<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
  <StatCard label="Нові замовлення" count={stats.pendingOrders} href="..." icon={ShoppingBag} />
  <StatCard label="Товари в наявності" count={stats.inStockProducts} href="..." icon={Package} />
  <StatCard label="Розпродано" count={stats.outOfStockProducts} href="..." icon={PackageX} />
</div>
```

Adding 2 more `<StatCard>` nodes to this same `div` is sufficient — `grid-cols-3` wraps naturally to 5 cards (3+2). No grid class changes required.

### Data Sources (exact field names)

`getAdminSidebarCounts()` returns `AdminSidebarBadgeCounts` [VERIFIED: codebase]:
```typescript
// Source: src/server/services/admin-sidebar.service.ts
type AdminSidebarBadgeCounts = {
  categories: number;
  products: number;
  pendingOrders: number;
  unreadChats: number;          // ← ADM-DASH-06: active chats count
  unresolvedCallbacks: number;  // ← ADM-DASH-05: new calls count
};
```

- `unresolvedCallbacks`: `prisma.callbackRequest.count({ where: { status: "PENDING", archivedAt: null } })` [VERIFIED: codebase]
- `unreadChats`: `countUnreadForAdmin()` — counts `Conversation` where `status=OPEN`, `lastMessageSender=BUYER`, `lastMessageAt > adminLastReadAt` [VERIFIED: codebase]

### Icons Already Available

`src/components/admin/admin-nav-items.ts` already imports from lucide-react [VERIFIED: codebase]:
- `Phone` — used for `/admin/dzvinky` nav item → use for "Нові дзвінки" StatCard
- `MessageSquare` — used for `/admin/chaty` nav item → use for "Активні чати" StatCard

### Recommended Implementation

```typescript
// src/app/(admin)/admin/page.tsx — modified page
import { Phone, MessageSquare, ... } from "lucide-react";
import { getAdminSidebarCounts } from "@/server/services/admin-sidebar.service";

export default async function AdminDashboardPage() {
  const [stats, sidebarCounts, analyticsPreview] = await Promise.all([
    getAdminDashboardStats(),
    getAdminSidebarCounts(),
    getDashboardAnalyticsPreview(),
  ]);

  return (
    // ...
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      <StatCard label="Нові замовлення" count={stats.pendingOrders} href="/admin/zamovlennia?filter=new" icon={ShoppingBag} />
      <StatCard label="Товари в наявності" count={stats.inStockProducts} href="/admin/tovary?stock=in_stock" icon={Package} />
      <StatCard label="Розпродано" count={stats.outOfStockProducts} href="/admin/tovary?stock=out_of_stock" icon={PackageX} />
      <StatCard label="Нові дзвінки" count={sidebarCounts.unresolvedCallbacks} href="/admin/dzvinky" icon={Phone} />
      <StatCard label="Активні чати" count={sidebarCounts.unreadChats} href="/admin/chaty" icon={MessageSquare} />
    </div>
  );
}
```

### Anti-Patterns to Avoid

- **Duplicate Prisma queries:** Do not add new `prisma.callbackRequest.count` or `countUnreadForAdmin` calls in the dashboard page or a new service — `getAdminSidebarCounts()` already does this. Reuse it.
- **Introducing a new service:** Do not create `admin-dashboard-stats.service.ts` combining order + sidebar queries — the planner should keep concerns separate and compose at the page level.
- **Parallel double-fetch:** The layout (`layout.tsx`) already calls `getAdminSidebarCounts()` for sidebar badges. The RSC page calling it again is a second DB hit per request, but Next.js does not deduplicate across layout+page boundaries in this project setup (no `React.cache` used). This is acceptable — the cost is 5 cheap COUNT queries and this matches the existing pattern for `pendingOrders` which is independently counted by both `getAdminDashboardStats()` and `getAdminSidebarCounts()`.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Count pending calls | Custom Prisma query in page | `getAdminSidebarCounts().unresolvedCallbacks` | Already tested, correct filter (PENDING + archivedAt null) |
| Count unread chats | Custom `countUnreadForAdmin` call | `getAdminSidebarCounts().unreadChats` | Already tested, composite field comparison logic |
| StatCard UI | New card component | `<StatCard>` from `@/components/admin/stat-card` | Existing component, matches visual design |

---

## Common Pitfalls

### Pitfall 1: Wrong field name for calls count
**What goes wrong:** Using `pendingOrders` instead of `unresolvedCallbacks`, or trying to read a non-existent `newCalls` field.
**Why it happens:** `AdminSidebarBadgeCounts` has 5 fields; `unresolvedCallbacks` is the callbacks count.
**How to avoid:** Destructure directly: `const { unresolvedCallbacks, unreadChats } = sidebarCounts;`
**Warning signs:** TypeScript error — `Property 'newCalls' does not exist on type 'AdminSidebarBadgeCounts'`

### Pitfall 2: Icon import omission
**What goes wrong:** Forgetting to add `Phone` and `MessageSquare` to the lucide-react import in page.tsx — they are currently only imported in `admin-nav-items.ts`.
**Why it happens:** Icons are not re-exported from nav items — each file imports from lucide-react directly.
**How to avoid:** Add to the existing import line: `import { ..., Phone, MessageSquare } from "lucide-react";`

### Pitfall 3: Grid layout not wrapping correctly
**What goes wrong:** Expecting the grid to show 2+3 rows but getting unexpected whitespace at `lg` breakpoint.
**Why it happens:** `lg:grid-cols-3` with 5 items produces 2 rows (3+2), which is correct. No issue exists.
**How to avoid:** No action needed — grid reflows are automatic. Do not add `lg:grid-cols-5`.

---

## Validation Architecture

### Test Framework

| Property | Value |
|----------|-------|
| Framework | Vitest 4.1.6 |
| Config file | `vitest.config.ts` |
| Quick run command | `npx vitest run src/server/services/admin-order.service.test.ts` |
| Full suite command | `npx vitest run` |

### Phase Requirements → Test Map

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| ADM-DASH-05 | `unresolvedCallbacks` count surfaces in page | unit (service) | `npx vitest run src/server/services/admin-sidebar.service.test.ts` | ✅ |
| ADM-DASH-06 | `unreadChats` count surfaces in page | unit (service) | `npx vitest run src/server/services/admin-sidebar.service.test.ts` | ✅ |
| ADM-DASH-05/06 | Page renders both new StatCards with correct data | manual/smoke | Load `/admin`, verify cards visible | N/A |

### Wave 0 Gaps

None — existing test infrastructure covers service layer. The page change is a simple RSC composition with no branching logic; no additional unit test needed (the underlying counts are already tested at the service layer).

---

## Security Domain

| ASVS Category | Applies | Standard Control |
|---------------|---------|-----------------|
| V2 Authentication | yes (page is admin-only) | `requireAdmin()` called in `AdminLayout` — RSC page is protected by layout [VERIFIED: codebase] |
| V4 Access Control | yes | Same — all `/admin/*` routes require admin session via layout |
| V5 Input Validation | no | No user input; data comes from Prisma counts |

No new attack surface. The two new StatCards read server-side counts only. Authentication enforcement is already handled by `requireAdmin()` in `src/app/(admin)/admin/layout.tsx`.

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Separate service call per StatCard | Single `Promise.all` with shared services | Phase 36 established pattern | No N+1 per page render |
| No sidebar badge counts | `getAdminSidebarCounts()` returns 5 counts | Phase 36 | Phase 37 can reuse without new queries |

---

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | Next.js 16 does not deduplicate `getAdminSidebarCounts()` between layout and page (called twice per request) | Architecture Patterns (anti-patterns) | Low — if deduplication exists, performance improves; correctness is unaffected |
| A2 | `lg:grid-cols-3` with 5 items produces an acceptable 3+2 layout with no visual breakage | Architecture Patterns | Low — easily verified in browser; grid wrapping is CSS standard behavior |

---

## Open Questions

None. All key research questions answered from codebase inspection.

---

## Environment Availability

Step 2.6: SKIPPED (no external dependencies — phase is a single RSC file edit reusing existing services).

---

## Sources

### Primary (HIGH confidence)
- `src/app/(admin)/admin/page.tsx` — current dashboard RSC, StatCard usage, `Promise.all` pattern [VERIFIED: codebase]
- `src/components/admin/stat-card.tsx` — full StatCard component and props [VERIFIED: codebase]
- `src/server/services/admin-sidebar.service.ts` — `getAdminSidebarCounts()` return type and field names [VERIFIED: codebase]
- `src/server/services/chat.service.ts` — `countUnreadForAdmin()` logic [VERIFIED: codebase]
- `src/server/services/admin-sidebar.service.test.ts` — confirms all 5 count fields, test coverage [VERIFIED: codebase]
- `src/components/admin/admin-nav-items.ts` — confirms `Phone` and `MessageSquare` icons for calls/chats [VERIFIED: codebase]
- `prisma/schema.prisma` — `CallbackRequest` model with `status` (PENDING/CONSULTED) and `archivedAt` [VERIFIED: codebase]
- `src/app/(admin)/admin/layout.tsx` — confirms `requireAdmin()` + `getAdminSidebarCounts()` pattern [VERIFIED: codebase]

### Secondary (MEDIUM confidence)
None needed — all required information found in codebase.

### Tertiary (LOW confidence)
None.

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — entire implementation uses verified existing code
- Architecture: HIGH — single-file RSC change, pattern fully established
- Pitfalls: HIGH — identified from direct code inspection

**Research date:** 2026-05-21
**Valid until:** 2026-06-21 (stable codebase, no third-party changes)
