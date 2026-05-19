---
phase: 22
phase_slug: delivery-aware-order-status
date: "2026-05-19"
requirements:
  - ORD-03
  - ORD-04
---

# Phase 22 — Validation strategy

## Automated

| ID | Check | Command / location |
|----|-------|-------------------|
| V1 | Delivery × status matrix | `npx vitest run src/lib/order/status-transitions.test.ts` |
| V2 | Admin service transition + delivery | `npx vitest run src/server/services/admin-order.service.test.ts` |
| V3 | List select hides wrong option | `npx vitest run src/components/admin/order-list-status-select.test.tsx` |
| V4 | Full suite | `npm test` |
| V5 | Build | `npm run build` |

## Manual (optional)

1. Admin → Замовлення → `CONFIRMED` + Самовивіз: select has no «Доставляється».
2. Same list row with Доставка по Львову: no «Готово до самовивозу».
3. Detail page `/admin/zamovlennia/{n}` — same rules.

## Release criteria

All V1–V5 pass; ROADMAP success criteria 1–4 satisfied.
