# Phase 23: Admin category polish — UI Design Contract

**Created:** 2026-05-19  
**Status:** Approved (derived from discuss-phase CONTEXT)

## Scope

Admin category list and edit toolbar only. No new routes or CRUD flows.

## Edit category toolbar (ADM-CAT-03)

| Control | Icon (lucide) | Visible label | Target |
|---------|---------------|---------------|--------|
| View products | `Eye` | Переглянути товари | `/admin/tovary?categoryId={id}` |
| Add product | `Plus` | Додати товар | `/admin/tovary/novyi?categoryId={id}` |

- Pattern: match `/admin/kategorii` header — icon `size-4` + `aria-hidden`, label text provides accessible name (not icon-only).
- Buttons: existing `Button size="sm"`; outline on view, default on add (unchanged variants).

## Category list table (ADM-CAT-04)

| Column header | Cell content |
|---------------|--------------|
| Товари (replaces «Товарів») | `Link` «Переглянути» + muted ` ({productCount})` |

- Example copy: `Переглянути (12)` or `Переглянути (0)`.
- Link href: `adminProductsUrl({ categoryId: id })` from `products-url.ts`.
- Row click: still navigates to `/admin/kategorii/{id}`; link must not trigger row navigation (stopPropagation + optional suppress pattern per D-07).

## Interaction

- No separate «Редагувати» control on list rows.
- Spacing: `px-4 py-2` table cells unchanged unless needed for link tap target.

## Verification (visual)

1. Edit page: both toolbar buttons show Eye/Plus + Ukrainian labels.
2. List: «Товари» column with working filter link; row click still opens edit.
