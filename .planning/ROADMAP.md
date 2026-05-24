# Roadmap: Appliance Store Lviv

## Milestones

- 🔄 **v2.3 Bugfixes & Small Features** — Phases 44–45 (in progress)
- ✅ **v2.2 Bugfixes & Small Features** — Phases 41–43 (shipped 2026-05-23) — [archive](milestones/v2.2-ROADMAP.md) · [requirements](milestones/v2.2-REQUIREMENTS.md)
- ✅ **v2.1 Fixes & UX** — Phases 37–40 (shipped 2026-05-21) — [archive](milestones/v2.1-ROADMAP.md) · [requirements](milestones/v2.1-REQUIREMENTS.md)
- ✅ **v2.0 Polish, UX & Admin analytics** — Phases 28–36 (shipped 2026-05-21) — [archive](milestones/v2.0-ROADMAP.md) · [requirements](milestones/v2.0-REQUIREMENTS.md)
- ✅ **v1.5 Incremental polish & operator UX** — Phases 22–27 (shipped 2026-05-19) — [archive](milestones/v1.5-ROADMAP.md) · [requirements](milestones/v1.5-REQUIREMENTS.md)
- ✅ **v1.4 Bugfix stabilization** — Phase 21 (shipped 2026-05-19) — [archive](milestones/v1.4-ROADMAP.md) · [requirements](milestones/v1.4-REQUIREMENTS.md)
- ✅ **v1.3 Fixes & Admin UX** — Phases 17–20 (shipped 2026-05-19) — [archive](milestones/v1.3-ROADMAP.md) · [requirements](milestones/v1.3-REQUIREMENTS.md)
- ✅ **v1.2 Polish & UX** — Phases 11–16 (shipped 2026-05-19) — [archive](milestones/v1.2-ROADMAP.md) · [requirements](milestones/v1.2-REQUIREMENTS.md)
- ✅ **v1.1 Engagement & Fixes** — Phases 7–10 (shipped 2026-05-17) — [archive](milestones/v1.1-ROADMAP.md) · [requirements](milestones/v1.1-REQUIREMENTS.md)
- ✅ **v1.0 Appliance Store MVP** — Phases 1–6 (shipped 2026-05-17) — [archive](milestones/v1.0-ROADMAP.md) · [requirements](milestones/v1.0-REQUIREMENTS.md)

## Phases

- [x] **Phase 44: Mobile Header Cleanup** — Remove auth buttons from mobile header; burger becomes rightmost element; sign-out shows pending state
- [ ] **Phase 45: Floating UI Overhaul** — All floating buttons consolidated into a bottom-right column; callback dialog z-index above the button group; validation noise removed from callback form

<details>
<summary>✅ v2.2 Bugfixes & Small Features (Phases 41–43) — SHIPPED 2026-05-23</summary>

- [x] Phase 41: Social Links — 1/1 plans complete
- [x] Phase 42: Floating Action Buttons — 2/2 plans complete
- [x] Phase 43: Slider Fix, Animations & Footer Bug — 3/3 plans complete

</details>

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

### Phase 44: Mobile Header Cleanup

**Goal**: Mobile header is uncluttered — auth buttons are gone from the top bar, burger is the rightmost control, and the sign-out action shows a loading state until the session ends
**Depends on**: Nothing (first phase of v2.3)
**Requirements**: HDR-01, HDR-02
**Success Criteria** (what must be TRUE):
  1. On a mobile viewport the header contains no "Увійти" or "Реєстрація" buttons — those flows are reached via the drawer instead
  2. The burger/menu icon is the rightmost interactive element in the mobile header with no other controls to its right
  3. When a signed-in user clicks "Вийти" in the header, the button immediately changes to a loading state (spinner or text "Виходимо...") and stays that way until the sign-out request completes
  4. After sign-out completes, the header reverts to its guest state with no stuck loader visible

**Plans**: 2 plans
Plans:
- [x] 44-01-PLAN.md — Restructure header flex container: hide auth on mobile, move burger to rightmost position (HDR-01)
- [x] 44-02-PLAN.md — Add isPending state to sign-out button in storefront-auth-links (HDR-02)
**UI hint**: yes

### Phase 45: Floating UI Overhaul

**Goal**: All floating action buttons live in one bottom-right column in a defined order, the callback dialog renders above the entire button group, and the callback form no longer shows unnecessary validation text
**Depends on**: Phase 44
**Requirements**: FAB-03, FAB-04
**Success Criteria** (what must be TRUE):
  1. The callback phone-input field never displays the message "Вкажіть номер телефону — лише цифри, від 10 до 15" at any point during normal use
  2. All floating buttons (callback, cart, chat) are grouped in the bottom-right corner of the screen stacked vertically in the order: callback (top) → cart → chat (bottom)
  3. Opening the callback dialog renders it visually on top of the floating button group — no buttons bleed through the dialog overlay
  4. The chat floating button is part of the same bottom-right group and does not appear separately in a different corner

**Plans**: 2 plans
Plans:

**Wave 1** *(both plans execute in parallel — no shared files)*
- [x] 45-01-PLAN.md — Suppress premature validation: remove shouldValidate from callback-request-form onChange (FAB-03)
- [x] 45-02-PLAN.md — FAB consolidation: merge chat FAB into StorefrontFabs column, fix z-index, thread props through ChatProviderGate (FAB-04)

**Cross-cutting constraints:**
- `StorefrontFabs` must be rendered inside `ChatContext.Provider` subtree to use `useChat()`
- FAB wrapper z-index must be `z-[49]` so dialog backdrop at `z-50` covers it

**UI hint**: yes

## Progress

| Phase | Milestone | Plans Complete | Status | Completed |
|-------|-----------|----------------|--------|-----------|
| 44. Mobile Header Cleanup | v2.3 | 2/2 | Complete   | 2026-05-23 |
| 45. Floating UI Overhaul | v2.3 | 2/2 | Complete    | 2026-05-24 |
| 41. Social Links | v2.2 | 1/1 | Complete   | 2026-05-22 |
| 42. Floating Action Buttons | v2.2 | 2/2 | Complete   | 2026-05-23 |
| 43. Slider Fix, Animations & Footer Bug | v2.2 | 3/3 | Complete   | 2026-05-23 |
| 37. Dashboard StatCards | v2.1 | 1/1 | Complete | 2026-05-21 |
| 38. Dashboard Data Completeness | v2.1 | 2/2 | Complete | 2026-05-21 |
| 39. Calls Auto-save & Categories Table Actions | v2.1 | 2/2 | Complete | 2026-05-21 |
| 40. Category Edit UX | v2.1 | 2/2 | Complete | 2026-05-21 |
