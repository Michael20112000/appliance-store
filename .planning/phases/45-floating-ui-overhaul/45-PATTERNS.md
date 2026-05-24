# Phase 45: Floating UI Overhaul - Pattern Map

**Mapped:** 2026-05-24
**Files analyzed:** 5
**Analogs found:** 5 / 5

---

## File Classification

| New/Modified File | Role | Data Flow | Closest Analog | Match Quality |
|-------------------|------|-----------|----------------|---------------|
| `src/components/layout/callback-request-form.tsx` | component (form) | request-response | self — surgical 1-line removal | exact |
| `src/components/layout/storefront-fabs.tsx` | component (FAB group) | event-driven + request-response | self — extend existing; chat slot from `src/components/chat/chat-fab.tsx` | exact |
| `src/components/chat/chat-provider.tsx` | provider (context) | event-driven | self — extend existing `ChatProviderProps` type; remove `ChatFab` render, add `StorefrontFabs` render | exact |
| `src/components/chat/chat-provider-gate.tsx` | component (RSC gate) | request-response | self — thread two new props through existing pattern | exact |
| `src/app/(storefront)/layout.tsx` | layout (RSC) | request-response | self — move prop pass-through from `StorefrontFabs` to `ChatProviderGate` | exact |

---

## Pattern Assignments

### `src/components/layout/callback-request-form.tsx` (component, request-response)

**Change scope:** FAB-03 — remove `shouldValidate: true` from the `onChange` handler (line 74). One option key deleted; nothing else changes.

**Current onChange pattern** (lines 71-76 — the entire register block to keep as reference):
```tsx
{...form.register("phone", {
  onChange: (event) => {
    const digits = event.target.value.replace(/\D/g, "");
    form.setValue("phone", digits, { shouldValidate: true }); // ← DELETE this option
  },
})}
```

**Target onChange pattern** (same block after removal):
```tsx
{...form.register("phone", {
  onChange: (event) => {
    const digits = event.target.value.replace(/\D/g, "");
    form.setValue("phone", digits); // no shouldValidate — default mode (onSubmit) applies
  },
})}
```

**Rule:** Keep the `.replace(/\D/g, "")` digit-strip. Remove only the options object `{ shouldValidate: true }`. The rest of the file (lines 1-70, 77-89) is untouched.

**Why safe:** `useForm` at line 28-31 has no explicit `mode` override — it defaults to `"onSubmit"`. After the first failed submit, react-hook-form enters `reValidateMode: "onChange"` automatically, so the field still clears errors in real time once the user corrects input.

---

### `src/components/layout/storefront-fabs.tsx` (component, event-driven + request-response)

**Change scope:** FAB-04 — three edits: (1) wrapper `left-6` → `right-6` and `z-[59]` → `z-[49]`, (2) add `useChat` import, (3) add chat FAB slot as third button in the flex-col.

**Current imports** (lines 1-18 — all kept; add one import):
```tsx
"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Phone, ShoppingCart } from "lucide-react";   // add MessageSquare here
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { CallbackRequestForm } from "@/components/layout/callback-request-form";
import { CART_CHANGED_EVENT } from "@/lib/cart/cart-events";
import { getPendingItemCount } from "@/lib/cart/pending-storage";
import { formatUaPhoneDisplay, uaPhoneTelHref } from "@/lib/phone/format-ua";
import type { PublicStorePhone } from "@/server/services/store-settings.service";
import { cn } from "@/lib/utils";
// ADD:
import { useChat } from "@/components/chat/chat-provider";
```

**New import for icons** — change line 5:
```tsx
import { MessageSquare, Phone, ShoppingCart } from "lucide-react";
```

**New hook call** — add after the existing `useState` calls (after line 32, before `useEffect`):
```tsx
const { isOpen: chatIsOpen, openPanel, unreadFromStore, hasSession: chatHasSession } = useChat();
```

Note: rename `isOpen` → `chatIsOpen` and `hasSession` → `chatHasSession` to avoid shadowing the `hasSession` prop already destructured in the function signature.

**Wrapper div change** (line 51 — change two utility classes):
```tsx
// BEFORE:
className="fixed bottom-6 left-6 z-[59] flex flex-col items-center gap-3 pb-[max(0px,env(safe-area-inset-bottom))]"

// AFTER:
className="fixed bottom-6 right-6 z-[49] flex flex-col items-center gap-3 pb-[max(0px,env(safe-area-inset-bottom))]"
```

**Chat FAB slot** — add after the closing `</Link>` of the Cart FAB (after line 84) and before the `</div>` that closes the wrapper (line 111), but before the Dialog render. Place it inside the wrapper `<div>`, after the cart `<Link>`:
```tsx
{/* FAB-04: Chat FAB — hidden when chat panel is open */}
{!chatIsOpen && (
  <button
    type="button"
    onClick={() => openPanel()}
    className={cn(
      "flex size-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg",
      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring relative",
    )}
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

**Existing cart FAB `cn()` pattern** (lines 70-73 — copy this class structure for the chat button):
```tsx
className={cn(
  "flex size-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg",
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring relative",
)}
```

**Dialog stays unchanged** (lines 87-110) — the `<Dialog>` block is already correctly placed and renders via portal at `z-50`, which is above the new `z-[49]` wrapper.

**Return shape before/after:**
```
BEFORE: <div wrapper left-6 z-[59]>  callback-btn  cart-link  </div>  <Dialog>
AFTER:  <div wrapper right-6 z-[49]> callback-btn  cart-link  chat-btn </div> <Dialog>
```

The outer JSX uses a bare `<div>` (no fragment) — the `<Dialog>` is a sibling rendered after `</div>`. No wrapping fragment needed because the component currently returns a single `<div>` followed by a `<Dialog>` — those two are siblings inside the implicit React return. Check: current line 49 shows `return (` and line 111 closes `</div>`, then line 87-110 is the `<Dialog>`. Actually the Dialog is INSIDE the wrapper `<div>` (line 51 opens the div, line 111 closes it, and the Dialog at line 87 is between them). After adding the chat button, the Dialog remains the last child inside the wrapper `<div>` — no structural change needed, just insert the chat button before the Dialog.

---

### `src/components/chat/chat-provider.tsx` (provider, event-driven)

**Change scope:** FAB-04 — three edits: (1) add three props to `ChatProviderProps`, (2) add `StorefrontFabs` import (static, not dynamic), (3) replace `<ChatFab />` render with `<StorefrontFabs ... />` and remove the `ChatFab` dynamic import.

**Current `ChatProviderProps` type** (lines 73-79):
```tsx
type ChatProviderProps = {
  children?: ReactNode;
  hasSession: boolean;
  initialConversationId?: string;
  initialConversationStatus?: ConversationStatus;
  initialUnreadFromStore?: boolean;
};
```

**New `ChatProviderProps` type** (add two props):
```tsx
type ChatProviderProps = {
  children?: ReactNode;
  hasSession: boolean;
  initialConversationId?: string;
  initialConversationStatus?: ConversationStatus;
  initialUnreadFromStore?: boolean;
  // FAB-04: props forwarded to StorefrontFabs
  phones: PublicStorePhone[];
  initialCartCount: number;
};
```

**New import needed** — add after existing imports block:
```tsx
import { StorefrontFabs } from "@/components/layout/storefront-fabs";
import type { PublicStorePhone } from "@/server/services/store-settings.service";
```

**Remove** the `ChatFab` dynamic import block (lines 25-28):
```tsx
// DELETE these 4 lines:
const ChatFab = dynamic(
  () => import("@/components/chat/chat-fab").then((m) => ({ default: m.ChatFab })),
  { ssr: false },
);
```

**Updated function signature** (line 89-95 — add two params):
```tsx
export function ChatProvider({
  children,
  hasSession,
  initialConversationId,
  initialConversationStatus,
  initialUnreadFromStore = false,
  phones,          // NEW
  initialCartCount, // NEW
}: ChatProviderProps) {
```

**Current JSX return** (lines 374-381):
```tsx
return (
  <ChatContext.Provider value={value}>
    {children}
    <ChatFab />
    <ChatPanel />
  </ChatContext.Provider>
);
```

**New JSX return** (replace `<ChatFab />` with `<StorefrontFabs>`):
```tsx
return (
  <ChatContext.Provider value={value}>
    {children}
    <StorefrontFabs
      phones={phones}
      initialCartCount={initialCartCount}
      hasSession={hasSession}
    />
    <ChatPanel />
  </ChatContext.Provider>
);
```

**Why `StorefrontFabs` is NOT dynamic here:** `StorefrontFabs` is `"use client"` and is rendered inside a client component (`ChatProvider`). Dynamic import with `ssr: false` was needed for `ChatFab` to avoid SSR of a component that calls `useChat()` — but `StorefrontFabs` is now rendered inside `ChatProvider` where the context is already available. Static import is fine; Next.js client boundary handles SSR naturally for `"use client"` components.

**`dynamic` import of `ChatPanel` stays** (lines 30-36) — `ChatPanel` is unchanged.

---

### `src/components/chat/chat-provider-gate.tsx` (component RSC gate, request-response)

**Change scope:** FAB-04 — accept `phones` and `initialCartCount` props and thread them to `ChatProvider`.

**Current props type** (lines 7-11):
```tsx
export async function ChatProviderGate({
  children,
}: {
  children: React.ReactNode;
}) {
```

**New props type:**
```tsx
import type { PublicStorePhone } from "@/server/services/store-settings.service";

export async function ChatProviderGate({
  children,
  phones,
  initialCartCount,
}: {
  children: React.ReactNode;
  phones: PublicStorePhone[];
  initialCartCount: number;
}) {
```

**Current `ChatProvider` render** (lines 34-42):
```tsx
return (
  <ChatProvider
    hasSession={hasSession}
    initialConversationId={initialConversationId}
    initialConversationStatus={initialConversationStatus}
    initialUnreadFromStore={initialUnreadFromStore}
  >
    {children}
  </ChatProvider>
);
```

**New `ChatProvider` render** (add two props):
```tsx
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
```

**Existing RSC pattern** (lines 1-6 — import block stays; add one import):
```tsx
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import type { ConversationStatus } from "@/generated/prisma/client";
import { getConversationForBuyer } from "@/server/services/chat.service";
import { ChatProvider } from "@/components/chat/chat-provider";
// ADD:
import type { PublicStorePhone } from "@/server/services/store-settings.service";
```

Body of the function (lines 12-31 — session lookup and conversation fetch) is entirely unchanged.

---

### `src/app/(storefront)/layout.tsx` (layout RSC, request-response)

**Change scope:** FAB-04 — pass `phones` and `initialCartCount` to `ChatProviderGate` instead of `StorefrontFabs`; remove `StorefrontFabs` render and import.

**Current import** (line 10 — DELETE):
```tsx
import { StorefrontFabs } from "@/components/layout/storefront-fabs";
```

**Current `ChatProviderGate` usage** (line 33 — add two props):
```tsx
// BEFORE:
<ChatProviderGate>

// AFTER:
<ChatProviderGate phones={contacts.phones} initialCartCount={cartCount}>
```

**Current `StorefrontFabs` render** (lines 45-49 — DELETE the entire element):
```tsx
// DELETE:
<StorefrontFabs
  phones={contacts.phones}
  initialCartCount={cartCount}
  hasSession={Boolean(session?.user)}
/>
```

**Target JSX return shape:**
```tsx
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
    {/* StorefrontFabs removed — now rendered inside ChatProvider */}
  </>
);
```

Note: `hasSession` no longer needs to be passed to `StorefrontFabs` via `layout.tsx` — `ChatProvider` already receives `hasSession` from `ChatProviderGate`'s own session lookup and passes it down.

Data fetching lines (22-24) are unchanged — `contacts` and `cartCount` are still needed and now forwarded to `ChatProviderGate` instead.

---

## Shared Patterns

### Client Component Hook-in-Provider Pattern
**Source:** `src/components/chat/chat-provider.tsx` lines 374-381
**Apply to:** `storefront-fabs.tsx` (new `useChat()` call) and `chat-provider.tsx` (new `StorefrontFabs` render)

The pattern: a `"use client"` component rendered as a direct child of a Context.Provider can call that context's hook. `StorefrontFabs` rendered inside `<ChatContext.Provider value={value}>` has full access to `useChat()`.

```tsx
// Established pattern — children + side-panel components as siblings under Provider
return (
  <ChatContext.Provider value={value}>
    {children}
    <ComponentThatUsesContext />   // ← StorefrontFabs goes here
    <ChatPanel />
  </ChatContext.Provider>
);
```

### RSC Prop Threading Pattern
**Source:** `src/components/chat/chat-provider-gate.tsx` lines 7-43
**Apply to:** `chat-provider-gate.tsx` (new props), `chat-provider.tsx` (new props)

The gate RSC receives typed props, does its own async work (session + DB lookup), then merges all props when rendering the client provider. New props pass straight through — no computation on them in the gate.

### Dynamic Import for `ssr: false` Client Components
**Source:** `src/components/chat/chat-provider.tsx` lines 30-36
**Apply to:** `chat-provider.tsx` (keep `ChatPanel` dynamic; remove `ChatFab` dynamic — `StorefrontFabs` uses static import)

```tsx
const ChatPanel = dynamic(
  () =>
    import("@/components/chat/chat-panel").then((m) => ({
      default: m.ChatPanel,
    })),
  { ssr: false },
);
```

`StorefrontFabs` does NOT need `ssr: false` dynamic import because it is now rendered inside a client component tree. Static import is correct.

### z-index Stacking Convention
**Source:** `src/components/layout/storefront-fabs.tsx` line 51; `src/components/ui/dialog.tsx` (DialogOverlay: `z-50`)
**Apply to:** `storefront-fabs.tsx` wrapper div

The dialog overlay uses `z-50` (value 50). The FAB wrapper must use a lower value so the dialog covers FABs when open. Use `z-[49]` for the FAB wrapper.

```
z-[49]  ← FAB wrapper (storefront-fabs.tsx)
z-50    ← Dialog backdrop + popup (dialog.tsx portal — covers FABs)
z-[61]  ← ChatPanel desktop wrapper (unaffected, intentionally above all)
```

---

## No Analog Found

None — all five files are being modified in place with clear existing patterns as the starting point.

---

## Metadata

**Analog search scope:** `src/components/layout/`, `src/components/chat/`, `src/app/(storefront)/`
**Files scanned:** 5 source files read in full
**Pattern extraction date:** 2026-05-24
