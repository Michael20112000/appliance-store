---
phase: 51-chat-badge-suggested-messages
plan: "03"
subsystem: chat
tags: [tdd, green, chat-badge, numeric-badge, fab]
dependency_graph:
  requires:
    - "51-01 (RED baseline — storefront-fabs.test.tsx badge tests)"
    - "51-02 (unreadCount: number in ChatContext)"
  provides:
    - "Numeric Badge on chat FAB in storefront-fabs.tsx (CHAT-10 visible half)"
    - "Numeric Badge on standalone chat-fab.tsx"
    - "storefront-fabs.test.tsx CHAT-10-a/b/c tests: GREEN"
  affects:
    - "src/components/chat/chat-fab.tsx"
    - "src/components/layout/storefront-fabs.tsx"
tech_stack:
  added: []
  patterns:
    - "chatBadgeLabel const pattern: count > 9 ? '9+' : String(count)"
    - "conditional aria-label with unread count in Ukrainian"
    - "Badge absolute-positioned at -right-0.5 -top-0.5 on relative button"
key_files:
  created: []
  modified:
    - src/components/layout/storefront-fabs.tsx
    - src/components/chat/chat-fab.tsx
decisions:
  - "No hasSession guard on badge render — guests with unread messages see count too (T-51-05 accepted)"
  - "Badge label capped at 9+ to prevent overly wide badge (T-51-06 accepted)"
  - "chat-fab.tsx updated for consistency even though StorefrontFabs is the primary render path"
metrics:
  duration: "5 minutes"
  completed: "2026-05-27"
  tasks_completed: 2
  tasks_total: 2
  files_changed: 2
  files_created: 0
---

# Phase 51 Plan 03: Numeric Badge on Chat FABs Summary

**One-liner:** Dot indicator replaced with numeric shadcn Badge on both chat FAB components — storefront-fabs.tsx and chat-fab.tsx — using the established cart badge pattern.

## Tasks Completed

| Task | Name | Commit | Files |
|------|------|--------|-------|
| 1 | Replace dot indicator with numeric Badge in storefront-fabs.tsx | 82af2e4 | src/components/layout/storefront-fabs.tsx |
| 2 | Replace dot indicator with numeric Badge in chat-fab.tsx | 086dbfc | src/components/chat/chat-fab.tsx |

## What Was Built

**Task 1 — storefront-fabs.tsx (numeric badge + aria-label):**
- Added `chatBadgeLabel` const after existing `badgeLabel` const: `unreadCount > 9 ? "9+" : String(unreadCount)`
- Updated chat FAB `aria-label` to conditional Ukrainian: `Відкрити чат з магазином, ${unreadCount} непрочитаних` when > 0, else `Відкрити чат з магазином`
- Replaced dot `<span className="...size-3 rounded-full...ring-background">` with `<Badge className="absolute -right-0.5 -top-0.5 min-w-5 justify-center px-1 text-[10px]" aria-hidden>{chatBadgeLabel}</Badge>`
- Button already had `relative` in className — no change needed
- All 16 storefront-fabs.test.tsx tests pass, including CHAT-10-a (count 3), CHAT-10-b (count 0 no badge), CHAT-10-c (count 10 shows "9+")

**Task 2 — chat-fab.tsx (Badge import, relative, no hasSession guard):**
- Added `import { Badge } from "@/components/ui/badge"` after lucide-react import
- Removed `hasSession` from `useChat()` destructure (was only used for badge guard)
- Added `chatBadgeLabel` const after destructure
- Added `relative` to second `cn()` string (was missing — pitfall from RESEARCH.md)
- Updated `aria-label` to same conditional Ukrainian pattern as storefront-fabs.tsx
- Replaced `{hasSession && unreadCount > 0 ? <span...> : null}` with Badge pattern matching storefront-fabs.tsx exactly

## Verification Results

```
storefront-fabs.test.tsx: Test Files  1 passed (1) | Tests  16 passed (16)
```

TypeScript: no errors in either modified file.

Dot span removed:
```
grep -n "size-3 rounded-full" storefront-fabs.tsx chat-fab.tsx
→ no output (exit 1)
```

unreadFromStore fully removed:
```
grep -rn "unreadFromStore" storefront-fabs.tsx chat-fab.tsx
→ no output (exit 1)
```

## Deviations from Plan

None — plan executed exactly as written. The Plan 02 migration had already updated the `useChat()` destructure in both files to use `unreadCount`; this plan completed the badge render by replacing the dot span with the numeric Badge component.

## Known Stubs

None — all production code is fully implemented with real data flow from `ChatContext.unreadCount`.

## Threat Flags

None — no new network endpoints, auth paths, or trust boundaries. Badge renders in-memory `unreadCount` value; T-51-05 and T-51-06 accepted as per threat model.

## Self-Check: PASSED

- [x] `grep -c "unreadFromStore" src/components/layout/storefront-fabs.tsx` returns 0
- [x] `grep -c "chatBadgeLabel" src/components/layout/storefront-fabs.tsx` returns 2 (declaration + usage)
- [x] `grep -c "Badge" src/components/layout/storefront-fabs.tsx` returns 7 (import + cart + chat usages)
- [x] `grep -c "непрочитаних" src/components/layout/storefront-fabs.tsx` returns 1
- [x] `grep -c "unreadFromStore" src/components/chat/chat-fab.tsx` returns 0
- [x] `grep -c "Badge" src/components/chat/chat-fab.tsx` returns 5 (import + usage)
- [x] `grep -c "relative" src/components/chat/chat-fab.tsx` returns 1
- [x] `grep -c "непрочитаних" src/components/chat/chat-fab.tsx` returns 1
- [x] `grep -c "hasSession" src/components/chat/chat-fab.tsx` returns 0
- [x] Commit 82af2e4 exists (Task 1)
- [x] Commit 086dbfc exists (Task 2)
- [x] storefront-fabs.test.tsx: 16 tests passed (CHAT-10-a/b/c GREEN)
- [x] TypeScript: no errors for either file
