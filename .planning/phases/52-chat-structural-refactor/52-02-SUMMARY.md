---
phase: 52-chat-structural-refactor
plan: "02"
subsystem: ui
tags: [react, nuqs, chat, state-management]

# Dependency graph
requires:
  - phase: 52-01
    provides: research and pattern map confirming safe removal of nuqs from chat-provider
provides:
  - ChatProvider with pure useState(false)-based isOpen (no URL dependency)
  - Deleted src/lib/chat/search-params.ts (orphaned after nuqs removal)
affects: [52-03, 52-04, chat-panel, any consumer of ChatContext.isOpen]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Chat open state as pure React useState(false) — not URL-derived; survives navigation"

key-files:
  created: []
  modified:
    - src/components/chat/chat-provider.tsx

key-decisions:
  - "isOpen is now pure useState(false) — chat persists across Next.js client-side navigation because ChatProvider lives in the storefront layout and its React state is preserved by Next.js across client-side transitions"
  - "usePathname and useSearchParams removed (were unused after nuqs removal); useRouter kept for router.refresh() in claim effect"
  - "openPanel no longer uses early return after setProductContext; falls through to setIsOpen(true) in all cases"

patterns-established:
  - "State-based panel open/close: use setIsOpen(false)/setIsOpen(true) — no URL mutation"

requirements-completed:
  - CHAT-14

# Metrics
duration: 7min
completed: 2026-05-27
---

# Phase 52 Plan 02: Remove nuqs from ChatProvider, replace isOpen with useState(false)

**nuqs URL-derived isOpen replaced with pure React useState(false) in ChatProvider; search-params.ts deleted; chat now stays open across page navigation**

## Performance

- **Duration:** ~7 min
- **Started:** 2026-05-27T21:19:00Z
- **Completed:** 2026-05-27T21:26:15Z
- **Tasks:** 1
- **Files modified:** 2 (1 modified, 1 deleted)

## Accomplishments
- Removed `useQueryStates`, `chatParsers`, `chatUrlKeys` from `chat-provider.tsx`; replaced `const isOpen = query.chat === "open"` with `const [isOpen, setIsOpen] = useState(false)`
- Rewrote `closePanel` to call `setIsOpen(false)` (no setQuery); rewrote `openPanel` to call `setIsOpen(true)` (no setQuery, no early return)
- Deleted `src/lib/chat/search-params.ts` — fully orphaned after import removal
- All CHAT-06 tests pass; CHAT-12/CHAT-13 `it.fails` stubs still fail as expected; CHAT-14 `it.todo` skipped

## Task Commits

1. **Task 1: Remove nuqs from chat-provider.tsx and replace isOpen with useState** - `b6c57c7` (feat)

## Files Created/Modified
- `src/components/chat/chat-provider.tsx` - Removed nuqs imports/hook, replaced isOpen derivation with useState(false), rewrote closePanel and openPanel
- `src/lib/chat/search-params.ts` - DELETED (orphaned utility — chatParsers, chatSearchParamsCache, chatUrlKeys no longer consumed anywhere)

## Decisions Made
- `usePathname` and `useSearchParams` were imported but unused after nuqs removal; both removed from the `next/navigation` import line, keeping only `useRouter` (used for `router.refresh()` in the guest claim effect at line 454)
- `openPanel` no longer uses early `return` after `setProductContext(options)` — falls through to `setIsOpen(true)` unconditionally, simplifying the logic

## Deviations from Plan

None — plan executed exactly as written.

## Issues Encountered
- Pre-existing TypeScript errors in unrelated test files (`prisma/purge-business-data.test.ts`, `src/app/api/chat/upload/sign/route.test.ts`, `src/server/services/admin-catalog.service.test.ts`, `src/server/services/catalog.service.test.ts`) — all pre-existing, none in files touched by this plan. Scope boundary rule applied: not fixed, logged here.

## User Setup Required

None — no external service configuration required.

## Next Phase Readiness
- Plan 02 complete: `isOpen` is pure `useState(false)` in ChatProvider, `search-params.ts` deleted
- Plan 03 (mobile Drawer) and Plan 04 (history overlay) can now proceed — they depend on this refactor
- No blockers

## Self-Check: PASSED
- `src/components/chat/chat-provider.tsx` exists and contains `const [isOpen, setIsOpen] = useState(false)` ✓
- `src/lib/chat/search-params.ts` does not exist on disk ✓
- Commit `b6c57c7` exists ✓
- `npm test -- --run src/components/chat/chat-panel.test.tsx` exits 0 ✓
- No TypeScript errors in modified files ✓

---
*Phase: 52-chat-structural-refactor*
*Completed: 2026-05-27*
