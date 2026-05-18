# Phase 12 — Manual Checklist (ADM-ORD-02, ADM-PRD-02)

**Run after:** Plans 12-01 through 12-03  
**Environment:** `npm run dev`, signed-in admin

| # | Route | Action | Expected | Pass |
|---|-------|--------|----------|------|
| 1 | `/admin/zamovlennia` | Click status Select trigger | Row does NOT navigate to detail | ☐ |
| 1b | `/admin/zamovlennia` | Change status (non-cancel) | Saves; toast; list refreshes | ☐ |
| 1c | `/admin/zamovlennia` | Choose «Скасовано» | Confirm dialog; confirm saves | ☐ |
| 2 | `/admin/tovary` | Click «Назва» header | URL has `sort=title`; list reorders | ☐ |
| 2b | `/admin/tovary` | Click same header again | Toggles `dir` asc/desc; arrow icon updates | ☐ |
| 2c | `/admin/tovary` | Sort by Категорія, Ціна, Статус | Each column sorts server-side | ☐ |
| 3 | `/admin/tovary` | With active sort, change status filter chip | Sort/dir preserved in URL | ☐ |
| 3b | `/admin/tovary` | With active sort, go to page 2 | Pagination keeps `sort` (and `dir` if non-default) | ☐ |
| 4 | `/admin/tovary` | Open product status Select | Row does NOT navigate | ☐ |
| 5 | `/admin/tovary` | Inspect «Фото» header | Plain label; no sort link; no `aria-sort` | ☐ |

**Notes:**

- Default product sort (no query) is `updatedAt desc` — URL omits `sort`.
- Orders table sort unchanged; shared header component only.
