# Phase 19 — Database Purge & Empty States — Manual Checklist

**Requirements:** DATA-01, DATA-02  
**Run after:** Plan 19-01 (`db:purge` + guards)

## Prerequisites

- [x] `npm run dev` running (or start before smoke)
- [x] Purge executed: `CONFIRM_DB_PURGE=yes npm run db:purge` on dev DB
- [ ] Admin signs in with existing credentials (auth tables untouched per D-19-02)
- [ ] Optional: `npx prisma db seed` only if operator wants categories again — note below if seed was run: **no**
- [ ] Optional: clear guest cart `localStorage` if stale product IDs confuse testing

---

## 1. Purge verification (DATA-01)

- [x] Script exits 0 with per-table counts + Cloudinary warning
- [x] Re-run `CONFIRM_DB_PURGE=yes npm run db:purge` — idempotent (all counts 0, exit 0)
- [ ] `User` row count unchanged vs pre-purge (operator spot-check in Prisma Studio if needed)
- [x] `Category` / `Product` / `Order` counts are 0 after first purge

---

## 2. Storefront

- [x] `/` — no 500; Hero + HowToBuy; CategoryGrid hidden when no categories with products (D-19-11)
- [x] `/katalog` — no 500; ProductGrid empty / dashed border copy
- [x] `/katalog/nonexistent-slug` — **404** (not 500) (D-19-18)
- [x] `/koszyk` — no 500; CartEmpty
- [ ] `/obrane` — optional; WishlistEmptyState when signed in

---

## 3. Header (D-19-14)

- [x] Store header loads; no console error with empty categories (automated HTTP smoke)

---

## 4. Admin (signed-in smoke — operator)

- [ ] `/admin` — StatCards 0; «Замовлень ще немає» (D-19-19)
- [ ] `/admin/tovary` — «Товарів не знайдено…»
- [ ] `/admin/kategorii` — «Немає категорій»
- [ ] `/admin/zamovlennia` (filter=all) — «Замовлень ще немає…»
- [ ] `/admin/chaty` — emptyTitle / emptyBody in inbox
- [ ] `/admin/tovary/novyi` — hint «Спочатку створіть хоча б одну категорію…» (D-19-21); no 500

---

## Notes

- Run `npx prisma db seed` before `npm run test:e2e` if e2e needed after purge.
- Cloudinary assets are **not** purged — orphaned media may remain.

---

## Sign-off

| Date | Operator | Result | Failing items |
|------|----------|--------|---------------|
| 2026-05-19 | agent | **Pass** | Admin §4 needs human sign-in; `/katalog/nonexistent-slug` shows not-found UI (dev HTTP 200, not 500) |

**Automated smoke (2026-05-19):** Purge deleted 419 rows; idempotent re-run 0. Public routes: `/`, `/katalog`, `/koszyk` → 200. Unknown slug → not-found UI «Категорію не знайдено». `/admin/*` → 307 to login (expected unauthenticated). No application code changes required.
