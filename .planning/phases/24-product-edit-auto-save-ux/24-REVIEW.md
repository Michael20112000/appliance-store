---
phase: 24-product-edit-auto-save-ux
reviewed: 2026-05-19T12:00:00Z
depth: standard
files_reviewed: 7
files_reviewed_list:
  - src/lib/debounce.ts
  - src/hooks/admin/use-product-auto-save.ts
  - src/components/admin/product-edit-page-content.tsx
  - src/components/admin/product-edit-header.tsx
  - src/components/admin/product-edit-delete-button.tsx
  - src/components/admin/product-form.tsx
  - src/app/(admin)/admin/tovary/[id]/page.tsx
findings:
  critical: 1
  warning: 3
  info: 2
  total: 6
status: blocked
---

# Phase 24: Code Review Report

**Reviewed:** 2026-05-19
**Depth:** standard
**Files Reviewed:** 7
**Status:** blocked

## Summary

Phase 24 delivers debounced auto-save, edit-page chrome (back link, header delete), and a clean split between create and edit form modes. `createDebounce` and the generation guard correctly handle UI staleness and redundant client work (D-10, D-11).

One **server-side data integrity** gap remains: overlapping `updateProductAction` calls are not serialized, so a slower older request can overwrite a newer edit after the client has already shown «Збережено». Three warnings cover navigation data loss, stale image alt text, and a delete error copy bug. Fix CR-01 before treating ADM-PRD-05 as production-safe under fast typing or slow networks.

## Critical Issues

### CR-01: Concurrent saves can apply out of order on the server

**File:** `src/hooks/admin/use-product-auto-save.ts:66-97`
**Issue:** `runSave` increments `generationRef` and ignores stale **responses** for UI state, but every debounced/flush invocation still fires `updateProductAction` without waiting for the prior request to finish. If save A (older payload) is slow and save B (newer payload) completes first, A can still land last on the server and persist stale field values — the UI will not revert (D-11), but the database will.

**Fix:** Serialize in-flight saves (single-flight + queue latest payload), or chain awaits so only one request runs at a time:

```typescript
const inFlightRef = useRef<Promise<void> | null>(null);
const pendingRef = useRef<(() => Promise<void>) | null>(null);

const runSave = useCallback(async () => {
  if (!enabled) return;
  // ... parse + snapshot check ...

  const execute = async () => {
    const generation = ++generationRef.current;
    setStatus("saving");
    const result = await updateProductAction({ id: productId, ...parsed.data });
    if (generation !== generationRef.current) return;
    // ... handle result ...
  };

  if (inFlightRef.current) {
    pendingRef.current = execute;
    return;
  }

  inFlightRef.current = (async () => {
    try {
      await execute();
      while (pendingRef.current) {
        const next = pendingRef.current;
        pendingRef.current = null;
        await next();
      }
    } finally {
      inFlightRef.current = null;
    }
  })();
}, [enabled, productId]);
```

Add a Vitest case: two overlapping saves where the first HTTP response resolves after the second, and assert the final `updateProductAction` payload matches the latest form values.

## Warnings

### WR-01: Pending debounced edits are lost on «Назад» navigation

**File:** `src/components/admin/product-edit-header.tsx:23-29`, `src/hooks/admin/use-product-auto-save.ts:101-106`
**Issue:** The back `Link` navigates immediately. If the user edits a field and clicks «Назад» within the 500ms debounce window (or while a save is in flight without blur flush on that field), changes are discarded with no warning. Only `title` and `description` get blur flush (D-08).

**Fix:** On edit shell unmount or back navigation, call `autoSave.flush()` and optionally `await` the in-flight save (after CR-01 serialization). Consider `beforeunload` or intercepting the back link until `status !== "saving"` and debounce queue is empty.

### WR-02: Image upload alt text uses initial title, not live form title

**File:** `src/components/admin/product-form.tsx:74,288-295`
**Issue:** `productTitle` is taken from `defaultValues?.title`, not `form.watch("title")` or auto-saved values. After the operator renames the product and uploads photos, `ProductImageUpload` still uses the mount-time title for `alt` metadata.

**Fix:**

```typescript
const productTitle = form.watch("title") || defaultValues?.title || "";
```

Or pass `form.watch("title")` only in edit mode.

### WR-03: Delete failure toast reuses save error copy

**File:** `src/components/admin/product-edit-delete-button.tsx:27`
**Issue:** `UNKNOWN` maps to «Не вдалося **зберегти** товар…» — misleading when delete fails.

**Fix:** Use a delete-specific string, e.g. «Не вдалося видалити товар. Спробуйте ще раз.»

## Info

### IN-01: `setStatus` may run after unmount

**File:** `src/hooks/admin/use-product-auto-save.ts:76-96`
**Issue:** Cleanup cancels debounce timers but does not guard async `updateProductAction` resolution. Navigating away mid-save can trigger React state updates on an unmounted hook.

**Fix:** Track `mountedRef` in an effect; return early before `setStatus` / `setTimeout` when unmounted.

### IN-02: `errorMessages` map duplicated in three files

**File:** `src/hooks/admin/use-product-auto-save.ts:15-22`, `src/components/admin/product-form.tsx:34-41`, `src/components/admin/product-edit-delete-button.tsx:21-28`
**Issue:** Same map copy-pasted; drift risk (already visible in WR-03).

**Fix:** Export a shared `adminProductErrorMessages` (or per-action maps) from one module.

---

_Reviewed: 2026-05-19_
_Reviewer: Claude (gsd-code-reviewer)_
_Depth: standard_
