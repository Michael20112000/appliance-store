---
phase: 29-product-cards-pdp-core-ux
reviewed: 2026-05-20T15:00:00Z
depth: standard
files_reviewed: 12
files_reviewed_list:
  - src/components/catalog/product-card-image-stack.tsx
  - src/types/catalog.ts
  - src/server/services/catalog.service.ts
  - src/components/catalog/product-card.tsx
  - src/components/wishlist/wishlist-grid.tsx
  - src/components/wishlist/wishlist-cabinet-preview.tsx
  - src/server/services/catalog.service.test.ts
  - src/lib/catalog/metadata.test.ts
  - src/components/catalog/product-gallery.tsx
  - src/components/cart/pdp-cart-fab.tsx
  - src/components/cart/add-to-cart-button.tsx
  - src/app/(storefront)/tovar/[slug]/page.tsx
findings:
  critical: 0
  warning: 3
  info: 2
  total: 5
status: issues_found
---

# Phase 29: Code Review Report

**Reviewed:** 2026-05-20T15:00:00Z  
**Depth:** standard  
**Files Reviewed:** 12  
**Status:** issues_found

## Summary

Reviewed 12 phase 29 deliverables: catalog card `previewImages` + hover crossfade stack, PDP lightbox Embla snap tuning, and PDP cart controls (`AddToCartButton` in-cart row + `PdpCartFab`). Data layer (`mapToCard`, `cardInclude take: 5`) and guest cart event wiring are sound. No security or data-loss defects found.

Three **Warning** items remain: accessibility on the multi-image stack, FAB label consistency, and a defensive gap when `images` is empty. Two **Info** notes cover a pre-existing guest cart cap edge case and a minor hover-timing race.

## Warnings

### WR-01: Inactive stack images remain in the accessibility tree

**File:** `src/components/catalog/product-card-image-stack.tsx:90-101`  
**Issue:** Up to five `OptimizedImage` nodes stay in the DOM with full `alt` text; only opacity hides inactive slides. Assistive tech can still encounter multiple identical product descriptions on one card link.  
**Fix:** Hide inactive slides from AT, e.g. wrap each image and set `aria-hidden={index !== activeIndex}` on inactive layers (keep `alt` only on the visible slide).

```tsx
{images.map((img, index) => (
  <div
    key={`${img.cloudinaryPublicId}-${index}`}
    className="absolute inset-0"
    aria-hidden={index !== activeIndex}
  >
    <OptimizedImage
      src={img.cloudinaryPublicId}
      alt={alt}
      fill
      className={`object-cover transition-opacity duration-300 ${
        index === activeIndex ? "opacity-100" : "opacity-0"
      }`}
      sizes={sizes}
    />
  </div>
))}
```

### WR-02: PdpCartFab `aria-label` omits cart count

**File:** `src/components/cart/pdp-cart-fab.tsx:43`  
**Issue:** The FAB always announces «Перейти до кошика» even when the badge shows `3` or `9+`. `GuestCartNavLink` includes count in its label (`Кошик, N товарів`), so screen-reader users on PDP get less context than in the header.  
**Fix:** Mirror the nav pattern:

```tsx
aria-label={
  count > 0
    ? `Перейти до кошика, ${count > 9 ? "більше 9" : count} товарів`
    : "Перейти до кошика"
}
```

(Label is only rendered when `count >= 1`, but dynamic text keeps parity if the guard changes.)

### WR-03: `ProductCardImageStack` does not handle `images.length === 0`

**File:** `src/components/catalog/product-card-image-stack.tsx:72-103`  
**Issue:** `ProductCard` guards `previewImages.length > 0` before mounting the stack, but the stack itself falls through to the multi-image branch and renders an empty absolutely positioned box if called with `[]`. A future caller could show a blank image area with no placeholder.  
**Fix:** Early-return `null` (or a single placeholder) when `images.length === 0`, or assert via types at the call site and document the contract in the component.

## Info

### IN-01: Guest add at pending-cart cap still shows «Вже в кошику»

**File:** `src/components/cart/add-to-cart-button.tsx:50-53` with `src/lib/cart/pending-storage.ts:45-47`  
**Issue:** When a guest already has 20 pending items, `addPendingProduct` returns without writing, but `handleAdd` always calls `setInCart(true)`. UI shows in-cart state without the product being stored (FAB count also stays unchanged). Pre-existing logic; file touched in plan 03.  
**Fix:** Make `addPendingProduct` return `boolean` (or throw a typed result) and only `setInCart(true)` on success; surface a Ukrainian error when at cap.

### IN-02: Hover rotation may not start until pointer re-enters

**File:** `src/components/catalog/product-card-image-stack.tsx:24-47,56-63`  
**Issue:** `canRotate` is computed in `useEffect` after mount. If the pointer is already over the card when media queries resolve to “rotatable”, `mouseenter` does not fire again and the interval never starts until leave + re-enter. Rare on fast desktop loads.  
**Fix:** Optional: when `canRotate` flips to `true`, check `matches(':hover')` on the container (or track `mouseenter`/`mouseleave` with a ref) and start the interval without requiring re-hover.

---

_Reviewed: 2026-05-20T15:00:00Z_  
_Reviewer: Claude (gsd-code-reviewer)_  
_Depth: standard_
