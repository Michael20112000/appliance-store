---
phase: 14-admin-chat-context-menu
status: passed
verified: 2026-05-18
score: 8/8
---

# Phase 14 Verification

**Phase goal:** Desktop ПКМ на рядку inbox `/admin/chaty` відкриває context menu з lifecycle parity до thread ⋮; mobile без RCM.

## Must-haves

| # | Criterion | Status | Evidence |
|---|-----------|--------|----------|
| 1 | shadcn context-menu installed | ✓ | `src/components/ui/context-menu.tsx` |
| 2 | Shared lifecycle module | ✓ | `use-conversation-lifecycle-actions.ts`, `conversation-lifecycle-menu-items.tsx` |
| 3 | Thread ⋮ unchanged (DropdownMenu) | ✓ | `chat-thread.tsx` still uses DropdownMenuTrigger |
| 4 | Desktop RCM on inbox rows | ✓ | `conversation-list.tsx` + `enableContextMenu={!isMobile}` |
| 5 | Native menu suppressed | ✓ | `onContextMenu` preventDefault on desktop rows |
| 6 | Mobile no list context menu | ✓ | Plain button path when `enableContextMenu=false` |
| 7 | D-14-08 refresh routing | ✓ | `afterArchiveOrDelete` in hook |
| 8 | E2E desktop RCM + mobile skip | ✓ | `e2e/admin-chat.spec.ts` 4 passed |

## Automated checks

- Vitest: `conversation-lifecycle-menu-items.test.tsx` — 4/4
- Playwright: `e2e/admin-chat.spec.ts` — 4/4

## Human verification

See `14-MANUAL-CHECKLIST.md` (5 scenarios) before `/gsd-verify-work`.

## Notes

- Full `npm run build` fails on pre-existing `prisma/seed-products.ts` readonly tuple type (unrelated to phase 14). Next.js compile step succeeded.
