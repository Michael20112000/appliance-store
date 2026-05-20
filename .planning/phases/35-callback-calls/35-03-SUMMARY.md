---
phase: 35-callback-calls
plan: 03
subsystem: ui
tags: [nextjs, admin, callback, rsc]

requires:
  - phase: 35-02
    provides: Service layer and server actions
provides:
  - /admin/dzvinky dedicated workspace
  - Sidebar «Дзвінки» nav entry
  - Row controls for status, note, archive
affects: [36]

tech-stack:
  added: []
  patterns:
    - "Active/archive chips via adminCallbacksUrl (orders pattern)"
    - "Explicit «Зберегти» for notes — no blur save"

key-files:
  created:
    - src/app/(admin)/admin/dzvinky/page.tsx
    - src/lib/admin/callbacks-url.ts
    - src/components/admin/callback-list-filters.tsx
    - src/components/admin/callback-list-status-select.tsx
    - src/components/admin/callback-note-field.tsx
    - src/components/admin/callback-archive-button.tsx
  modified:
    - src/components/admin/callback-requests-table.tsx
    - src/components/admin/admin-nav-items.ts
    - src/app/(admin)/admin/nalashtuvannia/page.tsx

key-decisions:
  - "No Phase 36 sidebar badges on Дзвінки"
  - "Archive tab read-only — no row controls"

requirements-completed: [CALL-01, CALL-02, CALL-03, CALL-04]

duration: 30min
completed: 2026-05-20
---

# Phase 35 Plan 03 Summary

**Operators manage callback requests on `/admin/dzvinky`; store settings no longer embeds the callback table.**

## Accomplishments
- Dedicated RSC page with active/archive tabs and 200-row cap
- Client row widgets wired to Plan 02 actions
- Removed «Заявки на дзвінок» from `/admin/nalashtuvannia`

## Task Commits
1. **Tasks 1–3: UI + page + nav** - `826cbb3` (feat(35-03))

## Self-Check: PASSED

## Human Verification
**Status:** PENDING — blocking checkpoint Task 4 not yet approved.
