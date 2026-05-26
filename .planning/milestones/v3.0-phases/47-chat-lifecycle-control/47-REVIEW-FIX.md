---
phase: 47
fixed_at: 2026-05-25T00:00:00.000Z
review_path: .planning/phases/47-chat-lifecycle-control/47-REVIEW.md
iteration: 1
findings_in_scope: 7
fixed: 7
skipped: 0
status: all_fixed
---

# Phase 47: Code Review Fix Report

**Fixed at:** 2026-05-25
**Source review:** .planning/phases/47-chat-lifecycle-control/47-REVIEW.md
**Iteration:** 1

**Summary:**
- Findings in scope: 7
- Fixed: 7
- Skipped: 0

## Fixed Issues

### CR-01: `unarchiveConversation` does not restore `isActive`

**Files modified:** `src/server/services/chat.service.ts`
**Commit:** b02d64c
**Applied fix:** Added `isActive: true` to the `data` object in the `unarchiveConversation` Prisma update call alongside the existing `status: "OPEN"`, so buyer-facing queries that filter on `isActive: true` can find the unarchived conversation.

---

### CR-02: `claimGuestConversation` TOCTOU race

**Files modified:** `src/server/services/chat.service.ts`
**Commit:** 8e72bf4
**Applied fix:** Wrapped the `findFirst` + `updateMany` operations in a `prisma.$transaction(async (tx) => { ... })` block, replacing all `prisma.` calls inside with `tx.` calls. This makes the read-check-write sequence atomic.

---

### CR-03: `claimGuestConversation` does not update `conversationId` in `ChatProvider`

**Files modified:** `src/components/chat/chat-provider.tsx`
**Commit:** 0beecce
**Applied fix:** Added `router.refresh()` call immediately after `localStorage.removeItem(GUEST_CHAT_TOKEN_KEY)` in the successful claim branch. `router` is already available via `useRouter()` at line 104 of `chat-provider.tsx`. The refresh triggers SSR re-hydration which provides the newly-claimed `initialConversationId` to the provider.

---

### WR-01: `ArchivedChatBanner.handleStartNew` silently swallows errors

**Files modified:** `src/components/chat/archived-chat-banner.tsx`
**Commit:** 2cfcf4c
**Applied fix:** Added `import { toast } from "sonner"` (consistent with rest of codebase) and replaced the silent `return` on non-OK response with `toast.error("Не вдалося створити новий чат. Спробуйте ще раз."); return;`.

---

### WR-02: `POST /api/chat/claim` has no error handling

**Files modified:** `src/app/api/chat/claim/route.ts`
**Commit:** 357cf37
**Applied fix:** Wrapped `await claimGuestConversation(...)` in a `try/catch` block that returns `Response.json({ error: "CLAIM_FAILED" }, { status: 500 })` on error, preventing unhandled exceptions from escaping the route handler.

---

### WR-03: `POST /api/chat/new` has no error handling

**Files modified:** `src/app/api/chat/new/route.ts`
**Commit:** 3525979
**Applied fix:** Both `createNewConversation` calls (authenticated and guest paths) are now wrapped in separate `try/catch` blocks that return `Response.json({ error: "INTERNAL_ERROR" }, { status: 500 })` on error. The guard was also inverted to `if (!session?.user)` for the guest path to allow the authenticated path to be a natural fall-through with its own try/catch at the end.

---

### WR-04: `openPanel` `setGuestToken` not guarded by persistence success

**Files modified:** `src/components/chat/chat-provider.tsx`
**Commit:** 22eb21d
**Applied fix:** The current code already had `setGuestToken(token)` inside the `try` block after `localStorage.setItem`, implementing the correct pattern. The fix updated the catch-block comment from "private mode or crypto not available" to "private mode or storage unavailable — continue without persistent token" to accurately reflect the intent. No structural code change was needed.

---

_Fixed: 2026-05-25_
_Fixer: Claude (gsd-code-fixer)_
_Iteration: 1_
