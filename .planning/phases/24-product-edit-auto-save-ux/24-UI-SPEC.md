# Phase 24: Product edit auto-save UX — UI Design Contract

**Created:** 2026-05-19  
**Status:** Approved (derived from discuss-phase CONTEXT)

## Scope

Edit product page `/admin/tovary/[id]` only. Create flow and product list unchanged.

## Page chrome

| Element | Placement | Pattern |
|---------|-----------|---------|
| «Назад» | Above `<h1>Редагувати товар</h1>` | `Link` with `ArrowLeft` `size-4` `aria-hidden` + visible label «Назад» (Phase 23 category toolbar) |
| Back target | — | `adminProductsUrl({ categoryId: product.categoryId })` |
| Title row | Below back link | `flex` row: `h1` left, delete control right |
| Save status | Near title row (header band) | Muted inline: `Збереження…` while saving; `Збережено` ~2s after success (no success toast) |

## Delete (header)

| Control | Spec |
|---------|------|
| Button | `variant="ghost"` `size="icon"`, `Trash2` `size-4`, `aria-label="Видалити товар"` |
| Confirm | `AlertDialog` — same title/description/actions as `ProductListDeleteButton` |
| Success | `toast.success("Товар видалено")` + redirect to filtered list |
| Error | `toast.error` with shared `errorMessages` map |

## Form (edit mode)

| Before | After |
|--------|-------|
| Sticky footer: Зберегти, Скасувати, На вітрині, Видалити | **No footer** in edit mode |
| Manual submit | Auto-save via `useWatch` + 500ms debounce; flush debounce on `blur` for `title` and `description` |
| — | Invalid values: no network call; inline Zod errors only |
| — | No success toast; error → `toast.error` |

Create mode (`/admin/tovary/novyi`): unchanged sticky footer with Зберегти / Скасувати.

## Photos section

`ProductImageUpload` below form — unchanged; not part of form auto-save.

## Verification (visual)

1. Back link above title returns to category-filtered product list.
2. Typing in a field shows «Збереження…» then brief «Збережено»; no Save button.
3. Invalid field blocks save; no error toast for validation.
4. Trash in header opens AlertDialog; list-style copy; no `window.confirm` on edit page.
5. Create page still has Save/Cancel footer.
