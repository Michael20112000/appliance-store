# Architecture Research

**Domain:** Chat enhancements — v3.0 (guest chat, history drawer, file attachments, admin chat control)
**Researched:** 2026-05-24
**Confidence:** HIGH (codebase read; existing Pusher/Cloudinary/Better Auth patterns verified)

---

## System Overview

All new features extend the existing chat system. No new real-time infrastructure needed — Pusher, Cloudinary, Better Auth remain unchanged. The main structural changes are:

1. **Schema migration** — `Conversation` gains `guestToken`, nullable `userId`, `isActive`; `Message` gains attachment fields
2. **Pusher auth extension** — guest token accepted alongside session auth
3. **ChatProvider state expansion** — from single-conversation to multi-conversation aware
4. **Composer extension** — file input for auth users

---

## Database Schema Changes

### Conversation Model

```prisma
model Conversation {
  id          String    @id @default(cuid())
  userId      String?                          // WAS: String @unique — now nullable, non-unique
  guestToken  String?   @unique               // NEW: UUID for anonymous sessions
  isActive    Boolean   @default(true)        // NEW: replaces @unique constraint for "active chat"
  status      ConversationStatus @default(OPEN)
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt
  user        User?     @relation(fields: [userId], references: [id])
  messages    Message[]

  @@index([userId, isActive])
  @@index([guestToken])
}
```

**Migration risk:** `userId` was implicitly non-nullable (Prisma `@unique` without `?`). The migration must:
1. Make `userId` nullable (`String?`)
2. Remove `@unique` from `userId`
3. Add `guestToken String? @unique`
4. Add `isActive Boolean @default(true)` (set to `true` for all existing rows)

Existing data: all current conversations have a real `userId` — no data loss. After migration, `getActiveConversation(userId)` becomes `findFirst({ where: { userId, isActive: true } })`.

### Message Model

```prisma
model Message {
  // existing fields unchanged...
  attachmentUrl   String?   // NEW: Cloudinary URL
  attachmentType  String?   // NEW: "image" | "pdf"
}
```

---

## New API Routes

| Route | Method | Auth | Purpose |
|-------|--------|------|---------|
| `/api/chat/guest` | POST | None | Create or retrieve guest conversation by `guestToken` |
| `/api/chat/[id]/close` | POST | Admin | Mark conversation as closed (`isActive: false`, `status: ARCHIVED`), emit Pusher event |
| `/api/chat/claim` | POST | Session | Link `guestToken` conversation to authenticated user on login |
| `/api/chat/attach` | POST | Session | Upload file to Cloudinary, return URL + type |
| `/api/chat/list` | GET | Session | List all conversations for current user (for history drawer) |

**Existing route stays:** `POST /api/chat/messages` — extend to accept `guestToken` in request body when no session.

---

## Pusher Channel Architecture

### Current (auth users only)
```
private-user-{userId}  ← buyer listens for incoming messages
private-admin-chat     ← admin listens for all conversations
```

### v3.0 Extension (guests)
```
private-guest-{conversationId}  ← guest listens after auth endpoint validates guestToken
private-user-{userId}           ← unchanged for auth users
private-admin-chat              ← unchanged for admin
```

**Auth endpoint change** (`/api/pusher/auth`):
```typescript
// Current: only allows session users
// New: also allow if guestToken in request matches conversation.guestToken in DB
if (session) {
  // existing path
} else if (guestToken && await verifyGuestToken(guestToken, channelName)) {
  // authorize private-guest-{conversationId}
}
```

### New Pusher Events

| Event | Channel | Payload | Trigger |
|-------|---------|---------|---------|
| `conversation:closed` | `private-user-{userId}` / `private-guest-{conversationId}` | `{ conversationId, status: "ARCHIVED" }` | Admin closes chat |
| `conversation:claimed` | — (server-side only) | — | Guest → account migration |

---

## ChatProvider State Changes

### Current state shape
```typescript
{
  conversationId: string | null
  messages: Message[]
  status: ConversationStatus
  unreadFromStore: number
  isOpen: boolean
}
```

### v3.0 state shape
```typescript
{
  conversations: Conversation[]        // NEW: list for history drawer
  activeConversationId: string | null  // RENAMED from conversationId
  messages: Message[]
  status: ConversationStatus
  unreadFromStore: number
  isOpen: boolean
  isDrawerOpen: boolean               // NEW: in-widget history drawer
  guestToken: string | null           // NEW: for anonymous sessions
}
```

**Key behavior changes:**
- On mount: check localStorage for `chat_guest_token`; if found, attempt `GET /api/chat/guest?token=…` to restore conversation
- `openPanel()`: guests no longer redirect to `/uviity`; open widget directly
- `switchConversation(id)`: load messages for selected conversation
- On login/register event: call `/api/chat/claim` with guestToken → clear localStorage token

---

## Component Architecture

### New Components

| Component | Location | Purpose |
|-----------|----------|---------|
| `ChatHistoryDrawer` | `src/components/chat/chat-history-drawer.tsx` | Slide-in panel inside widget; auth only |
| `ConversationListItem` | `src/components/chat/conversation-list-item.tsx` | Single row in history drawer |
| `ChatAttachmentInput` | `src/components/chat/chat-attachment-input.tsx` | File picker in composer; auth only |
| `ChatAttachmentPreview` | `src/components/chat/chat-attachment-preview.tsx` | Thumbnail/filename before send |

### Modified Components

| Component | Change |
|-----------|--------|
| `ChatProvider` | Multi-conversation state, guestToken handling, drawer state |
| `ChatPanel` | Add menu button to header; render `ChatHistoryDrawer` |
| `ChatComposer` | Add `ChatAttachmentInput` for auth users |
| `ArchivedChatBanner` | Add "Почати новий чат" button; update copy |
| `AdminChatComposer` | Add file attachment input |
| `/api/pusher/auth` | Accept guestToken for guest channel auth |
| `chat.service.ts` | `getActiveConversation` → query by `isActive: true`; add `listConversationsForBuyer`, `claimGuestConversation`, `closeConversation` (emit Pusher) |

---

## Build Order (Phase Dependencies)

```
Phase 46: Schema + Guest Foundation
  → Prisma migration (guestToken, nullable userId, isActive, attachment fields)
  → Guest conversation API + Pusher auth extension
  → ChatProvider guest mode (localStorage token, open without auth)
  → Admin "Гість" label

Phase 47: Lifecycle Control
  → Admin close chat (API + Pusher event)
  → ArchivedChatBanner: "Чат завершено" + "Почати новий чат"
  → Guest → account claim on login

Phase 48: History Drawer
  → ChatHistoryDrawer component + in-widget drawer state
  → ConversationListItem + list API
  → "Новий чат" from drawer

Phase 49: File Attachments
  → Cloudinary signed upload endpoint for chat
  → ChatAttachmentInput + preview
  → Message schema fields rendered in ChatMessage
  → Admin attachment upload
```

**Phase 49 is independent of Phase 48** — can be parallelized if needed.

---

## Reuse from Existing Code

| Existing | Reused For |
|----------|-----------|
| `ArchivedChatBanner` | Extend for CHAT-04/05 (add "Чат завершено" text + new chat button) |
| `ConversationList` in admin | Pattern reference for `ChatHistoryDrawer` list |
| Cloudinary upload in product edit | Reference pattern for chat file upload endpoint |
| `private-user-{userId}` Pusher subscribe | Extend to also subscribe to `private-guest-*` for guests |
| `shadcn/ui Drawer` | Already used in mobile chat; use for in-widget history drawer |

---

## Sources

- Codebase: `src/components/chat/`, `src/server/services/chat.service.ts`, `prisma/schema.prisma`, `src/app/api/chat/`, `src/app/api/pusher/`
- [Pusher Channels — Authenticating users](https://pusher.com/docs/channels/server_api/authenticating-users/)
- [Prisma — Optional fields and removing unique constraints](https://www.prisma.io/docs/orm/prisma-migrate)
- [Cloudinary — Authenticated uploads](https://cloudinary.com/documentation/upload_images#authenticated_requests)

---
*Architecture research for: Appliance Store Lviv — v3.0 Chat & Engagement*
*Researched: 2026-05-24*
