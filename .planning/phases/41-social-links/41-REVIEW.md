---
phase: 41-social-links
reviewed: 2026-05-22T00:00:00Z
depth: standard
files_reviewed: 7
files_reviewed_list:
  - src/lib/social-links.ts
  - src/components/icons/social-icons.tsx
  - src/components/layout/social-nav-links.tsx
  - src/components/layout/store-header.tsx
  - src/components/layout/store-mobile-nav.tsx
  - src/components/layout/store-footer.tsx
  - src/components/layout/store-mobile-nav.test.tsx
findings:
  critical: 0
  warning: 3
  info: 2
  total: 5
status: remediated
---

# Phase 41: Code Review Report

**Reviewed:** 2026-05-22
**Depth:** standard
**Files Reviewed:** 7
**Status:** remediated (WR-01, WR-02, WR-03, IN-02 fixed; IN-01 accepted)

## Summary

This phase adds social links (Telegram, Viber, WhatsApp) to three surfaces: the desktop header, the mobile drawer, and the footer. The implementation is structurally sound — a shared `SocialNavLinks` component avoids markup triplication, security attributes (`target="_blank" rel="noopener noreferrer"`) are consistent across all links, and the component boundary choices (no `"use client"` in `social-nav-links.tsx`) are correct given the absence of server-only APIs.

Three warnings and two info items were found. The most significant concerns are: placeholder URLs shipped without guards to prevent production deployment as-is, incomplete test assertions on security attributes for two of the three links, and an overridable `aria-hidden` attribute order in the icon components.

---

## Warnings

### WR-01: Placeholder social URLs have no production guard

**File:** `src/lib/social-links.ts:2-4`

**Issue:** All three URLs are acknowledged mock values (`t.me/example`, `invite.viber.com/example`, `wa.me/380000000000`). The planning docs mark these as "v2.2 mock URLs," but the file ships with no comment, no environment variable indirection, and no build-time validation. A developer deploying this code to production will serve broken social links with no indication that replacement is required. There is no `TODO`, no `FIXME`, no env-var lookup, and no `console.warn`/build assertion to surface this gap.

**Fix:** Add a comment block documenting the placeholder status, or (preferably) read from environment variables so a missing production value fails loudly at startup:

```typescript
// src/lib/social-links.ts
// TODO: Replace placeholder URLs with real store social accounts before production launch.
// These are stub values used during development (phase 41, v2.2).
export const SOCIAL_LINKS = {
  telegram: "https://t.me/example",
  viber: "https://invite.viber.com/example",
  whatsapp: "https://wa.me/380000000000",
} as const;
```

Or use environment variables with startup validation (consistent with how `src/lib/env.ts` handles other public config):

```typescript
// src/lib/social-links.ts
import { env } from "@/lib/env"; // extend env.ts to add NEXT_PUBLIC_TELEGRAM_URL etc.

export const SOCIAL_LINKS = {
  telegram: env.NEXT_PUBLIC_TELEGRAM_URL,
  viber: env.NEXT_PUBLIC_VIBER_URL,
  whatsapp: env.NEXT_PUBLIC_WHATSAPP_URL,
} as const;
```

---

### WR-02: Test only verifies `noopener` for one link; `target` and `rel` unchecked for Viber and WhatsApp

**File:** `src/components/layout/store-mobile-nav.test.tsx:99-103`

**Issue:** The test "social links have correct href, target, and rel attributes" fully asserts `href`, `target`, and `rel` for the Telegram link, but for Viber and WhatsApp it only asserts `href`. Both `target="_blank"` and `rel="noopener noreferrer"` are left untested for these two links. The security properties the test is named after are only half-verified.

```typescript
// Lines 99-103 — current state:
expect(telegramLink.getAttribute("target")).toBe("_blank");
expect(telegramLink.getAttribute("rel")).toContain("noopener");

expect(viberLink.getAttribute("href")).toBe(SOCIAL_LINKS.viber);      // target/rel missing
expect(whatsappLink.getAttribute("href")).toBe(SOCIAL_LINKS.whatsapp); // target/rel missing
```

**Fix:**

```typescript
expect(viberLink.getAttribute("href")).toBe(SOCIAL_LINKS.viber);
expect(viberLink.getAttribute("target")).toBe("_blank");
expect(viberLink.getAttribute("rel")).toContain("noopener");

expect(whatsappLink.getAttribute("href")).toBe(SOCIAL_LINKS.whatsapp);
expect(whatsappLink.getAttribute("target")).toBe("_blank");
expect(whatsappLink.getAttribute("rel")).toContain("noopener");
```

---

### WR-03: `aria-hidden="true"` placed before `{...props}` spread — silently overridable

**File:** `src/components/icons/social-icons.tsx:11-13, 26-28, 41-43`

**Issue:** In all three icon components, `aria-hidden="true"` is declared as a static prop, then `{...props}` is spread after it. Because JSX prop spreading follows last-writer-wins semantics, any caller that passes `aria-hidden` in the `props` bag will silently override the intended `"true"` value. The component's contract (decorative icon, accessibility label on the parent `<a>`) depends on `aria-hidden="true"` being enforced, yet the spread undermines it.

Current order in all three components:

```tsx
<svg
  ...
  aria-hidden="true"
  className={className}
  {...props}        // can override aria-hidden
>
```

**Fix:** Move `aria-hidden` after the spread so it cannot be overridden:

```tsx
<svg
  xmlns="http://www.w3.org/2000/svg"
  viewBox="0 0 24 24"
  fill="currentColor"
  className={className}
  {...props}
  aria-hidden="true"   // now cannot be overridden by caller
>
```

Apply the same reorder to `ViberIcon` and `WhatsAppIcon`.

---

## Info

### IN-01: `SocialNavLinks` hard-codes brand colors as inline styles — inconsistent with project color convention

**File:** `src/components/layout/social-nav-links.tsx:18, 27, 36`

**Issue:** Icon colors are supplied via `style={{ color: "#2AABEE" }}` (and two other hex values). The rest of the project uses Tailwind utility classes or CSS custom properties for color. Inline styles bypass Tailwind's purging, theming, and hover/dark-mode composition. While this works at the pixel level today, it creates a future friction point: dark mode support, color-scheme overrides, or brand guideline changes will require hunting for hex literals in JSX rather than updating a token.

**Fix:** Either extend `tailwind.config.ts` with named brand colors:

```typescript
// tailwind.config.ts
colors: {
  "brand-telegram": "#2AABEE",
  "brand-viber": "#7360F2",
  "brand-whatsapp": "#25D366",
}
```

Then use `className="size-5 text-brand-telegram"` instead of the inline style. Alternatively, if Tailwind config changes are out of scope, retain the inline styles but add a comment documenting the hex values as intentional brand tokens.

---

### IN-02: `noreferrer` not asserted in test — only `noopener` checked

**File:** `src/components/layout/store-mobile-nav.test.tsx:100`

**Issue:** The test asserts `.toContain("noopener")` but does not verify the `noreferrer` half of the `rel` attribute. The implementation correctly ships `rel="noopener noreferrer"`, but the test would pass even if `noreferrer` were accidentally dropped. `noreferrer` prevents the `Referer` header from leaking the store URL to the social platforms. Since the test is explicitly about security attributes (its name is "social links have correct href, target, and rel attributes"), the omission leaves the `noreferrer` invariant unguarded by automation.

**Fix:**

```typescript
// Line 100 — extend the existing assertion:
expect(telegramLink.getAttribute("rel")).toContain("noopener");
expect(telegramLink.getAttribute("rel")).toContain("noreferrer");
// Repeat for viberLink and whatsappLink once WR-02 is addressed
```

---

_Reviewed: 2026-05-22_
_Reviewer: Claude (gsd-code-reviewer)_
_Depth: standard_
