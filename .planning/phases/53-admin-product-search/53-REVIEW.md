---
phase: 53-admin-product-search
reviewed: 2026-05-28T00:00:00Z
depth: standard
files_reviewed: 6
files_reviewed_list:
  - src/app/(admin)/admin/tovary/page.tsx
  - src/components/admin/product-search-input.tsx
  - src/components/admin/product-search-input.test.tsx
  - src/lib/admin/products-url.ts
  - src/lib/admin/products-url.test.ts
  - src/server/services/admin-product.service.test.ts
findings:
  critical: 1
  warning: 2
  info: 2
  total: 5
status: issues_found
---

# Phase 53: Code Review Report

**Reviewed:** 2026-05-28T00:00:00Z
**Depth:** standard
**Files Reviewed:** 6
**Status:** issues_found

## Summary

Reviewed the admin product search feature: a server-rendered page, a debounced client search input, a URL builder utility, and unit tests for the URL builder and service layer. The service implementation and URL builder are correct. One critical bug exists in `ProductSearchInput`: the debounce effect fires unconditionally on every mount, causing a spurious `router.replace` after 300 ms that resets pagination to page 1 whenever a user navigates to any page other than the first. Two warnings cover a dead constant and the absence of a test case proving the absence of that spurious navigation.

---

## Critical Issues

### CR-01: `ProductSearchInput` fires `router.replace` on every mount, destroying paginated navigation

**File:** `src/components/admin/product-search-input.tsx:44-61`

**Issue:**

The second `useEffect` — which schedules `router.replace` via the debounce — lists `value` in its dependency array but has no "skip on first render" guard. Because `value` is initialised from `q` via `useState(q ?? "")`, the effect is considered "changed" relative to the React baseline on every mount, so it always schedules a replacement navigation 300 ms after the component mounts.

Concrete failure scenario:
1. User navigates to `/admin/tovary?q=Samsung&page=3`.
2. Server renders `ProductSearchInput` with `q="Samsung"`.
3. Component mounts; `value` is initialised to `"Samsung"`.
4. The debounce effect fires immediately on mount and schedules `router.replace` for t + 300 ms.
5. No user interaction occurs.
6. 300 ms elapse; `router.replace("/admin/tovary?q=Samsung&page=1", { scroll: false })` executes.
7. The user is silently bounced from page 3 to page 1.

The same race occurs with the empty-query case: mounting on a filtered page causes an extra navigation to `page=1` before the user has typed anything.

**Fix:**

Add a mount-guard ref and skip the debounce on the initial render:

```tsx
const isMountedRef = useRef(false);

// Mark as mounted after first render
useEffect(() => {
  isMountedRef.current = true;
}, []);

useEffect(() => {
  if (!isMountedRef.current) return; // skip the initial synchronous fire

  debounceRef.current(() => {
    startTransition(() => {
      router.replace(
        adminProductsUrl({
          q: value || undefined,
          stock,
          categoryId,
          pageSize,
          sort,
          dir,
          page: 1,
        }),
        { scroll: false },
      );
    });
  });
}, [value, stock, categoryId, pageSize, sort, dir, router]);
```

Alternatively, initialise `isMountedRef.current = false` and set it `true` inside the first effect's cleanup (the `[]`-dep effect).

---

## Warnings

### WR-01: `DEFAULT_PAGE` constant is declared but never used

**File:** `src/lib/admin/products-url.ts:10`

**Issue:**

`const DEFAULT_PAGE = 1;` is declared at module scope but is never referenced anywhere in the file. The related constant `DEFAULT_PAGE_SIZE` is used on line 39 and `DEFAULT_DIR` on line 45, so `DEFAULT_PAGE` appears to have been intended as a companion but was forgotten.

**Fix:**

Either use it in the page-omission guard (if there is ever logic to omit the default page from the URL) or delete it:

```ts
// Remove this line:
const DEFAULT_PAGE = 1;
```

If the intent was to omit `page=1` from URLs as a default (analogous to how `DEFAULT_PAGE_SIZE` and `DEFAULT_DIR` are omitted), that would be a separate design decision; for now, the constant is dead code.

---

### WR-02: No test verifies that `ProductSearchInput` does NOT navigate on mount without user input

**File:** `src/components/admin/product-search-input.test.tsx`

**Issue:**

The test suite covers typing, debouncing, clearing, page-reset on new input, and prop-sync. It does not include a case that mounts the component, advances fake timers by 300 ms without any `fireEvent`, and asserts that `mockReplace` was **not** called.

Because that test is missing, the critical mount-navigation bug (CR-01) is undetected by the test suite. A passing test suite is not evidence of correctness here.

**Fix:**

Add a test:

```tsx
it("does NOT call router.replace on mount without user input (ADM-SRCH-NOMOUNT)", () => {
  render(<ProductSearchInput q="Samsung" pageSize={20} />);
  vi.advanceTimersByTime(300);
  expect(mockReplace).not.toHaveBeenCalled();
});
```

This test will fail until CR-01 is fixed, making the relationship explicit.

---

## Info

### IN-01: Two `products-url.test.ts` test descriptions overlap and create confusion

**File:** `src/lib/admin/products-url.test.ts:21,33`

**Issue:**

Two test cases both describe the `page: 1` explicit-reset behaviour with nearly identical names:
- Line 21: `"includes page when page is 1 (explicit reset)"`
- Line 33: `"includes page=1 when page is 1 (explicit reset to first page)"`

The only material difference is `pageSize: 50` vs `pageSize: 20`. The duplicate phrasing makes it harder to identify which scenario failed when one breaks.

**Fix:**

Rename to distinguish the pageSize variant:

```ts
it("includes page=1 with non-default pageSize=50", () => { ... })
it("includes page=1 and omits default pageSize=20", () => { ... })
```

---

### IN-02: `getProductFilterCounts` receives `filters.stock ?? ""` but the type mismatch is silent

**File:** `src/app/(admin)/admin/tovary/page.tsx:65`

**Issue:**

`filters.stock` is typed `AdminProductStockFilter | undefined` (`"in_stock" | "out_of_stock" | undefined`). The call site coerces `undefined` to `""` via `?? ""` to satisfy `ProductStockFilterKey` (`"" | "in_stock" | "out_of_stock"`). This works correctly at runtime, but the two types are defined in different locations with no shared source of truth. If `ProductStockFilterKey` or `AdminProductStockFilter` diverges in the future, the compiler will not catch it because `""` is not part of the validator-derived type — it is injected manually at the call site.

**Fix:**

Prefer passing `undefined` directly and updating `getProductFilterCounts` to accept `AdminProductStockFilter | undefined`:

```ts
// In admin-product.service.ts, change the signature:
export async function getProductFilterCounts(
  categoryIds: string[],
  activeCategoryId?: string,
  activeStock?: AdminProductStockFilter,   // instead of ProductStockFilterKey
): Promise<ProductFilterCounts>
```

Then at the call site:

```ts
getProductFilterCounts(
  categoryIds,
  filters.categoryId,
  filters.stock,   // no ?? "" needed
),
```

The `""` sentinel can be eliminated inside the function by treating `undefined` as "no filter".

---

_Reviewed: 2026-05-28T00:00:00Z_
_Reviewer: Claude (gsd-code-reviewer)_
_Depth: standard_
