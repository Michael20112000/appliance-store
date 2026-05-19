# Phase 17: Admin Chat Inbox Layout - Context

**Gathered:** 2026-05-19
**Status:** Ready for planning

<domain>
## Phase Boundary

На `/admin/chaty` список діалогів і тред повідомлень **скроляться всередині inbox-панелі** — document/page scroll не потрібен для читання історії або перегляду списку чатів.

**Desktop:** двоколонковий grid — ліва колонка (list) і права (thread) з незалежним internal scroll.

**Mobile:** split view list ↔ thread (Phase 8/14) — активна панель має той самий internal-scroll патерн.

**Не в цій фазі:** нові chat lifecycle actions, context menu зміни (Phase 14), Pusher/realtime, buyer chat, pagination inbox, нові tabs/filters.

</domain>

<decisions>
## Implementation Decisions

### Sticky page chrome
- **D-17-01:** **H1 «Чати» + таби (Активні / Архів) залишаються фіксованими** на сторінці — скрол відбувається лише всередині grid inbox, не document scroll.
- **D-17-02:** **`/admin/chaty` — zero document scroll** при нормальній роботі (10+ діалогів, довгий тред). Вся взаємодія через internal scroll панелей.
- **D-17-03:** **Зберегти `space-y-6`** між h1, tabs і grid — без компактифікації gap.
- **D-17-04:** Page wrapper на `/admin/chaty` — **`flex flex-col` + `min-h-0` height chain**; grid inbox = **`flex-1 min-h-0`** (не покладатися лише на `calc(100dvh - Xrem)` без flex chain).

### Viewport budget & grid sizing
- **D-17-05:** Desktop grid **займає всю решту viewport** під sticky h1+tabs (`flex-1`), не лише `min-h` що дозволяє рости document.
- **D-17-06:** Viewport budget **враховує admin shell**: `AdminSidebarShell` (sidebar inset, inner card padding, mobile header `h-12` на `<md`). Planner обчислює chain від shell → page → grid.
- **D-17-07:** Панель list/thread **завжди на всю доступну висоту** (Messenger-style) — навіть при 1–2 чатах; empty states центруються всередині панелі, не стискають grid.
- **D-17-08:** Desktop grid columns **залишити `md:grid-cols-[320px_1fr]`** — 320px list column без змін.

### Mobile split view
- **D-17-09:** Mobile list view — **H1 «Чати» лишається** (без приховування / compact variant).
- **D-17-10:** Mobile thread view — **таби Активні/Архів лишаються видимими**; grid fill під h1+tabs (parity з desktop tabs, не full-bleed thread).
- **D-17-11:** Mobile back «До списку» — **без змін** від Phase 8 (`onBack` у `ChatThread`), якщо planner не знаходить регресії scroll.

### Scroll primitives & behavior
- **D-17-12:** **Desktop admin thread:** `MessageList` через **ScrollArea** (поточна поведінка) — ок.
- **D-17-13:** **ConversationList:** **native `overflow-y-auto`** (як зараз) — не переводити на ScrollArea.
- **D-17-14:** Grid container: **`overflow-hidden`** + `min-h-0` на flex/grid chain; list column і thread column — **`min-h-0`** для коректного scroll clipping.

### Verification
- **D-17-15:** Manual checklist (ROADMAP): 10+ діалогів, довгий тред — **page scroll не потрібен**; composer лишається внизу правої колонки.
- **D-17-16:** Regression: desktop ПКМ context menu (Phase 14), mobile split + thread ⋮ lifecycle — **без змін UX**.

### Claude's Discretion
- Точна flex/grid class chain через `AdminSidebarShell` → `admin-chat-inbox.tsx` → `ConversationList` / `ChatThread` (включно з заміною `min-h-[calc(100dvh-12rem)]` на `flex-1 min-h-0 max-h-*` або equivalent).
- **Admin mobile thread:** `useNativeScroll` на `<md` чи ScrollArea — обрати за патерном Phase 06 buyer fix, якщо ScrollArea ламає touch scroll на admin mobile.
- **Mobile active panel scroll container** — де саме `overflow-y-auto` (list wrapper vs grid child) за умови zero page scroll.
- **Auto-scroll** до нових повідомлень у admin thread — зберегти поточну `MessageList` логіку, якщо scroll container refactor не ламає `isNearBottom` / viewport detection.
- Чи потрібен `17-UI-SPEC.md` (layout-only delta від `08-UI-SPEC.md`) — planner/ui-phase за config.

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Project & requirements
- `.planning/PROJECT.md` — v1.3 milestone, admin chat internal scroll
- `.planning/REQUIREMENTS.md` — **ADM-CHAT-02**
- `.planning/ROADMAP.md` — Phase 17 goal and success criteria
- `.planning/STATE.md` — current milestone v1.3

### Prior phase context (do not re-decide)
- `.planning/phases/08-admin-ux-chat-lifecycle/08-CONTEXT.md` — admin chat layout, tabs, mobile split
- `.planning/phases/08-admin-ux-chat-lifecycle/08-UI-SPEC.md` — page structure `grid min-h-[calc(100dvh-12rem)]` (to be updated by this phase)
- `.planning/phases/14-admin-chat-context-menu/14-CONTEXT.md` — desktop ПКМ, mobile thread ⋮, no row ⋮
- `.planning/phases/06-polish-launch/06-09-SUMMARY.md` — buyer mobile scroll fix (`min-h-0` flex chain, `useNativeScroll`)
- `.planning/debug/resolved/mobile-chat-scroll.md` — root cause reference for flex + native overflow

### Code (primary touchpoints)
- `src/components/chat/admin-chat-inbox.tsx` — page layout, grid, tabs, mobile split
- `src/components/chat/conversation-list.tsx` — list column scroll
- `src/components/chat/chat-thread.tsx` — thread column flex chain, composer anchor
- `src/components/chat/message-list.tsx` — messages scroll area, `useNativeScroll` prop
- `src/components/admin/admin-sidebar-shell.tsx` — admin viewport chrome (padding, mobile header)
- `src/app/(admin)/admin/chaty/page.tsx` — route entry
- `src/app/(admin)/admin/layout.tsx` — admin layout wrapper

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `admin-chat-inbox.tsx` — `AdminChatTabs`, mobile `showList`/`showThread`, grid з `overflow-hidden` (partial — потрібен height cap).
- `conversation-list.tsx` — вже `overflow-y-auto` на list container; rows + context menu (Phase 14).
- `chat-thread.tsx` — `flex min-h-0 flex-1 flex-col`; header + `MessageList` + `AdminChatComposer`.
- `message-list.tsx` — ScrollArea (default) / native scroll (`useNativeScroll`); auto-scroll on open + near-bottom.
- `chat-panel.tsx` — еталон flex chain + native mobile scroll для buyer (Phase 06).

### Established Patterns
- Phase 06: `min-h-0` на кожному flex child у chain — без цього scroll area не обмежується.
- Phase 08/14: mobile split list↔thread; desktop two-column 320px + thread.
- Admin shell: nested card з padding — viewport budget must subtract shell chrome, not only page-local `12rem`.

### Integration Points
- `AdminSidebarShell` → `main` → inner card → `AdminChatInbox` — full height chain must propagate `min-h-0`.
- `ChatThread` empty state (no selection) — лишається в правій колонці, не ламає grid height.
- `MessageList` ScrollArea viewport — після layout fix перевірити scroll-to-bottom і Pusher new messages.

</code_context>

<specifics>
## Specific Ideas

- Користувач хоче **Slack/Intercom-style**: h1+tabs на місці, inbox grid fill remaining, zero page scroll.
- **Messenger-style full-height panels** навіть при малій кількості чатів.
- Desktop thread scroll — **ScrollArea ok**; list — **native overflow ok**.

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope.

</deferred>

---

*Phase: 17-Admin Chat Inbox Layout*
*Context gathered: 2026-05-19*
