# Roadmap: Appliance Store Lviv

## Milestones

- [ ] **v3.0 Chat & Engagement** — Phases 46–49 (active)
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

### v3.0 Chat & Engagement (Phases 46–49)

- [ ] **Phase 46: Schema Foundation + Guest Chat** — DB schema migrated, guest users can chat without registering, "Гість" label in admin
- [ ] **Phase 47: Chat Lifecycle Control** — Admin can close chats with real-time notification; guest chat migrates to account on login; "Почати новий чат" after closure
- [ ] **Phase 48: History Drawer** — Auth users access conversation history from within the widget via in-widget drawer
- [ ] **Phase 49: File Attachments** — Auth users and admin can send image files and PDFs up to 10 MB; guests see no attachment UI

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

### Phase 46: Schema Foundation + Guest Chat

**Goal**: DB schema is migrated to support multiple conversations per user and guest sessions; unauthenticated users can open and use the chat widget without being redirected or forced to register
**Depends on**: Nothing (first phase of v3.0)
**Requirements**: CHAT-01, CHAT-03
**Success Criteria** (what must be TRUE):
  1. Unauthenticated user opens the chat widget — the composer is shown immediately, no redirect to /uviity
  2. Guest sends a message — the message appears in the admin inbox labeled "Гість" (not blank or null)
  3. Guest refreshes the page — previous guest messages are still visible in the widget
  4. Guest clears localStorage — the widget treats them as a brand-new guest with no prior session
**Plans**: 5 plans
Plans:

**Wave 1**
- [x] 46-01-PLAN.md — Schema migration: nullable userId, guestToken, isActive + [BLOCKING] prisma migrate dev (CHAT-01, CHAT-03)

**Wave 2** *(depends on 46-01)*
- [x] 46-02-PLAN.md — Data layer: types, validators, service functions for guest conversations (CHAT-01, CHAT-03)

**Wave 3** *(depends on 46-02)*
- [x] 46-03-PLAN.md — API routes: GET /api/chat/guest restore, POST /api/chat/messages guest path, POST /api/chat/pusher/auth guest path (CHAT-01)

**Wave 4** *(depends on 46-03)*
- [x] 46-04-PLAN.md — ChatProvider guest mode: localStorage token management, no redirect, Pusher guestToken config (CHAT-01)

**Wave 5** *(depends on 46-04)*
- [x] 46-05-PLAN.md — Human verification: full e2e test of all phase success criteria (CHAT-01, CHAT-03)

**UI hint**: yes

### Phase 47: Chat Lifecycle Control

**Goal**: Admin can close any chat with real-time notification to the buyer; a guest's conversation is claimed by their account on login; a closed chat offers a path to start fresh
**Depends on**: Phase 46
**Requirements**: CHAT-02, CHAT-04, CHAT-05
**Success Criteria** (what must be TRUE):
  1. Admin closes a chat — within ~1 second the buyer's open widget shows "Чат завершено" and the composer input is locked
  2. Guest sends messages then registers or logs in — after login, that conversation appears in their account history with all prior messages intact
  3. A closed chat's banner shows a "Почати новий чат" button; clicking it opens a new active conversation
**Plans**: 5 plans
Plans:

**Wave 0**
- [x] 47-01-PLAN.md — RED test stubs: chat.service.test.ts + chat.actions.test.ts + claim/route.test.ts (CHAT-02, CHAT-04, CHAT-05)

**Wave 1** *(depends on 47-01)*
- [x] 47-02-PLAN.md — Service + admin action: extend archiveConversation (isActive=false), add createNewConversation, add claimGuestConversation, extend archiveConversationAction with Pusher broadcast (CHAT-02, CHAT-04, CHAT-05)

**Wave 2** *(depends on 47-02)*
- [ ] 47-03-PLAN.md — API routes: POST /api/chat/new + POST /api/chat/claim (CHAT-04, CHAT-05, CHAT-02)

**Wave 3** *(depends on 47-03)*
- [ ] 47-04-PLAN.md — Client: ChatProvider conversation:closed binding + claim effect; ArchivedChatBanner interactive with Почати новий чат (CHAT-04, CHAT-05, CHAT-02)

**Wave 4** *(depends on 47-04)*
- [ ] 47-05-PLAN.md — Human UAT: full e2e verification of all three Phase 47 success criteria (CHAT-02, CHAT-04, CHAT-05)

**UI hint**: yes

### Phase 48: History Drawer

**Goal**: Authenticated users can access their full conversation history from within the chat widget using a menu button that opens an in-widget panel
**Depends on**: Phase 47
**Requirements**: CHAT-06, CHAT-07, CHAT-08
**Success Criteria** (what must be TRUE):
  1. Authenticated user sees a menu icon in the widget header; the icon is not visible to guests
  2. Clicking the menu icon opens a panel inside the widget (not full-screen, not a new page) showing the list of past conversations
  3. Clicking a conversation in the list switches the message view to that thread without closing the widget
  4. The drawer contains a "Новий чат" button; clicking it creates a new conversation and opens it in the message view
**Plans**: TBD
**UI hint**: yes

### Phase 49: File Attachments

**Goal**: Authenticated users and admin can attach image files and PDFs to chat messages; guests have text-only access; uploads go through a signed Cloudinary endpoint
**Depends on**: Phase 46
**Requirements**: CHAT-09
**Success Criteria** (what must be TRUE):
  1. Authenticated user sees a paperclip icon in the chat composer; a guest sees no such icon
  2. Clicking the paperclip opens a file picker restricted to jpg, png, webp, and pdf formats
  3. Selecting a valid file shows a preview; sending the message uploads it to Cloudinary and displays it inline (image) or as a download link (PDF) in the conversation
  4. Selecting a file over 10 MB or of a disallowed type shows a client-side error and does not attempt an upload
  5. Admin can also send files from the admin chat workspace using the same attachment flow
**Plans**: TBD
**UI hint**: yes

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
| 46. Schema Foundation + Guest Chat | v3.0 | 5/5 | Complete   | 2026-05-25 |
| 47. Chat Lifecycle Control | v3.0 | 2/5 | In Progress|  |
| 48. History Drawer | v3.0 | 0/? | Not started | - |
| 49. File Attachments | v3.0 | 0/? | Not started | - |
| 44. Mobile Header Cleanup | v2.3 | 2/2 | Complete   | 2026-05-23 |
| 45. Floating UI Overhaul | v2.3 | 2/2 | Complete    | 2026-05-24 |
| 41. Social Links | v2.2 | 1/1 | Complete   | 2026-05-22 |
| 42. Floating Action Buttons | v2.2 | 2/2 | Complete   | 2026-05-23 |
| 43. Slider Fix, Animations & Footer Bug | v2.2 | 3/3 | Complete   | 2026-05-23 |
| 37. Dashboard StatCards | v2.1 | 1/1 | Complete | 2026-05-21 |
| 38. Dashboard Data Completeness | v2.1 | 2/2 | Complete | 2026-05-21 |
| 39. Calls Auto-save & Categories Table Actions | v2.1 | 2/2 | Complete | 2026-05-21 |
| 40. Category Edit UX | v2.1 | 2/2 | Complete | 2026-05-21 |
