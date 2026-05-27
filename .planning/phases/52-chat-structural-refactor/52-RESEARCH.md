# Phase 52: Chat Structural Refactor — Research

**Researched:** 2026-05-27
**Domain:** React state persistence, @base-ui/react Drawer, CSS slide-in panels, Next.js layout state preservation
**Confidence:** HIGH

---

## Project Constraints (from CLAUDE.md / AGENTS.md)

- **AGENTS.md directive:** "This is NOT the Next.js you know — read `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices." Next.js 16.2.6 is installed.
- `@base-ui/react` (1.4.1 installed) is the component primitive library — NOT Radix UI. All UI components use Base UI.
- `@base-ui/react` **Drawer** is a stable component (marked stable in v1.3.0) available at `@base-ui/react/drawer`. It is already installed.
- The project uses `shadcn` style `base-nova`, which wraps `@base-ui/react` primitives. No `vaul` package exists or is needed.
- No Zustand — state management via React Context + `useState`. `ChatProvider` is the established pattern.
- `nuqs` (`useQueryStates`) is currently used for chat open state (`?chat=open`). This must change in this phase.
- Test framework: Vitest + `@testing-library/react`. `/** @vitest-environment jsdom */` pragma required for component tests.
- `nyquist_validation: true` — Validation Architecture section is required.
- `ui_phase: true` — this is a UI phase with a safety gate.
- Ukrainian UI language only.

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| CHAT-12 | On mobile the chat widget renders as a shadcn Drawer that slides up from the bottom and closes with a downward swipe | `@base-ui/react/drawer` (already installed, 1.4.1) has `swipeDirection="down"` dismiss built-in. Replace the `Sheet` in `ChatPanel` with `Drawer.Root` + `Drawer.Popup`. Create `src/components/ui/drawer.tsx` wrapping the Base UI Drawer. |
| CHAT-13 | History panel slides in from the left within the widget frame — conversation remains visible on the right | Current `panelView` switch replaces content entirely. New behavior: absolutely-positioned left overlay with CSS translate transition. The conversation (`PanelBody`) is always rendered; history panel sits on top and slides from `translate-x-[-100%]` (hidden) to `translate-x-0` (shown). No new package needed — Tailwind CSS transitions. |
| CHAT-14 | Chat remains open when navigating between storefront pages — closes only on explicit X button click | Root cause: `isOpen = query.chat === "open"` (nuqs URL param). When Next.js navigates, the URL changes and `query.chat` becomes `null`. Fix: move `isOpen` to pure `useState`. ChatProvider lives in `(storefront)/layout.tsx` so its React state survives client-side navigations. Remove the `chat` URL param entirely from `useQueryStates`. |
</phase_requirements>

---

## Summary

Phase 52 has three structurally distinct but co-located changes to the chat widget. The research reveals each requirement has a clean, low-risk solution using only already-installed code.

**CHAT-14 (persistence)** is the most architecturally impactful. `ChatProvider` lives in the storefront layout — its React `useState` values already survive page navigation. The only reason the chat panel closes on navigation is that `isOpen` is derived from the URL via `nuqs`. Removing the `?chat=open` URL param and moving `isOpen` to a pure `useState` boolean fixes the problem with a small, focused diff. The `productId` param can be dropped too since product context is stored in `productContext` state already.

**CHAT-12 (mobile Drawer)** replaces the existing `Sheet` (bottom slide) with `@base-ui/react/drawer`'s `Drawer.Root`. The Drawer has native swipe-to-dismiss (`swipeDirection="down"`) built in, which the current Dialog-based Sheet lacks. A new `src/components/ui/drawer.tsx` wraps Base UI Drawer parts in the same style as the existing `sheet.tsx`. [VERIFIED: @base-ui/react 1.4.1 installed, Drawer stable since v1.3.0]

**CHAT-13 (slide-in history)** replaces the full content-swap (`panelView` state) with an absolutely-positioned overlay within the widget container. The conversation thread (`PanelBody`) is always rendered inside the widget; the history panel slides over it from the left using `translate-x` transitions. This produces the "panel slides in, conversation remains visible on right" effect. No new libraries needed — Tailwind `transition-transform` classes.

**Primary recommendation:** (1) Remove nuqs from `isOpen`, use `useState`. (2) Create `components/ui/drawer.tsx`. (3) Replace mobile `Sheet` in `ChatPanel` with the new `Drawer`. (4) Rewrite the `panelView` rendering in both desktop widget and mobile Drawer to use CSS translate overlay instead of content replacement.

---

## Architectural Responsibility Map

| Capability | Primary Tier | Secondary Tier | Rationale |
|------------|-------------|----------------|-----------|
| Chat open/closed state | Frontend Client (React useState in ChatProvider) | — | Must NOT be URL-derived — needs to survive page navigation |
| Mobile slide-up with swipe dismiss | Browser / Client (@base-ui Drawer) | — | Swipe gesture handling is browser-level; Base UI Drawer encapsulates it |
| History slide-in panel | Browser / Client (CSS Tailwind transitions) | — | Pure CSS translate, no JS animation library needed |
| Chat state persistence across navigation | React Context (layout-scoped) | — | Layout components in Next.js App Router persist across client-side navigation |
| Product context for suggested messages | Frontend Client (productContext useState) | — | Already in useState; no URL param needed after CHAT-14 fix |

---

## Standard Stack

### Core (all already installed — no new packages)

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| `@base-ui/react/drawer` | 1.4.1 (installed) | Mobile Drawer primitive with swipe dismiss | Already installed; stable since v1.3.0; project uses Base UI for all primitives |
| React `useState` | React 19.2.4 | Chat open/close state (replacing nuqs URL param) | Established project pattern; ChatProvider already uses useState for all other chat state |
| Tailwind CSS `transition-transform` | Tailwind 4 | History slide-in panel animation | Used throughout project; no separate animation library needed |

### No New Packages

This phase introduces zero new npm packages. `@base-ui/react` 1.4.1 is already installed and its `Drawer` module is the solution for CHAT-12.

**Installation:** None required.

**Version verification:** [VERIFIED: package.json confirms `@base-ui/react: ^1.4.1`, installed at 1.4.1]

---

## Package Legitimacy Audit

No new packages are installed in this phase.

| Package | Registry | Age | Downloads | Source Repo | slopcheck | Disposition |
|---------|----------|-----|-----------|-------------|-----------|-------------|
| `@base-ui/react` | npm | Active (in use since Phase 50+) | High (MUI project) | github.com/mui/base-ui | N/A (pre-approved) | Already installed and approved |

**Packages removed due to slopcheck [SLOP] verdict:** None — no new packages.
**Packages flagged as suspicious [SUS]:** None.

---

## Architecture Patterns

### System Architecture Diagram

```
User taps Chat FAB
        │
        ▼
ChatProvider.openPanel()
  [sets isOpen = true via useState]
  [NOT URL-based after CHAT-14 fix]
        │
        ├── Desktop (md+): Fixed positioned widget div
        │     ├── PanelBody (always rendered when isOpen)
        │     │     └── HistoryOverlay (absolute, slides from left)
        │     │           translate-x-[-100%] → translate-x-0 when panelView="history"
        │     └── Conversation thread (always rendered, visible on right)
        │
        └── Mobile (<md): @base-ui Drawer.Root (open=isOpen)
              └── Drawer.Popup (slides up from bottom)
                    ├── Drawer.SwipeArea (enables swipe-to-dismiss)
                    └── Same PanelBody + HistoryOverlay

User taps Link (page navigation)
  ├── Next.js layout (storefront) stays mounted
  ├── ChatProvider stays mounted (it IS the layout component)
  ├── isOpen remains true (useState not URL)
  └── Chat widget stays open ✓

User taps X button
  └── ChatProvider.closePanel()
        └── setIsOpen(false)
```

### Recommended File Changes

```
src/
├── components/
│   ├── ui/
│   │   └── drawer.tsx          ← NEW: @base-ui Drawer wrapper (like sheet.tsx)
│   └── chat/
│       ├── chat-provider.tsx   ← MODIFY: remove nuqs isOpen; move to useState
│       ├── chat-panel.tsx      ← MODIFY: replace Sheet with Drawer; history overlay
│       └── history-drawer.tsx  ← MINOR: may need class adjustments for overlay mode
├── lib/
│   └── chat/
│       └── search-params.ts    ← MODIFY or DELETE: remove `chat` parser; keep or remove productId
```

### Pattern 1: @base-ui/react Drawer for Mobile Chat (CHAT-12)

**What:** Replace the `Sheet` (Dialog-based, no swipe) with Base UI's `Drawer` (gesture-aware).

**When to use:** Mobile viewport (`< md`). Desktop keeps the fixed-position widget div unchanged.

**Example:**
```tsx
// Source: node_modules/@base-ui/react/drawer/index.parts.d.ts
import { Drawer } from "@base-ui/react/drawer";

// In ChatPanel (mobile branch):
<Drawer.Root
  open={isOpen && isMobile}
  onOpenChange={(open) => { if (!open) closePanel(); }}
  swipeDirection="down"  // enables swipe-to-close gesture
>
  <Drawer.Portal>
    <Drawer.Backdrop className="fixed inset-0 z-50 bg-black/10" />
    <Drawer.Popup
      className="fixed inset-x-0 bottom-0 z-50 flex h-[80dvh] max-h-[80dvh] flex-col overflow-hidden rounded-t-2xl bg-background"
    >
      <Drawer.SwipeArea className="absolute inset-x-0 top-0 h-8" />
      {/* PanelBody content */}
    </Drawer.Popup>
  </Drawer.Portal>
</Drawer.Root>
```

**Key props:**
- `swipeDirection="down"`: drawer dismisses on downward swipe [VERIFIED: DrawerRoot.d.ts]
- `modal={true}` (default): locks scroll, traps focus
- `Drawer.SwipeArea`: optional explicit swipe target (improves UX when header area is interactive)

### Pattern 2: Persisting Chat Open State Across Navigation (CHAT-14)

**What:** Replace URL-derived `isOpen` with React `useState`. ChatProvider is scoped to the storefront layout and does NOT remount on client-side navigation.

**Root cause confirmed:** [VERIFIED: Next.js 16 docs, linking-and-navigating.md] "Next.js avoids this [full page load] with client-side transitions using the `<Link>` component… Keeping any shared layouts and UI." Layouts DO persist. But nuqs `useQueryStates` reads from the current URL, which changes on navigation — so `query.chat` becomes `null` after any `<Link>` navigation, closing the panel.

**Fix:**
```tsx
// Before (URL-driven, closes on navigation):
const isOpen = query.chat === "open";

// After (React state, persists across navigation):
const [isOpen, setIsOpen] = useState(false);

// openPanel becomes:
const openPanel = useCallback((options?: ProductChatContext) => {
  setIsOpen(true);
  if (options) setProductContext(options);
  // No more setQuery
}, []);

// closePanel becomes:
const closePanel = useCallback(() => {
  setIsOpen(false);
  setProductContext(null);
  setPanelView("thread");
}, []);
```

**What to remove from nuqs:** The `chat` and `productId` parsers from `useQueryStates`. The `chatParsers` and `chatUrlKeys` in `lib/chat/search-params.ts` can be removed or trimmed. The `chatSearchParamsCache` may also become unused.

**Side effect:** The chat no longer opens from a URL bookmark (e.g., `?chat=open`). This is acceptable per requirements — CHAT-14 explicitly says the chat should only close via the X button, not on navigation. Bookmarkability was never a stated requirement.

### Pattern 3: History Slide-In Overlay (CHAT-13)

**What:** History panel appears as an absolute overlay sliding from the left within the widget container. The conversation thread remains rendered and visible on the right.

**When to use:** Both desktop (fixed-position widget) and mobile (inside Drawer.Popup). Both containers need `relative overflow-hidden`.

**Example (within the widget container):**
```tsx
// Container (both desktop and mobile):
<div className="relative flex h-full flex-col overflow-hidden">
  {/* Conversation always rendered */}
  <PanelBody ... />

  {/* History overlay — slides in from left */}
  <div
    className={cn(
      "absolute inset-0 z-10 bg-background transition-transform duration-200 ease-in-out",
      panelView === "history"
        ? "translate-x-0"
        : "-translate-x-full"
    )}
  >
    <HistoryDrawer />
  </div>
</div>
```

**Why this works for "conversation visible on right":**
- The overlay covers only `inset-0` (full container) when open
- Since the spec says "current conversation remains visible on the right" — this means the history panel covers ~60–75% of the width, with the conversation peeking out
- Alternatively: `w-[75%]` on the overlay, conversation shows at right 25%
- Either interpretation is achievable with the same pattern; the exact width is a UI decision for the planner

**prefers-reduced-motion:** Use `motion-safe:transition-transform` or `@media (prefers-reduced-motion: reduce) { transition: none }` per project convention (see `page-transition` in globals.css).

### Anti-Patterns to Avoid

- **Keeping `isOpen` in URL params:** Any URL-based state for chat open will break CHAT-14. Do not use nuqs, search params, or router state for the open boolean.
- **Re-adding `vaul`:** The project uses `@base-ui/react` for all drawer primitives. Do not introduce vaul. `@base-ui/react/drawer` is the Base UI equivalent and is already installed.
- **Using CSS `display:none` instead of `translate` for history panel:** `display:none` prevents transition animation and breaks the slide-in effect. Use CSS `transform: translateX` with `transition`.
- **Removing `HistoryDrawer` component:** Keep it as a component — only change where/how it renders (overlay vs full replacement).
- **Making `ChatProvider` a Server Component:** It must remain a Client Component (`"use client"`) — it uses React hooks.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Swipe-to-dismiss on mobile | Custom touch event handlers | `@base-ui/react/drawer` with `swipeDirection="down"` | Handles velocity, cancel, scroll conflicts, iOS rubber-band — edge cases take weeks to get right |
| Slide-up animation | Keyframe CSS or Framer Motion | Tailwind `translate` + `transition-transform` | Already in project; @base-ui Drawer handles the open/close animation states via `data-starting-style`/`data-ending-style` |
| Focus management in mobile Drawer | Manual focus trap | `@base-ui/react/drawer` `modal` prop | Base UI Drawer handles focus trapping, body scroll lock, and `aria-modal` automatically |
| History panel CSS slide animation | JS-driven animation | Tailwind `transition-transform` with `translate-x-*` | Simple, proven, respects `prefers-reduced-motion` |

---

## Common Pitfalls

### Pitfall 1: `Drawer.SwipeArea` Conflicts With Scrollable Content
**What goes wrong:** If the `SwipeArea` overlaps the chat message list scroll area, swipe-to-scroll conflicts with swipe-to-dismiss.
**Why it happens:** Touch events don't distinguish between scroll intent and dismiss intent without proper hit-testing.
**How to avoid:** Position `Drawer.SwipeArea` at the very top of the Drawer Popup (e.g., the drag handle bar area), not over the scrollable message list. The Base UI Drawer's `Popup` itself handles swipe anywhere on the popup content when `SwipeArea` is not present — prefer explicit `SwipeArea` at the top handle only.
**Warning signs:** Scrolling messages accidentally dismisses the drawer.

### Pitfall 2: `closePanel` Clears `productContext` Too Early
**What goes wrong:** Closing the panel while an animation plays could clear `productContext` before the drawer finishes its exit animation, causing content flash.
**Why it happens:** `onOpenChange(false)` fires immediately on swipe, before `onOpenChangeComplete`.
**How to avoid:** Clear `productContext` in `onOpenChangeComplete` (after animation ends), not in `onOpenChange`. Or keep the current behavior (clear immediately) since the content fades out anyway.

### Pitfall 3: `isMobile` SSR Mismatch
**What goes wrong:** `useIsMobile()` reads `window.matchMedia` which is unavailable on the server, causing hydration mismatch if not guarded.
**Why it happens:** SSR renders with `isMobile = false`, client hydrates with `isMobile = true` on phones.
**How to avoid:** The existing `useIsMobile` hook already guards with `useEffect` (no SSR execution) and starts from `false`. The `ChatPanel` is loaded via `dynamic(... { ssr: false })` so this hook never runs on the server anyway. [VERIFIED: chat-provider.tsx line 31-37]

### Pitfall 4: `@base-ui/react/drawer` Missing `Viewport` Warning
**What goes wrong:** The @base-ui/react CHANGELOG (v1.4.x) warns "Warn when a popup is missing Viewport". The Drawer may log a console warning if `Drawer.Viewport` is not included.
**Why it happens:** Base UI Drawer has an optional `Viewport` part for scroll containers. Without it, the drawer content is not scroll-aware.
**How to avoid:** Include `Drawer.Viewport` as the content scroll wrapper inside `Drawer.Popup`, or verify that the warning does not appear in 1.4.1 for bottom drawers. The chat panel manages its own scroll via the inner `MessageList` — explicit `Drawer.Viewport` may not be needed.

### Pitfall 5: Removing nuqs Breaks `chatSearchParamsCache` SSR Usage
**What goes wrong:** If anything server-side reads `chatSearchParamsCache`, removing the parsers breaks it.
**Why it happens:** `createSearchParamsCache` in nuqs is for server component access.
**How to avoid:** Check for `chatSearchParamsCache` usage before deleting `search-params.ts`. Grep confirms: only `chat-provider.tsx` and `search-params.ts` itself reference it. No server components consume it. Safe to remove. [VERIFIED: grep of src/]

---

## Code Examples

### Creating `src/components/ui/drawer.tsx`

```tsx
// Source: @base-ui/react/drawer (node_modules/@base-ui/react/drawer/index.parts.d.ts)
"use client";

import { Drawer as DrawerPrimitive } from "@base-ui/react/drawer";
import { cn } from "@/lib/utils";

function DrawerRoot({ ...props }: DrawerPrimitive.Root.Props) {
  return <DrawerPrimitive.Root data-slot="drawer" {...props} />;
}

function DrawerPortal({ ...props }: DrawerPrimitive.Portal.Props) {
  return <DrawerPrimitive.Portal data-slot="drawer-portal" {...props} />;
}

function DrawerBackdrop({ className, ...props }: DrawerPrimitive.Backdrop.Props) {
  return (
    <DrawerPrimitive.Backdrop
      data-slot="drawer-backdrop"
      className={cn(
        "fixed inset-0 z-50 bg-black/10 transition-opacity duration-150 data-ending-style:opacity-0 data-starting-style:opacity-0",
        className
      )}
      {...props}
    />
  );
}

function DrawerPopup({ className, children, ...props }: DrawerPrimitive.Popup.Props) {
  return (
    <DrawerPrimitive.Popup
      data-slot="drawer-popup"
      className={cn(
        "fixed inset-x-0 bottom-0 z-50 flex flex-col bg-background transition-transform duration-200 ease-in-out data-ending-style:translate-y-[2.5rem] data-ending-style:opacity-0 data-starting-style:translate-y-[2.5rem] data-starting-style:opacity-0",
        className
      )}
      {...props}
    >
      {children}
    </DrawerPrimitive.Popup>
  );
}

function DrawerSwipeArea({ className, ...props }: DrawerPrimitive.SwipeArea.Props) {
  return (
    <DrawerPrimitive.SwipeArea
      data-slot="drawer-swipe-area"
      className={cn("absolute inset-x-0 top-0 h-8 cursor-ns-resize", className)}
      {...props}
    />
  );
}

export {
  DrawerRoot,
  DrawerPortal,
  DrawerBackdrop,
  DrawerPopup,
  DrawerSwipeArea,
};
// Named exports following sheet.tsx pattern
export {
  DrawerRoot as Drawer,
};
```

### Updated `ChatPanel` Mobile Branch

```tsx
// Before (sheet.tsx Dialog-based, no swipe):
<Sheet open={isOpen && isMobile} onOpenChange={(open) => !open && closePanel()}>
  <SheetContent side="bottom" ...>
    ...
  </SheetContent>
</Sheet>

// After (Base UI Drawer with swipe dismiss):
<DrawerRoot
  open={isOpen && isMobile}
  onOpenChange={(open) => { if (!open) closePanel(); }}
  swipeDirection="down"
>
  <DrawerPortal>
    <DrawerBackdrop />
    <DrawerPopup className="h-[80dvh] max-h-[80dvh] rounded-t-2xl border-t pb-[max(0px,env(safe-area-inset-bottom))]">
      <DrawerSwipeArea />
      {/* existing panel content */}
    </DrawerPopup>
  </DrawerPortal>
</DrawerRoot>
```

### Removing nuqs from Chat Open State

```tsx
// Before in chat-provider.tsx:
const [query, setQuery] = useQueryStates(chatParsers, {
  shallow: false,
  urlKeys: chatUrlKeys,
});
const isOpen = query.chat === "open";

// After:
const [isOpen, setIsOpen] = useState(false);
// Remove useQueryStates, useRouter, useSearchParams if no longer needed
// Remove chatParsers, chatUrlKeys imports from lib/chat/search-params
```

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| URL params for chat open (`?chat=open`) | Pure React `useState` | Phase 52 | Chat survives page navigation; breaks bookmarkability (acceptable) |
| `vaul` for mobile bottom sheets | `@base-ui/react/drawer` | Project setup (base-nova) | Project already uses Base UI; no vaul ever needed |
| `Sheet` (Dialog-based) for mobile chat | `Drawer` (swipe-aware) | Phase 52 | Swipe-to-dismiss works on mobile |
| Full content swap on history view (`panelView`) | CSS overlay with translate | Phase 52 | Conversation visible on right while history slides in |

**Deprecated / outdated in context of this phase:**
- `chatParsers.chat` URL key: will be removed
- `chatUrlKeys.chat`: will be removed
- `Sheet` for mobile chat: replaced by `Drawer`
- `shallow: false` on chat nuqs state: the whole `useQueryStates` call removed from open-state tracking

---

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | Removing `?chat=open` URL param is acceptable (bookmarkability not required) | CHAT-14 solution | Low — requirements say close only on X click; URL approach actively violates CHAT-14 |
| A2 | `Drawer.Viewport` is not strictly required for the chat use case | Code Examples | Low — worst case is a console warning; can add later |
| A3 | The "conversation visible on right" in CHAT-13 means partial-width overlay (not full-width with conversation hidden) | CHAT-13 pattern | Medium — width of the history overlay affects the visual outcome |

---

## Open Questions (RESOLVED)

1. **Width of history overlay (CHAT-13)**
   - What we know: "current conversation remains visible on the right and is not replaced"
   - What's unclear: Does "visible on the right" mean 25% peek, or a full 50/50 split, or just that the conversation component still exists in the DOM (even if fully covered)?
   - Recommendation: Implement as ~75% wide overlay (conversation shows 25% on right). This matches the "slides in from the left" framing where you can see where you came from.
   - **RESOLVED:** 75% wide overlay (`w-[75%]`) per Plan 04 implementation — conversation thread peeks 25% on the right.

2. **productId URL param after CHAT-14**
   - What we know: `productId` is passed via URL when opening chat from a product page (`setQuery({ chat: "open", productId: ... })`). This is used for product context in the chat panel.
   - What's unclear: After removing nuqs for `isOpen`, should `productId` also move to pure state (passed as arg to `openPanel`)?
   - Recommendation: Yes. `openPanel({ productId, productTitle, productSlug })` already carries all needed context as arguments. The URL param is redundant. Remove both `chat` and `productId` from nuqs.
   - **RESOLVED:** Both `chat` and `productId` parsers removed from nuqs in Plan 02 — `openPanel()` args carry all product context.

---

## Environment Availability

Step 2.6: SKIPPED — no new external dependencies. All tools required (`@base-ui/react`, Tailwind, React) are already installed and verified.

---

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | Vitest 4.1.6 + @testing-library/react 16.3.2 |
| Config file | `vitest.config.ts` (root) |
| Quick run command | `npm test -- --run src/components/chat/` |
| Full suite command | `npm test` |

### Phase Requirements → Test Map

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| CHAT-12 | Mobile Drawer renders with correct structure | unit | `npm test -- --run src/components/chat/chat-panel.test.tsx` | ✅ exists |
| CHAT-12 | Mobile Drawer includes swipe area element | unit | same file | ✅ exists |
| CHAT-13 | History overlay renders inside widget container (not replacing content) | unit | `npm test -- --run src/components/chat/chat-panel.test.tsx` | ✅ exists |
| CHAT-13 | PanelBody is always present when isOpen=true, regardless of panelView | unit | same file | ✅ exists |
| CHAT-14 | isOpen is NOT derived from URL params (pure useState) | unit | `npm test -- --run src/components/chat/chat-panel.test.tsx` | ✅ exists |
| CHAT-14 | closePanel sets isOpen=false (no URL manipulation) | unit | same file | ✅ exists |

### Sampling Rate
- **Per task commit:** `npm test -- --run src/components/chat/`
- **Per wave merge:** `npm test`
- **Phase gate:** Full suite green before `/gsd:verify-work`

### Wave 0 Gaps
- [ ] New test cases in `chat-panel.test.tsx` — covers CHAT-12 (Drawer structure), CHAT-13 (overlay always-rendered), CHAT-14 (useState not URL)
- [ ] Update `baseChatContext` mock in `chat-panel.test.tsx` if `ChatContextValue` type changes (nuqs removal may affect the `setQuery` mock)

*(Existing test file covers the component — only new test cases needed, not a new file)*

---

## Security Domain

### Applicable ASVS Categories

| ASVS Category | Applies | Standard Control |
|---------------|---------|-----------------|
| V2 Authentication | no | — |
| V3 Session Management | no | — |
| V4 Access Control | no | — |
| V5 Input Validation | no | UI state changes only |
| V6 Cryptography | no | — |

No security-relevant changes in this phase. The refactor only affects UI rendering and state management. Chat API endpoints are unchanged.

---

## Sources

### Primary (HIGH confidence)
- `node_modules/@base-ui/react/drawer/` — Drawer component type definitions, confirmed `swipeDirection`, `Drawer.SwipeArea`, `Drawer.Root.Props` API [VERIFIED: read directly from installed package]
- `node_modules/@base-ui/react/CHANGELOG.md` — confirms Drawer stable since v1.3.0, `Viewport` warning added in v1.4.x [VERIFIED: read directly]
- `node_modules/next/dist/docs/01-app/01-getting-started/04-linking-and-navigating.md` — confirms layouts persist across client-side transitions ("Keeping any shared layouts and UI") [VERIFIED: read directly]
- `node_modules/next/dist/docs/01-app/02-guides/preserving-ui-state.md` — confirms React `useState` in layout components survives navigation [VERIFIED: read directly]
- `src/components/chat/chat-provider.tsx` — confirms `isOpen = query.chat === "open"` (nuqs-derived), confirms `panelView` state, confirms layout position [VERIFIED: read directly]
- `src/components/chat/chat-panel.tsx` — confirms current Sheet usage, `useIsMobile` hook, `ssr: false` on dynamic import [VERIFIED: read directly]
- `src/app/(storefront)/layout.tsx` — confirms `ChatProvider` is in the storefront layout, not page-level [VERIFIED: read directly]
- `package.json` — confirms `@base-ui/react: ^1.4.1` installed, no vaul [VERIFIED: read directly]

### Secondary (MEDIUM confidence)
- `components.json` — confirms shadcn style `base-nova` which uses Base UI primitives [VERIFIED: read directly]
- `src/components/ui/sheet.tsx` — confirms `@base-ui/react/dialog` is the Sheet primitive; no swipe support [VERIFIED: read directly]

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — @base-ui/react Drawer is installed and its API verified from type definitions
- Architecture: HIGH — Next.js layout persistence confirmed from official Next.js 16 docs; root cause of CHAT-14 confirmed from source code
- Pitfalls: HIGH — derived from code inspection and @base-ui CHANGELOG; swipe/scroll conflict is a documented real-world issue
- History overlay pattern: HIGH — standard CSS translate overlay; no novel pattern

**Research date:** 2026-05-27
**Valid until:** 2026-07-01 (stable APIs; @base-ui 1.4.x or later)
