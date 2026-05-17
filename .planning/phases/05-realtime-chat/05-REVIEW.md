---
phase: 05-realtime-chat
reviewed: 2026-05-17T16:00:00Z
depth: standard
files_reviewed: 32
files_reviewed_list:
  - prisma/schema.prisma
  - prisma/migrations/20260517110649_add_chat/migration.sql
  - src/server/services/chat.service.ts
  - src/server/validators/chat.ts
  - src/types/chat.ts
  - src/lib/pusher-server.ts
  - src/lib/pusher-client.ts
  - src/lib/env.ts
  - src/lib/permissions.ts
  - src/lib/chat/search-params.ts
  - src/app/api/chat/messages/route.ts
  - src/app/api/chat/pusher/auth/route.ts
  - src/server/actions/chat.actions.ts
  - src/components/chat/chat-provider.tsx
  - src/components/chat/chat-provider-gate.tsx
  - src/components/chat/chat-fab.tsx
  - src/components/chat/chat-panel.tsx
  - src/components/chat/message-list.tsx
  - src/components/chat/message-bubble.tsx
  - src/components/chat/chat-composer.tsx
  - src/components/chat/product-context-banner.tsx
  - src/components/chat/open-chat-button.tsx
  - src/components/chat/admin-chat-inbox.tsx
  - src/components/chat/admin-chat-provider.tsx
  - src/components/chat/conversation-list.tsx
  - src/components/chat/chat-thread.tsx
  - src/app/(storefront)/layout.tsx
  - src/app/(storefront)/kabinet/page.tsx
  - src/app/(storefront)/tovar/[slug]/page.tsx
  - src/app/(admin)/admin/chaty/page.tsx
  - src/app/(admin)/admin/layout.tsx
  - src/components/admin/admin-nav.tsx
findings:
  critical: 1
  warning: 3
  info: 2
  total: 6
status: issues_found
---

# Phase 05: Code Review Report

**Reviewed:** 2026-05-17T16:00:00Z  
**Depth:** standard  
**Files Reviewed:** 32  
**Status:** issues_found

## Summary

Phase 05 realtime chat was reviewed with emphasis on API authentication, Pusher private-channel authorization, rate limiting, XSS in rendered messages, and RBAC for `/admin/chaty`.

**Strengths:** Session-gated chat APIs (401 for guests), `assertConversationAccess` on GET history and Pusher auth (IDOR-safe for buyers), server-only `senderRole` assignment, React text rendering (no `dangerouslySetInnerHTML`), admin layout `requireAdmin()` with E2E RBAC coverage, and channel name parsing before authorization.

**Primary concern:** `listMessages` returns the **oldest** 50 messages, not the most recent 50. Long threads lose recent history after reload/refetch even though live Pusher/optimistic updates work in-session.

## Critical Issues

### CR-01: Message history returns oldest 50, not latest 50

**File:** `src/server/services/chat.service.ts:144-156`  
**Issue:** `listMessages` uses `orderBy: { createdAt: "asc" }` with `take: 50`, which returns the first 50 messages ever sent. Once a conversation exceeds 50 messages, reload/refetch shows only ancient history; messages 51+ exist in the DB but are omitted. Live Pusher append masks this until the user refreshes or reconnects.

**Fix:**
```typescript
export async function listMessages(
  conversationId: string,
  options: { limit?: number } = {},
) {
  const limit = options.limit ?? DEFAULT_MESSAGE_LIMIT;
  const messages = await prisma.message.findMany({
    where: { conversationId },
    orderBy: { createdAt: "desc" },
    take: limit,
  });

  return messages.reverse().map(mapMessageDto);
}
```

## Warnings

### WR-01: Rate limit has a check-then-act race

**File:** `src/server/services/chat.service.ts:158-170`  
**Issue:** `enforceRateLimit` counts recent rows, then `sendMessage` inserts in a separate step. Concurrent POSTs can all pass the count check before any insert completes, allowing bursts above 20 messages/minute per `senderId`.

**Fix:** Enforce inside the same transaction as `message.create`, or use a DB-level constraint / advisory lock / atomic counter keyed by `senderId` + time bucket.

### WR-02: Rate limit is global per user, not per conversation

**File:** `src/server/services/chat.service.ts:158-165`  
**Issue:** The limit counts all messages by `senderId` across every conversation. An admin replying in multiple threads shares one 20/min bucket; heavy support volume can hit 429 unexpectedly.

**Fix:** Document as intentional, or scope the count to `conversationId` (and optionally use a higher cap for `STORE` role).

### WR-03: No rate limiting on Pusher channel auth endpoint

**File:** `src/app/api/chat/pusher/auth/route.ts:42-90`  
**Issue:** `/api/chat/pusher/auth` is session-protected but unbounded. An authenticated client could spam auth requests (each hits DB via `assertConversationAccess`) for DoS or cost amplification against Pusher/DB.

**Fix:** Add IP/session rate limiting (middleware or shared limiter) on auth and optionally on `POST /api/chat/messages`.

## Info

### IN-01: Buyer POST sends ignored `conversationId`

**File:** `src/components/chat/chat-composer.tsx:66-70`  
**Issue:** The buyer composer includes `conversationId` in the JSON body, but `POST /api/chat/messages` ignores it for non-admins. Harmless but adds confusion during security review.

**Fix:** Omit `conversationId` from the buyer payload unless the API starts using it with `assertConversationAccess`.

### IN-02: `assertBuyerApi` unused by chat routes

**File:** `src/lib/permissions.ts:44-55`, `src/app/api/chat/messages/route.ts:47-54`  
**Issue:** Chat routes duplicate inline session checks instead of reusing `assertBuyerApi`. Behavior is equivalent today; drift risk if one path changes.

**Fix:** Optionally refactor routes to `const denied = await assertBuyerApi(); if (denied) return denied;` and extend for admin-aware routes.

---

## Focus-area assessment

| Area | Verdict | Notes |
|------|---------|-------|
| Chat API auth | Pass | 401 without session; buyer path uses `userId` only; admin path requires `role === "admin"` |
| Pusher channel auth | Pass | `parseConversationChannel` + `assertConversationAccess` before `authorizeChannel` |
| Rate limiting | Partial | 20/min present; race + shared bucket + no auth-endpoint limit |
| XSS in messages | Pass | `{message.body}` and names rendered as React children |
| RBAC `/admin/chaty` | Pass | `requireAdmin()` in admin layout; E2E buyer → `/uviity` |

---

_Reviewed: 2026-05-17T16:00:00Z_  
_Reviewer: Claude (gsd-code-reviewer)_  
_Depth: standard_
