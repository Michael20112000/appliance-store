---
status: complete
phase: 09-wishlist
source: [09-VERIFICATION.md, 09-MANUAL-CHECKLIST.md]
started: 2026-05-17T21:07:00Z
updated: 2026-05-17T21:50:00Z
---

## Current Test

All tests passed — approved by operator (phase 9 close).

## Tests

### 1. Guest wishlist persist and badge
expected: Guest adds via Heart; badge updates; reload keeps count; `/obrane` lists items
result: pass

### 2. Card click vs Heart overlay
expected: Click image/title/price navigates to PDP; Heart only toggles wishlist (no navigation)
result: pass

### 3. Guest cap 20
expected: 21st add shows «У обраному вже максимум 20 товарів»; count stays 20
result: pass

### 4. Merge on login (D-09-24)
expected: Guest items merge into DB on login; toast; `/obrane` shows merged list; guest LS cleared after merge
result: pass

### 5. Session toggle on PDP and `/obrane`
expected: Logged-in Heart toggles with toast; `/obrane` reflects state after refresh
result: pass

### 6. Unavailable products in wishlist (D-09-19)
expected: SOLD/DRAFT in same grid with lower opacity; «Товар більше недоступний»; Heart removes row; no add-to-cart
result: pass

### 7. Clear all — obrane and koszyk
expected: «Очистити обране» / «Очистити кошик» with confirm dialog clears lists
result: pass

### 8. Kabinet preview
expected: ≤3 cards; «Дивитись усе» → `/obrane`; empty state when no items
result: pass

### 9. Header badge
expected: Badge hidden when empty; shows count when items present
result: pass

### 10. Catalog category counts and price filter
expected: Sidebar shows counts per category; price slider/inputs filter grid; `cina-vid`/`cina-do` in URL applied server-side
result: pass

## Summary

| Result | Count |
|--------|-------|
| pass   | 10    |
| fail   | 0     |
| skip   | 0     |

**Phase 9 human gate:** PASSED
