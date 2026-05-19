# Phase 24: Product edit auto-save UX — Research

**Researched:** 2026-05-19  
**Domain:** Admin product edit page — auto-save form, header chrome, AlertDialog delete  
**Confidence:** HIGH (codebase-verified patterns + locked CONTEXT; RHF patterns from official docs)

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

#### Page chrome & navigation (ADM-PRD-05)
- **D-01:** Add **«Назад»** link **above** `<h1>Редагувати товар</h1>` on the edit page (not inside form footer). Use `ArrowLeft` + visible label «Назад», icon `aria-hidden` (same pattern as Phase 23 category toolbar).
- **D-02:** «Назад» target: `adminProductsUrl({ categoryId: product.categoryId })` — operators return to the **filtered product list for this product's category**, not bare `/admin/tovary`.
- **D-03:** Header row layout: top = back link; below = flex row with `h1` left and **delete** right (trash icon, vertically aligned with title block).

#### Delete affordance (ADM-PRD-05)
- **D-04:** Move delete out of form footer to **page header** — `Button` `variant="ghost"` `size="icon"`, `Trash2`, `aria-label="Видалити товар"` (icon-only; matches list delete).
- **D-05:** Confirm with **`AlertDialog`** — same copy and flow as `ProductListDeleteButton` (not `window.confirm`). On success: toast + redirect to `adminProductsUrl({ categoryId })` or `/admin/tovary` if category unknown.
- **D-06:** Delete control lives on **edit page** (or thin wrapper), not in shared create/edit footer — create mode unchanged.

#### Auto-save behavior (ADM-PRD-05)
- **D-07:** **Edit mode only:** remove «Зберегти», «Скасувати», «На вітрині», and the **sticky footer** entirely. Create mode keeps current submit footer.
- **D-08:** Auto-save trigger: `useWatch` on all form fields → **debounce 500ms** after last change, then attempt save. **Flush debounce on `blur`** for `title` and `description` so tabbing away saves promptly.
- **D-09:** Before calling `updateProductAction`, run `editProductFormSchema.safeParse(values)`. **Do not save while invalid** — keep inline RHF/Zod errors only; no error toast for validation (operator fixes field first).
- **D-10:** Skip network call if serialized values match **last successful save snapshot** (avoid redundant writes on re-render).
- **D-11:** Use existing `updateProductAction({ id, ...values })`; no new API. Ignore stale responses (monotonic save generation counter).

#### Operator feedback (ROADMAP: toast on error)
- **D-12:** **Success: silent** — no success toast (per ROADMAP). Show subtle inline status near header: `Збереження…` while in-flight; brief muted **«Збережено»** (≈2s fade) after success.
- **D-13:** **Failure:** `toast.error` with existing `errorMessages` map (same strings as today). Clear inline status on error.

#### Create page (`/admin/tovary/novyi`)
- **D-14:** **No changes** to create UX — manual «Зберегти» + «Скасувати» remain. Phase scope is edit-only.

#### Photos section
- **D-15:** **No changes** to `ProductImageUpload` — images already persist on upload; not part of form auto-save batch.

### Claude's Discretion

User delegated all gray areas («все на твій вибір» — optimal, convenient, clear). Planner may adjust debounce ms (450–600) or extract `ProductEditHeader` / `useProductAutoSave` helpers but **must not** change D-01–D-15 semantics.

### Deferred Ideas (OUT OF SCOPE)

- Success toast on every save — rejected (noisy); inline «Збережено» only.
- `router.back()` for «Назад» — rejected (unpredictable); fixed category-filtered list URL.
- Auto-save on create page — out of phase scope (D-14).
- «Переглянути на вітрині» elsewhere (e.g. list row) — not in ADM-PRD-05; deferred unless new requirement.

</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| ADM-PRD-05 | Редагування товару: «Назад» над заголовком; без «Зберегти»; auto-save полів форми з throttle/debounce; без «На вітрині»; «Видалити» — icon trash у правому верхньому куті навпроти заголовка | D-01–D-15 mapped to page chrome (`ProductEditHeader`), `useProductAutoSave` + `createDebounce`, `ProductEditDeleteButton` mirroring list AlertDialog; create page unchanged |
</phase_requirements>

## Summary

Phase 24 is a **client UX refactor** on the existing edit product route. No Prisma, no new server actions, no API changes. Today `product-form.tsx` uses manual submit, `window.confirm` delete, and a sticky footer with Save/Cancel/На вітрині/Видалити; the edit page is a thin server wrapper with only an `<h1>`.

The implementation splits concerns into: (1) a **client page shell** for header chrome + save status, (2) **`useProductAutoSave`** watching RHF values with debounce + blur flush, (3) **`ProductEditDeleteButton`** copying list AlertDialog behavior but redirecting via `adminProductsUrl({ categoryId })` instead of `deleteProductAction`'s hardcoded redirect.

**No new npm packages** are required. The repo has no debounce utility in `src/`; add `createDebounce` alongside existing `createThrottle` in `src/lib/catalog/throttle.ts` (or `src/lib/debounce.ts`) — same `flush()` contract CONTEXT needs for blur. `perfect-debounce` exists only as a transitive lockfile dependency — do not add it as a direct dependency without user review.

**Primary recommendation:** Introduce `ProductEditPageContent` (client) on `[id]/page.tsx`, extract `useProductAutoSave`, `ProductEditHeader`, `ProductEditDeleteButton`; gate edit footer with `mode === "create"` only; unit-test debounce/snapshot/stale-save logic in Vitest.

## Architectural Responsibility Map

| Capability | Primary Tier | Secondary Tier | Rationale |
|------------|-------------|----------------|-----------|
| «Назад» + title + delete chrome | Browser (client components) | Frontend server (RSC page loads product) | Navigation and dialogs are client; page passes `categoryId`, `productId` from server fetch |
| Auto-save orchestration | Browser (`useProductAutoSave`) | API (`updateProductAction`) | Debounce, validation gate, snapshot diff, stale-response guard belong client-side before server call |
| Persist product fields | API / Backend (`updateProductAction`) | Database (Prisma via service) | Existing action already validates with `updateProductSchema` and revalidates paths |
| Delete product | API (`deleteProductFromListAction` + client redirect) | — | List action returns `{ ok }` without redirect; edit header controls category-aware `router.push` |
| Inline save status UI | Browser (`ProductEditHeader`) | — | Driven by hook state; no server involvement |
| Product images | Browser (`ProductImageUpload`) | API (`saveProductImagesAction`) | Unchanged; out of auto-save batch (D-15) |
| Orders block | Frontend server (`ProductOrdersSection` RSC) | — | Stays below form; no phase changes |

## Standard Stack

### Core

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| react-hook-form | ^7.76.0 (installed) | Form state, `useWatch`, `control` | Already used in `product-form.tsx` [VERIFIED: package.json] |
| @hookform/resolvers | ^5.2.2 | Zod resolver | Existing edit/create split schemas |
| zod | ^4.4.3 | `editProductFormSchema.safeParse` pre-flight | D-09; server uses `updateProductSchema` |
| sonner | ^2.0.7 | Error toasts on save/delete failure | Matches `ProductListDeleteButton` |
| lucide-react | ^1.16.0 | `ArrowLeft`, `Trash2` | Phase 23 icon pattern |
| shadcn AlertDialog | (in repo) | Delete confirm | Same as list delete |

### Supporting

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| Vitest + RTL | ^4.1.6 / ^16.3.2 | Hook + component tests | `useProductAutoSave`, optional delete button |
| next/navigation | 16.2.6 | `useRouter` after delete | Category-filtered redirect |

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Hand-rolled `createDebounce` | `use-debounce` / `perfect-debounce` npm | Extra dependency + slopcheck gate; CONTEXT allows 450–600ms tuning in-project |
| `useWatch` + `useEffect` | RHF `subscribe({ formState: { values: true } })` | Subscribe API avoids extra render in parent but less familiar in codebase; `useWatch` is CONTEXT-locked (D-08) |
| `deleteProductAction` | `deleteProductFromListAction` + `router.push` | `deleteProductAction` hard-redirects `/admin/tovary` — breaks D-02 category return |

**Installation:** None required for this phase.

## Package Legitimacy Audit

> No new packages recommended. Phase uses existing dependencies only.

| Package | Registry | Age | Downloads | Source Repo | slopcheck | Disposition |
|---------|----------|-----|-----------|-------------|-----------|-------------|
| — | — | — | — | — | not run | N/A |

**Packages removed due to slopcheck [SLOP] verdict:** none  
**Packages flagged as suspicious [SUS]:** none  

*slopcheck CLI not available in research environment; no install proposed.*

## Project Constraints (from .cursor/rules/)

- **Stack:** Next.js App Router + TypeScript, Prisma, Tailwind, shadcn/ui — no stack change.
- **Locale:** UI Ukrainian only.
- **Next.js:** Read `node_modules/next/dist/docs/` before assuming APIs; project on Next **16.2.6** [VERIFIED: package.json].
- **AGENTS.md:** Treat training-data Next.js knowledge as stale; verify against local docs when unsure.

## Architecture Patterns

### System Architecture Diagram

```
[Server: /admin/tovary/[id]/page.tsx]
  │ fetch product, categories, orders
  ▼
[Client: ProductEditPageContent]
  ├── ProductEditHeader
  │     ├── Link «Назад» → adminProductsUrl({ categoryId })
  │     ├── h1 + inline save status (idle | saving | saved)
  │     └── ProductEditDeleteButton → AlertDialog → deleteProductFromListAction
  │           → toast → router.push(adminProductsUrl({ categoryId }))
  ├── ProductForm (mode=edit, no footer)
  │     ├── RHF fields + useProductAutoSave
  │     │     useWatch(all) → debounce 500ms → safeParse → snapshot diff?
  │     │     → updateProductAction (generation guard)
  │     └── ProductImageUpload (unchanged)
  └── (sibling on server page) ProductOrdersSection

[Create flow unchanged: /admin/tovary/novyi → ProductForm mode=create + sticky footer]
```

### Recommended Project Structure

```
src/
├── app/(admin)/admin/tovary/[id]/page.tsx     # Server: data fetch → ProductEditPageContent + orders
├── components/admin/
│   ├── product-edit-page-content.tsx          # Client shell (NEW): header + form
│   ├── product-edit-header.tsx                # Back, title, save status slot (NEW)
│   ├── product-edit-delete-button.tsx         # AlertDialog delete (NEW)
│   ├── product-form.tsx                       # Edit: no footer; wire auto-save + blur
│   └── product-list-delete-button.tsx         # Reference — do not break list behavior
├── hooks/admin/
│   └── use-product-auto-save.ts               # Debounced save logic (NEW)
└── lib/
    └── debounce.ts                             # createDebounce(ms) with .flush() (NEW)
        # OR extend src/lib/catalog/throttle.ts with createDebounce export
```

### Pattern 1: Client edit shell (page composition)

**What:** Server page keeps data fetching; one client boundary owns header + form so save status sits next to title (D-03, D-12).

**When to use:** Any time header state is driven by form hook.

**Example:**

```tsx
// src/app/(admin)/admin/tovary/[id]/page.tsx (server — conceptual)
export default async function AdminEditProductPage({ params }: PageProps) {
  const product = await getProductAdmin(id);
  // ...
  return (
    <motion.div className="space-y-6">
      <ProductEditPageContent
        productId={product.id}
        categoryId={product.categoryId}
        categories={...}
        defaultValues={...}
        images={product.images}
      />
      <ProductOrdersSection orders={orders} />
    </motion.div>
  );
}
```

### Pattern 2: `createDebounce` with flush (blur)

**What:** Mirror `createThrottle` API (`fn`, `flush`) but **debounce** semantics: each schedule resets the timer; `flush()` runs pending callback immediately.

**When to use:** D-08 debounce + blur flush for `title` / `description`.

**Example:**

```typescript
// src/lib/debounce.ts — mirror throttle.ts style [VERIFIED: src/lib/catalog/throttle.ts]
export type DebouncedInvoke = { (fn: () => void): void; flush: () => void; cancel: () => void };

export function createDebounce(ms: number): DebouncedInvoke {
  let timeoutId: ReturnType<typeof setTimeout> | undefined;
  let latestFn: (() => void) | undefined;

  const invoke = () => {
    const fn = latestFn;
    latestFn = undefined;
    timeoutId = undefined;
    fn?.();
  };

  const debounced = ((fn: () => void) => {
    latestFn = fn;
    if (timeoutId !== undefined) clearTimeout(timeoutId);
    timeoutId = setTimeout(invoke, ms);
  }) as DebouncedInvoke;

  debounced.flush = () => {
    if (timeoutId !== undefined) {
      clearTimeout(timeoutId);
      timeoutId = undefined;
    }
    if (latestFn) invoke();
  };
  debounced.cancel = () => {
    if (timeoutId !== undefined) clearTimeout(timeoutId);
    timeoutId = undefined;
    latestFn = undefined;
  };
  return debounced;
}
```

### Pattern 3: `useProductAutoSave`

**What:** Subscribe to all field values via `useWatch({ control })`, schedule save through debounced callback, validate with `editProductFormSchema.safeParse`, compare snapshot, call `updateProductAction`, track generation for stale responses.

**When to use:** `mode === "edit"` only inside `ProductForm` or shell.

**Example:**

```typescript
// Source: [CITED: react-hook-form documentation — useWatch](https://github.com/react-hook-form/documentation/blob/master/src/content/docs/usewatch.mdx)
import { useWatch, type Control } from "react-hook-form";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { editProductFormSchema, type UpsertProductInput } from "@/server/validators/admin-product";
import { updateProductAction } from "@/server/actions/admin/product.actions";

export type SaveStatus = "idle" | "saving" | "saved";

function serializeSnapshot(values: UpsertProductInput): string {
  return JSON.stringify(values); // after safeParse.data normalization
}

export function useProductAutoSave({
  control,
  productId,
  enabled,
}: {
  control: Control<UpsertProductInput>;
  productId: string;
  enabled: boolean;
}) {
  const watched = useWatch({ control });
  const [status, setStatus] = useState<SaveStatus>("idle");
  const snapshotRef = useRef(serializeSnapshot(/* initial from defaultValues */));
  const generationRef = useRef(0);
  const debouncedRef = useRef(createDebounce(500));

  const runSave = async (values: UpsertProductInput) => {
    const parsed = editProductFormSchema.safeParse(values);
    if (!parsed.success) return; // D-09: inline errors only

    const next = serializeSnapshot(parsed.data);
    if (next === snapshotRef.current) return; // D-10

    const gen = ++generationRef.current;
    setStatus("saving");
    const result = await updateProductAction({ id: productId, ...parsed.data });
    if (gen !== generationRef.current) return; // D-11 stale

    if (result && !result.ok) {
      setStatus("idle");
      toast.error(errorMessages[result.error] ?? errorMessages.UNKNOWN);
      return;
    }
    snapshotRef.current = next;
    setStatus("saved");
    // reset to idle after ~2s (D-12)
  };

  useEffect(() => {
    if (!enabled) return;
    debouncedRef.current(() => {
      void runSave(watched as UpsertProductInput);
    });
    return () => debouncedRef.current.cancel();
  }, [watched, enabled]);

  return {
    status,
    flush: () => debouncedRef.current.flush(),
    registerBlurHandlers: () => ({
      onBlur: () => debouncedRef.current.flush(),
    }),
  };
}
```

**Wire blur on title/description:**

```tsx
<Input
  id="title"
  {...form.register("title", {
    onBlur: (e) => {
      form.register("title").onBlur?.(e);
      autoSave.flush();
    },
  })}
/>
```

Or merge via `register` return value spread — avoid double-register.

### Pattern 4: `ProductEditDeleteButton`

**What:** Copy `ProductListDeleteButton` AlertDialog markup and `errorMessages`; **omit** `stopRowNav` / `data-admin-row-interactive` (no table row). Use `deleteProductFromListAction` + `router.push(adminProductsUrl({ categoryId }))` — **not** `deleteProductAction` (redirects bare list).

**When to use:** Edit header only (D-04–D-06).

### Pattern 5: «Назад» link

**What:** `Link` with `ArrowLeft` + «Назад» above `h1`; href from `adminProductsUrl({ categoryId })` [VERIFIED: `src/lib/admin/products-url.ts`].

**Reference:** Chat back control uses icon + label (`chat-thread.tsx`); category edit uses icon inside buttons (Phase 23) — CONTEXT wants link **above** title, not in toolbar row with actions.

```tsx
<Link
  href={adminProductsUrl({ categoryId })}
  className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
>
  <ArrowLeft className="size-4" aria-hidden />
  Назад
</Link>
```

### Anti-Patterns to Avoid

- **`window.confirm` on edit delete:** Replace with AlertDialog (D-05); current `product-form.tsx` `onDelete` uses confirm — remove from edit path.
- **`deleteProductAction` for header delete:** Loses category filter on redirect (`redirect("/admin/tovary")` in action) [VERIFIED: `product.actions.ts`].
- **`watch()` at ProductForm root:** Re-renders entire form each keystroke; prefer `useWatch` in dedicated hook/component per RHF docs [CITED: useWatch isolates re-renders].
- **Success toast per save:** Violates D-12 / deferred ideas.
- **Sharing delete footer with create:** D-06 — delete only in edit header.
- **Auto-save on invalid:** Calling server before `safeParse` — wastes round-trips and confuses operators.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Debounce timer | Ad-hoc `setTimeout` in every field | `createDebounce` with `flush`/`cancel` | Blur flush + unmount cleanup; testable unit |
| Delete confirm UI | Custom modal | shadcn `AlertDialog` | A11y, focus trap, matches list |
| Product field validation | Custom rules | `editProductFormSchema` + RHF errors | Single source with server `updateProductSchema` |
| Category list URL | String concat query | `adminProductsUrl({ categoryId })` | Tested helper; Phase 23 pattern |
| Server delete + redirect | New action | `deleteProductFromListAction` + client navigation | Already list-tested; category-aware redirect in client |

**Key insight:** The phase is orchestration UX, not new domain logic — reuse actions and schemas; invest in hook tests for race/debounce edge cases.

## Common Pitfalls

### Pitfall 1: Stale save overwrites newer edit

**What goes wrong:** Slow `updateProductAction` returns after user typed more; snapshot advances incorrectly.

**Why it happens:** No generation guard (D-11).

**How to avoid:** Increment `generationRef` before await; discard results when `gen !== generationRef.current`.

**Warning signs:** Field reverts after fast typing; network tab shows out-of-order responses applying.

### Pitfall 2: Redundant saves on mount / reset

**What goes wrong:** `useWatch` fires on mount; debounce triggers save identical to server data.

**Why it happens:** Missing snapshot initialization from `defaultValues` (D-10).

**How to avoid:** Seed `snapshotRef` from parsed initial values on mount; skip save when serialized watch === snapshot.

### Pitfall 3: Invalid price/quantity sends request

**What goes wrong:** Empty number input → `NaN` → failed server parse or bad data.

**Why it happens:** Skipping `safeParse` (D-09).

**How to avoid:** Gate `runSave` on `editProductFormSchema.safeParse`; rely on existing Zod messages in UI.

### Pitfall 4: Edit delete drops category filter

**What goes wrong:** After delete, land on unfiltered `/admin/tovary`.

**Why it happens:** Using `deleteProductAction` redirect.

**How to avoid:** `deleteProductFromListAction` + `router.push(adminProductsUrl({ categoryId: categoryId ?? undefined }))`.

### Pitfall 5: Create page regression

**What goes wrong:** Create loses footer or gains auto-save.

**Why it happens:** Unconditional hook / shared footer removal.

**How to avoid:** `enabled: mode === "edit"`; footer `{mode === "create" && (...)}` only (D-14, D-07).

### Pitfall 6: `useWatch` without `control`

**What goes wrong:** Hook runs before form ready; missed updates.

**Why it happens:** RHF subscription order [CITED: useWatch docs — execution order matters].

**How to avoid:** Pass `control` from `useForm`; keep auto-save hook inside form component tree after `useForm` init.

## Code Examples

### useWatch entire form (official)

```tsx
// Source: [CITED: react-hook-form documentation — useWatch](https://github.com/react-hook-form/documentation/blob/master/src/content/docs/usewatch.mdx)
const watchedValues = useWatch({ control }); // all fields
```

### List delete AlertDialog (codebase reference)

```tsx
// Source: [VERIFIED: src/components/admin/product-list-delete-button.tsx]
<AlertDialogTitle>Видалити товар?</AlertDialogTitle>
<AlertDialogDescription>
  Дію не можна скасувати, якщо товар не в кошику чи активному замовленні.
</AlertDialogDescription>
```

### Category-filtered products URL

```typescript
// Source: [VERIFIED: src/lib/admin/products-url.ts]
adminProductsUrl({ categoryId: product.categoryId });
// → "/admin/tovary?categoryId=..."
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Manual Save + sticky footer on edit | Debounced auto-save, no footer | Phase 24 (this) | Operators edit inline; fewer clicks |
| `window.confirm` delete on form | Header `AlertDialog` | Phase 24 | Consistent with product list (Phase 19/23) |
| «На вітрині» on edit form | Removed from edit | Phase 24 | ADM-PRD-05; `storefrontSlug` prop can be removed from edit usage |
| `deleteProductAction` redirect | List action + client `router.push` with category | Phase 24 header | Preserves operator list context |

**Deprecated/outdated:**
- Edit-form `onDelete` + destructive footer button — replace with `ProductEditDeleteButton`.
- Inline `Alert` for save errors on edit — prefer `toast.error` (D-13); remove redundant edit error banner if hook handles failures.

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | `JSON.stringify(parsed.data)` is stable enough for snapshot diff | useProductAutoSave | Rare false-positive save if key order differs — use normalized Zod output object with fixed key order if flakes appear |
| A2 | `useWatch({ control })` without `name` watches all registered fields including Selects | Auto-save | If some fields missed, extend to explicit field name list |
| A3 | Shared `errorMessages` can be extracted to `src/lib/admin/product-errors.ts` | Don't hand-roll | Low — optional refactor, not required |

**If empty of blocking assumptions:** A1–A3 are low-risk implementation details; no user confirmation required before planning.

## Open Questions

1. **Extract shared `errorMessages`?**
   - What we know: Duplicated in `product-form.tsx` and `product-list-delete-button.tsx`.
   - What's unclear: Whether planner wants DRY in this phase or follow-up.
   - Recommendation: Optional small extract if touching both files; not blocking.

2. **Save status placement inside header row**
   - What we know: UI-SPEC says "near title row (header band)".
   - Recommendation: Muted `text-sm text-muted-foreground` right of `h1` or under back link; planner picks per shadcn spacing.

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| Node.js | Vitest, Next dev | ✓ | v24.14.0 | — |
| npm | scripts | ✓ | 11.9.0 | — |
| Vitest | unit tests | ✓ | 4.1.6 | — |
| Dev server | manual UAT | ✓ (user terminal) | — | — |

**Missing dependencies with no fallback:** none

## Validation Architecture

### Test Framework

| Property | Value |
|----------|-------|
| Framework | Vitest 4.1.6 + @testing-library/react 16.3.2 |
| Config file | `vitest.config.ts` |
| Quick run command | `npx vitest run src/hooks/admin/use-product-auto-save.test.ts` |
| Full suite command | `npm test` |

### Phase Requirements → Test Map

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| ADM-PRD-05 | Debounce waits 500ms before save | unit | `npx vitest run src/hooks/admin/use-product-auto-save.test.ts -t debounce` | ❌ Wave 0 |
| ADM-PRD-05 | Invalid values skip `updateProductAction` | unit | `npx vitest run src/hooks/admin/use-product-auto-save.test.ts -t validation` | ❌ Wave 0 |
| ADM-PRD-05 | Snapshot match skips network | unit | `npx vitest run src/hooks/admin/use-product-auto-save.test.ts -t snapshot` | ❌ Wave 0 |
| ADM-PRD-05 | Stale response ignored | unit | `npx vitest run src/hooks/admin/use-product-auto-save.test.ts -t stale` | ❌ Wave 0 |
| ADM-PRD-05 | blur flush calls save without full debounce wait | unit | `npx vitest run src/lib/debounce.test.ts` | ❌ Wave 0 |
| ADM-PRD-05 | Delete button opens dialog, no row stopPropagation needed | component (optional) | `npx vitest run src/components/admin/product-edit-delete-button.test.tsx` | ❌ Wave 0 |
| ADM-PRD-05 | Create page still has Save footer | manual / e2e | Visual check `novyi` page | — |

### Sampling Rate

- **Per task commit:** `npx vitest run src/hooks/admin/use-product-auto-save.test.ts src/lib/debounce.test.ts`
- **Per wave merge:** `npm test`
- **Phase gate:** Full suite green before `/gsd-verify-work`

### Wave 0 Gaps

- [ ] `src/lib/debounce.ts` + `src/lib/debounce.test.ts` — `createDebounce` flush/cancel
- [ ] `src/hooks/admin/use-product-auto-save.ts` + test — debounce, validation gate, snapshot, stale gen
- [ ] `src/components/admin/product-edit-delete-button.test.tsx` (optional) — AlertDialog opens; mock action + router
- [ ] Fake timers pattern: `vi.useFakeTimers()` + `advanceTimersByTime(500)` — follow Vitest 4 docs

## Security Domain

### Applicable ASVS Categories

| ASVS Category | Applies | Standard Control |
|---------------|---------|------------------|
| V2 Authentication | yes (inherited) | `requireAdmin()` in server actions — unchanged |
| V4 Access Control | yes (inherited) | Admin-only routes + actions |
| V5 Input Validation | yes | `editProductFormSchema` client + `updateProductSchema` server |
| V6 Cryptography | no | — |

### Known Threat Patterns for this stack

| Pattern | STRIDE | Standard Mitigation |
|---------|--------|---------------------|
| Unauthenticated product mutation | Spoofing | `requireAdmin()` in `updateProductAction` / delete actions [VERIFIED] |
| Mass auto-save abuse | DoS | Debounce + snapshot skip reduces calls; server validation unchanged |
| XSS via product fields | Tampering | Existing Zod max lengths; React escaping |

## Sources

### Primary (HIGH confidence)

- [VERIFIED: codebase] `src/components/admin/product-form.tsx`, `product-list-delete-button.tsx`, `[id]/page.tsx`, `product.actions.ts`, `admin-product.ts`, `products-url.ts`
- [CITED: react-hook-form documentation](https://github.com/react-hook-form/documentation) — `useWatch`, watch vs useWatch
- [VERIFIED: package.json] dependency versions

### Secondary (MEDIUM confidence)

- `.planning/phases/24-product-edit-auto-save-ux/24-CONTEXT.md`, `24-UI-SPEC.md`
- `.planning/phases/23-admin-category-polish/23-RESEARCH.md` — test patterns

### Tertiary (LOW confidence)

- None blocking

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — existing project dependencies, no new packages
- Architecture: HIGH — locked CONTEXT + clear file touchpoints
- Pitfalls: HIGH — race/debounce patterns well-known; mitigations specified

**Research date:** 2026-05-19  
**Valid until:** 2026-06-19 (stable admin UX domain)
