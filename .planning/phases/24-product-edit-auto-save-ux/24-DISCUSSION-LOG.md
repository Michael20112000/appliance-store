# Phase 24: Product edit auto-save UX - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-05-19
**Phase:** 24-product-edit-auto-save-ux
**Areas discussed:** Auto-save timing, Save feedback, Back navigation, Invalid fields, Create page scope (all via Claude discretion)

---

## Auto-save timing & trigger

| Option | Description | Selected |
|--------|-------------|----------|
| Throttle 200ms all fields | Catalog price pattern | |
| Debounce 500ms + blur flush on text | Balanced; fewer API calls, prompt on leave | ✓ |
| Save on blur only | Slower perceived sync on selects | |

**User's choice:** Claude discretion — debounce 500ms + blur flush for title/description
**Notes:** Skip save when values unchanged vs last success; ignore stale responses.

---

## Operator feedback

| Option | Description | Selected |
|--------|-------------|----------|
| Silent success only | ROADMAP strict | |
| Inline «Збереження…» / «Збережено» + toast on error | Clear without toast spam | ✓ |
| Toast on every save | Too noisy | |

**User's choice:** Claude discretion — inline status + error toast only

---

## «Назад» destination

| Option | Description | Selected |
|--------|-------------|----------|
| `/admin/tovary` | Simple | |
| Filtered list by product.categoryId | Matches category workflow from Phase 23 | ✓ |
| router.back() | Unpredictable | |

**User's choice:** Claude discretion — `adminProductsUrl({ categoryId })`

---

## Invalid fields during auto-save

| Option | Description | Selected |
|--------|-------------|----------|
| No API until full form valid | Safe; inline errors only | ✓ |
| Partial save valid fields | Complex; confusing | |
| Toast on validation fail | Noisy | |

**User's choice:** Claude discretion — safeParse gate, no save while invalid

---

## Create page `/novyi`

| Option | Description | Selected |
|--------|-------------|----------|
| Unchanged (manual Save) | Edit-only phase | ✓ |
| Same auto-save as edit | Out of scope | |

**User's choice:** Claude discretion — create unchanged (D-14)

---

## Claude's Discretion

User: «все на твій вибір, дивись аби оптимально і зручно і зрозуміло було» — all five areas decided with operator-first defaults documented as D-01–D-15 in CONTEXT.md.

## Deferred Ideas

- Storefront preview link from edit header — not in ADM-PRD-05
- Auto-save on create — future phase if requested
