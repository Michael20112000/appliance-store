---
phase: 31
slug: order-status-ux-bugfix
status: draft
shadcn_initialized: true
preset: base-nova (style), neutral baseColor, cssVariables, lucide icons
created: 2026-05-20
---

# Phase 31 — Order status UX & bugfix — UI Design Contract

> Admin `/admin/zamovlennia`: status column visual accents (ORD-05) + list/detail status selects (width, errors BUG-24). No new pages; shadcn Select + sonner toasts.

---

## Design System

| Property | Value |
|----------|-------|
| Tool | shadcn + Tailwind 4 |
| Components | `Select`, `SelectTrigger`, `SelectContent`, `SelectItem` — `@/components/ui/select` |
| Feedback | sonner `toast.error` / `toast.success` |
| Icons | None new this phase |

---

## Status color accents (ORD-05, D-09)

Apply **light** background + border on `SelectTrigger` (list + detail) via shared helper `getOrderStatusAccentClass(status: OrderStatus)`.

| Status | Background | Border | Notes |
|--------|------------|--------|-------|
| `PENDING` | `bg-amber-50` | `border-amber-200` | «Нове» |
| `CONFIRMED` | `bg-sky-50` | `border-sky-200` | |
| `READY_FOR_PICKUP` | `bg-violet-50` | `border-violet-200` | |
| `OUT_FOR_DELIVERY` | `bg-violet-50` | `border-violet-200` | Same family as ready |
| `COMPLETED` | `bg-emerald-50` | `border-emerald-200` | «Виконано» |
| `CANCELLED` | `bg-red-50` | `border-red-200` | «Скасовано» |

Dark mode: use `dark:bg-*-950/30` + `dark:border-*-800` variants on same hues.

**Do not** color entire table row — accent on trigger only (D-09 discretion: trigger-only).

---

## Select width (ORD-05, D-10)

| Surface | Current | Target |
|---------|---------|--------|
| List `OrderListStatusSelect` | `w-[11rem]` | `min-w-[14rem] w-auto max-w-[18rem]` — fits «Підтверджено (поточний)» |
| Detail `OrderStatusSelect` | `max-w-xs` | `min-w-[14rem] w-full max-w-md` |

`SelectTrigger`: add `whitespace-nowrap` so label does not wrap mid-word.

---

## Error & hint UX (BUG-24, D-06–D-08)

| Code | Title (toast) | Description (optional) |
|------|---------------|------------------------|
| `INSUFFICIENT_STOCK` | Недостатньо товару на складі для підтвердження | Збільште кількість товару в адмінці або скасуйте замовлення. |
| Others | Existing UA strings | Unchanged |

**List select** must use **same** mapping as detail (`order-status-select.tsx`).

Prefer `toast.error(title, { description })` for `INSUFFICIENT_STOCK` only (D-07).

---

## Accessibility

- Status colors are decorative; label text remains primary information.
- `SelectTrigger` keeps `size="sm"` on list; focus ring from shadcn default.
- Error toasts: `role="status"` via sonner defaults.

---

## Out of scope (UI)

- Row-level status badges separate from select
- Warning banner on order detail for low stock (D-12 discretion — optional, not required)
- Changing transition matrix or cancel dialog copy
