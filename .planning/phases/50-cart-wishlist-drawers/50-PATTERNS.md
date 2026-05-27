# Phase 50: Cart & Wishlist Drawers — Pattern Map

**Mapped:** 2026-05-27
**Files analyzed:** 13 (5 CREATE, 8 MODIFY)
**Analogs found:** 13 / 13

---

## File Classification

| New/Modified File | Role | Data Flow | Closest Analog | Match Quality |
|---|---|---|---|---|
| `src/lib/drawers/drawer-context.tsx` | provider/context | event-driven | `src/components/chat/chat-provider.tsx` | role-match |
| `src/components/cart/cart-drawer.tsx` | component | request-response | `src/components/catalog/catalog-filters-sheet.tsx` | exact |
| `src/components/cart/cart-drawer-content.tsx` | component | CRUD + event-driven | `src/components/cart/guest-cart-view.tsx` | exact |
| `src/components/wishlist/wishlist-drawer.tsx` | component | request-response | `src/components/catalog/catalog-filters-sheet.tsx` | exact |
| `src/components/wishlist/wishlist-drawer-content.tsx` | component | CRUD + event-driven | `src/components/wishlist/guest-wishlist-view.tsx` | exact |
| `src/server/actions/cart.actions.ts` | server action | CRUD | self (same file, add action) | exact |
| `src/components/layout/storefront-fabs.tsx` | component | event-driven | self (same file, convert Link→button) | exact |
| `src/components/cart/cart-nav-link.tsx` | component | request-response | `src/components/cart/guest-cart-nav-link.tsx` | role-match |
| `src/components/cart/guest-cart-nav-link.tsx` | component | event-driven | self (same file, convert Link→button) | exact |
| `src/components/wishlist/wishlist-nav-link.tsx` | component | event-driven | self (same file, convert Link→button) | exact |
| `src/components/cart/pdp-cart-fab.tsx` | component | event-driven | self (same file, convert Link→button) | exact |
| `src/components/chat/chat-provider.tsx` | provider | event-driven | self (same file, wrap with DrawerProvider) | exact |
| `src/components/chat/chat-provider-gate.tsx` | gate/RSC | request-response | self (same file, pass `hasSession` to drawers) | exact |

---

## Pattern Assignments

### `src/lib/drawers/drawer-context.tsx` (provider, event-driven)

**Analog:** `src/components/chat/chat-provider.tsx`

**Imports pattern** (lines 1-12 of chat-provider.tsx):
```tsx
"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
```

**Context shape + createContext pattern** (lines 46-75 of chat-provider.tsx):
```tsx
type ChatContextValue = {
  hasSession: boolean;
  isOpen: boolean;
  // ... more fields
  openPanel: (options?: ProductChatContext) => void;
  closePanel: () => void;
};

const ChatContext = createContext<ChatContextValue | null>(null);
```

**useMemo value object pattern** (lines 482-537 of chat-provider.tsx):
```tsx
const value = useMemo<ChatContextValue>(
  () => ({
    hasSession,
    isOpen,
    // ... all fields
    openPanel,
    closePanel,
  }),
  [
    // all deps listed
  ],
);

return (
  <ChatContext.Provider value={value}>
    {children}
    <StorefrontFabs ... />
    <ChatPanel />
  </ChatContext.Provider>
);
```

**useChat hook pattern — throw if outside provider** (lines 552-558 of chat-provider.tsx):
```tsx
export function useChat() {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error("useChat must be used within ChatProvider");
  }
  return context;
}
```

**DrawerProvider adaptation notes:**
- Keep the same `createContext<T | null>(null)` pattern
- Use `useMemo` for the context value to avoid unnecessary re-renders
- Export a `useDrawers()` hook that throws if used outside provider
- State: `useState(false)` for `cartOpen` and `wishlistOpen`; no `useCallback` needed for simple setters — they can be inline arrow functions in the memo
- Do NOT add `useQueryStates` (no URL-reflected state needed; plain `useState` is the spec)
- The `DrawerProvider` must wrap `children` AND `<CartDrawer />` and `<WishlistDrawer />` as siblings to children (mirrors how `ChatProvider` renders `<StorefrontFabs />` and `<ChatPanel />` as siblings)

---

### `src/components/cart/cart-drawer.tsx` (component, request-response)

**Analog:** `src/components/catalog/catalog-filters-sheet.tsx`

**Full file of analog** (catalog-filters-sheet.tsx, lines 1-48):
```tsx
"use client";

import { useState } from "react";
import { SlidersHorizontalIcon } from "lucide-react";
import {
  CatalogFiltersPanel,
  type CatalogFiltersPanelProps,
} from "@/components/catalog/catalog-filters";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

export function CatalogFiltersSheet(props: CatalogFiltersPanelProps) {
  const [open, setOpen] = useState(false);

  return (
    <div className="mb-4 lg:hidden">
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger
          render={
            <Button variant="outline" className="w-full sm:w-auto">
              <SlidersHorizontalIcon />
              Фільтри
            </Button>
          }
        />
        <SheetContent side="left" className="flex w-full flex-col sm:max-w-sm">
          <SheetHeader>
            <SheetTitle>Фільтри</SheetTitle>
          </SheetHeader>
          <div className="flex-1 overflow-y-auto px-4 pb-4">
            <CatalogFiltersPanel {...props} />
          </div>
          <SheetFooter>
            <SheetClose render={<Button className="w-full">Показати результати</Button>} />
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </div>
  );
}
```

**Sheet API key facts** (from `src/components/ui/sheet.tsx`):
- `<Sheet open={bool} onOpenChange={fn}>` — controlled via `@base-ui/react` Dialog.Root props
- `<SheetContent side="right" className="...">` — renders Portal + Overlay + Popup; `side="right"` gives full-height right slide-in
- Default width: `data-[side=right]:w-3/4 data-[side=right]:sm:max-w-sm` — override with `className="sm:max-w-md"` or wider
- `showCloseButton={false}` prop skips the built-in X button so you can render your own `<SheetClose>`
- `<SheetClose render={<button ... />}>` — Base UI render prop pattern (NOT `asChild`)
- `<SheetHeader>`, `<SheetFooter>`, `<SheetTitle>` are plain divs/components wrapping Base UI primitives

**CartDrawer adaptation notes:**
- Open state comes from `useDrawers().cartOpen` — do NOT use local `useState`
- Close: `onOpenChange={(open) => { if (!open) closeCart(); }}`
- Use `side="right"`, `showCloseButton={false}`, add manual `<SheetClose render={<button type="button" aria-label="Закрити кошик" />}>`
- Width override: `className="flex flex-col gap-0 p-0 sm:max-w-md w-full"` (wider than default sm:max-w-sm)
- Inner layout: `<SheetHeader>` with border-b, flex-1 scroll area, optional `<SheetFooter>` with border-t

---

### `src/components/cart/cart-drawer-content.tsx` (component, CRUD + event-driven)

**Analog:** `src/components/cart/guest-cart-view.tsx`

**Full file of analog** (guest-cart-view.tsx, lines 1-98):
```tsx
"use client";

import { useCallback, useEffect, useState } from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CartEmpty } from "@/components/cart/cart-empty";
import { CartSummary } from "@/components/cart/cart-summary";
import { GuestCartLineItem } from "@/components/cart/guest-cart-line-item";
import { GuestClearCartButton } from "@/components/cart/guest-clear-cart-button";
import { CART_CHANGED_EVENT } from "@/lib/cart/cart-events";
import { getPendingProductIds } from "@/lib/cart/pending-storage";
import { resolveGuestCartAction } from "@/server/actions/cart.actions";
import type { CartViewDto } from "@/types/cart";

export function GuestCartView() {
  const [cart, setCart] = useState<CartViewDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);

    const productIds = getPendingProductIds();
    if (productIds.length === 0) {
      setCart({ items: [], subtotalKopiyky: 0, removedTitles: [] });
      setLoading(false);
      return;
    }

    try {
      const result = await resolveGuestCartAction(productIds);
      setCart(result.cart);
    } catch {
      setError("Не вдалося завантажити кошик. Спробуйте оновити сторінку.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
    window.addEventListener(CART_CHANGED_EVENT, load);
    return () => window.removeEventListener(CART_CHANGED_EVENT, load);
  }, [load]);

  // ... render: loading state, error state, empty state, items list
}
```

**CartDrawerContent adaptation notes:**
- Add `hasSession: boolean` prop; branch between `getCartAction()` (auth) and `resolveGuestCartAction` (guest)
- Gate load on `cartOpen` from `useDrawers()`: `useEffect(() => { if (!cartOpen) return; void load(); ... }, [cartOpen, hasSession])`
- For guest branch: also re-attach `CART_CHANGED_EVENT` listener inside the `cartOpen` gate
- The `load` function must be a `useCallback` (same as GuestCartView) to be stable for the event listener
- Reuse `CartEmpty`, `GuestCartLineItem`, `CartSummary`, `GuestClearCartButton` as-is
- Auth branch reuses `CartLineItem` (existing server component wrapper) — `router.refresh()` inside CartLineItem is still correct; additionally call `load()` to sync drawer state after mutations by passing `onRemoved={load}` if CartLineItem supports it, or rely on `router.refresh()` triggering a re-render
- Strip page-level layout wrappers (`mt-8`, `md:grid-cols-[1fr_320px]`) — use a simpler vertical flex layout inside the drawer

---

### `src/components/wishlist/wishlist-drawer.tsx` (component, request-response)

**Analog:** `src/components/catalog/catalog-filters-sheet.tsx`

Same Sheet API patterns as `cart-drawer.tsx` above. Differences:
- Open/close via `useDrawers().wishlistOpen` / `closeWishlist()`
- Title: `"Обране"`, close button aria-label: `"Закрити обране"`
- No SheetFooter needed (wishlist has no checkout action)

---

### `src/components/wishlist/wishlist-drawer-content.tsx` (component, CRUD + event-driven)

**Analog:** `src/components/wishlist/guest-wishlist-view.tsx`

**Full file of analog** (guest-wishlist-view.tsx, lines 1-81):
```tsx
"use client";

import { useEffect, useState } from "react";
import { resolveGuestWishlistProductsAction } from "@/server/actions/wishlist.actions";
import { WishlistPageContent } from "@/components/wishlist/wishlist-page-content";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { getGuestWishlistProductIds } from "@/lib/wishlist/guest-storage";
import { WISHLIST_CHANGED_EVENT } from "@/lib/wishlist/wishlist-events";
import type { WishlistLineDto } from "@/types/wishlist";

export function GuestWishlistView() {
  const [lines, setLines] = useState<WishlistLineDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(null);

      const productIds = getGuestWishlistProductIds();
      if (productIds.length === 0) {
        if (!cancelled) {
          setLines([]);
          setLoading(false);
        }
        return;
      }

      try {
        const result = await resolveGuestWishlistProductsAction(productIds);
        if (!cancelled) {
          setLines(result.lines);
          setLoading(false);
        }
      } catch {
        if (!cancelled) {
          setError("Не вдалося завантажити обране. Спробуйте оновити сторінку.");
          setLoading(false);
        }
      }
    }

    void load();

    const onChanged = () => { void load(); };
    window.addEventListener(WISHLIST_CHANGED_EVENT, onChanged);

    return () => {
      cancelled = true;
      window.removeEventListener(WISHLIST_CHANGED_EVENT, onChanged);
    };
  }, []);

  // ... render: loading, error, WishlistPageContent
}
```

**WishlistDrawerContent adaptation notes:**
- Add `hasSession: boolean` prop; branch between `listWishlistForUser` via a new thin server action (auth) or `resolveGuestWishlistProductsAction` (guest)
- Gate load on `wishlistOpen` from `useDrawers()`: same pattern as CartDrawerContent
- Note `cancelled` pattern from GuestWishlistView (prevents state updates on unmounted component) — carry this pattern into the drawer version
- Do NOT reuse `WishlistPageContent` directly — it has full-page layout wrappers (`mx-auto max-w-6xl px-4 py-12`). Instead reuse `WishlistGrid` directly
- Reuse `ClearWishlistButton` as-is

---

### `src/server/actions/cart.actions.ts` — Add `getCartAction()` (server action, CRUD)

**Analog:** same file, existing actions

**Auth pattern in cart.actions.ts** (lines 1-16 and lines 47-53):
```ts
"use server";

import { revalidatePath } from "next/cache";
import { requireBuyer } from "@/lib/permissions";
import {
  addToCart,
  clearCart,
  mergePendingItems,
  removeFromCart,
} from "@/server/services/cart.service";
import { resolveGuestCartProducts } from "@/server/services/cart.service";

// ...

export async function removeFromCartAction(productId: string) {
  const session = await requireBuyer();
  const parsed = addToCartSchema.parse({ productId, quantity: 1 });
  await removeFromCart(session.user.id, parsed.productId);
  revalidateCartPaths();
  return { ok: true as const };
}
```

**New action to add** (place after existing actions, following same pattern):
```ts
import { getCartForUser } from "@/server/services/cart.service";
import type { CartViewDto } from "@/types/cart";

export async function getCartAction(): Promise<CartViewDto> {
  const session = await requireBuyer();
  return getCartForUser(session.user.id);
}
```

**Notes:**
- `getCartForUser` signature: `getCartForUser(userId: string): Promise<CartViewDto>` (verified at cart.service.ts line 62)
- No `revalidatePath` needed — this is a read action
- No Zod schema needed — no input to validate; `requireBuyer()` handles auth guard
- Add the import for `getCartForUser` alongside the existing import block at the top of the file (or extend the existing destructured import from `cart.service`)

---

### `src/components/layout/storefront-fabs.tsx` — Cart Link → button (component, event-driven)

**Full current file** (storefront-fabs.tsx, lines 1-136): already read above.

**Cart FAB section to replace** (lines 69-87):
```tsx
{/* FAB-01: Cart FAB — always visible, no early return when count === 0 */}
<Link
  href="/koszyk"
  aria-label={cartCount > 0 ? `Кошик, ${cartCount} товарів` : "Кошик"}
  className={cn(
    "flex size-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring relative",
  )}
>
  <ShoppingCart className="size-6" aria-hidden />
  {cartCount > 0 && (
    <Badge ... aria-hidden>
      {badgeLabel}
    </Badge>
  )}
</Link>
```

**After conversion — follow the Chat FAB button pattern** (lines 91-107):
```tsx
{/* FAB-04: Chat FAB — hidden when chat panel is open */}
{!chatIsOpen && (
  <button
    type="button"
    onClick={() => openPanel()}
    className={cn(
      "flex size-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg",
      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring relative",
    )}
    aria-label="Відкрити чат з магазином"
  >
    <MessageSquare className="size-6" aria-hidden />
    ...
  </button>
)}
```

**Modification notes:**
- Replace `<Link href="/koszyk" ...>` with `<button type="button" onClick={openCart} ...>`
- Add `const { openCart } = useDrawers();` to the component body (alongside `const { isOpen: chatIsOpen, openPanel, ... } = useChat();`)
- Remove `import Link from "next/link"` only if no other Link remains in the file (check: no other Links — remove it)
- Keep identical `className`, badge, and aria-label logic
- Add import: `import { useDrawers } from "@/lib/drawers/drawer-context";`

**Test file** (`storefront-fabs.test.tsx`) — tests that must be updated:
- `FAB-01-a`: currently queries `getByRole("link", { name: "Кошик" })` — update to `getByRole("button", { name: "Кошик" })`
- `FAB-01-b`: asserts `href="/koszyk"` — replace with assertion that clicking the button calls `openCart`
- Add `vi.mock("@/lib/drawers/drawer-context", ...)` and `vi.mock("@/components/chat/chat-provider", ...)` mock pattern (copy existing `useChat` mock pattern at lines 40-48)

---

### `src/components/cart/cart-nav-link.tsx` — RSC wrapper + client CartNavButton (component, request-response)

**Current file** (cart-nav-link.tsx, lines 1-27): async RSC that calls `getCartItemCount` and renders `<Link href="/koszyk">`.

**Analog for RSC wrapper pattern:** `src/components/chat/chat-provider-gate.tsx`

**chat-provider-gate.tsx RSC wrapper pattern** (lines 1-50):
```tsx
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
// ... imports
import { ChatProvider } from "@/components/chat/chat-provider";

export async function ChatProviderGate({
  children,
  phones,
  initialCartCount,
}: {
  children: React.ReactNode;
  phones: PublicStorePhone[];
  initialCartCount: number;
}) {
  const session = await auth.api.getSession({ headers: await headers() });
  const hasSession = Boolean(session?.user);
  // ... fetch data ...

  return (
    <ChatProvider
      hasSession={hasSession}
      initialCartCount={initialCartCount}
      ...
    >
      {children}
    </ChatProvider>
  );
}
```

**Conversion plan:**
1. `cart-nav-link.tsx` (RSC, keeps `async`): keep `getCartItemCount` fetch, render new `CartNavButton` client component passing `initialCount={count}`
2. New `cart-nav-button.tsx` (client): receives `initialCount: number`, calls `useDrawers().openCart()` on click, same badge/icon/className as current `<Link>` version

**New CartNavButton client component pattern** (model after `guest-cart-nav-link.tsx`, lines 1-34):
```tsx
"use client";

import { useEffect, useState } from "react";
import { ShoppingCart } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { CART_CHANGED_EVENT } from "@/lib/cart/cart-events";
import { getPendingItemCount } from "@/lib/cart/pending-storage";

export function GuestCartNavLink() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const sync = () => setCount(getPendingItemCount());
    sync();
    window.addEventListener(CART_CHANGED_EVENT, sync);
    return () => window.removeEventListener(CART_CHANGED_EVENT, sync);
  }, []);

  return (
    <Link
      href="/koszyk"
      className="relative inline-flex min-h-11 min-w-11 items-center justify-center rounded-md px-3 text-sm font-medium hover:bg-muted"
      aria-label={`Кошик${count > 0 ? `, ${count} товарів` : ""}`}
    >
      ...
    </Link>
  );
}
```

**CartNavButton** mirrors this but:
- Accepts `initialCount: number` prop; `useState(initialCount)` for auth users (no event listener needed since auth count is SSR-accurate; `router.refresh()` after mutations handles it)
- Renders `<button type="button" onClick={openCart}>` instead of `<Link>`
- Same `className`, badge, aria-label pattern

---

### `src/components/cart/guest-cart-nav-link.tsx` — Link → button (component, event-driven)

**Current file** (guest-cart-nav-link.tsx, lines 1-34): `"use client"`, event listener on `CART_CHANGED_EVENT`, renders `<Link href="/koszyk">`.

**Modification** (minimal):
- Add `import { useDrawers } from "@/lib/drawers/drawer-context";`
- Add `const { openCart } = useDrawers();` in component body
- Replace `<Link href="/koszyk" className="..." aria-label={...}>` with `<button type="button" className="..." aria-label={...} onClick={openCart}>`
- Remove `import Link from "next/link"`
- Keep all badge logic, useEffect, useState unchanged

---

### `src/components/wishlist/wishlist-nav-link.tsx` — Link → button (component, event-driven)

**Current file** (wishlist-nav-link.tsx, lines 1-72): `"use client"`, event listeners for `WISHLIST_CHANGED_EVENT` and `storage`, renders `<Link href="/obrane">`.

**Modification** (minimal):
- Add `import { useDrawers } from "@/lib/drawers/drawer-context";`
- Add `const { openWishlist } = useDrawers();` in component body
- Replace `<Link href="/obrane" className="..." aria-label={ariaLabel} aria-current={...}>` with `<button type="button" className="..." aria-label={ariaLabel} onClick={openWishlist}>`
- Remove `import Link from "next/link"` and `import { usePathname } from "next/navigation"` (no longer needed once `aria-current` is removed — or keep `usePathname` if `aria-current` should remain)
- Keep all badge logic, useEffect, useState unchanged

---

### `src/components/cart/pdp-cart-fab.tsx` — Link → button (component, event-driven)

**Current file** (pdp-cart-fab.tsx, lines 1-54): `"use client"`, event listener on `CART_CHANGED_EVENT`, renders `<Link href="/koszyk">` with FAB styling.

**Modification** (minimal):
- Add `import { useDrawers } from "@/lib/drawers/drawer-context";`
- Add `const { openCart } = useDrawers();` in component body
- Replace `<Link href="/koszyk" className={cn(...)} aria-label="Перейти до кошика">` with `<button type="button" className={cn(...)} aria-label="Відкрити кошик" onClick={openCart}>`
- Remove `import Link from "next/link"`
- Keep `if (count < 1) return null;` guard and all badge logic unchanged

**Note on DrawerProvider scope:** `PdpCartFab` is rendered inside the page `{children}` (inside `ChatProviderGate → ChatProvider → {children}`). DrawerProvider must be an ancestor of the entire `ChatProvider` render tree to be accessible from both `StorefrontFabs` and `PdpCartFab`. This means DrawerProvider must wrap at the `ChatProvider` level or higher — see chat-provider.tsx modification notes below.

---

### `src/components/chat/chat-provider.tsx` — Wrap in DrawerProvider (provider, event-driven)

**Current render return** (lines 539-549):
```tsx
return (
  <ChatContext.Provider value={value}>
    {children}
    <StorefrontFabs
      phones={phones}
      initialCartCount={initialCartCount}
      hasSession={hasSession}
    />
    <ChatPanel />
  </ChatContext.Provider>
);
```

**Modification:**
- Import `DrawerProvider` from `@/lib/drawers/drawer-context`
- Import `CartDrawer` from `@/components/cart/cart-drawer`
- Import `WishlistDrawer` from `@/components/wishlist/wishlist-drawer`
- Wrap the `ChatContext.Provider` with `DrawerProvider`, and render `<CartDrawer hasSession={hasSession} />` and `<WishlistDrawer hasSession={hasSession} />` as siblings alongside `StorefrontFabs` and `ChatPanel`:

```tsx
return (
  <DrawerProvider>
    <ChatContext.Provider value={value}>
      {children}
      <StorefrontFabs
        phones={phones}
        initialCartCount={initialCartCount}
        hasSession={hasSession}
      />
      <ChatPanel />
      <CartDrawer hasSession={hasSession} />
      <WishlistDrawer hasSession={hasSession} />
    </ChatContext.Provider>
  </DrawerProvider>
);
```

**Why this placement:** `DrawerProvider` wraps `ChatContext.Provider` so that `StorefrontFabs` (a child of `ChatContext.Provider`) can call `useDrawers()`. The page `{children}` also receives `DrawerProvider` as an ancestor, making `PdpCartFab` (inside `{children}`) able to call `useDrawers()` as well.

**Notes:**
- `ChatProviderProps` does NOT need a new `hasSession` prop for drawers — it already has `hasSession: boolean` (line 80-88 of chat-provider.tsx)
- No changes needed to `ChatProviderGate` for this to work — it already passes `hasSession` to `ChatProvider`

---

## Shared Patterns

### Context null-guard hook pattern
**Source:** `src/components/chat/chat-provider.tsx` lines 552-558
**Apply to:** `src/lib/drawers/drawer-context.tsx`
```tsx
export function useDrawers() {
  const context = useContext(DrawerContext);
  if (!context) {
    throw new Error("useDrawers must be used within DrawerProvider");
  }
  return context;
}
```

### Sheet controlled open/close pattern
**Source:** `src/components/catalog/catalog-filters-sheet.tsx` lines 25-46
**Apply to:** `cart-drawer.tsx`, `wishlist-drawer.tsx`
```tsx
<Sheet open={open} onOpenChange={setOpen}>
  <SheetContent side="left" className="flex w-full flex-col sm:max-w-sm">
    <SheetHeader>
      <SheetTitle>...</SheetTitle>
    </SheetHeader>
    <div className="flex-1 overflow-y-auto px-4 pb-4">
      {/* content */}
    </div>
    <SheetFooter>
      <SheetClose render={<Button className="w-full">...</Button>} />
    </SheetFooter>
  </SheetContent>
</Sheet>
```

Note: Drawers use context state (`useDrawers()`) instead of local `useState`.

### Event-driven data reload pattern
**Source:** `src/components/cart/guest-cart-view.tsx` lines 40-44
**Apply to:** `cart-drawer-content.tsx` (guest branch), `wishlist-drawer-content.tsx` (guest branch)
```tsx
useEffect(() => {
  void load();
  window.addEventListener(CART_CHANGED_EVENT, load);
  return () => window.removeEventListener(CART_CHANGED_EVENT, load);
}, [load]);
```

### Auth server action pattern
**Source:** `src/server/actions/cart.actions.ts` lines 47-53
**Apply to:** new `getCartAction()` in same file
```ts
export async function removeFromCartAction(productId: string) {
  const session = await requireBuyer();
  const parsed = addToCartSchema.parse({ productId, quantity: 1 });
  await removeFromCart(session.user.id, parsed.productId);
  revalidateCartPaths();
  return { ok: true as const };
}
```

### Badge + icon button pattern (replacing Link)
**Source:** `src/components/layout/storefront-fabs.tsx` lines 91-107 (Chat FAB button)
**Apply to:** `storefront-fabs.tsx` (cart FAB), `guest-cart-nav-link.tsx`, `wishlist-nav-link.tsx`, `pdp-cart-fab.tsx`
```tsx
<button
  type="button"
  onClick={() => openPanel()}
  className={cn(
    "flex size-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring relative",
  )}
  aria-label="..."
>
  <Icon className="size-6" aria-hidden />
  {count > 0 && <Badge className="absolute -right-0.5 -top-0.5 ..." aria-hidden>{label}</Badge>}
</button>
```

### Test file structure (jsdom + vi.mock)
**Source:** `src/components/layout/storefront-fabs.test.tsx` lines 1-52
**Apply to:** all new `*.test.tsx` files in this phase
```tsx
/** @vitest-environment jsdom */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";

vi.mock("next/link", () => ({ default: ({ href, children, ... }) => React.createElement("a", ...) }));
vi.mock("next/navigation", () => ({ useRouter: () => ({ push: vi.fn() }), usePathname: () => "/" }));
vi.mock("@/lib/drawers/drawer-context", () => ({
  useDrawers: vi.fn().mockReturnValue({
    cartOpen: false,
    wishlistOpen: false,
    openCart: vi.fn(),
    closeCart: vi.fn(),
    openWishlist: vi.fn(),
    closeWishlist: vi.fn(),
  }),
}));

// ... tests with beforeEach(vi.clearAllMocks) and afterEach(cleanup)
```

---

## No Analog Found

All 13 files have analogs in the codebase.

| File | Note |
|---|---|
| `src/lib/drawers/drawer-context.tsx` | No prior DrawerProvider exists; analog is `ChatProvider` (same pattern, simpler) |

---

## Metadata

**Analog search scope:** `src/components/`, `src/lib/`, `src/server/actions/`, `src/app/(storefront)/`
**Files scanned:** 13 analog files read directly
**Pattern extraction date:** 2026-05-27
