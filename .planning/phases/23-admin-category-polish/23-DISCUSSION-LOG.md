# Phase 23: Admin category polish - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-05-19
**Phase:** 23-Admin category polish
**Areas discussed:** edit icons, list column, row-click, empty count (all via Claude discretion)

---

## Edit toolbar icons

| Option | Description | Selected |
|--------|-------------|----------|
| Icon-only + aria-label | Compact toolbar | |
| Icon + visible label | Matches «Додати категорію» list pattern | ✓ |
| Text only (status quo) | No icon change | |

**User's choice:** Delegated to Claude — icon + label with Eye/Plus.
**Notes:** Edit page already has correct URLs; only affordance polish.

---

## List «Товари» column

| Option | Description | Selected |
|--------|-------------|----------|
| Add column, keep «Товарів» count | Two columns | |
| Replace with link + count hint | Single «Товари» column | ✓ |
| Link only, drop count | Loses at-a-glance inventory | |

**User's choice:** Delegated — «Переглянути (N)» in one column.

---

## Row-click vs «Переглянути»

| Option | Description | Selected |
|--------|-------------|----------|
| stopPropagation + suppressAdminRowNavigation | Same as products table | ✓ |
| Separate non-clickable column outside row | Heavier layout change | |

**User's choice:** Delegated — reuse clickable-table-row helpers.

---

## Zero products

| Option | Description | Selected |
|--------|-------------|----------|
| Always show link | Empty filter OK | ✓ |
| Hide/disable at 0 | Blocks intentional empty view | |

**User's choice:** Delegated — always show «Переглянути (0)».

---

## Claude's Discretion

User reply: «все на твій вибір» — all four areas resolved with recommendations above.

## Deferred Ideas

None captured in this session.
