# Phase 16 — Research

**Researched:** 2026-05-19  
**Phase:** Shadcn Select Audit & Verify  
**Status:** Complete

## Summary

Phase 16 is a **migration + verify** slice: five confirmed native `<select>` elements in `src/components` become shadcn `Select`; slug and gallery are **verify-only** unless manual pass finds blockers. No schema changes, no new dependencies — `src/components/ui/select.tsx` already installed (Phase 12).

## Grep Baseline (D-16-01, D-16-11)

| File | Field | Pattern today |
|------|-------|---------------|
| `catalog-toolbar.tsx` | sort | native `<select>` + `onChange` → `setParams` |
| `catalog-filters.tsx` | brend | native `<select>`, `value={params.brend ?? ""}`, empty = all brands |
| `product-form.tsx` | categoryId, condition, status | `form.register()` on native selects |

No other `<select` in `src/components` at research time.

## Catalog nuqs (D-16-02, D-16-05, D-16-06)

- Parsers: `src/lib/catalog/search-params.ts` — `sort` enum `novi | cina-asc | cina-desc`; `brend` nullable string.
- **Sort:** `Select value={params.sort}` + `onValueChange={(v) => setParams({ sort: v as typeof params.sort, storinka: 1 })}`.
- **Brand sentinel:** Radix Select disallows empty string as item value. Use constant e.g. `ALL_BRANDS = "__all__"`; `value={params.brend ?? ALL_BRANDS}`; map `__all__` → `brend: null` on change.
- Reset `storinka: 1` on both controls (matches current native behavior).

## Admin product form RHF (D-16-03)

- Replace `register()` on three selects with `Controller` + shadcn Select (same pattern as community RHF + Radix).
- `categoryId` values are string IDs; `condition` / `status` are enums — cast in `onValueChange` to satisfy Zod types.
- Reference: `order-list-status-select.tsx` for `SelectContent` + `SelectItem`; **no** `stopPropagation` needed (not inside clickable table row).

## Slug state (POL-02, D-16-17–20)

- **Product create:** hint already present (`Slug для URL згенерується автоматично…`) — verify copy matches D-16-17; no slug input.
- **Product edit:** read-only `URL: /tovar/{storefrontSlug}` — satisfies immutable slug UI.
- **Category:** `category-form.tsx` has no slug field — OK.
- Backend: `admin-product.service.ts` `createProduct` uses `slugFromName` / `resolveUniqueProductSlug` — no phase changes.

## Gallery (POL-01, D-16-13–16)

- Implementation: `product-gallery.tsx` (Carousel + Dialog) from Phase 2/6.
- Gate: `16-MANUAL-CHECKLIST.md` manual pass; fix only blocking bugs.
- No Playwright in this phase.

## Validation Architecture

| Layer | Tool | Phase use |
|-------|------|-----------|
| Unit | Vitest | Optional catalog URL tests if trivial |
| E2E | Playwright | Existing `public-browse` / catalog specs smoke after select change |
| Manual | Checklist | Gallery scenarios (POL-01) |
| Static | grep + build | `grep '<select' src/components` = 0; `npm run build` |

## Risks

| Risk | Mitigation |
|------|------------|
| Brand sentinel leaks to URL | Map `__all__` only in component; never write to nuqs |
| RHF Select out of sync | `Controller` `field.value` + `field.onChange` |
| Select width regression | D-16-07–09 widths in UI-SPEC |

## RESEARCH COMPLETE
