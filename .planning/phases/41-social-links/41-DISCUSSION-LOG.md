# Phase 41: Social Links - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-05-21
**Phase:** 41-social-links
**Areas discussed:** Icon source, Visual treatment, Placement in surfaces, URL configuration

---

## All Areas

| Option | Description | Selected |
|--------|-------------|----------|
| Icon source | react-icons library, inline SVGs, or SVG files | |
| Visual treatment | Brand colors vs monochrome | |
| Placement in surfaces | Where in header/drawer/footer | |
| URL configuration | Hardcoded constants vs env vars vs DB | |

**User's choice:** "Ти красавчик, роби все на свій розсуд. Головне щоб було гарно і зручно"
("Do everything at your discretion — main thing is it looks good and is convenient")

**Notes:** Full discretion delegated to Claude for all areas.

---

## Claude's Discretion

All decisions were made by Claude based on codebase analysis and UX best practices:

- **Icon source** → Inline SVG components in `src/components/icons/social-icons.tsx` (no new dependency)
- **Visual treatment** → Always-on brand colors (Telegram #2AABEE, Viber #7360F2, WhatsApp #25D366)
- **Header placement** → Right-side icons cluster, before WishlistNavLink; hidden on mobile
- **Drawer placement** → After StorefrontAuthLinks, below a new Separator
- **Footer placement** → Between contacts grid and copyright line
- **URL storage** → Constants in `src/lib/social-links.ts` with placeholder URLs

## Deferred Ideas

None.
