---
phase: 50
slug: cart-wishlist-drawers
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-05-27
---

# Phase 50 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Vitest 4.1.6 + @testing-library/react 16.3.2 |
| **Config file** | `vitest.config.ts` (root) |
| **Quick run command** | `npx vitest run src/components/cart src/components/wishlist src/components/layout/storefront-fabs.test.tsx` |
| **Full suite command** | `npx vitest run` |
| **Estimated runtime** | ~30 seconds |

---

## Sampling Rate

- **After every task commit:** Run `npx vitest run src/components/cart src/components/wishlist src/components/layout/storefront-fabs.test.tsx`
- **After every plan wave:** Run `npx vitest run`
- **Before `/gsd:verify-work`:** Full suite must be green
- **Max feedback latency:** ~30 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Threat Ref | Secure Behavior | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|------------|-----------------|-----------|-------------------|-------------|--------|
| 50-xx-01 | — | 0 | DRWR-01/02 | — | N/A | unit | `npx vitest run src/lib/drawers/drawer-context.test.tsx` | ❌ W0 | ⬜ pending |
| 50-xx-02 | — | 0 | DRWR-01 | — | N/A | unit | `npx vitest run src/components/cart/cart-nav-button.test.tsx` | ❌ W0 | ⬜ pending |
| 50-xx-03 | — | 0 | DRWR-01 | — | N/A | unit | `npx vitest run src/components/cart/cart-drawer.test.tsx` | ❌ W0 | ⬜ pending |
| 50-xx-04 | — | 0 | DRWR-02 | — | N/A | unit | `npx vitest run src/components/wishlist/wishlist-nav-link.test.tsx` | ❌ W0 | ⬜ pending |
| 50-xx-05 | — | 0 | DRWR-02 | — | N/A | unit | `npx vitest run src/components/wishlist/wishlist-drawer.test.tsx` | ❌ W0 | ⬜ pending |
| 50-xx-06 | — | 1 | DRWR-01 | — | N/A | unit | `npx vitest run src/components/layout/storefront-fabs.test.tsx` | ✅ (update) | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `src/lib/drawers/drawer-context.test.tsx` — DrawerProvider open/close state for DRWR-01/02
- [ ] `src/components/cart/cart-nav-button.test.tsx` — header cart button calls openCart (DRWR-01)
- [ ] `src/components/cart/cart-drawer.test.tsx` — CartDrawer sheet open/close (DRWR-01)
- [ ] `src/components/wishlist/wishlist-nav-link.test.tsx` — wishlist button calls openWishlist (DRWR-02)
- [ ] `src/components/wishlist/wishlist-drawer.test.tsx` — WishlistDrawer sheet open/close (DRWR-02)
- [ ] Update `src/components/layout/storefront-fabs.test.tsx` — FAB-01-b asserts `href="/koszyk"` must change to button behavior

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Clicking cart FAB opens drawer from right, no navigation to /koszyk | DRWR-01 | Browser sheet animation | Click cart FAB → drawer slides in from right; URL stays same |
| Clicking cart icon in header opens drawer | DRWR-01 | Browser animation | Click cart icon in header → drawer slides in |
| Clicking wishlist heart in header opens drawer, no navigation to /obrane | DRWR-02 | Browser animation | Click heart icon → drawer slides in; URL stays same |
| Both drawers close on backdrop click | DRWR-01/02 | DOM interaction | Open drawer → click outside → drawer closes |
| Both drawers close on X button | DRWR-01/02 | DOM interaction | Open drawer → click X → drawer closes |
| Cart drawer shows items + subtotal | DRWR-01 | Data fetch | Add item to cart → open cart drawer → items and total visible |
| Wishlist drawer shows items | DRWR-02 | Data fetch | Add item to wishlist → open wishlist drawer → items visible |
| Remove item from cart drawer | DRWR-01 | Mutation + revalidation | Open cart drawer → click remove → item disappears, badge updates |
| Remove item from wishlist drawer | DRWR-02 | Mutation + revalidation | Open wishlist drawer → click remove → item disappears |
| Guest flow: cart drawer shows localStorage items | DRWR-01 | localStorage read | (guest) add to cart → open cart drawer → items visible |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 30s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
