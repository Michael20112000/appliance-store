# Roadmap: Appliance Store Lviv

## Milestones

- 🔄 **v3.1 UX Polish & Fixes** — Phases 50–53 (in progress)
- ✅ **v3.0 Chat & Engagement** — Phases 46–49 (shipped 2026-05-26) — [archive](milestones/v3.0-ROADMAP.md) · [requirements](milestones/v3.0-REQUIREMENTS.md)
- ✅ **v2.3 Bugfixes & Small Features** — Phases 44–45 (shipped 2026-05-24) — [archive](milestones/v2.3-ROADMAP.md) · [requirements](milestones/v2.3-REQUIREMENTS.md)
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

### v3.1 UX Polish & Fixes

- [x] **Phase 50: Cart & Wishlist Drawers** - Replace /koszyk and /obrane pages with full-height right-side drawers (5/5 plans, human UAT pending)
- [ ] **Phase 51: Chat Badge & Suggested Messages** - Add unread badge on chat FAB and suggested messages on chat open
- [ ] **Phase 52: Chat Structural Refactor** - Mobile drawer, history slide-in panel, and persistent chat across navigation
- [ ] **Phase 53: Admin Product Search** - Live search field on /admin/tovary

<details>
<summary>✅ v3.0 Chat & Engagement (Phases 46–49) — SHIPPED 2026-05-26</summary>

- [x] Phase 46: Schema Foundation + Guest Chat (5/5 plans) — completed 2026-05-25
- [x] Phase 47: Chat Lifecycle Control (5/5 plans) — completed 2026-05-25
- [x] Phase 48: History Drawer (3/3 plans) — completed 2026-05-26
- [x] Phase 49: File Attachments (3/3 plans) — completed 2026-05-26

Full phase details: [milestones/v3.0-ROADMAP.md](milestones/v3.0-ROADMAP.md)

</details>

<details>
<summary>✅ v2.3 Bugfixes & Small Features (Phases 44–45) — SHIPPED 2026-05-24</summary>

- [x] Phase 44: Mobile Header Cleanup — 2/2 plans complete
- [x] Phase 45: Floating UI Overhaul — 2/2 plans complete

Full phase details: [milestones/v2.3-ROADMAP.md](milestones/v2.3-ROADMAP.md)

</details>

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

### Phase 50: Cart & Wishlist Drawers
**Goal**: Users can open their cart and wishlist inline without leaving the current page
**Depends on**: Nothing (first phase of milestone)
**Requirements**: DRWR-01, DRWR-02
**Success Criteria** (what must be TRUE):
  1. Clicking the cart FAB or cart icon opens a full-height drawer from the right side — the browser does not navigate to /koszyk
  2. Clicking the wishlist icon opens a full-height drawer from the right side — the browser does not navigate to /obrane
  3. The cart drawer shows current cart contents and totals; user can update quantities or remove items
  4. The wishlist drawer shows saved items; user can remove items or move them to cart
  5. Both drawers close when clicking the backdrop or an explicit close button
**Plans**: 5 plans

**Wave 1**
- [x] 50-01-PLAN.md — Wave 0 test stubs (DrawerContext, CartNavButton, CartDrawer, WishlistNavLink, WishlistDrawer tests + storefront-fabs update)

**Wave 2** *(blocked on Wave 1 completion)*
- [x] 50-02-PLAN.md — DrawerProvider context + getCartAction + getWishlistAction server actions

**Wave 3** *(blocked on Wave 2 completion)*
- [x] 50-03-PLAN.md — CartDrawer shell + CartDrawerContent (auth/guest data loading)
- [x] 50-04-PLAN.md — WishlistDrawer shell + WishlistDrawerContent (auth/guest data loading)

**Wave 4** *(blocked on Wave 3 completion)*
- [x] 50-05-PLAN.md — Wire DrawerProvider into ChatProvider + convert all Link entry points to buttons

**Cross-cutting constraints:**
- `DrawerProvider` (Wave 2) must exist before CartDrawer, WishlistDrawer, and all entry-point conversions — applies to Waves 3–4
- Both Waves 3 plans (CartDrawer, WishlistDrawer) must complete before Wave 4 wiring
**UI hint**: yes

### Phase 51: Chat Badge & Suggested Messages
**Goal**: Users immediately see when they have unread admin messages and get helpful starting points when opening a new chat
**Depends on**: Phase 50
**Requirements**: CHAT-10, CHAT-11
**Success Criteria** (what must be TRUE):
  1. When the admin sends messages the user has not read, a numeric badge appears on the chat FAB showing the count
  2. The badge disappears (or resets to 0) once the user opens the chat and views the messages
  3. When a user opens a new chat on a product page, a context-specific suggested message for that product appears as a chip or button
  4. Two to three general suggested messages (e.g. opening hours, address) appear alongside the product chip for any new chat
  5. Clicking a suggested message pre-fills the input or sends it directly; suggestions disappear once a message is sent
**Plans**: 4 plans

**Wave 1** *(TDD red baseline)*
- [ ] 51-01-PLAN.md — Test stubs: new suggested-messages.test.tsx + rename unreadFromStore→unreadCount in three existing test files

**Wave 2** *(blocked on Wave 1 completion)*
- [ ] 51-02-PLAN.md — countUnreadForBuyer service fn + ChatProvider/ChatProviderGate boolean→number migration

**Wave 3** *(blocked on Wave 2 completion — plans 03 and 04 are parallel)*
- [ ] 51-03-PLAN.md — Badge rendering: storefront-fabs.tsx + chat-fab.tsx (dot → numeric Badge)
- [ ] 51-04-PLAN.md — Suggested messages: SuggestedMessages component + chat-panel.tsx wiring + chat-composer.tsx prefill

**Cross-cutting constraints:**
- ChatProvider must export unreadCount: number (Wave 2) before badge components can consume it (Wave 3)
- suggested-messages.tsx must be created (Plan 04) to resolve the import in suggested-messages.test.tsx (Plan 01)
**UI hint**: yes

### Phase 52: Chat Structural Refactor
**Goal**: Chat works naturally on mobile, history browsing does not disrupt the active conversation, and chat survives page navigation
**Depends on**: Phase 51
**Requirements**: CHAT-12, CHAT-13, CHAT-14
**Success Criteria** (what must be TRUE):
  1. On a mobile viewport the chat widget renders as a shadcn Drawer that slides up from the bottom and closes with a downward swipe
  2. Tapping the history/menu button inside the widget slides a panel in from the left within the widget frame — the current conversation remains visible on the right and is not replaced
  3. Navigating to a different storefront page (e.g. from catalog to PDP) leaves the chat widget open and in the same state it was before navigation
  4. Chat closes only when the user presses the explicit close (X) button, and not on any internal link click or page transition
**Plans**: TBD
**UI hint**: yes

### Phase 53: Admin Product Search
**Goal**: Admin can instantly find any product by name or SKU on /admin/tovary without paginating through the full list
**Depends on**: Phase 50
**Requirements**: ADM-SRCH-01
**Success Criteria** (what must be TRUE):
  1. A search input is visible at the top of the /admin/tovary product list
  2. Typing in the search field filters the product list in real time (no submit button required)
  3. The filtered list shows only products whose name or relevant field matches the query; an empty state is shown when there are no matches
**Plans**: TBD

## Progress

| Phase | Milestone | Plans Complete | Status | Completed |
|-------|-----------|----------------|--------|-----------|
| 50. Cart & Wishlist Drawers | v3.1 | 5/5 | Complete   | 2026-05-27 |
| 51. Chat Badge & Suggested Messages | v3.1 | 0/4 | Not started | - |
| 52. Chat Structural Refactor | v3.1 | 0/? | Not started | - |
| 53. Admin Product Search | v3.1 | 0/? | Not started | - |
| 46. Schema Foundation + Guest Chat | v3.0 | 5/5 | Complete | 2026-05-25 |
| 47. Chat Lifecycle Control | v3.0 | 5/5 | Complete | 2026-05-25 |
| 48. History Drawer | v3.0 | 3/3 | Complete | 2026-05-26 |
| 49. File Attachments | v3.0 | 3/3 | Complete | 2026-05-26 |
| 44. Mobile Header Cleanup | v2.3 | 2/2 | Complete | 2026-05-23 |
| 45. Floating UI Overhaul | v2.3 | 2/2 | Complete | 2026-05-24 |
| 41. Social Links | v2.2 | 1/1 | Complete | 2026-05-22 |
| 42. Floating Action Buttons | v2.2 | 2/2 | Complete | 2026-05-23 |
| 43. Slider Fix, Animations & Footer Bug | v2.2 | 3/3 | Complete | 2026-05-23 |
| 37. Dashboard StatCards | v2.1 | 1/1 | Complete | 2026-05-21 |
| 38. Dashboard Data Completeness | v2.1 | 2/2 | Complete | 2026-05-21 |
| 39. Calls Auto-save & Categories Table Actions | v2.1 | 2/2 | Complete | 2026-05-21 |
| 40. Category Edit UX | v2.1 | 2/2 | Complete | 2026-05-21 |
