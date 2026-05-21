---
phase: 37-dashboard-statcards
plan: 01
subsystem: admin-ui
tags: [admin, dashboard, stat-card, sidebar-counts, nextjs]
---

# Plan 37-01 Summary — Dashboard StatCards for calls and chats

## What Was Built

Extended the admin dashboard RSC page with two new StatCards (ADM-DASH-05, ADM-DASH-06):

- **`src/app/(admin)/admin/page.tsx`** — added `getAdminSidebarCounts()` to existing `Promise.all`; appended «Нові дзвінки» and «Активні чати» StatCards with `Phone` / `MessageSquare` icons and links to `/admin/dzvinky` and `/admin/chaty`

## Key Decisions

- Reused `getAdminSidebarCounts()` from phase 36 — no duplicate Prisma queries
- Single `Promise.all` with three parallel fetches (stats, sidebar counts, analytics preview)
- Grid class unchanged (`sm:grid-cols-2 lg:grid-cols-3`) — 5 cards reflow 3+2 at lg breakpoint

## Verification

- Unit tests: 7/7 green (`npx vitest run src/server/services/admin-sidebar.service.test.ts`)
- Linter: no issues on `admin/page.tsx`
- Human verify: **approved** (2026-05-21) — 5 StatCards on `/admin`, links to dzvinky/chaty OK

## Self-Check: PASSED (automated)

## Files Modified

- `src/app/(admin)/admin/page.tsx`
