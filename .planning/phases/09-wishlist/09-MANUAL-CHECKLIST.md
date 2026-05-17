# Phase 9 — Wishlist: Manual Checklist

**Purpose:** Human verification for behaviors not fully covered by Vitest (D-09-24, WISH-03, WISH-05 UX).

**Prerequisites:**
- `npm run dev` running locally
- Database migrated with `WishlistItem` table (09-01)
- Test buyer account (email/password) separate from guest browser profile
- At least 3 AVAILABLE products in catalog; optional: one SOLD product ID added to wishlist via DB for unavailable row test

**Automated gates (run before manual):**
```bash
npm test
grep -rni 'WishlistPendingMerge\|mergeGuestWishlist\|mergePendingWishlist' src/ || echo "OK: no wishlist merge code"
```

---

## D-09-24 — Guest / login / logout (WISH-03) **no merge**

| # | Step | Expected | Pass |
|---|------|----------|------|
| 1 | Open site in **private/incognito** window (guest) | Header shows Heart link to `/obrane`; no cart icon unless logged in | ☐ |
| 2 | On `/katalog`, add **3 different products** via overlay Heart | Badge shows **3**; toasts «Додано до обраного»; card does **not** navigate to PDP | ☐ |
| 3 | Reload page | Badge still **3** | ☐ |
| 4 | Open `/obrane` | All **3** products visible | ☐ |
| 5 | **Log in** as test buyer (empty or different DB wishlist) | After redirect, badge shows **DB count only** (NOT guest 3 unless they were already in DB) | ☐ |
| 6 | Open `/obrane` while logged in | List shows **only DB wishlist** — guest's 3 items **must not** appear (WISH-03 / D-09-06) | ☐ |
| 7 | **Log out** | Badge returns to **guest** count (**3**); `/obrane` shows guest 3 again (D-09-07) | ☐ |

---

## WISH-01 / WISH-05 — Guest toggle & cap

| # | Step | Expected | Pass |
|---|------|----------|------|
| 8 | As guest, add items until **20** in wishlist | Badge shows 20 | ☐ |
| 9 | Try adding **21st** product | Toast error: **«У обраному вже максимум 20 товарів»**; count stays 20 (D-09-14) | ☐ |
| 10 | Remove one item via Heart | Toast «Прибрано з обраного»; count 19; icon updates immediately (D-09-12) | ☐ |

---

## WISH-02 / WISH-05 — Session toggle

| # | Step | Expected | Pass |
|---|------|----------|------|
| 11 | Logged in, toggle Heart on PDP (`/tovar/...`) | Toast add/remove; `router.refresh` updates state | ☐ |
| 12 | Open `/obrane` | Item appears/disappears matching toggle | ☐ |

---

## D-09-19 — Unavailable row

| # | Step | Expected | Pass |
|---|------|----------|------|
| 13 | With a **SOLD** or **DRAFT** product in wishlist (DB or guest resolve) | Row shows **«Товар більше недоступний»**; **no** «В кошик» button | ☐ |
| 14 | Heart still works to remove unavailable item | Item removed from list after toggle | ☐ |

---

## D-09-02 / WISH-04 — Kabinet preview

| # | Step | Expected | Pass |
|---|------|----------|------|
| 15 | Logged in with ≥1 wishlist item, open `/kabinet` | Section **«Обране»** above orders; ≤**3** cards | ☐ |
| 16 | Click **«Дивитись усе»** | Navigates to `/obrane` | ☐ |
| 17 | Empty DB wishlist | «Поки нічого в обраному» + link to catalog | ☐ |

---

## D-09-08 / header

| # | Step | Expected | Pass |
|---|------|----------|------|
| 18 | Empty wishlist (guest or user) | Badge **hidden** (not showing 0) | ☐ |
| 19 | If testable: wishlist count &gt; 99 | Badge shows **99+** | ☐ |

---

## Anti-patterns (must fail if present)

| # | Check | Expected | Pass |
|---|-------|----------|------|
| 20 | Search codebase / layout for `WishlistPendingMerge` or wishlist merge gate | **Not found**; `CartPendingMergeGate` may exist for cart only | ☐ |
| 21 | Login as guest with items — DB must **not** auto-gain guest items | Confirmed in steps 5–6 | ☐ |

---

## Sign-off

| Role | Date | Notes |
|------|------|-------|
| Operator | | |

**Phase 9 manual gate:** All critical rows (1–7, 11–12, 20–21) must pass before marking phase complete.
