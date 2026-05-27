# Phase 50: Cart & Wishlist Drawers — Research

**Researched:** 2026-05-27
**Domain:** React context state management, shadcn Sheet (Base UI Dialog), Next.js server actions, component reuse
**Confidence:** HIGH

---

## Project Constraints (from CLAUDE.md / AGENTS.md)

- **AGENTS.md directive:** "This is NOT the Next.js you know — read `node_modules/next/dist/docs/` before writing any code." (Next.js 16.2.6 is in use — some APIs may differ from training data.)
- `@base-ui/react` Dialog is the Sheet primitive — NOT Radix-ui. The project uses `@base-ui/react@^1.4.1`.
- UI language: Ukrainian only.
- No Zustand — state management via React Context + `useState`. The ChatProvider is the established pattern.
- `nuqs` (`useQueryStates`) is used for URL-reflected state in the chat panel and catalog filters.
- shadcn components from `src/components/ui/` — Sheet already exists and is in active use.
- Test framework: Vitest + `@testing-library/react`. `/** @vitest-environment jsdom */` pragma required for component tests.
- `nyquist_validation: true` — Validation Architecture section is required.

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| DRWR-01 | Корзина відкривається як full-height drawer справа (FAB/кнопка кошика більше не переходить на /koszyk) | Cart FAB is a `<Link href="/koszyk">` in StorefrontFabs; CartNavLink and GuestCartNavLink are also `<Link href="/koszyk">`. All three must become buttons/triggers that open a Sheet. CartProvider or a lightweight drawer-state context carries open/close state. |
| DRWR-02 | Вішліст відкривається як full-height drawer справа (іконка серця більше не переходить на /obrane) | WishlistNavLink is a `<Link href="/obrane">`. Must become a button/trigger. Same drawer-state context carries wishlist open/close. |
</phase_requirements>

---

## Summary

Phase 50 replaces two navigation links (`/koszyk`, `/obrane`) with full-height right-side Sheet drawers. The project already has:
1. A `Sheet` component backed by `@base-ui/react` Dialog — it handles right-side slide-in, backdrop, and close on backdrop click natively.
2. Rich cart and wishlist components (`CartLineItem`, `GuestCartView`, `GuestCartLineItem`, `CartSummary`, `WishlistGrid`, `WishlistPageContent`) that can be reused inside the drawers with minor props adaptation.
3. An established pattern for global UI state: `ChatProvider` (React Context + `useState`) lives in the storefront layout tree and controls `StorefrontFabs`. The same pattern applies here.

The core work is: (a) introduce a `DrawerProvider` or extend the existing `ChatProvider` to hold `cartOpen` / `wishlistOpen` booleans; (b) convert every `<Link href="/koszyk">` and `<Link href="/obrane">` to buttons/triggers; (c) compose `CartDrawer` and `WishlistDrawer` as `<Sheet>` + existing content components. The pages `/koszyk` and `/obrane` remain but are no longer reachable from primary nav — they become dead-end fallbacks (or can be kept for SEO/direct URL access).

**Primary recommendation:** Add a `DrawerProvider` as a thin React Context alongside `ChatProvider`, wire it into `ChatProviderGate`/`ChatProvider` so `StorefrontFabs` receives `openCartDrawer`. Convert cart nav links and wishlist nav link to callbacks. Compose new `CartDrawer` and `WishlistDrawer` components from existing building blocks. No new packages needed.

---

## Architectural Responsibility Map

| Capability | Primary Tier | Secondary Tier | Rationale |
|------------|-------------|----------------|-----------|
| Drawer open/close state | Frontend Client (React Context) | — | Local UI state; no persistence needed, mirrors ChatProvider pattern |
| Cart contents fetch (auth user) | API / Backend (`getCartForUser`) | — | Server action via `resolveGuestCartAction` for guests |
| Cart mutations (remove, clear) | API / Backend (server actions) | Frontend (optimistic state) | Existing `removeFromCartAction`, `clearCartAction` |
| Wishlist contents fetch (auth) | API / Backend (`listWishlistForUser`) | — | Server action `resolveGuestWishlistProductsAction` for guests |
| Wishlist mutations (remove, clear) | API / Backend (server actions) | Frontend (optimistic state) | Existing actions |
| Cart badge count in FAB | Frontend Client | — | `CART_CHANGED_EVENT` listener + `getPendingItemCount()` |
| Wishlist badge count in header | Frontend Client | — | `WISHLIST_CHANGED_EVENT` listener |
| "Add to cart" → open drawer trigger | Frontend Client | — | `add-to-cart-button` fires `CART_CHANGED_EVENT`; drawer context has separate `openCart()` |
| Sheet component (backdrop, slide) | Browser / Client (Base UI Dialog) | — | `src/components/ui/sheet.tsx` — no new package |

---

## Standard Stack

### Core (all already installed — no new packages)

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| `@base-ui/react` | ^1.4.1 | Sheet/Drawer primitive (Dialog) | Already powers `src/components/ui/sheet.tsx` |
| React Context + useState | React 19.2.4 | Drawer open/close state | Established project pattern (ChatProvider) |
| `src/components/ui/sheet.tsx` | n/a (local) | Full-height right Sheet | `SheetContent side="right"` with `h-full w-3/4 sm:max-w-sm` already configured |
| `src/components/ui/scroll-area.tsx` | n/a (local) | Scrollable drawer body | Already available in UI library |

### Supporting

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| `sonner` (Toaster) | already installed | Remove/clear toast notifications | Already used in `ClearCartButton`, `WishlistToggleButton` |
| `nuqs` | already installed | URL-reflected drawer state (optional) | Only if drawer open state needs to survive navigation |

**Installation:** No new packages needed. [VERIFIED: codebase grep + package.json]

---

## Package Legitimacy Audit

No new packages are being introduced in this phase. All libraries used are already installed and validated in prior phases.

| Package | Registry | Status | Disposition |
|---------|----------|--------|-------------|
| `@base-ui/react` | npm | Active, already installed | Approved (used since v2.2+) |
| `react` (Context API) | npm | Core, already installed | Approved |

**Packages removed due to slopcheck:** None — no new packages.

---

## Architecture Patterns

### System Architecture Diagram

```
User action (click cart icon/FAB / wishlist icon)
        │
        ▼
DrawerContext.openCart() / openWishlist()
        │
        ▼
CartDrawer / WishlistDrawer  ←── Sheet (right, full-height, @base-ui Dialog)
        │                              │
        │                         Backdrop click → close
        │
        ├── [auth user]  → server action getCartForUser / listWishlistForUser
        │                  (called on drawer open via useEffect)
        └── [guest]      → resolveGuestCartAction / resolveGuestWishlistProductsAction
                           (called on drawer open; re-triggered by CART_CHANGED_EVENT)

Mutations (remove, clear) → existing server actions → revalidatePath → router.refresh()
                                                                │
                                                                ▼
                                                    Drawer re-fetches contents
```

### Recommended Project Structure

```
src/components/
├── cart/
│   ├── cart-drawer.tsx          # NEW: Sheet wrapper + CartDrawerContent
│   ├── cart-drawer-content.tsx  # NEW: auth branch + guest branch (reuses CartLineItem, GuestCartLineItem, CartSummary)
│   ├── cart-line-item.tsx       # EXISTING — no change needed
│   ├── guest-cart-line-item.tsx # EXISTING — no change needed (remove callback stays)
│   ├── cart-summary.tsx         # EXISTING — keep, strip the <Link href="/zamovlennia"> approach (see pitfall)
│   └── ...
├── wishlist/
│   ├── wishlist-drawer.tsx      # NEW: Sheet wrapper + WishlistDrawerContent
│   ├── wishlist-drawer-content.tsx # NEW: auth + guest branches
│   └── ...
└── layout/
    ├── storefront-fabs.tsx      # CHANGE: cart <Link> → <button onClick={openCart}>
    └── ...

src/lib/drawers/
└── drawer-context.tsx           # NEW: DrawerProvider + useDrawers hook
                                 # OR: extend chat-provider.tsx
```

### Pattern 1: DrawerProvider (mirrors ChatProvider)

**What:** A React Context that exposes `cartOpen`, `wishlistOpen`, `openCart`, `closeCart`, `openWishlist`, `closeWishlist`. Placed in the same tree level as `ChatProvider` — inside `ChatProvider.tsx` or alongside it in `ChatProviderGate`. [ASSUMED — design choice, no prior code for this]

**When to use:** When open/close state needs to be shared across `StorefrontFabs` (has the Cart FAB), `StoreHeader` (`CartNavLink`, `WishlistNavLink`), and the drawer components themselves.

**Example (inline in ChatProvider or separate):**
```tsx
// Source: project pattern — mirrors ChatProvider/ChatContext structure
// src/lib/drawers/drawer-context.tsx
"use client";
import { createContext, useContext, useState, useMemo, type ReactNode } from "react";

type DrawerContextValue = {
  cartOpen: boolean;
  wishlistOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  openWishlist: () => void;
  closeWishlist: () => void;
};

const DrawerContext = createContext<DrawerContextValue | null>(null);

export function DrawerProvider({ children }: { children: ReactNode }) {
  const [cartOpen, setCartOpen] = useState(false);
  const [wishlistOpen, setWishlistOpen] = useState(false);

  const value = useMemo(() => ({
    cartOpen,
    wishlistOpen,
    openCart: () => setCartOpen(true),
    closeCart: () => setCartOpen(false),
    openWishlist: () => setWishlistOpen(true),
    closeWishlist: () => setWishlistOpen(false),
  }), [cartOpen, wishlistOpen]);

  return <DrawerContext.Provider value={value}>{children}</DrawerContext.Provider>;
}

export function useDrawers() {
  const ctx = useContext(DrawerContext);
  if (!ctx) throw new Error("useDrawers must be used within DrawerProvider");
  return ctx;
}
```

### Pattern 2: Sheet as Full-Height Right Drawer

**What:** Use `SheetContent` with `side="right"` and override width to full-height. The current Sheet default is `w-3/4 sm:max-w-sm` — override to `sm:max-w-md` or `w-full sm:max-w-sm` as appropriate. [VERIFIED: src/components/ui/sheet.tsx]

**Example:**
```tsx
// Source: src/components/ui/sheet.tsx (existing component)
<Sheet open={cartOpen} onOpenChange={(open) => !open && closeCart()}>
  <SheetContent
    side="right"
    className="flex flex-col gap-0 p-0 sm:max-w-md w-full"
    showCloseButton={false}
  >
    <SheetHeader className="border-b px-4 py-3">
      <SheetTitle>Кошик</SheetTitle>
    </SheetHeader>
    <div className="flex-1 overflow-y-auto">
      {/* CartDrawerContent */}
    </div>
    <SheetFooter className="border-t">
      {/* CartSummary + checkout link */}
    </SheetFooter>
  </SheetContent>
</Sheet>
```

### Pattern 3: Cart Drawer Data Loading

**What:** On drawer open (`useEffect` gated on `cartOpen`), fetch cart data. For auth users, call a server action. For guests, call `resolveGuestCartAction` from `pending-storage`. Re-trigger on `CART_CHANGED_EVENT`. [VERIFIED: src/components/cart/guest-cart-view.tsx shows this pattern]

**Key insight:** `GuestCartView` already implements this exact pattern (load on mount + CART_CHANGED_EVENT listener). The drawer version is identical except the wrapping layout changes. The auth version mirrors the `/koszyk` page: call `getCartForUser` via server action (or create a new `getCartAction` that returns `CartViewDto`).

**Current gap:** There is no `getCartAction` server action that returns `CartViewDto` for auth users. The `/koszyk` page uses SSR `getCartForUser` directly. A new thin server action will be needed:
```ts
// New server action in cart.actions.ts
export async function getCartAction(): Promise<CartViewDto> {
  const session = await requireBuyer();
  return getCartForUser(session.user.id);
}
```

### Pattern 4: Component Reuse Strategy

| Existing Component | Drawer Reuse | Change Needed |
|--------------------|-------------|---------------|
| `CartLineItem` | Full reuse | `router.refresh()` still works inside drawer |
| `GuestCartLineItem` | Full reuse | No change (already callback-based) |
| `GuestCartView` | Partial reuse of data-loading logic | Extract into hook or copy pattern |
| `CartSummary` | Partial reuse | The checkout `<Link>` is fine; remove `md:sticky md:top-20` layout class |
| `CartEmpty` | Full reuse | No change |
| `ClearCartButton` | Full reuse | `router.refresh()` works inside drawer |
| `WishlistPageContent` | Partial reuse | Remove page-level layout wrappers (max-w, py-12) |
| `WishlistGrid` | Full reuse | No change |
| `GuestWishlistView` | Partial reuse | Same as GuestCartView — extract loading logic |
| `ClearWishlistButton` | Full reuse | No change |

### Anti-Patterns to Avoid

- **Navigating inside the drawer to `/zamovlennia`:** The "Оформити замовлення" link in `CartSummary` currently points to `/zamovlennia`. Inside the drawer this is correct behavior (navigation closes the drawer naturally when the page changes). Do NOT try to prevent navigation.
- **Full-page wrapper layout inside drawer:** `WishlistPageContent` has `mx-auto max-w-6xl px-4 py-12 sm:px-6`. Strip these when reusing inside the drawer.
- **`router.refresh()` conflict:** `CartLineItem` calls `router.refresh()` after remove — this re-renders the server components in the current page, which is correct. The drawer stays open because it's client-state. No conflict.
- **Putting DrawerProvider outside ChatProvider:** `StorefrontFabs` is rendered inside `ChatProvider`'s render. Any context consumed by `StorefrontFabs` must be provided by an ancestor in the same tree. `DrawerProvider` must wrap `StorefrontFabs` — which means it lives inside `ChatProvider` or at the same level.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Backdrop dismiss, close on Escape | Custom overlay + keydown handler | `Sheet` (Base UI Dialog) | Already handles focus trap, Escape key, backdrop dismiss, WAI-ARIA |
| Scroll lock when drawer open | Custom body scroll lock | `Sheet` (Base UI Dialog) | Base UI handles scroll lock natively |
| Cart data loading for auth users in drawer | New API route | `getCartAction` server action | Server actions are the established pattern; no new route needed |
| Animation for slide-in | Custom CSS transitions | `SheetContent` `data-starting-style` / `data-ending-style` | Already configured in `sheet.tsx` |

---

## Common Pitfalls

### Pitfall 1: `StorefrontFabs` receives `openCart` — but where does DrawerProvider live?

**What goes wrong:** `StorefrontFabs` is rendered as a child of `ChatProvider` (line 542 of `chat-provider.tsx`). If `DrawerProvider` is placed outside `ChatProvider`, `StorefrontFabs` cannot access it.

**Why it happens:** `ChatProvider` owns `StorefrontFabs`. Adding a sibling context outside `ChatProvider` is not consumable inside it.

**How to avoid:** Either (a) place `DrawerProvider` inside `ChatProvider`'s JSX (wrapping `children` and `StorefrontFabs`), or (b) add `cartOpen/openCart/wishlistOpen/openWishlist` directly to `ChatProvider`'s context value. Option (a) keeps concerns separated. Option (b) avoids a new file. Both are valid — option (a) is cleaner for future phases.

**Warning signs:** If `useDrawers()` throws "must be used within DrawerProvider" at runtime, the provider is in the wrong place.

### Pitfall 2: `revalidatePath("/koszyk")` in server actions — still needed after drawer

**What goes wrong:** `revalidateCartPaths()` in `cart.actions.ts` calls `revalidatePath("/koszyk")` and `revalidatePath("/", "layout")`. After the drawer is introduced, the /koszyk page is no longer the primary view, but the actions still correctly revalidate the layout (which re-renders the count badge in `CartNavLink`). Leave these as-is. The `/koszyk` and `/obrane` pages remain in the codebase.

**How to avoid:** Do NOT remove the `revalidatePath` calls — the layout-level revalidation keeps the SSR badge counts correct after server-side mutations.

### Pitfall 3: `CartLineItem` calls `router.refresh()` — drawer stays open

**What goes wrong:** A developer expects `router.refresh()` to close the drawer. It does not — `cartOpen` is client state, unaffected by router refresh.

**Why it happens:** `router.refresh()` triggers RSC re-render but does not affect React context state.

**How to avoid:** The drawer re-loads its own data by re-calling the server action after mutation, OR by listening to `CART_CHANGED_EVENT` (guest) or relying on the component calling `router.refresh()` (auth). The existing `CartLineItem` calls `router.refresh()` which will cause the parent server component to re-render, but since the drawer renders client-side data, a separate `load()` call or `useEffect` on `cartOpen` change is needed for the auth case.

**Concrete pattern:** After auth mutations in the drawer, call `router.refresh()` AND re-invoke the `getCartAction()` to sync drawer state.

### Pitfall 4: Sheet `sm:max-w-sm` default is narrow for cart

**What goes wrong:** The existing `SheetContent` CSS has `data-[side=right]:sm:max-w-sm` hardcoded in the className string in `sheet.tsx`. For a full-height cart drawer, this may feel cramped on desktop.

**How to avoid:** Pass a `className` override: `className="sm:max-w-md"` or `className="sm:max-w-lg"` on `SheetContent`. The Base UI Dialog does not restrict overriding this.

### Pitfall 5: WishlistNavLink and CartNavLink are Server Components / Client Components

**What goes wrong:** `CartNavLink` is an `async` server component (`await getCartItemCount`). It cannot receive a callback prop for opening a drawer.

**Why it happens:** Server components cannot hold or call client-side functions.

**How to avoid:** Convert `CartNavLink` to a client component that receives `onOpen: () => void` and calls it on click. Or replace it with a new `CartNavButton` client component that calls `useDrawers().openCart()`. Similarly for `WishlistNavLink` — it is already a client component (uses `useEffect`) but navigates with `<Link>`. Convert the `<Link>` to a `<button>` that calls `openWishlist()`. The count/badge logic stays the same.

**`CartNavLink` conversion plan:**
- Remove `async` — fetch the count via a separate async component gate (mirror `CartPendingMergeGate` pattern) that passes `initialCount` as a prop, or use an RSC wrapper that passes the count down and renders a client `CartNavButton`.

### Pitfall 6: Wishlist drawer for guests loads from localStorage, not from a prop

**What goes wrong:** The guest wishlist is stored in localStorage. The drawer cannot receive a server-fetched list for guests — it must call `resolveGuestWishlistProductsAction` client-side, same as `GuestWishlistView`.

**How to avoid:** Reuse the exact loading pattern from `GuestWishlistView` — it already handles WISHLIST_CHANGED_EVENT reactivity.

---

## Code Examples

### Example 1: Converting Cart FAB from Link to button

```tsx
// Source: src/components/layout/storefront-fabs.tsx (EXISTING — change needed)
// BEFORE:
<Link href="/koszyk" aria-label="Кошик" className="...">
  <ShoppingCart className="size-6" />
</Link>

// AFTER:
const { openCart } = useDrawers();
<button
  type="button"
  aria-label="Кошик"
  onClick={openCart}
  className="..."
>
  <ShoppingCart className="size-6" />
</button>
```

### Example 2: Converting WishlistNavLink Link to button

```tsx
// Source: src/components/wishlist/wishlist-nav-link.tsx (EXISTING — change needed)
// BEFORE:
<Link href="/obrane" aria-label={ariaLabel}>
  <Heart className="size-5" />
</Link>

// AFTER:
const { openWishlist } = useDrawers();
<button
  type="button"
  aria-label={ariaLabel}
  onClick={openWishlist}
  className="relative inline-flex min-h-11 min-w-11 items-center justify-center rounded-md px-3 text-sm font-medium hover:bg-muted"
>
  <Heart className="size-5" />
  {/* badge stays identical */}
</button>
```

### Example 3: CartDrawer skeleton

```tsx
// Source: src/components/ui/sheet.tsx (existing) + new file pattern
// src/components/cart/cart-drawer.tsx
"use client";
import { useDrawers } from "@/lib/drawers/drawer-context";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetClose } from "@/components/ui/sheet";
import { CartDrawerContent } from "./cart-drawer-content";

export function CartDrawer({ hasSession }: { hasSession: boolean }) {
  const { cartOpen, closeCart } = useDrawers();
  return (
    <Sheet open={cartOpen} onOpenChange={(open) => { if (!open) closeCart(); }}>
      <SheetContent side="right" className="flex flex-col gap-0 p-0 sm:max-w-md w-full" showCloseButton={false}>
        <SheetHeader className="flex-row items-center justify-between border-b px-4 py-3">
          <SheetTitle>Кошик</SheetTitle>
          <SheetClose render={<button type="button" aria-label="Закрити кошик" />} />
        </SheetHeader>
        <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4">
          <CartDrawerContent hasSession={hasSession} />
        </div>
      </SheetContent>
    </Sheet>
  );
}
```

### Example 4: Auth-branch data loading in CartDrawerContent

```tsx
// Source: pattern from GuestCartView + CartPage — new combination
// src/components/cart/cart-drawer-content.tsx
"use client";
import { useEffect, useState } from "react";
import { useDrawers } from "@/lib/drawers/drawer-context";
import { getCartAction } from "@/server/actions/cart.actions";   // NEW action
import { resolveGuestCartAction } from "@/server/actions/cart.actions";
import { CART_CHANGED_EVENT } from "@/lib/cart/cart-events";
import { getPendingProductIds } from "@/lib/cart/pending-storage";
import type { CartViewDto } from "@/types/cart";

export function CartDrawerContent({ hasSession }: { hasSession: boolean }) {
  const { cartOpen } = useDrawers();
  const [cart, setCart] = useState<CartViewDto | null>(null);

  const load = async () => {
    if (hasSession) {
      const result = await getCartAction();
      setCart(result);
    } else {
      const ids = getPendingProductIds();
      const result = await resolveGuestCartAction(ids);
      setCart(result.cart);
    }
  };

  useEffect(() => {
    if (!cartOpen) return;
    void load();
    if (!hasSession) {
      window.addEventListener(CART_CHANGED_EVENT, load);
      return () => window.removeEventListener(CART_CHANGED_EVENT, load);
    }
  }, [cartOpen, hasSession]); // eslint-disable-line react-hooks/exhaustive-deps

  // render cart.items, cart.subtotalKopiyky, etc.
}
```

---

## Dependencies — Files That Change

| File | Change Type | Detail |
|------|-------------|--------|
| `src/lib/drawers/drawer-context.tsx` | CREATE | DrawerProvider + useDrawers |
| `src/components/cart/cart-drawer.tsx` | CREATE | Sheet wrapper |
| `src/components/cart/cart-drawer-content.tsx` | CREATE | Auth + guest data loading + CartLineItem list |
| `src/components/wishlist/wishlist-drawer.tsx` | CREATE | Sheet wrapper |
| `src/components/wishlist/wishlist-drawer-content.tsx` | CREATE | Auth + guest data loading + WishlistGrid |
| `src/server/actions/cart.actions.ts` | MODIFY | Add `getCartAction()` returning `CartViewDto` |
| `src/components/layout/storefront-fabs.tsx` | MODIFY | Cart `<Link>` → `<button onClick={openCart}>` |
| `src/components/cart/cart-nav-link.tsx` | MODIFY | `async` server component → RSC wrapper + client `CartNavButton`, or convert to client component |
| `src/components/cart/guest-cart-nav-link.tsx` | MODIFY | `<Link href="/koszyk">` → `<button onClick={openCart}>` (needs `useDrawers()`) |
| `src/components/wishlist/wishlist-nav-link.tsx` | MODIFY | `<Link href="/obrane">` → `<button onClick={openWishlist}>` |
| `src/components/cart/pdp-cart-fab.tsx` | MODIFY | `<Link href="/koszyk">` → `<button onClick={openCart}>` |
| `src/components/chat/chat-provider.tsx` | MODIFY | Wrap children + StorefrontFabs in `DrawerProvider`; pass `hasSession` to drawer components |
| `src/components/chat/chat-provider-gate.tsx` | MODIFY | Pass `hasSession` into drawer components if needed |

**Files that do NOT change:**
- `/src/app/(storefront)/koszyk/page.tsx` — page stays (direct URL still works)
- `/src/app/(storefront)/obrane/page.tsx` — page stays
- `CartLineItem`, `GuestCartLineItem`, `CartEmpty`, `ClearCartButton` — reused as-is
- `WishlistGrid`, `WishlistUnavailableCard`, `ClearWishlistButton` — reused as-is
- `CartSummary` — reused as-is (the checkout link to `/zamovlennia` works normally)

**Secondary references to audit (may or may not need change):**
- `src/components/checkout/guest-checkout-view.tsx` — has `<Link href="/koszyk">` as a back-link; leave as-is (the /koszyk page remains accessible)
- `src/components/wishlist/wishlist-cabinet-preview.tsx` — has `<Link href="/obrane">` "see all" link; leave as-is or convert to `openWishlist` (success criterion does not require this)
- `src/components/layout/storefront-fabs.test.tsx` — UPDATE: tests assert `href="/koszyk"` on cart link; these break after the change and must be updated

---

## Runtime State Inventory

This phase is not a rename/refactor of stored data — it is a UI interaction change. No runtime state migration is needed.

- **Stored data:** Cart data in DB (CartItem table), guest cart in localStorage `appliance-cart-pending` — no change in schema or keys.
- **Wishlist data:** DB (WishlistItem table), guest wishlist in localStorage `appliance-wishlist-guest` — no change.
- **OS/service state:** None.
- **Build artifacts:** None.

---

## Environment Availability

No new external dependencies. All tools already available.

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| `@base-ui/react` | Sheet component | Yes | ^1.4.1 | — |
| `vitest` | Test suite | Yes | ^4.1.6 | — |
| `@testing-library/react` | Component tests | Yes | ^16.3.2 | — |

---

## Validation Architecture

### Test Framework

| Property | Value |
|----------|-------|
| Framework | Vitest 4.1.6 + @testing-library/react 16.3.2 |
| Config file | `vitest.config.ts` (root) |
| Quick run command | `npx vitest run src/components/cart src/components/wishlist src/components/layout/storefront-fabs.test.tsx` |
| Full suite command | `npx vitest run` |

### Phase Requirements → Test Map

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| DRWR-01 | Cart FAB renders as button (not Link) and calls openCart | unit | `npx vitest run src/components/layout/storefront-fabs.test.tsx` | Yes (update existing) |
| DRWR-01 | CartNavButton renders as button and calls openCart | unit | `npx vitest run src/components/cart/cart-nav-button.test.tsx` | No — Wave 0 |
| DRWR-01 | CartDrawer renders SheetContent when open | unit | `npx vitest run src/components/cart/cart-drawer.test.tsx` | No — Wave 0 |
| DRWR-01 | CartDrawer closes on backdrop/close button | unit | `npx vitest run src/components/cart/cart-drawer.test.tsx` | No — Wave 0 |
| DRWR-02 | WishlistNavLink renders as button (not Link) and calls openWishlist | unit | `npx vitest run src/components/wishlist/wishlist-nav-link.test.tsx` | No — Wave 0 |
| DRWR-02 | WishlistDrawer renders SheetContent when open | unit | `npx vitest run src/components/wishlist/wishlist-drawer.test.tsx` | No — Wave 0 |
| DRWR-01/02 | DrawerProvider exposes correct context values | unit | `npx vitest run src/lib/drawers/drawer-context.test.tsx` | No — Wave 0 |

**Manual validation required (browser):**
- Clicking cart FAB opens drawer from right, no navigation to /koszyk
- Clicking cart icon in header opens drawer
- Clicking wishlist heart in header opens drawer, no navigation to /obrane
- Both drawers close on backdrop click
- Both drawers close on X button
- Cart drawer shows items + subtotal
- Wishlist drawer shows items
- Remove item from cart drawer — item disappears, count badge updates
- Remove item from wishlist drawer — item disappears
- Guest flow: add to cart (localStorage) → open cart drawer → items visible

### Sampling Rate

- **Per task commit:** `npx vitest run src/components/cart src/components/wishlist src/components/layout/storefront-fabs.test.tsx`
- **Per wave merge:** `npx vitest run`
- **Phase gate:** Full suite green before `/gsd:verify-work`

### Wave 0 Gaps

- [ ] `src/lib/drawers/drawer-context.test.tsx` — covers DrawerProvider open/close state
- [ ] `src/components/cart/cart-drawer.test.tsx` — covers DRWR-01 (sheet open/close)
- [ ] `src/components/cart/cart-nav-button.test.tsx` — covers DRWR-01 (header cart button)
- [ ] `src/components/wishlist/wishlist-nav-link.test.tsx` — covers DRWR-02 (wishlist button)
- [ ] `src/components/wishlist/wishlist-drawer.test.tsx` — covers DRWR-02 (sheet open/close)
- [ ] Update `src/components/layout/storefront-fabs.test.tsx` — tests FAB-01-b asserts `href="/koszyk"`, must change to assert button behavior

---

## Security Domain

No security surface changes in this phase. The drawers call existing server actions (`removeFromCartAction`, `clearCartAction`, `removeFromWishlistAction`) which already call `requireBuyer()` for auth guard. Guest paths go through public `resolveGuestCartAction` / `resolveGuestWishlistProductsAction` which contain no auth-sensitive data.

| ASVS Category | Applies | Standard Control |
|---------------|---------|-----------------|
| V4 Access Control | Yes | `requireBuyer()` already enforced in all mutations |
| V5 Input Validation | Yes | Zod schemas in `cart.ts`, `wishlist.ts` validators — unchanged |
| V2 Authentication | No | No new auth surface |

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Navigate to /koszyk page | Open right-side Sheet drawer | Phase 50 | No page navigation; cart accessible from any page |
| Navigate to /obrane page | Open right-side Sheet drawer | Phase 50 | Same |
| Cart/wishlist as full pages | Cart/wishlist as layered UI | Phase 50 | Pages remain as SEO/direct-URL fallback |

---

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | DrawerProvider is a new separate context (not merged into ChatProvider) | Architecture Patterns, Pattern 1 | Low — both approaches are valid; merging into ChatProvider is simpler but couples concerns |
| A2 | /koszyk and /obrane pages remain in the codebase after Phase 50 | Dependencies | Low — success criteria only say "FAB/icon no longer navigates", not "page is removed" |
| A3 | CartNavLink needs conversion to client component (not a full redesign) | Dependencies | Low — any client component wrapper pattern achieves the goal |
| A4 | `CartSummary` checkout link to `/zamovlennia` works normally from inside the drawer | Code Examples | Low — standard Next.js Link navigation closes the drawer implicitly when page changes |
| A5 | `wishlist-cabinet-preview.tsx` "Дивитись усе" link does not need conversion | Dependencies | Low — not listed in success criteria; can remain as /obrane page link |

---

## Open Questions (RESOLVED)

1. **Should `CartNavLink` become fully client-rendered (losing SSR count)?**
   - What we know: `CartNavLink` is `async` and fetches the count server-side. Converting to fully client breaks SSR badge (flicker on load).
   - What's unclear: Whether an RSC wrapper that passes `initialCount` + a client button is acceptable vs. a full client component.
   - Recommendation: Use RSC wrapper pattern — `CartNavLink` (server, gets count) renders a `CartNavButton` (client, receives `initialCount`, calls `openCart`). This preserves SSR count and matches the existing `StorefrontFabs` → `initialCartCount` prop pattern.
   - RESOLVED: RSC wrapper pattern — `CartNavLink` remains `async` RSC, renders `CartNavButton` client component. Implemented in Plan 50-05 Task 2.

2. **Should PdpCartFab open the drawer or navigate to /koszyk?**
   - What we know: DRWR-01 says "FAB/кнопка кошика більше не переходить на /koszyk". PdpCartFab is a separate FAB on the PDP page (only visible when cart has items). It currently links to /koszyk.
   - Recommendation: Convert PdpCartFab to open the cart drawer — it is specifically called out as a "cart button" in the requirement. But it lives outside ChatProvider (inside PDP page), so it needs access to DrawerProvider. DrawerProvider must be placed high enough to cover PDP pages.
   - RESOLVED: PdpCartFab opens the cart drawer. Implemented in Plan 50-05 Task 3.

3. **Where does DrawerProvider sit in the tree relative to ChatProvider?**
   - What we know: `ChatProvider` renders `StorefrontFabs` and `ChatPanel` as siblings to `{children}`. `StorefrontFabs` needs `openCart`. `PdpCartFab` (inside page `{children}`) also needs `openCart`.
   - Recommendation: `DrawerProvider` wraps the entire `ChatProvider` tree (i.e., placed in `ChatProviderGate` or `StorefrontLayout`). `CartDrawer` and `WishlistDrawer` are rendered as children of `DrawerProvider`, not inside `ChatProvider`. This way both `StorefrontFabs` (inside ChatProvider) and `PdpCartFab` (inside page children) can consume `DrawerContext`.
   - RESOLVED: `DrawerProvider` wraps `ChatContext.Provider` inside `chat-provider.tsx` — covers both `StorefrontFabs` and page `{children}`. `CartDrawer` and `WishlistDrawer` rendered as siblings to `StorefrontFabs`/`ChatPanel`. Implemented in Plan 50-05 Task 1.

---

## Sources

### Primary (HIGH confidence)
- `src/components/ui/sheet.tsx` — verified Sheet API, `side="right"`, `@base-ui/react` Dialog
- `src/components/layout/storefront-fabs.tsx` — verified Cart FAB as `<Link href="/koszyk">`
- `src/components/cart/cart-nav-link.tsx` — verified `<Link href="/koszyk">`
- `src/components/wishlist/wishlist-nav-link.tsx` — verified `<Link href="/obrane">`
- `src/components/chat/chat-provider.tsx` — verified DrawerProvider reference pattern
- `src/components/cart/guest-cart-view.tsx` — verified data-loading pattern (CART_CHANGED_EVENT)
- `src/components/wishlist/guest-wishlist-view.tsx` — verified data-loading pattern
- `src/server/actions/cart.actions.ts` — verified available mutations + `revalidateCartPaths`
- `src/server/actions/wishlist.actions.ts` — verified available mutations
- `src/app/(storefront)/layout.tsx` — verified component tree structure
- `src/components/catalog/catalog-filters-sheet.tsx` — verified Sheet usage pattern

### Secondary (MEDIUM confidence)
- `vitest.config.ts` — verified test setup
- `src/components/layout/storefront-fabs.test.tsx` — verified test pattern (jsdom, vi.mock)

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — all libraries verified in codebase
- Architecture: HIGH — direct codebase verification of all referenced files
- Pitfalls: HIGH — traced from actual code paths
- Component reuse: HIGH — read every relevant component file

**Research date:** 2026-05-27
**Valid until:** 2026-06-27 (stable codebase, no fast-moving dependencies)
