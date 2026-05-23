---
phase: 43-slider-fix-animations-footer-bug
reviewed: 2026-05-23T17:57:32Z
depth: standard
files_reviewed: 7
files_reviewed_list:
  - src/app/(storefront)/layout.tsx
  - src/app/globals.css
  - src/components/catalog/catalog-filters.test.ts
  - src/components/catalog/catalog-filters.tsx
  - src/components/layout/page-transition.tsx
  - src/lib/catalog/store-map.test.ts
  - src/lib/catalog/store-map.ts
findings:
  critical: 2
  warning: 3
  info: 1
  total: 6
status: issues_found
---

# Phase 43: Code Review Report

**Reviewed:** 2026-05-23T17:57:32Z
**Depth:** standard
**Files Reviewed:** 7
**Status:** issues_found

## Summary

This phase touches page-transition animation, catalog price-filter slider, and the store-footer map embed. All three areas contain defects. Two blockers were found: a silent broken-iframe bug in `addressMapEmbedSrc` (any non-embed `mapUrl` stored in the database renders a broken `<iframe>` in the footer) and a race condition in the slider where a pending throttled URL write can overwrite a value the user typed immediately afterward. Three warnings cover an unsafe unguarded `iframe`, a `useLayoutEffect` where `useEffect` suffices, and a mixed-type `input` value. One info item flags missing test coverage for the broken function.

---

## Critical Issues

### CR-01: `addressMapEmbedSrc` returns non-embed URLs for `<iframe>` — map is silently broken

**File:** `src/lib/catalog/store-map.ts:25`

**Issue:** When `address.mapUrl` is set to any URL that is NOT a Google Maps embed URL (e.g. a plain share link like `https://maps.google.com/?q=Kyiv`), `addressMapEmbedSrc` returns it unchanged on line 25. That value becomes `<iframe src={mapEmbedSrc}>` in `store-footer.tsx:29`. Google (and most map providers) block embedding of non-embed share links via `X-Frame-Options: SAMEORIGIN`, so the iframe silently shows "refused to connect" in the footer.

The guard `isEmbedMapUrl` is only applied inside `addressExternalMapUrl` (line 15) to skip embed URLs there. `addressMapEmbedSrc` has the inverse responsibility but performs no such check — it needs to fall through to the lat/lng or text fallback when the stored URL is not embeddable.

```typescript
// Current (broken): any stored mapUrl is blindly returned
export function addressMapEmbedSrc(address: PublicStoreAddress): string | null {
  if (address.mapUrl) return address.mapUrl;   // <-- line 25, no isEmbedMapUrl guard
  ...
}

// Fix: only return mapUrl when it is actually an embed URL
export function addressMapEmbedSrc(address: PublicStoreAddress): string | null {
  if (address.mapUrl && isEmbedMapUrl(address.mapUrl)) return address.mapUrl;
  if (address.latitude != null && address.longitude != null) {
    const { latitude, longitude } = address;
    const delta = 0.01;
    const bbox = [
      longitude - delta,
      latitude - delta,
      longitude + delta,
      latitude + delta,
    ].join("%2C");
    return `https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${latitude}%2C${longitude}`;
  }
  return `https://www.google.com/maps?q=${encodeURIComponent(address.text)}&output=embed`;
}
```

---

### CR-02: Pending throttled URL write overwrites typed input value (slider/input race)

**File:** `src/components/catalog/catalog-filters.tsx:165–201`

**Issue:** `handleMinInput` and `handleMaxInput` (lines 165 and 184) call `setDragValues(null)` but do NOT cancel the `throttledPriceUrlSync` timer. If the user drags the slider (which schedules a deferred `setParams` call via the throttle) and then immediately types a value into the min/max price input, the stale throttle callback fires after `handleMinInput`/`handleMaxInput`'s own `setParams` and replaces the URL with the slider's stale price values, discarding what the user typed.

`syncPriceToUrl` with `immediate: true` calls `throttledPriceUrlSync.flush()` before applying its own update (line 156), but this only helps for `onValueCommitted` (slider release). The text inputs bypass `syncPriceToUrl` entirely and never flush the throttle.

```typescript
// Fix: flush the throttle at the start of both input handlers

const handleMinInput = (raw: string) => {
  if (!bounds) return;
  throttledPriceUrlSync.flush(); // cancel any pending slider update first
  setDragValues(null);
  // ... rest unchanged
};

const handleMaxInput = (raw: string) => {
  if (!bounds) return;
  throttledPriceUrlSync.flush(); // cancel any pending slider update first
  setDragValues(null);
  // ... rest unchanged
};
```

---

## Warnings

### WR-01: `<iframe>` has no `sandbox` attribute — embedded content runs with full permissions

**File:** `src/components/layout/store-footer.tsx:27–34`

**Issue:** The map `<iframe>` is rendered with `referrerPolicy` but no `sandbox` attribute. The embed URL originates from `addressMapEmbedSrc`, which can produce URLs built from database-stored `address.mapUrl` values. Without `sandbox`, the embedded document can run scripts, submit forms, navigate the top frame, and access `window.opener`. Even for trusted map providers this is unnecessarily permissive; for a value sourced from the database it carries meaningful risk if a malicious URL is ever stored.

```tsx
// Fix: add sandbox with minimum required permissions for map embeds
<iframe
  title="Карта магазину"
  src={mapEmbedSrc}
  loading="lazy"
  sandbox="allow-scripts allow-same-origin"
  className="h-40 w-full rounded-md border border-border md:h-auto md:min-h-[280px]"
  referrerPolicy="no-referrer-when-downgrade"
/>
```

Note: OpenStreetMap embed requires `allow-scripts`; Google Maps embed additionally requires `allow-same-origin`. Test both providers after adding `sandbox`.

---

### WR-02: `useLayoutEffect` used where `useEffect` is sufficient

**File:** `src/components/layout/page-transition.tsx:10`

**Issue:** `useLayoutEffect` runs synchronously after every DOM mutation and before the browser paints. The animation restart sequence (`el.style.animationName = "none"` / `void el.offsetHeight` / `el.style.animationName = ""`) does not need to block paint — it needs to happen before the new page content is composited, which `useEffect` also ensures in practice because it still fires before the next frame renders new children. Using `useLayoutEffect` here causes an unnecessary synchronous reflow on every navigation (the `void el.offsetHeight` already forces one reflow, adding a second implicit one from layout-effect timing). This is especially relevant on low-end devices.

Additionally, `useLayoutEffect` emits a server warning when used outside `"use client"` components. While this file has `"use client"`, the misuse is still a code-quality signal.

```tsx
// Fix: replace useLayoutEffect with useEffect
import { useRef, useEffect } from "react";

useEffect(() => {
  const el = ref.current;
  if (!el) return;
  el.style.animationName = "none";
  void el.offsetHeight;
  el.style.animationName = "";
}, [pathname]);
```

---

### WR-03: `minInputValue` / `maxInputValue` return mixed string/number types to a controlled `<input>`

**File:** `src/components/catalog/catalog-filters.tsx:126–136`

**Issue:** Both `minInputValue` and `maxInputValue` memos return either the string `""` (when `!bounds`) or a `number` otherwise. A React controlled `<input type="number">` whose `value` prop toggles between a string and a number is not a type error in JavaScript but creates a subtle problem: when the component transitions from `bounds == null` to `bounds != null` (or vice versa), React receives a different value type, which can cause `NaN` to appear in the input or leave a stale display value.

```typescript
// Fix: always return a string
const minInputValue = useMemo((): string => {
  if (!bounds) return "";
  if (dragValues) return String(dragValues[0]);
  return String(params.cinaVid ?? bounds.minUah);
}, [bounds, dragValues, params.cinaVid]);

const maxInputValue = useMemo((): string => {
  if (!bounds) return "";
  if (dragValues) return String(dragValues[1]);
  return String(params.cinaDo ?? bounds.maxUah);
}, [bounds, dragValues, params.cinaDo]);
```

---

## Info

### IN-01: `addressMapEmbedSrc` has zero test coverage

**File:** `src/lib/catalog/store-map.test.ts`

**Issue:** `store-map.test.ts` only tests `addressExternalMapUrl`. The `addressMapEmbedSrc` function — which contains CR-01 — has no test cases at all. The embed/non-embed passthrough, the lat/lng OpenStreetMap path, and the text-fallback path are entirely untested.

**Fix:** Add a `describe("addressMapEmbedSrc", ...)` block covering at minimum: (a) an embed URL is returned as-is, (b) a non-embed URL falls through to lat/lng or text fallback (catching CR-01 regression), (c) lat/lng produces an OSM embed URL, (d) text-only address produces a Google Maps embed URL.

---

_Reviewed: 2026-05-23T17:57:32Z_
_Reviewer: Claude (gsd-code-reviewer)_
_Depth: standard_
