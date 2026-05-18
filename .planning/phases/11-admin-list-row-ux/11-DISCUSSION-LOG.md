# Phase 11: Admin List Row UX - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-05-18
**Phase:** 11-Admin List Row UX
**Areas discussed:** Unified row-click pattern, Dashboard scope, Plus on CTAs, Categories implementation (minimal client), Row hover/focus classes, stopPropagation rule

---

## Unified row-click pattern

| Option | Description | Selected |
|--------|-------------|----------|
| Shared module / one pattern | Single canonical contract; extract from products table | ✓ |
| Copy-paste per table | Repeat products pattern independently in each file | |

**User's choice:** Один патерн (shared, not three different approaches)
**Notes:** Reference implementation remains `admin-products-table.tsx`.

---

## Dashboard «Останні замовлення»

| Option | Description | Selected |
|--------|-------------|----------|
| Include dashboard | Remove «Відкрити», add row-click | ✓ |
| ROADMAP pages only | Skip `/admin` dashboard table | |

**User's choice:** Теж прибрати «Відкрити» + row-click для консистентності

---

## Plus on create CTAs

| Option | Description | Selected |
|--------|-------------|----------|
| Plus left, size-4, same Button variant | lucide Plus before label | ✓ |
| Other placement/styling | — | |

**User's choice:** ok (confirmed D-11-09/10)

---

## Categories row-click (client budget)

| Option | Description | Selected |
|--------|-------------|----------|
| Minimal client project-wide | Smallest client boundary or server-friendly nav | ✓ |
| Full client page / useRouter everywhere | — | |

**User's choice:** Мінімум клієнського коду має бути, це стосується всього проекту

---

## Orders/dashboard row hover & focus

| Option | Description | Selected |
|--------|-------------|----------|
| Same classes as products table | hover/focus-visible muted background | ✓ |
| cursor-pointer only | — | |

**User's choice:** Ті самі класи

---

## Interactive controls in rows

| Option | Description | Selected |
|--------|-------------|----------|
| Always stopPropagation | Mandatory for any in-row control | ✓ |
| Case-by-case | — | |

**User's choice:** будь-який control в рядку завжди stopPropagation

---

## Claude's Discretion

- Shared module shape (helper vs component)
- Exact minimal-client strategy for categories and dashboard tables
- Plus on dashboard outline «Додати товар» (optional)

## Deferred Ideas

None.
