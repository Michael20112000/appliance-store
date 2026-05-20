# Phase 32: Admin dashboard polish - Context

**Gathered:** 2026-05-20
**Status:** Ready for planning

<domain>
## Phase Boundary

Admin dashboard at `/admin`: action buttons gain icons and correct variants; stat cards gain lucide icons. Operator can orient at a glance — what needs attention (orders, stock) — without changing the information model.

**In scope (requirements):** ADM-DASH-03, ADM-DASH-04 — per `.planning/REQUIREMENTS.md` and ROADMAP Phase 32 success criteria.

**Out of scope:** Analytics preview (Phase 34 AN-02), sidebar badges (Phase 36), new stat metrics, data model changes.

</domain>

<decisions>
## Implementation Decisions

### ADM-DASH-03 — action buttons
- **D-01:** "Додати товар" → `default` (primary blue) variant + `<Plus className="size-4" aria-hidden />` icon, **default size** (no `size` prop). Matches the tovary page pattern exactly.
- **D-02:** "Переглянути замовлення" → `outline` variant + `<Eye className="size-4" aria-hidden />` icon, **default size**.
- **D-03:** Both buttons keep `render={<Link href="..." />}` pattern (existing shadcn/Next.js convention in this codebase).

### ADM-DASH-04 — stat card icons
- **D-04:** Icon choices: "Нові замовлення" → `ShoppingBag`; "Товари в наявності" → `Package`; "Розпродано" → `PackageX`. All from `lucide-react`.
- **D-05:** Icon placement: top-right corner of the card, `text-muted-foreground`, `size-5`. `StatCard` receives an optional `icon` prop (`React.ElementType`); when absent, card renders as before (no breaking change for future uses without icons).
- **D-06:** Icon is decorative — `aria-hidden`. No accessible label change needed on the card.

### Claude's Discretion
- All design decisions delegated by user ("роби на свій вибір аби було зручно і гарно"). Icon size, exact positioning, whether icon sits in a flex row alongside the label or floats top-right — all at Claude's discretion within the constraints above.

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Requirements & roadmap
- `.planning/REQUIREMENTS.md` — ADM-DASH-03, ADM-DASH-04
- `.planning/ROADMAP.md` — Phase 32 goal and success criteria

### Primary code touchpoints
- `src/app/(admin)/admin/page.tsx` — dashboard page (buttons + StatCard usage)
- `src/components/admin/stat-card.tsx` — StatCard component to extend with icon prop
- `src/app/(admin)/admin/tovary/page.tsx` — reference for button variant/size pattern

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `StatCard` (`src/components/admin/stat-card.tsx`) — add optional `icon: React.ElementType` prop; render icon top-right when present
- `Button` + `render={<Link>}` pattern — already used in dashboard and tovary, keep as-is
- lucide-react already installed; `Plus` imported in tovary; add `Eye`, `ShoppingBag`, `Package`, `PackageX` in dashboard

### Established Patterns
- Lucide icons: `<Icon className="size-4" aria-hidden />` in buttons; `size-5` acceptable for decorative card icons
- `Button` default variant = blue primary; `outline` = secondary action
- `cn()` utility for conditional class merging in components

### Integration Points
- `admin/page.tsx` is a server component — no client-side state needed for these changes
- `StatCard` is purely presentational — adding an optional icon prop is backwards-compatible

</code_context>

<specifics>
## Specific Ideas

- User delegated all aesthetic decisions ("роби на свій вибір аби було зручно і гарно")
- Reference: `/admin/tovary` Add button is the exact model for "Додати товар" on dashboard

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope.

</deferred>

---

*Phase: 32-Admin dashboard polish*
*Context gathered: 2026-05-20*
