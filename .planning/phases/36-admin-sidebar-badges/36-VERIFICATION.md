---
phase: 36-admin-sidebar-badges
verified: 2026-05-21T14:20:00Z
status: human_needed
score: 19/19 must-haves verified
overrides_applied: 0
human_verification:
  - test: "Open http://localhost:3000/admin in a browser and inspect the sidebar"
    expected: "Категорії and Товари show grey/muted badges with total counts; Замовлення/Чати/Дзвінки show red/destructive badges when non-zero; any nav item with count=0 shows no badge; collapsing sidebar to icon-only hides badges; no console errors"
    why_human: "Visual styling (grey vs red), conditional badge visibility, and collapsed-sidebar behavior cannot be verified by grep or TypeScript compilation"
---

# Phase 36: Admin Sidebar Badges Verification Report

**Phase Goal:** Implement admin sidebar badge counts — operators see attention signals on all five nav items (categories, products, pending orders, unread chats, unresolved callbacks) from a single aggregated server-side fetch with no N+1, using TDD discipline.
**Verified:** 2026-05-21T14:20:00Z
**Status:** human_needed
**Re-verification:** No — initial verification

## Goal Achievement

### Observable Truths

| # | Truth | Status | Evidence |
|---|-------|--------|----------|
| 1 | Test file exists with all tests in RED before service implementation | VERIFIED | `admin-sidebar.service.test.ts` created; 7 `it(` blocks confirmed; Wave 0 intentionally imports non-existent service |
| 2 | Tests verify getAdminSidebarCounts() returns shape with all five count fields | VERIFIED | Test at line 28 asserts all five keys as `expect.any(Number)` |
| 3 | Tests assert pendingOrders uses status=PENDING filter only (D-01) | VERIFIED | Test at line 72: `toHaveBeenCalledWith({ where: { status: "PENDING" } })` |
| 4 | Tests assert unresolvedCallbacks uses status=PENDING AND archivedAt=null (D-05) | VERIFIED | Test at line 100: `toHaveBeenCalledWith({ where: { status: "PENDING", archivedAt: null } })` |
| 5 | Tests assert categories and products use total count (no filter) | VERIFIED | Tests at lines 46 and 59: `toHaveBeenCalledWith()` (no args) |
| 6 | Tests assert unreadChats delegates to countUnreadForAdmin() correctly | VERIFIED | Test at line 87: mocks `countUnreadForAdmin` and asserts return maps to `unreadChats` |
| 7 | getAdminSidebarCounts() exists and returns AdminSidebarBadgeCounts with all five numeric fields | VERIFIED | `admin-sidebar.service.ts` lines 4-22; function exported, returns all five fields |
| 8 | AdminSidebarBadgeCounts type exported from admin-sidebar.service.ts | VERIFIED | Line 3: `export type AdminSidebarBadgeCounts` confirmed in file |
| 9 | pendingOrders count uses prisma.order.count with status=PENDING only | VERIFIED | `admin-sidebar.service.ts` line 17: `prisma.order.count({ where: { status: "PENDING" } })` |
| 10 | unresolvedCallbacks uses prisma.callbackRequest.count with status=PENDING AND archivedAt=null | VERIFIED | `admin-sidebar.service.ts` line 19: `{ status: "PENDING", archivedAt: null }` |
| 11 | categories and products counts are total (no where clause) | VERIFIED | Lines 15-16: `prisma.category.count()` and `prisma.product.count()` with no args |
| 12 | unreadChats delegates to countUnreadForAdmin() from chat.service.ts | VERIFIED | Line 2: imports `countUnreadForAdmin`; line 18: used in Promise.all |
| 13 | All five queries run concurrently via Promise.all (no N+1) | VERIFIED | Lines 14-20: single `Promise.all([...])` wrapping all five queries |
| 14 | All Wave 0 tests pass GREEN | VERIFIED | `npx vitest run` result: 7 passed, 0 failed |
| 15 | Admin layout.tsx calls getAdminSidebarCounts(); passes badgeCounts to AdminSidebarShell | VERIFIED | `layout.tsx` line 5 imports service; line 18 calls it; line 22 passes `badgeCounts={badgeCounts}` |
| 16 | AdminSidebarShell accepts badgeCounts: AdminSidebarBadgeCounts prop; passes to AppSidebar | VERIFIED | `admin-sidebar-shell.tsx` lines 12-15: type imported; prop typed; line 31: `<AppSidebar badgeCounts={badgeCounts} />` |
| 17 | AppSidebar accepts badgeCounts: AdminSidebarBadgeCounts; renders SidebarMenuBadge on all five items | VERIFIED | `app-sidebar.tsx` lines 27-28: prop typed; lines 39-44: `badgeConfig` covering all five hrefs; lines 109-119: conditional SidebarMenuBadge render |
| 18 | Categories/products badges use bg-muted text-muted-foreground; orders/chats/callbacks use bg-destructive | VERIFIED | `app-sidebar.tsx` lines 112-115: `badge.destructive ? "bg-destructive text-destructive-foreground" : "bg-muted text-muted-foreground"` |
| 19 | Old unreadChatCount prop removed from all three files | VERIFIED | `grep -rn "unreadChatCount"` across all three files returned no matches |

**Score:** 19/19 must-haves verified

### Required Artifacts

| Artifact | Expected | Status | Details |
|----------|----------|--------|---------|
| `src/server/services/admin-sidebar.service.test.ts` | Failing Vitest tests for getAdminSidebarCounts | VERIFIED | 7 test cases; mocks for all 5 Prisma models plus countUnreadForAdmin; conversation.fields mock present |
| `src/server/services/admin-sidebar.service.ts` | getAdminSidebarCounts() + AdminSidebarBadgeCounts type | VERIFIED | 23 lines; both exports confirmed; Promise.all; correct filters |
| `src/app/(admin)/admin/layout.tsx` | RSC fetch + pass badgeCounts to AdminSidebarShell | VERIFIED | Calls getAdminSidebarCounts(); passes badgeCounts prop; no countUnreadForAdmin remaining |
| `src/components/admin/admin-sidebar-shell.tsx` | Props bridge: badgeCounts: AdminSidebarBadgeCounts | VERIFIED | Type imported; props typed and passed through to AppSidebar |
| `src/components/admin/app-sidebar.tsx` | Five badge renders with correct styling | VERIFIED | badgeConfig with all five hrefs; showBadge/badgeLabel logic; conditional SidebarMenuBadge |

### Key Link Verification

| From | To | Via | Status | Details |
|------|----|-----|--------|---------|
| `admin-sidebar.service.test.ts` | `admin-sidebar.service.ts` | `import { getAdminSidebarCounts } from "./admin-sidebar.service"` | WIRED | Line 4 of test file; service exists and exports the function |
| `admin-sidebar.service.ts` | `chat.service.ts` | `import { countUnreadForAdmin }` | WIRED | Line 2 of service; used in Promise.all at line 18 |
| `admin-sidebar.service.ts` | `@/lib/db` | `import { prisma }` | WIRED | Line 1; prisma used for 4 count calls |
| `layout.tsx` | `AdminSidebarShell` | `badgeCounts={badgeCounts}` prop | WIRED | Line 22 of layout.tsx; AdminSidebarShell renders with this prop |
| `AdminSidebarShell` | `AppSidebar` | `badgeCounts={badgeCounts}` prop passthrough | WIRED | Line 31 of admin-sidebar-shell.tsx |
| `AppSidebar` | `SidebarMenuBadge` | `badgeConfig` map + conditional render | WIRED | Lines 39-44 (config), 109-119 (render); SidebarMenuBadge imported at line 18 |

### Data-Flow Trace (Level 4)

| Artifact | Data Variable | Source | Produces Real Data | Status |
|----------|--------------|--------|--------------------|--------|
| `app-sidebar.tsx` | `badgeCounts` | `getAdminSidebarCounts()` in RSC layout | Yes — Prisma COUNT queries (`prisma.category.count()`, `prisma.product.count()`, `prisma.order.count(...)`, `countUnreadForAdmin()`, `prisma.callbackRequest.count(...)`) | FLOWING |

### Behavioral Spot-Checks

| Behavior | Command | Result | Status |
|----------|---------|--------|--------|
| All 7 unit tests pass | `npx vitest run src/server/services/admin-sidebar.service.test.ts` | 7 passed, 0 failed | PASS |
| TypeScript clean across three refactored files | `npx tsc --noEmit` (grep for layout, shell, app-sidebar) | Zero lines matching those files in tsc output | PASS |
| unreadChatCount fully removed | `grep -rn "unreadChatCount" layout.tsx shell.tsx app-sidebar.tsx` | No output | PASS |

### Probe Execution

No probe scripts declared or discovered for this phase. Step 7c: SKIPPED (no probe-*.sh files for phase 36).

### Requirements Coverage

| Requirement | Source Plan | Description | Status | Evidence |
|-------------|------------|-------------|--------|----------|
| ADM-NAV-01 | 36-01, 36-02, 36-03 | Sidebar badges: categories/products total; orders pending; chats/callbacks unresolved only | SATISFIED | All five badge counts implemented with correct filters; single aggregated fetch; rendered in AppSidebar with conditional visibility |

ADM-NAV-01 is the only requirement mapped to Phase 36 in REQUIREMENTS.md (traceability table, line 117: `ADM-NAV-01 | Phase 36 | Pending`). No orphaned requirements found.

### Anti-Patterns Found

| File | Line | Pattern | Severity | Impact |
|------|------|---------|----------|--------|
| None | — | — | — | — |

No `TBD`, `FIXME`, `XXX`, `TODO`, `HACK`, `PLACEHOLDER`, `return null`, `return {}`, or `return []` patterns found in any of the five phase-modified files.

### Human Verification Required

### 1. Visual badge appearance and conditional visibility in browser

**Test:** Run `npm run dev`, open http://localhost:3000/admin in a browser, and inspect the sidebar.
**Expected:**
- Категорії shows a grey/muted badge with the total category count
- Товари shows a grey/muted badge with the total product count
- Замовлення shows a red/destructive badge only when PENDING orders exist (no badge if count=0)
- Чати shows a red/destructive badge only when unread chats exist (no badge if count=0)
- Дзвінки shows a red/destructive badge only when unresolved callbacks exist (no badge if count=0)
- Collapsing the sidebar to icon-only mode hides all badges (expected shadcn behavior)
- Browser console has no errors
**Why human:** CSS class rendering (grey vs red), conditional badge visibility at count=0, and collapsed-sidebar badge behavior cannot be verified by static analysis or TypeScript compilation.

### Gaps Summary

No automated gaps found. All 19 must-haves are verified. The single blocking item is the human visual verification checkpoint required by Plan 36-03 Task 3 (`type="checkpoint:human-verify" gate="blocking"`). The 36-03 SUMMARY records this as "approved" — but per verification policy, SUMMARY claims are not evidence. The human verifier must confirm directly in the browser.

---

_Verified: 2026-05-21T14:20:00Z_
_Verifier: Claude (gsd-verifier)_
