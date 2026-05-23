# Phase 42: Floating Action Buttons - Research

**Researched:** 2026-05-23
**Domain:** React/Next.js client component — persistent FABs in storefront layout, dialog-based callback
**Confidence:** HIGH

---

## Summary

Phase 42 adds two floating action buttons (FABs) to the storefront layout: a persistent cart FAB and a callback FAB, both in the bottom-left zone. The cart FAB must always be visible (even when cart is empty), linking to `/koszyk`. The callback FAB opens a dialog showing the store phone number and a form for the user to enter their own phone number. Both FABs must appear on storefront pages only, not admin pages.

The codebase already contains all required primitives: `PdpCartFab` (right-side cart FAB on PDP, count-driven) provides the exact positioning and safe-area pattern to copy. The existing `CallbackRequestForm` component has the phone form logic already built (server action, Zod validation, success toast). The `Dialog` component wraps `@base-ui/react/dialog` and is already used throughout the project. `getPublicStoreContacts()` from `store-settings.service` provides phone numbers. The storefront layout (`app/(storefront)/layout.tsx`) is the correct injection point — components placed there are absent from `app/(admin)/` by route group isolation.

No new npm packages are required. No new server actions or services needed. The implementation is two new client component files added to the storefront layout.

**Primary recommendation:** Create `src/components/layout/storefront-fabs.tsx` (a single component that renders both FABs in a `fixed` column stack at bottom-left) and add it to `src/app/(storefront)/layout.tsx`. The cart FAB is a `<Link>` with live guest count sync via `CART_CHANGED_EVENT`. The callback FAB is a `<button>` that opens a `Dialog` containing the store phone and `<CallbackRequestForm idPrefix="fab" compact />`.

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| FAB-01 | User always sees a cart button in the bottom-left floating zone (visible even when cart is empty) | Cart FAB must not gate on `count > 0` (unlike `PdpCartFab` which returns null when count < 1). Always rendered. Syncs count from `CART_CHANGED_EVENT` + `getPendingItemCount()` for guests, or initial server count for sessions. Badge shown only when count > 0. |
| FAB-02 | User can open a callback dialog from a floating button — sees store phone number and a form to enter their own phone | `Dialog` (from `@/components/ui/dialog`) wrapping the store phone display and `<CallbackRequestForm>`. Phone data from `getPublicStoreContacts()` fetched in a parent RSC wrapper, passed as prop to the client FABs component. |

</phase_requirements>

---

## Architectural Responsibility Map

| Capability | Primary Tier | Secondary Tier | Rationale |
|------------|-------------|----------------|-----------|
| FAB visibility scoping (storefront only) | Frontend Server (storefront layout RSC) | — | FABs injected into `(storefront)/layout.tsx`; route group isolation means they never appear under `(admin)/` |
| Cart count for guests | Browser / Client | — | Reads `localStorage` via `getPendingItemCount()`, listens to `CART_CHANGED_EVENT` |
| Cart count for sessions | Frontend Server (RSC) | Browser / Client | Initial count fetched server-side and passed as prop; client component hydrates and listens for guest events only when `hasSession=false` |
| Callback dialog state (open/close) | Browser / Client | — | Local `useState` in a `"use client"` component |
| Store phone display in dialog | Frontend Server (RSC) | Browser / Client | `getPublicStoreContacts()` called in RSC wrapper; digits and formatted display passed as props to the client FABs component |
| Callback form submission | API / Backend | Browser / Client | Existing `submitCallbackRequestAction` server action — no new API code |

---

## Standard Stack

### Core (all already installed — no additions needed)

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| React | 19.2.4 | Component model, useState, useEffect | Project baseline |
| Next.js | 16.2.6 | App router, server components, Link | Project baseline |
| TypeScript | 5.x | Type safety | Project baseline (strict mode) |
| Tailwind CSS | 4.x | Utility styling, `fixed`, `bottom-*`, `z-[*]` | All layout components use Tailwind |
| lucide-react | 1.16.0 | `ShoppingCart`, `Phone` or `PhoneCall` icon for FABs | Already used in `cart-nav-link.tsx`, `pdp-cart-fab.tsx`, `chat-fab.tsx` |
| @base-ui/react | ^1.4.1 | `Dialog` primitive (via `@/components/ui/dialog`) | Already used throughout the project |

**Installation:** None required — zero new packages.

---

## Package Legitimacy Audit

No new packages are installed in this phase.

---

## Architecture Patterns

### System Architecture Diagram

```
Storefront Layout RSC (layout.tsx)
  |
  |-- [auth session check] --> hasSession, cartCount (from getCartItemCount)
  |-- [getPublicStoreContacts()] --> phones[]
  |
  +--> <StorefrontFabs>  (client component, bottom-left zone)
         |
         +-- CartFab (always visible)
         |     - Renders as <Link href="/koszyk">
         |     - Badge shows count when count > 0
         |     - Guest: syncs from localStorage via CART_CHANGED_EVENT
         |     - Session: initialCount prop (no localStorage sync)
         |
         +-- CallbackFab (always visible)
               - Renders as <button> opening <Dialog>
               - Dialog content:
                   - Store phone display (from phones[] prop)
                   - <CallbackRequestForm idPrefix="fab" compact />
```

### Recommended Project Structure

```
src/
├── components/
│   └── layout/
│       ├── storefront-fabs.tsx      # NEW — both FABs in a single client component
│       ├── store-header.tsx         # UNCHANGED
│       ├── store-footer.tsx         # UNCHANGED
│       └── callback-request-form.tsx # UNCHANGED — reused as-is
├── app/
│   └── (storefront)/
│       └── layout.tsx               # MODIFY — add <StorefrontFabs> at end of JSX
```

**Why a single component file for both FABs:** The dialog state and the cart count state must both live client-side. Wrapping them in one file avoids two separate server-side data-fetching boundaries and keeps positioning logic co-located. The storefront layout RSC fetches data (cart count + phone list) once and passes all as props.

### Pattern 1: FAB Positioning — copy from PdpCartFab and ChatFab

The codebase already has two FABs:

| FAB | Position | z-index | Side | Always shown? |
|-----|----------|---------|------|---------------|
| `ChatFab` | `fixed bottom-6 right-6` | `z-[60]` | right | Only when chat closed |
| `PdpCartFab` | `fixed bottom-[5.75rem] right-6` | `z-[59]` | right | Only when count > 0 |

The new FABs go on the **left** side (`left-6`) to match the "bottom-left zone" requirement and avoid collision with right-side FABs.

**z-index for new FABs:** Use `z-[59]` — same as `PdpCartFab`, below the `Dialog` overlay which renders at `z-50` (project convention from `dialog.tsx`). The dialog portal renders above everything, so FAB z-index does not need to exceed `z-50` for dialog stacking.

**Stack layout for two left FABs:** Use a `fixed` wrapper `div` with `flex flex-col gap-3` to keep both FABs visually grouped:

```tsx
// Source: derived from PdpCartFab + ChatFab positioning in codebase
<div className="fixed bottom-6 left-6 z-[59] flex flex-col items-center gap-3">
  <CallbackFab phones={phones} />
  <CartFab initialCount={initialCount} hasSession={hasSession} />
</div>
```

`CartFab` at the bottom, `CallbackFab` stacked above it — cart access is the primary action.

**Safe-area pattern:** [VERIFIED in codebase — `pdp-cart-fab.tsx` line 41, `chat-fab.tsx` line 18]

```tsx
className={cn(
  "fixed ... flex size-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg",
  "pb-[max(0px,env(safe-area-inset-bottom))] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
)}
```

Apply `pb-[max(0px,env(safe-area-inset-bottom))]` to each individual FAB button or the wrapper div — consistent with the existing FAB convention.

### Pattern 2: Cart FAB — always visible, count optional

**Key difference from `PdpCartFab`:** `PdpCartFab` returns `null` when `count < 1`. The new cart FAB MUST always render (FAB-01: "visible even when cart is empty"). The badge is shown conditionally, but the FAB itself is not.

```tsx
// Source: derived from PdpCartFab (src/components/cart/pdp-cart-fab.tsx)
"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ShoppingCart } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { CART_CHANGED_EVENT } from "@/lib/cart/cart-events";
import { getPendingItemCount } from "@/lib/cart/pending-storage";
import { cn } from "@/lib/utils";

// Always renders — does NOT return null when count === 0
function CartFab({ initialCount, hasSession }: { initialCount: number; hasSession: boolean }) {
  const [count, setCount] = useState(initialCount);

  useEffect(() => { setCount(initialCount); }, [initialCount]);

  useEffect(() => {
    if (hasSession) return;
    const sync = () => setCount(getPendingItemCount());
    sync();
    window.addEventListener(CART_CHANGED_EVENT, sync);
    return () => window.removeEventListener(CART_CHANGED_EVENT, sync);
  }, [hasSession]);

  const badgeLabel = count > 9 ? "9+" : String(count);

  return (
    <Link
      href="/koszyk"
      className={cn(
        "flex size-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring relative",
      )}
      aria-label={count > 0 ? `Кошик, ${count} товарів` : "Кошик"}
    >
      <ShoppingCart className="size-6" aria-hidden />
      {count > 0 ? (
        <Badge
          className="absolute -right-0.5 -top-0.5 min-w-5 justify-center px-1 text-[10px]"
          aria-hidden
        >
          {badgeLabel}
        </Badge>
      ) : null}
    </Link>
  );
}
```

### Pattern 3: Callback FAB — dialog trigger

The callback FAB is a `<button>` (not a link). It opens the `Dialog` from `@/components/ui/dialog`. The dialog shows:
1. The store phone number (passed as a prop from the RSC that called `getPublicStoreContacts()`)
2. `<CallbackRequestForm idPrefix="fab" compact />` — existing component, no changes needed

```tsx
// Source: dialog.tsx (project component) + callback-request-form.tsx
"use client";

import { useState } from "react";
import { Phone } from "lucide-react";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { CallbackRequestForm } from "@/components/layout/callback-request-form";
import { formatUaPhoneDisplay, uaPhoneTelHref } from "@/lib/phone/format-ua";
import type { PublicStorePhone } from "@/server/services/store-settings.service";
import { cn } from "@/lib/utils";

function CallbackFab({ phones }: { phones: PublicStorePhone[] }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={cn(
          "flex size-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        )}
        aria-label="Замовити дзвінок"
      >
        <Phone className="size-6" aria-hidden />
      </button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Зв'яжіться з нами</DialogTitle>
          </DialogHeader>
          {phones.length > 0 ? (
            <ul className="space-y-1 text-sm">
              {phones.map((phone) => (
                <li key={phone.id}>
                  <a
                    href={uaPhoneTelHref(phone.digits)}
                    className="font-medium hover:underline"
                  >
                    {formatUaPhoneDisplay(phone.digits)}
                  </a>
                  {phone.label ? (
                    <span className="ml-2 text-muted-foreground">{phone.label}</span>
                  ) : null}
                </li>
              ))}
            </ul>
          ) : null}
          <CallbackRequestForm idPrefix="fab" compact />
        </DialogContent>
      </Dialog>
    </>
  );
}
```

### Pattern 4: Data fetching in storefront layout RSC

The storefront `layout.tsx` is an async server component. It already calls `auth.api.getSession()` and several service functions. Adding `getPublicStoreContacts()` and `getCartItemCount()` follows the same pattern:

```tsx
// Source: src/app/(storefront)/layout.tsx — existing structure
import { getPublicStoreContacts } from "@/server/services/store-settings.service";
import { getCartItemCount } from "@/server/services/cart.service";
import { StorefrontFabs } from "@/components/layout/storefront-fabs";

export default async function StorefrontLayout({ children }) {
  const session = await auth.api.getSession({ headers: await headers() });
  const contacts = await getPublicStoreContacts();
  const cartCount = session?.user
    ? await getCartItemCount(session.user.id)
    : 0;

  return (
    <>
      <StoreHeader />
      <main id="main-content" className="flex-1">
        ...{children}...
      </main>
      <StoreFooter />
      <Toaster richColors position="top-center" closeButton />
      <StorefrontFabs
        phones={contacts.phones}
        initialCartCount={cartCount}
        hasSession={Boolean(session?.user)}
      />
    </>
  );
}
```

**Note on `getPublicStoreContacts()` call cost:** `StoreFooter` also calls `getPublicStoreContacts()`. React's server-side `cache()` or Next.js fetch deduplication does NOT automatically deduplicate Prisma queries. This means two DB round-trips for `StorePhone`. Since the footer already exists and this is a small query, accept the duplication for now — do not refactor the footer. [ASSUMED — Prisma call deduplication not verified in this project's config; treat as two separate queries.]

### Pattern 5: Dialog usage — @base-ui/react dialog

The project's `Dialog` component wraps `@base-ui/react/dialog`. Usage in codebase:

```tsx
// Source: src/components/ui/dialog.tsx [VERIFIED in codebase]
<Dialog open={open} onOpenChange={setOpen}>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>...</DialogTitle>
    </DialogHeader>
    {/* content */}
  </DialogContent>
</Dialog>
```

`DialogContent` includes a built-in close button (`showCloseButton={true}` default) and a portal/overlay. No `DialogTrigger` needed when controlling open state externally via `open` + `onOpenChange`.

**Important:** `@base-ui/react` uses `data-open` / `data-closed` data attributes for animation (not `data-state`). The dialog overlay has `data-open:animate-in data-open:fade-in-0 data-closed:animate-out data-closed:fade-out-0`. This is already handled inside the `DialogContent` wrapper component — no manual animation classes needed in consuming code.

### Anti-Patterns to Avoid

- **Hiding cart FAB when cart is empty:** `PdpCartFab` does this (`if (count < 1) return null`). FAB-01 explicitly says the cart FAB must always be visible. Do NOT copy the early return.
- **Placing FABs in right-side zone:** The right zone (`right-6`) is occupied by `ChatFab` (`z-[60]`) and `PdpCartFab` (`z-[59]`). New FABs belong in `left-6`.
- **Using `DialogTrigger` when controlling open externally:** If you pass `open` + `onOpenChange` to `<Dialog>`, do not also use `<DialogTrigger>` — it creates conflicting open state. Control open with local `useState` and a plain `<button onClick>`.
- **Fetching phone data inside a client component:** Client components cannot call Prisma. Fetch in the layout RSC and pass as props.
- **Inline `getCartItemCount` in a layout that doesn't yet import it:** `getCartItemCount` requires `userId: string` — guard with `session?.user?.id` before calling.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Modal dialog | Custom overlay + focus trap | `Dialog` from `@/components/ui/dialog` | Already built on `@base-ui/react/dialog` with portal, backdrop, animations, focus trap, keyboard dismiss (Esc) |
| Phone form submission | New server action or fetch | `submitCallbackRequestAction` + `CallbackRequestForm` | Already implemented with Zod validation, rate limiting, toast feedback |
| Phone number formatting | String formatting | `formatUaPhoneDisplay()` + `uaPhoneTelHref()` from `@/lib/phone/format-ua` | Already handles UA 10-digit and +380 formats |
| Guest cart count sync | localStorage polling | `getPendingItemCount()` + `CART_CHANGED_EVENT` | Already implemented; event-driven, no polling |
| Session cart count | New service | `getCartItemCount(userId)` from `@/server/services/cart.service` | Already exists |
| Store phone data | New API | `getPublicStoreContacts()` from `@/server/services/store-settings.service` | Already exists, used in footer |

---

## Common Pitfalls

### Pitfall 1: Cart FAB returns null when empty — breaks FAB-01

**What goes wrong:** Developer copies `PdpCartFab` and keeps the `if (count < 1) return null` guard. Cart FAB disappears when cart is empty, violating FAB-01.
**Why it happens:** `PdpCartFab` was intentionally designed to be invisible on empty carts (it's a contextual "you have items" reminder on PDP). The global cart FAB serves a different purpose — persistent access.
**How to avoid:** Remove the `if (count < 1) return null` line. Show the FAB always; show the badge conditionally.
**Warning signs:** FAB disappears after clearing cart in dev testing.

### Pitfall 2: z-index conflict with chat FAB or dialog

**What goes wrong:** Setting new FABs to `z-[60]` or higher causes them to render above the `Dialog` backdrop when the callback dialog is open.
**Why it happens:** `ChatFab` uses `z-[60]`, `Dialog` overlay uses `z-50`. FABs at `z-[59]` sit below the dialog overlay.
**How to avoid:** Keep new FABs at `z-[59]` (same as `PdpCartFab`). The dialog portal renders independently and always above.
**Warning signs:** FABs visible through the dialog backdrop.

### Pitfall 3: Placing FABs in `(storefront)/layout.tsx` but also on admin pages

**What goes wrong:** A developer renders `StorefrontFabs` in the root `app/layout.tsx` instead of `app/(storefront)/layout.tsx`.
**Why it happens:** Root layout is simpler to find; route group scoping is easily overlooked.
**How to avoid:** The injection point is `src/app/(storefront)/layout.tsx` only. The `(admin)` route group has its own layout (`app/(admin)/admin/layout.tsx` or similar) that does NOT inherit from storefront layout.
**Warning signs:** FABs appear on `/admin/*` pages.

### Pitfall 4: `getPublicStoreContacts()` called in a client component

**What goes wrong:** `StorefrontFabs` is `"use client"` and tries to call the Prisma-backed service directly.
**Why it happens:** Developer forgets the data boundary.
**How to avoid:** Call `getPublicStoreContacts()` in the `StorefrontLayout` RSC. Pass `phones` as a prop to `<StorefrontFabs phones={contacts.phones} ...>`.
**Warning signs:** Build error: "Importing server-only module from client component."

### Pitfall 5: `idPrefix` collision in `CallbackRequestForm`

**What goes wrong:** Using the default `idPrefix="footer"` in the FAB dialog causes duplicate HTML element IDs when the footer is also rendered on the same page (the footer also renders `CallbackRequestForm` with default `idPrefix`).
**Why it happens:** `CallbackRequestForm` generates `id={idPrefix}-callback-phone`. Two forms with the same prefix = two elements with the same ID.
**How to avoid:** Pass `idPrefix="fab"` to `<CallbackRequestForm>` in the dialog. Footer and drawer already use their own prefixes (`"footer"`, `"drawer"`).
**Warning signs:** HTML validation errors; screen readers announce wrong label.

---

## Code Examples

### Complete `StorefrontFabs` component structure

```tsx
// Source: derived from pdp-cart-fab.tsx, chat-fab.tsx, dialog.tsx, callback-request-form.tsx
"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Phone, ShoppingCart } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { CallbackRequestForm } from "@/components/layout/callback-request-form";
import { CART_CHANGED_EVENT } from "@/lib/cart/cart-events";
import { getPendingItemCount } from "@/lib/cart/pending-storage";
import { formatUaPhoneDisplay, uaPhoneTelHref } from "@/lib/phone/format-ua";
import type { PublicStorePhone } from "@/server/services/store-settings.service";
import { cn } from "@/lib/utils";

type StorefrontFabsProps = {
  phones: PublicStorePhone[];
  initialCartCount: number;
  hasSession: boolean;
};

export function StorefrontFabs({ phones, initialCartCount, hasSession }: StorefrontFabsProps) {
  const [cartCount, setCartCount] = useState(initialCartCount);
  const [callbackOpen, setCallbackOpen] = useState(false);

  useEffect(() => { setCartCount(initialCartCount); }, [initialCartCount]);

  useEffect(() => {
    if (hasSession) return;
    const sync = () => setCartCount(getPendingItemCount());
    sync();
    window.addEventListener(CART_CHANGED_EVENT, sync);
    return () => window.removeEventListener(CART_CHANGED_EVENT, sync);
  }, [hasSession]);

  const fabClass = cn(
    "flex size-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
  );

  return (
    <>
      <div className="fixed bottom-6 left-6 z-[59] flex flex-col items-center gap-3 pb-[max(0px,env(safe-area-inset-bottom))]">
        {/* Callback FAB — stacked above cart */}
        <button
          type="button"
          onClick={() => setCallbackOpen(true)}
          className={fabClass}
          aria-label="Замовити дзвінок"
        >
          <Phone className="size-6" aria-hidden />
        </button>
        {/* Cart FAB — always visible (FAB-01) */}
        <Link
          href="/koszyk"
          className={cn(fabClass, "relative")}
          aria-label={cartCount > 0 ? `Кошик, ${cartCount} товарів` : "Кошик"}
        >
          <ShoppingCart className="size-6" aria-hidden />
          {cartCount > 0 ? (
            <Badge
              className="absolute -right-0.5 -top-0.5 min-w-5 justify-center px-1 text-[10px]"
              aria-hidden
            >
              {cartCount > 9 ? "9+" : String(cartCount)}
            </Badge>
          ) : null}
        </Link>
      </div>

      {/* Callback Dialog (FAB-02) */}
      <Dialog open={callbackOpen} onOpenChange={setCallbackOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Зв'яжіться з нами</DialogTitle>
          </DialogHeader>
          {phones.length > 0 ? (
            <ul className="space-y-1 text-sm">
              {phones.map((phone) => (
                <li key={phone.id}>
                  <a
                    href={uaPhoneTelHref(phone.digits)}
                    className="font-medium underline-offset-4 hover:underline"
                  >
                    {formatUaPhoneDisplay(phone.digits)}
                  </a>
                  {phone.label ? (
                    <span className="ml-2 text-muted-foreground">{phone.label}</span>
                  ) : null}
                </li>
              ))}
            </ul>
          ) : null}
          <CallbackRequestForm idPrefix="fab" compact />
        </DialogContent>
      </Dialog>
    </>
  );
}
```

### Storefront layout modification

```tsx
// Source: src/app/(storefront)/layout.tsx — existing + additions
import { StorefrontFabs } from "@/components/layout/storefront-fabs";
import { getPublicStoreContacts } from "@/server/services/store-settings.service";
import { getCartItemCount } from "@/server/services/cart.service";

export default async function StorefrontLayout({ children }) {
  const session = await auth.api.getSession({ headers: await headers() });
  const contacts = await getPublicStoreContacts();
  const cartCount = session?.user
    ? await getCartItemCount(session.user.id)
    : 0;
  // ... rest of existing data fetching unchanged ...

  return (
    <>
      <StoreHeader />
      <main id="main-content" className="flex-1">
        <NuqsAdapter>
          <Suspense fallback={null}>
            <ChatProviderGate>
              <CartPendingMergeGate />
              <WishlistPendingMergeGate />
              {children}
              <Analytics />
            </ChatProviderGate>
          </Suspense>
        </NuqsAdapter>
      </main>
      <StoreFooter />
      <Toaster richColors position="top-center" closeButton />
      <StorefrontFabs
        phones={contacts.phones}
        initialCartCount={cartCount}
        hasSession={Boolean(session?.user)}
      />
    </>
  );
}
```

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| `PdpCartFab` — right-side, hidden when empty | Global cart FAB — left-side, always visible | Phase 42 | PDP-specific cart reminder vs. persistent global access |
| No global callback entry point on storefront | Callback FAB with dialog on every storefront page | Phase 42 | Previously only footer and mobile drawer had callback form |

**Note:** `PdpCartFab` at `right-6` continues to exist unchanged. The new cart FAB at `left-6` coexists with it. On PDP pages, users will see both: left-side global FAB and right-side PDP-specific FAB. This is intentional — the PDP FAB provides richer context (count, quick access visible next to content) while the global left FAB is always accessible.

---

## Environment Availability

Step 2.6: SKIPPED — no external dependencies. All tools (Node.js, TypeScript, Vitest) confirmed available from Phase 41 (completed 2026-05-22).

---

## Validation Architecture

### Test Framework

| Property | Value |
|----------|-------|
| Framework | Vitest 4.1.6 + @testing-library/react 16.3.2 |
| Config file | `vitest.config.ts` (project root) |
| Quick run command | `npm test -- --reporter=verbose src/components/layout/storefront-fabs.test.tsx` |
| Full suite command | `npm test` |

### Phase Requirements to Test Map

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| FAB-01 | Cart FAB renders when cart is empty | unit | `npm test -- src/components/layout/storefront-fabs.test.tsx` | No — Wave 0 |
| FAB-01 | Cart FAB shows badge when count > 0 | unit | `npm test -- src/components/layout/storefront-fabs.test.tsx` | No — Wave 0 |
| FAB-01 | Cart FAB links to /koszyk | unit | `npm test -- src/components/layout/storefront-fabs.test.tsx` | No — Wave 0 |
| FAB-02 | Callback FAB opens dialog on click | unit | `npm test -- src/components/layout/storefront-fabs.test.tsx` | No — Wave 0 |
| FAB-02 | Dialog shows phone number when phones available | unit | `npm test -- src/components/layout/storefront-fabs.test.tsx` | No — Wave 0 |
| FAB-02 | Dialog contains callback form | unit | `npm test -- src/components/layout/storefront-fabs.test.tsx` | No — Wave 0 |

### Sampling Rate

- **Per task commit:** `npm test -- src/components/layout/storefront-fabs.test.tsx`
- **Per wave merge:** `npm test`
- **Phase gate:** Full suite green before `/gsd:verify-work`

### Wave 0 Gaps

- [ ] `src/components/layout/storefront-fabs.test.tsx` — covers FAB-01 and FAB-02
  - Requires mocks: `next/navigation` (useRouter), `@/server/actions/callback.actions` (submitCallbackRequestAction), `sonner` (toast), `@/lib/cart/cart-events` (CART_CHANGED_EVENT), `@/lib/cart/pending-storage` (getPendingItemCount)
  - Pattern: follow `callback-request-form.test.tsx` and `store-mobile-nav.test.tsx` exactly (`/** @vitest-environment jsdom */`, `vi.mock(...)`, `screen.getBy*`, `.toBeDefined()` assertions)

---

## Security Domain

### Applicable ASVS Categories

| ASVS Category | Applies | Standard Control |
|---------------|---------|-----------------|
| V2 Authentication | no | FABs are visible to all users regardless of auth state |
| V3 Session Management | no | No new session handling |
| V4 Access Control | no | Storefront-only scoping via route group layout, not auth gate |
| V5 Input Validation | yes | `CallbackRequestForm` uses existing `callbackRequestSchema` (Zod + `uaPhoneSchema`) |
| V6 Cryptography | no | No new crypto |

### Known Threat Patterns

| Pattern | STRIDE | Standard Mitigation |
|---------|--------|---------------------|
| Callback form spam / rate limiting | Denial of Service | Existing `CallbackRateLimitError` in `createCallbackRequest` service — already handles this |
| Phone number exfiltration via dialog | Information Disclosure | Store phone is already public (displayed in footer) — no new exposure |

---

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | Two `getPublicStoreContacts()` calls (layout + footer) result in two separate Prisma queries; no automatic deduplication | Code Examples — layout modification | Low: extra query is small; if caching exists, it's free. Either way, implementation is correct. |
| A2 | `Phone` icon from lucide-react 1.16.0 is the correct choice for the callback FAB | Standard Stack | Low: icon is cosmetic; `PhoneCall` is an equally valid alternative already in lucide-react |

**If this table is empty:** All claims in this research were verified or cited — no user confirmation needed.

---

## Open Questions (RESOLVED)

1. **Both cart FABs on PDP (left global + right PDP-specific)**
   - What we know: `PdpCartFab` is at `right-6 bottom-[5.75rem]` and is only rendered by `tovar/[slug]/page.tsx`. New cart FAB is at `left-6 bottom-6`.
   - What's unclear: Is showing two cart FABs on PDP acceptable UX?
   - RESOLVED: Accept it for v2.2. The PDP FAB is already shipping and the two buttons serve different visual purposes. No requirement in FAB-01/FAB-02 says to suppress `PdpCartFab`.

2. **Dialog title and phone display when no phones configured**
   - What we know: `getPublicStoreContacts()` returns `phones: []` when no phones are in the DB.
   - What's unclear: Should the callback FAB still appear if no phone is configured?
   - RESOLVED: Yes — show the FAB always. The dialog just shows only the form (no phone number `<ul>`). The form still works.

---

## Sources

### Primary (HIGH confidence)

- Codebase — `src/components/cart/pdp-cart-fab.tsx` [VERIFIED] — FAB positioning, safe-area, badge, cart count sync pattern
- Codebase — `src/components/chat/chat-fab.tsx` [VERIFIED] — z-index and fixed positioning convention
- Codebase — `src/components/ui/dialog.tsx` [VERIFIED] — `@base-ui/react/dialog` wrapper, `open`/`onOpenChange` controlled pattern
- Codebase — `src/components/layout/callback-request-form.tsx` [VERIFIED] — form component, `idPrefix` prop, `compact` prop
- Codebase — `src/server/services/store-settings.service.ts` [VERIFIED] — `getPublicStoreContacts()`, `PublicStorePhone` type
- Codebase — `src/server/services/cart.service.ts` [VERIFIED] — `getCartItemCount(userId)` signature
- Codebase — `src/app/(storefront)/layout.tsx` [VERIFIED] — injection point, existing session fetch pattern
- Codebase — `src/lib/cart/cart-events.ts` + `src/lib/cart/pending-storage.ts` [VERIFIED] — guest cart sync
- Codebase — `src/lib/phone/format-ua.ts` [VERIFIED] — `formatUaPhoneDisplay`, `uaPhoneTelHref`
- Node.js runtime — `lucide-react@1.16.0` exports [VERIFIED] — `Phone`, `PhoneCall`, `ShoppingCart` available
- Next.js 16.2.6 local docs — `node_modules/next/dist/docs/` [VERIFIED] — layout.md: layouts do not re-render on navigation; data fetching in RSC is the correct pattern

### Secondary (MEDIUM confidence)

- Phase 41 PATTERNS.md [VERIFIED in codebase] — established conventions for this project's component patterns, test assertion style (`.toBeDefined()`), `idPrefix` pattern in `CallbackRequestForm`

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — all libraries verified in package.json and codebase
- Architecture: HIGH — injection point, data flow, and component boundaries all verified from existing code
- Pitfalls: HIGH — derived directly from codebase inspection of existing FABs and dialog usage

**Research date:** 2026-05-23
**Valid until:** 2026-06-23 (stable stack; no fast-moving dependencies)
