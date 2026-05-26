# Phase 46: Schema Foundation + Guest Chat - Context

**Gathered:** 2026-05-25
**Status:** Ready for planning

<domain>
## Phase Boundary

Migrate the DB schema to support multiple conversations per user and anonymous guest sessions. Unauthenticated users can open and use the chat widget without being redirected to /uviity. Admin sees guest users labeled "Гість". This phase is the hard prerequisite for all subsequent v3.0 chat phases.

**In scope:** Prisma migration (guestToken, nullable userId, isActive, remove @unique from userId), /api/chat/guest endpoint, Pusher auth endpoint extension for guestToken, ChatProvider guest mode (no redirect), localStorage token management, "Гість" label in admin inbox.

**Out of scope:** Chat closing (Phase 47), guest→account migration (Phase 47), history drawer (Phase 48), file attachments (Phase 49).

</domain>

<decisions>
## Implementation Decisions

### Guest Conversation Creation
- **D-01:** Lazy creation — `Conversation` record is created in DB only when the guest sends their **first message**, not on widget open. `guestToken` UUID is generated and stored in `localStorage` on widget open, but no DB write until `Send` is pressed.
- **D-02:** On widget open, if `localStorage` has `chat_guest_token`, attempt `GET /api/chat/guest?token={token}` to restore existing conversation (messages load). If 404, generate a new token (no DB write yet).

### Guest Identity in Admin
- **D-03:** Display name is always **"Гість"** — no token prefix or sequential number. `listConversationsForAdmin` falls back to `"Гість"` when `userId` is null (replaces current `"Покупець"` fallback).

### Pusher Channel for Guests
- **D-04:** Same channel pattern `private-conversation-{conversationId}`. The existing `/api/chat/pusher/auth` endpoint is extended to accept `guestToken` in the request body alongside `socket_id` and `channel_name`. If no session, it checks `guestToken` against `Conversation.guestToken` in DB before authorizing. No new channel type.

### Schema Migration
- **D-05:** Migration steps in order:
  1. Make `userId` nullable: `String?`
  2. Remove `@unique` from `userId`
  3. Add `guestToken String? @unique`
  4. Add `isActive Boolean @default(true)` (all existing rows get `true`)
  5. Add composite index `@@index([userId, isActive])`
- **D-06:** Add filtered unique constraint on `(userId, isActive)` where `isActive = true` to prevent multiple active conversations per user. Implemented as Prisma `@@unique([userId, isActive])` with application-level enforcement (Prisma 7 filtered index syntax TBD — fallback: enforce in service layer via `$transaction`).
- **D-07:** All existing `getOrCreateConversation(userId)` and `getConversationForBuyer(userId)` calls must be updated to use `findFirst({ where: { userId, isActive: true } })` after migration.

### Message Sending for Guests
- **D-08:** `POST /api/chat/messages` route extended to accept `guestToken` in the request body when no session is present. Service resolves the conversation by `guestToken`. Rate limiting uses the guestToken as `senderId` (or IP as fallback).

### ChatProvider Changes
- **D-09:** `openPanel()` no longer calls `guestRedirect()` for unauthenticated users. Widget opens normally for guests.
- **D-10:** On mount, `ChatProvider` reads `localStorage.getItem('chat_guest_token')`. If present, calls restore endpoint. If absent and guest opens panel, generates `crypto.randomUUID()` and stores it — no DB write yet.

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Schema & Data Layer
- `prisma/schema.prisma` — Current `Conversation` model (line ~223): `userId String @unique` must change; `Message` model (line ~243). Read before writing migration.
- `src/server/services/chat.service.ts` — All functions that use `findUnique({ where: { userId } })` must be updated; `listConversationsForAdmin` fallback for null userId; `assertConversationAccess` must handle null userId for guests.

### API Routes
- `src/app/api/chat/messages/route.ts` — Must be extended to accept `guestToken` when no session.
- `src/app/api/chat/pusher/auth/route.ts` — Must be extended: accept `guestToken` in body; authorize if token matches `Conversation.guestToken` in DB.

### Client Provider
- `src/components/chat/chat-provider.tsx` — `openPanel()` line ~140 removes `guestRedirect()` gate; add localStorage token management on mount; `hasSession` prop still passed through but no longer gates widget open.

### Requirements & Roadmap
- `.planning/REQUIREMENTS.md` — CHAT-01, CHAT-03 are the requirements for this phase.
- `.planning/research/FEATURES.md` — Feature dependency graph (line ~68): exact DB and API changes per requirement.
- `.planning/research/ARCHITECTURE.md` — Phase 46 build order and schema migration details.
- `.planning/research/PITFALLS.md` — Pitfall 1 (userId @unique), Pitfall 2 (Pusher 403 for guests), Pitfall 9 (multiple isActive:true).

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `crypto.randomUUID()` — native, no install; use for guestToken generation client-side
- `isPusherClientConfigured()` / `getPusherClient()` in `src/lib/pusher-client.ts` — already handles Pusher not-configured gracefully; reuse in guest subscription path
- `ChatServiceError` with typed codes — extend for `GUEST_TOKEN_INVALID` and `GUEST_NOT_FOUND`

### Established Patterns
- **`isUniqueViolation(error)`** in `chat.service.ts` (line ~80) — upsert guard pattern; reuse when creating guest conversation to handle races
- **Rate limiting** uses `senderId` field in `enforceRateLimit()` — pass guestToken as senderId for guests (already a string)
- **`parseAuthBody()`** in `/api/chat/pusher/auth/route.ts` handles both `application/x-www-form-urlencoded` and JSON — extend `AuthBody` type to include `guestToken?: string`

### Integration Points
- `src/app/(storefront)/layout.tsx` — passes `initialConversationId` and `hasSession` to `ChatProvider`; needs to NOT pass `initialConversationId` for guests (they have none on SSR)
- `src/components/chat/admin-chat-inbox.tsx` — renders `buyerName` from `ConversationSummaryDto`; `"Гість"` fallback happens in service, no component change needed
- `CONVERSATION_CHANNEL_RE` regex in `chat.service.ts` — validates channel name format; no change needed

</code_context>

<specifics>
## Specific Ideas

- "Гість" as display name — no token suffix, no sequential numbering
- Lazy conversation creation — only on first Send, not on widget open
- Same `private-conversation-{id}` Pusher channel — extend auth endpoint, don't add new channel type

</specifics>

<deferred>
## Deferred Ideas

- Guest registration nudge UI ("Зареєструйтесь, щоб зберегти історію") — noted in PITFALLS.md as acceptable UX; Phase 46 can include a simple static hint but it's not a hard requirement.
- Rate limiting by IP for guests (vs guestToken) — implementation detail for planner to decide.

</deferred>

---

*Phase: 46-Schema Foundation + Guest Chat*
*Context gathered: 2026-05-25*
