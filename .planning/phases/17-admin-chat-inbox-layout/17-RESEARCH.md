# Phase 17: Admin Chat Inbox Layout - Research

**Researched:** 2026-05-19
**Domain:** CSS flex/grid viewport height chains, admin shell integration, internal scroll (native vs ScrollArea)
**Confidence:** HIGH (codebase + project debug artifacts); MEDIUM (mobile native-scroll choice on admin thread)

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

#### Sticky page chrome
- **D-17-01:** **H1 «Чати» + таби (Активні / Архів) залишаються фіксованими** на сторінці — скрол відбувається лише всередині grid inbox, не document scroll.
- **D-17-02:** **`/admin/chaty` — zero document scroll** при нормальній роботі (10+ діалогів, довгий тред). Вся взаємодія через internal scroll панелей.
- **D-17-03:** **Зберегти `space-y-6`** між h1, tabs і grid — без компактифікації gap.
- **D-17-04:** Page wrapper на `/admin/chaty` — **`flex flex-col` + `min-h-0` height chain**; grid inbox = **`flex-1 min-h-0`** (не покладатися лише на `calc(100dvh - Xrem)` без flex chain).

#### Viewport budget & grid sizing
- **D-17-05:** Desktop grid **займає всю решту viewport** під sticky h1+tabs (`flex-1`), не лише `min-h` що дозволяє рости document.
- **D-17-06:** Viewport budget **враховує admin shell**: `AdminSidebarShell` (sidebar inset, inner card padding, mobile header `h-12` на `<md`). Planner обчислює chain від shell → page → grid.
- **D-17-07:** Панель list/thread **завжди на всю доступну висоту** (Messenger-style) — навіть при 1–2 чатах; empty states центруються всередині панелі, не стискають grid.
- **D-17-08:** Desktop grid columns **залишити `md:grid-cols-[320px_1fr]`** — 320px list column без змін.

#### Mobile split view
- **D-17-09:** Mobile list view — **H1 «Чати» лишається** (без приховування / compact variant).
- **D-17-10:** Mobile thread view — **таби Активні/Архів лишаються видимими**; grid fill під h1+tabs (parity з desktop tabs, не full-bleed thread).
- **D-17-11:** Mobile back «До списку» — **без змін** від Phase 8 (`onBack` у `ChatThread`), якщо planner не знаходить регресії scroll.

#### Scroll primitives & behavior
- **D-17-12:** **Desktop admin thread:** `MessageList` через **ScrollArea** (поточна поведінка) — ок.
- **D-17-13:** **ConversationList:** **native `overflow-y-auto`** (як зараз) — не переводити на ScrollArea.
- **D-17-14:** Grid container: **`overflow-hidden`** + `min-h-0` на flex/grid chain; list column і thread column — **`min-h-0`** для коректного scroll clipping.

#### Verification
- **D-17-15:** Manual checklist (ROADMAP): 10+ діалогів, довгий тред — **page scroll не потрібен**; composer лишається внизу правої колонки.
- **D-17-16:** Regression: desktop ПКМ context menu (Phase 14), mobile split + thread ⋮ lifecycle — **без змін UX**.

### Claude's Discretion

- Точна flex/grid class chain через `AdminSidebarShell` → `admin-chat-inbox.tsx` → `ConversationList` / `ChatThread` (включно з заміною `min-h-[calc(100dvh-12rem)]` на `flex-1 min-h-0 max-h-*` або equivalent).
- **Admin mobile thread:** `useNativeScroll` на `<md` чи ScrollArea — обрати за патерном Phase 06 buyer fix, якщо ScrollArea ламає touch scroll на admin mobile.
- **Mobile active panel scroll container** — де саме `overflow-y-auto` (list wrapper vs grid child) за умови zero page scroll.
- **Auto-scroll** до нових повідомлень у admin thread — зберегти поточну `MessageList` логіку, якщо scroll container refactor не ламає `isNearBottom` / viewport detection.
- Чи потрібен `17-UI-SPEC.md` (layout-only delta від `08-UI-SPEC.md`) — planner/ui-phase за config.

### Deferred Ideas (OUT OF SCOPE)

None — discussion stayed within phase scope.
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| ADM-CHAT-02 | На `/admin/chaty` (desktop) контейнер inbox має фіксовану висоту viewport; список діалогів скролиться всередині лівої колонки; повідомлення треду — всередині правої колонки; сторінка адмінки не росте по висоті від кількості чатів/повідомлень | Flex `min-h-0` chain shell→page→grid; `flex-1 min-h-0` grid замість `min-h-[calc(100dvh-12rem)]`; list native `overflow-y-auto`; thread `MessageList` ScrollArea (desktop) + optional native mobile; manual + optional Playwright scroll gate |
</phase_requirements>

## Summary

Phase 17 is a **layout-only refactor** — no new dependencies, no API changes to chat lifecycle. The bug is structural: `admin-chat-inbox.tsx` uses `min-h-[calc(100dvh-12rem)]` on the grid, which sets a **floor** height but still allows the document to grow when content exceeds that floor. The admin shell (`admin-sidebar-shell.tsx`) uses similar `min-h-[calc(100dvh-3rem)]` on the inner card **without** `min-h-0` on flex ancestors, so the flex/grid chain never receives a bounded height for `overflow-y-auto` children to clip against.

The fix is the **same pattern already proven in Phase 06** (buyer `chat-panel.tsx` + `mobile-chat-scroll.md`): propagate `min-h-0` on every flex/grid ancestor from `SidebarProvider` → `SidebarInset` → shell `main`/card → `AdminChatInbox` → grid columns; use `flex-1` (not `min-h-*` alone) for the inbox grid to consume remaining viewport under fixed H1+tabs; keep scroll on **leaf** containers only (list: native overflow; thread messages: ScrollArea on desktop).

`17-UI-SPEC.md` already prescribes the target class chain — research confirms it matches codebase reality and ROADMAP success criteria. One **pre-existing gap** to address during implementation: `ChatThread` does not pass `isPanelOpen` to `MessageList`, so auto-scroll-on-open / near-bottom new messages may be inactive in admin today; layout work should wire `isPanelOpen={Boolean(selectedConversationId)}` when verifying D-17-15/16.

**Primary recommendation:** Fix height at the **shell + page flex chain** first; then column wrappers; verify scroll with manual checklist + optional Playwright `document.documentElement.scrollHeight === clientHeight` on `/admin/chaty`.

## Architectural Responsibility Map

| Capability | Primary Tier | Secondary Tier | Rationale |
|------------|-------------|----------------|-----------|
| Viewport height budget | Frontend Server (admin layout shell) | Browser (CSS) | `AdminSidebarShell` + `SidebarInset` define available height; page cannot cap grid without shell `min-h-0` |
| Sticky H1 + tabs | Browser (page component) | — | `admin-chat-inbox.tsx` — `shrink-0` chrome, not scrolled away |
| Inbox grid sizing | Browser (page component) | — | `flex-1 min-h-0` grid in `AdminChatInbox` |
| Conversation list scroll | Browser (client component) | — | `ConversationList` — native `overflow-y-auto` on listbox container |
| Thread messages scroll | Browser (client component) | — | `MessageList` — ScrollArea viewport or native div |
| Composer anchor | Browser (client component) | — | `ChatThread` column flex — `shrink-0` footer |
| Mobile split list↔thread | Browser (client state) | — | `showList` / `showThread` in `AdminChatInbox` — unchanged logic |
| Chat data / realtime | API / Backend | — | **Out of scope** — no server changes |

## Standard Stack

### Core

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| Next.js | 16.2.6 | App Router admin routes | Project stack [VERIFIED: package.json] |
| React | 19.2.4 | Client inbox components | Project stack |
| Tailwind CSS | v4 | `min-h-0`, `flex-1`, `overflow-*` utilities | Project styling |
| shadcn/ui ScrollArea | via `@base-ui/react` ^1.4.1 | Desktop thread message scroll | D-17-12; already in `message-list.tsx` |
| shadcn/ui Sidebar | in-repo `sidebar.tsx` | Admin chrome `SidebarInset` | Phase 8 admin shell |

### Supporting

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| `useIsMobile` / `matchMedia('(max-width: 767px)')` | in-repo | Mobile split + native scroll decision | Already in `admin-chat-inbox.tsx`; reuse in `ChatThread` if wiring `useNativeScroll` |
| Playwright | devDependency | E2E smoke for admin chat | Extend `e2e/admin-chat.spec.ts` for scroll gate (optional Wave 0) |
| Vitest | devDependency | Unit tests | **Not** suited for viewport scroll layout — manual/e2e only |

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Flex height chain | `calc(100dvh - Xrem)` only | Locked out by D-17-04/05 — `min-h` allows document growth; magic rem totals drift when shell padding changes |
| Native list scroll | ScrollArea on list | Locked out by D-17-13 — unnecessary; list scroll is simpler with native overflow |
| ScrollArea mobile thread | Native `useNativeScroll` | **Discretion** — Phase 06 buyer fix favors native on mobile Sheet; recommend native for admin mobile thread |

**Installation:** None — layout-only phase.

## Package Legitimacy Audit

No new external packages. Existing dependencies only.

| Package | Registry | slopcheck | Disposition |
|---------|----------|-----------|-------------|
| — | — | not run (no installs) | N/A |

## Project Constraints (from .cursor/rules/)

- **Stack:** Next.js App Router + TypeScript, Tailwind v4, shadcn/ui — layout via utilities, no new UI primitives [VERIFIED: `.cursor/rules/gsd.mdc`]
- **Locale:** Ukrainian UI copy unchanged [VERIFIED: CONTEXT + UI-SPEC]
- **AGENTS.md:** Read Next.js docs under `node_modules/next/dist/docs/` before API changes — **not triggered** (CSS/layout only)

## Architecture Patterns

### System Architecture Diagram

```
[Browser viewport min-h-dvh]
        │
        ▼
SidebarProvider (flex min-h-svh)
        │
        ├── AppSidebar
        └── SidebarInset (flex flex-1 flex-col)  ← add min-h-0 if needed
                ├── mobile header h-12 shrink-0  (<md)
                └── main (flex flex-1 flex-col min-h-0 p-4/6)
                        └── inner card (flex flex-1 flex-col min-h-0)  ← shell fix
                                └── AdminChatInbox (flex flex-1 flex-col min-h-0 gap-6)
                                        ├── H1 shrink-0
                                        ├── Tabs shrink-0
                                        └── grid flex-1 min-h-0 overflow-hidden
                                                ├── list col → ConversationList → overflow-y-auto
                                                └── thread col → ChatThread → MessageList scroll
```

### Recommended Project Structure

```
src/components/admin/admin-sidebar-shell.tsx   # height chain: main + inner card
src/components/chat/admin-chat-inbox.tsx       # page flex column; grid flex-1
src/components/chat/conversation-list.tsx      # column shell + native scroll
src/components/chat/chat-thread.tsx            # column flex; optional useNativeScroll
src/components/chat/message-list.tsx           # unchanged API; ScrollArea vs native
src/app/(admin)/admin/layout.tsx               # min-h-dvh root (unchanged)
src/app/(admin)/admin/chaty/page.tsx           # entry only (unchanged)
```

### Pattern 1: Flex `min-h-0` height chain (mandatory)

**What:** Every flex/grid ancestor between viewport and scrollable leaf gets `min-h-0` (Tailwind) so children can shrink below content size and honor `overflow-y-auto`.

**When to use:** Any full-viewport panel with internal scroll (admin inbox, buyer chat sheet).

**Why:** Flex items default to `min-height: auto`, which prevents shrinking below content — scroll never activates. [CITED: MDN `min-height`](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/min-height); cross-verified with Phase 06 project debug [VERIFIED: `.planning/debug/resolved/mobile-chat-scroll.md`]

**Example (buyer reference — project):**

```94:94:src/components/chat/chat-panel.tsx
    <motion.div className="flex h-full min-h-0 flex-1 flex-col overflow-hidden">
```

### Pattern 2: Page chrome + flex-1 grid (admin inbox)

**What:** Replace `space-y-6` + `min-h-[calc(100dvh-12rem)]` with `flex flex-1 min-h-0 flex-col gap-6` and grid `grid flex-1 min-h-0 overflow-hidden md:grid-cols-[320px_1fr]`.

**When to use:** `/admin/chaty` only (other admin pages keep `space-y-6` — shell `min-h-0` must not force document scroll away on long tables).

**Example (target — from 17-UI-SPEC):**

```tsx
// admin-chat-inbox.tsx — target shape
<div className="flex flex-1 min-h-0 flex-col gap-6">
  <h1 className="shrink-0 text-2xl font-semibold">Чати</h1>
  <AdminChatTabs ... />
  <motion.div className="grid min-h-0 flex-1 overflow-hidden rounded-lg border border-border md:grid-cols-[320px_1fr]">
    {/* columns: min-h-0 flex flex-col overflow-hidden */}
  </motion.div>
</motion.div>
```

### Pattern 3: Grid column wrappers

**What:** Each grid child (list / thread) gets `min-h-0 flex flex-col overflow-hidden`; scroll happens one level deeper.

**When to use:** Desktop two-column and mobile single visible panel.

```tsx
// Wrapper around ConversationList / ChatThread in grid cell
<div className="flex min-h-0 flex-col overflow-hidden">
  <ConversationList ... />
</motion.div>
```

### Pattern 4: ConversationList scroll shell

**What:** Outer column shell `flex min-h-0 flex-1 flex-col overflow-hidden border-r`; inner listbox `flex-1 min-h-0 overflow-y-auto`.

**Current gap:** Root list container is `overflow-y-auto` without `flex-1 min-h-0` parent — empty/loading states lack full-height shell (D-17-07).

### Pattern 5: MessageList scroll primitives

| Surface | Implementation | Notes |
|---------|----------------|-------|
| Desktop admin thread | `ScrollArea` (`useNativeScroll={false}`) | D-17-12; viewport via `[data-slot="scroll-area-viewport"]` |
| Mobile admin thread (recommended) | `useNativeScroll={true}` | Phase 06 pattern; `h-0 min-h-0 flex-1 touch-pan-y overflow-y-auto` |
| Conversation list | Native `overflow-y-auto` | D-17-13 — do not wrap in ScrollArea |

**ScrollArea structure (project):**

```8:28:src/components/ui/scroll-area.tsx
function ScrollArea({ className, children, ...props }: ScrollAreaPrimitive.Root.Props) {
  return (
    <ScrollAreaPrimitive.Root
      data-slot="scroll-area"
      className={cn("relative", className)}
      {...props}
    >
      <ScrollAreaPrimitive.Viewport
        data-slot="scroll-area-viewport"
        className="size-full rounded-[inherit] ..."
```

`MessageList` auto-scroll uses `closest('[data-slot="scroll-area-viewport"]')` when not native — **do not rename** `data-slot` [VERIFIED: `message-list.tsx`]

### Pattern 6: Mobile split view (unchanged state machine)

| State | Visible | Grid content |
|-------|---------|--------------|
| No selection | H1 + tabs + list | `showList` only |
| Selected | H1 + tabs + thread | `showThread` only; tabs remain (D-17-10) |

Active panel must be wrapped in `min-h-0 flex-1 flex flex-col` so conditional render does not collapse height.

### Anti-Patterns to Avoid

- **`min-h-[calc(100dvh-12rem)]` without flex-1 chain:** Document still grows when content > calc — current production bug [VERIFIED: `admin-chat-inbox.tsx:94`]
- **`min-h` on shell inner card without `min-h-0` on flex parents:** Card expands with content [VERIFIED: `admin-sidebar-shell.tsx:29-31`]
- **ScrollArea on conversation list:** Violates D-17-13; adds touch issues without benefit
- **Hiding H1/tabs on mobile thread:** Violates D-17-09/10
- **Relying on `isPanelOpen` default in admin:** `ChatThread` omits prop — auto-scroll effects no-op [VERIFIED: `chat-thread.tsx` MessageList call vs `chat-panel.tsx`]

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Custom scroll container / polyfills | JS height measurement loops | Tailwind flex chain + native/ScrollArea | ResizeObserver hacks break on keyboard/safe-area |
| Viewport height JS | `window.innerHeight` listeners for grid | CSS `flex-1 min-h-0` from shell | D-17-04; less fragile across admin routes |
| Duplicate mobile detection | New breakpoint util | `useIsMobile` from `@/hooks/use-mobile` or existing inbox hook | Already duplicated — consolidate only if touching thread |

## Common Pitfalls

### Pitfall 1: `min-h` vs bounded height

**What goes wrong:** Grid has `min-h-[calc(100dvh-12rem)]` but page still scrolls with many messages.

**Why it happens:** `min-height` sets a floor, not a ceiling; content expands document.

**How to avoid:** `flex-1 min-h-0` on grid inside flex column page; remove reliance on calc-only sizing (D-17-04/05).

**Warning signs:** `document.documentElement.scrollHeight > window.innerHeight` on chat page with long thread.

### Pitfall 2: Missing `min-h-0` on one ancestor

**What goes wrong:** `overflow-y-auto` on list or messages never scrolls; whole page scrolls.

**Why it happens:** Flex/grid default `min-height: auto` on intermediate nodes.

**How to avoid:** Audit chain: SidebarInset → main → card → AdminChatInbox → grid → column → scroll leaf.

**Warning signs:** Scrollbar on `window` instead of panel; Phase 06 debug doc symptoms [VERIFIED: `mobile-chat-scroll.md`]

### Pitfall 3: Grid child without column wrapper

**What goes wrong:** `ConversationList` / `ChatThread` direct in grid cell don't get `min-h-0`.

**How to avoid:** Wrapper `motion.div` per column with `min-h-0 flex flex-col overflow-hidden`.

### Pitfall 4: Empty/loading states shrink panel

**What goes wrong:** 1–2 chats → short list column, thread empty state at top of page.

**How to avoid:** Empty/loading use `flex flex-1 min-h-0 items-center justify-center` inside full-height column shell (D-17-07, 17-UI-SPEC).

### Pitfall 5: ScrollArea on mobile admin thread

**What goes wrong:** Touch scroll flaky on iOS/Android (buyer bug).

**How to avoid:** `useNativeScroll={isMobile}` from `ChatThread` (discretion → **recommend true on `<md`**).

### Pitfall 6: Broken auto-scroll after layout fix

**What goes wrong:** Opening thread doesn't jump to latest; new messages don't auto-scroll.

**Why:** `isPanelOpen` defaults `false` in admin `ChatThread`; effects in `MessageList` guard on `isPanelOpen`.

**How to avoid:** Pass `isPanelOpen={Boolean(selectedConversationId)}` when conversation loaded; re-run manual realtime checks (D-17-15/16).

### Pitfall 7: Shell change breaks other admin routes

**What goes wrong:** Orders/products pages layout collapse.

**How to avoid:** Shell adds `min-h-0` + flex column on main/card only; **do not** require `flex-1` on all child pages — only chat inbox needs `flex-1` on page root.

## Code Examples

### Shell fix (admin-sidebar-shell.tsx)

```tsx
// Target: main + inner card propagate flex + min-h-0
<main className="flex min-h-0 flex-1 flex-col bg-muted p-4 md:p-6">
  <div className="flex min-h-0 flex-1 flex-col rounded-lg border border-border bg-background p-4 shadow-sm md:p-6">
    {children}
  </div>
</main>
```

Remove or demote `min-h-[calc(100dvh-3rem)]` on inner card once flex chain works — calc was compensating for missing `min-h-0` [VERIFIED: current `admin-sidebar-shell.tsx`]

### AdminChatInbox page root

```tsx
<div className="flex min-h-0 flex-1 flex-col gap-6">
  <h1 className="shrink-0 text-2xl font-semibold">Чати</h1>
  <AdminChatTabs ... />
  <motion.div
    className={cn(
      "grid min-h-0 flex-1 overflow-hidden rounded-lg border border-border",
      "md:grid-cols-[320px_1fr]",
    )}
  >
    {showList ? (
      <div className="flex min-h-0 flex-col overflow-hidden">
        <ConversationList ... />
      </div>
    ) : null}
    {showThread ? (
      <motion.div className="flex min-h-0 flex-col overflow-hidden">
        <ChatThread onBack={...} />
      </motion.div>
    ) : null}
  </motion.div>
</div>
```

### ChatThread — wire scroll props (recommended)

```tsx
<MessageList
  messages={messages}
  isLoading={isLoading}
  loadError={loadError}
  buyerDisplayName={buyerDisplayName}
  useNativeScroll={isMobile}  // discretion: recommend true <md
  isPanelOpen={Boolean(selectedConversationId)}
  emptyTitle="Ще немає повідомлень"
  emptyBody="Надішліть відповідь покупцю."
/>
```

### Playwright scroll gate (optional Wave 0)

```ts
// e2e/admin-chat-scroll.spec.ts (new or extend admin-chat.spec.ts)
await page.setViewportSize({ width: 1280, height: 720 });
await page.goto("/admin/chaty");
const docScrollable = await page.evaluate(
  () => document.documentElement.scrollHeight > document.documentElement.clientHeight + 2,
);
expect(docScrollable).toBe(false);
// After selecting long thread, repeat evaluate + assert list/thread scrollTop can change
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| `min-h-[calc(100dvh-12rem)]` on inbox grid | `flex-1 min-h-0` flex chain | Phase 17 (this) | Zero document scroll |
| Buyer mobile ScrollArea only | `useNativeScroll` + flex chain | Phase 06 (2026-05-17) | Template for admin mobile discretion |
| `space-y-6` page wrapper | `flex flex-col gap-6` equivalent | Phase 17 | Same 24px gap (D-17-03) |

**Deprecated/outdated:**
- `08-UI-SPEC.md` grid `min-h-[calc(100dvh-12rem)]` — superseded by `17-UI-SPEC.md` height chain

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | Admin mobile thread should use `useNativeScroll={true}` on `<md` | Scroll primitives | ScrollArea might work on admin mobile — manual verify if false |
| A2 | `SidebarInset` may need `min-h-0` in addition to shell | Height chain | If scroll still broken, patch `SidebarInset` className in shell usage only |
| A3 | Wiring `isPanelOpen` is in scope for scroll verification | Pitfall 6 | User might consider it separate bugfix — low risk, aligns with D-17 discretion |

## Open Questions

1. **Patch `SidebarInset` globally vs shell-only?**
   - What we know: `SidebarInset` is `flex flex-1 flex-col` without `min-h-0` [VERIFIED: `sidebar.tsx:305-314`]
   - What's unclear: Whether shell `main` `min-h-0` alone suffices
   - Recommendation: Start with `admin-sidebar-shell.tsx` only; add `min-h-0` to `SidebarInset` via `className` prop if desktop scroll still fails

2. **`isPanelOpen` — bugfix in Phase 17 or follow-up?**
   - What we know: Admin never passes it; buyer chat does [VERIFIED: grep]
   - Recommendation: Include in Phase 17 thread touchpoint — required for D-17-15 message scroll verification

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| Node.js | dev/build | ✓ (assumed) | — | — |
| npm | scripts | ✓ | — | — |
| Playwright | optional e2e scroll | ✓ | devDependency | Manual checklist only |
| Dev server | manual/e2e | ✓ | `npm run dev` | — |

**Missing dependencies with no fallback:** None

## Validation Architecture

### Test Framework

| Property | Value |
|----------|-------|
| Framework | Vitest (unit) + Playwright (e2e) |
| Config file | `vitest.config.ts`, `playwright.config.ts` |
| Quick run command | `npm run test` |
| Full suite command | `npm run test:e2e` |

### Phase Requirements → Test Map

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| ADM-CHAT-02 | Zero document scroll on desktop inbox | e2e (optional) | `npx playwright test e2e/admin-chat.spec.ts` (+ scroll assertions) | ✅ partial — no scroll asserts yet |
| ADM-CHAT-02 | List scrolls inside left column | manual | `17-UI-SPEC.md` regression checklist | ✅ checklist in UI-SPEC |
| ADM-CHAT-02 | Thread scrolls inside right column; composer fixed | manual | same checklist | ✅ |
| ADM-CHAT-02 | Mobile split internal scroll | manual | same checklist § mobile | ✅ |
| ADM-CHAT-02 | Phase 14/8 context menu regression | e2e + manual | `npx playwright test e2e/admin-chat.spec.ts` | ✅ |

### Sampling Rate

- **Per task commit:** `npm run lint` on touched TSX files
- **Per wave merge:** Manual checklist D-17-15/16 (minimum); `npm run test:e2e -- e2e/admin-chat.spec.ts` if e2e extended
- **Phase gate:** Full manual scroll checklist on desktop + mobile viewports before `/gsd-verify-work`

### Wave 0 Gaps

- [ ] Optional: `e2e/admin-chat-scroll.spec.ts` — `scrollHeight === clientHeight` on `/admin/chaty` + thread selected
- [ ] Manual artifact: `17-MANUAL-CHECKLIST.md` (planner may copy from `17-UI-SPEC.md` § Regression)
- [ ] No Vitest unit tests for CSS layout (not meaningful in node env)

**Note:** Scroll behavior is **manual-first** per ROADMAP and CONTEXT D-17-15; automated scroll assertions are optional hardening.

## Security Domain

Layout-only phase — no auth, input, or data model changes.

| ASVS Category | Applies | Standard Control |
|---------------|---------|------------------|
| V2 Authentication | no | — |
| V3 Session Management | no | — |
| V4 Access Control | no | — |
| V5 Input Validation | no | — |
| V6 Cryptography | no | — |

No new threat patterns introduced. Existing admin RBAC (`requireAdmin`) unchanged.

## Sources

### Primary (HIGH confidence)

- `.planning/phases/17-admin-chat-inbox-layout/17-CONTEXT.md` — locked decisions D-17-01…16
- `.planning/phases/17-admin-chat-inbox-layout/17-UI-SPEC.md` — height chain, scroll primitives, regression checklist
- `.planning/debug/resolved/mobile-chat-scroll.md` — flex `min-h-0` root cause
- `src/components/chat/admin-chat-inbox.tsx`, `admin-sidebar-shell.tsx`, `conversation-list.tsx`, `chat-thread.tsx`, `message-list.tsx`, `chat-panel.tsx` — current implementation
- [MDN min-height](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/min-height) — flex sizing context

### Secondary (MEDIUM confidence)

- Community flex overflow patterns (Stack Overflow consensus on `min-height: 0`) — aligns with MDN + project Phase 06 fix

### Tertiary (LOW confidence)

- None required for planner decisions

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — no new packages; patterns exist in repo
- Architecture: HIGH — UI-SPEC + code audit agree on chain
- Pitfalls: HIGH — reproduced known `min-h` anti-pattern in current code
- Mobile native scroll: MEDIUM — recommend per Phase 06, not re-tested in this session on admin route

**Research date:** 2026-05-19
**Valid until:** 2026-06-19 (stable CSS patterns)
