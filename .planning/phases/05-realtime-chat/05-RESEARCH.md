# Phase 5: Realtime Chat — Research

**Researched:** 2026-05-17  
**Domain:** Next.js App Router + Prisma + Better Auth + Pusher Channels (buyer↔store chat)  
**Confidence:** HIGH (stack/patterns verified in repo + official Pusher docs); MEDIUM (rate-limit thresholds, E2E without Pusher CI secrets)

## Summary

Phase 5 adds a **single persistent conversation per buyer** (`Conversation.userId` unique), text-only messages in PostgreSQL, and **Pusher private channels** for live delivery after a **DB-first** write. The storefront uses a **global FAB + panel** in `(storefront)/layout.tsx`; admins use **`/admin/chaty`** split inbox (enable nav item currently disabled in `admin-nav.tsx`).

The codebase already has the right seams: `requireBuyer()` / `requireAdmin()` / `assertAdminApi()` in `src/lib/permissions.ts`, thin Route Handlers (`src/app/api/upload/sign/route.ts`), service + Zod validators + Vitest (`src/server/services/*.test.ts`), and Playwright auth/RBAC patterns (`e2e/cart-auth.spec.ts`, `e2e/admin-rbac.spec.ts`). **No `Conversation` / `Message` models yet** in `prisma/schema.prisma`; **no `pusher` / `pusher-js` in `package.json`**.

**Primary recommendation:** Implement `chat.service.ts` as the single domain layer; expose **POST `/api/chat/messages`** and **POST `/api/chat/pusher/auth`** (mirror upload/sign auth style); mount **`ChatProvider`** once in storefront layout with a **module-singleton `pusher-js`** client; use **denormalized `lastMessage*` + `adminLastReadAt` / `buyerLastReadAt`** for inbox sort and unread badges; rate-limit sends with a **Prisma count in the last 60s** (no new dependency, works across Vercel instances).

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

#### Phase boundary
- One ongoing thread per authenticated buyer ↔ store (widget, not a separate `/chat` page).
- Text only, max 2000 chars, rate limit on send.
- No push/email, attachments, typing/read receipts, per-product/order threads, OAuth.

#### Model & entry (D-05-01 … D-05-07)
- **D-05-01:** One `Conversation` per buyer (`userId` unique).
- **D-05-02:** PDP product context = optional metadata (`productId` / title snapshot / `contextProductId` on conversation); does **not** create a new dialog.
- **D-05-03:** Global FAB widget in `(storefront)/layout`, fixed bottom-right, high z-index, mobile safe-area.
- **D-05-04:** Guest click → `/uviity?callbackUrl=…` (same as cart, AUTH-03).
- **D-05-05:** PDP button «Запитати про цей товар» opens same widget with `productId` context.
- **D-05-06:** `/kabinet` — remove stub; CTA «Відкрити чат» opens widget (`?chat=open` via nuqs acceptable).
- **D-05-07:** No dedicated `/chat` page for MVP.

#### Admin inbox (D-05-08 … D-05-12)
- **D-05-08:** All admins see all conversations (single-store).
- **D-05-09:** Sort list by last message (`updatedAt` desc).
- **D-05-10:** Enable nav «Чати» → `/admin/chaty` (replace disabled «Незабаром»).
- **D-05-11:** Desktop split view; mobile list → thread.
- **D-05-12:** Unread badge on admin nav (buyer messages after admin read cursor — details in plan).

#### Realtime (D-05-13 … D-05-17)
- **D-05-13:** Pusher Channels — `pusher` (server) + `pusher-js` (client).
- **D-05-14:** DB-first: `INSERT Message` → `pusher.trigger('private-conversation-{id}', 'message:new', payload)`.
- **D-05-15:** Private channel + `POST /api/chat/pusher/auth` — session + conversation ownership.
- **D-05-16:** One singleton realtime client module; subscribe in `ChatProvider` only.
- **D-05-17:** No polling fallback in MVP; on disconnect show banner + refetch history on reconnect.

#### UX (D-05-18 … D-05-21)
- **D-05-18:** Text only; max 2000 chars; rate limit on send.
- **D-05-19:** No typing, read receipts, files, presence.
- **D-05-20:** UA local timestamps; admin side labeled **«Магазин»** in UI (not admin personal name).
- **D-05-21:** Collapsed FAB `MessageSquare`; expanded panel ~380px desktop, full-width bottom sheet on mobile.

### Claude's Discretion (resolved)
All discretion items resolved in D-05-03 … D-05-21 above.

### Deferred Ideas (OUT OF SCOPE)
- Push / email on new message (NOTF-01) — v2.
- Photos/files in chat.
- Typing indicator, read receipts, presence.
- Separate chat per order.
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| CHAT-01 | Buyer can open chat from product or cabinet | FAB in `layout.tsx`, `OpenChatButton` on PDP + `/kabinet`, guest redirect pattern from `add-to-cart-button.tsx` |
| CHAT-02 | Real-time delivery via Pusher | DB-first + `pusher.trigger`; singleton `pusher-js` in `ChatProvider`; auth route per Pitfall #6 |
| CHAT-03 | History in DB survives reload | Prisma `Message` + initial fetch on panel open; RSC/handler reads, not client-only state |
| CHAT-04 | Admin sees all dialogs and can reply | `/admin/chaty` + `ConversationList` / `ChatThread`; `requireAdmin()`; admin may auth all `private-conversation-*` channels |
</phase_requirements>

## Architectural Responsibility Map

| Capability | Primary Tier | Secondary Tier | Rationale |
|------------|-------------|----------------|-----------|
| Message persistence & business rules | API / Backend (`chat.service`) | — | Source of truth; rate limits, ownership, unread |
| Send message mutation | API Route Handler | Server Action (optional thin wrapper) | JSON for client composer; triggers Pusher after insert |
| Pusher channel authorization | API Route Handler | — | Must verify session + conversation access before signature |
| Pusher event broadcast | API / Backend (`lib/pusher-server`) | — | Server-only secret; called after DB commit |
| Chat history initial load | Frontend Server (RSC) or Route GET | Client fetch in `ChatProvider` | Hydrate panel; reload after disconnect |
| Live message append | Browser (`pusher-js` in `ChatProvider`) | — | Subscribes to one private channel per open thread |
| Admin inbox list & unread aggregate | Frontend Server (admin layout/page RSC) | — | Badge count without subscribing to every channel |
| Mark conversation read | API Route or Server Action | — | Updates `adminLastReadAt` / `buyerLastReadAt` |
| FAB / panel / composer UI | Browser (client components) | — | Overlay UX per UI-SPEC |
| Guest gate | Browser redirect + AUTH | — | Same as cart: no session → `/uviity?callbackUrl=` |

## Standard Stack

### Core

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| `pusher` | **5.3.3** [VERIFIED: npm registry] | Server trigger + `authorizeChannel` | Official Node SDK; matches STACK.md |
| `pusher-js` | **8.5.0** [VERIFIED: npm registry] | Browser subscribe/bind | Official client; private channel auth hooks |
| Prisma 7.8.x | (installed) | `Conversation`, `Message` | Project ORM; migrations with existing Neon setup |
| Better Auth 1.6.x | (installed) | Session on auth routes | Same as cart/checkout |
| Zod 4.4.x | (installed) | `sendMessageSchema`, env | Matches `src/server/validators/*` |
| nuqs 2.8.x | (installed) | `?chat=open`, optional `productId` | Already in storefront layout |

### Supporting (already in repo — reuse, do not add unless plan proves necessary)

| Library | Purpose | When to Use |
|---------|---------|-------------|
| shadcn `sheet`, `scroll-area`, `textarea` | Panel UI | Per `05-UI-SPEC.md` |
| Vitest 4.1.x | `chat.service` unit tests | Same as `order.service.test.ts` |
| Playwright 1.60.x | Auth gate + persistence E2E | Same as `e2e/cart-auth.spec.ts` |

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Route Handler POST send | Server Action only | Action works but JSON POST matches composer `fetch` + upload/sign precedent |
| Prisma count rate limit | `@upstash/ratelimit` | Extra service/env; DB count sufficient at single-store volume |
| `react-query` (STACK.md mention) | Local state in `ChatProvider` | **Not in package.json** — YAGNI for MVP |

**Installation:**
```bash
npm install pusher@5.3.3 pusher-js@8.5.0
```

## Package Legitimacy Audit

> slopcheck unavailable at research time — packages tagged conservatively; planner should run slopcheck before install if available.

| Package | Registry | Age | Downloads | Source Repo | slopcheck | Disposition |
|---------|----------|-----|-----------|-------------|-----------|-------------|
| `pusher` | npm | Mature (Pusher Ltd) | High | github.com/pusher/pusher-http-node | not run | Approved — official SDK [CITED: pusher.com/docs] |
| `pusher-js` | npm | Mature | High | github.com/pusher/pusher-js | not run | Approved — official SDK [CITED: Context7 /pusher/pusher-js] |

**Packages removed due to slopcheck [SLOP] verdict:** none  
**Packages flagged as suspicious [SUS]:** none  

*If slopcheck was unavailable: both packages are official Pusher SDKs documented at pusher.com — still add `checkpoint:human-verify` only if team policy requires slopcheck on every phase.*

**postinstall scripts:** `npm view` returned no postinstall for `pusher` or `pusher-js` (checked 2026-05-17).

## Architecture Patterns

### System Architecture Diagram

```
[Buyer browser]                    [Admin browser]
     |                                    |
     | FAB / Panel (ChatProvider)         | /admin/chaty (RSC list + ChatThread)
     | pusher-js (singleton)            | pusher-js (subscribe on thread open)
     v                                    v
POST /api/chat/pusher/auth  <--- session cookie (Better Auth) --->  same
     |                                    |
     v                                    v
+------------------ Next.js Route Handlers / Services ------------------+
|  authorizeChannel(socket_id, private-conversation-{id})               |
|  POST /api/chat/messages  -> chat.service.sendMessage()               |
|       1) validate session (buyer|admin)                               |
|       2) rate limit (Prisma count)                                      |
|       3) prisma.message.create + update conversation denorm fields      |
|       4) pusherServer.trigger(channel, 'message:new', dto)              |
+---------------------------------------|--------------------------------+
                                        v
                              PostgreSQL (Prisma)
                              Conversation, Message
                                        ^
                                        | trigger after commit
                                        v
                              Pusher Channels (hosted)
                              private-conversation-{id}
```

### Recommended Project Structure

```
prisma/
  schema.prisma                    # + Conversation, Message, MessageSender enum

src/lib/
  pusher-server.ts                 # singleton Pusher (server-only)
  pusher-client.ts                 # singleton pusher-js (client-only, 'use client' consumers)
  permissions.ts                   # + assertBuyerApi() mirror assertAdminApi

src/server/
  validators/chat.ts               # body max 2000, optional product context
  services/chat.service.ts         # getOrCreateConversation, sendMessage, list, markRead, unread
  services/chat.service.test.ts
  actions/chat.actions.ts          # optional: markReadAction for admin (revalidatePath)

src/app/api/chat/
  messages/route.ts                # POST send (+ optional GET history)
  pusher/auth/route.ts             # POST channel auth

src/app/(admin)/admin/chaty/
  page.tsx                         # RSC: conversations + unread total

src/app/(storefront)/layout.tsx    # mount <ChatProvider />

src/components/chat/
  chat-provider.tsx                # open state, nuqs, subscribe/unsubscribe
  chat-fab.tsx, chat-panel.tsx, message-list.tsx, message-bubble.tsx
  chat-composer.tsx, product-context-banner.tsx
  admin-chat-inbox.tsx, conversation-list.tsx, chat-thread.tsx
  open-chat-button.tsx

src/components/admin/admin-nav.tsx # enable Чати link + badge
```

**Note:** ARCHITECTURE.md suggested `(storefront)/chat/` route — **superseded by D-05-07** (widget only). Use `/admin/chaty` (Ukrainian slug, matches `zamovlennia` pattern).

### Pattern 1: Prisma schema (conversation + messages + unread)

**What:** One row per buyer; messages append-only; denormalized last-message fields for inbox; read cursors per side.

**When to use:** All chat reads/writes.

**Recommended models** (align D-05-01 `userId`, D-05-09 sort, D-05-12 unread):

```prisma
enum MessageSender {
  BUYER
  STORE
}

model Conversation {
  id                   String    @id @default(cuid())
  userId               String    @unique
  contextProductId     String?
  contextProductTitle  String?
  buyerLastReadAt      DateTime  @default(now())
  adminLastReadAt      DateTime  @default(now())
  lastMessageAt        DateTime?
  lastMessagePreview   String?
  lastMessageSender    MessageSender?
  messages             Message[]
  createdAt            DateTime  @default(now())
  updatedAt            DateTime  @updatedAt

  @@index([updatedAt])
  @@index([lastMessageAt])
}

model Message {
  id             String         @id @default(cuid())
  conversationId String
  conversation   Conversation   @relation(fields: [conversationId], references: [id], onDelete: Cascade)
  senderId       String
  senderRole     MessageSender
  body           String
  createdAt      DateTime       @default(now())

  @@index([conversationId, createdAt])
}
```

**Unread logic (recommended for planner):**
- **Admin nav / row badge:** `lastMessageSender === BUYER && lastMessageAt > adminLastReadAt` (or `count` of buyer messages after `adminLastReadAt`).
- **Buyer FAB dot (UI slot):** `lastMessageSender === STORE && lastMessageAt > buyerLastReadAt`.
- **Mark read:** `markAdminRead(conversationId)` sets `adminLastReadAt = now()`; buyer equivalent on panel open.

**Indexes:** `@@index([conversationId, createdAt])` for history pagination; `Conversation.updatedAt` / `lastMessageAt` for inbox sort (D-05-09).

**Deviation from ARCHITECTURE.md:** use `userId` not `buyerId`; omit `orderId` on Conversation for MVP (deferred per CONTEXT).

### Pattern 2: Pusher server singleton (Next.js)

**What:** Single server instance; lazy init; throws clear error if env missing (like Cloudinary).

**File:** `src/lib/pusher-server.ts`

```typescript
// Source: [CITED: https://pusher.com/docs/channels/server_api/authorizing-users/]
import Pusher from "pusher";

let server: Pusher | undefined;

export function getPusherServer(): Pusher {
  if (!server) {
    server = new Pusher({
      appId: process.env.PUSHER_APP_ID!,
      key: process.env.PUSHER_KEY!,
      secret: process.env.PUSHER_SECRET!,
      cluster: process.env.PUSHER_CLUSTER!,
      useTLS: true,
    });
  }
  return server;
}

export const conversationChannel = (id: string) => `private-conversation-${id}`;
```

**Env** (extend `src/lib/env.ts`):
- Server: `PUSHER_APP_ID`, `PUSHER_KEY`, `PUSHER_SECRET`, `PUSHER_CLUSTER`
- Client: `NEXT_PUBLIC_PUSHER_KEY`, `NEXT_PUBLIC_PUSHER_CLUSTER` (same key/cluster as dashboard)

### Pattern 3: Private channel auth route

**What:** Authorize only if logged-in user may access `private-conversation-{conversationId}`.

**File:** `src/app/api/chat/pusher/auth/route.ts`

**Rules (Pitfall #6):**
| Role | May subscribe |
|------|----------------|
| Buyer | Channel where `conversation.userId === session.user.id` |
| Admin | Any existing conversation (`role === 'admin'`) |

```typescript
// Source: [CITED: https://pusher.com/docs/channels/server_api/authorizing-users/]
// POST body: socket_id, channel_name (form or JSON — support both for pusher-js)
const auth = getPusherServer().authorizeChannel(socketId, channelName);
return Response.json(auth);
// else 403
```

**Channel name validation:** Regex `^private-conversation-[a-z0-9]+$` (cuid); reject malformed names before DB lookup.

**Reference implementation:** `src/app/api/upload/sign/route.ts` — session check, JSON body, structured errors.

### Pattern 4: DB-first send via Route Handler

**What:** POST persists, then triggers; client listens for `message:new`.

**File:** `src/app/api/chat/messages/route.ts`

**Flow:**
1. `assertBuyerApi()` or admin session (admin replies as `MessageSender.STORE`, `senderId` = admin user id).
2. `sendMessageSchema.parse(body)` — `body` max 2000, trim.
3. `chat.service.sendMessage(...)` inside transaction:
   - `getOrCreateConversation(userId)` for buyers; admins pass `conversationId`.
   - `prisma.message.create`
   - Update `lastMessage*` + `conversation.updatedAt`
4. `getPusherServer().trigger(channel, 'message:new', messageDto)`
5. Return `201` + DTO (id, body, senderRole, createdAt).

**Why Route Handler over Server Action alone:** Matches API precedent for JSON mutations; easier for `ChatComposer` `fetch`; keeps Pusher + DB in one server-only path (ARCHITECTURE.md Pattern 3).

**Optional:** `GET` same route with `conversationId` cursor pagination for `ChatProvider` initial/history load — or pass initial messages from RSC wrapper.

### Pattern 5: Client singleton + ChatProvider

**What:** One `pusher-js` instance per browser session; subscribe/unsubscribe when panel opens or admin selects thread.

**File:** `src/lib/pusher-client.ts` (import only from client components)

```typescript
// Source: [CITED: Context7 /pusher/pusher-js — private channel + channelAuthorization]
'use client';
import Pusher from 'pusher-js';

let client: Pusher | null = null;

export function getPusherClient() {
  if (!client) {
    client = new Pusher(process.env.NEXT_PUBLIC_PUSHER_KEY!, {
      cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER!,
      channelAuthorization: {
        endpoint: '/api/chat/pusher/auth',
        transport: 'ajax',
      },
    });
  }
  return client;
}
```

**ChatProvider responsibilities (`src/components/chat/chat-provider.tsx`):**
- Read `nuqs` `chat=open` (and optional product context from query or props).
- Guest: no Pusher — redirect only from FAB/buttons.
- Authenticated: load conversation id + messages (fetch or RSC props).
- Subscribe: `getPusherClient().subscribe('private-conversation-${id}')`
- Bind: `channel.bind('message:new', appendMessage)` — dedupe by `message.id`.
- Cleanup: `unbind` + `unsubscribe` on close/unmount (avoid Pitfall #6 connection sprawl).
- Connection state: `pusher.connection.bind('state_change')` → disconnected banner (D-05-17).
- On reconnect: refetch messages GET (no polling loop).

**Storefront layout** (`src/app/(storefront)/layout.tsx`):

```tsx
<NuqsAdapter>
  <CartPendingMergeGate />
  {children}
</NuqsAdapter>
<ChatProvider />
```

### Pattern 6: Rate limiting (project-consistent, no new package)

**What:** No `express-rate-limit` in app code today (only transitive in lockfile). Use **DB-backed sliding window** in `chat.service`:

```typescript
const WINDOW_MS = 60_000;
const MAX_PER_WINDOW = 20; // planner may tune; UI copy: "хвилину"

const recent = await prisma.message.count({
  where: {
    senderId: userId,
    createdAt: { gte: new Date(Date.now() - WINDOW_MS) },
  },
});
if (recent >= MAX_PER_WINDOW) {
  throw new ChatRateLimitError(); // map to 429 + UA message in route
}
```

**Why:** Works across serverless instances; no Redis; testable in Vitest with mocked prisma.

### Anti-Patterns to Avoid

- **Realtime-as-database:** Never append UI-only messages without DB row (PITFALLS #6, ARCHITECTURE Anti-Pattern 1).
- **Pusher client per component:** Only `ChatProvider` / admin `ChatThread` subscribes.
- **Auth every private channel:** Never `authorizeChannel` without `conversationId` ownership check.
- **Separate `/chat` page:** Violates D-05-07.
- **Showing admin display name on store messages:** Use `MessageSender.STORE` → label «Магазин» (D-05-20).

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| WebSocket server on Vercel | Custom WS | Pusher Channels | Serverless has no long-lived connections [CITED: STACK.md, Ably/Vercel pattern] |
| Channel auth crypto | Manual HMAC | `pusher.authorizeChannel()` | Signature format easy to get wrong [CITED: pusher.com/docs] |
| Session verification on API | Custom JWT parsing | `auth.api.getSession({ headers })` | Same as `permissions.ts` |
| Unread math in client only | Local counters | Read cursors + denorm fields in Prisma | Refresh-safe admin badge |

## Common Pitfalls

### Pitfall 1: Channel auth without membership check (PITFALLS #6)

**What goes wrong:** Any logged-in user subscribes to another buyer's channel.  
**How to avoid:** Parse `channel_name`, load `Conversation`, verify buyer `userId` or `role === 'admin'`.  
**Warning signs:** Changing `conversationId` in DevTools exposes others' messages.

### Pitfall 2: Multiple pusher-js instances (PITFALLS #6)

**What goes wrong:** Connection explosion in dev (HMR) and production billing spikes.  
**How to avoid:** `getPusherClient()` module singleton; single subscribe site.  
**Warning signs:** New WebSocket per navigation in Network tab.

### Pitfall 3: Trigger before DB commit

**What goes wrong:** Clients receive events for messages that failed persistence.  
**How to avoid:** `await prisma.$transaction(...)` then `trigger` after success.  
**Warning signs:** Reload shows fewer messages than live panel.

### Pitfall 4: Admin unread requires subscribing to all channels

**What goes wrong:** Complex client wiring for nav badge.  
**How to avoid:** Compute `unreadTotal` in RSC (`admin/layout` or `chaty/page`) from Prisma.  
**Warning signs:** Badge only updates when inbox page open.

### Pitfall 5: E2E flaky on realtime

**What goes wrong:** CI fails without Pusher credentials.  
**How to avoid:** E2E asserts DB persistence + auth gates; gate live Pusher tests with `hasPusherSecrets()` like `hasCloudinarySecrets()` in `e2e/helpers/admin.ts`.

## Code Examples

### Authorize private channel (server)

```typescript
// Source: https://pusher.com/docs/channels/server_api/authorizing-users/
const authResponse = pusher.authorizeChannel(socketId, channelName);
return Response.json(authResponse);
```

### Subscribe and bind (client)

```typescript
// Source: Context7 /pusher/pusher-js
const channel = pusher.subscribe(`private-conversation-${conversationId}`);
channel.bind("message:new", (payload: MessageDto) => {
  appendMessage(payload);
});
```

### Trigger after insert (server)

```typescript
// Source: [CITED: D-05-14 + pusher-http-node pattern]
await prisma.message.create({ data: { ... } });
await getPusherServer().trigger(
  `private-conversation-${conversationId}`,
  "message:new",
  messageDto,
);
```

### Guest redirect (existing pattern)

```typescript
// Source: src/components/cart/add-to-cart-button.tsx
router.push(`/uviity?callbackUrl=${encodeURIComponent(pathname + search)}`);
```

## State of the Art

| Old Approach | Current Approach | Impact |
|--------------|------------------|--------|
| ARCHITECTURE `buyerId` + optional `orderId` on Conversation | CONTEXT `userId` unique, no order thread | Planner schema must follow CONTEXT |
| ARCHITECTURE `(storefront)/chat/` route | Widget only in layout | No new public route |
| Default Pusher auth path `/pusher/auth` | Explicit `/api/chat/pusher/auth` | Must set `channelAuthorization.endpoint` |

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | Rate limit 20 msgs / 60s per sender | Rate limiting | Too strict/loose for store — tune in plan |
| A2 | `MessageSender.STORE` for any admin reply | Schema | If multiple store identities needed later, migrate |
| A3 | Denormalized `lastMessage*` acceptable | Schema | Extra write on send — worth it for inbox UX |
| A4 | EU Pusher cluster available on team's plan | Environment | Latency; pick cluster in dashboard |
| A5 | No `@tanstack/react-query` for MVP | Standard Stack | May add if optimistic UX gets complex |

## Open Questions

1. **Exact rate limit number**  
   - What we know: D-05-18 requires rate limit; UI copy «хвилину».  
   - Recommendation: Default 20/min/sender; expose constant in `chat.service`.

2. **Initial message batch size**  
   - What we know: MVP text chat, single thread.  
   - Recommendation: Last 50 messages on open; `cursor` param for older if needed later.

3. **Pusher in CI**  
   - What we know: Playwright uses conditional skips for Cloudinary.  
   - Recommendation: `hasPusherSecrets()` helper; realtime E2E optional, persistence E2E required.

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|------------|-------------|-----------|---------|----------|
| Node.js | Next dev/build | ✓ | v24.14.0 | — |
| PostgreSQL (Neon/local) | Prisma | ✓ (project uses DATABASE_URL) | Prisma 7.8 | — |
| Pusher app credentials | CHAT-02 | ✗ (not in `src/lib/env.ts` yet) | — | Create free Channels app; add env vars |
| `pusher` / `pusher-js` npm | CHAT-02 | ✗ (not in package.json) | 5.3.3 / 8.5.0 | `npm install` |

**Missing dependencies with no fallback:**
- Pusher credentials block realtime verification until dashboard app is created.

**Missing dependencies with fallback:**
- Live E2E realtime → skip; test reload persistence only.

## Validation Architecture

### Test Framework

| Property | Value |
|----------|-------|
| Framework | Vitest 4.1.6 + Playwright 1.60.0 |
| Config file | `vitest.config.ts`, `playwright.config.ts` |
| Quick run command | `npm test` |
| Full suite command | `npm test && npm run test:e2e` |

### Phase Requirements → Test Map

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| CHAT-01 | Guest FAB → login redirect | e2e | `npx playwright test e2e/chat-auth.spec.ts` | ❌ Wave 0 |
| CHAT-01 | Authenticated open panel from kabinet | e2e | same file | ❌ Wave 0 |
| CHAT-02 | `sendMessage` triggers channel name + ordering | unit | `npm test -- src/server/services/chat.service.test.ts` | ❌ Wave 0 |
| CHAT-02 | Pusher auth rejects wrong buyer | unit/route | `npm test -- src/app/api/chat/pusher/auth/route.test.ts` | ❌ Wave 0 |
| CHAT-03 | History returned after create | unit | `chat.service.test.ts` | ❌ Wave 0 |
| CHAT-03 | Message persists after reload | e2e | `e2e/chat-persistence.spec.ts` | ❌ Wave 0 |
| CHAT-04 | Admin lists conversations sorted | unit | `chat.service.test.ts` (`listConversationsForAdmin`) | ❌ Wave 0 |
| CHAT-04 | Admin reply stored as STORE | unit | `chat.service.test.ts` | ❌ Wave 0 |
| CHAT-04 | Buyer cannot access admin inbox | e2e | extend `e2e/admin-rbac.spec.ts` or new spec | ✅ pattern exists |
| CHAT-04 | Non-admin cannot POST send as store | e2e/api | request fixture | ❌ Wave 0 |
| AUTH-03 | Guest cannot POST message | e2e | `e2e/chat-auth.spec.ts` | ❌ Wave 0 |

### Sampling Rate

- **Per task commit:** `npm test -- src/server/services/chat.service.test.ts src/server/validators/chat.test.ts`
- **Per wave merge:** `npm test`
- **Phase gate:** `npm test && npm run test:e2e` (with Pusher secrets optional skip)

### Wave 0 Gaps

- [ ] `src/server/validators/chat.ts` + `chat.test.ts` — body length, trim
- [ ] `src/server/services/chat.service.ts` + `chat.service.test.ts` — core domain
- [ ] `src/app/api/chat/messages/route.ts` + tests
- [ ] `src/app/api/chat/pusher/auth/route.ts` + tests
- [ ] `src/lib/pusher-server.ts`, `src/lib/pusher-client.ts`
- [ ] `e2e/chat-auth.spec.ts` — guest redirect (mirror `cart-auth.spec.ts`)
- [ ] `e2e/chat-persistence.spec.ts` — send → reload → see text
- [ ] `e2e/helpers/pusher.ts` — `hasPusherSecrets()` (optional)
- [ ] Extend `src/lib/env.ts` + `env.test.ts` for Pusher vars
- [ ] Prisma migration for Conversation/Message
- [ ] Framework install: `npm install pusher@5.3.3 pusher-js@8.5.0`

## Security Domain

### Applicable ASVS Categories

| ASVS Category | Applies | Standard Control |
|---------------|---------|------------------|
| V2 Authentication | yes | Better Auth session on all chat routes |
| V3 Session Management | yes | HTTP-only session cookie; no chat without session |
| V4 Access Control | yes | Conversation ownership + admin role; channel auth |
| V5 Input Validation | yes | Zod: `body` max 2000, trim, reject empty |
| V6 Cryptography | yes | Pusher `authorizeChannel` HMAC — do not reimplement |

### Known Threat Patterns

| Pattern | STRIDE | Standard Mitigation |
|---------|--------|---------------------|
| IDOR on conversation | Elevation | Verify `userId` on read/send; admin-only list |
| Unauthorized channel subscribe | Info disclosure | `pusher/auth` membership check |
| Message flood | DoS | Prisma rate limit per sender |
| XSS in message body | Tampering | React text nodes / `whitespace-pre-wrap`; no `dangerouslySetInnerHTML` |
| Mass assignment | Tampering | Zod allowlist; ignore client `senderRole` for buyers |

## Project Constraints (from .cursor/rules/)

- **Stack locked:** Next.js App Router, Prisma, Better Auth, Tailwind/shadcn, Ukrainian UI only (`.cursor/rules/gsd.mdc`).
- **Follow AGENTS.md:** Read `node_modules/next/dist/docs/` for Next.js APIs — version may differ from training data.
- **Single-store:** All admins see all chats (D-05-08).
- **Match existing patterns:** Services in `src/server/services/`, validators in `src/server/validators/`, API routes mirror `upload/sign`, permissions in `src/lib/permissions.ts`.

## Sources

### Primary (HIGH confidence)
- [Context7 /pusher/pusher-js](https://context7.com/pusher/pusher-js/llms.txt) — private subscribe, `channelAuthorization`, `bind`
- [Pusher — Authorizing users](https://pusher.com/docs/channels/server_api/authorizing-users/) — `authorizeChannel`, 403, endpoint config
- Codebase: `src/lib/permissions.ts`, `src/app/api/upload/sign/route.ts`, `src/components/cart/add-to-cart-button.tsx`, `prisma/schema.prisma`
- `.planning/phases/05-realtime-chat/05-CONTEXT.md`, `05-UI-SPEC.md`

### Secondary (MEDIUM confidence)
- `.planning/research/ARCHITECTURE.md`, `PITFALLS.md` (#6), `STACK.md`
- [npm registry](https://www.npmjs.com/) — `pusher@5.3.3`, `pusher-js@8.5.0` (2026-05-17)

### Tertiary (LOW confidence)
- Rate limit threshold (20/min) — team tune during UAT

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — npm versions + official Pusher docs + locked CONTEXT
- Architecture: HIGH — aligns with existing repo patterns and Phase 4 admin work
- Pitfalls: HIGH — PITFALLS #6 explicitly matches Pusher plan
- E2E realtime in CI: MEDIUM — depends on Pusher credentials in env

**Research date:** 2026-05-17  
**Valid until:** 2026-06-17 (Pusher APIs stable; re-check if upgrading Next major)
