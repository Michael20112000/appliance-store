---
phase: 16
slug: shadcn-select-audit-verify
status: draft
shadcn_initialized: true
preset: "base-nova · base: neutral · cssVariables · Tailwind v4 · geist"
created: 2026-05-19
locale: uk
extends: 02-UI-SPEC.md
---

# Phase 16 — UI Design Contract

> Міграція 5 native `<select>` на shadcn `Select`; verify PDP gallery + auto slug policy. Джерела: `16-CONTEXT.md` (D-16-01…D-16-21), `order-list-status-select.tsx`, `02-UI-SPEC.md`.

**Out of scope:** нові фільтри, gallery redesign, swipe gestures, shared FormSelect wrapper, checkout UI.

---

## Select Migration (UX-01)

### Storefront catalog toolbar — sort

| Property | Spec |
|----------|------|
| Component | `@/components/ui/select` controlled via nuqs |
| Trigger width | `w-36` or `w-[9rem]` (compact, inline with count) |
| `aria-label` | `Сортування` (unchanged) |
| Options | `novi` → «Новіші»; `cina-asc` → «Ціна ↑»; `cina-desc` → «Ціна ↓» |
| onChange | `setParams({ sort, storinka: 1 })` |

### Storefront catalog filters — brand

| Property | Spec |
|----------|------|
| Trigger | `w-full` in sidebar section |
| «Усі бренди» | `SelectItem` with sentinel `__all__`; map to `brend: null` |
| onChange | `setParams({ brend: value \| null, storinka: 1 })` |

### Admin product form — categoryId, condition, status

| Property | Spec |
|----------|------|
| Pattern | react-hook-form `Controller` + `Select` / `SelectTrigger` / `SelectValue` / `SelectContent` / `SelectItem` |
| Trigger | `className="w-full"` on each `SelectTrigger` (match `Input`) |
| Labels | UA via `conditionLabelUa`, category `name`, status «Чернетка» / «В наявності» |
| No wrapper | Inline in `product-form.tsx` only (D-16-04) |

---

## Auto Slug (POL-02)

| Mode | UI |
|------|-----|
| Product create | No slug input; hint under title: «URL згенерується з назви» (or existing copy) |
| Product edit | Read-only line: `URL: /tovar/{slug}` — no slug field |
| Category create/edit | No slug field (already) |

---

## PDP Gallery Verify (POL-01)

Manual checklist `16-MANUAL-CHECKLIST.md` — desktop + mobile ~375px:

1. Single image PDP
2. 3+ images — carousel thumbs + main
3. Tap main → Dialog lightbox; arrows; thumb sync after close

**Fix only blocking bugs** found during pass. Swipe = nice-to-have, not gate.

---

## Grep Gate

After migration: `grep -r '<select' src/components` → 0 matches (D-16-11).

---

## Build Gate (D-16-21)

`npm run build` + `npm run test` green before phase close.
