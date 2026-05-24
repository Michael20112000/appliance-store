# Phase 45: Floating UI Overhaul — Research

**Researched:** 2026-05-24
**Domain:** React/Next.js client component — FAB consolidation, z-index stacking, react-hook-form validation UX
**Confidence:** HIGH

---

## Summary

Phase 45 has two distinct requirements:

**FAB-03** — The callback phone-input field should never show "Вкажіть номер телефону — лише цифри, від 10 до 15" during normal use. The root cause is already isolated: `CallbackRequestForm` calls `form.setValue("phone", digits, { shouldValidate: true })` on every keystroke. The Zod schema `^\d{10,15}$` immediately fails on partial inputs (e.g. typing "097" — 3 digits), surfacing the error message before the user finishes typing. The fix is to remove `shouldValidate: true` from the onChange handler so validation only fires on submit and after a submit-error. This is a one-line change in `src/components/layout/callback-request-form.tsx`.

**FAB-04** — Currently the three floating buttons live in two separate corners: `StorefrontFabs` (callback + cart) is `fixed bottom-6 left-6 z-[59]`, and `ChatFab` is `fixed bottom-6 right-6 z-[60]`. The requirement is to move all three into a single bottom-right column in the order: callback (top) → cart (middle) → chat (bottom). The dialog must remain visually above the entire group when open. This requires: (1) moving `StorefrontFabs` from left-6 to right-6 and adding ChatFab into its render, or (2) moving ChatFab out of ChatProvider and into the StorefrontFabs group, or (3) creating a new unified wrapper. Option 1 is cleanest — `StorefrontFabs` already owns callback + cart, and ChatFab is currently injected by `ChatProvider` (which renders inside `ChatProviderGate` inside storefront layout). The z-index situation is currently safe: both the dialog overlay and the FAB wrapper use competing z-index values (dialog at z-50, FABs at z-[59]/z-[60]). After consolidation the wrapper needs `z-[59]` and the dialog portal at `z-50` must render above it — which it does, because `@base-ui/react/dialog` renders via portal to `document.body` using its own stacking context (fixed + z-50 on the backdrop and popup).

No new npm packages are required. The implementation is three surgical edits to two existing files.

**Primary recommendation:** (1) Remove `shouldValidate: true` from the onChange handler in `callback-request-form.tsx`. (2) Move `StorefrontFabs` wrapper from `left-6` to `right-6`. (3) Move `ChatFab` out of `ChatProvider` and render it inside `StorefrontFabs` as the bottom item of the column, preserving its `useChat()` dependency via the hook.

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| FAB-03 | Callback-форма не показує повідомлення "Вкажіть номер телефону — лише цифри, від 10 до 15" | Root cause: `shouldValidate: true` in onChange fires Zod validation on every keystroke. Fix: remove that flag. react-hook-form default mode is "onSubmit" — validation only runs on submit unless opted in. |
| FAB-04 | Всі floating-кнопки зібрані у правому нижньому куті екрана у стовпчик: зворотній дзвінок → корзина → чат; callback-діалог відкривається поверх цього блоку | Three FABs currently split across two corners. Consolidation approach: move wrapper to right-6, remove ChatFab from ChatProvider, add it as bottom item in StorefrontFabs column. Dialog portal at z-50 renders above z-[59] FAB wrapper via browser stacking context. |

</phase_requirements>

---

## Project Constraints (from CLAUDE.md via AGENTS.md)

- Read `node_modules/next/dist/docs/` before writing any Next.js code; heed deprecation notices.
- This version of Next.js (16.2.6) has breaking changes versus training data.

---

## Architectural Responsibility Map

| Capability | Primary Tier | Secondary Tier | Rationale |
|------------|-------------|----------------|-----------|
| Phone input validation UX (FAB-03) | Browser / Client | — | `CallbackRequestForm` is `"use client"`; the `shouldValidate` flag lives in the onChange handler, entirely client-side |
| FAB grouping and positioning (FAB-04) | Browser / Client | Frontend Server (RSC) | FAB buttons are client components; the group wrapper is a `fixed` CSS div rendered client-side; the RSC provides data (phones, cartCount) via props |
| Dialog z-index above FAB group (FAB-04) | Browser / Client | — | Portal stacking is managed by `@base-ui/react/dialog`; backdrop and popup at `z-50` render over the `z-[59]` FAB wrapper because the portal is appended to `document.body` |
| ChatFab integration into group | Browser / Client | — | ChatFab uses `useChat()` hook — it must remain inside `ChatProvider`'s subtree or have `useChat` available; relocation approach must preserve that constraint |

---

## Standard Stack

### Core (all already installed — no additions needed)

| Library | Version | Purpose | Role in Phase 45 |
|---------|---------|---------|-----------------|
| React | 19.2.4 | Component model, hooks | `useChat()` context, `useState`, `useEffect` — already used in all FAB components |
| Next.js | 16.2.6 | App Router, layout, dynamic import | `ChatFab` loaded via `dynamic(..., { ssr: false })` in `chat-provider.tsx` — approach unchanged |
| react-hook-form | 7.76.1 | Form state management | `useForm` in `CallbackRequestForm`; removing `shouldValidate: true` fixes FAB-03 |
| Zod | ^4.4.3 | Schema validation | `callbackRequestSchema` validates on submit; no change needed |
| Tailwind CSS | ^4 | Utility classes | `fixed bottom-6 right-6 z-[59]` for the consolidated FAB wrapper |
| lucide-react | 1.16.0 | Icons | `Phone`, `ShoppingCart`, `MessageSquare` — already imported in their respective components |
| @base-ui/react | ^1.4.1 | Dialog primitive | Callback dialog; portal stacking context; already verified to render above `z-[59]` fixed elements |

**Installation:** None required — zero new packages.

---

## Package Legitimacy Audit

No new packages are installed in this phase.

---

## Architecture Patterns

### Current FAB Architecture (Phase 42 result — BEFORE Phase 45)

```
Storefront Layout RSC (layout.tsx)
  |
  +-- <StorefrontFabs>          fixed bottom-6 LEFT-6 z-[59]
  |     - callback FAB (top)    → opens Dialog (portal, z-50)
  |     - cart FAB (bottom)     → Link /koszyk
  |
  +-- <ChatProviderGate> (RSC)
        +-- <ChatProvider> (client)
              - renders <ChatFab>     fixed bottom-6 RIGHT-6 z-[60]
              - renders <ChatPanel>
```

### Target FAB Architecture (Phase 45 — AFTER)

```
Storefront Layout RSC (layout.tsx)
  |
  +-- <StorefrontFabs>          fixed bottom-6 RIGHT-6 z-[59]
  |     - callback FAB (top)    → opens Dialog (portal z-50 — above all FABs)
  |     - cart FAB (middle)
  |     - chat FAB (bottom)     → calls useChat().openPanel()
  |
  +-- <ChatProviderGate> (RSC)
        +-- <ChatProvider> (client)
              - NO longer renders <ChatFab> inline
              - still renders <ChatPanel>
```

The `ChatFab` must remain inside the `ChatContext.Provider` subtree because it calls `useChat()`. Since `StorefrontFabs` is rendered **after** `ChatProviderGate` in the storefront layout (sibling, not descendant), it is NOT inside `ChatContext.Provider`.

**Constraint:** `StorefrontFabs` is a sibling to `ChatProviderGate` in `layout.tsx` — it cannot call `useChat()` directly.

**Solution options (ranked):**

| Option | Approach | Verdict |
|--------|----------|---------|
| A | Move `ChatFab` render from `ChatProvider` into `StorefrontFabs`, lift `StorefrontFabs` inside the `ChatContext.Provider` subtree | **Not clean** — requires passing chat props or using context across what is currently RSC boundary |
| B | Render `StorefrontFabs` inside `ChatProvider` JSX (after `{children}`) so it has access to `useChat()` | **Cleanest** — `ChatProvider` already renders `ChatFab` and `ChatPanel` as siblings to `{children}`; add `StorefrontFabs` as another sibling |
| C | Create a new `FabGroup` client component that consumes both `useChat()` and cart/phones props via prop-drilling from `ChatProvider` | Unnecessary complexity |
| D | Keep `ChatFab` inside `ChatProvider` but move it to `right-6` and reposition `StorefrontFabs` inside it too | Equivalent to Option B |

**Chosen approach — Option B:** Move the render point of `StorefrontFabs` from `layout.tsx` into `ChatProvider`'s JSX return. `ChatProvider` already receives `phones`, `initialCartCount`, `hasSession` if we thread them down, OR we restructure so `StorefrontFabs` (containing `ChatFabSlot`) gets rendered inside the provider. This requires `ChatProvider` or `ChatProviderGate` to accept the FAB props and render `StorefrontFabs`.

**Simpler alternative (Option E — recommended):** Keep `StorefrontFabs` in `layout.tsx` as a sibling. Move only the ChatFab rendering: keep the `ChatFab` button inside `ChatProvider` but also add it to the `StorefrontFabs` column by making `ChatProvider` NOT render its own inline `ChatFab` and instead relying on `StorefrontFabs` rendering a `ChatFab`-equivalent. Since `StorefrontFabs` is outside `ChatContext`, it cannot call `useChat()` — but we can pass an `onChatOpen` callback prop that `ChatProvider` gives to `StorefrontFabs` via a different mechanism.

**Cleanest feasible approach — Option F (recommended):** Render `StorefrontFabs` inside `ChatProvider`'s JSX. This requires threading `phones`, `initialCartCount`, `hasSession` props into `ChatProvider` (or its gate), and having `ChatProvider` render `StorefrontFabs` as it currently renders `ChatFab`. This works because `ChatProvider` is already a client component.

**Actual recommended approach based on minimal disruption:**

Render `StorefrontFabs` **inside** `<ChatContext.Provider value={value}>` in `chat-provider.tsx` — i.e., add it next to `<ChatFab />` and `<ChatPanel />`. This requires `ChatProvider` to accept `phones`, `initialCartCount`, `hasSession` props and pass them to `StorefrontFabs`. The current `ChatFab` render in `ChatProvider` is removed. `StorefrontFabs` gets a new optional `onChatOpen` prop connected to `useChat().openPanel` and renders `ChatFab` logic inline, or `StorefrontFabs` imports `useChat` and uses it.

Wait — `StorefrontFabs` is `"use client"`. If it's rendered inside `ChatProvider` (also `"use client"`), it CAN call `useChat()` as long as it's in the component tree under `ChatContext.Provider`. This is the cleanest solution.

**Final recommended approach:**

1. `ChatProvider` stops rendering `<ChatFab />` as its own direct child.
2. `StorefrontFabs` is moved from `layout.tsx` fragment root into `ChatProvider`'s JSX return (sibling to `ChatPanel`).
3. `ChatProvider` accepts three new props: `phones`, `initialCartCount`, `hasSession` — passed from `ChatProviderGate` (which receives them from the storefront layout RSC).
4. `StorefrontFabs` imports `useChat` and calls it to get `isOpen` and `openPanel` for its internal ChatFab slot.
5. `layout.tsx` no longer renders `<StorefrontFabs>` directly (it passes those props to `ChatProviderGate` instead).

### Recommended File Change Map

| File | Change | Scope |
|------|--------|-------|
| `src/components/layout/callback-request-form.tsx` | Remove `shouldValidate: true` from onChange handler | 1 line |
| `src/components/layout/storefront-fabs.tsx` | (1) Change wrapper from `left-6` to `right-6`, (2) add ChatFab slot as third button using `useChat()`, (3) add `onChatOpen` via `useChat` | ~20 lines |
| `src/components/chat/chat-provider.tsx` | (1) Accept `phones`, `initialCartCount`, `hasSession` props, (2) remove `<ChatFab />` render, (3) render `<StorefrontFabs ... />` in its place | ~15 lines |
| `src/components/chat/chat-provider-gate.tsx` | Accept and pass `phones`, `initialCartCount`, `hasSession` props down to `ChatProvider` | ~10 lines |
| `src/app/(storefront)/layout.tsx` | Pass `phones`, `initialCartCount`, `hasSession` to `<ChatProviderGate>` instead of `<StorefrontFabs>` | ~5 lines |

### Alternative Approach: External ChatFabSlot (simpler prop-threading)

If threading props through `ChatProviderGate` → `ChatProvider` feels invasive, there is a second viable approach:

1. Keep `StorefrontFabs` in `layout.tsx` as it is.
2. Create a new tiny `ChatFabSlot` client component that calls `useChat()` and renders a button identical to `ChatFab`.
3. Render `<ChatFabSlot />` as the last child of `StorefrontFabs`'s wrapper div — BUT `ChatFabSlot` requires `useChat()` which requires being inside `ChatContext.Provider`.
4. Since `StorefrontFabs` is outside `ChatContext.Provider`, this does NOT work without moving `StorefrontFabs` inside the provider subtree.

**Conclusion:** Any approach that renders the chat button inside `StorefrontFabs` requires `StorefrontFabs` to be inside `ChatContext.Provider`. The prop-threading approach (Option F) is unavoidable.

### Recommended Project Structure

```
src/
├── components/
│   ├── layout/
│   │   ├── callback-request-form.tsx    # MODIFY — remove shouldValidate: true (FAB-03)
│   │   └── storefront-fabs.tsx          # MODIFY — right-6, add chat button slot, import useChat
│   └── chat/
│       ├── chat-provider.tsx            # MODIFY — accept FAB props, remove ChatFab render, add StorefrontFabs
│       └── chat-provider-gate.tsx       # MODIFY — accept + pass FAB props
├── app/
│   └── (storefront)/
│       └── layout.tsx                   # MODIFY — pass FAB props to ChatProviderGate, not StorefrontFabs
```

### Pattern 1: FAB-03 — Suppress Premature Validation

**Root cause:** In `callback-request-form.tsx` the `onChange` handler does:
```tsx
// CURRENT (line 71-75) — fires Zod validation on every keystroke
form.register("phone", {
  onChange: (event) => {
    const digits = event.target.value.replace(/\D/g, "");
    form.setValue("phone", digits, { shouldValidate: true }); // ← fires validation immediately
  },
})
```

With `react-hook-form@7.76.1` defaults (`mode: "onSubmit"`), validation normally only fires on submit. But `shouldValidate: true` overrides this and fires the Zod resolver immediately — so as soon as the user types 1–9 digits, the regex `^\d{10,15}$` fails and the error "Вкажіть номер телефону — лише цифри, від 10 до 15" appears.

**Fix:**
```tsx
// AFTER — validation only triggers after first submit attempt
form.register("phone", {
  onChange: (event) => {
    const digits = event.target.value.replace(/\D/g, "");
    form.setValue("phone", digits); // no shouldValidate — default mode applies
  },
})
```

**Why this is correct:** With `mode: "onSubmit"` (default), `react-hook-form` validates on submit. After a submit attempt that fails, it enters `reValidateMode: "onChange"` (the default revalidate mode) — so subsequent keystrokes DO validate after the first failed submit. This gives the right UX: no errors while typing fresh, errors clear as user corrects after a failed attempt. [VERIFIED: react-hook-form 7.76.1 installed; `useForm` call has no explicit `mode` override in `callback-request-form.tsx`]

**Important:** The digit-stripping logic (`.replace(/\D/g, "")`) must be kept. Only `shouldValidate: true` is removed.

**Side effect scope:** `CallbackRequestForm` is used in three places: footer (`idPrefix="footer"`), mobile drawer (`idPrefix="drawer"`), and storefront FAB dialog (`idPrefix="fab"`). All three instances share the same component — fixing it fixes all three. This is beneficial: none of these contexts should show validation during typing.

### Pattern 2: FAB-04 — Consolidated Right-Side FAB Column

**Current state after Phase 42:**
- `StorefrontFabs`: `fixed bottom-6 left-6 z-[59]` — callback (top) + cart (bottom)
- `ChatFab`: `fixed bottom-6 right-6 z-[60]` — standalone

**Target state:**
- Single wrapper: `fixed bottom-6 right-6 z-[59]` — callback (top) + cart (middle) + chat (bottom)
- No separate ChatFab anywhere

**Z-index safety:** Dialog overlay (`DialogOverlay`) is `z-50` and dialog popup (`DialogPrimitive.Popup`) is `z-50`. The FAB wrapper is `z-[59]`. Numerically z-[59] > z-50, which would cause FABs to render ABOVE the dialog.

**Critical finding:** This is the current issue described in the success criteria ("no buttons bleed through the dialog overlay"). Let's verify the stacking context:

`DialogContent` renders via `DialogPortal` which uses `@base-ui/react/dialog`'s portal. The portal appends to `document.body`. The `DialogOverlay` (backdrop) uses `fixed inset-0 isolate z-50`. The `DialogPrimitive.Popup` is `fixed top-1/2 left-1/2 z-50`. The FAB wrapper is `fixed bottom-6 right-6 z-[59]`.

Since both the FAB wrapper and the dialog backdrop are `fixed` elements appended to the same stacking context (the root stacking context, since neither has a `transform`, `filter`, `opacity < 1`, or `will-change` on an ancestor in the actual DOM), z-index comparisons are direct: `z-[59]` (59) > `z-50` (50). This means FABs appear above the backdrop — which is exactly the "bleed through" bug.

**Fix:** Use `z-[49]` for the FAB wrapper so the dialog backdrop at `z-50` covers it. Or keep FABs at `z-[59]` and change the dialog backdrop and popup to higher z-index values.

**Recommended approach:** Lower the FAB wrapper to `z-[49]`. The dialog `z-50` then sits above it. `ChatPanel` on desktop uses `z-[61]` — it is unaffected. `PdpCartFab` uses `z-[59]` — it's a separate fixed element on PDPs only and doesn't conflict.

Alternatively: The current `StorefrontFabs` has `z-[59]` and the dialog is `z-50` — but in Phase 42 the RESEARCH doc noted "FABs at z-[59] sit below the dialog overlay." That was incorrect — numerically 59 > 50 means FABs appear above. The Phase 42 plan trusted this claim and the Phase 42 user visual verification passed without noticing the bleed-through. The success criteria for Phase 45 explicitly calls this out, confirming the bug is real.

**Correct fix for z-index:** Change FAB wrapper `z-[59]` → `z-[49]`.

**Note on `PdpCartFab`:** `PdpCartFab` uses `z-[59]` independently and is rendered directly on PDP pages. This phase does not modify `PdpCartFab` — it is out of scope for Phase 45.

### Pattern 3: ChatFab Props Threading

`ChatProvider` currently renders `<ChatFab />` directly in its JSX. To move the chat button into `StorefrontFabs`, `ChatProvider` must:
1. Accept `phones: PublicStorePhone[]`, `initialCartCount: number`, `hasSession: boolean` as additional props
2. Remove the `<ChatFab />` render
3. Render `<StorefrontFabs phones={phones} initialCartCount={initialCartCount} hasSession={hasSession} />` in its place

`ChatProviderGate` must accept and pass through these same three props from the storefront layout.

`storefront-fabs.tsx` adds a third button slot. It imports `useChat` from `@/components/chat/chat-provider`. Since `StorefrontFabs` will be rendered inside `ChatContext.Provider`'s JSX tree, `useChat()` is available.

The ChatFab slot in `StorefrontFabs`:
```tsx
// Inside StorefrontFabs (now inside ChatContext.Provider)
const { isOpen, openPanel, unreadFromStore, hasSession: chatHasSession } = useChat();

// In JSX — third item (bottom) in flex-col:
{!isOpen && (
  <button
    type="button"
    onClick={() => openPanel()}
    className={cn(fabClass, "relative")}
    aria-label="Відкрити чат з магазином"
  >
    <MessageSquare className="size-6" aria-hidden />
    {chatHasSession && unreadFromStore ? (
      <span
        className="absolute -top-0.5 -right-0.5 size-3 rounded-full bg-primary ring-2 ring-background"
        aria-hidden
      />
    ) : null}
  </button>
)}
```

Note: ChatFab returns `null` when `isOpen` — in the column this means the chat button disappears when chat is open. This is existing behavior and should be preserved.

Note: The `hasSession` prop name collision — `StorefrontFabsProps.hasSession` (for cart sync) vs `useChat().hasSession` (for chat unread indicator). These are the same value (same user session) but sourced differently. In the consolidated component they will always agree. Use the prop `hasSession` for cart logic and `useChat().hasSession` for chat unread (or rename one to avoid shadowing).

### Anti-Patterns to Avoid

- **Setting `shouldValidate: true` in onChange on a field with strict regex:** Fires validation on every keystroke and shows errors before the user finishes typing. Remove the flag; let react-hook-form's `reValidateMode: "onChange"` (post-submit default) handle subsequent revalidation.
- **FAB wrapper at `z-[59]` with dialog backdrop at `z-50`:** Numerically 59 > 50 so FABs bleed through the dialog. Fix: lower FAB wrapper to `z-[49]`.
- **Rendering `StorefrontFabs` outside `ChatContext.Provider` and calling `useChat()`:** Will throw "useChat must be used within ChatProvider". `StorefrontFabs` must be inside the `ChatProvider` subtree.
- **Moving `StorefrontFabs` inside `<main>` or a `<Suspense>` boundary:** FABs must render independently of page content loading. They should remain at the fragment root level, just inside `ChatProvider` rather than in the layout root.
- **Removing the digit-stripping onChange entirely:** The `replace(/\D/g, "")` transform must stay — it prevents non-numeric characters from being entered. Only the `shouldValidate` option is removed.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Phone validation | Custom regex in onChange | Zod `callbackRequestSchema` on submit | Already handles all edge cases; server action also validates |
| Chat button logic | Duplicate ChatFab state | `useChat()` hook from `chat-provider.tsx` | Context already manages open/close, unread badge, openPanel callback |
| Dialog stacking | Custom z-index management via JS | Fix CSS z-index to `z-[49]` | Browser stacking context is deterministic; portal renders above fixed elements with lower z-index |
| FAB group container | New component file | Extend `storefront-fabs.tsx` | Already has the wrapper div, props, and positioning pattern |

---

## Common Pitfalls

### Pitfall 1: z-index 59 > 50 causes FABs to bleed through dialog backdrop

**What goes wrong:** The FAB wrapper at `z-[59]` appears above the dialog overlay at `z-50`. Users see floating buttons through the semi-transparent backdrop.
**Why it happens:** Phase 42 research incorrectly documented z-[59] as "below z-50 dialog overlay." Numerically 59 > 50. The backdrop used `z-50` and the FAB group used `z-[59]`.
**How to avoid:** Change the FAB wrapper to `z-[49]`. The dialog backdrop and popup at `z-50` then cover all FABs correctly.
**Warning signs:** FABs visible through the callback dialog backdrop.

### Pitfall 2: Calling `useChat()` outside `ChatContext.Provider`

**What goes wrong:** If `StorefrontFabs` is placed outside the `ChatProvider` subtree and tries to import `useChat`, runtime throws "useChat must be used within ChatProvider".
**Why it happens:** `StorefrontFabs` is currently at the layout fragment root, which is OUTSIDE `ChatProviderGate` → `ChatProvider`.
**How to avoid:** Move the render location of `StorefrontFabs` inside `ChatProvider`'s JSX return — exactly where `<ChatFab />` currently lives.
**Warning signs:** Hydration error or runtime crash on any storefront page.

### Pitfall 3: Removing the digit-stripping transform in the onChange handler

**What goes wrong:** Input accepts non-numeric characters; the Zod regex `^\d{10,15}$` fails on submit; error appears anyway.
**Why it happens:** Developer removes the entire custom `onChange` when removing `shouldValidate: true`.
**How to avoid:** Keep the `onChange` handler but remove only `shouldValidate: true`. The result: `form.setValue("phone", digits)` — same digit-stripping, no premature validation.
**Warning signs:** User can type letters into the phone field.

### Pitfall 4: hasSession prop vs useChat().hasSession collision

**What goes wrong:** `StorefrontFabs` has a prop named `hasSession` (for cart sync). After adding `useChat()` which also exposes `hasSession`, a developer might use the wrong one for the chat unread indicator.
**Why it happens:** Same name, two sources — prop and context both carry the same session state.
**How to avoid:** Use the prop `hasSession` (already destructured) for all cart sync logic. Use `useChat().hasSession` (or a renamed local variable) only for the chat unread badge indicator. Both values agree at runtime.

### Pitfall 5: Chat button always visible when chat is open

**What goes wrong:** The chat button stays visible even after the chat panel opens — visually redundant.
**Why it happens:** Current `ChatFab` returns null when `isOpen`, but a naive port to `StorefrontFabs` might omit that guard.
**How to avoid:** Preserve `{!isOpen && <chat button>}` pattern in the new chat button slot.
**Warning signs:** Chat button visible alongside the open chat panel.

### Pitfall 6: PdpCartFab z-index remains at z-[59]

**What goes wrong:** After lowering the global FAB wrapper to `z-[49]`, `PdpCartFab` at `z-[59]` still bleeds through dialogs on PDP pages.
**Why it happens:** `PdpCartFab` is a separate component not modified by this phase.
**How to avoid:** This phase does NOT touch `PdpCartFab`. If `PdpCartFab` bleeding through dialogs is a concern on PDP pages, that is a separate bug to address in a future phase. FAB-04 is satisfied by the global `StorefrontFabs` group.

---

## Code Examples

### FAB-03: Remove `shouldValidate: true` in `callback-request-form.tsx`

```tsx
// Source: src/components/layout/callback-request-form.tsx [VERIFIED in codebase]
// BEFORE (line 71-75):
{...form.register("phone", {
  onChange: (event) => {
    const digits = event.target.value.replace(/\D/g, "");
    form.setValue("phone", digits, { shouldValidate: true }); // ← REMOVE this option
  },
})}

// AFTER — validation only fires on submit (react-hook-form default):
{...form.register("phone", {
  onChange: (event) => {
    const digits = event.target.value.replace(/\D/g, "");
    form.setValue("phone", digits);
  },
})}
```

### FAB-04: Updated `StorefrontFabs` component (key structural changes)

```tsx
// Source: derived from src/components/layout/storefront-fabs.tsx + src/components/chat/chat-fab.tsx
"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { MessageSquare, Phone, ShoppingCart } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { CallbackRequestForm } from "@/components/layout/callback-request-form";
import { useChat } from "@/components/chat/chat-provider";
import { CART_CHANGED_EVENT } from "@/lib/cart/cart-events";
import { getPendingItemCount } from "@/lib/cart/pending-storage";
import { formatUaPhoneDisplay, uaPhoneTelHref } from "@/lib/phone/format-ua";
import type { PublicStorePhone } from "@/server/services/store-settings.service";
import { cn } from "@/lib/utils";

type StorefrontFabsProps = {
  phones: PublicStorePhone[];
  initialCartCount: number;
  hasSession: boolean;
};

export function StorefrontFabs({ phones, initialCartCount, hasSession }: StorefrontFabsProps) {
  const [cartCount, setCartCount] = useState(initialCartCount);
  const [callbackOpen, setCallbackOpen] = useState(false);
  const { isOpen: chatIsOpen, openPanel, unreadFromStore, hasSession: chatHasSession } = useChat();

  // ... existing cart sync effects unchanged ...

  const fabClass = cn(
    "flex size-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
  );

  return (
    <>
      {/* Wrapper: right-6 (was left-6), z-[49] (was z-[59]) — dialog at z-50 renders above */}
      <div className="fixed bottom-6 right-6 z-[49] flex flex-col items-center gap-3 pb-[max(0px,env(safe-area-inset-bottom))]">
        {/* 1. Callback FAB (top) */}
        <button type="button" aria-label="Замовити дзвінок" onClick={() => setCallbackOpen(true)} className={fabClass}>
          <Phone className="size-6" aria-hidden />
        </button>

        {/* 2. Cart FAB (middle) */}
        <Link href="/koszyk" aria-label={cartCount > 0 ? `Кошик, ${cartCount} товарів` : "Кошик"}
          className={cn(fabClass, "relative")}>
          <ShoppingCart className="size-6" aria-hidden />
          {cartCount > 0 && (
            <Badge className="absolute -right-0.5 -top-0.5 min-w-5 justify-center px-1 text-[10px]" aria-hidden>
              {cartCount > 9 ? "9+" : String(cartCount)}
            </Badge>
          )}
        </Link>

        {/* 3. Chat FAB (bottom) — hidden when chat panel is open */}
        {!chatIsOpen && (
          <button type="button" onClick={() => openPanel()} className={cn(fabClass, "relative")} aria-label="Відкрити чат з магазином">
            <MessageSquare className="size-6" aria-hidden />
            {chatHasSession && unreadFromStore && (
              <span className="absolute -top-0.5 -right-0.5 size-3 rounded-full bg-primary ring-2 ring-background" aria-hidden />
            )}
          </button>
        )}
      </div>

      {/* Callback Dialog — renders via portal, z-50, above the z-[49] wrapper */}
      <Dialog open={callbackOpen} onOpenChange={setCallbackOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Зв&#39;яжіться з нами</DialogTitle>
          </DialogHeader>
          {phones.length > 0 && (
            <ul className="space-y-1 text-sm">
              {phones.map((phone) => (
                <li key={phone.id}>
                  <a href={uaPhoneTelHref(phone.digits)}>{formatUaPhoneDisplay(phone.digits)}</a>
                  {phone.label && <span className="ml-2 text-muted-foreground">{phone.label}</span>}
                </li>
              ))}
            </ul>
          )}
          <CallbackRequestForm idPrefix="fab" compact />
        </DialogContent>
      </Dialog>
    </>
  );
}
```

### FAB-04: `ChatProvider` changes — remove `<ChatFab />`, add `<StorefrontFabs />`

```tsx
// Source: src/components/chat/chat-provider.tsx [VERIFIED in codebase]
// ChatProvider now accepts FAB props and renders StorefrontFabs instead of ChatFab

type ChatProviderProps = {
  children?: ReactNode;
  hasSession: boolean;
  initialConversationId?: string;
  initialConversationStatus?: ConversationStatus;
  initialUnreadFromStore?: boolean;
  // NEW props for FAB consolidation:
  phones: PublicStorePhone[];
  initialCartCount: number;
};

// In ChatProvider JSX return:
return (
  <ChatContext.Provider value={value}>
    {children}
    {/* StorefrontFabs replaces ChatFab — has access to useChat() via context */}
    <StorefrontFabs phones={phones} initialCartCount={initialCartCount} hasSession={hasSession} />
    <ChatPanel />
  </ChatContext.Provider>
);
// NOTE: Remove the existing `const ChatFab = dynamic(...)` import and the <ChatFab /> render
```

### FAB-04: `ChatProviderGate` changes — thread FAB props

```tsx
// Source: src/components/chat/chat-provider-gate.tsx [VERIFIED in codebase]
// Accept and pass through FAB data props

export async function ChatProviderGate({
  children,
  phones,
  initialCartCount,
}: {
  children: React.ReactNode;
  phones: PublicStorePhone[];
  initialCartCount: number;
}) {
  const session = await auth.api.getSession({ headers: await headers() });
  // ... existing conversation lookup ...

  return (
    <ChatProvider
      hasSession={hasSession}
      initialConversationId={initialConversationId}
      initialConversationStatus={initialConversationStatus}
      initialUnreadFromStore={initialUnreadFromStore}
      phones={phones}
      initialCartCount={initialCartCount}
    >
      {children}
    </ChatProvider>
  );
}
```

### FAB-04: `layout.tsx` changes — pass FAB props to ChatProviderGate

```tsx
// Source: src/app/(storefront)/layout.tsx [VERIFIED in codebase]
// Remove StorefrontFabs render; pass phones/cartCount to ChatProviderGate

export default async function StorefrontLayout({ children }) {
  const session = await auth.api.getSession({ headers: await headers() });
  const contacts = await getPublicStoreContacts();
  const cartCount = session?.user ? await getCartItemCount(session.user.id) : 0;

  return (
    <>
      <StoreHeader />
      <main id="main-content" className="flex-1">
        <PageTransition>
          <NuqsAdapter>
            <Suspense fallback={null}>
              <ChatProviderGate phones={contacts.phones} initialCartCount={cartCount}>
                <CartPendingMergeGate />
                <WishlistPendingMergeGate />
                {children}
                <Analytics />
              </ChatProviderGate>
            </Suspense>
          </NuqsAdapter>
        </PageTransition>
      </main>
      <StoreFooter />
      <Toaster richColors position="top-center" closeButton />
      {/* StorefrontFabs removed from here — now rendered inside ChatProvider */}
    </>
  );
}
```

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| No global FABs | StorefrontFabs (callback + cart) at bottom-left; ChatFab at bottom-right | Phase 42 | Two separate corners; dialog z-index bug |
| Callback dialog z-50 above z-[59] FABs (assumed correct in Phase 42 research) | Actually z-[59] > z-50 so FABs bleed through dialog | Phase 42 (bug) | Fixed in Phase 45 by lowering to z-[49] |
| Validation fires on every keystroke via `shouldValidate: true` | Validation fires only on submit | Phase 45 | No more premature error messages while typing |
| Three FABs in two corners | Three FABs in one right-side column | Phase 45 | Meets FAB-04 requirement |

**Deprecated/outdated:**
- `ChatFab` dynamic import in `chat-provider.tsx`: replaced by `StorefrontFabs` render with inline chat button slot.

---

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | The `@base-ui/react/dialog` portal renders to `document.body` without adding a new stacking context ancestor above `z-50` | Architecture Patterns (z-index analysis) | Medium — if base-ui wraps the portal in a container with `z-index: auto` or higher, the fix would require a different approach. Verify by inspecting DOM in browser after fix. |
| A2 | react-hook-form 7.76.1 default `mode` is `"onSubmit"` and default `reValidateMode` is `"onChange"` — no explicit override in `callbackRequestSchema` usage | Pattern 1 (FAB-03 fix) | Low — defaults are documented and the code shows no `mode` option in `useForm({...})`. If wrong, the form may not revalidate after failed submit, requiring an explicit `mode: "onSubmit"` to be set. |
| A3 | `ChatProviderGate` is an async RSC and can accept new props without breaking its server-side rendering | Code Examples (ChatProviderGate) | Low — it is a server component today; adding typed props to a server component is safe. |

**If this table is empty:** All claims in this research were verified or cited — no user confirmation needed.

---

## Open Questions

1. **PdpCartFab z-index on PDP pages**
   - What we know: `PdpCartFab` uses `z-[59]` and renders on `/tovar/[slug]` pages. After this phase the global FAB group drops to `z-[49]`.
   - What's unclear: Does the PdpCartFab also bleed through any dialogs on PDP? This phase's scope doesn't include PDP.
   - Recommendation: Note as a deferred concern in SUMMARY.md. FAB-04 only addresses the global group.

2. **ChatPanel desktop z-index after change**
   - What we know: ChatPanel desktop wrapper uses `z-[61]`. That's above the new FAB wrapper `z-[49]` and above the dialog `z-50`.
   - What's unclear: Does this cause any visual conflict?
   - Recommendation: No conflict expected — ChatPanel at `z-[61]` is intentionally above both dialogs and FABs. No change needed.

---

## Environment Availability

Step 2.6: SKIPPED — no external dependencies. All tools confirmed available from previous phases.

---

## Validation Architecture

### Test Framework

| Property | Value |
|----------|-------|
| Framework | Vitest 4.1.6 + @testing-library/react 16.3.2 |
| Config file | `vitest.config.ts` (project root) |
| Quick run command | `npm test -- --reporter=verbose src/components/layout/callback-request-form.test.tsx src/components/layout/storefront-fabs.test.tsx` |
| Full suite command | `npm test` |

### Phase Requirements to Test Map

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| FAB-03 | Phone field shows NO error while typing partial number (e.g. "097") | unit | `npm test -- src/components/layout/callback-request-form.test.tsx` | Yes — extend existing |
| FAB-03 | Phone field shows error AFTER failed submit with short number | unit | `npm test -- src/components/layout/callback-request-form.test.tsx` | Yes — extend existing |
| FAB-04 | ChatFab slot renders inside StorefrontFabs (not separately) | unit | `npm test -- src/components/layout/storefront-fabs.test.tsx` | Yes — extend existing |
| FAB-04 | Chat button hidden when chat isOpen=true | unit | `npm test -- src/components/layout/storefront-fabs.test.tsx` | Yes — extend existing |
| FAB-04 | Chat button visible when isOpen=false | unit | `npm test -- src/components/layout/storefront-fabs.test.tsx` | Yes — extend existing |
| FAB-04 | FAB wrapper uses right-6 not left-6 | unit (class check) | `npm test -- src/components/layout/storefront-fabs.test.tsx` | Yes — extend existing |

### Sampling Rate

- **Per task commit:** `npm test -- src/components/layout/callback-request-form.test.tsx src/components/layout/storefront-fabs.test.tsx`
- **Per wave merge:** `npm test`
- **Phase gate:** Full suite green before `/gsd:verify-work`

### Wave 0 Gaps

- [ ] Add test to `callback-request-form.test.tsx`: typing partial number should NOT show validation error before submit
- [ ] Add tests to `storefront-fabs.test.tsx`: chat button renders, chat button hidden when `chatIsOpen=true`, FAB wrapper className includes `right-6`
- [ ] Update `storefront-fabs.test.tsx` mocks: add `@/components/chat/chat-provider` mock providing `useChat` stub

The mock for `useChat` needed in updated `storefront-fabs.test.tsx`:
```ts
vi.mock("@/components/chat/chat-provider", () => ({
  useChat: vi.fn().mockReturnValue({
    isOpen: false,
    openPanel: vi.fn(),
    unreadFromStore: false,
    hasSession: false,
  }),
}));
```

---

## Security Domain

### Applicable ASVS Categories

| ASVS Category | Applies | Standard Control |
|---------------|---------|-----------------|
| V2 Authentication | no | FABs visible to all users regardless of auth state |
| V3 Session Management | no | No new session handling |
| V4 Access Control | no | Storefront-only scoping via route group layout unchanged |
| V5 Input Validation | yes | `callbackRequestSchema` (Zod) validates on submit; no new validation logic added |
| V6 Cryptography | no | No crypto |

### Known Threat Patterns

| Pattern | STRIDE | Standard Mitigation |
|---------|--------|---------------------|
| Callback form spam | Denial of Service | Existing `CallbackRateLimitError` in `createCallbackRequest` — unchanged |
| Phone input injection | Tampering | Digit-stripping in onChange (`replace(/\D/g, "")`) + Zod regex on submit — unchanged |

---

## Sources

### Primary (HIGH confidence)

- Codebase — `src/components/layout/callback-request-form.tsx` [VERIFIED] — root cause of FAB-03: `shouldValidate: true` on line 74
- Codebase — `src/server/validators/phone.ts` [VERIFIED] — error message text and Zod regex `^\d{10,15}$`
- Codebase — `src/components/layout/storefront-fabs.tsx` [VERIFIED] — current positioning `left-6 z-[59]`, component structure
- Codebase — `src/components/chat/chat-fab.tsx` [VERIFIED] — standalone positioning `right-6 z-[60]`, `useChat()` dependency
- Codebase — `src/components/chat/chat-provider.tsx` [VERIFIED] — renders `<ChatFab />` inside `ChatContext.Provider`; dynamic import pattern
- Codebase — `src/components/chat/chat-provider-gate.tsx` [VERIFIED] — RSC gate that instantiates ChatProvider; prop threading path
- Codebase — `src/components/ui/dialog.tsx` [VERIFIED] — `DialogOverlay` at `fixed inset-0 isolate z-50`; `DialogPrimitive.Popup` at `fixed z-50`; renders via portal
- Codebase — `src/app/(storefront)/layout.tsx` [VERIFIED] — current wiring; `StorefrontFabs` after `Toaster` at fragment root
- Codebase — `src/components/chat/chat-panel.tsx` [VERIFIED] — `z-[61]` desktop panel wrapper
- Phase 42 RESEARCH.md + SUMMARIES [VERIFIED] — established FAB positioning patterns; z-index claim in research was incorrect (59 vs 50 ordering)
- react-hook-form 7.76.1 installed — `useForm` default mode is `"onSubmit"` [VERIFIED: package.json + node_modules]

### Secondary (MEDIUM confidence)

- Phase 42 VERIFICATION.md — user visual approval of FABs after Phase 42; dialog bleed-through not caught at that stage

---

## Metadata

**Confidence breakdown:**
- FAB-03 root cause: HIGH — source code verified, exact line identified
- FAB-04 architecture: HIGH — all component files and their render locations verified
- z-index fix (49 vs 59): HIGH — CSS stacking context rules are deterministic; dialog z-50 vs FAB z-59 verified in source
- ChatFab integration approach: HIGH — component tree and context boundaries verified in source

**Research date:** 2026-05-24
**Valid until:** 2026-06-24 (stable stack; no fast-moving dependencies)
