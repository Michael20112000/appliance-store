# Phase 29: Product cards & PDP core UX - Discussion Log

> **Audit trail only.** Decisions are in CONTEXT.md.

**Date:** 2026-05-20
**Phase:** 29-product-cards-pdp-core-ux
**Areas discussed:** card-hover, lightbox, pdp-cart, fab-cart

---

## Card hover (CARD-01)

| Option | Description | Selected |
|--------|-------------|----------|
| extend-api | PublicProductCard + ≤5 images in list query | ✓ |
| all-images | All images per product | |
| lazy-second | Fetch on hover | |

**User's choice:** extend-api

| Option | Description | Selected |
|--------|-------------|----------|
| 3s-first | 3s interval, first image immediate on hover | ✓ |
| 3s | Strict 3s including first | |

**Mobile:** static first image only ✓  
**Reduced motion:** you decide → CONTEXT: no rotation

---

## Lightbox (PDP-05)

| Option | Description | Selected |
|--------|-------------|----------|
| momentum-snap | Smooth drag + snap, no jerk | ✓ |
| loop-yes | Keep loop in lightbox | ✓ |

---

## PDP cart (PDP-06)

| Option | Description | Selected |
|--------|-------------|----------|
| vze-v-kosyku | «Вже в кошику» label | ✓ |
| trash-only | Icon-only remove | ✓ |
| remove-go-cart | Drop «Перейти до кошика» | ✓ |

---

## Cart FAB (PDP-06)

| Option | Description | Selected |
|--------|-------------|----------|
| pdp-only | FAB only on /tovar/[slug] | ✓ |
| fab visibility | you decide → count ≥ 1 | discretion |
| fab guest | you decide → same FAB + pending count | discretion |

---

## Claude's Discretion

- Card `prefers-reduced-motion`, crossfade timing, Embla tuning, FAB pixel offset, list query field naming.

## Deferred Ideas

- Similar products (Phase 30), global cart FAB, mobile tap-to-cycle on cards.
