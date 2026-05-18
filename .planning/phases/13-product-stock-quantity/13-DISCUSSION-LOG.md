# Phase 13 — Discussion Log

**Date:** 2026-05-18  
**Mode:** discuss (interactive)

## Areas discussed

### 1. Quantity vs checkout / SOLD
- **Options:** metadata only | block at zero | decrement on checkout
- **Chosen:** decrement on checkout
- **Notes:** Розширення scope відносно ROADMAP (decrement був out of scope) — явне рішення користувача.

### 2. When quantity reaches 0
- **Options:** SOLD only | AVAILABLE + qty 0 | both SOLD and qty 0
- **Chosen:** quantity=0 і status=SOLD разом

### 3. Validation
- **Options:** min 1 | min 0 default 1 | min 0, 0 лише після продажу/ручного edit
- **Chosen:** min 0 у схемі; create default 1, create не дозволяє 0; edit дозволяє 0

### 4. Admin UI
- **Options:** table only | form only | both
- **Chosen:** колонка в `/admin/tovary` + поле в create/edit формі

## Deferred during discussion

- Sortable «Кількість» column
- Storefront display of stock
