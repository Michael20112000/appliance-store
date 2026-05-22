# Phase 41: Social Links - Context

**Gathered:** 2026-05-21
**Status:** Ready for planning

<domain>
## Phase Boundary

Add Telegram, Viber, and WhatsApp icon links to three storefront surfaces: site header, mobile drawer, and footer. Uses mock URLs for v2.2; real URLs to be supplied by the operator. No DB schema changes. Admin pages excluded.

Requirements: SOC-01 (header), SOC-02 (mobile drawer), SOC-03 (footer).

</domain>

<decisions>
## Implementation Decisions

### Icon Source
- **D-01:** Create custom inline SVG components in `src/components/icons/social-icons.tsx` — `TelegramIcon`, `ViberIcon`, `WhatsAppIcon`. No new npm dependency (react-icons would add 1MB+ for 3 icons).

### Visual Treatment
- **D-02:** Always-on brand colors: Telegram `#2AABEE`, Viber `#7360F2`, WhatsApp `#25D366`. Social icons are the one context where brand colors are expected and aid recognition. All other UI icons stay monochrome.
- **D-03:** Icon size matches existing nav icons (e.g., `size-5` or `w-5 h-5`). Icon buttons use the same accessible pattern as `WishlistNavLink` (aria-label, min touch target).

### Placement — Header (SOC-01)
- **D-04:** Social icons appear in the **right-side icons cluster** of the desktop header, inserted **before** `WishlistNavLink`. Hidden on mobile — the mobile drawer (SOC-02) handles that surface.
- **D-05:** Rendered as `<a href="..." target="_blank" rel="noopener noreferrer">` icon buttons.

### Placement — Mobile Drawer (SOC-02)
- **D-06:** Social icons appear **after** the `StorefrontAuthLinks` section, below the last `<Separator>`. A labeled row "Ми в соцмережах" or just the icon buttons in a row — visual presentation at Claude's discretion, but keep it compact (drawer is already dense).

### Placement — Footer (SOC-03)
- **D-07:** Social icons appear in a new row **between the contacts/callback grid and the copyright line**, spanning full width (or centered on desktop). A short label ("Ми в соцмережах") precedes the icon row.

### URL Configuration
- **D-08:** Mock URLs stored as constants in `src/lib/social-links.ts`. Exports `SOCIAL_LINKS = { telegram: "...", viber: "...", whatsapp: "..." }`. Operator updates this file when real URLs are available. No env vars, no DB — simplest for v2.2.

### Claude's Discretion
- All decisions above were delegated by the user ("do everything at your discretion, main thing is it looks good and is convenient").
- Exact icon button wrapper styling (hover states, gap between icons) — match the existing action icon aesthetic in the header.
- Drawer: label vs icon-only, exact Separator positioning — keep it consistent with the drawer's existing visual rhythm.

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Existing Layout Components
- `src/components/layout/store-header.tsx` — Header structure; social icons go in the right-side div before `WishlistNavLink`
- `src/components/layout/store-footer.tsx` — Footer structure; social icons go between contacts grid and copyright `<p>`
- `src/components/layout/store-mobile-nav.tsx` — Drawer structure; social icons go after `StorefrontAuthLinks` with a new `<Separator>` above

### Requirements
- `.planning/REQUIREMENTS.md` — SOC-01, SOC-02, SOC-03 acceptance criteria

### Pattern Reference (for icon button style)
- `src/components/wishlist/wishlist-nav-link.tsx` — Existing icon button pattern to mirror (aria-label, size, touch target)

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `src/components/ui/separator.tsx` — Already used in drawer; use for the social links section separator
- `src/components/ui/badge.tsx` — Not needed here
- Existing icon button pattern from `WishlistNavLink` / `CartNavLink` — mirror for aria-label and sizing

### Established Patterns
- Icon buttons in the header right-side cluster use `min-h-11 min-w-11` for touch targets
- External links use `target="_blank" rel="noopener noreferrer"`
- `store-header.tsx` and `store-footer.tsx` are server components — social links are static, no client state needed
- `store-mobile-nav.tsx` is a client component — can add social links as static JSX

### Integration Points
- `store-header.tsx` → add icons in the `<div className="flex items-center gap-2">` before `WishlistNavLink`
- `store-mobile-nav.tsx` → add after `<StorefrontAuthLinks>` with a new `<Separator className="my-6" />`
- `store-footer.tsx` → add above the copyright `<p className="mt-8 ...">` tag

</code_context>

<specifics>
## Specific Ideas

- SVG sources for the three brand icons are freely available under their respective brand guidelines; use official brand colors.
- Keep icon size consistent across all three surfaces (e.g., `w-6 h-6`).
- Footer label: "Ми в соцмережах" (Ukrainian, consistent with app locale).

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope.

</deferred>

---

*Phase: 41-social-links*
*Context gathered: 2026-05-21*
