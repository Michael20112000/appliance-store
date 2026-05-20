# Phase 32: Admin dashboard polish - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-05-20
**Phase:** 32-admin-dashboard-polish
**Areas discussed:** Stat card icons, Button size on dashboard

---

## Gray Area Selection

| Area | Description | Selected |
|------|-------------|----------|
| Stat card icons | Which lucide icons for each stat, and where in the card | Delegated |
| Button size on dashboard | Keep size="sm" or match tovary default | Delegated |

**User's choice:** "Роби все на свій вибір аби було зручно і гарно" — full discretion delegated to Claude.

---

## Claude's Discretion

User delegated all design decisions. Claude chose:

- **"Додати товар" button:** `default` (primary blue) variant + `<Plus>` icon, default size — matches `/admin/tovary` exactly as required
- **"Переглянути замовлення" button:** `outline` variant + `<Eye>` icon, default size — secondary action, visually paired with primary Add button
- **Stat card icons:** `ShoppingBag` (нові замовлення), `Package` (в наявності), `PackageX` (розпродано)
- **Icon placement in card:** top-right corner, `text-muted-foreground`, `size-5`, `aria-hidden`
- **StatCard API:** optional `icon: React.ElementType` prop — backwards-compatible, defaults to no-icon behavior

## Deferred Ideas

None — discussion stayed within phase scope.
