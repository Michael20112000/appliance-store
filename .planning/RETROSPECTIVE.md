# Project Retrospective

## Milestone: v3.1 — UX Polish & Fixes

**Shipped:** 2026-05-30
**Phases:** 50–53 | **Plans:** 15

### What Was Built

Phase 50: DrawerProvider context (mutual exclusion openCart/openWishlist), getCartAction/getWishlistAction server actions, CartDrawer + WishlistDrawer Sheet shells with auth/guest data loading, five Link-to-button entry-point conversions (StorefrontFabs cart FAB, CartNavLink, GuestCartNavLink, WishlistNavLink, PdpCartFab) — DRWR-01/02 complete. Phase 51: countUnreadForBuyer service, ChatProvider boolean→number migration (unreadCount), numeric Badge on chat FAB + chat-fab.tsx, SuggestedMessages chip component (product-contextual + 3 general Ukrainian), prefillText state in PanelBody + useEffect prefill in ChatComposer — CHAT-10/11 complete. Phase 52: ChatProvider nuqs→useState refactor (search-params.ts deleted), src/components/ui/drawer.tsx wrapping @base-ui/react/drawer, chat-panel.tsx rewrite with DrawerRoot (mobile, swipeDirection=down) + CSS translate overlay for history panel (absolute inset-y-0 left-0 w-[75%] translate-x-0/-translate-x-full, motion-reduce support) — CHAT-12/13/14 complete. Phase 53: ProductSearchInput "use client" with useRef(createDebounce) + router.replace(page:1, scroll:false) + isMountedRef guard, wired above filters in tovary/page.tsx — ADM-SRCH-01 complete.

### What Worked

- CSS translate overlay pattern for history panel — PanelBody stays mounted, real-time message state is never lost on view switch
- DrawerProvider wrapping ChatProvider — correct placement for both FAB-level (StorefrontFabs) and PDP-level (PdpCartFab) consumers with zero extra wiring
- useState for chat isOpen (no URL) — eliminating nuqs dependency simplified the chat provider and made persistence trivial
- TDD RED→GREEN across all 4 phases — stubs locked API contracts before implementation
- Phase 52 Wave 1 parallel plans (52-02 + 52-03) — no shared files, no conflicts
- isMountedRef in ProductSearchInput — clean way to prevent router.replace on initial render without additional flag state

### What Was Inefficient

- REQUIREMENTS.md checkbox sync gap (third occurrence) — 5 requirements left as `[ ]` despite being shipped; needed manual reconciliation at milestone close. Same issue as v3.0 and v2.1.
- Phase 50 had "human UAT pending" note in ROADMAP bullet despite being completed — stale bullet not cleared after phase execution

### Patterns Established

- `DrawerProvider wraps ChatProvider` — outer context owns drawer state, inner context owns chat state; no circular dependency
- CSS translate overlay for in-widget panels: `absolute inset-y-0 left-0 z-10 w-[75%]` with `translate-x-0`/`-translate-x-full` + `motion-reduce:transition-none`
- `isMountedRef` guard in debounced router components — prevents spurious navigation on first render
- `prefillText` state in local parent (not shared context) — for ephemeral UI state that only one component subtree needs

### Key Lessons

- REQUIREMENTS.md checkbox gap is now a confirmed pattern: plan executors write SUMMARY.md but not REQUIREMENTS.md traceability. Should add a "done-when" criterion to phase plan templates: "update REQUIREMENTS.md traceability for each requirement this phase satisfies."
- ROADMAP phase bullets with "human UAT pending" should be cleared by the executor when UAT passes — stale status notes cause confusion at milestone close
- Base UI Drawer internals cannot be tested via jsdom gesture simulation (swipe events) — CHAT-14 approach (test non-regression rather than the behavior) is acceptable for this constraint

---

## Milestone: v3.0 — Chat & Engagement

**Shipped:** 2026-05-26
**Phases:** 46–49 | **Plans:** 16

### What Was Built

Full real-time chat system on Pusher + PostgreSQL (Neon). Phase 46: schema migration (nullable userId, guestToken, isActive), guest chat service layer, API routes, ChatProvider guest mode, localStorage token management — confirmed by human UAT. Phase 47: TDD RED→GREEN wave 0 (chat.service + actions + claim route stubs), archiveConversation/createNewConversation/claimGuestConversation service, POST /api/chat/new + /api/chat/claim routes, ChatProvider conversation:closed Pusher binding + claim effect, ArchivedChatBanner — confirmed by human UAT (Pusher latency ~1s). Phase 48: listConversationsForBuyer service + GET /api/chat/conversations route (TDD), ChatProvider panelView state ('thread' | 'history'), PanelHeader Menu icon (auth-gated), HistoryDrawer fetch-on-mount, ChatPanel branching. Phase 49: Prisma attachments Json? field, ChatAttachment type, MessageDto extension, POST /api/chat/upload/sign, sendMessageSchema extension, paperclip UI in ChatComposer + AdminChatComposer, MessageBubble inline image render, Pusher payload extension — PDF dropped mid-phase (Cloudinary delivery complexity).

### What Worked

- `$transaction` for claimGuestConversation — caught TOCTOU race immediately in design; zero production issues
- panelView in-widget state switch — simpler than Sheet overlay, no z-index conflict with chat widget frame
- Phase 48 + 49 parallel execution — no shared files, zero merge conflicts
- Human UAT as the final plan in each phase — natural gate before declaring complete
- TDD wave 0 in Phase 47 — RED stubs locked the service contract before any implementation; caught the `isActive: true` requirement on unarchive
- Worktree isolation throughout — all plans in separate worktrees, clean merges

### What Was Inefficient

- REQUIREMENTS.md checkbox sync still not happening during execution (same issue as v2.1) — left 6 requirements as "Pending" despite all phases complete; needed manual reconciliation at milestone close
- PDF delivery Cloudinary 401 consumed 4 extra fix commits before deciding to drop PDF support entirely — a pre-implementation spike on Cloudinary signed delivery URLs would have resolved this in ~30 min
- Phase 46 `guestToken` unique constraint bug found in Phase 47 UAT — regression not caught in Phase 46 UAT because it required multiple guest sessions

### Patterns Established

- Guest session via localStorage UUID (`chat_guest_token`): generate on first open, restore on load, pass as Pusher auth param and API header
- `claimGuestConversation` always in `$transaction` — TOCTOU guard is now the standard for any claim/transfer operation
- `panelView: 'thread' | 'history'` pattern for in-widget view switching — extend ChatProvider state, branch in ChatPanel render
- Signed Cloudinary preset for user-generated content — `POST /api/chat/upload/sign` pattern reusable for any future upload feature
- `router.refresh()` after server-side conversation state change (claim, new) — SSR re-hydrates props without page reload

### Key Lessons

- Executor MUST update REQUIREMENTS.md traceability immediately after plan completion — the checkbox gap is a recurring process miss; consider enforcing in PLAN.md "done when" criteria
- Before adding binary/file support: spike the delivery URL strategy first — signed vs unsigned vs proxy has major downstream implications
- Test multi-session edge cases in Phase UAT (e.g., "clear localStorage then open again" for guest chat) — single-session tests miss constraint violations
- PDF support added to Phase 49 scope but delivery was under-researched; dropping it was the right call but cost time

---

## Milestone: v2.1 — Fixes & UX

**Shipped:** 2026-05-21
**Phases:** 37–40 | **Plans:** 7

### What Was Built

Admin UX completeness sprint. Dashboard: StatCards for «Нові дзвінки» (Phone icon, /admin/dzvinky link) and «Активні чати» (MessageSquare icon, /admin/chaty link) reusing getAdminSidebarCounts() from phase 36; full AnalyticsCharts replacing mini preview; recent orders table with 6 columns, take 10, row navigation — parity with /admin/zamovlennia. Callback note auto-save (400ms throttle, saveChainRef serialization, inline Збереження…/Збережено status). Categories table: live № column (DnD-aware) + Дії column (Додати товар / Видалити with AlertDialog). Category edit page: useCategoryAutoSave (500ms debounce, schema guard, snapshot dedup, generation guard, TDD RED→GREEN) + CategoryEditDeleteButton (ghost icon trash, deleteCategoryFromListAction) + CategoryEditHeader (back link flush guard, aria-live status line, action buttons) + CategoryEditPageContent wrapper — identical UX to /admin/tovary/[id].

### What Worked

- Mirror pattern (product edit → category edit): zero ambiguity, fast implementation — read product analog, substitute types
- TDD RED→GREEN on hooks: caught saveChainRef async chain issue and snapshot dedup edge case before integration
- Worktree isolation: Plan 01 and Plan 02 fully isolated, no merge conflicts
- Compact 4-phase milestone: each phase had 1-2 plans, fast to plan and execute
- SDK-assisted STATE/ROADMAP tracking: no manual sync needed between plans

### What Was Inefficient

- Executor accidentally committed to main mid-plan (worktree branch check bypassed briefly), required revert + cleanup — cost ~2 extra commits
- REQUIREMENTS.md checkboxes not updated by executors; needed manual fix at milestone close (ADM-DASH-05/06 + ADM-CAT-09/10)
- useCategoryAutoSave `initialValues` object recreation (WR-02) identified at review — should have been caught earlier by referencing product-auto-save patterns more carefully

### Patterns Established

- CategoryEditPageContent/Header wrapper pattern as the standard for any admin edit page with auto-save + delete
- `useCategoryAutoSave` snapshot from `safeParse(initialValues).data` (not raw initialValues) — prevents schema transform drift on init
- `CategoryForm` mode-conditional buttons: edit mode noop, create mode unchanged — clean separation
- Phase executor should update REQUIREMENTS.md traceability immediately on plan completion

### Key Lessons

- Before milestone close: grep REQUIREMENTS.md for `Pending` rows that should be `Complete` — executor writes SUMMARY.md but not requirement status
- Worktree HEAD check MUST be the first action in an executor; delay causes accidental main commits
- `useMemo(initialValues)` in parent (WR-02) — always memoize objects passed as hook deps across render cycles

---

## Milestone: v2.0 — Polish, UX & Admin analytics

**Shipped:** 2026-05-21
**Phases:** 28–36 | **Plans:** 26

### What Was Built

Storefront UX polish across nav (mobile auth drawer), homepage (smooth scroll, category counts), catalog (sort labels), PDP (lightbox snap, in-cart FAB, «Схожі товари» server-side), and footer (desktop 2-col). Admin: dashboard button/icon polish, analytics page + recharts dashboard preview, Дзвінки callbacks workspace (/admin/dzvinky with status/note/archive), DnD category reorder (@dnd-kit), order status accents + INSUFFICIENT_STOCK fix, sidebar badges (5 nav items, single aggregated Promise.all fetch, TDD red→green).

### What Worked

- TDD (Nyquist wave 0) before implementation — service contracts locked before coding; caught filter rules early (D-01/D-03/D-05/D-08)
- Parallel wave execution for independent phases — analytics service + nav in same wave
- gsd-executor worktree isolation — zero merge conflicts across parallel plans
- Human checkpoint plans (36-03, 34-05, 35-03) — natural pause for visual verification, no wasted implementation cycles
- `badgeConfig` object pattern — single source of truth for 5 badge types; trivial to extend

### What Was Inefficient

- Phases 28/32/33 shipped with `human_needed` verification — deferred and acknowledged at milestone close
- Phase 34 required session resume (analytics page checkpoint hit Claude context limit mid-wave)
- DnD hydration mismatch (`aria-describedby` DndDescribedBy-0/1) — pre-existing, not addressed in v2.0
- `prisma/seed.test.ts` 3 failures — pre-existing seed count mismatch, carried forward

### Patterns Established

- Nyquist wave 0 (RED tests) before service implementation — now standard for all service phases
- `badgeConfig` aggregated-fetch pattern for RSC → client count display
- Analytics: `$queryRaw` + BigInt conversion + zero-fill day-bucketing with recharts
- Separate workspace page for operator tools (Дзвінки) rather than embedding in settings

### Key Lessons

- Verify `human_needed` statuses during execution, not at milestone close — checkpoints are the right moment
- dnd-kit SSR hydration: `aria-describedby` ID counter mismatch is a known upstream issue; use `suppressHydrationWarning` or server-only context if needed
- shadcn recharts: `h-[220px]` fixed height required for responsive chart containers — document in PATTERNS.md

---

## Milestone: v1.5 — Incremental polish & operator UX

**Shipped:** 2026-05-19  
**Phases:** 22–27 | **Plans:** 8

### What Was Built

Delivery-aware order status (UI + API). Admin category icons and «Товари» link. Product edit auto-save with debounced saves. Homepage hides empty categories. Footer/mobile contacts and callback from PostgreSQL. UAT-01 operator closure with purge checklist and intake BUG-18…23 verified.

### What Worked

- Vertical phases 22–26 shipped features; phase 27 dedicated UAT closure avoided scope creep
- `BUGFIX-WORKFLOW.md` intake mapped cleanly to verification in phase 27
- Reusing header catalog filter for homepage (HOME-03) — one source of truth

### What Was Inefficient

- No formal milestone audit before close; legacy UAT debt carried via acknowledge
- Stale Prisma dev singleton after phase 26 schema — caught in UAT, fixed in `db.ts`
- `prisma/seed.test.ts` fails without seeded out-of-stock products — documented P2 repeatedly

### Patterns Established

- `19-MANUAL-CHECKLIST.md` + `27-MANUAL-CHECKLIST.md` — operator entry points for purge vs full UAT
- Store settings tables survive `db:purge` — footer may still show contacts (documented expectation)
- P0/P1/P2 severity policy in UAT closure (≤30 min P1 fix budget)

### Key Lessons

- Run `prisma generate` + dev server restart after new models — or guard singleton in `db.ts`
- Close human_needed verification (phase 25) inside dedicated UAT phase, not ad-hoc
- Exclude stale Playwright guest-auth e2e from UAT gate until specs updated

---

## Milestone: v1.4 — Bugfix stabilization

**Shipped:** 2026-05-19  
**Phases:** 21 (verify-only) | **Plans:** 1

### What Was Built

BUG-12…17 verified on main; CI green after minimal test fixes; intake wave 1–2 closed.

### What Worked

- Verify-only phase after heavy bugfix waves — no re-implement regressions
- Consolidated manual checklist for operator sign-off
- Targeted Vitest before full suite caught inventory contracts early

### What Was Inefficient

- Stale `prisma/seed.test.ts` and guest phone format blocked `npm test` until Task 4
- v1.3 never had formal milestone archive until v1.4 close (ROADMAP still expanded)

### Patterns Established

- `BUGFIX-WORKFLOW.md`: intake → plan → execute → verify
- Inventory reserve on `PENDING → CONFIRMED` only; quantity-only product model

### Key Lessons

- Close milestones with `audit-open` acknowledge for legacy UAT debt, not block ship
- Phase 20 inline ship needs SUMMARY or explicit roadmap note for tooling

---

## Cross-Milestone Trends

| Milestone | Phases | Theme |
|-----------|--------|-------|
| v3.1 | 50–53 | UX drawer pattern + chat polish + admin search |
| v3.0 | 46–49 | Real-time chat — guest, lifecycle, history, attachments |
| v2.3 | 44–45 | Header cleanup + FAB overhaul |
| v2.2 | 41–43 | Social links, FABs, slider, animation |
| v2.1 | 37–40 | Admin UX completeness |
| v2.0 | 28–36 | UX polish + admin tooling + TDD |
| v1.5 | 22–27 | Operator UX + UAT closure |
| v1.4 | 21 | Stabilization / verify |
| v1.3 | 17–20 | Admin UX + guest + data ops |
| v1.2 | 11–16 | Polish & UX |
| v1.1 | 7–10 | Engagement & fixes |
| v1.0 | 1–6 | MVP |
