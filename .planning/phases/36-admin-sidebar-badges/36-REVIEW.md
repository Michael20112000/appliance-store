---
phase: 36
status: issues
critical: 0
warning: 3
info: 3
reviewed: 2026-05-21T00:00:00Z
depth: standard
files_reviewed: 5
files_reviewed_list:
  - src/server/services/admin-sidebar.service.test.ts
  - src/server/services/admin-sidebar.service.ts
  - src/app/(admin)/admin/layout.tsx
  - src/components/admin/admin-sidebar-shell.tsx
  - src/components/admin/app-sidebar.tsx
findings:
  critical: 0
  warning: 3
  info: 3
  total: 6
---

# Phase 36: Code Review Report

**Reviewed:** 2026-05-21
**Depth:** standard
**Files Reviewed:** 5
**Status:** issues_found

## Summary

Five files reviewed covering the complete badge pipeline: service layer, RSC layout, shell bridge, and sidebar UI. No security vulnerabilities found — `requireAdmin()` correctly gates all data access before any count queries run, and the service performs only read-only Prisma COUNT operations. No type safety issues — both client component files use `import type` for `AdminSidebarBadgeCounts`, keeping server code out of the client bundle. Core logic (filter rules D-01, D-03, D-05, D-08, badge display, 99+ cap) is correct.

Three warnings relate to test quality: a misleadingly-named test case, dead mock setup, and a gap in error-path coverage. Three info items cover minor code quality points.

## Warnings

### WR-01: Misleading "parallel execution" test name — test does not verify parallelism

**File:** `src/server/services/admin-sidebar.service.test.ts:115`
**Issue:** The test is titled `"all five queries run concurrently and result maps each value correctly (parallel execution)"` but it only asserts that each mock was called exactly once and that return values map to the correct keys. A sequential implementation using five individual `await` calls would pass this test identically. The test proves value mapping, not parallelism. The test name creates false confidence that concurrent execution is verified.
**Fix:** Either rename the test to accurately reflect what it asserts (`"maps all five return values correctly to the result object"`), or add a real concurrency assertion. A practical approach for the latter is to use `vi.spyOn` on `Promise.all` and assert it was called, or inspect the call order of mocks using timing. Renaming is lower effort and eliminates the misleading claim:

```ts
it("maps all five return values to correct result keys", async () => {
  // ... existing setup and assertions unchanged
});
```

---

### WR-02: Dead mock setup — `prisma.conversation.fields` is never accessed in these tests

**File:** `src/server/services/admin-sidebar.service.test.ts:12-16`
**Issue:** The `prisma` mock includes `conversation: { fields: { adminLastReadAt: "adminLastReadAt" }, count: vi.fn() }`. However `admin-sidebar.service.ts` has zero references to `prisma.conversation` — it delegates unreadChats entirely to `countUnreadForAdmin()`, which is itself mocked via `vi.mock("@/server/services/chat.service")`. The `conversation` property (and its `fields` sub-object) on the Prisma mock is unreachable dead setup code that adds noise and could mislead future contributors into thinking the service queries conversations directly.
**Fix:** Remove the `conversation` entry from the Prisma mock:

```ts
vi.mock("@/lib/db", () => ({
  prisma: {
    category: { count: vi.fn() },
    product: { count: vi.fn() },
    order: { count: vi.fn() },
    callbackRequest: { count: vi.fn() },
    // conversation removed — not used by admin-sidebar.service.ts
  },
}));
```

---

### WR-03: No error-path test — `Promise.all` rejection is untested, and failure blocks the entire admin panel

**File:** `src/server/services/admin-sidebar.service.test.ts` (missing test) / `src/app/(admin)/admin/layout.tsx:18`
**Issue:** `getAdminSidebarCounts()` wraps five concurrent queries in `Promise.all`. If any single query rejects (e.g., a transient DB connection error), `Promise.all` immediately rejects, causing `AdminLayout` to throw an unhandled error. There is no `error.tsx` boundary under `src/app/(admin)/admin/`, so the error propagates to the nearest app-level error handler, which will render a generic 500 page and lock out all admin users for the duration of the outage. Neither the service nor the test suite has any coverage for the rejection path.

This is a robustness issue rather than a correctness bug, but the consequence (entire admin panel 500s on any transient Prisma error) is severe.

**Fix (option A — defensive fallback in layout):**
```ts
// src/app/(admin)/admin/layout.tsx
let badgeCounts: AdminSidebarBadgeCounts = {
  categories: 0,
  products: 0,
  pendingOrders: 0,
  unreadChats: 0,
  unresolvedCallbacks: 0,
};
try {
  badgeCounts = await getAdminSidebarCounts();
} catch {
  // Badge counts are non-critical; degrade silently rather than blocking admin access
}
```

**Fix (option B — add error boundary):**
Create `src/app/(admin)/admin/error.tsx` to catch render errors at the admin route group level, preserving the layout for pages that don't depend on the failing fetch.

**Fix (test coverage):**
```ts
it("rejects with the underlying prisma error when a query fails", async () => {
  vi.mocked(prisma.category.count).mockRejectedValue(new Error("DB down"));
  vi.mocked(prisma.product.count).mockResolvedValue(0);
  vi.mocked(prisma.order.count).mockResolvedValue(0);
  vi.mocked(countUnreadForAdmin).mockResolvedValue(0);
  vi.mocked(prisma.callbackRequest.count).mockResolvedValue(0);

  await expect(getAdminSidebarCounts()).rejects.toThrow("DB down");
});
```

---

## Info

### IN-01: IIFE in JSX for `aria-label` switch — extract to a helper for readability

**File:** `src/components/admin/app-sidebar.tsx:87-102`
**Issue:** The `aria-label` prop uses an immediately-invoked function expression (IIFE) containing a `switch` statement inside JSX. This is unusual enough to cause a double-take and makes the component harder to scan. The IIFE is also recreated on every render for every nav item.
**Fix:** Extract to a named helper outside the component:

```ts
function getAriaLabel(href: string, count: number, label: string): string {
  switch (href) {
    case "/admin/kategorii": return `Категорії, ${count} всього`;
    case "/admin/tovary":    return `Товари, ${count} всього`;
    case "/admin/zamovlennia": return `Замовлення, ${count} висячих`;
    case "/admin/chaty":    return `Чати, ${count} непрочитаних`;
    case "/admin/dzvinky":  return `Дзвінки, ${count} невирішених`;
    default:                return label;
  }
}
// In JSX:
aria-label={showBadge && badge ? getAriaLabel(item.href, badge.count, item.label) : item.label}
```

---

### IN-02: `aria-label` count vs displayed badge label discrepancy when count > 99

**File:** `src/components/admin/app-sidebar.tsx:90-98` and `75`
**Issue:** When `badge.count > 99`, the visible `SidebarMenuBadge` shows `"99+"` (line 75), but the `aria-label` uses the raw `badge.count` (e.g., `"Замовлення, 150 висячих"`). This means screen readers and sighted users receive different counts. Using the raw count in `aria-label` is arguably more informative, but the inconsistency should be deliberate and documented rather than accidental. If the 99+ cap is a UX choice to avoid wide badges, the raw count in `aria-label` is correct — but it should be the explicit intent.
**Fix:** Either document the intentional discrepancy in a comment, or align them:

```ts
// Option A: match visual — use badgeLabel in aria-label too
return `Замовлення, ${badge.count > 99 ? "99+" : badge.count} висячих`;

// Option B (recommended): keep raw count in aria-label but add a comment
// aria-label intentionally uses raw count for screen readers;
// visual badge caps at "99+" to avoid wide sidebar items
```

---

### IN-03: `badgeConfig` Record redefined on every render — minor allocation per navigation

**File:** `src/components/admin/app-sidebar.tsx:39-45`
**Issue:** `badgeConfig` is defined inside the component body, so a new object (five key-value pairs) is allocated on every render. Since `AppSidebar` re-renders on every pathname change (the `useEffect` on line 35 does trigger), this is a recurring allocation. This is noted as an observation rather than a performance finding (performance issues are out of v1 scope) — it is also a minor readability signal that the shape of the config is fixed while only the count values change.
**Fix:** Not required. If desired, `useMemo` with `[badgeCounts]` as the dependency would eliminate re-creation when only `pathname` changes:

```ts
const badgeConfig = useMemo(() => ({
  "/admin/kategorii": { count: badgeCounts.categories, destructive: false },
  "/admin/tovary":    { count: badgeCounts.products, destructive: false },
  "/admin/zamovlennia": { count: badgeCounts.pendingOrders, destructive: true },
  "/admin/chaty":     { count: badgeCounts.unreadChats, destructive: true },
  "/admin/dzvinky":   { count: badgeCounts.unresolvedCallbacks, destructive: true },
}), [badgeCounts]);
```

---

_Reviewed: 2026-05-21_
_Reviewer: Claude (gsd-code-reviewer)_
_Depth: standard_
