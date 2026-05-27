---
phase: 50-cart-wishlist-drawers
reviewed: 2026-05-27T00:00:00Z
depth: standard
files_reviewed: 20
files_reviewed_list:
  - src/components/cart/cart-drawer-content.tsx
  - src/components/cart/cart-drawer.test.tsx
  - src/components/cart/cart-drawer.tsx
  - src/components/cart/cart-nav-button.test.tsx
  - src/components/cart/cart-nav-button.tsx
  - src/components/cart/cart-nav-link.tsx
  - src/components/cart/guest-cart-nav-link.tsx
  - src/components/cart/pdp-cart-fab.tsx
  - src/components/chat/chat-provider.tsx
  - src/components/layout/storefront-fabs.test.tsx
  - src/components/layout/storefront-fabs.tsx
  - src/components/wishlist/wishlist-drawer-content.tsx
  - src/components/wishlist/wishlist-drawer.test.tsx
  - src/components/wishlist/wishlist-drawer.tsx
  - src/components/wishlist/wishlist-nav-link.test.tsx
  - src/components/wishlist/wishlist-nav-link.tsx
  - src/lib/drawers/drawer-context.test.tsx
  - src/lib/drawers/drawer-context.tsx
  - src/server/actions/cart.actions.ts
  - src/server/actions/wishlist.actions.ts
findings:
  critical: 0
  warning: 5
  info: 4
  total: 9
status: issues_found
---

# Phase 50: Code Review Report

**Reviewed:** 2026-05-27T00:00:00Z
**Depth:** standard
**Files Reviewed:** 20
**Status:** issues_found

## Summary

This phase introduces cart and wishlist drawers built on a shared `DrawerProvider` context, guest-mode storage, and server actions with Zod validation. The architecture is sound: context-driven open/close state, clean separation of server/client boundaries, and symmetrical cart/wishlist implementations. No security vulnerabilities were found.

Five warnings and four info-level findings were identified. The most consequential issues are a stale-closure race condition in `CartDrawerContent` (no cancellation guard in the `load` callback, unlike its wishlist counterpart which was done correctly), an unused dead-code function in `ChatProvider` that will generate a lint error, and a misleading wrong-schema reuse in `removeFromCartAction`.

---

## Warnings

### WR-01: Missing cancellation guard in `CartDrawerContent.load` — stale state update on rapid open/close

**File:** `src/components/cart/cart-drawer-content.tsx:29-51`

**Issue:** The `load` callback is a `useCallback` with no `cancelled` flag. When the drawer opens, triggers a fetch, and is closed before the fetch completes, `setCart`, `setLoading`, and `setError` will still be called on the now-irrelevant (or unmounted-context) state. Compare this with `WishlistDrawerContent` (lines 35–69) which correctly declares `let cancelled = false` in the effect and gates every state setter behind `if (!cancelled)`. The asymmetry means the cart drawer can write stale server data into state if the user rapidly toggles the drawer.

Concrete scenario: user opens cart (fetch starts), closes cart before fetch completes, reopens cart — the first fetch resolves and overwrites the second fetch's loading state, producing a brief flash of stale data.

**Fix:** Move the async logic inside the `useEffect` body (as done in `WishlistDrawerContent`) so the cancellation token is scoped per effect run:

```tsx
useEffect(() => {
  if (!cartOpen) return;

  let cancelled = false;

  async function load() {
    setLoading(true);
    setError(null);
    try {
      if (hasSession) {
        const result = await getCartAction();
        if (!cancelled) setCart(result);
      } else {
        const productIds = getPendingProductIds();
        if (productIds.length === 0) {
          if (!cancelled) setCart({ items: [], subtotalKopiyky: 0, removedTitles: [] });
          return;
        }
        const result = await resolveGuestCartAction(productIds);
        if (!cancelled) setCart(result.cart);
      }
    } catch {
      if (!cancelled) setError("Не вдалося завантажити кошик. Спробуйте оновити сторінку.");
    } finally {
      if (!cancelled) setLoading(false);
    }
  }

  void load();

  if (!hasSession) {
    window.addEventListener(CART_CHANGED_EVENT, load);
    return () => {
      cancelled = true;
      window.removeEventListener(CART_CHANGED_EVENT, load);
    };
  }

  return () => { cancelled = true; };
}, [cartOpen, hasSession]);
```

Note: with this restructuring, `load` is no longer a `useCallback` — remove it and the `useCallback` import dependency on `load`.

---

### WR-02: `removeFromCartAction` reuses `addToCartSchema` — validates a phantom `quantity` field

**File:** `src/server/actions/cart.actions.ts:51`

**Issue:** `removeFromCartAction` calls `addToCartSchema.parse({ productId, quantity: 1 })`. The schema is:

```ts
z.object({ productId: z.string().cuid(...), quantity: z.literal(1) })
```

The `quantity` field is meaningless for a remove operation and its presence here is misleading: if the schema ever evolves (e.g., adding `.min()` / `.max()` constraints), the remove action would silently adopt them. More critically, the intent is obscured — a reader must trace the schema to discover the field is ignored. The action should use a dedicated schema or extract a shared `productIdSchema`.

**Fix:** Extract and reuse a standalone product-ID validator:

```ts
// In src/server/validators/cart.ts
export const cartProductIdSchema = z.object({
  productId: z.string().cuid("Невірний ідентифікатор товару"),
});

// In removeFromCartAction:
const parsed = cartProductIdSchema.parse({ productId });
await removeFromCart(session.user.id, parsed.productId);
```

---

### WR-03: `guestRedirect` in `ChatProvider` is dead code — triggers no-lint warnings and may mislead

**File:** `src/components/chat/chat-provider.tsx:143-149`

**Issue:** `guestRedirect` is defined as a `useCallback` at line 143 but is never called anywhere in the file or exported. The surrounding comment at line 168 (`// D-09: no redirect for guests`) confirms the redirect path was intentionally disabled, but the function body was left in. It captures `router`, `pathname`, and `searchParams` in its dependency array, adding unnecessary reactive subscriptions. TypeScript will not error on this (no strict no-unused-locals for callbacks via destructuring), but ESLint `@typescript-eslint/no-unused-vars` will flag it.

**Fix:** Remove the dead function entirely:

```tsx
// Delete lines 143–149 (the guestRedirect useCallback) from chat-provider.tsx
```

---

### WR-04: `StorefrontFabs` reads `hasSession` from two sources that can diverge

**File:** `src/components/layout/storefront-fabs.tsx:34,42,102`

**Issue:** `StorefrontFabs` receives `hasSession` as a prop (line 30) but also destructures `hasSession: chatHasSession` from `useChat()` (line 34). The prop `hasSession` is used for the guest cart-sync `useEffect` (line 42), while `chatHasSession` from context is used to gate the unread-dot indicator (line 102). Both are derived from the same server-side session check, so in practice they should always agree — but they are read from different sources. If `ChatProvider` is ever reused with a different `hasSession` value than the one passed to `StorefrontFabs`, the unread dot and the cart-sync behavior will disagree.

**Fix:** Remove the `chatHasSession` alias and use the prop `hasSession` consistently:

```tsx
const { isOpen: chatIsOpen, openPanel, unreadFromStore } = useChat();
// ...
{hasSession && unreadFromStore ? (
```

---

### WR-05: `CART_DRW-03` test does not actually verify `closeCart` is called — assertion is vacuous

**File:** `src/components/cart/cart-drawer.test.tsx:74-90`

**Issue:** The test CART-DRW-03 (line 74) is supposed to verify that `closeCart` is called when `onOpenChange(false)` fires. The test body renders the `CartDrawer`, then only asserts `expect(closeCartMock).toBeDefined()`. This assertion is always true regardless of whether `closeCart` is ever wired up — it merely confirms the mock function object exists. The comment on line 88–89 explicitly acknowledges the gap: "closeCart will be tested when Sheet's onOpenChange(false) is triggered by implementation." The test provides zero coverage of its stated intent.

**Fix:** Simulate the close event properly using the mock `Sheet`'s `onOpenChange` prop, or fire a keyboard/click event that triggers the sheet close. Example using the mock:

```tsx
it("CART-DRW-03: calls closeCart when onOpenChange fires false", () => {
  const closeCartMock = vi.fn();
  vi.mocked(useDrawers).mockReturnValue({ cartOpen: true, closeCart: closeCartMock, ... });
  // Extend the Sheet mock to capture onOpenChange and expose a trigger
  // OR test at a higher level by clicking the SheetClose button
  render(<CartDrawer />);
  fireEvent.click(screen.getByRole("button", { name: "Закрити кошик" }));
  expect(closeCartMock).toHaveBeenCalledTimes(1);
});
```

---

## Info

### IN-01: Aria-label pluralization is grammatically incorrect for singular counts in Ukrainian

**File:** `src/components/cart/cart-nav-button.tsx:19`, `src/components/cart/guest-cart-nav-link.tsx:25`, `src/components/wishlist/wishlist-nav-link.tsx:53`

**Issue:** All three components unconditionally append `товарів` (genitive plural) for any count > 0. In Ukrainian, the correct form for count=1 is `товар` (nominative singular), for counts 2–4 it is `товари` (genitive singular), and `товарів` (genitive plural) applies only from 5 onward. Screen reader users will hear "Кошик, 1 товарів" instead of "Кошик, 1 товар". The test CART-NAV-03 embeds the wrong form for count=2 (`"Кошик, 2 товарів"`) and will need updating.

**Fix:** Add a pluralization helper:

```ts
function countLabel(n: number): string {
  const mod100 = n % 100;
  const mod10 = n % 10;
  if (mod100 >= 11 && mod100 <= 14) return `${n} товарів`;
  if (mod10 === 1) return `${n} товар`;
  if (mod10 >= 2 && mod10 <= 4) return `${n} товари`;
  return `${n} товарів`;
}
```

---

### IN-02: `CartNavButton` badge caps at `9+` but `WishlistNavLink` badge caps at `99+` — inconsistent UX

**File:** `src/components/cart/cart-nav-button.tsx:24`, `src/components/cart/guest-cart-nav-link.tsx:30`, `src/components/layout/storefront-fabs.tsx:50`, `src/components/wishlist/wishlist-nav-link.tsx:50`

**Issue:** Cart nav components use `count > 9 ? "9+"` (max 9 items visible) while the wishlist nav uses `count > 99 ? "99+"`. Since both cart and wishlist share the same 20-item hard limit at the server boundary, capping the cart badge at `9+` hides perfectly reachable values (10–20) while the wishlist shows them. This creates an asymmetric UI with no justification in the design constraints.

**Fix:** Align cart badge cap to `99+` (matching wishlist), or document the intentional design difference in a comment.

---

### IN-03: `DrawerProvider` does not prevent both drawers from being open simultaneously

**File:** `src/lib/drawers/drawer-context.tsx:30-33`

**Issue:** `openCart` and `openWishlist` are independent state setters. Nothing prevents `cartOpen` and `wishlistOpen` from both being `true` at the same time (e.g., if a future call site invokes `openCart()` while the wishlist is open). Both drawers would render simultaneously as stacked `Sheet` components at the same z-index, producing an inaccessible stacked modal state. The test suite has no coverage for this mutual-exclusion case (DRWR-CTX-05 only tests `openWishlist` in isolation).

**Fix:** Enforce mutual exclusion in the context actions:

```tsx
openCart: () => { setWishlistOpen(false); setCartOpen(true); },
openWishlist: () => { setCartOpen(false); setWishlistOpen(true); },
```

---

### IN-04: `cart-drawer.test.tsx` imports `React` after `vi.mock` calls but uses `React.createElement` in mocks defined before the import

**File:** `src/components/cart/cart-drawer.test.tsx:17-35`

**Issue:** The `vi.mock` factory callbacks at lines 17–28 reference `React.createElement` and `React.ReactNode` before `import React from "react"` at line 35. Vitest hoists `vi.mock` calls above imports, so the mock factories execute before the `React` binding is established. In practice this works only because Vitest's module registry resolves `React` lazily at factory call time (not at registration time), but this is an undocumented behavior — future Vitest upgrades could break these tests. The same pattern exists in `wishlist-drawer.test.tsx` lines 17–35.

**Fix:** Import React at the top of the file before mock definitions, or use JSX syntax in mock factories (preferred in the existing test style used by `storefront-fabs.test.tsx`):

```tsx
import React from "react";
// Then vi.mock calls below
```

---

_Reviewed: 2026-05-27T00:00:00Z_
_Reviewer: Claude (gsd-code-reviewer)_
_Depth: standard_
