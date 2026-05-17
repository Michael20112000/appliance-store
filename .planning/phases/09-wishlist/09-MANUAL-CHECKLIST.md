# Phase 9 — Wishlist: Manual Checklist

**Purpose:** Human verification for behaviors not fully covered by Vitest (D-09-24, WISH-03, WISH-05 UX).

**Status:** ✅ Complete — operator sign-off 2026-05-17

**Prerequisites:**
- `npm run dev` running locally
- Database migrated with `WishlistItem` table (09-01)
- Test buyer account (email/password) separate from guest browser profile
- At least 3 AVAILABLE products in catalog; optional: one SOLD product ID added to wishlist via DB for unavailable row test

**Automated gates (run before manual):**
```bash
npm test
grep -q 'mergePendingWishlistAction' src/server/actions/wishlist.actions.ts && grep -q 'WishlistPendingMergeGate' src/app/\(storefront\)/layout.tsx
```

---

## D-09-24 — Guest / login / logout (merge on login)

| # | Step | Expected | Pass |
|---|------|----------|------|
| 1 | Open site in **private/incognito** window (guest) | Header shows Heart link to `/obrane`; no cart icon unless logged in | ☑ |
| 2 | On `/katalog`, add **3 different products** via overlay Heart | Badge shows **3**; toasts «Додано до обраного»; card does **not** navigate to PDP | ☑ |
| 3 | Reload page | Badge still **3** | ☑ |
| 4 | Open `/obrane` | All **3** products visible | ☑ |
| 5 | **Log in** as test buyer (empty or different DB wishlist) | Toast «N товарів з обраного додано…» (if guest had items); badge shows **DB count including merged** guest items | ☑ |
| 6 | Open `/obrane` while logged in | All **3** guest items appear in DB list (plus any that were already in DB); unavailable products skipped silently | ☑ |
| 7 | **Log out** | Guest localStorage was cleared on merge — badge **0** (or empty); `/obrane` empty until guest adds again | ☑ |

---

## WISH-01 / WISH-05 — Guest toggle & cap

| # | Step | Expected | Pass |
|---|------|----------|------|
| 8 | As guest, add items until **20** in wishlist | Badge shows 20 | ☑ |
| 9 | Try adding **21st** product | Toast error: **«У обраному вже максимум 20 товарів»**; count stays 20 (D-09-14) | ☑ |
| 10 | Remove one item via Heart | Toast «Прибрано з обраного»; count 19; icon updates immediately (D-09-12) | ☑ |

---

## WISH-02 / WISH-05 — Session toggle

| # | Step | Expected | Pass |
|---|------|----------|------|
| 11 | Logged in, toggle Heart on PDP (`/tovar/...`) | Toast add/remove; `router.refresh` updates state | ☑ |
| 12 | Open `/obrane` | Item appears/disappears matching toggle | ☑ |

---

## D-09-19 — Unavailable row

| # | Step | Expected | Pass |
|---|------|----------|------|
| 13 | With a **SOLD** or **DRAFT** product in wishlist (DB or guest resolve) | Same grid as available items, **lower opacity**; text **«Товар більше недоступний»**; **no** «В кошик» button; **no** separate «Недоступні» heading | ☑ |
| 14 | Heart still works to remove unavailable item | Item removed from list after toggle | ☑ |
| 14a | `/obrane` with items | **«Очистити обране»** near title; confirm dialog clears all | ☑ |
| 14b | `/koszyk` with items | **«Очистити кошик»** near title; confirm dialog clears all | ☑ |

---

## D-09-02 / WISH-04 — Kabinet preview

| # | Step | Expected | Pass |
|---|------|----------|------|
| 15 | Logged in with ≥1 wishlist item, open `/kabinet` | Section **«Обране»** above orders; ≤**3** cards | ☑ |
| 16 | Click **«Дивитись усе»** | Navigates to `/obrane` | ☑ |
| 17 | Empty DB wishlist | «Поки нічого в обраному» + link to catalog | ☑ |

---

## D-09-08 / header

| # | Step | Expected | Pass |
|---|------|----------|------|
| 18 | Empty wishlist (guest or user) | Badge **hidden** (not showing 0) | ☑ |
| 19 | If testable: wishlist count &gt; 99 | Badge shows **99+** | ☑ (skip if N/A) |

---

## Anti-patterns (must pass if present)

| # | Check | Expected | Pass |
|---|-------|----------|------|
| 20 | Layout has `WishlistPendingMergeGate` next to `CartPendingMergeGate` | Both gates present for logged-in session | ☑ |
| 21 | Login as guest with 3 items — DB gains those items (merge) | Confirmed in steps 5–6 | ☑ |

---

## Sign-off

| Role | Date | Notes |
|------|------|-------|
| Operator | 2026-05-17 | Phase 9 closed; catalog price filter urlKeys fix verified in same session |

**Phase 9 manual gate:** ✅ All critical rows passed.
