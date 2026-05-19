# Phase 23: Admin category polish — Research

**Researched:** 2026-05-19  
**Status:** Complete

## RESEARCH COMPLETE

## Summary

Small UI-only phase: add Lucide icons to category edit toolbar buttons and replace the count-only «Товарів» column with a «Товари» link cell that filters `/admin/tovary` by `categoryId`. Row-click edit (ADM-CAT-02) must remain intact.

No schema, API, or service changes. `productCount` already flows from `listCategoriesAdmin` → `AdminCategoriesTable`.

## Current architecture

| Surface | File | Today |
|---------|------|-------|
| Edit toolbar | `src/app/(admin)/admin/kategorii/[id]/page.tsx` | Text-only buttons, correct `Link` targets |
| List table | `src/components/admin/admin-categories-table.tsx` | Header «Товарів», cell shows number only |
| List page | `src/app/(admin)/admin/kategorii/page.tsx` | Reference: `Plus` + label on «Додати категорію» |
| Row navigation | `src/lib/admin/clickable-table-row.ts` | `closest("a")` skips row nav; explicit `stopPropagation` still used on products delete |
| Products filter URL | `src/lib/admin/products-url.ts` | `adminProductsUrl({ categoryId })` — use in table link |
| Products list | `src/app/(admin)/admin/tovary/page.tsx` | Already reads `categoryId` searchParam |

## Recommended implementation

### 1. Edit page (`kategorii/[id]/page.tsx`)

- Import `Eye`, `Plus` from `lucide-react`.
- Inside each `Button`, prepend icon: `<Eye className="size-4" aria-hidden />` / `<Plus className="size-4" aria-hidden />` before label text.
- Keep `render={<Link href={...} />}` and existing hrefs (D-03).
- CONTEXT D-01 overrides ROADMAP «aria-label» wording: accessible name = visible Ukrainian text, not icon-only labels.

### 2. List table (`admin-categories-table.tsx`)

- Rename header «Товарів» → «Товари».
- Cell: `Link` from `next/link` with `href={adminProductsUrl({ categoryId: category.id })}`, text «Переглянути», trailing `<span className="text-muted-foreground"> ({category.productCount})</span>`.
- Add `onClick` and `onPointerDown` handlers calling `event.stopPropagation()` (mirror `product-list-delete-button.tsx`).
- Optional: `data-admin-row-interactive` on link wrapper — redundant with `closest("a")` but aligns with clickable-row docs.

### 3. Tests

| Layer | File | Coverage |
|-------|------|----------|
| Unit/component | `src/components/admin/admin-categories-table.test.tsx` (new) | Renders link with `categoryId` query; click link does not call `router.push` row href |
| E2E (optional extend) | `e2e/admin-categories.spec.ts` | After create category, assert «Переглянути» visible on list; edit page buttons have icons (role/name) |

Vitest + RTL if used elsewhere in admin components; follow `product-list-delete-button.test.tsx` for stopPropagation assertion pattern.

## Risks

| Risk | Mitigation |
|------|------------|
| Link click navigates to edit row | stopPropagation + existing `closest("a")` guard |
| Wrong `categoryId` in URL | Use `adminProductsUrl`, assert in test |
| ROADMAP vs CONTEXT on a11y | Follow CONTEXT D-01 (icon + visible label) |

No Prisma migration. No `[BLOCKING]` schema push.

## Validation Architecture

| Property | Value |
|----------|-------|
| Framework | Vitest |
| Quick run | `npx vitest run src/components/admin/admin-categories-table.test.tsx` |
| Full admin slice | `npx vitest run src/components/admin src/lib/admin` |
| E2E | `npx playwright test e2e/admin-categories.spec.ts` |

Per-task: run component test after table changes; run edit page check manually or via e2e if extended.
