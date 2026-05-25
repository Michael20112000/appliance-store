---
phase: 46-schema-foundation-guest-chat
verified: 2026-05-25T15:04:58Z
status: human_needed
score: 12/12 must-haves verified
overrides_applied: 0
human_verification:
  - test: "Unauthenticated user opens chat widget — composer shown immediately, no redirect to /uviity"
    expected: "Widget opens and shows message composer; address bar stays on http://localhost:3000"
    why_human: "Requires live dev server + browser interaction to confirm no redirect occurs"
  - test: "Guest sends a message — admin inbox shows 'Гість' label"
    expected: "Incognito user sends a message; /admin/chaty shows the conversation with buyer name 'Гість'"
    why_human: "Requires live DB write, admin UI render, and visual inspection of label"
  - test: "Guest refreshes page — previous guest messages still visible in widget"
    expected: "After F5 the chat widget restores messages from GET /api/chat/guest using the stored token"
    why_human: "Requires localStorage + DB round-trip observable only in running browser"
  - test: "Guest clears localStorage — widget treats them as brand-new guest"
    expected: "After deleting chat_guest_token in DevTools and refreshing, the widget shows empty chat"
    why_human: "Requires DevTools interaction and visual confirmation of empty state"
---

# Phase 46: Schema Foundation + Guest Chat — Verification Report

**Phase Goal:** Extend the existing chat schema and server layer so unauthenticated users can open the chat widget and send messages as guests — no login required. The widget must not redirect to /uviity for guests. Guest conversations must appear in the admin inbox labeled "Гість".
**Verified:** 2026-05-25T15:04:58Z
**Status:** human_needed
**Re-verification:** No — initial verification

## Goal Achievement

### Observable Truths (Roadmap Success Criteria)

| # | Truth | Status | Evidence |
|---|-------|--------|---------|
| SC1 | Unauthenticated user opens chat widget — composer shown immediately, no redirect to /uviity | ? HUMAN | `guestRedirect()` call confirmed absent from `openPanel()` (0 grep matches); `openPanel` generates `crypto.randomUUID()` token for guests and opens panel normally. Cannot observe browser redirect without live app. |
| SC2 | Guest sends a message — admin inbox shows "Гість" (not blank or null) | ? HUMAN | Data flow verified end-to-end: `sendMessage({ guestToken })` → service creates conversation with null userId → `listConversationsForAdmin` filters null userIds, uses `buyer?.name ?? "Гість"` (line 377) → `ConversationSummaryDto.buyerName` → `conversation-list.tsx` renders `conversation.buyerName`. Live DB write needed for human confirmation. |
| SC3 | Guest refreshes the page — previous guest messages still visible | ? HUMAN | Mount effect at chat-provider.tsx line 266 reads `chat_guest_token` from localStorage, calls `GET /api/chat/guest?token=...`, sets `conversationId`/`messages`/`status` on 200. Route verified: returns `{ conversationId, messages, status }` for known token. End-to-end requires running app. |
| SC4 | Guest clears localStorage — widget treats them as brand-new guest with no prior session | ? HUMAN | Mount effect returns early if `localStorage.getItem("chat_guest_token")` returns null (line 271: `if (!stored) return`). After clearing, no restore fires, no conversationId set → empty widget. Mechanically verified but requires live browser to confirm. |

**Note on SC1–SC4:** All four success criteria have complete, non-stub implementations verified in the codebase. The human verification is required to confirm runtime behavior, not to fill implementation gaps. The 46-05-SUMMARY.md documents that a human verified all 4 criteria on 2026-05-25 during plan execution.

**Score:** 12/12 must-haves verified (all automated checks pass; 4 success criteria are human-observable)

### Must-Haves from Plan Frontmatter

All 26 plan-declared must-have truths were verified against the codebase:

**Plan 01 — Schema (7 truths):**

| # | Truth | Status | Evidence |
|---|-------|--------|---------|
| 1 | Conversation.userId is String? (no @unique) | ✓ VERIFIED | schema.prisma line 225: `userId String?` — no @unique |
| 2 | Conversation.guestToken is String? @unique | ✓ VERIFIED | schema.prisma line 226: `guestToken String? @unique` |
| 3 | Conversation.isActive is Boolean @default(true) | ✓ VERIFIED | schema.prisma line 227: `isActive Boolean @default(true)` |
| 4 | Composite index @@index([userId, isActive]) exists | ✓ VERIFIED | schema.prisma line 240: `@@index([userId, isActive])` |
| 5 | No filtered unique index added in Phase 46 | ✓ VERIFIED | No `previewFeatures` or `@@unique` with `where` clause in schema |
| 6 | Generated Prisma client reflects new fields | ✓ VERIFIED | `src/generated/prisma/` contains client.ts, models.ts, models/ — regenerated |
| 7 | Migration SQL contains DROP INDEX for Conversation_userId_key | ✓ VERIFIED | migration.sql line 2: `DROP INDEX "Conversation_userId_key"` |

**Plan 02 — Data Layer (10 truths):**

| # | Truth | Status | Evidence |
|---|-------|--------|---------|
| 1 | ConversationSummaryDto.userId is string \| null | ✓ VERIFIED | src/types/chat.ts line 17: `userId: string \| null` |
| 2 | sendMessageSchema accepts optional guestToken UUID | ✓ VERIFIED | src/server/validators/chat.ts line 14: `guestToken: z.string().uuid(...).optional()` |
| 3 | getOrCreateConversation uses findFirst({ userId, isActive: true }) | ✓ VERIFIED | chat.service.ts lines 95–96: `findFirst({ where: { userId, isActive: true } })` |
| 4 | getConversationForBuyer uses findFirst({ userId, isActive: true }) | ✓ VERIFIED | chat.service.ts line 151: `findFirst({ where: { userId, isActive: true } })` |
| 5 | getOrCreateGuestConversation creates with P2002 race guard | ✓ VERIFIED | chat.service.ts lines 158–196: P2002 catch → findUniqueOrThrow pattern |
| 6 | getGuestConversation looks up by guestToken | ✓ VERIFIED | chat.service.ts line 154: `findUnique({ where: { guestToken } })` |
| 7 | resolveConversationForSend has guestToken branch before userId check | ✓ VERIFIED | chat.service.ts lines 279–280: `if (input.guestToken) { return getOrCreateGuestConversation(...) }` |
| 8 | listConversationsForAdmin filters null userIds, uses 'Гість' as fallback | ✓ VERIFIED | lines 354–356: filter `id !== null`; line 377: `buyerName: buyer?.name ?? "Гість"` |
| 9 | assertConversationAccess return type is string \| null for userId | ✓ VERIFIED | line 394: `Promise<{ id: string; userId: string \| null; status: ... }>` |
| 10 | All new service tests pass (33 total) | ✓ VERIFIED | `npx vitest run` → 33 passed, 0 failed |

**Plan 03 — API Routes (9 truths):**

| # | Truth | Status | Evidence |
|---|-------|--------|---------|
| 1 | GET /api/chat/guest?token={uuid} returns 200+{conversationId,messages,status} for known token | ✓ VERIFIED | route.ts line 7: GET handler; calls `getGuestConversation` + `listMessages`; returns `{ conversationId, messages, status }` |
| 2 | GET /api/chat/guest?token={unknown} returns 404 | ✓ VERIFIED | line 22: `Response.json({ error: "NOT_FOUND" }, { status: 404 })` |
| 3 | GET /api/chat/guest with no token returns 400 | ✓ VERIFIED | line 11: `Response.json({ error: "TOKEN_REQUIRED" }, { status: 400 })` |
| 4 | POST /api/chat/messages with valid guestToken+body returns 201 | ✓ VERIFIED | messages/route.ts lines 74–108: guest branch sends message, returns 201 |
| 5 | POST /api/chat/messages with no session and no guestToken returns 401 | ✓ VERIFIED | line 74–76: `!session?.user` + `!parsed.data.guestToken` → 401 UNAUTHORIZED |
| 6 | POST /api/chat/pusher/auth with valid guestToken matching DB returns Pusher auth | ✓ VERIFIED | pusher/auth/route.ts lines 65–90: DB lookup + `authorizeChannel` on match |
| 7 | POST /api/chat/pusher/auth with wrong guestToken returns 403 | ✓ VERIFIED | line 80–81: `conversation.guestToken !== guestToken` → 403 FORBIDDEN |
| 8 | POST /api/chat/pusher/auth with no session and no guestToken returns 401 | ✓ VERIFIED | line 65–67: no guestToken → 401 UNAUTHORIZED |
| 9 | Existing authenticated paths unchanged | ✓ VERIFIED | Authenticated branches unchanged after guest branches |

**Plan 04 — Client Provider (8 truths; 2 overlap with SC1/SC3):**

| # | Truth | Status | Evidence |
|---|-------|--------|---------|
| 1 | openPanel no longer redirects guests to /uviity | ✓ VERIFIED | 0 `guestRedirect()` calls in `openPanel`; token generation replaces redirect |
| 2 | guestToken generated via crypto.randomUUID() stored in localStorage on first open | ✓ VERIFIED | chat-provider.tsx lines 158–160: `crypto.randomUUID()` + `localStorage.setItem("chat_guest_token", ...)` |
| 3 | Mount effect reads chat_guest_token and calls GET /api/chat/guest | ✓ VERIFIED | lines 266–293: mount effect with `localStorage.getItem("chat_guest_token")` + fetch to `/api/chat/guest?token=...` |
| 4 | On 404 restore: token kept, no DB write; new session generates fresh token | ✓ VERIFIED | line 278: `if (!response.ok) return` — silently keeps token |
| 5 | Guest can send messages — POST /api/chat/messages includes guestToken | ✓ VERIFIED | chat-composer.tsx line 81: `guestToken: guestToken ?? undefined` in POST body |
| 6 | After first message send, conversationId set from response | ✓ VERIFIED | chat-provider.tsx line 284 (`setConversationId(data.conversationId)` in restore); chat-composer.tsx line 102+: `setConversationId(payload.conversationId)` on 201 |
| 7 | Pusher auth POST body includes guestToken via channelAuthorization paramsProvider | ✓ VERIFIED | pusher-client.ts lines 39–40: `paramsProvider: () => currentGuestToken ? { guestToken: currentGuestToken } : {}` |
| 8 | Authenticated user flow completely unchanged | ✓ VERIFIED | Message-load useEffect guard `!hasSession` unchanged; clearUnreadFromStore `isOpen && hasSession` unchanged |

### Required Artifacts

| Artifact | Expected | Status | Details |
|----------|----------|--------|---------|
| `prisma/schema.prisma` | Updated Conversation model per D-05 | ✓ VERIFIED | Lines 223–244: nullable userId, guestToken @unique, isActive, @@index([userId, isActive]) |
| `prisma/migrations/20260525091246_guest_chat_schema/migration.sql` | DDL with DROP INDEX + new columns | ✓ VERIFIED | Contains DROP INDEX, ADD COLUMN guestToken, ADD COLUMN isActive, CREATE INDEX |
| `src/generated/prisma/` | Regenerated client | ✓ VERIFIED | Directory contains client.ts, models.ts, models/, enums.ts |
| `src/types/chat.ts` | ConversationSummaryDto.userId as string \| null | ✓ VERIFIED | Line 17: `userId: string \| null` |
| `src/server/validators/chat.ts` | sendMessageSchema with guestToken UUID | ✓ VERIFIED | Line 14: `guestToken: z.string().uuid(...).optional()` |
| `src/server/services/chat.service.ts` | Guest service functions + D-07 + CHAT-03 | ✓ VERIFIED | `getGuestConversation` (line 154), `getOrCreateGuestConversation` (line 158) exported; `findFirst` with isActive; "Гість" fallback |
| `src/server/services/chat.service.test.ts` | Test coverage for all new behaviors | ✓ VERIFIED | 33 tests pass including getOrCreateGuestConversation, getGuestConversation, Гість fallback, guest access block |
| `src/app/api/chat/guest/route.ts` | NEW: GET endpoint, no session required | ✓ VERIFIED | Exists; exports GET; no session/auth imports; TOKEN_REQUIRED 400, NOT_FOUND 404, 200 with payload |
| `src/app/api/chat/messages/route.ts` | Extended with guestToken guest path | ✓ VERIFIED | Lines 74–108: guest branch; guestToken in sendMessage call |
| `src/app/api/chat/pusher/auth/route.ts` | Extended with guestToken DB verification | ✓ VERIFIED | AuthBody type has guestToken; parseAuthBody parses it; DB lookup verifies before authorizeChannel; prisma imported |
| `src/components/chat/chat-provider.tsx` | Guest mode: localStorage token, no redirect | ✓ VERIFIED | GUEST_CHAT_TOKEN_KEY constant; guestToken useState; mount effect; openPanel without redirect; Pusher guard without !hasSession |
| `src/lib/pusher-client.ts` | channelAuthorization paramsProvider with guestToken | ✓ VERIFIED | `currentGuestToken`, `setGuestTokenForPusher`, `paramsProvider` all present |

### Key Link Verification

| From | To | Via | Status | Details |
|------|-----|-----|--------|---------|
| `prisma/schema.prisma` | `src/generated/prisma` | npx prisma generate | ✓ WIRED | Generated client directory populated; guestToken field present in schema |
| `src/server/validators/chat.ts` | `src/server/services/chat.service.ts` | SendMessageInput extended with guestToken | ✓ WIRED | chat.service.ts local `SendMessageInput` type includes `guestToken?: string`; resolveConversationForSend uses `input.guestToken` |
| `src/server/services/chat.service.ts` | `src/generated/prisma` | Prisma queries with isActive | ✓ WIRED | `findFirst({ where: { userId, isActive: true } })` uses new nullable types |
| `src/app/api/chat/messages/route.ts` | `src/server/services/chat.service.ts` | sendMessage({ guestToken }) | ✓ WIRED | messages/route.ts line 80–88: `sendMessage({ guestToken: parsed.data.guestToken, ... })` |
| `src/app/api/chat/pusher/auth/route.ts` | `prisma.conversation.findUnique` | guestToken DB verification | ✓ WIRED | route.ts lines 73–81: `prisma.conversation.findUnique({ where: { id: conversationId }, select: { guestToken: true } })` then compares |
| `src/components/chat/chat-provider.tsx` | `/api/chat/guest` | fetch on mount | ✓ WIRED | line 275–276: fetch `/api/chat/guest?token=${encodeURIComponent(stored)}` in mount effect |
| `src/components/chat/chat-provider.tsx` | `/api/chat/messages` | POST body includes guestToken | ✓ WIRED | Via chat-composer.tsx line 81: `guestToken: guestToken ?? undefined` (reads from useChat() context) |
| `src/lib/pusher-client.ts` | `/api/chat/pusher/auth` | channelAuthorization paramsProvider | ✓ WIRED | paramsProvider sends `{ guestToken: currentGuestToken }` in Pusher auth POST |
| `src/components/chat/chat-provider.tsx` | `src/lib/pusher-client.ts` | setGuestTokenForPusher before subscription | ✓ WIRED | chat-provider.tsx line 338: `setGuestTokenForPusher(guestToken)` before Pusher subscribe fires |

### Data-Flow Trace (Level 4)

| Artifact | Data Variable | Source | Produces Real Data | Status |
|----------|---------------|--------|--------------------|--------|
| `chat-provider.tsx` | `guestToken` | `localStorage.getItem("chat_guest_token")` → setGuestToken | Yes — reads from persisted localStorage, generates with `crypto.randomUUID()` on first open | ✓ FLOWING |
| `chat-provider.tsx` | `conversationId` (guest restore) | `GET /api/chat/guest` → `setConversationId(data.conversationId)` | Yes — route calls `getGuestConversation` then `listMessages` with real Prisma queries | ✓ FLOWING |
| `chat-composer.tsx` | `guestToken` in POST body | `useChat()` context → `guestToken ?? undefined` | Yes — flows from ChatProvider state | ✓ FLOWING |
| `admin-chat-inbox.tsx` / `conversation-list.tsx` | `buyerName` for guest | `listConversationsForAdmin` → `buyer?.name ?? "Гість"` | Yes — real Prisma `user.findMany` with filtered userIds; "Гість" fallback for null | ✓ FLOWING |
| `pusher-client.ts` | `guestToken` in auth request | `setGuestTokenForPusher(guestToken)` called before subscription | Yes — module-level variable updated from ChatProvider state; `paramsProvider` reads at auth time | ✓ FLOWING |

### Behavioral Spot-Checks

| Behavior | Command | Result | Status |
|----------|---------|--------|--------|
| GET /api/chat/guest returns 400 with no token | Code path inspection: `token = null` → return 400 | `if (!token) return Response.json({ error: "TOKEN_REQUIRED" }, { status: 400 })` at line 11 | ✓ VERIFIED (static) |
| guestToken UUID validation rejects non-UUID | `npx vitest run src/server/validators/chat.test.ts` | 6/6 tests pass including "rejects guestToken that is not a UUID" | ✓ PASS |
| Guest service functions exported and tested | `npx vitest run src/server/services/chat.service.test.ts` | 27/27 tests pass | ✓ PASS |
| TypeScript compiles clean on Phase 46 files | `npx tsc --noEmit 2>&1 \| grep "api/chat\|chat-provider\|pusher-client\|chat.service"` | Zero output (no errors in Phase 46 files) | ✓ PASS |

### Probe Execution

Step 7c: SKIPPED — Phase 46 has no probe scripts in `scripts/*/tests/probe-*.sh`. Live end-to-end testing is in Plan 46-05 (human checkpoint).

### Requirements Coverage

| Requirement | Source Plans | Description | Status | Evidence |
|-------------|-------------|-------------|--------|---------|
| CHAT-01 | 46-01, 46-02, 46-03, 46-04, 46-05 | Unauthenticated user can open chat widget, send text messages without registration; session via localStorage | ✓ SATISFIED | Schema supports null userId; getOrCreateGuestConversation persists guest convos; POST /api/chat/messages accepts guestToken; ChatProvider opens without redirect + manages localStorage token; ChatComposer sends guestToken in POST body |
| CHAT-03 | 46-01, 46-02, 46-05 | Guest user displayed as "Гість" in admin panel | ✓ SATISFIED | listConversationsForAdmin uses `buyer?.name ?? "Гість"` (line 377); ConversationSummaryDto.buyerName is "Гість" for null-userId conversations; conversation-list.tsx renders buyerName as displayName |

Both CHAT-01 and CHAT-03 are fully satisfied. CHAT-02 (guest conversation migration to account on login) is correctly mapped to Phase 47 in REQUIREMENTS.md.

### Anti-Patterns Found

| File | Line | Pattern | Severity | Impact |
|------|------|---------|----------|--------|
| None found | — | — | — | — |

No TBD, FIXME, XXX, TODO, HACK, PLACEHOLDER markers found in any Phase 46 modified file. No stub return patterns (empty arrays/objects passed to rendering without data source). No orphaned imports.

One notable observation: `chat-provider.tsx` line 297 still has `if (!isOpen || !hasSession) return` in the message-load useEffect — this is intentional per PATTERNS.md Pitfall 4 (prevents `markBuyerReadAction` from firing for guests). Confirmed correct behavior, not a stub.

### Human Verification Required

Plan 46-05 (human checkpoint) was executed on 2026-05-25. The 46-05-SUMMARY.md records that a human verified all 4 success criteria in the live dev app. However, since the verifier cannot re-run the dev server, these remain as human verification items per verification protocol:

#### 1. Widget Opens Without Redirect (SC1)

**Test:** In incognito browser, navigate to http://localhost:3000, click the chat floating action button.
**Expected:** Chat widget opens showing the message composer immediately. URL stays on http://localhost:3000 — address bar does NOT change to /uviity or any other path.
**Why human:** Redirect behavior requires live browser + session state to observe.

#### 2. Guest Sends Message, Admin Sees "Гість" (SC2)

**Test:** In incognito window, type a message and press Send. In a signed-in window, open http://localhost:3000/admin/chaty.
**Expected:** The guest conversation appears in the inbox with buyer name "Гість" (not blank, not null, not "Покупець").
**Why human:** Requires live DB write + admin UI render + visual label inspection.

#### 3. Messages Persist After Refresh (SC3)

**Test:** Remaining in the incognito window from SC2, press F5 to refresh. Click the chat button to open the widget again.
**Expected:** The message(s) sent in SC2 are still visible in the widget.
**Why human:** Requires localStorage + DB round-trip visible only in running browser.

#### 4. Clearing localStorage Resets Session (SC4)

**Test:** In the incognito window, open DevTools → Application → Local Storage → http://localhost:3000, delete the `chat_guest_token` key, refresh, and open the chat widget.
**Expected:** The widget shows no previous messages — empty chat, fresh guest session.
**Why human:** Requires DevTools interaction and visual confirmation of empty state.

**Note:** 46-05-SUMMARY.md confirms all 4 tests were verified by a human on 2026-05-25. Re-verification against the live app is at the developer's discretion.

### Gaps Summary

No gaps found. All 12 automated must-haves pass. The 4 success criteria require live-browser human verification (standard for UI/localStorage/DB round-trip behavior). Implementation is complete and non-stub throughout all layers.

---

_Verified: 2026-05-25T15:04:58Z_
_Verifier: Claude (gsd-verifier)_
