# Phase 21 — Bugfix stabilization — Manual Checklist

**Scope:** Verify-only close for intake `bugfix-intake-2026-05-19.md` (BUG-12…17, waves 1–2 already implemented on `main`).  
**Run after:** Plan 21-01 Task 1 (build + Vitest green).

## Prerequisites

- `npm run dev` on `http://localhost:3000`
- Admin signed in
- DB with at least **3 categories** and products: one with `quantity > 0`, one with `quantity = 0`
- Optional: guest session for checkout verify (incognito)

---

## BUG-12 — Category sort (1-based, no duplicate ranks)

**Route:** `/admin/kategorii`

- [x] Column «Порядок» shows values **1…N** (not starting at 0) for N categories
- [x] Inline/order control cannot set rank **> N**
- [x] Change category A from position 2 → 3: other categories **shift** (no two rows share the same sort order)
- [x] Change category from last → first: remaining ranks are contiguous 1…N

---

## BUG-13 — View products from category edit

**Route:** `/admin/kategorii/[id]`

- [x] Button/link **Переглянути товари** visible
- [x] Click navigates to `/admin/tovary?categoryId=<that-category-cuid>`
- [x] Product list shows only products in that category (or empty state if none)

---

## BUG-14 — Product quantity-only listing (no status enum)

**Routes:** `/admin/tovary/novyi`, `/admin/tovary/[id]`, storefront catalog

- [x] Admin product form has **quantity** field; **no** DRAFT/AVAILABLE/SOLD status control
- [x] New product with `quantity > 0` appears on storefront catalog
- [x] Set `quantity = 0` → product **sold out** / hidden from storefront (per catalog rules)
- [x] Admin product list **no** status column or inline status select (BUG-16)

---

## BUG-15 — Inventory reserve on order status (not at checkout)

**Routes:** storefront checkout, `/admin/zamovlennia`

### Logged-in buyer

- [x] Add product with `quantity = 2` to cart; complete checkout → order **PENDING**
- [x] Product `quantity` on storefront/admin **unchanged** while PENDING
- [x] Admin: transition **PENDING → CONFIRMED** → `quantity` decreases by **line quantity** (test with qty **2** on one line → −2)
- [x] Admin: **CONFIRMED → CANCELLED** → quantity **restored** (+2)
- [x] Admin: **PENDING → CANCELLED** (another order) → quantity **unchanged**
- [x] Admin: **→ COMPLETED** from confirmed → quantity **unchanged** (no second decrement)

### Guest (D-21-10)

- [x] Guest checkout creates **PENDING** order without decrement at submit
- [x] Admin confirm same order → same decrement behavior as logged-in

### Insufficient stock

- [x] Order line qty > available: **PENDING → CONFIRMED** shows error / does not partial-decrement (INSUFFICIENT_STOCK or equivalent toast)

---

## BUG-16 — Admin product list (no status column)

**Route:** `/admin/tovary`

- [x] Table has no «Статус» column
- [x] No inline product status dropdown in list rows

---

## BUG-17 — Product detail orders block

**Route:** `/admin/tovary/[id]` for a product that appears in at least one order

- [x] Section lists orders containing this product
- [x] Each entry links to `/admin/zamovlennia/{orderNumber}` (or project’s order URL pattern)
- [x] Link opens correct order detail

---

## Regression smoke (optional, 2 min)

- [x] Store header / cart badge still works (post phase 20 guest cart)
- [x] `/admin/chaty` loads (phase 17 — no regression from bugfix batch)

---

## Sign-off

| Date | Tester | Result (Pass / Fail) | Notes |
|------|--------|---------------------|-------|
| 2026-05-19 | operator | Pass | Conversational approval after full BUG-12…17 pass on local dev |

**Fail handling:** Do not set intake `completed`. File failing BUG-ID; run plan Task 4 or `/gsd-plan-phase 21` for `21-02-PLAN` if fix is non-trivial.
