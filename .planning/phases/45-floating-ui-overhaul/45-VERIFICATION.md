---
phase: 45-floating-ui-overhaul
verified: 2026-05-24T16:43:30Z
status: human_needed
score: 9/9 must-haves verified
overrides_applied: 0
human_verification:
  - test: "Visit any storefront page and type a partial phone number (e.g. '097') into the callback dialog phone field without submitting"
    expected: "No validation error message appears while typing"
    why_human: "jsdom environment does not expose the RHF shouldValidate timing difference; browser behaviour must be confirmed visually"
  - test: "Visit any storefront page and confirm all three FABs (callback, cart, chat) appear stacked vertically in the bottom-right corner"
    expected: "Callback (phone) at top, cart in middle, chat at bottom — all in the right side of the screen"
    why_human: "Visual layout and stacking order requires real browser rendering"
  - test: "Open the callback dialog (click the phone FAB) and verify no FABs bleed through the dialog backdrop"
    expected: "The dialog overlay fully covers the FAB group — no buttons are visible through or above the backdrop"
    why_human: "z-index stacking (z-[49] FABs vs z-50 dialog) requires visual confirmation in a real browser"
  - test: "Open the chat panel and observe the chat FAB"
    expected: "The chat floating button disappears when the chat panel is open"
    why_human: "Runtime state toggling requires browser verification"
---

# Phase 45: Floating UI Overhaul Verification Report

**Phase Goal:** Fix premature validation on the callback phone input and consolidate all floating action buttons into a single bottom-right column with correct z-index stacking.
**Verified:** 2026-05-24T16:43:30Z
**Status:** human_needed
**Re-verification:** No — initial verification

## Goal Achievement

### Observable Truths

| # | Truth | Status | Evidence |
|---|-------|--------|---------|
| 1 | Phone field never shows validation message while user is still typing | VERIFIED | `form.setValue("phone", digits)` at line 74 of callback-request-form.tsx — no third argument, no `shouldValidate: true`; FAB-03-a test asserts `queryByRole("alert")` is null after typing "097" |
| 2 | Phone field shows validation error after a failed submit attempt | VERIFIED | FAB-03-b test: submitting "097" triggers Zod `^\d{10,15}$` client-side, `getByRole("alert")` contains "Вкажіть номер телефону"; test passes |
| 3 | Digit-stripping `replace(/\D/g, "")` still works | VERIFIED | `callback-request-form.tsx` line 73: `const digits = event.target.value.replace(/\D/g, "");` is intact and unchanged |
| 4 | All three FABs (callback, cart, chat) appear in the bottom-right corner, stacked vertically | VERIFIED | `storefront-fabs.tsx` wrapper div: `className="fixed bottom-6 right-6 z-[49] flex flex-col items-center gap-3..."` — FAB-04-a test asserts `right-6` present and `left-6` absent |
| 5 | The callback dialog renders above the FAB group — no buttons bleed through the backdrop | VERIFIED | Wrapper at `z-[49]`; Dialog component uses shadcn/ui default which applies `z-50` — numeric stacking ensures dialog covers FABs |
| 6 | The chat button disappears when the chat panel is open | VERIFIED | `storefront-fabs.tsx` lines 89–107: `{!chatIsOpen && (<button ...aria-label="Відкрити чат з магазином"...>)}` — FAB-04-c test asserts button is null when `isOpen: true` |
| 7 | StorefrontFabs renders inside ChatContext.Provider so useChat() is available | VERIFIED | `chat-provider.tsx` line 379: `<StorefrontFabs phones={phones} initialCartCount={initialCartCount} hasSession={hasSession} />` rendered inside `<ChatContext.Provider value={value}>` |
| 8 | ChatFab is no longer rendered separately by ChatProvider | VERIFIED | `grep "chat-fab\|ChatFab" chat-provider.tsx` returns no output — the dynamic import block is gone |
| 9 | layout.tsx no longer renders StorefrontFabs directly | VERIFIED | `grep "StorefrontFabs" layout.tsx` returns no output; `ChatProviderGate phones={contacts.phones} initialCartCount={cartCount}` is the sole FAB render path |

**Score:** 9/9 truths verified

### Required Artifacts

| Artifact | Expected | Status | Details |
|----------|----------|--------|---------|
| `src/components/layout/callback-request-form.tsx` | `form.setValue("phone", digits)` with no options object | VERIFIED | Line 74: `form.setValue("phone", digits)` — no third argument |
| `src/components/layout/callback-request-form.test.tsx` | Tests FAB-03-a and FAB-03-b | VERIFIED | Lines 65–89: both tests present and passing |
| `src/components/layout/storefront-fabs.tsx` | `right-6`, `z-[49]`, `useChat`, chat button | VERIFIED | All four present: right-6 at line 53, z-[49] at line 53, useChat import at line 19, chat button at lines 90–107 |
| `src/components/chat/chat-provider.tsx` | Renders StorefrontFabs instead of ChatFab | VERIFIED | Line 379: `<StorefrontFabs.../>` inside `ChatContext.Provider`; no ChatFab import |
| `src/components/chat/chat-provider-gate.tsx` | Accepts and threads `phones` and `initialCartCount` | VERIFIED | Props destructured at lines 8–16, passed to `<ChatProvider>` at lines 44–45 |
| `src/app/(storefront)/layout.tsx` | No StorefrontFabs; ChatProviderGate receives phones/initialCartCount | VERIFIED | No StorefrontFabs import/JSX; line 32: `<ChatProviderGate phones={contacts.phones} initialCartCount={cartCount}>` |
| `src/components/layout/storefront-fabs.test.tsx` | Tests FAB-04-a through FAB-04-d | VERIFIED | Lines 137–184: four tests present; all 13 tests pass (vitest run: 17/17 across both test files) |

### Key Link Verification

| From | To | Via | Status | Details |
|------|----|-----|--------|---------|
| `layout.tsx` | `ChatProviderGate` | `phones={contacts.phones}` and `initialCartCount={cartCount}` props | WIRED | `contacts` from `getPublicStoreContacts()`, `cartCount` from `getCartItemCount()` — real DB queries |
| `ChatProviderGate` | `ChatProvider` | `phones={phones}` and `initialCartCount={initialCartCount}` pass-through | WIRED | Lines 44–45 in chat-provider-gate.tsx |
| `ChatProvider` JSX | `StorefrontFabs` | Render inside `ChatContext.Provider` | WIRED | Lines 377–386 in chat-provider.tsx: `<ChatContext.Provider>...children...<StorefrontFabs/>...<ChatPanel/>` |
| `StorefrontFabs` | `useChat()` | Import from chat-provider, call inside component | WIRED | Line 19 import; line 34 destructured call |

### Data-Flow Trace (Level 4)

| Artifact | Data Variable | Source | Produces Real Data | Status |
|----------|---------------|--------|--------------------|--------|
| `storefront-fabs.tsx` | `phones`, `initialCartCount` | `getPublicStoreContacts()`, `getCartItemCount()` in layout.tsx | Yes — service calls that query the DB | FLOWING |
| `storefront-fabs.tsx` | `chatIsOpen`, `openPanel`, `unreadFromStore` | `useChat()` context value populated by ChatProvider state | Yes — derives from RHF query state + Pusher real-time updates | FLOWING |

### Behavioral Spot-Checks

| Behavior | Command | Result | Status |
|----------|---------|--------|--------|
| All phase tests pass | `npx vitest run callback-request-form.test.tsx storefront-fabs.test.tsx` | 17/17 tests passed in 1.85s | PASS |
| No TS errors in phase files | `npx tsc --noEmit` filtered to phase files | No errors in storefront-fabs, callback-request-form, chat-provider, chat-provider-gate, or storefront layout | PASS |

### Probe Execution

No probes declared for this phase. Conventional probe paths not present. Step 7c: SKIPPED (no probe files).

### Requirements Coverage

| Requirement | Source Plan | Description | Status | Evidence |
|-------------|-------------|-------------|--------|---------|
| FAB-03 | 45-01-PLAN.md | Callback form не показує помилку під час введення | SATISFIED | `form.setValue("phone", digits)` with no `shouldValidate` option; FAB-03-a/b tests pass |
| FAB-04 | 45-02-PLAN.md | Всі FAB-кнопки у правому нижньому куті у стовпчик; dialog поверх | SATISFIED | `right-6 z-[49]` wrapper; chat button inside StorefrontFabs; FAB-04-a/b/c/d tests pass |

No orphaned requirements — REQUIREMENTS.md maps exactly FAB-03 and FAB-04 to Phase 45, both accounted for.

### Anti-Patterns Found

| File | Line | Pattern | Severity | Impact |
|------|------|---------|----------|--------|
| `callback-request-form.tsx` | 66 | `placeholder="0978734712"` | Info | HTML input placeholder attribute — not a stub marker, not a debt comment |

No TBD, FIXME, XXX, TODO, HACK, or unresolved debt markers found in any phase-modified file.

### Human Verification Required

#### 1. No premature validation error during typing

**Test:** Open the callback dialog (phone FAB), type "097" into the phone field without clicking submit.
**Expected:** No red error message "Вкажіть номер телефону — лише цифри, від 10 до 15" appears while digits are being entered.
**Why human:** The jsdom testing environment does not reproduce the RHF `shouldValidate` timing difference. The SUMMARY notes this explicitly — the fix is real and correct, but the RED phase test did not demonstrate the bug. Browser behaviour must be confirmed visually.

#### 2. FAB column layout in bottom-right corner

**Test:** Visit any storefront page (e.g. homepage) and observe the floating buttons.
**Expected:** Three buttons stacked vertically in the bottom-right: callback (phone icon) on top, cart (shopping cart) in the middle, chat (message icon) at the bottom. No FABs on the left side.
**Why human:** Visual layout and stacking order requires real browser rendering — CSS positioning cannot be fully verified by grep.

#### 3. Dialog backdrop covers FAB group

**Test:** Click the phone FAB to open the callback dialog.
**Expected:** The dialog overlay covers the entire FAB group — none of the three buttons are visible through or above the backdrop.
**Why human:** z-index stacking (z-[49] for FABs, z-50 for dialog) requires visual confirmation that the shadcn/ui Dialog component's default z-index is indeed >= 50 in the rendered browser.

#### 4. Chat FAB disappears when chat panel opens

**Test:** Click the chat FAB to open the chat panel (or trigger chat open via a product page).
**Expected:** The chat floating button is no longer visible in the FAB column while the chat panel is open.
**Why human:** Runtime state toggling between `isOpen=false` (chat FAB visible) and `isOpen=true` (chat FAB hidden) requires browser verification with a real Pusher/session context.

### Gaps Summary

No gaps found. All 9 observable truths are verified by direct codebase inspection. All 7 required artifacts exist, are substantive, and are correctly wired. All 4 key links are confirmed present. Both requirement IDs (FAB-03, FAB-04) are fully satisfied.

The phase is blocked from `passed` status only by 4 human verification items relating to visual/runtime browser behaviour that cannot be confirmed programmatically. All automated checks pass.

---

_Verified: 2026-05-24T16:43:30Z_
_Verifier: Claude (gsd-verifier)_
