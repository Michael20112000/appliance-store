---
phase: 30
slug: similar-products-footer-layout
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-05-20
---

# Phase 30 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Vitest |
| **Config file** | `vitest.config.ts` |
| **Quick run command** | `npm test -- src/server/services/catalog.service.test.ts` |
| **Full suite command** | `npm test && npm run build` |
| **Estimated runtime** | ~30–60 seconds |

---

## Sampling Rate

- **After every task commit:** Run `npm test -- src/server/services/catalog.service.test.ts`
- **After every plan wave:** `npm test` + `npm run build`
- **Before `/gsd-verify-work`:** Full suite + manual UAT from `30-UI-SPEC.md`

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Threat Ref | Secure Behavior | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|------------|-----------------|-----------|-------------------|-------------|--------|
| 30-01-01 | 01 | 1 | PDP-07 | T-30-01 | IDs from PDP only | unit | `npm test -- catalog.service.test.ts -t similarPriceBand` | ❌ W0 | ⬜ pending |
| 30-01-02 | 01 | 1 | PDP-07 | T-30-01 | Exclude self from pool | unit | `npm test -- catalog.service.test.ts -t listSimilarPublicProducts` | ❌ W0 | ⬜ pending |
| 30-01-03 | 01 | 1 | PDP-07 | — | N/A | manual | PDP similar grid 2-col mobile / 4 desktop | N/A | ⬜ pending |
| 30-02-01 | 02 | 1 | FOOT-05 | — | N/A | grep | `md:text-center` on © row | ✅ | ⬜ pending |
| 30-02-02 | 02 | 1 | FOOT-05 | — | N/A | manual | Footer mobile order contacts→form→map | N/A | ⬜ pending |
| 30-02-03 | 02 | 1 | FOOT-05 | — | N/A | automated | `npm test && npm run build` | ✅ | ⬜ pending |

---

## Wave 0 Requirements

- [ ] `similarPriceBandKopiyky` unit tests (20% and 40% bands)
- [ ] `listSimilarPublicProducts` tests with mocked prisma (exclude self, fallback tiers, empty array)
- [ ] Extend `PublicProductCard` type with `category.id` if needed

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Similar section hidden when zero | PDP-07 / D-12 | Needs sparse category seed | Open PDP in category with 1 SKU — no section |
| Footer desktop map left | FOOT-05 | Visual layout | md+ viewport: map only in left column, taller iframe |
| Footer mobile stack | FOOT-05 | Responsive order | < md: contacts, then form, then map |

---

## Threat Model References

| ID | Threat | Mitigation |
|----|--------|------------|
| T-30-01 | IDOR via client-supplied similar IDs | Server-only PDP-resolved productId/categoryId |

---
