# Roadmap: Appliance Store Lviv

## Milestones

- [ ] **v2.2 Bugfixes & Small Features** — Phases 41–43 (active)
- ✅ **v2.1 Fixes & UX** — Phases 37–40 (shipped 2026-05-21) — [archive](milestones/v2.1-ROADMAP.md) · [requirements](milestones/v2.1-REQUIREMENTS.md)
- ✅ **v2.0 Polish, UX & Admin analytics** — Phases 28–36 (shipped 2026-05-21) — [archive](milestones/v2.0-ROADMAP.md) · [requirements](milestones/v2.0-REQUIREMENTS.md)
- ✅ **v1.5 Incremental polish & operator UX** — Phases 22–27 (shipped 2026-05-19) — [archive](milestones/v1.5-ROADMAP.md) · [requirements](milestones/v1.5-REQUIREMENTS.md)
- ✅ **v1.4 Bugfix stabilization** — Phase 21 (shipped 2026-05-19) — [archive](milestones/v1.4-ROADMAP.md) · [requirements](milestones/v1.4-REQUIREMENTS.md)
- ✅ **v1.3 Fixes & Admin UX** — Phases 17–20 (shipped 2026-05-19) — [archive](milestones/v1.3-ROADMAP.md) · [requirements](milestones/v1.3-REQUIREMENTS.md)
- ✅ **v1.2 Polish & UX** — Phases 11–16 (shipped 2026-05-19) — [archive](milestones/v1.2-ROADMAP.md) · [requirements](milestones/v1.2-REQUIREMENTS.md)
- ✅ **v1.1 Engagement & Fixes** — Phases 7–10 (shipped 2026-05-17) — [archive](milestones/v1.1-ROADMAP.md) · [requirements](milestones/v1.1-REQUIREMENTS.md)
- ✅ **v1.0 Appliance Store MVP** — Phases 1–6 (shipped 2026-05-17) — [archive](milestones/v1.0-ROADMAP.md) · [requirements](milestones/v1.0-REQUIREMENTS.md)

## Phases

### v2.2 Bugfixes & Small Features (Phases 41–43)

- [ ] **Phase 41: Social Links** — Telegram, Viber, WhatsApp icons in header, mobile drawer, and footer
- [ ] **Phase 42: Floating Action Buttons** — Persistent cart FAB and callback FAB with phone dialog
- [ ] **Phase 43: Slider Fix, Animations & Footer Bug** — Price slider step/snap, storefront fade animations, footer address link fix

<details>
<summary>✅ v2.1 Fixes & UX (Phases 37–40) — SHIPPED 2026-05-21</summary>

- [x] Phase 37: Dashboard StatCards — 1/1 plans complete
- [x] Phase 38: Dashboard Data Completeness — 2/2 plans complete
- [x] Phase 39: Calls Auto-save & Categories Table Actions — 2/2 plans complete
- [x] Phase 40: Category Edit UX — 2/2 plans complete

Full phase details: [milestones/v2.1-ROADMAP.md](milestones/v2.1-ROADMAP.md)

</details>

<details>
<summary>✅ v2.0 Polish, UX & Admin analytics (Phases 28–36) — SHIPPED 2026-05-21</summary>

- [x] Phase 28: Nav, homepage & catalog labels — 4/4 plans complete
- [x] Phase 29: Product cards & PDP core UX — 3/3 plans complete
- [x] Phase 30: Similar products & footer layout — 2/2 plans complete
- [x] Phase 31: Order status UX & bugfix — 1/1 plans complete
- [x] Phase 32: Admin dashboard polish — 1/1 plans complete
- [x] Phase 33: Admin categories DnD & links — 4/4 plans complete
- [x] Phase 34: Admin analytics — 5/5 plans complete
- [x] Phase 35: Callback calls (Дзвінки) — 3/3 plans complete
- [x] Phase 36: Admin sidebar badges — 3/3 plans complete

Full phase details: [milestones/v2.0-ROADMAP.md](milestones/v2.0-ROADMAP.md)

</details>

## Phase Details

### Phase 41: Social Links
**Goal**: Users can reach the store on Telegram, Viber, and WhatsApp from any page surface
**Depends on**: Nothing (first phase of v2.2)
**Requirements**: SOC-01, SOC-02, SOC-03
**Success Criteria** (what must be TRUE):
  1. User sees three social icons (Telegram, Viber, WhatsApp) in the site header on desktop and mobile
  2. User sees the same three social icons in the mobile navigation drawer
  3. User sees the same three social icons in the footer
  4. Clicking any social icon opens the correct external link (mock URL acceptable for v2.2)
**Plans**: 1 plan
Plans:
- [x] 41-01-PLAN.md — Create constants, SVG icons, SocialNavLinks cluster, and integrate into header/drawer/footer

### Phase 42: Floating Action Buttons
**Goal**: Users always have one-tap access to the cart and store callback from any storefront page
**Depends on**: Phase 41
**Requirements**: FAB-01, FAB-02
**Success Criteria** (what must be TRUE):
  1. User sees a floating cart button in the bottom-left zone on every storefront page, including when the cart is empty
  2. User sees a floating callback button alongside the cart button in the bottom-left zone
  3. User can click the callback FAB to open a dialog showing the store phone number and a field to enter their own phone number
  4. The floating buttons do not appear on admin pages
**Plans**: TBD
**UI hint**: yes

### Phase 43: Slider Fix, Animations & Footer Bug
**Goal**: The price slider behaves correctly, storefront pages have subtle transitions, and the footer address link works
**Depends on**: Phase 41
**Requirements**: SLIDER-01, ANIM-01, BUG-25
**Success Criteria** (what must be TRUE):
  1. User dragging the catalog price slider moves in 50 UAH increments and the handles snap back to the real catalog min/max at the extremes
  2. User navigating between storefront pages sees a subtle fade transition (admin navigation is unaffected)
  3. User clicking the address in the footer is taken to a standard Google Maps URL, not an embed API URL
  4. Storefront animations are non-intrusive and do not play when the user has reduced motion enabled
**Plans**: TBD
**UI hint**: yes

## Progress

| Phase | Milestone | Plans Complete | Status | Completed |
|-------|-----------|----------------|--------|-----------|
| 41. Social Links | v2.2 | 1/1 | Complete   | 2026-05-22 |
| 42. Floating Action Buttons | v2.2 | 0/? | Not started | - |
| 43. Slider Fix, Animations & Footer Bug | v2.2 | 0/? | Not started | - |
| 37. Dashboard StatCards | v2.1 | 1/1 | Complete | 2026-05-21 |
| 38. Dashboard Data Completeness | v2.1 | 2/2 | Complete | 2026-05-21 |
| 39. Calls Auto-save & Categories Table Actions | v2.1 | 2/2 | Complete | 2026-05-21 |
| 40. Category Edit UX | v2.1 | 2/2 | Complete | 2026-05-21 |
