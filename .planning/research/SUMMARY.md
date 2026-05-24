# Project Research Summary

**Project:** Appliance Store Lviv — v3.0 Chat & Engagement
**Domain:** Real-time customer support chat enhancements on existing Pusher + Next.js app
**Researched:** 2026-05-24
**Confidence:** HIGH

---

## Executive Summary

The v3.0 milestone extends an already-working chat system rather than building from scratch. The primary work is a carefully sequenced set of database schema changes plus targeted additions to `ChatProvider`, `ChatPanel`, and the Pusher auth endpoint. The single most important constraint is that `Conversation.userId @unique` must be removed in the first phase — every other feature (new chat after closure, history drawer) breaks without it.

No new real-time infrastructure is needed. Pusher, Cloudinary, and Better Auth remain unchanged; they only need minor extensions (guest channel auth endpoint, signed chat upload preset, post-login claim hook). The recommended approach is a 4-phase build: schema foundation → lifecycle control → history drawer → file attachments. Phases 3 and 4 are independent and can be planned in parallel.

Key risk: file uploads. Using an unsigned Cloudinary preset exposes the app to anonymous abuse. Use server-signed uploads with a dedicated `chat-attachments` preset that enforces `jpg,png,webp,pdf` and 10 MB max. The only new npm dependency is `react-dropzone`.

---

## Key Findings

### Recommended Stack

The existing stack handles everything. The only addition is `react-dropzone ^14` for the file picker UI. All other capabilities — UUID generation (`crypto.randomUUID()`), real-time (`pusher-js`), file storage (Cloudinary), auth (Better Auth) — are already installed.

**New additions:**
- `react-dropzone ^14` — file picker with accept filter and size guard
- `chat-attachments` Cloudinary preset — separate from `products`, signed uploads, `jpg,png,webp,pdf`, 10 MB max
- Extended `/api/pusher/auth` — accept `guestToken` param for guest channel subscription

**Do NOT add:** socket.io, Firebase, GetStream/Sendbird SDK, `uuid` package, Redis session store for guests.

### Expected Features

**Must have (table stakes for v3.0):**
- Guest opens chat without redirect to `/uviity` — industry standard (Crisp, Tidio, Intercom)
- Guest session persists across page refresh via localStorage
- Guest shown as "Гість" in admin (not null/blank)
- Admin close → buyer sees real-time "Чат завершено" + locked composer
- Auth users can access conversation history from within the widget

**Should have (differentiators for v3.0):**
- In-widget history drawer (slide-in panel, not a new page)
- Guest → account migration on login (no history loss)
- File attachments for auth users (images + PDF)

**Defer (post-v3.0):**
- Read receipts / typing indicators
- Push notifications (Service Worker)
- Chat transcript email
- Multi-admin assignment

### Architecture Approach

The changes are additive. The `Conversation` model gains three new fields (`guestToken`, `isActive`, nullable `userId`) and `Message` gains two attachment fields. `ChatProvider` expands from single-conversation state to multi-conversation aware. New API routes: `/api/chat/guest`, `/api/chat/[id]/close`, `/api/chat/claim`, `/api/chat/attach`, `/api/chat/list`. Four new UI components: `ChatHistoryDrawer`, `ConversationListItem`, `ChatAttachmentInput`, `ChatAttachmentPreview`.

**Major components:**
1. **Schema migration** — foundation for all other features; must be Phase 46
2. **Pusher guest auth extension** — enables real-time for anonymous users
3. **ChatProvider multi-conversation state** — enables history drawer and switching
4. **Cloudinary signed upload endpoint** — enables file attachments securely

### Critical Pitfalls

1. **`userId @unique` not removed** — creating a second conversation throws a unique constraint error; schema migration in Phase 46 is a hard prerequisite for CHAT-05/07/08.
2. **Guest Pusher channel 403** — `private-*` channels require session; extend `/api/pusher/auth` to accept `guestToken` or guests get no real-time updates.
3. **Unsigned Cloudinary preset** — allows anonymous arbitrary uploads; use signed uploads with a strict `chat-attachments` preset.
4. **Multiple `isActive: true` conversations** — add a Prisma filtered unique constraint and use `$transaction` in `createNewConversation`.
5. **Mobile: drawer inside Sheet conflict** — on mobile, history drawer must be a `view: "messages" | "history"` state switch, not a side-slide panel.

---

## Implications for Roadmap

### Phase 46: Schema Foundation + Guest Chat

**Rationale:** `Conversation.userId @unique` removal unblocks ALL later features. Guest chat is the headline feature and requires this migration. "Гість" label is a low-cost add in the same phase.
**Delivers:** Guest users can chat without registering; session persists via localStorage; admin sees "Гість"
**Implements:** Schema migration, `/api/chat/guest`, Pusher guest auth, `ChatProvider` guest mode
**Avoids:** Pitfall 1 (unique constraint) and Pitfall 2 (Pusher 403)

### Phase 47: Chat Lifecycle Control

**Rationale:** Depends on Phase 46 schema. Admin close + real-time notification + guest-to-account claim are a logical group — all touch conversation lifecycle.
**Delivers:** Admin can close chats with real-time update to buyer; guest conversation migrates to account on login; "Почати новий чат" after closure
**Implements:** `/api/chat/[id]/close`, Pusher `conversation:closed` event, `/api/chat/claim`, Better Auth post-login hook, `ArchivedChatBanner` update
**Avoids:** Pitfall 4 (race condition on claim), Pitfall 5 (admin close not real-time), Pitfall 9 (multiple active conversations)

### Phase 48: History Drawer

**Rationale:** Depends on Phase 47 (multi-conversation per user). UI-heavy; isolated from file attachments.
**Delivers:** Auth users see conversation history in an in-widget drawer; can switch and start new chats
**Implements:** `ChatHistoryDrawer`, `ConversationListItem`, `/api/chat/list`, `ChatProvider` multi-conversation state
**Avoids:** Pitfall 8 (stale messages on switch), Pitfall 10 (mobile layout conflict)

### Phase 49: File Attachments

**Rationale:** Independent of Phase 48; can be planned/executed in parallel. Signed upload security is non-negotiable.
**Delivers:** Auth users and admin can send images (jpg/png/webp) and PDFs in chat
**Implements:** Cloudinary signed upload endpoint, `ChatAttachmentInput`, `ChatAttachmentPreview`, `Message` attachment fields render
**Avoids:** Pitfall 6 (unsigned preset), Pitfall 7 (client-only file type validation)

### Phase Ordering Rationale

- Phase 46 first: schema migration is a hard dependency for all other features
- Phase 47 second: builds on Phase 46 schema; closes the lifecycle gap
- Phases 48 + 49 independent: drawer depends on Phase 47; file attachments are orthogonal and can be parallelized

### Research Flags

- **Phase 46:** Verify Prisma `@@unique` removal generates correct migration SQL for Neon (no downtime)
- **Phase 47:** Verify Better Auth post-login hook API for injecting `claimGuestConversation`
- **Phase 49:** Verify Cloudinary signed upload signature generation matches current SDK version

Phases with standard patterns (skip research-phase):
- **Phase 48:** shadcn Drawer + list pattern; mirrors existing admin ConversationList

---

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| Stack | HIGH | Minimal additions; well-documented |
| Features | HIGH | Codebase read confirms existing state; industry patterns verified |
| Architecture | HIGH | All integration points identified from codebase |
| Pitfalls | HIGH | Stack-specific with concrete prevention strategies |

**Overall confidence:** HIGH

### Gaps to Address

- **Better Auth post-login hook API:** Verify exact API during Phase 47 planning.
- **Prisma filtered unique index syntax:** Verify `@@unique` with `where` clause works in Prisma 7; fallback: enforce in service layer with transaction.

---

## Sources

### Primary (HIGH confidence)
- Codebase: `src/components/chat/`, `src/server/services/chat.service.ts`, `prisma/schema.prisma`
- `.planning/PROJECT.md` — v3.0 requirements and stack
- [Pusher — Authenticating users](https://pusher.com/docs/channels/server_api/authenticating-users/)
- [Cloudinary — Authenticated uploads](https://cloudinary.com/documentation/upload_images)
- [Crisp — Session continuity](https://docs.crisp.chat/guides/chatbox-sdks/web-sdk/session-continuity/)

### Secondary (MEDIUM confidence)
- [Baymard — Live Chat UX](https://baymard.com/blog/live-chat-usability-issues) — widget drawer pattern
- [Logto — Guest mode and account migration](https://blog.logto.io/implement-guest-mode-with-logto)
- [GetStream — Authless users](https://getstream.io/chat/docs/react/authless_users/)

---
*Research completed: 2026-05-24*
*Ready for roadmap: yes*
