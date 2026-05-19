---
phase: 18
slug: product-delete-from-list
status: draft
shadcn_initialized: true
preset: "base-nova · inherited from Phase 8"
created: 2026-05-19
locale: uk
extends: 08-UI-SPEC.md
admin_chrome: bg-muted
---

# Phase 18 — UI Design Contract

> **Table actions delta** для `/admin/tovary`: колонка **«Дії»** з icon delete, confirm dialog, toast — без зміни sort/filter/pagination. **Розширює** `08-UI-SPEC.md`. Джерела: `ROADMAP.md` Phase 18, `REQUIREMENTS.md` ADM-PRD-04, `product-form.tsx`, `product-list-status-select.tsx`, `order-list-status-select.tsx`.

**Out of scope:** зміна row-click на інших колонках, bulk delete, edit form delete UX refactor, нові shadcn primitives beyond existing `AlertDialog` + `Button`.

---

## Design System

| Property | Value |
|----------|-------|
| Tool | shadcn/ui — **no new `npx shadcn add`** |
| New components | `ProductListDeleteButton` (feature), not registry |
| Icons | `lucide-react` **`Trash2`** (outline trash) |

---

## Inherited (no change)

| Area | Reference |
|------|-----------|
| Table shell | `rounded-lg border border-border bg-background`, `text-sm` |
| Row hover | `adminClickableRowClassName` — `hover:bg-muted/40` |
| Status column | `ProductListStatusSelect` — unchanged width/behavior |
| Typography | Column headers `font-medium text-muted-foreground` |
| Destructive color | `text-destructive` on icon; AlertDialogAction destructive styling |

---

## Column: «Дії»

| Property | Spec |
|----------|------|
| Position | **Last column** (after «Статус») |
| Header | `Дії` — `px-3 py-2 font-medium` (match other `<th>`) |
| Cell | `px-3 py-2 text-right` or `text-left` — align **end** for icon-only actions |
| Width | Minimal — `w-[4.5rem]` or `whitespace-nowrap`; no wrap |

---

## Delete Control

| Property | Spec |
|----------|------|
| Component | `Button` `variant="ghost"` `size="icon"` |
| Icon | `<Trash2 className="size-4" />` |
| `aria-label` | **`Видалити товар`** (UA, includes product context) |
| Wrapper | `<motion.div>` or `<div data-admin-row-interactive className="inline-flex">` |
| Events | `onClick` + `onPointerDown` → `event.stopPropagation()` |
| Disabled | While `useTransition` pending — `disabled={pending}` |

**Do not** use `variant="destructive"` filled button — ghost icon matches admin table density.

---

## Confirm Dialog

| Property | Spec |
|----------|------|
| Pattern | shadcn **`AlertDialog`** (controlled `open` state) |
| Title | `Видалити товар?` |
| Description | `Дію не можна скасувати, якщо товар не в кошику чи активному замовленні.` — **verbatim** from `product-form.tsx` `window.confirm` |
| Cancel | `AlertDialogCancel` — label **`Скасувати`** (or **`Ні`** if matching orders — prefer **Скасувати** for delete) |
| Confirm | `AlertDialogAction` — label **`Видалити`**, destructive styling (`className` with destructive tokens per `order-list-status-select`) |
| Open trigger | Trash button `onClick` → `setOpen(true)`; **not** immediate delete |

On dialog `onOpenChange(false)` after close: call `suppressAdminRowNavigation()` (400ms) — same as status Select.

---

## Feedback

| Event | UI |
|-------|-----|
| Success | `toast.success("Товар видалено")` + `router.refresh()` |
| PRODUCT_IN_CART | `toast.error` — existing UA string |
| PRODUCT_IN_ACTIVE_ORDER | `toast.error` — existing UA string |
| PRODUCT_NOT_FOUND / UNKNOWN | `toast.error` — existing UA strings |

No inline `Alert` in table cell — toast only.

---

## Row Navigation (D-18 implicit)

| Interaction | Expected |
|-------------|----------|
| Click photo, title, category, price, quantity cells | Navigate to `/admin/tovary/{id}` |
| Click status Select | Change status only |
| Click Trash | Open dialog only — **no navigation** |
| Click Trash then Cancel | Stay on list, no navigation |
| Keyboard Enter on row | Navigate (unchanged) |
| Enter on focused Trash button | Activate button (open dialog), not row |

---

## Accessibility

| Check | Spec |
|-------|------|
| Icon-only button | `aria-label="Видалити товар"` |
| Dialog | Focus trap via AlertDialog; title/description readable |
| Keyboard | Tab to trash; Enter/Space opens dialog; Esc closes |

---

## Verification UI

| Artifact | Content |
|----------|---------|
| `18-MANUAL-CHECKLIST.md` | Rows: delete happy path; cancel; click row after cancel; guard error toast (optional seeded) |

---

## UI-SPEC COMPLETE
