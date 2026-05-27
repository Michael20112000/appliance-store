# Phase 53: Admin Product Search - Research

**Researched:** 2026-05-28
**Domain:** Next.js App Router admin UI — client-side search input driving URL-based server filtering
**Confidence:** HIGH

---

## Summary

Phase 53 adds a live search field to `/admin/tovary` so the admin can find any product by name without paginating. The entire backend is already implemented: `buildAdminProductWhere` in `admin-product.service.ts` already handles the `q` param with a case-insensitive `OR` over `title`, `brand`, and `description` (minimum 2 characters). The validator (`listAdminProductsSchema`) already accepts `q: z.string().max(100).optional()`. The URL helper (`adminProductsUrl`) already serialises `q`. Pagination already threads `q` through its href builder. Even the page component already passes `q` through to `AdminProductsTable`.

What is completely absent is the **UI entry point**: no search `<Input>` exists on the products page. The only work in this phase is building a `ProductSearchInput` client component that debounces user keystrokes and calls `router.replace` with the updated URL. The storefront catalog has an identical pattern in `catalog-toolbar.tsx` using `nuqs` + `useQueryStates`; the admin side intentionally uses plain `router.push/replace` plus `adminProductsUrl` helpers (all existing admin UI follows this convention — zero use of nuqs in admin components).

**Primary recommendation:** Create `src/components/admin/product-search-input.tsx` — a single `"use client"` component with a controlled `<Input>`, a 300 ms debounce via the existing `createDebounce`, and `router.replace(adminProductsUrl({ q, ...currentFilters }), { scroll: false })`. Wire it above `<ProductListFilters>` in `tovary/page.tsx`. No backend changes. No new packages.

---

## Project Constraints (from CLAUDE.md)

CLAUDE.md references AGENTS.md. Key directive: *"This version [of Next.js] has breaking changes — read the relevant guide in `node_modules/next/dist/docs/` before writing any code."*

Next.js version in use: **16.2.6** (confirmed from `package.json`). This is well beyond the training-data baseline — treat any assumed Next.js API as needing verification against the bundled docs.

Key verified constraint from bundled docs: `useRouter` from `next/navigation` is the correct App Router hook; `router.replace` accepts `(href, { scroll: false })` to suppress scroll-to-top. [VERIFIED: node_modules/next/dist/docs]

---

## Architectural Responsibility Map

| Capability | Primary Tier | Secondary Tier | Rationale |
|------------|-------------|----------------|-----------|
| Search input + debounce | Browser / Client | — | Must be interactive; drives URL state client-side |
| URL serialisation | Browser / Client | — | `adminProductsUrl` already handles this |
| Product filtering (WHERE clause) | Database / Storage | API / Backend | Already in `buildAdminProductWhere` + Prisma |
| Page rendering with filtered results | Frontend Server (SSR) | — | `tovary/page.tsx` is an async Server Component |
| Empty-state display | Frontend Server (SSR) | — | Already handled by conditional in page |

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| ADM-SRCH-01 | Live-пошук товарів через пошукове поле на /admin/tovary | Backend (buildAdminProductWhere + listAdminProductsSchema) fully implemented. UI component is the only missing piece. The 300 ms debounce + router.replace pattern (mirroring catalog-toolbar.tsx) delivers real-time feel without a submit button. |
</phase_requirements>

---

## Standard Stack

### Core (all already in project — no new installs)

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| `next/navigation` `useRouter` | 16.2.6 | `router.replace` to update URL without history entry | App Router standard; used throughout admin components |
| `src/lib/debounce` `createDebounce` | internal | 300–500 ms debounce for keystrokes | Already used in auto-save hooks; has full test coverage |
| `adminProductsUrl` | internal | URL serialisation including `q` param | Already threads `q`; zero change needed |
| `<Input>` | `src/components/ui/input.tsx` | Styled input wrapping `@base-ui/react/input` | Project's standard input component |
| `lucide-react` `<Search>` | ^1.16.0 | Search icon (matches catalog-toolbar pattern) | Already imported there |
| `useTransition` | React 19.2.4 | Mark navigation as non-urgent for `isPending` state | Pattern used in catalog-toolbar and admin components |

### Supporting

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| `nuqs` | 2.8.9 | URL state management | Used for storefront catalog; **do NOT use in admin** — all admin pages use plain `router.push/replace` + URL helpers |

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| `createDebounce` (internal) | `setTimeout` inline | Internal util is already tested and has flush/cancel; use it |
| `router.replace` | `nuqs` `useQueryStates` | nuqs is not used in any admin component; keeping admin consistent matters more than DRY with storefront |
| Controlled `<Input>` + debounce | Uncontrolled form submit | Submit button violates ADM-SRCH-01 (no submit button required) |

**Installation:** No new packages. All dependencies already present.

---

## Package Legitimacy Audit

No new packages are introduced in this phase.

---

## Architecture Patterns

### System Architecture Diagram

```
User types in <ProductSearchInput>
        │
        ▼ (local state update — instant)
[debounce 300 ms resets on each keystroke]
        │
        ▼ (after quiet period)
router.replace(adminProductsUrl({ q, stock, categoryId, sort, dir, page: 1 }))
        │
        ▼ (Next.js App Router — re-fetches Server Component)
tovary/page.tsx (async Server Component)
   └─ parseListFilters(searchParams) → filters.q
   └─ listAdminProducts(filters) → buildAdminProductWhere({ q }) → Prisma OR query
   └─ renders AdminProductsTable | empty-state
```

### Recommended Project Structure

No new directories needed. The component lives alongside other admin components:

```
src/components/admin/
├── product-search-input.tsx      ← NEW
├── product-search-input.test.tsx ← NEW (Wave 0 test stub)
├── product-list-filters.tsx      (existing — unchanged)
├── admin-products-table.tsx      (existing — unchanged)
└── products-list-pagination.tsx  (existing — unchanged)
```

Placement in `tovary/page.tsx`:
```
<h1>Товари</h1>
<Button>Додати</Button>
<ProductSearchInput q={filters.q} ...currentFilters />   ← NEW, above filters
<ProductListFilters ... />
<AdminProductsTable ... />
<ProductsListPagination ... />
```

### Pattern 1: Client Search Input with Debounced URL Update

This is the exact pattern already in `catalog-toolbar.tsx`, adapted for the admin URL helper:

```typescript
// Source: src/components/catalog/catalog-toolbar.tsx (existing codebase)
"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { createDebounce } from "@/lib/debounce";
import { adminProductsUrl } from "@/lib/admin/products-url";
import type { AdminProductStockFilter } from "@/server/validators/admin-product";
import type { AdminPageSize } from "@/lib/pagination";
import type { AdminProductListSort, AdminProductListDir } from "@/server/validators/admin-product";

const DEBOUNCE_MS = 300;

type ProductSearchInputProps = {
  q?: string;
  stock?: AdminProductStockFilter;
  categoryId?: string;
  pageSize: AdminPageSize;
  sort?: AdminProductListSort;
  dir?: AdminProductListDir;
};

export function ProductSearchInput({ q, stock, categoryId, pageSize, sort, dir }: ProductSearchInputProps) {
  const router = useRouter();
  const [value, setValue] = useState(q ?? "");
  const [isPending, startTransition] = useTransition();
  const debounceRef = useRef(createDebounce(DEBOUNCE_MS));

  // Keep local value in sync when server-side q changes (e.g., back/forward)
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
      <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
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

**Key decisions baked into this pattern:**
- `page: 1` always reset on new query (prevents stale pagination)
- `{ scroll: false }` prevents page jumping to top on each keystroke
- `useEffect` sync on `q` prop handles browser back/forward correctly
- `startTransition` marks the navigation as non-urgent (React 19 concurrent)

### Pattern 2: Wire into tovary/page.tsx (Server Component)

The page already has `filters.q` available. Pass it as a prop alongside the other filter state to `ProductSearchInput`. No new data fetching required.

```typescript
// Source: src/app/(admin)/admin/tovary/page.tsx (existing, showing insertion point)
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

### Pattern 3: Empty-State Display

The page already handles empty state:
```typescript
// Source: src/app/(admin)/admin/tovary/page.tsx (existing)
{result.items.length === 0 ? (
  <p className="text-sm text-muted-foreground">
    Товарів не знайдено. Створіть перший товар або змініть фільтри.
  </p>
) : (
  <AdminProductsTable ... />
)}
```

This message already satisfies ADM-SRCH-01 criterion 3 (empty state shown when no matches). No change needed unless UX wants a search-specific message — that is a discretion call.

### Anti-Patterns to Avoid

- **Using nuqs in admin**: nuqs is not used in any admin component. Use `router.replace` + `adminProductsUrl` as all other admin interactive components do.
- **Adding q to ProductListFilters**: The search input is logically separate from category/stock filters. A dedicated component keeps separation clear.
- **Debouncing with inline setTimeout**: `createDebounce` from `@/lib/debounce` has flush/cancel and is already unit-tested. Use it via `useRef` to preserve identity across renders.
- **Skipping `page: 1` reset**: Searching while on page 3 and not resetting to page 1 would show zero results even when matches exist on page 1.
- **Omitting `{ scroll: false }`**: Without it, `router.replace` scrolls the admin to the top on every debounced keystroke, making the input feel broken.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Debounce | Custom `setTimeout` in component body | `createDebounce` from `@/lib/debounce` | Project has a tested, cancellable debounce; ref-stable pattern is established in auto-save hooks |
| URL serialisation with `q` | Manual `URLSearchParams` | `adminProductsUrl` | Already handles all 7 params including `q`; omits defaults cleanly |
| DB search | Prisma `contains` in page component | `buildAdminProductWhere` in service | Already implemented, already tested |
| Input styling | Custom input CSS | `<Input>` from `@/components/ui/input.tsx` | Project's standard; wraps `@base-ui/react/input` with consistent focus-ring and sizing |

---

## Common Pitfalls

### Pitfall 1: Debounce instance recreated on every render
**What goes wrong:** `const debounce = createDebounce(300)` inside a component body creates a new instance on every render, breaking the timer reset.
**Why it happens:** React re-renders; each render gets a fresh debounce with no accumulated state.
**How to avoid:** Store in `useRef`: `const debounceRef = useRef(createDebounce(300))`. The auto-save hooks (`use-product-auto-save.ts`) already do this — follow that pattern.
**Warning signs:** Search fires on every keystroke with no delay.

### Pitfall 2: Forgetting `page: 1` on query change
**What goes wrong:** Admin types "Samsung", gets page 3 (empty), sees empty state even though matches exist on pages 1–2.
**Why it happens:** The pagination state is independent of the query in the URL.
**How to avoid:** Always pass `page: 1` to `adminProductsUrl` when `q` changes.
**Warning signs:** Empty list when there should be matches; pagination shows "page 3 of 2".

### Pitfall 3: `q` prop not synced back from URL on back/forward
**What goes wrong:** User searches "Samsung", navigates to a product, presses Back — the search input shows `q=""` but the URL still has `q=Samsung`, so input and list are out of sync.
**Why it happens:** Local `useState` initialised once from prop; subsequent prop changes don't update it without a `useEffect`.
**How to avoid:** `useEffect(() => { setValue(q ?? ""); }, [q])`.
**Warning signs:** Input shows stale value after browser back/forward.

### Pitfall 4: `buildAdminProductWhere` minimum-length guard
**What goes wrong:** Searching a single character returns no results even though products match.
**Why it happens:** `buildAdminProductWhere` only activates the OR clause when `q.length >= 2`. This is intentional (avoids extremely broad queries) but must be communicated in UI.
**How to avoid:** Do not change the service. Optionally add a placeholder hint "Мінімум 2 символи" or leave as-is — single characters simply return unfiltered results (the `q` is ignored server-side, so the full list shows, which is acceptable).
**Warning signs:** User types one char, expects filtering, sees full list.

### Pitfall 5: Missing `{ scroll: false }` on router.replace
**What goes wrong:** Page scrolls to top on every debounced navigation, making the search field visually jump away.
**Why it happens:** Default Next.js navigation scrolls to top.
**How to avoid:** `router.replace(url, { scroll: false })`.
**Warning signs:** Page jumps to top after each debounce fires.

---

## Code Examples

### Existing backend — already complete [VERIFIED: codebase]

```typescript
// Source: src/server/services/admin-product.service.ts
export function buildAdminProductWhere(
  filters: Pick<ListAdminProductsFilters, "stock" | "categoryId" | "q">,
): Prisma.ProductWhereInput {
  const q = filters.q?.trim();
  return {
    ...(filters.stock === "in_stock" && { quantity: { gte: 1 } }),
    ...(filters.stock === "out_of_stock" && { quantity: 0 }),
    ...(filters.categoryId && { categoryId: filters.categoryId }),
    ...(q && q.length >= 2
      ? {
          OR: [
            { title: { contains: q, mode: "insensitive" } },
            { brand: { contains: q, mode: "insensitive" } },
            { description: { contains: q, mode: "insensitive" } },
          ],
        }
      : {}),
  };
}
```

### Existing URL helper — already supports q [VERIFIED: codebase]

```typescript
// Source: src/lib/admin/products-url.ts
if (params.q != null && params.q.trim() !== "") {
  searchParams.set("q", params.q.trim());
}
```

### createDebounce ref pattern (from existing auto-save hooks) [VERIFIED: codebase]

```typescript
// Source: src/hooks/admin/use-product-auto-save.ts
const debounceRef = useRef(createDebounce(DEBOUNCE_MS));
// ...
useEffect(() => {
  debounceRef.current(() => { runSave(); });
}, [enabled, serializedWatch, runSave]);
```

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Server-side full-page form submit for search | Client debounce → URL replace → SSR re-render | Standard App Router pattern | No submit button needed; feels instant |
| `useSearchParams` hook (client) | Read `q` from `searchParams` prop in Server Component | App Router convention | Server Component receives search params as async prop |

**Deprecated/outdated:**
- `nuqs` for admin search: not used in admin, no plans to introduce it. Use `router.replace` + `adminProductsUrl`.

---

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | The `{ scroll: false }` option works as expected on `router.replace` in Next.js 16.2.6 | Architecture Patterns | Scroll-to-top on each keystroke — annoying but not blocking |
| A2 | An empty-state message "Товарів не знайдено. Створіть перший товар або змініть фільтри." is sufficient for the search empty state (no separate "no search results" message needed) | Common Pitfalls / Architecture | May need a separate message distinguishing "no products at all" from "search returned nothing" — low risk |

**All other claims were verified against the codebase directly.**

---

## Open Questions

1. **Empty-state message specificity**
   - What we know: The existing message "Товарів не знайдено. Створіть перший товар або змініть фільтри." is shown when `result.items.length === 0` regardless of whether a `q` filter is active.
   - What's unclear: Whether the admin wants a more specific message like "Нічого не знайдено за запитом «Samsung»" when search is active.
   - Recommendation: Leave existing message unless operator explicitly requests it — it's adequate.

2. **Minimum query length UX hint**
   - What we know: `buildAdminProductWhere` ignores `q` shorter than 2 characters.
   - What's unclear: Whether to show a UI hint for single-character queries.
   - Recommendation: Do nothing — single-char shows full unfiltered list, which is not broken.

---

## Environment Availability

Step 2.6: SKIPPED — no external dependencies. This phase is a pure UI component addition using already-installed packages.

---

## Validation Architecture

### Test Framework

| Property | Value |
|----------|-------|
| Framework | Vitest 4.1.6 |
| Config file | `vitest.config.ts` |
| Quick run command | `npx vitest run src/components/admin/product-search-input.test.tsx` |
| Full suite command | `npx vitest run` |

### Phase Requirements → Test Map

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| ADM-SRCH-01 | Input renders with placeholder | unit (jsdom) | `npx vitest run src/components/admin/product-search-input.test.tsx` | ❌ Wave 0 |
| ADM-SRCH-01 | Typing debounces router.replace with q param | unit (jsdom) | same file | ❌ Wave 0 |
| ADM-SRCH-01 | Clears q param when input emptied | unit (jsdom) | same file | ❌ Wave 0 |
| ADM-SRCH-01 | Resets page to 1 when q changes | unit (jsdom) | same file | ❌ Wave 0 |
| ADM-SRCH-01 | Syncs value from q prop on prop change | unit (jsdom) | same file | ❌ Wave 0 |
| ADM-SRCH-01 (backend) | `buildAdminProductWhere` with q filter | unit (node) | `npx vitest run src/server/services/admin-product.service.test.ts` | ✅ exists (partial) |

### Sampling Rate
- **Per task commit:** `npx vitest run src/components/admin/product-search-input.test.tsx`
- **Per wave merge:** `npx vitest run`
- **Phase gate:** Full suite green before `/gsd:verify-work`

### Wave 0 Gaps
- [ ] `src/components/admin/product-search-input.test.tsx` — covers ADM-SRCH-01 render + debounce + reset
- [ ] Extend `src/server/services/admin-product.service.test.ts` — add `q` filter test case to `buildAdminProductWhere` suite (currently no `q` case tested)

---

## Security Domain

`security_enforcement` not explicitly disabled — section required.

| ASVS Category | Applies | Standard Control |
|---------------|---------|-----------------|
| V2 Authentication | yes (admin route) | better-auth session; admin layout already gate-keeps `/admin/*` |
| V3 Session Management | no | handled by auth layer above |
| V4 Access Control | yes | admin layout enforces admin role; search input adds no new surface |
| V5 Input Validation | yes | `listAdminProductsSchema` — `q: z.string().max(100).optional()` already validates and caps length |
| V6 Cryptography | no | no crypto in this feature |

### Known Threat Patterns for this stack

| Pattern | STRIDE | Standard Mitigation |
|---------|--------|---------------------|
| SQL injection via q param | Tampering | Prisma parameterised queries — `contains` is never interpolated raw |
| XSS via reflected q in UI | Tampering | React escapes all string renders; `value={value}` is safe |
| Overly broad search (ReDoS / DB hammering) | DoS | `q.length >= 2` guard in `buildAdminProductWhere`; 300 ms debounce on client; `max(100)` in Zod schema |
| CSRF on search | Spoofing | GET request — no mutation; CSRF not applicable |

---

## Sources

### Primary (HIGH confidence)
- Codebase direct read — `src/server/services/admin-product.service.ts`, `src/server/validators/admin-product.ts`, `src/lib/admin/products-url.ts`, `src/app/(admin)/admin/tovary/page.tsx`, `src/components/admin/product-list-filters.tsx`, `src/components/admin/admin-products-table.tsx`, `src/components/admin/products-list-pagination.tsx`
- `src/components/catalog/catalog-toolbar.tsx` — reference pattern for debounced search input
- `src/hooks/admin/use-product-auto-save.ts` — reference pattern for `createDebounce` + `useRef`
- `src/lib/debounce.ts` + `src/lib/debounce.test.ts` — debounce utility internals
- `node_modules/next/dist/docs/01-app/01-getting-started/04-linking-and-navigating.md` — Next.js 16.2.6 navigation API

### Secondary (MEDIUM confidence)
- `package.json` — confirmed next@16.2.6, nuqs@2.8.9, react@19.2.4, vitest@4.1.6

### Tertiary (LOW confidence)
- None — all findings verified directly against codebase

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — all libraries confirmed in `node_modules` and `package.json`
- Architecture: HIGH — pattern derived from existing `catalog-toolbar.tsx` in same codebase
- Backend completeness: HIGH — `buildAdminProductWhere`, `listAdminProductsSchema`, `adminProductsUrl` all read directly
- Pitfalls: HIGH — derived from reading actual implementation of debounce, router usage patterns, and existing test file structure

**Research date:** 2026-05-28
**Valid until:** 2026-06-28 (stable stack; no external service dependencies)
