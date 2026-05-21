# Phase 36: Admin Sidebar Badges - Pattern Map

**Mapped:** 2026-05-21
**Files analyzed:** 4 (1 new, 3 modified)
**Analogs found:** 4 / 4

---

## File Classification

| New/Modified File | Role | Data Flow | Closest Analog | Match Quality |
|---|---|---|---|---|
| `src/server/services/admin-sidebar.service.ts` | service | request-response (read-only aggregation) | `src/server/services/callback-request.service.ts` (`getCallbackViewCounts`) + `src/server/services/admin-order.service.ts` (`getAdminDashboardStats`) | exact |
| `src/server/services/admin-sidebar.service.test.ts` | test | — | `src/server/services/callback-request.service.test.ts` + `src/server/services/chat.service.test.ts` | exact |
| `src/components/admin/app-sidebar.tsx` | component | request-response (prop-driven render) | self (existing chat badge pattern to extend) | exact |
| `src/components/admin/admin-sidebar-shell.tsx` | component | request-response (prop bridge) | self (existing `unreadChatCount` prop to replace) | exact |
| `src/app/(admin)/admin/layout.tsx` | route/layout | request-response (RSC fetch) | self (existing `countUnreadForAdmin` call to replace) | exact |

---

## Pattern Assignments

### `src/server/services/admin-sidebar.service.ts` (service, read-only aggregation) — NEW

**Analogs:**
- `src/server/services/callback-request.service.ts` lines 1-3, 84-93 — import style and `Promise.all` parallel count pattern
- `src/server/services/admin-order.service.ts` lines 1-3, 134-153 — parallel counts with `status: "PENDING"` filter

**Imports pattern** (from `callback-request.service.ts` lines 1-3):
```typescript
import { prisma } from "@/lib/db";
// Note: no Prisma type import needed for counts-only service
// Cross-service import pattern (from chat.service.ts countUnreadForAdmin):
import { countUnreadForAdmin } from "@/server/services/chat.service";
```

**Type export pattern** (co-located with service function — project convention):
```typescript
// callback-request.service.ts lines 18-25: types declared alongside service
export type AdminSidebarBadgeCounts = {
  categories: number;
  products: number;
  pendingOrders: number;
  unreadChats: number;
  unresolvedCallbacks: number;
};
```

**Core parallel count pattern** (from `admin-order.service.ts` lines 134-153):
```typescript
export async function getAdminDashboardStats() {
  const [pendingOrders, inStockProducts, outOfStockProducts, recentOrders] =
    await Promise.all([
      prisma.order.count({ where: { status: "PENDING" } }),
      prisma.product.count({ where: { quantity: { gte: 1 } } }),
      prisma.product.count({ where: { quantity: 0 } }),
      prisma.order.findMany({ take: 5, orderBy: { createdAt: "desc" }, include: { items: true } }),
    ]);
  return { pendingOrders, inStockProducts, outOfStockProducts, recentOrders: recentOrders.map(mapOrderSummary) };
}
```

**Parallel count with `archivedAt: null` filter** (from `callback-request.service.ts` lines 84-93):
```typescript
export async function getCallbackViewCounts(): Promise<{ active: number; archive: number }> {
  const [active, archive] = await Promise.all([
    prisma.callbackRequest.count({ where: { archivedAt: null } }),
    prisma.callbackRequest.count({ where: { archivedAt: { not: null } } }),
  ]);
  return { active, archive };
}
```

**Combined target pattern for new service:**
```typescript
import { prisma } from "@/lib/db";
import { countUnreadForAdmin } from "@/server/services/chat.service";

export type AdminSidebarBadgeCounts = {
  categories: number;
  products: number;
  pendingOrders: number;
  unreadChats: number;
  unresolvedCallbacks: number;
};

export async function getAdminSidebarCounts(): Promise<AdminSidebarBadgeCounts> {
  const [categories, products, pendingOrders, unreadChats, unresolvedCallbacks] =
    await Promise.all([
      prisma.category.count(),
      prisma.product.count(),
      prisma.order.count({ where: { status: "PENDING" } }),
      countUnreadForAdmin(),
      prisma.callbackRequest.count({ where: { status: "PENDING", archivedAt: null } }),
    ]);
  return { categories, products, pendingOrders, unreadChats, unresolvedCallbacks };
}
```

---

### `src/server/services/admin-sidebar.service.test.ts` (test) — NEW

**Analogs:**
- `src/server/services/callback-request.service.test.ts` lines 1-36 — `vi.mock("@/lib/db")` with model-level mocks, import-after-mock ordering
- `src/server/services/chat.service.test.ts` lines 1-43 — mock pattern with `conversation.fields` required for `countUnreadForAdmin`

**Mock setup pattern** (from `callback-request.service.test.ts` lines 1-13):
```typescript
import { describe, expect, it, vi, beforeEach } from "vitest";

vi.mock("@/lib/db", () => ({
  prisma: {
    callbackRequest: {
      count: vi.fn(),
      // ... other methods
    },
  },
}));

import { prisma } from "@/lib/db";
import { functionUnderTest } from "./service-under-test";
```

**Critical: `conversation.fields` mock** (from `chat.service.test.ts` lines 21-43):
```typescript
vi.mock("@/lib/db", () => ({
  prisma: {
    conversation: {
      fields: { adminLastReadAt: "adminLastReadAt" }, // REQUIRED for countUnreadForAdmin
      findUnique: vi.fn(),
      count: vi.fn(),
      // ...
    },
    // ...
  },
}));
```

**Combined mock for admin-sidebar.service.test.ts** (must include all models used):
```typescript
vi.mock("@/lib/db", () => ({
  prisma: {
    category: { count: vi.fn() },
    product: { count: vi.fn() },
    order: { count: vi.fn() },
    callbackRequest: { count: vi.fn() },
    conversation: {
      fields: { adminLastReadAt: "adminLastReadAt" },
      count: vi.fn(),
    },
  },
}));
```

**`beforeEach` reset pattern** (from `callback-request.service.test.ts` lines 40-42):
```typescript
beforeEach(() => {
  vi.clearAllMocks();
});
```

---

### `src/components/admin/app-sidebar.tsx` (component, client) — MODIFY

**Analog:** `src/components/admin/app-sidebar.tsx` (self — extend existing chat badge pattern)

**Current props type** (lines 25-28 — replace entirely):
```typescript
type AppSidebarProps = {
  unreadChatCount: number;
};
```

**Existing chat badge pattern** (lines 38-39, 67-91 — the template to replicate for 4 new items):
```typescript
// Computed badge label with 99+ cap (line 38-39):
const chatBadgeLabel = unreadChatCount > 99 ? "99+" : String(unreadChatCount);

// Per-item badge logic inside .map() (lines 67-91):
const isChat = item.href === "/admin/chaty";
const showChatBadge = isChat && unreadChatCount > 0;

// aria-label with badge context (lines 78-83):
aria-label={
  showChatBadge
    ? `Чати, ${unreadChatCount} непрочитаних`
    : item.label
}

// Conditional SidebarMenuBadge render (lines 87-91):
{showChatBadge ? (
  <SidebarMenuBadge className="bg-destructive text-destructive-foreground">
    {chatBadgeLabel}
  </SidebarMenuBadge>
) : null}
```

**New props type to replace current:**
```typescript
import type { AdminSidebarBadgeCounts } from "@/server/services/admin-sidebar.service";

type AppSidebarProps = {
  badgeCounts: AdminSidebarBadgeCounts;
};
```

**Badge config approach** (replacing scattered `isChat`-style vars — from RESEARCH.md Pattern 2):
```typescript
// badgeConfig maps each nav href to its count and visual style
const badgeConfig: Record<string, { count: number; destructive: boolean } | undefined> = {
  "/admin/kategorii": { count: badgeCounts.categories, destructive: false },
  "/admin/tovary": { count: badgeCounts.products, destructive: false },
  "/admin/zamovlennia": { count: badgeCounts.pendingOrders, destructive: true },
  "/admin/chaty": { count: badgeCounts.unreadChats, destructive: true },
  "/admin/dzvinky": { count: badgeCounts.unresolvedCallbacks, destructive: true },
};
// Inside .map():
const badge = badgeConfig[item.href];
const showBadge = badge !== undefined && badge.count > 0;
const badgeLabel = badge && badge.count > 99 ? "99+" : String(badge?.count ?? 0);
```

**SidebarMenuBadge classNames per style:**
```typescript
// destructive (orders, chats, callbacks):
<SidebarMenuBadge className="bg-destructive text-destructive-foreground">
// secondary/muted (categories, products — D-04):
<SidebarMenuBadge className="bg-muted text-muted-foreground">
```

---

### `src/components/admin/admin-sidebar-shell.tsx` (component, client bridge) — MODIFY

**Analog:** `src/components/admin/admin-sidebar-shell.tsx` (self — prop type replace)

**Current props type** (lines 13-16 — replace entirely):
```typescript
type AdminSidebarShellProps = {
  unreadChatCount: number;
  children: React.ReactNode;
};
```

**Current prop threading** (line 30 — update to `badgeCounts`):
```typescript
<AppSidebar unreadChatCount={unreadChatCount} />
// becomes:
<AppSidebar badgeCounts={badgeCounts} />
```

**Import to add:**
```typescript
import type { AdminSidebarBadgeCounts } from "@/server/services/admin-sidebar.service";
```

---

### `src/app/(admin)/admin/layout.tsx` (RSC layout) — MODIFY

**Analog:** `src/app/(admin)/admin/layout.tsx` (self — replace fetch call and prop)

**Current fetch + prop** (lines 5, 18, 22 — all three change):
```typescript
// Line 5 — remove old import, add new:
import { countUnreadForAdmin } from "@/server/services/chat.service";
// becomes:
import { getAdminSidebarCounts } from "@/server/services/admin-sidebar.service";

// Line 18 — replace fetch:
const unreadChatCount = await countUnreadForAdmin();
// becomes:
const badgeCounts = await getAdminSidebarCounts();

// Line 22 — replace prop:
<AdminSidebarShell unreadChatCount={unreadChatCount}>
// becomes:
<AdminSidebarShell badgeCounts={badgeCounts}>
```

---

## Shared Patterns

### `Promise.all` for parallel read-only counts
**Source:** `src/server/services/admin-order.service.ts` lines 134-153 and `src/server/services/callback-request.service.ts` lines 84-93
**Apply to:** `admin-sidebar.service.ts` — all 5 counts run in parallel
```typescript
const [a, b, c] = await Promise.all([
  prisma.modelA.count({ where: { ... } }),
  prisma.modelB.count({ where: { ... } }),
  thirdServiceFunction(),
]);
```

### 99+ badge label cap
**Source:** `src/components/admin/app-sidebar.tsx` lines 38-39
**Apply to:** Every badge-eligible nav item in `app-sidebar.tsx`
```typescript
const label = count > 99 ? "99+" : String(count);
```

### `SidebarMenuBadge` usage
**Source:** `src/components/admin/app-sidebar.tsx` lines 87-91 (+ import line 18)
**Apply to:** All new badge renders in `app-sidebar.tsx` — same component, only `className` differs
```typescript
import { SidebarMenuBadge } from "@/components/ui/sidebar"; // already imported

{showBadge ? (
  <SidebarMenuBadge className="...">
    {badgeLabel}
  </SidebarMenuBadge>
) : null}
```

### Vitest `vi.mock("@/lib/db")` — import-after-mock ordering
**Source:** `src/server/services/callback-request.service.test.ts` lines 1-26
**Apply to:** `admin-sidebar.service.test.ts`
```typescript
// vi.mock() call BEFORE any imports from the mocked module
vi.mock("@/lib/db", () => ({ prisma: { ... } }));
import { prisma } from "@/lib/db";
import { functionUnderTest } from "./the.service";
```

### `requireAdmin()` gate in RSC layout
**Source:** `src/app/(admin)/admin/layout.tsx` line 17
**Apply to:** `getAdminSidebarCounts()` is always called after `requireAdmin()` — no auth logic needed inside the service function itself
```typescript
await requireAdmin(); // line 17 — already present, no change needed
const badgeCounts = await getAdminSidebarCounts(); // line 18 replacement
```

---

## No Analog Found

All files have strong analogs in the codebase. No entries.

---

## Metadata

**Analog search scope:** `src/server/services/`, `src/components/admin/`, `src/app/(admin)/admin/`
**Files scanned:** 7 source files read directly
**Pattern extraction date:** 2026-05-21
