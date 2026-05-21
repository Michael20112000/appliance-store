---
phase: 39
slug: calls-auto-save-categories-table-actions
status: approved
shadcn_initialized: true
preset: existing-admin
created: 2026-05-21
---

# Phase 39 — UI Design Contract

> Auto-save callback notes + categories table № and Дії columns. Locked by discuss-phase CONTEXT (D-01–D-18).

---

## Design System

| Property | Value |
|----------|-------|
| Tool | shadcn/ui (existing) |
| Preset | project admin tables |
| Component library | Radix via shadcn |
| Icon library | lucide-react (GripVertical on DnD only) |
| Font | project default (Geist) |

---

## Surfaces

### 1. Callback note (`/admin/dzvinky` — active rows)

| Element | Spec |
|---------|------|
| Control | `Textarea` rows=3, min-w 16rem, max-w md |
| Save trigger | Debounced 400ms after last keystroke — **no** «Зберегти» button |
| Status | `text-xs text-muted-foreground` under textarea, `aria-live="polite"` |
| Status copy | idle: empty; saving: «Збереження…»; saved: «Збережено» (2s then idle) — match `ProductEditHeader` |
| Success feedback | **No** success toast |
| Error feedback | `toast.error` only — ALREADY_ARCHIVED, NOT_FOUND, generic |
| On error | Keep typed text in field (no rollback) |
| Archived rows | Read-only truncated note — unchanged |

### 2. Categories table (`/admin/kategorii`)

| Column order | № → grip → Назва → Товари → Дії |
|--------------|----------------------------------|
| № column | 1-based index from `localCategories` after DnD; updates optimistically with reorder |
| Дії layout | `flex flex-wrap gap-2` with two `Button size="sm" variant="outline"` text labels |
| «Додати товар» | `Button asChild` + `Link` → `/admin/tovary/novyi?categoryId={id}` |
| «Видалити» | outline + destructive tone; opens `AlertDialog` (not `window.confirm`) |
| Row nav | All action clicks: `stopPropagation` + `suppressAdminRowNavigation` |
| Delete dialog | Mirror `ProductListDeleteButton` — title/description from category error map |

---

## Copywriting Contract

| Element | Copy |
|---------|------|
| Note placeholder | «Нотатка для оператора» |
| Save status saving | «Збереження…» |
| Save status saved | «Збережено» |
| Note error archived | «Заявку вже в архіві» |
| Note error not found | «Заявку не знайдено» |
| Note error generic | «Не вдалося зберегти нотатку» |
| Action add product | «Додати товар» |
| Action delete | «Видалити» |
| Delete dialog confirm | Category has products: block with mapped message; empty: irreversible delete confirmation |

---

## Spacing & Typography

Follow existing admin table patterns: `rounded-lg border`, `bg-muted/50` header, `px-2 py-2` cells, `text-sm` body.

---

## Color

Destructive actions: dialog + delete button use `destructive` variant tokens only — not row background.

---

## Registry Safety

| Registry | Blocks Used | Safety Gate |
|----------|-------------|-------------|
| shadcn official | Button, Textarea, AlertDialog | not required |

---

## Checker Sign-Off

- [x] Dimension 1 Copywriting: PASS
- [x] Dimension 2 Visuals: PASS
- [x] Dimension 3 Color: PASS
- [x] Dimension 4 Typography: PASS
- [x] Dimension 5 Spacing: PASS
- [x] Dimension 6 Registry Safety: PASS

**Approval:** approved 2026-05-21 (from discuss-phase CONTEXT)
