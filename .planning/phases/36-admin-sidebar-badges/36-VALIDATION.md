---
phase: 36
slug: admin-sidebar-badges
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-05-21
---

# Phase 36 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Vitest |
| **Config file** | `vitest.config.ts` |
| **Quick run command** | `npx vitest run src/server/services/admin-sidebar.service.test.ts` |
| **Full suite command** | `npm test` |
| **Estimated runtime** | ~5 seconds |

---

## Sampling Rate

- **After every task commit:** Run `npx vitest run src/server/services/admin-sidebar.service.test.ts`
- **After every plan wave:** Run `npm test`
- **Before `/gsd:verify-work`:** Full suite must be green
- **Max feedback latency:** 30 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Threat Ref | Secure Behavior | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|------------|-----------------|-----------|-------------------|-------------|--------|
| 36-01-01 | 01 | 0 | ADM-NAV-01 | — | N/A | unit | `npx vitest run src/server/services/admin-sidebar.service.test.ts` | ❌ W0 | ⬜ pending |
| 36-01-02 | 01 | 1 | ADM-NAV-01 | — | getAdminSidebarCounts only called behind requireAdmin() in RSC layout | unit | `npx vitest run src/server/services/admin-sidebar.service.test.ts` | ❌ W0 | ⬜ pending |
| 36-02-01 | 02 | 1 | ADM-NAV-01 | — | N/A | manual | Visual browser check: badges visible in sidebar | ✅ | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `src/server/services/admin-sidebar.service.test.ts` — stubs for ADM-NAV-01: covers `getAdminSidebarCounts()` mocking all 5 count queries, verifying correct filter for each (PENDING orders, PENDING+archivedAt=null callbacks, total categories, total products, unread chats via `countUnreadForAdmin`)

Mock pattern (from chat.service.test.ts):
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

*Existing infrastructure (vitest) covers all phase requirements — no new framework installation needed.*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Badge hidden when count = 0 | ADM-NAV-01 | Client rendering logic, no component test setup | Set category count to 0 in dev DB, verify no badge appears |
| Badges cap at 99+ | ADM-NAV-01 | Client rendering logic | Set a count > 99, verify badge shows "99+" |
| Muted/secondary styling for categories & products | ADM-NAV-01 | Visual check | Verify categories and products badges are visually distinct from red destructive badges |
| Badge disappears at 0, appears at 1 | ADM-NAV-01 | Client rendering logic | Toggle a count via DB, reload admin, confirm badge appears/disappears |
| Collapsed sidebar hides badges | ADM-NAV-01 | shadcn behavior (group-data-[collapsible=icon]:hidden) | Collapse sidebar, confirm badges not visible — expected behavior |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 30s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
