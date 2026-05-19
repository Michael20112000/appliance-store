# Phase 24: Product edit auto-save UX - Context

**Gathered:** 2026-05-19
**Status:** Ready for planning

<domain>
## Phase Boundary

Polish **edit** product UX at `/admin/tovary/[id]` only (ADM-PRD-05): «Назад» above title, auto-save form fields without «Зберегти», remove «На вітрині», trash delete in header with list-style confirm dialog.

Out of scope: create flow (`/admin/tovary/novyi` keeps manual save), product list table changes, image upload pipeline (already self-saving), storefront product page, orders block on edit page.

</domain>

<decisions>
## Implementation Decisions

### Page chrome & navigation (ADM-PRD-05)
- **D-01:** Add **«Назад»** link **above** `<h1>Редагувати товар</h1>` on the edit page (not inside form footer). Use `ArrowLeft` + visible label «Назад», icon `aria-hidden` (same pattern as Phase 23 category toolbar).
- **D-02:** «Назад» target: `adminProductsUrl({ categoryId: product.categoryId })` — operators return to the **filtered product list for this product's category**, not bare `/admin/tovary`.
- **D-03:** Header row layout: top = back link; below = flex row with `h1` left and **delete** right (trash icon, vertically aligned with title block).

### Delete affordance (ADM-PRD-05)
- **D-04:** Move delete out of form footer to **page header** — `Button` `variant="ghost"` `size="icon"`, `Trash2`, `aria-label="Видалити товар"` (icon-only; matches list delete).
- **D-05:** Confirm with **`AlertDialog`** — same copy and flow as `ProductListDeleteButton` (not `window.confirm`). On success: toast + redirect to `adminProductsUrl({ categoryId })` or `/admin/tovary` if category unknown.
- **D-06:** Delete control lives on **edit page** (or thin wrapper), not in shared create/edit footer — create mode unchanged.

### Auto-save behavior (ADM-PRD-05)
- **D-07:** **Edit mode only:** remove «Зберегти», «Скасувати», «На вітрині», and the **sticky footer** entirely. Create mode keeps current submit footer.
- **D-08:** Auto-save trigger: `useWatch` on all form fields → **debounce 500ms** after last change, then attempt save. **Flush debounce on `blur`** for `title` and `description` so tabbing away saves promptly.
- **D-09:** Before calling `updateProductAction`, run `editProductFormSchema.safeParse(values)`. **Do not save while invalid** — keep inline RHF/Zod errors only; no error toast for validation (operator fixes field first).
- **D-10:** Skip network call if serialized values match **last successful save snapshot** (avoid redundant writes on re-render).
- **D-11:** Use existing `updateProductAction({ id, ...values })`; no new API. Ignore stale responses (monotonic save generation counter).

### Operator feedback (ROADMAP: toast on error)
- **D-12:** **Success: silent** — no success toast (per ROADMAP). Show subtle inline status near header: `Збереження…` while in-flight; brief muted **«Збережено»** (≈2s fade) after success.
- **D-13:** **Failure:** `toast.error` with existing `errorMessages` map (same strings as today). Clear inline status on error.

### Create page (`/admin/tovary/novyi`)
- **D-14:** **No changes** to create UX — manual «Зберегти» + «Скасувати» remain. Phase scope is edit-only.

### Photos section
- **D-15:** **No changes** to `ProductImageUpload` — images already persist on upload; not part of form auto-save batch.

### Claude's Discretion
User delegated all gray areas («все на твій вибір» — optimal, convenient, clear). Planner may adjust debounce ms (450–600) or extract `ProductEditHeader` / `useProductAutoSave` helpers but **must not** change D-01–D-15 semantics.

### Folded Todos
- **BUG-20** (v1.5 intake): `/admin/tovary/[id]` toolbar — auto-save, «Назад», trash delete vs Save/Cancel/На вітрині → fully covered by this phase.

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Requirements & roadmap
- `.planning/REQUIREMENTS.md` — ADM-PRD-05
- `.planning/ROADMAP.md` — Phase 24 goal and success criteria
- `.planning/todos/pending/bugfix-intake-2026-05-19-v1.5.md` — BUG-20 operator report

### Prior admin UX patterns
- `.planning/phases/23-admin-category-polish/23-CONTEXT.md` — icon + visible label; list delete / row navigation patterns

### Code touchpoints
- `src/app/(admin)/admin/tovary/[id]/page.tsx` — back link, header delete, layout
- `src/app/(admin)/admin/tovary/novyi/page.tsx` — create flow (unchanged)
- `src/components/admin/product-form.tsx` — auto-save watch, remove edit footer actions
- `src/components/admin/product-list-delete-button.tsx` — AlertDialog delete pattern to mirror
- `src/server/actions/admin/product.actions.ts` — `updateProductAction`, `deleteProductAction`
- `src/server/validators/admin-product.ts` — `editProductFormSchema`
- `src/lib/admin/products-url.ts` — back link + post-delete redirect with `categoryId`

### Reusable utilities
- `src/lib/catalog/throttle.ts` — reference for rate-limit pattern (phase uses debounce for form, not this throttle directly)

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `ProductListDeleteButton` — AlertDialog copy, `stopRowNav`, toast on error; mirror for header delete (without row stopPropagation).
- `adminProductsUrl({ categoryId })` — consistent filtered list URLs (Phase 23).
- `createProductAction` / `updateProductAction` — existing server actions; edit auto-save calls `updateProductAction` only.
- `ProductImageUpload` — independent persist; leave as-is below form.

### Established Patterns
- `react-hook-form` + `zodResolver` + `editProductFormSchema` on edit.
- Admin destructive actions: `toast` (sonner) + Ukrainian error map.
- Phase 23: Lucide icons with `aria-hidden`, visible Ukrainian text for navigation actions.

### Integration Points
- Edit page server component loads `product` + `categories`; passes `categoryId` for back link and delete redirect.
- `ProductOrdersSection` stays below form — no change.
- Remove `storefrontSlug` prop usage for «На вітрині» button (prop may be deleted if unused).

</code_context>

<specifics>
## Specific Ideas

Operator workflow: open product from category-filtered list → edit fields → changes persist without Save → «Назад» returns to same category filter → delete uses same mental model as list trash icon.

</specifics>

<deferred>
## Deferred Ideas

- Success toast on every save — rejected (noisy); inline «Збережено» only.
- `router.back()` for «Назад» — rejected (unpredictable); fixed category-filtered list URL.
- Auto-save on create page — out of phase scope (D-14).
- «Переглянути на вітрині» elsewhere (e.g. list row) — not in ADM-PRD-05; deferred unless new requirement.

</deferred>

---

*Phase: 24-product-edit-auto-save-ux*
*Context gathered: 2026-05-19*
