---
phase: 14
slug: admin-chat-context-menu
status: draft
shadcn_initialized: true
preset: "base-nova · base: neutral · cssVariables · Tailwind v4 · geist"
created: 2026-05-18
locale: uk
extends: 08-UI-SPEC.md
admin_chrome: bg-muted
---

# Phase 14 — UI Design Contract

> ПКМ по рядку inbox `/admin/chaty` → shadcn **ContextMenu** з lifecycle діями (архів / розархів / видалити). **DropdownMenu ⋮ у треді** лишається. Mobile: без ПКМ/long-press — дії через thread ⋮. Джерела: `14-CONTEXT.md` (D-14-01…D-14-16), `08-UI-SPEC.md`, `chat-thread.tsx`, `conversation-list.tsx`.

**Out of scope:** ⋮ на рядку списку, long-press mobile, нові server actions, зміни buyer chat.

---

## Design System

| Property | Value |
|----------|-------|
| Tool | shadcn/ui |
| New component | `context-menu` via `npx shadcn@latest add context-menu` |
| Reuse | `alert-dialog`, `dropdown-menu` (thread only), `button`, existing chat layout |
| Breakpoint | `md` — context menu **desktop only** (pointer fine / not mobile stack) |

---

## Inbox Row + Context Menu

### Trigger

| Element | Spec |
|---------|------|
| Wrapper | `ContextMenu` per row; `ContextMenuTrigger` wraps row **without** breaking `role="listbox"` / `role="option"` |
| Row | Existing `<button role="option">` — left click → `onSelect`; `onContextMenu` → `preventDefault()` |
| Native menu | Blocked on row context menu |

### Menu content

| Item | Visibility | Variant |
|------|------------|---------|
| Архівувати | `view === "active"` && `status === "OPEN"` | default |
| Повернути з архіву | `view === "archive"` && `status === "ARCHIVED"` | default |
| Видалити назавжди | always | `destructive` |

**Copy:** ідентично `chat-thread.tsx` DropdownMenu + AlertDialog (UA).

### Post-action

| Action | UX |
|--------|-----|
| Archive / Delete | `clearSelectionAndRefresh()` + success toast |
| Unarchive | `refreshInbox()` + success toast |
| Delete | `AlertDialog` confirm before mutation |

### Mobile (`< md`)

| Behavior | Spec |
|----------|------|
| Context menu | **Not shown** — no long-press, no row ⋮ |
| Lifecycle | Thread header `DropdownMenu` (Phase 8) unchanged |

---

## Shared Module

Extract from `chat-thread.tsx`:

- Handlers + `useTransition` + delete `AlertDialog` + toasts
- Consumer: `ChatThread` (DropdownMenu) + `ConversationList` row (ContextMenu)
- **No visual change** to thread header ⋮

---

## Accessibility

| Requirement | Spec |
|-------------|------|
| Listbox | Preserve `role="listbox"` on container, `role="option"` on rows |
| Menu label | `aria-label="Дії з діалогом"` (align thread trigger) |
| Keyboard lifecycle on list | Deferred — open thread → ⋮ |
| Focus | shadcn ContextMenu focus trap when open |

---

## Verification (UI)

| Check | Method |
|-------|--------|
| Desktop ПКМ opens menu | e2e `admin-chat.spec.ts` |
| Left click still selects | e2e / manual |
| Delete shows confirm | e2e |
| Mobile viewport | no context menu; thread ⋮ works |

---

*Phase: 14-admin-chat-context-menu · extends Phase 8 admin chat UI*
