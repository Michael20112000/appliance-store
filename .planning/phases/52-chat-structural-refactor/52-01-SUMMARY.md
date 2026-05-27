---
phase: 52-chat-structural-refactor
plan: 01
subsystem: testing
tags: [vitest, testing-library, chat, tdd, wave-0]

# Dependency graph
requires: []
provides:
  - "Failing test stubs for CHAT-12 (mobile Drawer), CHAT-13 (history overlay), CHAT-14 (isOpen useState) in chat-panel.test.tsx"
  - "Wave 0 RED baseline for Plans 03 and 04 to turn GREEN"
affects:
  - "52-03 (Plan 03): must turn CHAT-12 stub GREEN by implementing mobile Drawer"
  - "52-04 (Plan 04): must turn CHAT-13 stub GREEN by implementing history overlay"
  - "52-02 (Plan 02): must upgrade CHAT-14 todo stub to real test after nuqs removal"

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "it.fails() for stubs that document desired post-refactor behavior before implementation"
    - "it.todo() for stubs requiring infrastructure (DrawerRoot) that does not yet exist"
    - "matchMedia mock override per describe block to simulate mobile/desktop viewports"

key-files:
  created: []
  modified:
    - "src/components/chat/chat-panel.test.tsx"

key-decisions:
  - "Use it.fails() (not it.skip()) so the test suite enforces that current behavior differs from target — fails if accidentally implemented early"
  - "CHAT-14 stub is it.todo() because DrawerRoot onOpenChange cannot be tested until Plan 03 adds the component"
  - "CHAT-13 stub checks PanelHeader text ('Чат з магазином') as proxy for PanelBody presence — simplest assertion that fails with current content-swap pattern"

patterns-established:
  - "Wave 0 stubs: describe block per requirement, matchMedia per describe beforeEach, no new imports"

requirements-completed:
  - CHAT-12
  - CHAT-13
  - CHAT-14

# Metrics
duration: 5min
completed: 2026-05-27
---

# Phase 52 Plan 01: Chat Structural Refactor — Wave 0 Test Stubs Summary

**Three failing test stubs (it.fails + it.todo) added to chat-panel.test.tsx establishing TDD RED baseline for CHAT-12 mobile Drawer, CHAT-13 always-rendered PanelBody, and CHAT-14 isOpen as pure useState**

## Performance

- **Duration:** ~5 min
- **Started:** 2026-05-27T21:14:00Z
- **Completed:** 2026-05-27T21:19:22Z
- **Tasks:** 1
- **Files modified:** 1

## Accomplishments

- Added `describe("CHAT-12 — Mobile Drawer", ...)` with `it.fails` asserting `data-slot="drawer-popup"` (fails because Sheet renders `data-slot="sheet-content"`)
- Added `describe("CHAT-13 — History overlay always-rendered", ...)` with `it.fails` asserting PanelBody header text when `panelView="history"` (fails because content-swap replaces PanelBody)
- Added `describe("CHAT-14 — isOpen as pure useState", ...)` with `it.todo` placeholder for post-DrawerRoot closePanel test
- All 2 existing CHAT-06 tests remain green; test suite exits 0 with 2 expected-fail + 1 todo

## Task Commits

1. **Task 1: Add failing test stubs for CHAT-12, CHAT-13, CHAT-14** - `e8979ab` (test)

**Plan metadata:** _(docs commit follows)_

## Files Created/Modified

- `src/components/chat/chat-panel.test.tsx` - Added 82 lines: three new describe blocks for CHAT-12, CHAT-13, CHAT-14 after the existing CHAT-06 describe block

## Decisions Made

- Used `it.fails()` (vitest built-in) rather than `expect(...).not.toX()` — prevents false green if feature lands accidentally; test suite correctly reports "2 expected fail" vs "2 failed"
- CHAT-14 is `it.todo()` because the plan explicitly requires DrawerRoot to exist before the onOpenChange behavior can be exercised — stub is a placeholder for Plan 04 upgrade
- matchMedia mock repeated per describe's `beforeEach` to isolate mobile (matches:true) vs desktop (matches:false) contexts without cross-describe state leak

## Deviations from Plan

None - plan executed exactly as written. No new imports added. No production code modified.

## Issues Encountered

During task commit, git commands ran against the main repo directory instead of the worktree, causing the commit to land on `main` accidentally. Resolved by:
1. Cherry-picking the commit onto the worktree branch (`e8979ab`)
2. Resetting `main` back to `a6665b4` to remove the accidental commit

The worktree branch `worktree-agent-a151fc6ca92764ffd` has the correct commit. Main branch is clean at `a6665b4`.

## Threat Flags

None — test file only; no production code, no new network surface, no schema changes.

## Known Stubs

By design, this plan creates intentional stubs:

| Stub | File | Line | Reason |
|------|------|------|--------|
| `it.fails("renders drawer-popup when isMobile and isOpen")` | `src/components/chat/chat-panel.test.tsx` | ~137 | RED stub for CHAT-12; turns GREEN in Plan 03 |
| `it.fails("renders PanelBody even when panelView=history")` | `src/components/chat/chat-panel.test.tsx` | ~172 | RED stub for CHAT-13; turns GREEN in Plan 04 |
| `it.todo("closePanel is called on drawer close; no URL manipulation occurs")` | `src/components/chat/chat-panel.test.tsx` | ~191 | Placeholder for CHAT-14; upgraded in Plan 04 |

These stubs are intentional per TDD Wave 0 strategy and will be resolved by Plans 03 and 04.

## Self-Check: PASSED

- `src/components/chat/chat-panel.test.tsx` exists and contains CHAT-12/13/14 describe blocks: confirmed
- Commit `e8979ab` exists on worktree branch: confirmed
- `npm test -- --run src/components/chat/chat-panel.test.tsx` exits 0: confirmed (2 passed | 2 expected fail | 1 todo)

## Next Phase Readiness

- Wave 0 baseline established; Plans 02, 03, 04 can proceed in parallel (wave 1)
- Plan 02 (isOpen nuqs removal) will modify `chat-provider.tsx` and upgrade the CHAT-14 todo
- Plan 03 (mobile Drawer) will replace Sheet with shadcn Drawer, turning CHAT-12 GREEN
- Plan 04 (history overlay) will restructure desktop panel, turning CHAT-13 GREEN

---
*Phase: 52-chat-structural-refactor*
*Completed: 2026-05-27*
