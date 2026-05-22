# Phase 41: Social Links - Pattern Map

**Mapped:** 2026-05-22
**Files analyzed:** 6 (2 new, 4 modified)
**Analogs found:** 6 / 6

---

## File Classification

| New/Modified File | Role | Data Flow | Closest Analog | Match Quality |
|---|---|---|---|---|
| `src/components/icons/social-icons.tsx` | component | request-response (pure presentational) | `src/components/cart/cart-nav-link.tsx` (Lucide icon usage pattern) | role-match |
| `src/lib/social-links.ts` | utility (constants) | static | `src/lib/catalog/store-map.ts` | role-match |
| `src/components/layout/store-header.tsx` | component (RSC) | request-response | itself — patch file | self |
| `src/components/layout/store-mobile-nav.tsx` | component (client) | event-driven | itself — patch file | self |
| `src/components/layout/store-footer.tsx` | component (RSC) | request-response | itself — patch file | self |
| `src/components/layout/store-mobile-nav.test.tsx` | test | request-response | itself — extend file | self |

---

## Pattern Assignments

### `src/components/icons/social-icons.tsx` (component, presentational)

**Analog:** `src/components/cart/cart-nav-link.tsx` (icon usage), `src/components/wishlist/wishlist-nav-link.tsx` (aria pattern)

**No `"use client"` directive** — pure static JSX with no hooks; importable in both RSC and client components.

**Icon props type pattern** — use `React.ComponentProps<"svg">` (confirmed in `src/components/ui/alert-dialog.tsx` per RESEARCH.md):
```tsx
type IconProps = React.ComponentProps<"svg">;
```

**Icon component structure to copy:**
```tsx
// Each icon follows this exact signature:
export function TelegramIcon({ className, ...props }: IconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      aria-hidden="true"
      {...props}
    >
      {/* normalized 24-unit-grid path data */}
    </svg>
  );
}
// ViberIcon and WhatsAppIcon follow identical signature
```

**Key constraints from analogs:**
- `aria-hidden="true"` on the SVG — `aria-label` lives on the wrapping `<a>`, not the SVG (mirrors `WishlistNavLink`/`CartNavLink` pattern where Lucide icons carry no aria attributes)
- `fill="currentColor"` on `<svg>` — color is controlled via `style={{ color: "..." }}` on the SVG element or its parent
- `className` forwarded via spread — caller passes `size-5` (matches `<Heart className="size-5" />` in `wishlist-nav-link.tsx` line 64 and `<ShoppingCart className="size-5" />` in `cart-nav-link.tsx` line 19)
- `viewBox="0 0 24 24"` — paths must be normalized to 24-unit grid to avoid clipping at `size-5`

---

### `src/lib/social-links.ts` (utility, static constants)

**Analog:** `src/lib/catalog/store-map.ts`

**Import pattern** (`store-map.ts` lines 1):
```typescript
import type { PublicStoreAddress } from "@/server/services/store-settings.service";
```
Note: `social-links.ts` has no imports — it exports only `as const` object literals.

**Constants export pattern** — `as const` object, named export (not default):
```typescript
// src/lib/social-links.ts
export const SOCIAL_LINKS = {
  telegram: "https://t.me/example",          // mock URL for v2.2
  viber: "https://invite.viber.com/example", // mock URL for v2.2 (https:// scheme for browsers without Viber)
  whatsapp: "https://wa.me/380000000000",    // mock URL for v2.2
} as const;
```

The `as const` assertion makes values `readonly string` — identical convention to how `store-map.ts` uses literal returns and `catalog/store-map.ts` uses fixed string URLs.

---

### `src/components/layout/store-header.tsx` (MODIFY — RSC, request-response)

**Analog:** `src/components/layout/store-header.tsx` itself (patch)

**Existing imports block** (lines 1–11) — add `SocialNavLinks` import after existing layout imports:
```tsx
import Link from "next/link";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { categoriesWithAvailableProducts } from "@/lib/catalog/categories";
import { CartNavLink } from "@/components/cart/cart-nav-link";
import { GuestCartNavLink } from "@/components/cart/guest-cart-nav-link";
import { listCategoriesWithProductCounts } from "@/server/services/catalog.service";
import { WishlistNavLink } from "@/components/wishlist/wishlist-nav-link";
import { StoreHeaderAuth } from "@/components/layout/store-header-auth";
import { getWishlistItemCount } from "@/server/services/wishlist.service";
import { StoreMobileNav } from "@/components/layout/store-mobile-nav";
// ADD:
import { SocialNavLinks } from "@/components/layout/social-nav-links";
```

**Insertion point** — right-side cluster `<div>` (lines 46–65). Insert the `hidden md:flex` wrapper **between** `<StoreMobileNav>` and `<WishlistNavLink>`:
```tsx
<div className="flex items-center gap-2">
  <StoreMobileNav
    categories={availableCategories}
    session={session}
  />
  {/* SOC-01: social icons, desktop only */}
  <div className="hidden md:flex items-center">
    <SocialNavLinks />
  </div>
  <WishlistNavLink
    hasSession={Boolean(session?.user)}
    initialCount={
      session?.user
        ? await getWishlistItemCount(session.user.id)
        : undefined
    }
  />
  {session?.user ? (
    <CartNavLink userId={session.user.id} />
  ) : (
    <GuestCartNavLink />
  )}
  <StoreHeaderAuth session={session} />
</div>
```

**`hidden md:flex` wrapper** — this is the anti-Pitfall-4 guard. Without it the icons render on mobile next to the hamburger button.

---

### `src/components/layout/store-mobile-nav.tsx` (MODIFY — client component, event-driven)

**Analog:** `src/components/layout/store-mobile-nav.tsx` itself (patch)

**Existing imports block** (lines 1–21) — add `SocialNavLinks` import:
```tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { MenuIcon } from "lucide-react";
import { CallbackRequestForm } from "@/components/layout/callback-request-form";
import {
  StorefrontAuthLinks,
  type StorefrontAuthSession,
} from "@/components/layout/storefront-auth-links";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
// ADD:
import { SocialNavLinks } from "@/components/layout/social-nav-links";
```

**Existing `Separator` usage pattern** (line 74 and 78) — the drawer already has two separators with `className="my-6"`:
```tsx
<Separator className="my-6" />  // line 74, before callback form
<Separator className="my-6" />  // line 78, before auth links
```

**Insertion point** — after the closing `</div>` of the `StorefrontAuthLinks` block (after line 81), still inside `<SheetContent>`:
```tsx
        <div className="px-4 pb-4">
          <StorefrontAuthLinks session={session} />
        </div>
        {/* SOC-02: social links, after auth */}
        <Separator className="my-6" />
        <div className="px-4 pb-6">
          <p className="mb-3 text-xs text-muted-foreground">Ми в соцмережах</p>
          <SocialNavLinks />
        </div>
      </SheetContent>
```

**Pattern notes:**
- `px-4 pb-6` mirrors `px-4 pb-4` used for auth links block (line 79) — consistent horizontal padding
- `text-xs text-muted-foreground` mirrors the drawer's existing secondary text style
- Label "Ми в соцмережах" is explicit per D-06

---

### `src/components/layout/store-footer.tsx` (MODIFY — RSC, request-response)

**Analog:** `src/components/layout/store-footer.tsx` itself (patch)

**Existing imports block** (lines 1–10) — add `SocialNavLinks` import:
```tsx
import { CallbackRequestForm } from "@/components/layout/callback-request-form";
import {
  addressExternalMapUrl,
  addressMapEmbedSrc,
} from "@/lib/catalog/store-map";
import {
  formatUaPhoneDisplay,
  uaPhoneTelHref,
} from "@/lib/phone/format-ua";
import { getPublicStoreContacts } from "@/server/services/store-settings.service";
// ADD:
import { SocialNavLinks } from "@/components/layout/social-nav-links";
```

**Existing external link pattern** (lines 84–86) — footer already uses `target="_blank" rel="noopener noreferrer"`:
```tsx
<a
  href={addressExternalMapUrl(address)}
  target="_blank"
  rel="noopener noreferrer"
  className="text-foreground underline-offset-4 hover:underline"
>
```

**Existing copyright line** (line 105):
```tsx
<p className="mt-8 border-t border-border pt-6 text-sm text-muted-foreground md:text-center">
  © {year} Техніка б/у Львів
</p>
```

**Insertion point and double-border resolution** — insert the social row between `</div>` (closes grid, line 103) and the copyright `<p>` (line 105). Give the social row the `border-t`; strip `border-t border-border pt-6` from the copyright `<p>` (leaving only `mt-4`):
```tsx
        </div>{/* closes contacts grid */}

        {/* SOC-03: social links */}
        <div className="mt-8 flex flex-col items-center gap-3 border-t border-border pt-6">
          <p className="text-sm text-muted-foreground">Ми в соцмережах</p>
          <SocialNavLinks />
        </div>

        <p className="mt-4 text-sm text-muted-foreground md:text-center">
          © {year} Техніка б/у Львів
        </p>
```

**Anti-Pitfall-3 note:** The social row takes the `border-t border-border pt-6` that previously belonged to the copyright `<p>`. The copyright `<p>` is reduced to `mt-4` only — one divider, two items below it.

---

### `src/components/layout/store-mobile-nav.test.tsx` (MODIFY — Vitest/jsdom test)

**Analog:** `src/components/layout/store-mobile-nav.test.tsx` itself (extend)

**Existing test file header** (lines 1–18) — keep all existing mocks unchanged:
```tsx
/** @vitest-environment jsdom */
import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { StoreMobileNav } from "./store-mobile-nav";

vi.mock("next/navigation", () => ({
  usePathname: () => "/",
  useRouter: () => ({ push: vi.fn(), refresh: vi.fn() }),
}));

vi.mock("@/server/actions/callback.actions", () => ({
  submitCallbackRequestAction: vi.fn(),
}));

vi.mock("sonner", () => ({
  toast: { error: vi.fn(), success: vi.fn() },
}));
```

**Add import for `SOCIAL_LINKS`** at the top of the file (after existing imports):
```tsx
import { SOCIAL_LINKS } from "@/lib/social-links";
```

**Existing test structure pattern** (lines 19–67) — `describe("StoreMobileNav", () => { ... })` block with `it(...)` cases. Each test renders `<StoreMobileNav>` with minimal props, fires click on `"Меню"` button, then asserts with `screen.getBy*`. Use `toBeDefined()` for presence checks (established convention in this file).

**Two new test cases to append inside the existing `describe` block:**
```tsx
  it("shows social links section after auth links", () => {
    render(
      <StoreMobileNav
        session={null}
        categories={[{ slug: "pralki", name: "Пральні машини", productCount: 1 }]}
      />,
    );
    fireEvent.click(screen.getByRole("button", { name: "Меню" }));

    expect(screen.getByRole("link", { name: "Telegram" })).toBeDefined();
    expect(screen.getByRole("link", { name: "Viber" })).toBeDefined();
    expect(screen.getByRole("link", { name: "WhatsApp" })).toBeDefined();
  });

  it("social links point to configured URLs and open in new tab", () => {
    render(
      <StoreMobileNav
        session={null}
        categories={[{ slug: "pralki", name: "Пральні машини", productCount: 1 }]}
      />,
    );
    fireEvent.click(screen.getByRole("button", { name: "Меню" }));

    const telegram = screen.getByRole("link", { name: "Telegram" }) as HTMLAnchorElement;
    expect(telegram.getAttribute("href")).toBe(SOCIAL_LINKS.telegram);
    expect(telegram.getAttribute("target")).toBe("_blank");
    expect(telegram.getAttribute("rel")).toContain("noopener");

    const viber = screen.getByRole("link", { name: "Viber" }) as HTMLAnchorElement;
    expect(viber.getAttribute("href")).toBe(SOCIAL_LINKS.viber);

    const whatsapp = screen.getByRole("link", { name: "WhatsApp" }) as HTMLAnchorElement;
    expect(whatsapp.getAttribute("href")).toBe(SOCIAL_LINKS.whatsapp);
  });
```

**Convention note:** `.toBeDefined()` — not `.toBeInTheDocument()`. The existing file uses `.toBeDefined()` exclusively (lines 33–35, 50–51, 64–65); follow the same assertion style.

---

## Shared Patterns

### External Link Security
**Source:** `src/components/layout/store-footer.tsx` lines 84–85 (VERIFIED in codebase)
**Apply to:** Every `<a>` in `SocialNavLinks`
```tsx
target="_blank"
rel="noopener noreferrer"
```

### Icon Button Sizing and Accessibility
**Source:** `src/components/wishlist/wishlist-nav-link.tsx` line 60; `src/components/cart/cart-nav-link.tsx` line 16
**Apply to:** Every social icon `<a>` in `SocialNavLinks`
```tsx
className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-md hover:bg-muted"
aria-label="Telegram"  // or "Viber" / "WhatsApp"
```
The `min-h-11 min-w-11` enforces the 44px WCAG touch target minimum — identical to `WishlistNavLink` and `CartNavLink`.

### Icon Size Class
**Source:** `src/components/wishlist/wishlist-nav-link.tsx` line 64; `src/components/cart/cart-nav-link.tsx` line 19
**Apply to:** Every SVG icon component instantiation in `SocialNavLinks`
```tsx
<TelegramIcon className="size-5" style={{ color: "#2AABEE" }} />
<ViberIcon    className="size-5" style={{ color: "#7360F2" }} />
<WhatsAppIcon className="size-5" style={{ color: "#25D366" }} />
```
`size-5` = `w-5 h-5` = 20px. Brand color delivered via `style={{ color }}` + `fill="currentColor"` on the SVG — no Tailwind config change required.

### Separator Usage in Mobile Drawer
**Source:** `src/components/layout/store-mobile-nav.tsx` lines 74 and 78
**Apply to:** New separator above the social links block in `store-mobile-nav.tsx`
```tsx
<Separator className="my-6" />
```
Import: `import { Separator } from "@/components/ui/separator";` — already present in `store-mobile-nav.tsx`.

### `SocialNavLinks` Shared Cluster Component
**Not yet in codebase — new file implied by RESEARCH.md Pattern 3.**
Create `src/components/layout/social-nav-links.tsx` (no `"use client"`) that renders the three `<a>` buttons in a `flex gap-1` row. All three surfaces import this single component. This avoids tripling the anchor markup.

---

## New File with No Direct Codebase Analog

| File | Role | Data Flow | Reason |
|------|------|-----------|--------|
| `src/components/icons/social-icons.tsx` | component | presentational | No existing custom SVG icon components in codebase; project uses Lucide (npm) for all current icons. Pattern derived from Lucide's internal component shape and `React.ComponentProps<"svg">` usage in `src/components/ui/alert-dialog.tsx`. |
| `src/components/layout/social-nav-links.tsx` | component | presentational | Implied by RESEARCH.md Pattern 3 as the DRY cluster component. Not explicitly listed in CONTEXT.md file list but required to avoid tripling the anchor markup across three surfaces. Planner should add this as a task. |

---

## Metadata

**Analog search scope:** `src/components/layout/`, `src/components/wishlist/`, `src/components/cart/`, `src/lib/`, `src/components/ui/`
**Files read:** 10
**Pattern extraction date:** 2026-05-22
