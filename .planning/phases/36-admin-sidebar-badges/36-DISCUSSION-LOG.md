# Phase 36: Admin sidebar badges - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-05-21
**Phase:** 36-admin-sidebar-badges
**Areas discussed:** Orders "висячі" rule, Categories/Products badges, Дзвінки "невирішені", Data fetching strategy

---

## Gray Areas Presented

| Area | Options presented | Selected |
|---|---|---|
| Orders "висячі" rule | PENDING only / PENDING+CONFIRMED+… (all active) | Delegated to Claude |
| Categories/products badge | Always show total / hide when 0 / show only when > 0 | Delegated to Claude |
| Дзвінки "невирішені" | PENDING && !archived / CONSULTED &&!archived also / any not archived | Delegated to Claude |

**User's response:** «роби все на свій смак, головне щоб зручно і гарно було»

---

## Claude's Decisions (user delegated all)

**Orders "висячі":** PENDING only — новий непідтверджений статус потребує дії оператора.

**Categories/products:** total count, hide when 0, secondary/muted style (informational, not red).

**Дзвінки:** PENDING && archivedAt IS NULL — тільки активно очікуючі.

**Data fetching:** одна агрегована `getAdminSidebarCounts()` via `prisma.$transaction`.

**Props API:** `badgeCounts: AdminSidebarBadgeCounts` об'єкт замість окремих props.

## Deferred Ideas

Жодних.
