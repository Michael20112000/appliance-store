# Phase 11 — Manual Checklist (D-11-15)

**Run after:** Plans 11-01 through 11-05 (or full phase execute)  
**Environment:** `npm run dev`, signed-in admin

| # | Route | Action | Expected | Pass |
|---|-------|--------|----------|------|
| 1 | `/admin/zamovlennia` | Click any order body row | Navigates to `/admin/zamovlennia/[orderNumber]` | ☐ |
| 1b | `/admin/zamovlennia` | Scan table headers | No «Відкрити» / «Дії» column | ☐ |
| 2 | `/admin/kategorii` | Click category row | Navigates to `/admin/kategorii/[id]` | ☐ |
| 2b | `/admin/kategorii` | Scan table | No «Редагувати» column | ☐ |
| 2c | `/admin/kategorii` | Inspect «Додати категорію» | Plus icon `size-4` left of label | ☐ |
| 3 | `/admin/tovary` | Inspect «Додати товар» | Plus icon `size-4` left of label | ☐ |
| 3b | `/admin/tovary` | Click product row | Navigates to `/admin/tovary/[id]` | ☐ |
| 3c | `/admin/tovary` | Open status Select, change value | Stays on list; row does NOT navigate | ☐ |
| 4 | `/admin` | Click recent order row | Same detail URL as orders list | ☐ |
| 4b | `/admin` | Scan recent orders table | No «Відкрити» column | ☐ |
| 5 | Any list above | Tab to row, press Enter | Opens same detail as click | ☐ |
| 5b | Any list above | Hover/focus row | `cursor-pointer`, muted hover/focus visible | ☐ |

**Notes:**

- Orders status badge is read-only in Phase 11 (inline edit is Phase 12).
- Dashboard outline «Додати товар» Plus is optional (D-11-11).
