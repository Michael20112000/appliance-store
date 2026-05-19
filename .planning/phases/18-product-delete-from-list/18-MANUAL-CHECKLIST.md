# Phase 18 — Product Delete from List — Manual Checklist

**Requirement:** ADM-PRD-04  
**Run after:** Plans 18-01 and 18-02 (list delete UI + Vitest)

## Prerequisites

- `npm run dev` running; admin signed in
- At least one product on `/admin/tovary` that can be deleted (not in cart / active order)
- Optional: seed product in a guest cart for guard toast check

---

## Happy path

- [ ] Open `/admin/tovary` — last column header is **Дії** with ghost trash icon per row
- [ ] Click trash on a deletable product — **Видалити товар?** dialog opens; URL stays on list (no navigation to edit)
- [ ] Click **Видалити** — toast **Товар видалено**; row disappears after refresh
- [ ] Trash button has aria-label **Видалити товар**

## Cancel

- [ ] Click trash → **Скасувати** — dialog closes; remain on list; no edit navigation

## Row navigation

- [ ] After cancel, click product title or photo — navigates to `/admin/tovary/[id]`
- [ ] Status column **ProductListStatusSelect** still changes status without opening edit

## Guard (optional)

- [ ] Product in cart: delete confirm → error toast about cart; row remains
- [ ] Product in active order: error toast about order; row remains

---

## Sign-off

| Date | Initials | Result |
|------|----------|--------|
|      |          |        |
