# Phase 14: Admin Chat Context Menu - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-05-18
**Phase:** 14-admin-chat-context-menu
**Areas discussed:** component, shared_logic, mobile, post_action, a11y

---

## Context menu component

| Option | Description | Selected |
|--------|-------------|----------|
| ContextMenu (shadcn) | Install `context-menu`; semantic RCM on inbox row | ✓ |
| DropdownMenu on RCM | Reuse dropdown with `onContextMenu` | |

**User's choice:** shadcn ContextMenu
**Notes:** Thread header keeps existing DropdownMenu ⋮.

---

## Shared lifecycle logic

| Option | Description | Selected |
|--------|-------------|----------|
| Extract shared hook/component | Single source for archive/unarchive/delete + AlertDialog | ✓ |
| Duplicate handlers in list | Copy from chat-thread | |

**User's choice:** Extract shared module (orchestrator recommendation; user selected "all areas")
**Notes:** Same server actions; parity with thread menu visibility rules.

---

## Mobile / touch

| Option | Description | Selected |
|--------|-------------|----------|
| Desktop RCM only | No long-press; mobile uses thread ⋮ | ✓ |
| Row kebab everywhere | Visible ⋮ on each list row | |

**User's choice:** Desktop RCM only; mobile — thread ⋮ only

---

## Post-action behavior

| Option | Description | Selected |
|--------|-------------|----------|
| Mirror thread | clearSelectionAndRefresh / refreshInbox + toasts | ✓ |

**User's choice:** Same as thread (via shared hook)

---

## Accessibility

| Option | Description | Selected |
|--------|-------------|----------|
| listbox + ContextMenu; keyboard via thread ⋮ | No extra row kebab for keyboard | ✓ |

**User's choice:** Accept planner discretion on ContextMenuTrigger wrapping vs row button.

---

## Deferred Ideas

- Per-row ⋮ on mobile/desktop
- Long-press RCM on mobile
- Dedicated keyboard menu on list row
