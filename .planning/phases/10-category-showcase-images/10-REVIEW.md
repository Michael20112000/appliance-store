---
phase: 10-category-showcase-images
reviewed: 2026-05-17T22:30:00Z
depth: standard
files_reviewed: 11
files_reviewed_list:
  - prisma/migrations/20260517191223_category_image/migration.sql
  - prisma/schema.prisma
  - prisma/seed.ts
  - src/app/(admin)/admin/kategorii/[id]/page.tsx
  - src/components/admin/category-image-upload.tsx
  - src/components/home/category-grid.tsx
  - src/server/actions/admin/category.actions.ts
  - src/server/services/admin-catalog.service.ts
  - src/server/services/admin-catalog.service.test.ts
  - src/server/validators/category.ts
  - src/server/validators/category.test.ts
findings:
  critical: 0
  warning: 3
  info: 2
  total: 5
status: issues_found
---

# Phase 10: Code Review Report

**Reviewed:** 2026-05-17T22:30:00Z  
**Depth:** standard  
**Files Reviewed:** 11  
**Status:** issues_found

## Summary

Reviewed phase 10 implementation for category showcase images: Prisma schema/migration, Zod validator, `updateCategoryImage` service/action with homepage revalidation, admin `CategoryImageUpload`, and storefront `CategoryGrid` plus optional seed backfill.

The stack matches existing product-image patterns (`requireAdmin`, signed Cloudinary upload, `OptimizedImage` on homepage). No security blockers found (admin gate, cuid validation, no secrets in client code). The main risks are **optimistic UI without rollback** on failed saves and a **validator footgun** that nulls `imageAlt` when the field is omitted from the payload.

## Warnings

### WR-01: Optimistic preview not rolled back when persist fails

**File:** `src/components/admin/category-image-upload.tsx:69-86`, `80-86`, `47-64`  
**Issue:** `handleUploadSuccess` and `handleRemove` update local state (`setImagePublicId`, `setAlt`) before `updateCategoryImageAction` completes. On `!result.ok`, only an error alert is shown; state is not reverted to `initialImagePublicId` / `initialImageAlt`. An admin can believe an image was removed (or replaced) while the DB and homepage still show the previous image.  
**Fix:** Only commit local state after a successful action, or revert on failure:

```tsx
const persistImage = useCallback(
  (next: { imagePublicId: string | null; imageAlt?: string | null }) => {
    startTransition(async () => {
      setError(null);
      const result = await updateCategoryImageAction({
        categoryId,
        imagePublicId: next.imagePublicId,
        imageAlt: next.imageAlt ?? (alt.trim() || null),
      });
      if (result && !result.ok) {
        setError("Не вдалося зберегти зображення. Спробуйте ще раз.");
        setImagePublicId(initialImagePublicId);
        setAlt(initialImageAlt ?? "");
        return;
      }
      setImagePublicId(next.imagePublicId);
      if (next.imageAlt !== undefined) setAlt(next.imageAlt ?? "");
    });
  },
  [categoryId, alt, initialImagePublicId, initialImageAlt],
);

const handleUploadSuccess = (result: CloudinaryUploadWidgetResults) => {
  const uploaded = extractUploadInfo(result);
  if (!uploaded) return;
  persistImage({
    imagePublicId: uploaded.publicId,
    imageAlt: alt.trim() || null,
  });
};

const handleRemove = () => {
  if (!window.confirm("Прибрати зображення категорії з головної?")) return;
  persistImage({ imagePublicId: null, imageAlt: null });
};
```

### WR-02: Omitted `imageAlt` in schema always persists as `null`

**File:** `src/server/validators/category.ts:44-48`, `src/server/services/admin-catalog.service.ts:114-116`  
**Issue:** `updateCategoryImageSchema` transform sets `imageAlt` to `null` when the key is absent (`data.imageAlt ?? null`). Any caller that sends only `{ categoryId, imagePublicId }` wipes stored alt text. Current `CategoryImageUpload` always passes `imageAlt`, but the server action is a public boundary for future callers.  
**Fix:** Use `.optional()` output without defaulting absent keys to null, and patch only provided fields in the service:

```ts
// validator: separate "clear" vs "omit"
imageAlt: z.union([z.string().trim().max(500), z.literal(""), z.null()]).optional(),

// transform: only normalize when key present
imageAlt:
  data.imageAlt === undefined
    ? undefined
    : data.imageAlt === ""
      ? null
      : data.imageAlt,

// service
data: {
  imagePublicId: input.imagePublicId,
  ...(input.imageAlt !== undefined ? { imageAlt: input.imageAlt } : {}),
},
```

Add a Vitest case: parse payload without `imageAlt` and assert output `imageAlt === undefined`.

### WR-03: Overlapping `persistImage` transitions can save stale alt

**File:** `src/components/admin/category-image-upload.tsx:47-67`, `89-94`  
**Issue:** `persistImage` closes over `alt` and uses `startTransition` without serializing or aborting in-flight requests. Rapid upload after editing alt (or blur + upload) can persist an older `alt` value from a stale closure while the input already shows the new text.  
**Fix:** Pass explicit `imageAlt` on every call (already done for upload/remove); remove `alt` from the `useCallback` deps and use only `next.imageAlt`, or debounce blur saves and ignore overlapping results with a request id:

```tsx
const requestIdRef = useRef(0);

const persistImage = useCallback((next: { ... }) => {
  const id = ++requestIdRef.current;
  startTransition(async () => {
    const result = await updateCategoryImageAction({ ... });
    if (id !== requestIdRef.current) return;
    // apply result / rollback
  });
}, [categoryId]);
```

## Info

### IN-01: No automated coverage for `updateCategoryImageAction`

**File:** `src/server/actions/admin/category.actions.ts:71-81`  
**Issue:** Service layer is tested; the action’s `requireAdmin`, Zod parse, and `revalidateCategoryPaths` (including `revalidatePath("/")`) are not covered. Regressions in revalidation would not be caught by CI.  
**Fix:** Add a focused test (mock `requireAdmin`, `revalidatePath`, service) or an integration test mirroring other admin action tests in the repo.

### IN-02: Silent no-op when upload widget returns unusable `result.info`

**File:** `src/components/admin/category-image-upload.tsx:69-71`  
**Issue:** If `extractUploadInfo` returns `null`, `handleUploadSuccess` returns without user feedback. Unlikely, but operators get no signal.  
**Fix:** `setError("Не вдалося отримати дані завантаження. Спробуйте ще раз.")` when `uploaded` is null.

---

_Reviewed: 2026-05-17T22:30:00Z_  
_Reviewer: Claude (gsd-code-reviewer)_  
_Depth: standard_
