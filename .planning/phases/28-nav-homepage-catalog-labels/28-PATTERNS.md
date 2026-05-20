# Phase 28: Nav, homepage & catalog labels - Pattern Map

**Mapped:** 2026-05-20
**Files analyzed:** 12 (create/modify from CONTEXT canonical_refs)
**Analogs found:** 10 / 12

## File Classification

| New/Modified File | Role | Data Flow | Closest Analog | Match Quality |
|-------------------|------|-----------|----------------|---------------|
| `src/components/layout/storefront-auth-links.tsx` | component | request-response | `src/components/layout/store-header-auth.tsx` | exact (extract target) |
| `src/components/layout/store-header-auth.tsx` | component | request-response | `src/components/layout/store-header-auth.tsx` | exact (thin wrapper after extract) |
| `src/components/layout/store-mobile-nav.tsx` | component | request-response | `src/components/layout/store-mobile-nav.tsx` | exact (extend drawer shell) |
| `src/components/layout/store-header.tsx` | component | request-response | `src/components/layout/store-header.tsx` | exact (session + categories pass-through) |
| `src/components/home/category-grid.tsx` | component | CRUD | `src/components/layout/store-mobile-nav.tsx` + `src/components/catalog/catalog-filters.tsx` | role-match (badge + RSC counts) |
| `src/app/globals.css` | config | transform | — | no analog (new CSS scope) |
| `src/lib/catalog/catalog-labels.ts` | utility | transform | `src/lib/catalog/catalog-labels.ts` | exact |
| `src/lib/catalog/catalog-labels.test.ts` | test | transform | `src/lib/catalog/catalog-labels.test.ts` | exact |
| `src/components/catalog/catalog-toolbar.tsx` | component | request-response | `src/components/catalog/catalog-toolbar.tsx` | exact (dedupe labels) |
| `src/lib/catalog/format.ts` | utility | transform | `src/lib/catalog/format.ts` | role-match (`pluralResultsUa` reference) |
| `src/lib/catalog/format.test.ts` | test | transform | `src/lib/catalog/catalog-labels.test.ts` | role-match (pure fn tests) |
| `src/components/layout/store-mobile-nav.test.tsx` | test | request-response | `src/components/layout/store-mobile-nav.test.tsx` | exact |

**Reference-only (no Phase 28 edits expected):** `hero-section.tsx`, `(storefront)/layout.tsx`, `search-params.ts`, `categories.ts`, `catalog.service.ts`

## Pattern Assignments

### `src/components/layout/storefront-auth-links.tsx` (component, request-response) — NEW

**Analog:** `src/components/layout/store-header-auth.tsx`

**Imports pattern** (lines 1-6):

```typescript
"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
```

**Shared link classes** (lines 8-9):

```typescript
const linkClass =
  "inline-flex min-h-11 min-w-11 items-center justify-center rounded-md px-2 text-sm font-medium hover:bg-muted";
```

**Signed-in block** (lines 20-39):

```typescript
if (session?.user) {
  return (
    <div className="flex items-center gap-1">
      <Link href="/kabinet" className={linkClass}>
        Кабінет
      </Link>
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="min-h-11"
        onClick={async () => {
          await authClient.signOut();
          router.push("/");
          router.refresh();
        }}
      >
        Вийти
      </Button>
    </div>
  );
}
```

**Guest block** (lines 43-55):

```typescript
return (
  <div className="flex items-center">
    <Link href="/uviity" className={linkClass}>
      Увійти
    </Link>
    <Link
      href="/reiestratsiia"
      className={`${linkClass} bg-primary text-primary-foreground hover:bg-primary/90`}
    >
      Реєстрація
    </Link>
  </div>
);
```

**Session prop type** (lines 11-15):

```typescript
type StoreHeaderAuthProps = {
  session: {
    user: { name: string; email: string };
  } | null;
};
```

**Planner note:** Export as `StorefrontAuthLinks` with same `session` type. Optional `className` on root `div` for drawer vertical stack (`flex-col gap-2 w-full`) — header keeps `flex items-center`; do not change routes or sign-out flow.

---

### `src/components/layout/store-header-auth.tsx` (component, request-response) — MODIFY

**Analog:** `src/components/layout/store-header-auth.tsx` (post-extract thin wrapper)

**Target pattern:** Re-export layout wrapper only:

```typescript
export function StoreHeaderAuth({ session }: StorefrontAuthLinksProps) {
  return <StorefrontAuthLinks session={session} />;
}
```

Keep file as client component boundary for header; all markup lives in shared child.

---

### `src/components/layout/store-mobile-nav.tsx` (component, request-response) — MODIFY

**Analog:** `src/components/layout/store-mobile-nav.tsx` (drawer shell) + `store-header-auth.tsx` (auth block)

**Client + sheet shell** (lines 1-17, 37-48):

```typescript
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
// ...
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
```

**Close on route change** (lines 33-35):

```typescript
useEffect(() => {
  setOpen(false);
}, [pathname]);
```

**Category row + count badge** (lines 49-66) — keep numeric-only for all counts (Phase 26; differs from homepage D-13):

```typescript
<ul className="mt-4 flex flex-col gap-2 px-4">
  {categories.map((category) => (
    <li key={category.slug}>
      <Link
        href={`/katalog/${category.slug}`}
        className="flex min-h-11 w-full items-center gap-3 py-2 text-sm"
        onClick={() => setOpen(false)}
      >
        <span>{category.name}</span>
        <Badge
          variant="secondary"
          className="shrink-0 tabular-nums text-muted-foreground"
        >
          {category.productCount ?? 0}
        </Badge>
      </Link>
    </li>
  ))}
</ul>
```

**Separator + callback (locked order D-01)** (lines 68-71):

```typescript
<Separator className="my-6" />
<div className="px-4">
  <CallbackRequestForm compact idPrefix="drawer" />
</div>
```

**Add after callback (new — mirror CONTEXT D-01):**

```tsx
<Separator className="my-6" />
<div className="px-4 pb-4">
  <StorefrontAuthLinks session={session} />
</div>
```

**Props extension** — mirror `StoreHeaderAuth` session type; categories type unchanged:

```typescript
export function StoreMobileNav({
  categories,
  session,
}: {
  categories: MobileNavCategory[];
  session: { user: { name: string; email: string } } | null;
}) {
```

---

### `src/components/layout/store-header.tsx` (component, request-response) — MODIFY

**Analog:** `src/components/layout/store-header.tsx`

**Session fetch in RSC header** (lines 13-19):

```typescript
export async function StoreHeader() {
  const session = await auth.api.getSession({ headers: await headers() });
  const { categories: categoriesWithCounts } =
    await listCategoriesWithProductCounts();
  const availableCategories =
    categoriesWithAvailableProducts(categoriesWithCounts);
```

**Pass session to mobile nav** — extend existing `StoreMobileNav` call (line 47):

```typescript
<StoreMobileNav categories={availableCategories} session={session} />
```

**Auth remains in header** (line 61) — do not remove `StoreHeaderAuth` (D-06):

```typescript
<StoreHeaderAuth session={session} />
```

---

### `src/components/home/category-grid.tsx` (component, CRUD) — MODIFY

**Analog:** `src/components/home/category-grid.tsx` (RSC pipeline) + `store-mobile-nav.tsx` (Badge) + `catalog-filters.tsx` (title + count row)

**RSC count pipeline** (lines 13-16) — unchanged:

```typescript
export async function CategoryGrid() {
  const { categories: categoriesWithCounts } =
    await listCategoriesWithProductCounts();
  const categories = categoriesWithAvailableProducts(categoriesWithCounts);
```

**Section anchor** (line 23) — add scroll-margin via CSS on `#kategorii`, not inline:

```typescript
<section id="kategorii" className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
```

**Card title row + badge** — adapt flex pattern from `catalog-filters.tsx` (lines 207-216) and drawer Badge classes:

```tsx
import { Badge } from "@/components/ui/badge";
import { formatCategoryCountBadge } from "@/lib/catalog/format";

<CardHeader>
  <div className="flex min-w-0 items-center gap-2">
    <CardTitle className="truncate text-base">{category.name}</CardTitle>
    <Badge
      variant="secondary"
      className="shrink-0 tabular-nums text-muted-foreground"
    >
      {formatCategoryCountBadge(category.productCount)}
    </Badge>
  </div>
  <CardDescription>Переглянути</CardDescription>
</CardHeader>
```

Keep `CardDescription` «Переглянути» (D-15). Do not use `pluralResultsUa` for badges — full phrase violates D-13.

---

### `src/app/globals.css` (config, transform) — MODIFY

**Analog:** None in repo (see No Analog Found). **Reference:** RESEARCH.md Pattern 2 + `28-UI-SPEC.md` (4.5rem header offset).

**Placement:** Append after `@layer base` block (ends ~line 129) — project has no other `scroll-behavior` rules.

**Target CSS:**

```css
html:has(#main-content) {
  scroll-behavior: smooth;
}

@media (prefers-reduced-motion: reduce) {
  html:has(#main-content) {
    scroll-behavior: auto;
  }
}

#kategorii {
  scroll-margin-top: 4.5rem; /* or var(--store-header-offset, 4.5rem) in :root */
}
```

**Scope verification:** Storefront `main#main-content` in `src/app/(storefront)/layout.tsx` (lines 19-20). Admin layout has no `#main-content` (`src/app/(admin)/admin/layout.tsx`).

---

### `src/lib/catalog/catalog-labels.ts` (utility, transform) — MODIFY

**Analog:** `src/lib/catalog/catalog-labels.ts`

**Label map + accessor** (lines 5-9, 27-29):

```typescript
export const CATALOG_SORT_LABELS = {
  novi: "Новіші",
  "cina-asc": "Ціна ↑",
  "cina-desc": "Ціна ↓",
} as const;

export type CatalogSortValue = keyof typeof CATALOG_SORT_LABELS;

export function catalogSortLabel(sort: CatalogSortValue): string {
  return CATALOG_SORT_LABELS[sort];
}
```

**Target values (CONTEXT D-16):** `novi` → «Найновіші», `cina-asc` → «Дешевше», `cina-desc` → «Дорожче». Do not touch `ALL_BRANDS_VALUE` / brand helpers.

---

### `src/lib/catalog/catalog-labels.test.ts` (test) — MODIFY

**Analog:** `src/lib/catalog/catalog-labels.test.ts`

**Existing sort label test** (lines 16-19):

```typescript
it("returns Ukrainian sort labels", () => {
  expect(catalogSortLabel("novi")).toBe("Новіші");
  expect(catalogSortLabel("cina-asc")).toBe("Ціна ↑");
});
```

**Update expectations** to all three keys including `cina-desc` → «Дорожче».

---

### `src/components/catalog/catalog-toolbar.tsx` (component, request-response) — MODIFY

**Analog:** `src/components/catalog/catalog-toolbar.tsx` (partial — `SelectValue` already correct)

**nuqs + sort state** (lines 71-79):

```typescript
<Select
  value={params.sort}
  onValueChange={(value) => {
    if (!value) return;
    setParams({
      sort: value as "novi" | "cina-asc" | "cina-desc",
      storinka: 1,
    });
  }}
>
```

**SelectValue uses central labels** (lines 81-84) — keep:

```typescript
<SelectValue placeholder="Сортування">
  {catalogSortLabel(params.sort as CatalogSortValue)}
</SelectValue>
```

**Fix duplicate hardcoded items** (lines 87-89) — replace with map:

```tsx
<SelectContent>
  {(["novi", "cina-asc", "cina-desc"] as const).map((value) => (
    <SelectItem key={value} value={value}>
      {catalogSortLabel(value)}
    </SelectItem>
  ))}
</SelectContent>
```

Sort enum keys stay in `search-params.ts` (lines 17-18) — unchanged.

---

### `src/lib/catalog/format.ts` (utility, transform) — MODIFY (optional helper)

**Analog:** `src/lib/catalog/format.ts` (`pluralResultsUa` for UA copy rules)

**Reference plural helper** (lines 18-26) — do not reuse for homepage badge:

```typescript
export function pluralResultsUa(count: number): string {
  const mod10 = count % 10;
  const mod100 = count % 100;
  if (mod10 === 1 && mod100 !== 11) return `${count} товар`;
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 10 || mod100 >= 20)) {
    return `${count} товари`;
  }
  return `${count} товарів`;
}
```

**New hybrid helper (D-13):**

```typescript
export function formatCategoryCountBadge(count: number): string {
  if (count === 1) return "1 товар";
  return String(count);
}
```

---

### `src/lib/catalog/format.test.ts` (test) — NEW (if helper extracted)

**Analog:** `src/lib/catalog/catalog-labels.test.ts`

**Vitest structure:**

```typescript
import { describe, expect, it } from "vitest";
import { formatCategoryCountBadge } from "./format";

describe("formatCategoryCountBadge", () => {
  it("returns singular phrase for 1", () => {
    expect(formatCategoryCountBadge(1)).toBe("1 товар");
  });
  it("returns digits only for 2+", () => {
    expect(formatCategoryCountBadge(12)).toBe("12");
  });
});
```

---

### `src/components/layout/store-mobile-nav.test.tsx` (test) — MODIFY

**Analog:** `src/components/layout/store-mobile-nav.test.tsx`

**Setup** (lines 1-16):

```typescript
/** @vitest-environment jsdom */
vi.mock("next/navigation", () => ({
  usePathname: () => "/",
}));
vi.mock("@/server/actions/callback.actions", () => ({
  submitCallbackRequestAction: vi.fn(),
}));
```

**Open drawer + assert counts** (lines 19-36):

```typescript
fireEvent.click(screen.getByRole("button", { name: "Меню" }));
expect(screen.getByText("3")).toBeDefined();
```

**Extend:** pass `session: null` → `getByRole("link", { name: "Увійти" })`, `getByRole("link", { name: "Реєстрація" })`; pass mock session → «Кабінет», «Вийти» button. Mock `authClient.signOut` if testing sign-out (optional).

---

## Shared Patterns

### Server session snapshot → client children

**Source:** `src/components/layout/store-header.tsx` (lines 14, 47, 61)
**Apply to:** `StoreMobileNav`, `StoreHeaderAuth`, `StorefrontAuthLinks`

```typescript
const session = await auth.api.getSession({ headers: await headers() });
// ...
<StoreMobileNav categories={availableCategories} session={session} />
<StoreHeaderAuth session={session} />
```

### Category availability filter

**Source:** `src/lib/catalog/categories.ts` (lines 1-6)
**Apply to:** `store-header.tsx`, `category-grid.tsx` (already used)

```typescript
export function categoriesWithAvailableProducts<
  T extends { productCount: number },
>(categories: T[]): T[] {
  return categories.filter((category) => category.productCount > 0);
}
```

### Product counts from catalog service

**Source:** `src/server/services/catalog.service.ts` (lines 204-220)
**Apply to:** Header, drawer, homepage grid

```typescript
productCount: counts.byCategoryId[category.id] ?? 0,
```

### shadcn Badge for counts

**Source:** `src/components/layout/store-mobile-nav.tsx` (lines 58-63)
**Apply to:** Drawer (numeric), homepage cards (hybrid via formatter)

```tsx
<Badge
  variant="secondary"
  className="shrink-0 tabular-nums text-muted-foreground"
>
  {count}
</Badge>
```

### Centralized Ukrainian catalog copy

**Source:** `src/lib/catalog/catalog-labels.ts`
**Apply to:** `catalog-toolbar.tsx` — always `catalogSortLabel()`, never duplicate strings in JSX.

### Vitest pure-function tests in `src/lib/catalog/`

**Source:** `src/lib/catalog/catalog-labels.test.ts`, `categories.test.ts`
**Apply to:** `catalog-labels.test.ts` updates, new `format.test.ts`

---

## No Analog Found

| File | Role | Data Flow | Reason |
|------|------|-----------|--------|
| `src/app/globals.css` (smooth scroll section) | config | transform | No `scroll-behavior`, `scroll-margin-top`, or `html:has()` in codebase; use RESEARCH Pattern 2 + UI-SPEC 4.5rem |

## Metadata

**Analog search scope:** `src/components/layout/`, `src/components/home/`, `src/components/catalog/`, `src/lib/catalog/`, `src/app/globals.css`, `src/app/(storefront)/layout.tsx`, `src/server/services/catalog.service.ts`
**Files scanned:** ~18
**Pattern extraction date:** 2026-05-20
