---
phase: 45-floating-ui-overhaul
reviewed: 2026-05-24T00:00:00Z
depth: standard
files_reviewed: 7
files_reviewed_list:
  - src/components/layout/callback-request-form.tsx
  - src/components/layout/callback-request-form.test.tsx
  - src/components/layout/storefront-fabs.tsx
  - src/components/layout/storefront-fabs.test.tsx
  - src/components/chat/chat-provider.tsx
  - src/components/chat/chat-provider-gate.tsx
  - src/app/(storefront)/layout.tsx
findings:
  critical: 2
  warning: 4
  info: 2
  total: 8
status: issues_found
---

# Phase 45: Code Review Report

**Reviewed:** 2026-05-24T00:00:00Z
**Depth:** standard
**Files Reviewed:** 7
**Status:** issues_found

## Summary

Seven files from the Floating UI Overhaul phase were reviewed: the new callback request form and its tests, the consolidated `StorefrontFabs` component and its tests, the rearchitected `ChatProvider` (which now owns `StorefrontFabs` and `ChatPanel`), the server-side `ChatProviderGate`, and the storefront layout.

The consolidation logic is largely sound. Two critical issues were found: a stale-closure bug in `appendMessage` that will silently drop the unread-indicator for new messages when the chat panel is open, and an inconsistency in the Pusher `failed` connection state not being included in the initial disconnection check. Four warnings cover a double `auth.api.getSession` call per page render, a productContext leak across sessions, an RHF `setValue` options gap, and a `type="tel"` / `inputMode="numeric"` conflict. Two info items flag minor dead-code and test-assertion quality.

---

## Critical Issues

### CR-01: `appendMessage` closes over stale `isOpen` — unread indicator broken when panel is open

**File:** `src/components/chat/chat-provider.tsx:161-169`

`appendMessage` is defined with `useCallback` and lists `isOpen` as a dependency:

```ts
const appendMessage = useCallback((message: ChatMessage) => {
  setMessages((prev) => { … });
  if (message.senderRole === "STORE") {
    setUnreadFromStore(!isOpen);   // ← captures isOpen at creation time
  }
}, [isOpen]);
```

Because `appendMessage` is a dependency of the Pusher `useEffect` (line 323), changing `isOpen` causes the Pusher subscription to be torn down and rebuilt — there is a window between the teardown of the old subscription and the setup of the new one. More importantly, the design intent appears to be: "set `unreadFromStore = true` only when the panel is *not* open." But because `isOpen` is captured in the closure, a message arriving when `isOpen` is `true` correctly sets `unreadFromStore = false`; however if the panel is opened *after* a message arrives the dot will never appear because `appendMessage` was called with the snapshot `isOpen = false` at arrival time, which is correct — the real problem runs the other way: if the panel is open when a STORE message arrives, `!isOpen` is `false`, so `unreadFromStore` is set to `false` (which is correct behaviour). But the *opposite* race also exists: the separate `useEffect` at line 325-329 calls `clearUnreadFromStore()` whenever `isOpen && hasSession`. This effect fires *after* `appendMessage` could have already set `unreadFromStore = true`. These two paths can interleave to silently suppress the dot.

The deeper issue is that `appendMessage` should not close over the `isOpen` *value* at all. Use the functional-updater pattern or a ref to read the current value at call time instead of re-subscribing Pusher every time the panel opens/closes:

```ts
const isOpenRef = useRef(isOpen);
useEffect(() => { isOpenRef.current = isOpen; }, [isOpen]);

const appendMessage = useCallback((message: ChatMessage) => {
  setMessages((prev) => {
    if (prev.some((item) => item.id === message.id)) return prev;
    return [...prev, message];
  });
  if (message.senderRole === "STORE") {
    setUnreadFromStore(!isOpenRef.current);   // reads live value, no dep on isOpen
  }
}, []);  // stable — Pusher effect no longer re-subscribes on panel toggle
```

This removes `isOpen` from `appendMessage`'s dependency array, which also removes it from the Pusher `useEffect` dependency array (line 323), eliminating the unnecessary subscribe/unsubscribe cycle every time the panel is toggled.

---

### CR-02: Initial `isDisconnected` snapshot omits the `failed` state

**File:** `src/components/chat/chat-provider.tsx:311-314`

The `handleStateChange` handler (lines 285-303) treats `"failed"` as a disconnected state and sets `isDisconnected = true`. However the initial snapshot taken when the effect mounts omits `"failed"`:

```ts
setIsDisconnected(
  pusher.connection.state === "disconnected" ||
    pusher.connection.state === "unavailable",
  // ← "failed" is missing here
);
```

If Pusher is already in the `"failed"` state when `ChatProvider` mounts (e.g., network offline from the very first render), the component will incorrectly show `isDisconnected = false` until the next state-change event. Any UI that renders a "connection lost" banner based on `isDisconnected` will be silently wrong on initial mount.

**Fix:**
```ts
setIsDisconnected(
  pusher.connection.state === "disconnected" ||
    pusher.connection.state === "unavailable" ||
    pusher.connection.state === "failed",
);
```

---

## Warnings

### WR-01: `auth.api.getSession` called twice per storefront page render

**File:** `src/app/(storefront)/layout.tsx:21` and `src/components/chat/chat-provider-gate.tsx:17-19`

`StorefrontLayout` calls `auth.api.getSession` to resolve the session for the cart count query, and then `ChatProviderGate` — rendered inside that same request tree — calls it again to resolve the same session for chat initialisation. Depending on the auth library's per-request caching behaviour, this may double the latency of the session lookup on every storefront page load.

The fix is to pass the resolved session (or at minimum `hasSession` + `userId`) down as a prop from `StorefrontLayout` to `ChatProviderGate`, eliminating the second call:

```ts
// layout.tsx
const session = await auth.api.getSession({ headers: await headers() });
const contacts = await getPublicStoreContacts();
const cartCount = session?.user ? await getCartItemCount(session.user.id) : 0;

return (
  …
  <ChatProviderGate
    phones={contacts.phones}
    initialCartCount={cartCount}
    session={session ?? null}        // ← pass down
  >
```

```ts
// chat-provider-gate.tsx  (accept session as prop, remove its own getSession call)
export async function ChatProviderGate({ session, … }) { … }
```

---

### WR-02: `productContext` not cleared when `openPanel()` is called without options

**File:** `src/components/chat/chat-provider.tsx:140-157`

In `openPanel`, when `options` is absent or all option fields are falsy, only `setQuery({ chat: "open" })` is called. `setProductContext(null)` is **not** called. This means if a user:
1. Opens chat from a product page (`openPanel({ productId: "abc", … })`) — `productContext` is set.
2. Closes the panel.
3. Opens the panel generically (e.g., from the FAB) — `productContext` still holds the previous product data.

The `ChatPanel` will receive a stale `productContext` and may pre-populate or send product context for an unrelated generic chat session.

**Fix:**
```ts
const openPanel = useCallback(
  (options?: ProductChatContext) => {
    if (!hasSession) {
      guestRedirect();
      return;
    }

    if (options?.productId || options?.productTitle || options?.productSlug) {
      setProductContext(options);
      void setQuery({ chat: "open", productId: options.productId ?? null });
      return;
    }

    setProductContext(null);    // ← add this
    void setQuery({ chat: "open" });
  },
  [guestRedirect, hasSession, setQuery],
);
```

---

### WR-03: `form.setValue` called without `shouldValidate` — digit-stripping onChange may leave RHF internal value out of sync with displayed value

**File:** `src/components/layout/callback-request-form.tsx:71-76`

The `onChange` handler strips non-digits and calls `form.setValue("phone", digits)`. `form.register` is also spread on the input, so RHF's own `onChange` handler runs first (updating the internal value to the *raw* input), then the custom handler calls `setValue` to overwrite it with the digit-only string. This works correctly for value storage but `setValue` defaults to `{ shouldValidate: false, shouldDirty: false, shouldTouch: false }`. After the user clears the field or pastes mixed content, the field's dirty/touched state may not be updated, which can suppress the error display path that relies on those flags (depending on RHF mode). More concretely: if the user types non-digit characters into the field, `form.register`'s `onChange` fires and updates `formState` as dirty/touched; then `setValue` without `shouldDirty: true` may inadvertently reset those flags in some RHF versions.

The safe fix is to pass explicit options:
```ts
form.setValue("phone", digits, { shouldDirty: true, shouldTouch: true });
```

---

### WR-04: `type="tel"` conflicts with `inputMode="numeric"` on the phone input

**File:** `src/components/layout/callback-request-form.tsx:65-67`

`type="tel"` causes iOS Safari to show a telephone keyboard (with `*`, `#`, `+`, `-`, space). `inputMode="numeric"` requests a pure numeric keypad (`0-9` only). These two directives conflict: browsers apply `type` first, and `inputMode` is largely ignored when `type="tel"` is already set (MDN: "The inputMode attribute has no effect on the tel input type on most mobile browsers because the input type already controls the keyboard type"). The net result on iOS is the telephone keypad rather than the numeric pad, allowing users to enter `+`, spaces, and dashes — characters that the digit-stripping `onChange` silently removes. Users may be confused when characters they type disappear.

Since the validator (`uaPhoneSchema`) requires exactly `\d{10,15}` after the strip, and the intent is to collect raw digits, use `type="text"` with `inputMode="tel"` (shows a phone-oriented layout without locking to `<tel>` semantics):

```tsx
<Input
  id={fieldId}
  type="text"
  inputMode="tel"
  …
/>
```

Alternatively keep `type="tel"` and drop `inputMode` — just document that the telephone keyboard is intentional.

---

## Info

### IN-01: `subscribedChannelRef` is written but never read

**File:** `src/components/chat/chat-provider.tsx:121, 309, 321`

`subscribedChannelRef` is set to the channel name when subscribing (line 309) and reset to `null` on cleanup (line 321), but is never read anywhere in the component. If it was intended as a guard against double-subscription it is not actually being checked. Either add the guard or remove the ref to reduce noise.

---

### IN-02: Test assertions use `.toBeDefined()` instead of truthy matchers — will pass on `null`

**File:** `src/components/layout/storefront-fabs.test.tsx:67, 74, 89, 97, 104, 112, 125, 134, 157, 183`

Multiple tests assert `expect(element).toBeDefined()` after `screen.getBy*`. Because `getBy*` throws if the element is not found, the `.toBeDefined()` check is redundant and will never be the thing that catches a regression. If the element *is* found, it cannot be `undefined`. The test intent would be clearer with no assertion (the `getBy*` throw is sufficient) or with `expect(element).toBeInTheDocument()` from `@testing-library/jest-dom`.

This is a test-quality issue: the assertions add false confidence without adding real coverage. (Not flagging the same pattern in `callback-request-form.test.tsx` line 59 — same issue, same fix.)

---

_Reviewed: 2026-05-24T00:00:00Z_
_Reviewer: Claude (gsd-code-reviewer)_
_Depth: standard_
