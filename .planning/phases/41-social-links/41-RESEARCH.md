# Phase 41: Social Links - Research

**Researched:** 2026-05-22
**Domain:** React/Next.js component composition — static SVG icon links in layout surfaces
**Confidence:** HIGH

---

## Summary

Phase 41 adds three social icon links (Telegram, Viber, WhatsApp) to three storefront surfaces: the desktop header right-side cluster, the mobile drawer, and the footer. All decisions are locked in CONTEXT.md. No new npm packages are required — the implementation is entirely inline SVG components plus a constants file.

The codebase is a Next.js 16.2.6 / React 19.2.4 app with TypeScript strict mode. `StoreHeader` and `StoreFooter` are async server components. `StoreMobileNav` is a client component (`"use client"`). Social links are purely static markup — no state, no hooks, no async data — so they integrate cleanly into all three surfaces.

The project test framework is Vitest 4.1.6 with `@testing-library/react` 16.3.2 and jsdom 29.1.1. Two existing layout component tests (`store-mobile-nav.test.tsx`, `callback-request-form.test.tsx`) set the exact pattern for new tests. The baseline has 2 failing tests in `prisma/seed.test.ts` (unrelated DB seed count) and 330 passing tests; these pre-existing failures must not be introduced by Phase 41.

**Primary recommendation:** Create two new files (`src/components/icons/social-icons.tsx` and `src/lib/social-links.ts`), then patch the three layout files at the exact insertion points documented below.

---

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

- **D-01:** Custom inline SVG components in `src/components/icons/social-icons.tsx` — `TelegramIcon`, `ViberIcon`, `WhatsAppIcon`. No new npm dependency.
- **D-02:** Always-on brand colors: Telegram `#2AABEE`, Viber `#7360F2`, WhatsApp `#25D366`.
- **D-03:** Icon size matches existing nav icons (`size-5` or `w-5 h-5`). Accessible pattern mirrors `WishlistNavLink` (aria-label, min touch target).
- **D-04:** Header: right-side icons cluster, inserted before `WishlistNavLink`. Hidden on mobile.
- **D-05:** Rendered as `<a href="..." target="_blank" rel="noopener noreferrer">` icon buttons.
- **D-06:** Mobile drawer: after `StorefrontAuthLinks` section, below the last `<Separator>`.
- **D-07:** Footer: new row between the contacts/callback grid and the copyright `<p>` line. Label "Ми в соцмережах" precedes the icon row.
- **D-08:** Mock URLs stored as constants in `src/lib/social-links.ts`, exported as `SOCIAL_LINKS = { telegram: "...", viber: "...", whatsapp: "..." }`.

### Claude's Discretion

- Exact icon button wrapper styling (hover states, gap between icons) — match existing action icon aesthetic in the header.
- Drawer: label vs icon-only, exact Separator positioning — keep consistent with drawer visual rhythm.

### Deferred Ideas (OUT OF SCOPE)

None — discussion stayed within phase scope.
</user_constraints>

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| SOC-01 | User can see Telegram, Viber, WhatsApp links in the site header | Insertion point confirmed: `<div className="flex items-center gap-2">` in `store-header.tsx`, before `WishlistNavLink`. Icons hidden on mobile via `hidden md:flex` wrapper. |
| SOC-02 | User can see the same social links in the mobile drawer | Insertion point confirmed: after `<StorefrontAuthLinks>` block (lines 79–81 of `store-mobile-nav.tsx`), with new `<Separator className="my-6" />` above. |
| SOC-03 | User can see the same social links in the footer | Insertion point confirmed: between `<CallbackRequestForm />` (within the contacts column) and the copyright `<p className="mt-8 ...">` at line 105 of `store-footer.tsx`. |
</phase_requirements>

---

## Architectural Responsibility Map

| Capability | Primary Tier | Secondary Tier | Rationale |
|------------|-------------|----------------|-----------|
| SVG icon components | Frontend (shared) | — | Pure presentational, usable in both server and client components |
| URL constants | Frontend (shared) | — | Static data, no server side needed, imported where required |
| Header social links | Frontend Server (RSC) | — | `StoreHeader` is an async server component; static `<a>` tags fit without "use client" |
| Mobile drawer social links | Browser / Client | — | `StoreMobileNav` is already `"use client"`; static JSX appended after auth links |
| Footer social links | Frontend Server (RSC) | — | `StoreFooter` is an async server component; static markup added above copyright line |

---

## Standard Stack

### Core (already installed — no additions needed)

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| React | 19.2.4 | Component model | Project baseline |
| Next.js | 16.2.6 | Server/client components | Project baseline |
| TypeScript | 5.9.3 | Type safety | Project baseline (strict mode) |
| Tailwind CSS | (project standard) | Styling | All layout components use Tailwind |

### Supporting (already installed — no additions needed)

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| `@/components/ui/separator` | (base-ui Separator) | Visual divider | Already used in mobile drawer with `className="my-6"` |
| `clsx` / `tailwind-merge` (via `cn`) | (project standard) | Conditional classnames | Available at `@/lib/utils` |

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Inline SVG components | `react-icons` | react-icons adds 1MB+ for 3 icons — correctly rejected per D-01 |
| Inline SVG components | Lucide icons | Telegram, Viber, WhatsApp are not in Lucide — correctly rejected |
| Constants file | `.env` variables | Env vars are for secrets and deployment config; static public URLs are code |

**Installation:** None. Zero new npm packages.

---

## Package Legitimacy Audit

Not applicable. This phase installs no external packages.

---

## Architecture Patterns

### System Architecture Diagram

```
[Browser Request]
      |
      v
[StoreHeader — RSC]              [StoreFooter — RSC]
  right-side cluster                contacts grid
  [Telegram a][Viber a][WhatsApp a] → SOCIAL_LINKS  → [Telegram a][Viber a][WhatsApp a]
  ↑ hidden on mobile                                   above copyright <p>
      |
      v
[StoreMobileNav — "use client"]
  drawer, after StorefrontAuthLinks
  <Separator />
  [Telegram a][Viber a][WhatsApp a]
      |
      v
[SOCIAL_LINKS constant] ← src/lib/social-links.ts (single source of truth)
[TelegramIcon / ViberIcon / WhatsAppIcon] ← src/components/icons/social-icons.tsx
```

### Recommended Project Structure

```
src/
├── components/
│   ├── icons/
│   │   └── social-icons.tsx        # NEW — TelegramIcon, ViberIcon, WhatsAppIcon (inline SVG)
│   └── layout/
│       ├── store-header.tsx         # PATCH — add SocialNavLinks before WishlistNavLink
│       ├── store-footer.tsx         # PATCH — add SocialLinks section before copyright <p>
│       └── store-mobile-nav.tsx     # PATCH — add SocialLinks after StorefrontAuthLinks
└── lib/
    └── social-links.ts              # NEW — SOCIAL_LINKS constant
```

### Pattern 1: Inline SVG Icon Component

**What:** TypeScript functional component wrapping an inline `<svg>` element with forwarded `className` and `aria-hidden` props. Matches the pattern Lucide uses internally.

**When to use:** When no npm icon library provides the needed brand icon.

**Example:**
```tsx
// Source: project pattern — mirrors Lucide icon component signature
type IconProps = React.ComponentProps<"svg">;

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
      {/* path data */}
    </svg>
  );
}
```

The `fill` color is set via inline `style` or Tailwind utility on the wrapping `<a>`, not on the SVG itself — see Pattern 2 below.

### Pattern 2: Social Icon Anchor Button

**What:** `<a>` element styled to match the existing nav icon button pattern (`min-h-11 min-w-11`, `inline-flex`, `items-center justify-center`, `rounded-md`, `hover:bg-muted`). Icon SVG is rendered inside it with `aria-hidden`; `aria-label` is on the `<a>`.

**When to use:** Every surface (header, drawer, footer) — consistent pattern everywhere.

**Example:**
```tsx
// Source: mirrors cart-nav-link.tsx and wishlist-nav-link.tsx className pattern
<a
  href={SOCIAL_LINKS.telegram}
  target="_blank"
  rel="noopener noreferrer"
  aria-label="Telegram"
  className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-md hover:bg-muted"
>
  <TelegramIcon className="size-5" style={{ color: "#2AABEE" }} />
</a>
```

**Brand color delivery:** Use `style={{ color: "..." }}` on the SVG element combined with `fill="currentColor"` in the SVG path. This keeps brand colors out of Tailwind config (no config change needed) and is compatible with server components.

### Pattern 3: Social Icons Cluster (reusable group)

**What:** A small presentational component that renders the three social `<a>` buttons in a `flex gap-1` row. Imported identically by header, drawer, and footer — avoids tripling the anchor markup.

**When to use:** All three surfaces use this cluster.

**Example:**
```tsx
// src/components/layout/social-nav-links.tsx (server-compatible, no "use client")
import { SOCIAL_LINKS } from "@/lib/social-links";
import { TelegramIcon, ViberIcon, WhatsAppIcon } from "@/components/icons/social-icons";

export function SocialNavLinks() {
  return (
    <div className="flex items-center gap-1">
      <a href={SOCIAL_LINKS.telegram} target="_blank" rel="noopener noreferrer" aria-label="Telegram"
         className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-md hover:bg-muted">
        <TelegramIcon className="size-5" style={{ color: "#2AABEE" }} />
      </a>
      <a href={SOCIAL_LINKS.viber} target="_blank" rel="noopener noreferrer" aria-label="Viber"
         className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-md hover:bg-muted">
        <ViberIcon className="size-5" style={{ color: "#7360F2" }} />
      </a>
      <a href={SOCIAL_LINKS.whatsapp} target="_blank" rel="noopener noreferrer" aria-label="WhatsApp"
         className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-md hover:bg-muted">
        <WhatsAppIcon className="size-5" style={{ color: "#25D366" }} />
      </a>
    </div>
  );
}
```

This component has no `"use client"` — it is pure static JSX and can be used in RSC (header, footer) and inside client components (mobile nav) alike.

### Pattern 4: Header Integration (SOC-01)

**What:** Wrap `<SocialNavLinks />` in `<div className="hidden md:flex items-center">` so it hides on mobile (mobile drawer handles that surface) and appears in the desktop right-side cluster before `WishlistNavLink`.

**Exact insertion point in `store-header.tsx` (line 46–65):**
```tsx
<div className="flex items-center gap-2">
  <StoreMobileNav ... />
  {/* INSERT HERE: */}
  <div className="hidden md:flex items-center">
    <SocialNavLinks />
  </div>
  <WishlistNavLink ... />
  ...
</div>
```

### Pattern 5: Mobile Drawer Integration (SOC-02)

**What:** After the `<StorefrontAuthLinks>` block (currently the last element inside `SheetContent`), add a `<Separator className="my-6" />` and a `<div className="px-4 pb-4">` containing the label and icon cluster.

**Exact insertion point in `store-mobile-nav.tsx` (after line 81):**
```tsx
<div className="px-4 pb-4">
  <StorefrontAuthLinks session={session} />
</div>
{/* INSERT HERE: */}
<Separator className="my-6" />
<div className="px-4 pb-6">
  <p className="mb-3 text-xs text-muted-foreground">Ми в соцмережах</p>
  <SocialNavLinks />
</div>
```

### Pattern 6: Footer Integration (SOC-03)

**What:** Between the main contacts+map grid and the copyright `<p>` element (line 105), add a centered social links row with a label.

**Exact insertion point in `store-footer.tsx` (between line 103 and 105):**
```tsx
        </div>{/* closes the contacts grid */}

        {/* INSERT HERE: */}
        <div className="mt-8 flex flex-col items-center gap-3 border-t border-border pt-6">
          <p className="text-sm text-muted-foreground">Ми в соцмережах</p>
          <SocialNavLinks />
        </div>

        <p className="mt-8 border-t border-border pt-6 text-sm text-muted-foreground md:text-center">
          © {year} Техніка б/у Львів
        </p>
```

**Note:** The existing copyright `<p>` already has `mt-8 border-t border-border pt-6`. To avoid a double divider, the social row's wrapping div should be the one with the border-t, and the copyright `<p>` should lose its `border-t` and `pt-6` (or keep them — both approaches are visually fine; the planner decides). [ASSUMED]

### Anti-Patterns to Avoid

- **Installing react-icons for 3 icons:** Adds 1MB+ to bundle. Use inline SVG per D-01.
- **Putting brand colors in Tailwind config:** Requires config change and restart. Use `style={{ color: "..." }}` or hardcoded Tailwind arbitrary values (`text-[#2AABEE]`) instead. `style` is cleaner for one-off brand colors.
- **Adding "use client" to social-icons.tsx:** Not needed — inline SVG is pure JSX with no hooks. Server components can import it directly.
- **Duplicating the three `<a>` blocks in each surface:** Create `SocialNavLinks` once, import everywhere.
- **Using `<button>` instead of `<a>`:** These are navigation links to external URLs, not actions. `<a>` with `target="_blank"` is semantically correct per D-05.
- **Omitting `aria-hidden` on the SVG:** Screen readers would read the SVG's path data. The `aria-label` on the `<a>` is sufficient; SVG should be `aria-hidden`.
- **Omitting `aria-label` on the `<a>`:** Icon-only buttons without visible text MUST have `aria-label` (WCAG 2.1 SC 1.1.1).

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| External link security | Custom rel attribute logic | `rel="noopener noreferrer"` (standard, already in codebase) | `noopener` prevents new page from accessing `window.opener`; `noreferrer` suppresses referrer header |
| Touch target sizing | Custom CSS | `min-h-11 min-w-11` (already established pattern) | Matches the 44px WCAG minimum — same as `WishlistNavLink` and `CartNavLink` |
| Icon color | Tailwind plugin / CSS variable | Inline `style={{ color: "#2AABEE" }}` | No config change, works in RSC and client components |

---

## Runtime State Inventory

Not applicable. This is a greenfield UI addition. No stored data, live service config, OS-registered state, secrets, or build artifacts reference social links.

---

## Common Pitfalls

### Pitfall 1: SVG viewBox mismatch
**What goes wrong:** Icon appears clipped or misaligned inside the 20×20px (`size-5`) container.
**Why it happens:** Brand SVGs are often authored at different viewBox dimensions (e.g., 448×512).
**How to avoid:** Use `viewBox="0 0 24 24"` with paths normalized to a 24-unit grid, OR set `viewBox` to match the actual path coordinate space and let `width`/`height` classes scale it. The `className="size-5"` sets CSS width/height; the SVG scales within it as long as `viewBox` is set correctly.
**Warning signs:** Icon appears too large, too small, or cropped when rendered.

### Pitfall 2: fill vs currentColor confusion
**What goes wrong:** Hardcoding `fill="#2AABEE"` directly on `<path>` elements means `className="size-5"` color utilities have no effect — but more importantly, if the icon has multiple paths (fill + outline), only one gets the color.
**How to avoid:** Set `fill="currentColor"` on the `<svg>` element (or on each `<path>`), then control color via `style={{ color: "..." }}` on the SVG or its parent `<a>`.
**Warning signs:** Icon color does not respond to CSS color property.

### Pitfall 3: Double border-top in footer
**What goes wrong:** The copyright `<p>` already has `border-t border-border pt-6`. Adding a social row with its own `border-t` directly above creates a double divider.
**How to avoid:** The social row gets the `border-t`, and the copyright `<p>`'s `border-t` / `pt-6` is removed (leaving only `mt-8`). Or the social row has no border and the copyright line keeps its border — the planner should pick one approach.
**Warning signs:** Two horizontal rules appear in the footer between social links and copyright.

### Pitfall 4: Mobile nav — social icons appear on desktop
**What goes wrong:** `StoreMobileNav`'s `SheetTrigger` is `md:hidden`, but the social links added inside `SheetContent` are always visible when the drawer is open (drawer only opens on mobile anyway). No issue there. The header social links, however, must be wrapped in `hidden md:flex` — failing to do so shows them on mobile next to the hamburger button.
**How to avoid:** Wrap the header social links in `<div className="hidden md:flex items-center">`.
**Warning signs:** Three icon buttons appear on mobile next to the hamburger menu.

### Pitfall 5: Accessibility — missing aria-label on anchor
**What goes wrong:** Icon-only `<a>` without `aria-label` — screen reader says nothing or reads SVG path data.
**How to avoid:** Every `<a>` containing an icon-only SVG MUST have `aria-label="Telegram"` (or equivalent). The SVG itself gets `aria-hidden={true}`.
**Warning signs:** axe/accessibility audit flags "Links must have discernible text."

---

## Code Examples

### social-links.ts constants file

```typescript
// Source: pattern established by codebase (see src/lib/catalog/store-map.ts for similar constant exports)
// src/lib/social-links.ts
export const SOCIAL_LINKS = {
  telegram: "https://t.me/example",   // mock URL for v2.2
  viber: "viber://chat?number=%2B380000000000",   // mock URL for v2.2
  whatsapp: "https://wa.me/380000000000",         // mock URL for v2.2
} as const;
```

### social-icons.tsx type signature

```typescript
// Source: [ASSUMED] — matches React.ComponentProps<"svg"> pattern found in src/components/ui/alert-dialog.tsx
// src/components/icons/social-icons.tsx
type IconProps = React.ComponentProps<"svg">;

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
      {/* SVG path for Telegram paper plane */}
    </svg>
  );
}
// ViberIcon and WhatsAppIcon follow the same signature
```

---

## Validation Architecture

### Test Framework

| Property | Value |
|----------|-------|
| Framework | Vitest 4.1.6 |
| Config file | `vitest.config.ts` (project root) |
| Quick run command | `npm test -- --reporter=verbose src/components/layout/store-mobile-nav.test.tsx` |
| Full suite command | `npm test` |
| jsdom environment | Enabled per-file with `/** @vitest-environment jsdom */` docblock (see existing tests) |

### Phase Requirements → Test Map

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|--------------|
| SOC-01 | Social icons appear in header on desktop | Manual visual | n/a — `StoreHeader` is RSC, not renderable in jsdom without heavy mocking | N/A |
| SOC-02 | Social icons appear in mobile drawer | Unit (jsdom) | `npm test -- src/components/layout/store-mobile-nav.test.tsx` | Wave 0 gap |
| SOC-02 | Social icon links have correct href | Unit (jsdom) | same file | Wave 0 gap |
| SOC-03 | Social icons appear in footer | Manual visual | n/a — `StoreFooter` is RSC with async data fetching | N/A |
| D-05 | Links open with target=_blank and rel=noopener | Unit (jsdom) | `npm test -- src/components/layout/store-mobile-nav.test.tsx` | Wave 0 gap |
| D-02 | Brand colors are rendered | Manual visual | n/a — JSDOM does not compute style; color check requires browser | N/A |
| SOC-01 | Header icons hidden on mobile (hidden md:flex) | Manual visual | n/a — Tailwind responsive classes require real browser | N/A |

### Automated Test Coverage (what vitest/jsdom CAN verify)

The mobile drawer (`StoreMobileNav`) is a `"use client"` component and is fully renderable in jsdom. The existing test (`store-mobile-nav.test.tsx`) provides the exact pattern to extend:

```tsx
// Extend store-mobile-nav.test.tsx with:
it("shows social links section after auth links", () => {
  render(<StoreMobileNav session={null} categories={[...]} />);
  fireEvent.click(screen.getByRole("button", { name: "Меню" }));

  // SOC-02: icons present
  expect(screen.getByRole("link", { name: "Telegram" })).toBeDefined();
  expect(screen.getByRole("link", { name: "Viber" })).toBeDefined();
  expect(screen.getByRole("link", { name: "WhatsApp" })).toBeDefined();
});

it("social links point to configured URLs and open in new tab", () => {
  render(<StoreMobileNav session={null} categories={[...]} />);
  fireEvent.click(screen.getByRole("button", { name: "Меню" }));

  const telegram = screen.getByRole("link", { name: "Telegram" }) as HTMLAnchorElement;
  expect(telegram.getAttribute("href")).toBe(SOCIAL_LINKS.telegram);
  expect(telegram.getAttribute("target")).toBe("_blank");
  expect(telegram.getAttribute("rel")).toContain("noopener");
});
```

The `StoreHeader` and `StoreFooter` are async RSCs and cannot be unit-tested with jsdom. Their social link presence is verified manually.

### Manual Verification Checklist

1. **Desktop header (SOC-01):** Navigate to any page on desktop viewport (≥768px). Confirm three colored icons appear in the right icon cluster between the hamburger and the wishlist heart.
2. **Mobile header (SOC-01 negative):** Resize to <768px. Confirm the three social icons are NOT visible next to the hamburger button (they appear in the drawer instead).
3. **Mobile drawer (SOC-02):** Open the hamburger menu on mobile. Scroll to the bottom. Confirm the three icons appear after auth links with a separator above.
4. **Footer (SOC-03):** Scroll to the footer. Confirm a row labeled "Ми в соцмережах" with three colored icons appears between the contacts section and the copyright line.
5. **Link targets:** Click each icon on any surface. Confirm it opens a new browser tab.
6. **Brand colors:** Confirm Telegram icon is blue, Viber is purple, WhatsApp is green.
7. **Accessibility:** Tab through the header; confirm each social link receives keyboard focus with a visible focus ring and has a readable aria-label.

### Sampling Rate

- **Per task commit:** `npm test -- src/components/layout/store-mobile-nav.test.tsx`
- **Per wave merge:** `npm test`
- **Phase gate:** Full suite green (`npm test`) + all manual checks above before `/gsd:verify-work`

### Wave 0 Gaps

- [ ] Extend `src/components/layout/store-mobile-nav.test.tsx` — add SOC-02 social links tests (2 new test cases)
- [ ] No new test file needed for `social-icons.tsx` or `social-links.ts` — these are trivial data/markup with no logic branches to test
- [ ] No framework install needed — Vitest is already configured

*The two pre-existing failures in `prisma/seed.test.ts` are unrelated to this phase and MUST remain at baseline (not fixed, not worsened).*

---

## Security Domain

| ASVS Category | Applies | Standard Control |
|---------------|---------|-----------------|
| V2 Authentication | No | — |
| V3 Session Management | No | — |
| V4 Access Control | No | — |
| V5 Input Validation | No | Static URLs — no user input |
| V6 Cryptography | No | — |

### Threat: Open Redirect via `target="_blank"`

| Pattern | STRIDE | Standard Mitigation |
|---------|--------|---------------------|
| Tabnapping via `target="_blank"` without `rel` | Elevation of Privilege | Always include `rel="noopener noreferrer"` — required by D-05 and already in codebase pattern |

The `noopener` attribute prevents the new tab from accessing `window.opener` and redirecting the parent. The `noreferrer` attribute additionally suppresses the HTTP Referer header. Both are already confirmed in the codebase (`store-footer.tsx` line 85).

---

## Environment Availability

Step 2.6: SKIPPED — this phase is purely code/config changes. No external services, databases, CLI tools, or runtimes beyond the project's own stack are required.

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Icon fonts (Font Awesome) | Inline SVG or tree-shakeable icon libraries | ~2019 | Zero runtime overhead; no FOUT; no external font request |
| `react-icons` for everything | Inline SVG for 1-3 brand icons | Ongoing | Avoids 1MB+ bundle cost when only a few icons are needed |

---

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | Double border-top issue in footer when adding social row above existing copyright `<p>` | Common Pitfalls / Pattern 6 | Visual only — easy to fix at implementation time by removing `border-t` from copyright `<p>` |
| A2 | `React.ComponentProps<"svg">` is the right TypeScript type for custom SVG icon props | Code Examples | Compiler will catch immediately; fallback is `React.SVGProps<SVGSVGElement>` |
| A3 | Mock URLs for Viber should use `viber://` deep link scheme rather than `https://` | Code Examples | Viber may not open if wrong URL scheme used — operator updates for v2.3 anyway |

---

## Open Questions

1. **Footer layout: social row before or replacing the copyright border?**
   - What we know: The copyright `<p>` has `border-t border-border pt-6`. Adding a social row with its own `border-t` above it creates a double divider.
   - What's unclear: Whether to remove the copyright's `border-t` or keep it and add the social row without one.
   - Recommendation: Give the social row the `border-t` and remove it from the copyright `<p>` — cleaner visual rhythm (one divider, two items below it).

2. **Viber URL scheme**
   - What we know: Viber supports both `viber://chat?number=...` (deep link, opens app) and `https://invite.viber.com/?number=...` (web fallback). CONTEXT.md says mock URLs for v2.2.
   - What's unclear: Which scheme the operator will use when real URLs are provided.
   - Recommendation: Use `https://` for the mock (safe fallback for browsers without Viber installed). Operator replaces when real group/channel URL is known.

---

## Sources

### Primary (HIGH confidence)
- `src/components/layout/store-header.tsx` — Exact component structure and insertion point verified by direct file read [VERIFIED: codebase]
- `src/components/layout/store-footer.tsx` — Exact component structure and insertion point verified by direct file read [VERIFIED: codebase]
- `src/components/layout/store-mobile-nav.tsx` — Exact component structure and insertion point verified by direct file read [VERIFIED: codebase]
- `src/components/wishlist/wishlist-nav-link.tsx` — Icon button pattern (className, aria-label, size-5) verified by direct file read [VERIFIED: codebase]
- `src/components/cart/cart-nav-link.tsx` — Confirms identical icon button className pattern [VERIFIED: codebase]
- `src/components/layout/store-mobile-nav.test.tsx` — Establishes Vitest/jsdom test pattern for layout client components [VERIFIED: codebase]
- `vitest.config.ts` — Test framework confirmed as Vitest 4.1.6, jsdom 29.1.1, @testing-library/react 16.3.2 [VERIFIED: codebase]
- `node_modules/next/dist/docs/01-app/03-api-reference/01-directives/use-client.md` — Confirms "use client" convention and server component behavior [VERIFIED: Next.js 16.2.6 docs]

### Secondary (MEDIUM confidence)
- `src/components/ui/alert-dialog.tsx` — `React.ComponentProps<"...">` pattern for component props [VERIFIED: codebase]
- `src/components/ui/separator.tsx` — Separator API (base-ui, accepts className) [VERIFIED: codebase]

### Tertiary (LOW confidence / ASSUMED)
- SVG icon path data for Telegram, Viber, WhatsApp — official brand SVGs are publicly available but specific path data must be sourced at implementation time [ASSUMED]
- Viber URL scheme recommendation — based on training knowledge, not verified against current Viber docs [ASSUMED]

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — no new packages; all existing dependencies confirmed
- Architecture: HIGH — insertion points verified line-by-line in source files
- Pitfalls: HIGH — derived from direct code inspection, not speculation
- Test strategy: HIGH — existing test file pattern confirmed; Wave 0 gap is additive only

**Research date:** 2026-05-22
**Valid until:** 2026-06-22 (stable domain; layout files unlikely to change between now and implementation)
