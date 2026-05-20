---
phase: 29
slug: product-cards-pdp-core-ux
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-05-20
---

# Phase 29 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Vitest + @testing-library/react |
| **Config file** | `vitest.config.ts` |
| **Quick run command** | `npm test` |
| **Full suite command** | `npm test && npm run build` |
| **Estimated runtime** | ~30–60 seconds |

---

## Sampling Rate

- **After every task commit:** Run targeted test file(s) from task `<verify>`
- **After every plan wave:** `npm test`
- **Before `/gsd-verify-work`:** `npm test` + `npm run build` green + manual UAT from `29-UI-SPEC.md`

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Threat Ref | Secure Behavior | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|------------|-----------------|-----------|-------------------|-------------|--------|
| 29-01-01 | 01 | 1 | CARD-01 | T-29-SC | N/A | unit | `npm test -- catalog` (mapper) | ❌ W0 | ⬜ pending |
| 29-01-02 | 01 | 1 | CARD-01 | — | N/A | manual | Desktop hover crossfade | N/A | ⬜ pending |
| 29-02-01 | 02 | 1 | PDP-05 | — | N/A | manual | Lightbox swipe snap | N/A | ⬜ pending |
| 29-02-02 | 02 | 1 | PDP-05 | — | N/A | automated | `npm run build` | ✅ | ⬜ pending |
| 29-03-01 | 03 | 2 | PDP-06 | T-29-01 | Fixed /koszyk href | unit/grep | grep no «Перейти до кошика» in add-to-cart-button | ✅ | ⬜ pending |
| 29-03-02 | 03 | 2 | PDP-06 | — | N/A | manual | FAB stack above chat | N/A | ⬜ pending |
| 29-03-03 | 03 | 2 | PDP-06 | — | N/A | automated | `npm test && npm run build` | ✅ | ⬜ pending |

---

## Wave 0 Requirements

- [ ] Add unit test for `mapToCard` / `previewImages` length ≤ 5 (new or extend catalog service test)
- [ ] Optional RTL test for `AddToCartButton` in-cart copy and trash-only remove

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Card hover rotation | CARD-01 | CSS + hover media | Desktop, product with 3 images, hover 10s |
| Lightbox snap | PDP-05 | Touch emulation | Open gallery, drag, release mid-slide |
| FAB position | PDP-06 | Visual stack | PDP with item in cart — cart FAB above chat |
| Reduced motion cards | CARD-01 | OS setting | Enable reduce motion — no rotation |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity maintained
- [ ] `npm run build` on final wave
- [ ] `nyquist_compliant: true` after Wave 0 complete

**Approval:** pending
