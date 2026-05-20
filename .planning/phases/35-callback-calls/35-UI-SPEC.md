---
phase: 35
slug: callback-calls
status: draft
shadcn_initialized: true
preset: base-nova (style), neutral baseColor, cssVariables, lucide icons
created: 2026-05-20
---

# Phase 35 — Callback calls (Дзвінки) — UI Design Contract

> Admin `/admin/dzvinky`: dedicated callback workspace — active/archive tabs, status select, inline note, archive action. Migrate off `/admin/nalashtuvannia`. Storefront callback form unchanged.

---

## Design System

| Property | Value |
|----------|-------|
| Tool | shadcn + Tailwind 4 |
| Components | `Select`, `Textarea`, `Button` — existing `@/components/ui/*` |
| Feedback | sonner `toast.success` / `toast.error` on save/archive/status |
| Icons | `Phone` (sidebar nav, lucide) |

---

## Page layout (CALL-01, D-01)

| Element | Spec |
|---------|------|
| H1 | «Дзвінки» — `text-2xl font-semibold` (match `/admin/zamovlennia`) |
| Subcopy | Optional one line `text-sm text-muted-foreground` — e.g. «Заявки на зворотний дзвінок з сайту» |
| Section spacing | `space-y-8` page wrapper |

---

## View tabs (CALL-04, D-02)

Pattern: `OrderListFilters` Link chips — **not** shadcn Tabs.

| Tab | URL | Filter |
|-----|-----|--------|
| Активні (default) | `/admin/dzvinky` or `?view=active` | `archivedAt IS NULL` |
| Архів | `?view=archive` | `archivedAt IS NOT NULL` |

Chip styles: same as orders — `rounded-md border px-3 py-1.5 text-sm`; active = `border-primary bg-primary text-primary-foreground`.

Optional counts in labels: `Активні (N)` / `Архів (N)` if cheap to fetch.

---

## Table columns

| Column | Content | Notes |
|--------|---------|-------|
| Телефон | `formatUaPhoneDisplay` | `tabular-nums` |
| Дата | `createdAt` uk-UA short | `text-muted-foreground` |
| Статус | `CallbackListStatusSelect` | Only on **active** view (archive: read-only badge or static text) |
| Нотатка | `Textarea` 2–3 rows + «Зберегти» | Active view only; archive shows truncated note or «—» |
| Дії | «В архів» button | Active + status = CONSULTED only |

Table shell: reuse `CallbackRequestsTable` border/thead pattern (`overflow-x-auto rounded-md border`).

Empty states:
- Active: «Немає активних заявок»
- Archive: «Архів порожній»

---

## Status select (CALL-02, D-06–D-08)

| Value | Label UA |
|-------|----------|
| `PENDING` | Очікує на дзвінок |
| `CONSULTED` | Проконсультовано |

Reference: `order-list-status-select.tsx` — `Select` `size="sm"`, `min-w-[12rem]`, server action + toast on error.

Optional light accent on trigger (planner discretion):
- PENDING: `bg-amber-50 border-amber-200`
- CONSULTED: `bg-emerald-50 border-emerald-200`

---

## Note field (CALL-03, D-09)

| Property | Value |
|----------|-------|
| Control | `Textarea` `rows={3}` `className="min-w-[16rem] max-w-md"` |
| Save | Adjacent `Button` variant `outline` size `sm` — «Зберегти» |
| Disabled | While pending save (optional spinner on button) |

No auto-save on blur.

---

## Archive action (CALL-04, D-04)

| State | UI |
|-------|-----|
| status !== CONSULTED | Button disabled + `title` tooltip: «Спочатку позначте як проконсультовано» |
| status === CONSULTED | Enabled «В архів» — `variant="outline"` `size="sm"` |
| Archive view | No archive button; no status edit (read-only) |

Confirm dialog: **not required** v1 (single-step archive).

---

## Sidebar nav (D-11)

| Label | href | Icon | Position |
|-------|------|------|----------|
| Дзвінки | `/admin/dzvinky` | `Phone` | After «Чати», before «Налаштування» |

No badge in Phase 35 (Phase 36).

---

## Accessibility

- Status labels are text-primary; color accents decorative only.
- Disabled archive: `aria-disabled` + visible disabled styling.
- Table headers: `<th scope="col">`.

---

## Out of scope (UI)

- Sidebar unresolved count badge (Phase 36)
- Unarchive, pagination, phone search
- Storefront callback modal changes
- Bulk status / bulk archive
