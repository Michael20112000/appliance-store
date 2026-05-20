---
phase: 33-admin-categories-dnd-links
reviewed: 2026-05-20T00:00:00Z
depth: standard
files_reviewed: 4
files_reviewed_list:
  - src/components/admin/admin-categories-table.tsx
  - src/server/actions/admin/category.actions.ts
  - src/server/services/admin-catalog-reorder.service.test.ts
  - src/server/services/admin-catalog.service.ts
findings:
  critical: 1
  warning: 3
  info: 2
  total: 6
status: issues_found
---

# Phase 33: Code Review Report

**Reviewed:** 2026-05-20T00:00:00Z
**Depth:** standard
**Files Reviewed:** 4
**Status:** issues_found

## Summary

This phase adds drag-and-drop reordering to the admin categories table and link-styled navigation from table rows. The server action and service layer are straightforward and mostly correct. One stale-closure bug in the optimistic rollback path will silently discard valid orders in high-frequency use. Three warnings cover a slug-uniqueness race in concurrent transactions, a type guard that runs too late to be useful, and an event-type mismatch that bypasses the drag-handle intent. Two info items flag unused exported constants and a `while (true)` loop.

---

## Critical Issues

### CR-01: Stale closure causes wrong rollback after rapid drags

**File:** `src/components/admin/admin-categories-table.tsx:127`
**Issue:** `handleDragEnd` captures `localCategories` in its closure at the time it is defined (i.e. before `setLocalCategories(reordered)` is reflected into state). When the user drags a second item before the first server call resolves, the rollback on line 127 restores the *pre-first-drag* list — not the list that was visible when the second drag began. Any intermediate drag that succeeded on the server is silently overwritten in the UI, leaving the displayed order out of sync with the persisted order with no error shown.

The fix is to capture the pre-drag snapshot before calling `setLocalCategories`, and use the functional form of `setLocalCategories` for the rollback so it always revererts to the correct prior state regardless of concurrency:

```tsx
function handleDragEnd(event: DragEndEvent) {
  const { active, over } = event;
  if (!over || active.id === over.id) return;

  const oldIndex = localCategories.findIndex((c) => c.id === active.id);
  const newIndex = localCategories.findIndex((c) => c.id === over.id);
  const reordered = arrayMove(localCategories, oldIndex, newIndex);

  // Capture snapshot for rollback BEFORE applying the optimistic update.
  const snapshot = localCategories;

  setLocalCategories(reordered);

  startTransition(async () => {
    const result = await reorderCategoriesAction(reordered.map((c) => c.id));
    if (!result.ok) {
      setLocalCategories(snapshot); // use captured snapshot, not the stale closure
      toast.error("Помилка збереження порядку");
    }
  });
}
```

---

## Warnings

### WR-01: `resolveUniqueSlug` runs outside the transaction, creating a slug uniqueness race

**File:** `src/server/services/admin-catalog.service.ts:106`
**Issue:** In `createCategory`, `resolveUniqueSlug(baseSlug)` is called on line 106 *before* entering `prisma.$transaction`. The slug uniqueness check (`findUnique`) runs in autocommit mode, then the category is created inside the transaction. Between those two operations, another concurrent request can claim the same slug, causing a unique-constraint violation at the database level that is not caught by `mapCategoryError` — it falls into the generic `UNKNOWN` branch and surfaces as an opaque error.

`updateCategory` has the same issue: `resolveUniqueSlug` on line 149 runs outside the transaction that eventually writes the slug (line 160).

**Fix:** Move the `resolveUniqueSlug` call to inside the transaction body (passing `tx` to it, or inlining the slug-resolution query using `tx`). For `createCategory` this means accepting a `tx` parameter in `resolveUniqueSlug`, or restructuring so the slug check uses the same `PrismaTransaction` handle as the write.

### WR-02: Dead type guard in `reorderCategoriesAction` — runtime check after TypeScript boundary

**File:** `src/server/actions/admin/category.actions.ts:109-114`
**Issue:** The guard on lines 109–114 checks `!Array.isArray(orderedIds)` and `orderedIds.some(id => typeof id !== "string")`. Because this is a `"use server"` action, Next.js serializes/deserializes the arguments; the declared TypeScript type `string[]` is NOT enforced at runtime when called from the client. The guard *looks* defensive but provides incomplete protection:

1. An empty array (`[]`) passes every check and causes `prisma.$transaction` to be called with zero operations — which is a no-op that clears all sort orders indirectly (no rows get updated, but the caller's UI state is already reordered and `ok: true` is returned, leaving the DB and UI diverged until the next full page load).
2. The guard should also reject an empty array explicitly.

```ts
if (
  !Array.isArray(orderedIds) ||
  orderedIds.length === 0 ||                          // add this
  orderedIds.some((id) => typeof id !== "string" || id.trim() === "")
) {
  return { ok: false as const, error: "INVALID_INPUT" as const };
}
```

### WR-03: `onPointerDown={stopRowNav}` on the products `<Link>` prevents drag from initiating on the handle cell

**File:** `src/components/admin/admin-categories-table.tsx:91`
**Issue:** `stopRowNav` calls `event.stopPropagation()`. It is attached to `onPointerDown` on the products `<Link>`. The `@dnd-kit/core` `PointerSensor` listens for `pointerdown` on the sortable item (`<tr>`) to begin drag activation. When the user presses down anywhere in the products cell (including the `GripVertical`-adjacent area), the pointer event bubbles up through the `<a>` element and hits both `onPointerDown` handlers. `stopPropagation` on the link will prevent the parent `<tr>`'s DnD listener from seeing the event only if the pointer actually lands on the link, which is fine — but because `onPointerDown` is on the link and `stopRowNav` only does `stopPropagation`, it *also* prevents the `DragEndEvent`-level row navigation suppression from working symmetrically for pointer events.

More critically: `stopRowNav` is typed as `(event: MouseEvent) => void` (React's `MouseEvent`), but it is passed to `onPointerDown` which fires a `PointerEvent`. React's synthetic event system narrows these differently; in strict TypeScript this would be a type error (PointerEvent is not MouseEvent). At runtime it works because both share `stopPropagation`, but the typing is wrong and will fail stricter TSConfig setups.

**Fix:** Type `stopRowNav` as `(event: React.SyntheticEvent) => void` or use two separate handlers, and add `import type { PointerEvent }` if needed.

```tsx
const stopRowNav = (event: React.SyntheticEvent) => event.stopPropagation();
```

---

## Info

### IN-01: `SLUG_ALREADY_EXISTS` constant is exported but never used

**File:** `src/server/services/admin-catalog.service.ts:13`
**Issue:** `export const SLUG_ALREADY_EXISTS = "SLUG_ALREADY_EXISTS"` is declared but no code in the service (or the action layer) throws or catches this constant. The slug collision path throws a raw Prisma unique constraint error, not `new Error(SLUG_ALREADY_EXISTS)`. The export is dead code.

**Fix:** Remove the constant, or wire it up to the actual slug collision path so callers can distinguish slug errors from other constraint violations.

### IN-02: `while (true)` loop in `resolveUniqueSlug` has no termination guarantee

**File:** `src/server/services/admin-catalog.service.ts:37`
**Issue:** The `while (true)` loop resolving slug uniqueness has no upper-bound iteration limit. In adversarial input (an attacker flooding the DB with slug variants `base`, `base-2`, `base-3`, … `base-N`) this loop will issue unbounded DB queries. Under normal operation this is unlikely to loop more than a handful of times, but the absence of a ceiling is a latent reliability concern.

**Fix:** Add a maximum iteration count (e.g. 100) and throw a descriptive error if exceeded, signaling that slug generation failed rather than hanging indefinitely.

```ts
const MAX_ATTEMPTS = 100;
while (suffix <= MAX_ATTEMPTS) {
  // ...existing logic...
  suffix += 1;
}
throw new Error("SLUG_RESOLUTION_FAILED");
```

---

_Reviewed: 2026-05-20T00:00:00Z_
_Reviewer: Claude (gsd-code-reviewer)_
_Depth: standard_
