# Phase 53: Admin Product Search - Pattern Map

**Mapped:** 2026-05-28
**Files analyzed:** 3 new/modified files
**Analogs found:** 3 / 3

---

## File Classification

| New/Modified File | Role | Data Flow | Closest Analog | Match Quality |
|-------------------|------|-----------|----------------|---------------|
| `src/components/admin/product-search-input.tsx` | component | request-response (client→URL→SSR) | `src/components/catalog/catalog-toolbar.tsx` | role-match (same debounce+router pattern; admin uses router.replace instead of nuqs) |
| `src/components/admin/product-search-input.test.tsx` | test | — | `src/components/admin/order-list-status-select.test.tsx` | exact (jsdom, router mock, waitFor, fireEvent) |
| `src/app/(admin)/admin/tovary/page.tsx` | route (server component) | request-response | itself — modification only; pattern already present | exact (already receives filters.q, passes to table and pagination) |

---

## Pattern Assignments

### `src/components/admin/product-search-input.tsx` (component, request-response)

**Analog:** `src/components/catalog/catalog-toolbar.tsx` (debounce + router pattern)
**Debounce ref analog:** `src/hooks/admin/use-product-auto-save.ts` (createDebounce + useRef)

**Key divergence from catalog-toolbar:** catalog-toolbar uses `nuqs` `useQueryStates` + inline `setTimeout`. The admin component MUST use `useRef(createDebounce(...))` + `router.replace` + `adminProductsUrl`. Zero nuqs in admin.

**Imports pattern** (`catalog-toolbar.tsx` lines 1–16 + admin validator types):
```typescript
"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { createDebounce } from "@/lib/debounce";
import { adminProductsUrl } from "@/lib/admin/products-url";
import type { AdminPageSize } from "@/lib/pagination";
import type {
  AdminProductListDir,
  AdminProductListSort,
  AdminProductStockFilter,
} from "@/server/validators/admin-product";
```

**Props type** (derived from `product-list-filters.tsx` lines 17–26 — same filter shape, plus `q`):
```typescript
type ProductSearchInputProps = {
  q?: string;
  stock?: AdminProductStockFilter;
  categoryId?: string;
  pageSize: AdminPageSize;
  sort?: AdminProductListSort;
  dir?: AdminProductListDir;
};
```

**Debounce ref pattern** (`use-product-auto-save.ts` lines 46, 112–115):
```typescript
const debounceRef = useRef(createDebounce(DEBOUNCE_MS));

useEffect(() => {
  debounceRef.current(() => {
    runSave();  // ← replace with startTransition(() => router.replace(...))
  });
}, [enabled, serializedWatch, runSave]);
```

**Core component pattern** — combine catalog-toolbar's local state + useEffect sync + startTransition with the admin router.replace + adminProductsUrl approach:
```typescript
const DEBOUNCE_MS = 300;

export function ProductSearchInput({ q, stock, categoryId, pageSize, sort, dir }: ProductSearchInputProps) {
  const router = useRouter();
  const [value, setValue] = useState(q ?? "");
  const [isPending, startTransition] = useTransition();
  const debounceRef = useRef(createDebounce(DEBOUNCE_MS));

  // Sync local value when URL q changes (e.g., browser back/forward)
  useEffect(() => { setValue(q ?? ""); }, [q]);

  useEffect(() => {
    debounceRef.current(() => {
      startTransition(() => {
        router.replace(
          adminProductsUrl({ q: value || undefined, stock, categoryId, pageSize, sort, dir, page: 1 }),
          { scroll: false },
        );
      });
    });
  }, [value, stock, categoryId, pageSize, sort, dir, router]);

  return (
    <div className="relative">
      <label htmlFor="admin-product-search" className="sr-only">Пошук товарів</label>
      <Search
        className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
        aria-hidden
      />
      <Input
        id="admin-product-search"
        type="search"
        placeholder="Назва або бренд…"
        className="pl-9"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        aria-busy={isPending}
      />
    </div>
  );
}
```

**Search icon + sr-only label pattern** (`catalog-toolbar.tsx` lines 50–53):
```tsx
<label htmlFor="catalog-search" className="sr-only">
  Пошук товарів
</label>
<Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
```

**Input component** (`src/components/ui/input.tsx` lines 1–20) — wraps `@base-ui/react/input`:
```typescript
import { Input as InputPrimitive } from "@base-ui/react/input"
// spreads all standard input props; className merges via cn()
// pass className="pl-9" for left icon padding
// aria-busy accepted as a standard HTML attribute via ...props spread
```

---

### `src/components/admin/product-search-input.test.tsx` (test, unit/jsdom)

**Analog:** `src/components/admin/order-list-status-select.test.tsx` (lines 1–26 for setup; lines 64–146 for test structure)

**File header + environment directive** (`order-list-status-select.test.tsx` lines 1–4):
```typescript
/** @vitest-environment jsdom */
import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
```

**Router mock pattern** (`product-list-delete-button.test.tsx` lines 6–8, `order-list-status-select.test.tsx` lines 15–17):
```typescript
vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace: vi.fn() }),
}));
```
Note: the existing analogs mock `refresh: vi.fn()` because they test refresh-based flows. For `ProductSearchInput`, mock `replace: vi.fn()` instead.

**Test structure** (`order-list-status-select.test.tsx` lines 64–68, `product-list-delete-button.test.tsx` lines 18–36):
```typescript
describe("ProductSearchInput", () => {
  afterEach(() => { cleanup(); });

  it("renders input with placeholder (ADM-SRCH-01)", () => {
    render(<ProductSearchInput pageSize={20} />);
    expect(screen.getByPlaceholderText("Назва або бренд…")).toBeTruthy();
  });

  it("debounces router.replace with q param after typing (ADM-SRCH-01)", async () => {
    // use vi.useFakeTimers() to control 300ms debounce
    // fireEvent.change on input, then vi.advanceTimersByTime(300)
    // expect router.replace called with URL containing q=...
  });
});
```

**Fake timer pattern** — for debounce tests in jsdom, use `vi.useFakeTimers()` / `vi.advanceTimersByTime(300)` / `vi.useRealTimers()`. This is the standard Vitest approach since the project uses Vitest 4.1.6.

---

### `src/app/(admin)/admin/tovary/page.tsx` (route modification — server component)

**This file already exists.** The only change is inserting `<ProductSearchInput>` above `<ProductListFilters>`.

**Existing insertion point** (`tovary/page.tsx` lines 68–89):
```tsx
// BEFORE (line 78):
<ProductListFilters
  categories={...}
  activeStock={filters.stock}
  activeCategoryId={filters.categoryId}
  pageSize={filters.pageSize}
  sort={filters.sort}
  dir={filters.dir}
  counts={filterCounts}
/>

// AFTER — insert ProductSearchInput above ProductListFilters:
<ProductSearchInput
  q={filters.q}
  stock={filters.stock}
  categoryId={filters.categoryId}
  pageSize={filters.pageSize}
  sort={filters.sort}
  dir={filters.dir}
/>
<ProductListFilters ... />
```

**Import addition** (copy pattern from line 5 of `tovary/page.tsx`):
```typescript
import { ProductSearchInput } from "@/components/admin/product-search-input";
```

**Existing filters.q already available** (`tovary/page.tsx` lines 35–49):
```typescript
function parseListFilters(params): ListAdminProductsFilters {
  return listAdminProductsSchema.parse({
    page: params.page,
    pageSize: params.pageSize,
    stock,
    categoryId: params.categoryId,
    q: params.q,       // ← already parsed and available as filters.q
    sort: params.sort,
    dir: params.dir,
  });
}
```
No changes to the parsing logic. `filters.q` is ready to pass as a prop.

---

## Shared Patterns

### Admin URL serialisation
**Source:** `src/lib/admin/products-url.ts` lines 24–51
**Apply to:** `product-search-input.tsx`

`adminProductsUrl` accepts all 7 params including `q`. Passing `q: value || undefined` omits the param from the URL when the input is empty (the function checks `params.q != null && params.q.trim() !== ""`). Always pass `page: 1` alongside `q` to reset pagination.

### createDebounce + useRef stable instance
**Source:** `src/hooks/admin/use-product-auto-save.ts` line 46; `src/lib/debounce.ts`
**Apply to:** `product-search-input.tsx`

```typescript
// Correct — stable across renders:
const debounceRef = useRef(createDebounce(DEBOUNCE_MS));
// Call as: debounceRef.current(() => { ... });

// Wrong — new instance on every render, breaks timer:
const debounce = createDebounce(DEBOUNCE_MS); // inside component body
```

### router.replace with scroll:false
**Source:** `src/components/catalog/catalog-toolbar.tsx` pattern + Next.js 16.2.6 docs (verified)
**Apply to:** `product-search-input.tsx`

```typescript
router.replace(url, { scroll: false });
// scroll: false prevents page jumping to top on each debounced navigation.
// Without it, the search input visually jumps away on every keystroke.
```

### useTransition for non-urgent navigation
**Source:** `catalog-toolbar.tsx` lines 28, 37–39
**Apply to:** `product-search-input.tsx`

```typescript
const [isPending, startTransition] = useTransition();
// Wrap router.replace inside startTransition for React 19 concurrent scheduling.
// isPending can drive aria-busy on the Input for a11y.
```

### Admin component file location
**Source:** `src/components/admin/` directory (product-list-filters.tsx, admin-products-table.tsx, products-list-pagination.tsx)
**Apply to:** `product-search-input.tsx`, `product-search-input.test.tsx`

All admin UI components live flat in `src/components/admin/`. No sub-directories. Filename uses kebab-case.

---

## No Analog Found

All files have close analogs in the codebase. No entries in this section.

---

## Metadata

**Analog search scope:** `src/components/admin/`, `src/components/catalog/`, `src/hooks/admin/`, `src/lib/admin/`, `src/app/(admin)/admin/tovary/`, `src/components/ui/`, `src/lib/`
**Files scanned:** 9 (catalog-toolbar.tsx, use-product-auto-save.ts, tovary/page.tsx, product-list-filters.tsx, product-list-delete-button.test.tsx, order-list-status-select.test.tsx, input.tsx, debounce.ts, products-url.ts)
**Pattern extraction date:** 2026-05-28
