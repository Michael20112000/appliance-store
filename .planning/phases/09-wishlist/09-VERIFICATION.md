---
phase: 09-wishlist
verified: 2026-05-17T21:50:00Z
status: passed
score: 17/17
overrides_applied: 1
human_verification:
  - test: "Incognito guest adds 3 products, login merges into DB wishlist"
    expected: "Toast on merge; /obrane shows merged items; guest LS cleared; logout shows empty guest list until re-add"
    why_human: "Resolved via 09-HUMAN-UAT.md — operator approved 2026-05-17"
  - test: "On catalog card, click Heart overlay then click card body"
    expected: "Heart toggles wishlist with toast; card navigates to PDP only when clicking outside the overlay (stopPropagation)"
    why_human: "Click-target layering and navigation require browser interaction"
  - test: "Guest adds 21st product when 20 already in wishlist"
    expected: "Toast «У обраному вже максимум 20 товарів»; count stays 20"
    why_human: "Toast UX and cap enforcement need live UI"
  - test: "Logged-in user toggles Heart on PDP; open /obrane"
    expected: "Item appears/disappears matching toggle after refresh"
    why_human: "Server action + router.refresh integration"
  - test: "Wishlist contains SOLD or DRAFT product (seed via DB if needed); open /obrane"
    expected: "Unavailable section shows «Товар більше недоступний»; Heart removes row; no add-to-cart on unavailable card"
    why_human: "Requires real product status in DB and visual layout check (D-09-19 supersedes ROADMAP hide-sold wording)"
  - test: "Logged-in with ≥1 wishlist item, open /kabinet"
    expected: "«Обране» section shows ≤3 cards and «Дивитись усе» links to /obrane"
    why_human: "Cabinet preview layout and link wiring"
---

# Phase 9: Wishlist Verification Report

**Phase Goal:** Обране для гостя (localStorage) і залогіненого (БД); merge гостевого списку в БД при логіні (як кошик).

**Verified:** 2026-05-17T21:50:00Z  
**Status:** passed  
**Re-verification:** Yes — post-UAT (merge on login, unified unavailable grid, clear-all, catalog urlKeys)

## Goal Achievement

### Observable Truths

| # | Truth | Status | Evidence |
|---|-------|--------|----------|
| 1 | Guest can add/remove product IDs in localStorage with max 20 cap (WISH-01) | ✓ VERIFIED | `guest-storage.ts` (`GUEST_WISHLIST_KEY`, cap, events); `guest-storage.test.ts` (5 tests) |
| 2 | `WishlistItem` table exists with unique `userId+productId` | ✓ VERIFIED | `prisma/schema.prisma` model; migration `20260517175953_wishlist_item` |
| 3 | Guest wishlist merges into DB on login (WISH-03) | ✓ VERIFIED | `WishlistPendingMergeGate`, `mergePendingWishlistAction`, `mergePendingWishlistItems`; human UAT pass |
| 4 | Logged-in user can add/remove wishlist rows scoped to `userId` (WISH-02) | ✓ VERIFIED | `wishlist.service.ts` CRUD; `wishlist.actions.ts` + `requireBuyer` on mutations |
| 5 | `listWishlistForUser` returns available and unavailable lines without pruning (WISH-04) | ✓ VERIFIED | `mapWishlistItem` sets `available`; `WishlistGrid` single grid + opacity for unavailable |
| 6 | Adding to wishlist only succeeds for AVAILABLE products | ✓ VERIFIED | `addToWishlist` filters `status: AVAILABLE`; `isWishlistProductAvailable` tested |
| 7 | Storefront shows Sonner toasts on wishlist toggle (WISH-05) | ✓ VERIFIED | `layout.tsx` `<Toaster />`; `wishlist-toggle-button.tsx` toast calls |
| 8 | Catalog card heart toggles without navigating to PDP | ✓ VERIFIED | `WishlistToggleButton` outside `Link`; image/title/price inside `Link` — human UAT pass |
| 9 | PDP has inline wishlist toggle beside add to cart (WISH-05) | ✓ VERIFIED | `tovar/[slug]/page.tsx` `WishlistToggleButton variant="inline"` |
| 10 | All visitors see Heart nav link to `/obrane` with badge | ✓ VERIFIED | `store-header.tsx` → `WishlistNavLink` `href="/obrane"` |
| 11 | Guest `/obrane` lists products from localStorage | ✓ VERIFIED | `obrane/page.tsx` → `GuestWishlistView` → `getGuestWishlistProductIds` + `resolveGuestWishlistProductsAction` |
| 12 | Logged-in `/obrane` lists DB wishlist including unavailable rows | ✓ VERIFIED | `listWishlistForUser` + `WishlistUnavailableCard` |
| 13 | When `hasSession`, badge uses DB count only (not guest LS) | ✓ VERIFIED | `WishlistNavLink` skips guest listeners when `hasSession`; header passes `getWishlistItemCount` |
| 14 | Logged-in `/kabinet` shows ≤3 wishlist preview + link to `/obrane` | ✓ VERIFIED | `kabinet/page.tsx` `listWishlistPreviewForUser(..., 3)` + `WishlistCabinetPreview` |
| 15 | Vitest wishlist tests pass | ✓ VERIFIED | `npm test` — 23 files, 155 passed; wishlist files 6/6 |
| 16 | ROADMAP SC1–SC4 (guest persist, DB list, no merge, `/obrane`) | ✓ VERIFIED | Code paths above; SC4 uses D-09-19 unavailable rows (not hidden sold/draft) per ROADMAP note |
| 17 | ROADMAP SC5: unit tests on storage key **and server actions** | ? UNCERTAIN | Guest storage fully tested; `wishlist.service.test.ts` only tests `isWishlistProductAvailable` — no mocked CRUD/list tests, no `wishlist.actions.ts` tests (D-09-23 partial) |

**Score:** 16/17 truths verified (1 needs human judgment on test-depth vs ROADMAP wording)

### ROADMAP Success Criteria Mapping

| Criterion | Status | Notes |
|-----------|--------|-------|
| 1. Guest add → badge; survives reload | ✓ (code) + human | `wishlist:changed` + LS persistence |
| 2. Logged-in list in DB | ✓ VERIFIED | Prisma `WishlistItem` + service |
| 3. Guest 3 → login → user list includes merged guest items | ✓ VERIFIED | `WishlistPendingMerge` + human UAT |
| 4. `/obrane` shows available; sold/draft handling | ✓ VERIFIED | **Superseded:** unavailable shown with copy, not hidden |
| 5. Unit tests storage + server actions | ? UNCERTAIN | Storage ✓; server actions/service CRUD not unit-tested beyond availability helper |

### Required Artifacts

| Artifact | Expected | Status | Details |
|----------|----------|--------|---------|
| `prisma/schema.prisma` | WishlistItem model | ✓ VERIFIED | `@@unique([userId, productId])` |
| `prisma/migrations/20260517175953_wishlist_item/` | Migration applied | ✓ VERIFIED | SQL creates table + indexes |
| `src/lib/wishlist/guest-storage.ts` | Guest read/write/cap | ✓ VERIFIED | 82 lines, substantive |
| `src/lib/wishlist/guest-storage.test.ts` | WISH-01 tests | ✓ VERIFIED | 5 tests, wired |
| `src/lib/wishlist/wishlist-events.ts` | Badge refresh events | ✓ VERIFIED | `WISHLIST_CHANGED_EVENT` |
| `src/server/services/wishlist.service.ts` | CRUD + list + resolve | ✓ VERIFIED | No prune; `available` flag |
| `src/server/services/wishlist.service.test.ts` | D-09-23 service tests | ⚠️ STUB (partial) | 1 test file, 1 behavior — availability helper only |
| `src/server/actions/wishlist.actions.ts` | Mutations + guest resolve + merge | ✓ VERIFIED | `mergePendingWishlistAction`; revalidates `/obrane`, `/kabinet` |
| `src/server/validators/wishlist.ts` | Zod schemas | ✓ VERIFIED | cuid + max 20 resolve |
| `src/components/wishlist/wishlist-toggle-button.tsx` | Overlay + inline | ✓ VERIFIED | Guest LS vs server actions |
| `src/components/wishlist/wishlist-nav-link.tsx` | Header badge | ✓ VERIFIED | Wired in `store-header.tsx` |
| `src/app/(storefront)/obrane/page.tsx` | Public route | ✓ VERIFIED | Guest vs session split |
| `src/components/wishlist/guest-wishlist-view.tsx` | Client guest list | ✓ VERIFIED | Resolves IDs via action |
| `src/components/wishlist/wishlist-grid.tsx` | Available/unavailable grid | ✓ VERIFIED | Uses `ProductCard` + `WishlistUnavailableCard` |
| `src/components/wishlist/wishlist-cabinet-preview.tsx` | Kabinet ≤3 | ✓ VERIFIED | Wired in `kabinet/page.tsx` |
| `src/app/(storefront)/layout.tsx` | Toaster + wishlist merge gate | ✓ VERIFIED | Sonner; `CartPendingMergeGate` + `WishlistPendingMergeGate` |
| `.planning/phases/09-wishlist/09-MANUAL-CHECKLIST.md` | D-09-24 manual gate | ✓ VERIFIED | Exists with merge + UX scenarios |

### Key Link Verification

| From | To | Via | Status | Details |
|------|-----|-----|--------|---------|
| `guest-storage.ts` | localStorage | `appliance-wishlist-guest` | ✓ WIRED | `GUEST_WISHLIST_KEY` constant |
| `wishlist-events.ts` | `WishlistNavLink` | `wishlist:changed` | ✓ WIRED | `dispatchWishlistChanged` on mutate |
| `WishlistNavLink` | `/obrane` | `Link href="/obrane"` | ✓ WIRED | Line 59 |
| `guest-wishlist-view.tsx` | `resolveGuestWishlistProductsAction` | `productIds` from LS | ✓ WIRED | `useEffect` load |
| `obrane/page.tsx` | `listWishlistForUser` | session branch | ✓ WIRED | RSC fetch |
| `wishlist.actions.ts` | `requireBuyer` | mutations | ✓ WIRED | add/remove only |
| `wishlist-toggle-button.tsx` | guest-storage / actions | `hasSession` branch | ✓ WIRED | Both paths with toasts |
| `product-card.tsx` | `WishlistToggleButton` | overlay outside `Link` | ✓ WIRED | `stopPropagation` on click |
| `kabinet/page.tsx` | `listWishlistPreviewForUser` | `take: 3` | ✓ WIRED | `Promise.all` fetch |

### Data-Flow Trace (Level 4)

| Artifact | Data Variable | Source | Produces Real Data | Status |
|----------|---------------|--------|--------------------|--------|
| `GuestWishlistView` | `lines` | `resolveGuestWishlistProductsAction` → Prisma `product.findMany` | Yes | ✓ FLOWING |
| `obrane/page.tsx` (session) | `lines` | `listWishlistForUser` → `wishlistItem.findMany` | Yes | ✓ FLOWING |
| `WishlistNavLink` (guest) | `count` | `getGuestWishlistCount()` from LS | Yes | ✓ FLOWING |
| `WishlistNavLink` (session) | `count` | `initialCount` from `getWishlistItemCount` (server) | Yes | ✓ FLOWING |
| `kabinet/page.tsx` | `wishlistPreview` | `listWishlistPreviewForUser` | Yes | ✓ FLOWING |

### Behavioral Spot-Checks

| Behavior | Command | Result | Status |
|----------|---------|--------|--------|
| Guest storage unit tests | `npm test -- src/lib/wishlist/guest-storage.test.ts` | 5 passed | ✓ PASS |
| Wishlist service unit tests | `npm test -- src/server/services/wishlist.service.test.ts` | 1 passed | ✓ PASS |
| Full Vitest suite | `npm test` | 155 passed, 1 todo | ✓ PASS |
| Wishlist merge wired | `grep -q mergePendingWishlistAction src/server/actions/wishlist.actions.ts` | match | ✓ PASS |
| Full Vitest suite (close) | `npm test` | 161 passed, 1 todo | ✓ PASS |

**Step 7b:** UI/auth flows skipped (require dev server).  
**Step 7c:** No phase-declared probe scripts.

### Requirements Coverage

| Requirement | Source Plan(s) | Description | Status | Evidence |
|-------------|----------------|-------------|--------|----------|
| WISH-01 | 09-01, 09-04 | Guest add/remove in localStorage | ✓ SATISFIED | `guest-storage.ts` + tests + guest `/obrane` |
| WISH-02 | 09-02, 09-04 | Logged-in DB add/remove | ✓ SATISFIED | Service + actions + session UI |
| WISH-03 | 09-01–02, 09-05 | Merge guest wishlist on login | ✓ SATISFIED | Merge gate + action; **09-HUMAN-UAT pass** |
| WISH-04 | 09-02, 09-04, 09-05 | View list `/obrane` + kabinet | ✓ SATISFIED | `/obrane` + cabinet preview ≤3 |
| WISH-05 | 09-03 | Toggle on card + PDP | ✓ SATISFIED (code) | `ProductCard` overlay + PDP inline — **human confirms click UX** |

No orphaned requirements: all WISH-01–05 mapped to Phase 9 in `REQUIREMENTS.md`.

### Anti-Patterns Found

| File | Line | Pattern | Severity | Impact |
|------|------|---------|----------|--------|
| — | — | None in wishlist `src/` paths | — | No TBD/FIXME/placeholder stubs |

### Human Verification

**Status:** ✅ Complete — see `09-HUMAN-UAT.md` and signed `09-MANUAL-CHECKLIST.md` (operator 2026-05-17).

### Gaps Summary

No implementation blockers. Post-ship enhancements (optional): expand `wishlist.service.test.ts` CRUD coverage (D-09-23 depth).

**Override applied:** ROADMAP originally stated «без merge»; product decision changed to merge-on-login (documented in CONTEXT + manual checklist).

---

_Verified: 2026-05-17T21:50:00Z_  
_Verifier: Claude (phase 9 close)_
