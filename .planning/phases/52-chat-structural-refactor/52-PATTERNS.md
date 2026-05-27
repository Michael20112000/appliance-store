# Phase 52: Chat Structural Refactor — Pattern Map

**Mapped:** 2026-05-27
**Files analyzed:** 5 (1 new, 4 modified)
**Analogs found:** 5 / 5

---

## File Classification

| New/Modified File | Role | Data Flow | Closest Analog | Match Quality |
|-------------------|------|-----------|----------------|---------------|
| `src/components/ui/drawer.tsx` | ui-wrapper | request-response | `src/components/ui/sheet.tsx` | exact |
| `src/components/chat/chat-provider.tsx` | provider/context | event-driven | itself (MODIFY existing) | self |
| `src/components/chat/chat-panel.tsx` | component | request-response | itself (MODIFY existing) | self |
| `src/components/chat/history-drawer.tsx` | component | request-response | itself (MINOR MODIFY existing) | self |
| `src/lib/chat/search-params.ts` | utility/config | — | itself (MODIFY or DELETE) | self |

---

## Pattern Assignments

### `src/components/ui/drawer.tsx` (NEW — ui-wrapper, request-response)

**Analog:** `src/components/ui/sheet.tsx`

**Imports pattern** (`sheet.tsx` lines 1–8):
```tsx
"use client"

import * as React from "react"
import { Dialog as SheetPrimitive } from "@base-ui/react/dialog"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { XIcon } from "lucide-react"
```

Copy this structure exactly, substituting the Drawer import:
```tsx
"use client"

import * as React from "react"
import { Drawer as DrawerPrimitive } from "@base-ui/react/drawer"

import { cn } from "@/lib/utils"
```

**Primitive import source:** `@base-ui/react/drawer` exports via `index.parts.d.ts`:
- `DrawerRoot as Root`
- `DrawerPortal as Portal`
- `DrawerBackdrop as Backdrop`
- `DrawerPopup as Popup`
- `DrawerSwipeArea as SwipeArea`
- `DrawerClose as Close`
- `DrawerTitle as Title`
- `DrawerDescription as Description`
- `DrawerViewport as Viewport`

**Wrapper function pattern** (`sheet.tsx` lines 10–12, 14–16, 22–24):
```tsx
function Sheet({ ...props }: SheetPrimitive.Root.Props) {
  return <SheetPrimitive.Root data-slot="sheet" {...props} />
}

function SheetTrigger({ ...props }: SheetPrimitive.Trigger.Props) {
  return <SheetPrimitive.Trigger data-slot="sheet-trigger" {...props} />
}

function SheetPortal({ ...props }: SheetPrimitive.Portal.Props) {
  return <SheetPrimitive.Portal data-slot="sheet-portal" {...props} />
}
```

Mirror this pattern for Drawer:
```tsx
function DrawerRoot({ ...props }: DrawerPrimitive.Root.Props) {
  return <DrawerPrimitive.Root data-slot="drawer" {...props} />
}

function DrawerPortal({ ...props }: DrawerPrimitive.Portal.Props) {
  return <DrawerPrimitive.Portal data-slot="drawer-portal" {...props} />
}
```

**Backdrop/Overlay animation pattern** (`sheet.tsx` lines 26–37):
```tsx
function SheetOverlay({ className, ...props }: SheetPrimitive.Backdrop.Props) {
  return (
    <SheetPrimitive.Backdrop
      data-slot="sheet-overlay"
      className={cn(
        "fixed inset-0 z-50 bg-black/10 transition-opacity duration-150 data-ending-style:opacity-0 data-starting-style:opacity-0 supports-backdrop-filter:backdrop-blur-xs",
        className
      )}
      {...props}
    />
  )
}
```

Copy this for `DrawerBackdrop` — same `data-starting-style` / `data-ending-style` animation attributes, same `fixed inset-0 z-50 bg-black/10` base classes. These are the Base UI animation hook attributes (not Radix `data-state`).

**Popup animation pattern** — bottom-drawer variant from `sheet.tsx` line 56 (`data-[side=bottom]` block):
```
transition duration-200 ease-in-out
data-ending-style:opacity-0
data-starting-style:opacity-0
data-ending-style:translate-y-[2.5rem]
data-starting-style:translate-y-[2.5rem]
```
Apply these directly on `DrawerPopup` without the `data-[side=bottom]` scope selector — a Drawer is always bottom by default:
```tsx
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
  )
}
```

**SwipeArea** (new part, no sheet analog — from RESEARCH.md pattern):
```tsx
function DrawerSwipeArea({ className, ...props }: DrawerPrimitive.SwipeArea.Props) {
  return (
    <DrawerPrimitive.SwipeArea
      data-slot="drawer-swipe-area"
      className={cn("absolute inset-x-0 top-0 h-8 cursor-ns-resize", className)}
      {...props}
    />
  )
}
```

**Export pattern** (`sheet.tsx` lines 129–138):
```tsx
export {
  Sheet,
  SheetTrigger,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetFooter,
  SheetTitle,
  SheetDescription,
}
```
Mirror with named function exports (no barrel re-export alias needed — the chat consumer will import by name):
```tsx
export {
  DrawerRoot,
  DrawerPortal,
  DrawerBackdrop,
  DrawerPopup,
  DrawerSwipeArea,
  DrawerClose,
  DrawerTitle,
  DrawerDescription,
}
```

**Key type difference from sheet.tsx:** `DrawerRoot.Props` has `swipeDirection?: DrawerSwipeDirection` and `onOpenChange?: (open: boolean, eventDetails: DrawerRoot.ChangeEventDetails) => void`. The `eventDetails` second parameter is part of the type — the consumer callback must match `(open: boolean, eventDetails: DrawerRoot.ChangeEventDetails) => void` or use `(open: boolean) => void` (TypeScript accepts fewer params).

---

### `src/components/chat/chat-provider.tsx` (MODIFY — provider, event-driven)

**File:** `src/components/chat/chat-provider.tsx` (read in full above)

**Current nuqs block to remove** (lines 14–17, 114–117):
```tsx
// REMOVE these imports:
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useQueryStates } from "nuqs";
import { chatParsers, chatUrlKeys } from "@/lib/chat/search-params";

// REMOVE this hook call (lines 114-117):
const [query, setQuery] = useQueryStates(chatParsers, {
  shallow: false,
  urlKeys: chatUrlKeys,
});
```

**Current isOpen derivation to replace** (line 138):
```tsx
// REMOVE:
const isOpen = query.chat === "open";

// REPLACE WITH (follows existing useState pattern, lines 119-133):
const [isOpen, setIsOpen] = useState(false);
```

**Existing useState pattern to copy** (lines 119–133) — all other state follows this form:
```tsx
const [conversationId, setConversationId] = useState<string | null>(
  initialConversationId ?? null,
);
const [messages, setMessages] = useState<ChatMessage[]>([]);
const [isLoading, setIsLoading] = useState(false);
const [panelView, setPanelView] = useState<"thread" | "history">("thread");
```

**`closePanel` rewrite** (lines 149–153):
```tsx
// BEFORE:
const closePanel = useCallback(() => {
  void setQuery({ chat: null, productId: null });
  setProductContext(null);
  setPanelView("thread");
}, [setQuery]);

// AFTER (remove setQuery, remove dependency):
const closePanel = useCallback(() => {
  setIsOpen(false);
  setProductContext(null);
  setPanelView("thread");
}, []);
```

**`openPanel` rewrite** (lines 158–184):
```tsx
// BEFORE:
const openPanel = useCallback(
  (options?: ProductChatContext) => {
    if (!hasSession && !guestToken) { /* token logic */ }
    if (options?.productId || options?.productTitle || options?.productSlug) {
      setProductContext(options);
      void setQuery({ chat: "open", productId: options.productId ?? null });
      return;
    }
    void setQuery({ chat: "open" });
  },
  [guestToken, hasSession, setQuery],
);

// AFTER (remove setQuery entirely, use setIsOpen):
const openPanel = useCallback(
  (options?: ProductChatContext) => {
    if (!hasSession && !guestToken) { /* same token logic unchanged */ }
    if (options?.productId || options?.productTitle || options?.productSlug) {
      setProductContext(options);
    }
    setIsOpen(true);
  },
  [guestToken, hasSession],
);
```

**`isOpenRef` sync effect** (lines 145–147) — keep unchanged, it reads `isOpen` which is now from `useState` not nuqs:
```tsx
useEffect(() => {
  isOpenRef.current = isOpen;
}, [isOpen]);
```

**Imports to remove:** `useRouter`, `useSearchParams`, `usePathname` from `next/navigation` (check if `router` is used elsewhere — line 468 uses `router.refresh()` in the claim effect, so `useRouter` must be kept if that effect remains). Only remove `useSearchParams`, `usePathname` if they are not used elsewhere.

**`useMemo` value object and deps** (lines 478–533) — `isOpen` entry stays; just remove any nuqs-derived values. No structural change needed.

---

### `src/components/chat/chat-panel.tsx` (MODIFY — component, request-response)

**File:** `src/components/chat/chat-panel.tsx` (read in full above)

**Current Sheet import block to replace** (lines 14–18):
```tsx
// REMOVE:
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";

// ADD:
import {
  DrawerRoot,
  DrawerPortal,
  DrawerBackdrop,
  DrawerPopup,
  DrawerSwipeArea,
} from "@/components/ui/drawer";
```

**Current mobile Sheet block to replace** (lines 189–203):
```tsx
// BEFORE:
<Sheet
  open={isOpen && isMobile}
  onOpenChange={(open) => !open && closePanel()}
>
  <SheetContent
    side="bottom"
    showCloseButton={false}
    className="flex h-[80dvh] max-h-[80dvh] min-h-0 flex-col gap-0 overflow-hidden rounded-t-2xl border-t p-0 pb-[max(0px,env(safe-area-inset-bottom))] md:hidden data-[side=bottom]:h-[80dvh]"
  >
    <SheetHeader className="sr-only">
      <SheetTitle>Чат з магазином</SheetTitle>
    </SheetHeader>
    {panelView === "history" ? <HistoryDrawer /> : <PanelBody useNativeScroll stickyHeader />}
  </SheetContent>
</Sheet>
```

```tsx
// AFTER — copy Drawer structure from sheet.tsx portal pattern:
<DrawerRoot
  open={isOpen && isMobile}
  onOpenChange={(open) => { if (!open) closePanel(); }}
  swipeDirection="down"
>
  <DrawerPortal>
    <DrawerBackdrop />
    <DrawerPopup className="h-[80dvh] max-h-[80dvh] min-h-0 flex-col gap-0 rounded-t-2xl border-t p-0 pb-[max(0px,env(safe-area-inset-bottom))] md:hidden">
      <DrawerSwipeArea />
      {/* History overlay pattern — see CHAT-13 below */}
      <div className="relative flex h-full min-h-0 flex-1 flex-col overflow-hidden">
        <PanelBody useNativeScroll stickyHeader />
        <div
          className={cn(
            "absolute inset-y-0 left-0 z-10 w-[75%] bg-background transition-transform duration-200 ease-in-out motion-reduce:transition-none",
            panelView === "history" ? "translate-x-0" : "-translate-x-full"
          )}
        >
          <HistoryDrawer />
        </div>
      </div>
    </DrawerPopup>
  </DrawerPortal>
</DrawerRoot>
```

**Current desktop widget content-swap to replace** (line 185):
```tsx
// BEFORE — full swap:
{isOpen ? (panelView === "history" ? <HistoryDrawer /> : <PanelBody useNativeScroll={false} />) : null}

// AFTER — overlay pattern (both components always rendered when isOpen):
{isOpen ? (
  <div className="relative flex h-full min-h-0 flex-1 flex-col overflow-hidden">
    <PanelBody useNativeScroll={false} />
    <div
      className={cn(
        "absolute inset-y-0 left-0 z-10 w-[75%] bg-background transition-transform duration-200 ease-in-out motion-reduce:transition-none",
        panelView === "history" ? "translate-x-0" : "-translate-x-full"
      )}
    >
      <HistoryDrawer />
    </div>
  </div>
) : null}
```

**`cn` import** — add to imports (line 3 currently has no `cn`):
```tsx
import { cn } from "@/lib/utils";
```

**`motion-reduce:transition-none` pattern** — derived from `globals.css` lines 154–158 where `prefers-reduced-motion: reduce` sets animation-duration to 0. Use Tailwind's `motion-reduce:` variant to match.

---

### `src/components/chat/history-drawer.tsx` (MINOR MODIFY — component, request-response)

**File:** `src/components/chat/history-drawer.tsx` (read in full above)

**Current root container** (line 83):
```tsx
<div className="flex h-full min-h-0 flex-1 flex-col overflow-hidden">
```

This is already correct for an overlay child — `h-full` fills the parent overlay div's height. No structural change is needed to the component itself.

**Possible adjustment:** If the overlay div in `chat-panel.tsx` has `inset-y-0` (full height) rather than `inset-0` (full overlay), `HistoryDrawer`'s `h-full` still works. Only tweak class names if the planner determines the overlay should be `inset-0` (full coverage) vs. `inset-y-0 left-0 w-[75%]` (partial width).

**No import changes required.** The component's API (`closeHistory` from context) is unchanged.

---

### `src/lib/chat/search-params.ts` (MODIFY or DELETE — utility/config)

**File:** `src/lib/chat/search-params.ts` (read in full above, 17 lines total)

**Current content** (lines 1–17):
```ts
import {
  createSearchParamsCache,
  parseAsString,
  parseAsStringLiteral,
} from "nuqs/server";

export const chatParsers = {
  chat: parseAsStringLiteral(["open"] as const),
  productId: parseAsString,
};

export const chatSearchParamsCache = createSearchParamsCache(chatParsers);

export const chatUrlKeys = {
  chat: "chat",
  productId: "productId",
};
```

**Verification:** RESEARCH.md confirms (Pitfall 5, line 294): "only `chat-provider.tsx` and `search-params.ts` itself reference `chatSearchParamsCache`. No server components consume it. Safe to remove."

**Action:** Delete the file entirely. Both `chatParsers` and `chatUrlKeys` are imported only in `chat-provider.tsx` (lines 16–17 of that file). Removing those imports from `chat-provider.tsx` makes `search-params.ts` fully orphaned.

**If deletion is not preferred** — trim to empty barrel or leave with a comment. Deletion is cleaner.

---

## Shared Patterns

### Base UI Animation Attributes (`data-starting-style` / `data-ending-style`)
**Source:** `src/components/ui/sheet.tsx` lines 31, 56
**Apply to:** `src/components/ui/drawer.tsx` (Backdrop and Popup)

Base UI uses `data-starting-style:` and `data-ending-style:` Tailwind variants (not `data-open:` / `data-closed:` — those are from dialog.tsx which uses a different animation scheme). The Drawer is a Base UI Dialog variant and uses the same attribute system as Sheet.

```tsx
// Backdrop:
"transition-opacity duration-150 data-ending-style:opacity-0 data-starting-style:opacity-0"

// Popup (bottom drawer):
"transition-transform duration-200 ease-in-out data-ending-style:translate-y-[2.5rem] data-ending-style:opacity-0 data-starting-style:translate-y-[2.5rem] data-starting-style:opacity-0"
```

### `cn()` Utility
**Source:** `src/components/ui/sheet.tsx` line 6, `src/components/ui/dialog.tsx` line 6
**Apply to:** `src/components/ui/drawer.tsx`, `src/components/chat/chat-panel.tsx`

```tsx
import { cn } from "@/lib/utils"
```

### CSS Translate Overlay Transition
**Source:** `src/app/globals.css` lines 154–158 (reduced-motion media query pattern)
**Apply to:** History overlay div in `src/components/chat/chat-panel.tsx`

Use Tailwind's `motion-reduce:transition-none` variant to respect `prefers-reduced-motion`:
```tsx
className={cn(
  "... transition-transform duration-200 ease-in-out motion-reduce:transition-none",
  panelView === "history" ? "translate-x-0" : "-translate-x-full"
)}
```

### `data-slot` Attribute Convention
**Source:** `src/components/ui/sheet.tsx` (every wrapper function), `src/components/ui/dialog.tsx`
**Apply to:** `src/components/ui/drawer.tsx`

Every wrapped primitive gets a `data-slot="<component-name>"` prop for targeting in CSS and testing:
```tsx
<DrawerPrimitive.Root data-slot="drawer" {...props} />
<DrawerPrimitive.Backdrop data-slot="drawer-backdrop" ... />
<DrawerPrimitive.Popup data-slot="drawer-popup" ... />
<DrawerPrimitive.SwipeArea data-slot="drawer-swipe-area" ... />
```

### `"use client"` Directive
**Source:** `src/components/ui/sheet.tsx` line 1, `src/components/chat/chat-provider.tsx` line 1
**Apply to:** `src/components/ui/drawer.tsx` (new file uses React hooks implicitly via Base UI)

Always first line, before imports.

### Ukrainian UI Text
**Source:** `src/components/chat/chat-panel.tsx` lines 39–40, 56–57 (`aria-label` values)
**Apply to:** Any new `aria-label` or visible text in chat files

All user-visible strings and accessibility labels are in Ukrainian:
```tsx
aria-label="Закрити чат"
aria-label="Відкрити меню чатів"
```

---

## No Analog Found

All files have close analogs in the codebase. No file requires falling back to RESEARCH.md patterns exclusively.

| File | Note |
|------|------|
| `DrawerSwipeArea` wrapper | No exact analog — only part in Drawer with no Sheet equivalent. Use RESEARCH.md excerpt directly (SwipeArea at top of Popup, `h-8 cursor-ns-resize`). |

---

## Metadata

**Analog search scope:** `src/components/ui/`, `src/components/chat/`, `src/lib/chat/`, `node_modules/@base-ui/react/drawer/`
**Files read:** 9 source files + 2 type definition files
**Pattern extraction date:** 2026-05-27
