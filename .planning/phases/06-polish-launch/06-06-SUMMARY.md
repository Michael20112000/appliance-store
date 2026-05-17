---
phase: 06-polish-launch
plan: 06
subsystem: perf
tags: [cwv, fonts, chat, cls, gap-closure]

requires:
  - phase: 06-04
    provides: VERIFICATION template
  - phase: 06-05
    provides: smoke-deploy spec
provides:
  - Single Geist font stack (no duplicate next/font)
  - Deferred ChatFab/ChatPanel (dynamic ssr:false)
  - Catalog card min-h-48 for CLS stability
  - VERIFICATION/ENV-CHECKLIST ready for preview URL recording
affects: [06-07, 06-08]

tech-stack:
  added: []
  patterns:
    - "next/dynamic ssr:false for non-LCP chat chrome"

key-files:
  created: []
  modified:
    - src/app/layout.tsx
    - src/components/chat/chat-provider.tsx
    - src/components/catalog/product-card.tsx
    - e2e/smoke-deploy.spec.ts
    - .planning/phases/06-polish-launch/06-VERIFICATION.md
    - .planning/phases/06-polish-launch/06-ENV-CHECKLIST.md

key-decisions:
  - "Ship CWV gate requires Vercel preview lab — dev localhost scores archived only"

patterns-established:
  - "Gap closure 06-06: code perf before operator preview Lighthouse (06-07)"

requirements-completed: [PERF-01]

duration: 25min
completed: 2026-05-17
---

# Phase 6 Plan 06: CWV perf fixes + deploy docs Summary

**Removed duplicate Geist font, lazy-loaded chat UI, stabilized catalog thumbnails; docs updated for preview/prod lab; build and tests green.**

## Performance

- **Completed:** 2026-05-17
- **Tasks:** 3/3

## Accomplishments

- `layout.tsx`: only `GeistSans` from `geist/font/sans` (removed `next/font/google` Geist duplicate).
- `chat-provider.tsx`: `ChatFab` and `ChatPanel` via `next/dynamic` with `ssr: false`.
- `product-card.tsx`: `min-h-48` on image container to reduce catalog grid CLS.
- `06-VERIFICATION.md`: preview/prod URL fields; dev lab archived; local build sanity recorded.
- `06-ENV-CHECKLIST.md`: Deployment record table for Preview/Production.
- `smoke-deploy.spec.ts`: header documents `PLAYWRIGHT_BASE_URL` ship command.

## Verification

- `npm test`: 109 passed
- `npm run build`: success
- `npm run start` + curl `/`: 200

## Next

**06-07 (operator):** push to Vercel preview → mobile Lighthouse 3 URLs → Rich Results → fill VERIFICATION.
