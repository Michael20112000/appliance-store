---
phase: 17
slug: admin-chat-inbox-layout
status: draft
shadcn_initialized: true
preset: "base-nova · base: neutral · cssVariables · Tailwind v4 · geist"
created: 2026-05-19
locale: uk
extends: 08-UI-SPEC.md
admin_chrome: bg-muted
---

# Phase 17 — UI Design Contract

> **Layout-only delta** для `/admin/chaty`: zero document scroll, internal scroll у list + thread, full-height inbox grid (Messenger-style). **Розширює** `08-UI-SPEC.md` — spacing, typography, color, copywriting, lifecycle, context menu **без змін**. Джерела: `17-CONTEXT.md` (D-17-01…D-17-16), `08-UI-SPEC.md`, `14-UI-SPEC.md`, код: `admin-sidebar-shell.tsx`, `admin-chat-inbox.tsx`, `conversation-list.tsx`, `chat-thread.tsx`, `message-list.tsx`.

**Out of scope:** нові chat lifecycle actions, зміни ПКМ context menu (Phase 14), Pusher/realtime, buyer chat, inbox pagination, нові tabs/filters, зміна copy, нові shadcn primitives.

---

## Design System

| Property | Value |
|----------|-------|
| Tool | shadcn/ui (ініціалізовано) — **без нових add** |
| Preset | `base-nova` — успадковано з Phase 8 |
| New components | **none** |
| Registry | shadcn official only — unchanged |

---

## Inherited (no change)

Успадкувати з `08-UI-SPEC.md` без змін:

| Area | Reference |
|------|-----------|
| Spacing scale | 4–64px, `space-y-6` page gaps (D-17-03) |
| Typography | 4 sizes, 2 weights; H1 **Чати** `text-2xl font-semibold` |
| Color / accent | 60/30/10, destructive for delete |
| Copywriting | Chat empty, thread unselected, tabs **Активні** / **Архів**, lifecycle menus |
| Desktop list width | **320px** `md:grid-cols-[320px_1fr]` (D-17-08) |
| Mobile back | **До списку** + `ArrowLeft` in thread header (D-17-11) |
| Context menu | Desktop ПКМ row (Phase 14); mobile thread ⋮ (Phase 8) |

---

## Goal

| Criterion | Spec |
|-----------|------|
| Zero page scroll | `document` / `SidebarInset` **не** скролиться під час роботи з 10+ діалогами або довгим тредом (D-17-02) |
| Sticky chrome | H1 + tabs **завжди видимі**; скрол лише в grid panels (D-17-01) |
| Full-height panels | List і thread займають **всю** висоту під chrome, навіть при 1–2 чатах (D-17-07) |
| Composer anchor | `AdminChatComposer` **лишається внизу** правої колонки (не page footer) (D-17-15) |

---

## Viewport Height Chain

**Problem (current):** `admin-chat-inbox.tsx` uses `min-h-[calc(100dvh-12rem)]` on grid — `min-h` дозволяє рости document; shell inner card теж `min-h-[calc(100dvh-3rem)]` без `min-h-0` flex cap.

**Fix pattern:** Phase 06 buyer chat — `min-h-0` на **кожному** flex/grid ancestor; `flex-1` для fill; `overflow-hidden` на grid; scroll лише на leaf containers.

### Ancestor chain (top → inbox)

```
min-h-dvh (admin layout root)
└── SidebarProvider
    └── SidebarInset                    flex flex-1 flex-col  [+ min-h-0 if peer layout allows]
        ├── header (mobile)             h-12 shrink-0         (<md only)
        └── main                        flex flex-1 flex-col min-h-0  p-4 md:p-6
            └── inner content card      flex flex-1 flex-col min-h-0   rounded-lg border bg-background p-4 md:p-6
                └── AdminChatInbox      flex flex-1 flex-col min-h-0   (page root — D-17-04)
                    ├── h1              shrink-0
                    ├── AdminChatTabs   shrink-0
                    └── inbox grid      flex-1 min-h-0 overflow-hidden  md:grid-cols-[320px_1fr]
                        ├── list col    min-h-0 flex flex-col overflow-hidden
                        └── thread col  min-h-0 flex flex-col overflow-hidden
```

**Shell touchpoints (executor discretion, D-17-06):**

| File | Required change |
|------|-----------------|
| `admin-sidebar-shell.tsx` | Propagate `min-h-0` + `flex flex-col` on `main` and inner card so child pages can `flex-1` without document growth |
| `admin-chat-inbox.tsx` | Replace page `space-y-6` wrapper → `flex flex-col flex-1 min-h-0 gap-6` (equivalent visual gap to `space-y-6`); grid `flex-1 min-h-0` **not** `min-h-[calc(100dvh-12rem)]` |
| `conversation-list.tsx` | Column wrapper `min-h-0 flex-1 flex flex-col`; scroll on inner `overflow-y-auto flex-1 min-h-0` |
| `chat-thread.tsx` | Root already `flex min-h-0 flex-1 flex-col` — ensure parent grid cell passes height |
| `message-list.tsx` | `min-h-0 flex-1` scroll region unchanged API |

**Viewport budget (planning reference):**

| Chrome | Approx. subtract |
|--------|------------------|
| Mobile shell header | `3rem` (`h-12`) |
| `main` padding | `p-4` (16px × 2) / `md:p-6` (24px × 2) |
| Inner card padding | same as main |
| Page H1 + tabs + gaps | `space-y-6` / `gap-6` — **не** компактифікувати (D-17-03) |
| Grid border | 1px × 2 |

Prefer **flex chain** over magic `calc(100dvh - Xrem)` alone (D-17-04, D-17-05).

---

## Page Structure (`/admin/chaty`)

### Desktop (`≥ md`)

```
flex flex-col flex-1 min-h-0 gap-6
├── h1 "Чати"                         shrink-0  (sticky in flow — не scroll away)
├── AdminChatTabs                     shrink-0
└── grid                              flex-1 min-h-0 overflow-hidden rounded-lg border border-border
    │                                   md:grid-cols-[320px_1fr]
    ├── ConversationList              min-h-0 h-full (both columns visible)
    └── ChatThread                    min-h-0 h-full
```

| Element | Classes (prescriptive) |
|---------|------------------------|
| Page root | `flex flex-1 min-h-0 flex-col gap-6` |
| Grid | `grid flex-1 min-h-0 overflow-hidden rounded-lg border border-border md:grid-cols-[320px_1fr]` |
| Grid child (each column) | `min-h-0 flex flex-col overflow-hidden` |

**Remove:** `min-h-[calc(100dvh-12rem)]` on grid (superseded by flex-1 chain).

### Mobile (`< md`) — split view

**State machine** (unchanged from Phase 8/14):

| State | `showList` | `showThread` | Visible chrome |
|-------|------------|--------------|----------------|
| No selection | true | false | H1 + tabs + list panel |
| Selected thread | false | true | H1 + tabs + thread panel |

| Rule | Spec |
|------|------|
| H1 on list view | **Visible** — no compact/hidden variant (D-17-09) |
| Tabs on thread view | **Visible** above grid — parity with desktop (D-17-10) |
| Back control | `onBack` → **До списку** unchanged (D-17-11) |
| Active panel | Single grid child fills `flex-1 min-h-0`; internal scroll only in that panel |
| Inactive panel | `null` — not `display:none` inside same cell; conditional render OK |

```
flex flex-col flex-1 min-h-0 gap-6
├── h1 "Чати"                         always
├── AdminChatTabs                     always (including thread view)
└── grid                              flex-1 min-h-0 overflow-hidden (single column)
    ├── [list OR thread]              min-h-0 flex-1 flex flex-col
```

---

## Scroll Primitives

| Surface | Primitive | Spec |
|---------|-----------|------|
| Conversation list (all viewports) | **Native** `overflow-y-auto` | D-17-13 — **do not** wrap list in `ScrollArea` |
| Admin thread messages desktop | **ScrollArea** (`MessageList` default) | D-17-12 |
| Admin thread messages mobile | **Native** OR ScrollArea | Executor picks per Phase 06 pattern if ScrollArea breaks touch; prefer `useNativeScroll={true}` on `<md` if needed (discretion) |
| Grid container | `overflow-hidden` + `min-h-0` on chain | D-17-14 |
| Document | **No** `overflow-y` on page/body for chat route | D-17-02 |

### ConversationList scroll container

```
flex min-h-0 flex-1 flex-col overflow-hidden border-r border-border   (column shell)
└── div role="listbox"                                                flex-1 min-h-0 overflow-y-auto
    └── rows…
```

| State | Layout |
|-------|--------|
| Loading skeletons | Column shell full height; skeleton stack **without** page scroll |
| Empty | `flex flex-1 min-h-0 flex-col items-center justify-center px-4 py-12 text-center` inside column shell |
| Populated | `overflow-y-auto flex-1 min-h-0` on listbox container |

### ChatThread column

```
flex min-h-0 flex-1 flex-col overflow-hidden
├── header (+ back mobile)              shrink-0
├── disconnect banner                   shrink-0 (if shown)
├── MessageList                         flex-1 min-h-0  (scroll inside)
└── AdminChatComposer                   shrink-0 (when not archived)
```

**MessageList props (admin):**

| Prop | Desktop | Mobile (if native chosen) |
|------|---------|---------------------------|
| `useNativeScroll` | `false` (ScrollArea) | `true` optional |
| `isPanelOpen` | `true` when conversation selected | same — preserve auto-scroll / `isNearBottom` (discretion D-17) |

**Auto-scroll:** Preserve existing `MessageList` logic; after layout refactor verify scroll-to-bottom on open, near-bottom new messages, Pusher append.

---

## Empty & Loading States

All empty/loading UI **centered inside full-height panel** — must not collapse grid height.

| Panel | Condition | Layout | Copy (unchanged from 08) |
|-------|-----------|--------|--------------------------|
| List empty | `conversations.length === 0` | `flex flex-1 min-h-0 items-center justify-center` in list column | active: **Немає активних діалогів** / archive: **Архів порожній** + body from `admin-chat-inbox.tsx` |
| Thread unselected | no `selectedConversationId` | `flex flex-1 min-h-0 flex-col items-center justify-center px-6 py-12 text-center` in thread column | **Оберіть діалог** / **Оберіть покупця зі списку, щоб відповісти.** |
| Messages empty | loaded, 0 messages | `MessageList` internal `flex-1 justify-center` | **Ще немає повідомлень** / **Надішліть відповідь покупцю.** |
| List loading | `isLoading` | Full-height column; skeleton rows | `aria-busy="true"` |

**Do not** shrink grid to content height when lists are short (D-17-07).

---

## Copywriting Contract

**No new copy this phase.** Use `08-UI-SPEC.md` § Copywriting Contract for all strings. Executor must not change UA labels.

---

## Registry Safety

| Registry | Blocks Used | Safety Gate |
|----------|-------------|-------------|
| shadcn official | — (no adds) | not required |
| Third-party | — | none |

---

## Component Touchpoints

| File | Layout change only |
|------|-------------------|
| `admin-sidebar-shell.tsx` | Height chain `min-h-0` on `main` + inner card |
| `admin-chat-inbox.tsx` | Page flex column; grid `flex-1 min-h-0`; mobile split unchanged logic |
| `conversation-list.tsx` | Full-height column shell; native scroll wrapper; empty/loading fill panel |
| `chat-thread.tsx` | Verify column height; optional `useNativeScroll` / `isPanelOpen` for `MessageList` |
| `message-list.tsx` | **No API change required** unless mobile native scroll wired from thread |
| `admin/chaty/page.tsx` | No structural change expected |

**Do not modify:** `conversation-lifecycle-*`, context menu wiring, tab URLs, server actions.

---

## Accessibility

Inherited from Phase 8/14. Additional checks:

| Check | Requirement |
|-------|-------------|
| Listbox | `role="listbox"` / `role="option"` preserved after scroll wrapper refactor |
| Scroll regions | List `overflow-y-auto` container has accessible name via parent `aria-label="Діалоги з покупцями"` |
| Focus | Context menu / thread ⋮ focus trap unchanged |
| Keyboard | No new keyboard paths required this phase |

---

## Regression Checklist (manual — D-17-15, D-17-16)

Execute on `/admin/chaty` after implementation:

### Layout & scroll

- [ ] **Desktop:** 10+ conversations — list scrolls inside left column; **page does not scroll**
- [ ] **Desktop:** Long thread (50+ messages) — messages scroll inside thread; header + composer fixed; **page does not scroll**
- [ ] **Desktop:** 1–2 conversations — grid still **full remaining height**; empty thread state vertically centered in right panel
- [ ] **Mobile list view:** H1 + tabs visible; list scrolls internally; **no page scroll**
- [ ] **Mobile thread view:** H1 + tabs + **До списку** visible; messages scroll internally; composer at bottom; **no page scroll**
- [ ] **Mobile:** Switch list ↔ thread — no layout jump breaking scroll containers
- [ ] **Tab switch** (Активні ↔ Архів): chrome stays fixed; panels reflow without page scroll

### Phase 14 / 8 UX (unchanged)

- [ ] **Desktop:** Right-click row → context menu (Архівувати / Повернути / Видалити) still works
- [ ] **Desktop:** Left-click row still selects thread
- [ ] **Desktop:** Thread ⋮ lifecycle menu unchanged
- [ ] **Mobile:** No row context menu; thread ⋮ lifecycle works
- [ ] **Delete:** AlertDialog confirm still appears

### Realtime / messages

- [ ] Open thread → scrolls to latest (or near-bottom behavior preserved)
- [ ] New message while near bottom → auto-scroll
- [ ] Pusher new message append (if dev env connected) — no broken scroll container

### Shell

- [ ] Other admin routes (`/admin/zamovlennia`, etc.) — no broken layout from shell `min-h-0` change
- [ ] **Mobile** admin header (`h-12`) still visible; chat page fills remaining viewport

---

## Checker Sign-Off

- [ ] Dimension 1 Copywriting: PASS (inherited, no drift)
- [ ] Dimension 2 Visuals: PASS (layout chain + scroll)
- [ ] Dimension 3 Color: PASS (inherited)
- [ ] Dimension 4 Typography: PASS (inherited)
- [ ] Dimension 5 Spacing: PASS (`gap-6` / 320px list preserved)
- [ ] Dimension 6 Registry Safety: PASS (no adds)

**Approval:** pending

---

*Phase: 17-admin-chat-inbox-layout · extends 08-UI-SPEC.md · UI contract: 2026-05-19*
