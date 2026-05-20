---
phase: 32-admin-dashboard-polish
reviewed: 2026-05-20T13:43:59Z
depth: standard
files_reviewed: 2
files_reviewed_list:
  - src/app/(admin)/admin/page.tsx
  - src/components/admin/stat-card.tsx
findings:
  critical: 0
  warning: 2
  info: 2
  total: 4
status: issues_found
---

# Phase 32: Code Review Report

**Reviewed:** 2026-05-20T13:43:59Z
**Depth:** standard
**Files Reviewed:** 2
**Status:** issues_found

## Summary

Reviewed `src/app/(admin)/admin/page.tsx` (dashboard server component) and `src/components/admin/stat-card.tsx` (presentational card component), plus the directly called dependencies: `getAdminDashboardStats` in `admin-order.service.ts`, `AdminRecentOrdersTable`, `formatPriceKopiyky`, and `getAdminClickableRowProps`.

The phase-32 changes themselves — adding icon props to `StatCard` and adding lucide icons to dashboard buttons — are structurally sound and backward-compatible. Two correctness defects were found in code exercised by these files: a price-display precision loss in `formatPriceKopiyky` and an icon/text overlap in the `StatCard` layout. Two informational items note ARIA invalidity in a shared helper and a missing error boundary.

## Warnings

### WR-01: `formatPriceKopiyky` rounds to whole UAH, silently losing sub-UAH precision

**File:** `src/lib/catalog/format.ts:10`
**Issue:** The function divides kopiyky by 100 then calls `Math.round`, which truncates the fractional UAH value before display. A price of 9 999 kopiyky (99.99 UAH) is shown as "100 ₴". A price of 19 901 kopiyky (199.01 UAH) is shown as "199 ₴". The table column `Сума` in `admin-recent-orders-table.tsx` (line 76) displays order totals through this function — admins can see materially wrong totals.

**Fix:** Use `toFixed(2)` on the fractional value, or format with `Intl.NumberFormat` at two decimal places:
```ts
export function formatPriceKopiyky(kopiyky: number): string {
  const uah = kopiyky / 100;
  return new Intl.NumberFormat("uk-UA", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(uah) + " ₴";
}
```

---

### WR-02: Absolute icon in `StatCard` can overlap the label text

**File:** `src/components/admin/stat-card.tsx:15-22`
**Issue:** The icon is positioned `absolute top-0 right-0` (20px × 20px), but the `<p>` label element that sits at the same vertical position has no right padding. If the label string is moderately long — "Товари в наявності" is already 18 characters — the text wraps or runs under the icon depending on card width. At narrow card widths (e.g., the `sm:grid-cols-2` breakpoint on tablet), all three current label strings are long enough to collide visually.

**Fix:** Add `pr-7` (padding-right wider than `size-5`) to the label paragraph, or add it to the outer `relative` wrapper so both label and count are shifted away from the icon corner:
```tsx
const content = (
  <div className="relative pr-7">
    {Icon && (
      <Icon className="absolute top-0 right-0 size-5 text-muted-foreground" aria-hidden />
    )}
    <p className="text-sm font-medium text-muted-foreground">{label}</p>
    <p className="mt-2 text-3xl font-semibold tabular-nums">{count}</p>
  </div>
);
```

---

## Info

### IN-01: `<tr role="link">` is an invalid ARIA override

**File:** `src/lib/admin/clickable-table-row.ts:38` (applied by `src/components/admin/admin-recent-orders-table.tsx:60-67`)
**Issue:** ARIA 1.2 does not permit overriding the implicit `row` role of a `<tr>` to `link` when the element is inside a `<table>`. Browsers and screen readers treat the role attribute as invalid and fall back to `row`, meaning keyboard users do not get `link` semantics. The `tabIndex: 0` and `onKeyDown` handler still work mechanically, but the announced role is misleading. This is a shared utility already in production, not introduced in phase 32, but it is exercised by the table rendered on the dashboard page.

**Fix:** Either remove `role="link"` from the `<tr>` (relying on the keyboard handler alone) or restructure so each row contains an actual anchor `<a>` that stretches across all cells:
```ts
// Minimal fix — drop the invalid role override
return {
  tabIndex: 0,
  onClick: ...,
  onKeyDown: ...,
  // no role: "link"
};
```

---

### IN-02: `getAdminDashboardStats` failure crashes the entire dashboard with no error boundary

**File:** `src/app/(admin)/admin/page.tsx:9`
**Issue:** `await getAdminDashboardStats()` is called at the top level of the server component with no `try/catch`. If any of the four `Promise.all` DB calls fails (e.g., network blip, Prisma connection timeout), Next.js propagates an unhandled error. There is no `error.tsx` in `src/app/(admin)/admin/` or its parent route groups, so the error bubbles up to the root error boundary or renders a blank 500 page. Admins get no actionable feedback.

**Fix:** Add an `error.tsx` file next to `page.tsx`, or wrap the fetch in a try/catch and render a graceful fallback:
```tsx
// src/app/(admin)/admin/error.tsx
"use client";
export default function AdminDashboardError({ reset }: { reset: () => void }) {
  return (
    <div className="space-y-4">
      <p className="text-sm text-destructive">Не вдалося завантажити статистику.</p>
      <button onClick={reset} className="text-sm underline">Спробувати знову</button>
    </div>
  );
}
```

---

_Reviewed: 2026-05-20T13:43:59Z_
_Reviewer: Claude (gsd-code-reviewer)_
_Depth: standard_
