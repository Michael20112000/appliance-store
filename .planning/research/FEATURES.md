# Feature Research

**Domain:** Chat enhancements — v3.0 milestone on existing Ukrainian appliance-store chat system
**Researched:** 2026-05-24
**Confidence:** HIGH (codebase read + industry UX patterns verified across multiple sources)

---

## Context: What Already Exists

The v2.x chat system is fully built and operational:

- `ChatProvider` / `ChatProviderGate` — server-side session detection, Pusher real-time, optimistic messages
- `ChatPanel` — floating widget (desktop: fixed 380×520px bottom-right; mobile: bottom Sheet)
- `ChatComposer` / `AdminChatComposer` — text-only send, 2000-char limit, Enter-to-send
- `ArchivedChatBanner` — shown when `status === "ARCHIVED"`, composer placeholder = "Діалог закрито"
- `admin-chat-provider` + `/admin/chaty` — full admin inbox, conversation list, real-time Pusher subscription
- `ConversationList` — unread highlight, context-menu lifecycle actions (archive / delete)
- DB schema: `Conversation` is **one-per-user** (`userId @unique`), `Message` belongs to conversation

**Current auth gate:** `openPanel()` redirects guests to `/uviity` (login). Guests cannot chat at all.

**Key constraint the schema imposes:** `Conversation.userId` is `@unique` — one conversation per registered user. Guest conversations need either a separate identity scheme or a nullable userId + guestToken approach.

---

## Feature Landscape

### Table Stakes (Users Expect These)

Features that — given the existing chat exists and is being extended — users will expect to work correctly.

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| Guest can open and send messages without registering | Removing the registration wall is the entire point of CHAT-01; competitors (Crisp, Tidio, Intercom) all support anonymous chat | MEDIUM | Needs guestToken (UUID) stored in `localStorage`; new DB column or separate model |
| Guest session persists across page refreshes | Users close and reopen the browser tab; losing the conversation mid-session = broken UX | LOW | `localStorage` key survives page refresh; cookie as fallback for cross-tab |
| Guest identified as "Гість" in admin panel | Admin needs to know who they are talking to; displaying null/blank is confusing | LOW | `buyerName` fallback logic in `listConversationsForAdmin`; no new DB field needed if handled in service layer |
| Admin-closed chat shows clear "Чат завершено" state to user | Industry standard — Help Scout, Zendesk, LiveAgent all show a visible banner + disable composer on closure | LOW | `ArchivedChatBanner` already exists but says "Діалог закрито магазином"; update copy or augment |
| After chat is closed, user can start a new one | Expected "start over" affordance; Intercom, Crisp both offer this | LOW | "Почати новий чат" button inside the banner |
| Auth user chat history accessible from within widget | Users expect to be able to revisit prior conversations without leaving the page | HIGH | Requires multi-conversation model (see Anti-Features for scope guard) |
| File attachments for auth users | Established expectation in support chat — Zendesk supports 20 MB; Dynamics 365 supports 20–128 MB | HIGH | Cloudinary upload for images; PDF pass-through; size guard (10 MB recommended for this use case) |
| Guest cannot attach files | Matches PROJECT constraint; prevents anonymous spam/abuse | LOW | Composer gate: `if (!hasSession) { /* no attachment UI */ }` |

### Differentiators (Competitive Advantage)

Features within v3.0 scope that go beyond baseline expectations for a small local shop chat.

| Feature | Value Proposition | Complexity | Notes |
|---------|-------------------|------------|-------|
| In-widget drawer for conversation history | Chat history without leaving the product page; differentiates from Crisp/Tidio flat single-thread on small e-commerce sites | MEDIUM | Slide-in panel *inside* the 380px widget (not a full-page route); auth only |
| Guest-to-account chat migration on login | No data loss: guest's messages become part of their account history | MEDIUM | Token-matching on login/register flow; `guestToken` column on Conversation + migration step |
| New conversation from history drawer | Auth user can initiate a fresh chat topic without wiping current context | LOW | "Новий чат" button in drawer; requires multi-conversation model |

### Anti-Features (Commonly Requested, Often Problematic)

| Feature | Why Requested | Why Problematic | Alternative |
|---------|---------------|-----------------|-------------|
| Multi-conversation for guests | Completeness | Guest sessions are ephemeral; multiple anonymous threads create admin noise and linkage complexity | One guest = one active conversation; closure creates a new one |
| Video / voice chat | "Full support" | Scope explosion, WebRTC infra, separate permission model | Text + file attachments covers 95% of pre-sale questions |
| Read receipts (double-tick) | Chat-app familiarity | `buyerLastReadAt` exists but surfacing it as "seen" ticks adds UI complexity and real-time sync overhead | Unread dot on FAB is sufficient signal |
| Chat transcript email to guest | Common in support tools | Guests have no email on record; would require capturing email upfront (adds friction, contradicts guest-first goal) | Show history in-widget on return if token still in localStorage |
| Typing indicators | "Feels alive" | Pusher presence channels add auth complexity; marginal UX gain for a one-admin shop | Real-time message delivery is enough |
| File attachments for guests | Requested by edge case | Abuse vector; anonymous uploads require stricter validation and moderation | Auth users and admin only — matches PROJECT decision |
| Admin-to-admin internal notes / threads | CRM feature | Not a store of this scale; separate model from public chat | Admin can use the chat to leave notes if needed (or post-v3 feature) |
| Push notifications (browser / mobile) | "Don't miss messages" | Service Worker registration complexity; Safari limitations on iOS | Unread badge on FAB (`unreadFromStore` already implemented) |

---

## Feature Dependencies

```
[CHAT-01: Guest conversation]
    └──requires──> DB: guestToken on Conversation (nullable userId or separate guest model)
    └──requires──> localStorage: guestToken persistence
    └──requires──> API: unauthenticated POST /api/chat/messages path

[CHAT-02: Guest → account link]
    └──requires──> CHAT-01 (guest token in localStorage)
    └──requires──> Auth hook on login/register (Better Auth post-login callback)
    └──requires──> Service: claimGuestConversation(userId, guestToken)

[CHAT-03: "Гість" label in admin]
    └──requires──> CHAT-01 (guest conversation created)
    └──requires──> listConversationsForAdmin: handle null userId / null user record

[CHAT-04: Admin closes chat → user sees "Чат завершено"]
    └──requires──> archiveConversation() already exists in chat.service.ts
    └──requires──> Pusher event: conversation:status-changed broadcast to buyer channel
    └──note──> ArchivedChatBanner + composer already handle ARCHIVED status; gap is real-time push on closure

[CHAT-05: "Почати новий чат" after closure]
    └──requires──> CHAT-04 (chat is closed)
    └──requires──> For auth users: new Conversation (breaks userId @unique constraint — needs schema change)
    └──requires──> For guests: clear localStorage guestToken, generate new one

[CHAT-06 + CHAT-07: In-widget drawer with chat history]
    └──requires──> CHAT-05 schema change (multi-conversation per user)
    └──requires──> listConversationsForBuyer() service method (does not exist yet)
    └──requires──> ChatProvider: add conversations[] list state + selectedConversationId
    └──note──> Auth users only; guest sees no drawer

[CHAT-08: New chat from drawer]
    └──requires──> CHAT-06/07 (drawer exists)
    └──requires──> createNewConversation(userId) service method
    └──requires──> ChatProvider: switch active conversationId

[CHAT-09: File attachments]
    └──requires──> Message model: add attachmentUrl, attachmentType fields (schema migration)
    └──requires──> Cloudinary: upload endpoint for images (jpg/png/webp); PDF storage
    └──requires──> Composer: file input UI (paperclip icon), preview, progress indicator
    └──requires──> Auth gate: hasSession check before rendering attachment UI
    └──requires──> Admin composer: matching file input
    └──enhances──> CHAT-07 (attachments visible in history)
```

### Dependency Notes

- **CHAT-05 breaks the current `@unique` constraint on `Conversation.userId`.** This is the most impactful schema change in the milestone. It must be resolved before CHAT-07 and CHAT-08 can be implemented. Options: drop the unique constraint and add an `isActive` flag, or keep the constraint and create `ArchivedConversation` copies. The cleanest approach is removing `@unique` from `userId` and adding an `isActive: Boolean @default(true)` column so `getActiveConversationForBuyer(userId)` remains a single-row query.
- **CHAT-01 needs a guest identity model.** The current `Conversation.userId` is non-nullable (implied by `@unique` and foreign key to User). A `guestToken: String? @unique` column is needed alongside a nullable `userId`. This is a single migration but touches the core table.
- **CHAT-04 real-time notification gap.** Archiving currently works server-side but the buyer's open widget does not receive a Pusher event when admin archives. The buyer only discovers closure on next page load (status comes from server-side `initialConversationStatus`). A `conversation:archived` Pusher event on the private buyer channel is needed.
- **CHAT-09 is independent of CHAT-01–08** except for the auth gate. File attachments can be phased separately and do not block guest chat or history drawer implementation.

---

## MVP Definition (v3.0 Scope)

All nine CHAT requirements are in-scope for v3.0. Priority ordering by risk/dependency:

### Phase 1 — Foundation (unblocks everything)

- [x] Schema migration: `guestToken` on Conversation, nullable `userId`, remove `@unique` on `userId`, add `isActive` flag
- [x] CHAT-01 — Guest conversation (localStorage token, text-only, unauthenticated POST)
- [x] CHAT-03 — "Гість" label in admin

### Phase 2 — Lifecycle control

- [x] CHAT-04 — Admin closes chat → real-time Pusher event → buyer widget shows "Чат завершено"
- [x] CHAT-05 — "Почати новий чат" button in ArchivedChatBanner
- [x] CHAT-02 — Guest → account migration on login/register

### Phase 3 — History drawer (auth users)

- [x] CHAT-06 — Menu button in widget header → slide-in drawer inside widget
- [x] CHAT-07 — Drawer: conversation list with switch
- [x] CHAT-08 — "Новий чат" from drawer

### Phase 4 — File attachments

- [x] CHAT-09 — File attachments (jpg/png/webp + pdf); auth users + admin; guest blocked

### Add After v3.0 Validation

- [ ] Read receipts / "seen" indicator — when users report messages feel unanswered
- [ ] Transcript export — when admin needs audit trail
- [ ] Chat notification email for guest — if guest email captured at send time

### Future Consideration (v4+)

- [ ] Push notifications (Service Worker + FCM)
- [ ] Typing indicators (Pusher presence channels)
- [ ] Chat assignment to specific staff members (multi-admin)

---

## Feature Prioritization Matrix

| Feature | User Value | Implementation Cost | Priority |
|---------|------------|---------------------|----------|
| CHAT-01 Guest chat | HIGH | MEDIUM | P1 — schema + token system |
| CHAT-03 "Гість" in admin | MEDIUM | LOW | P1 — display-only change |
| CHAT-04 Admin closes, buyer notified | HIGH | LOW | P1 — Pusher event gap |
| CHAT-05 New chat after closure | HIGH | LOW | P1 — button + new conversation |
| CHAT-02 Guest → account link | MEDIUM | MEDIUM | P1 — auth hook required |
| CHAT-06/07 History drawer | MEDIUM | HIGH | P2 — multi-conversation schema |
| CHAT-08 New chat from drawer | LOW | LOW | P2 — depends on CHAT-07 |
| CHAT-09 File attachments | MEDIUM | HIGH | P2 — schema + Cloudinary upload |

**Priority key:** P1 = must ship for v3.0 core; P2 = should ship in v3.0 but can phase after P1.

---

## "Done" Definitions (User-Perspective Acceptance)

### CHAT-01 (Guest chat)
- Unauthenticated user opens chat widget → sees composer (not redirect to /uviity)
- Guest sends a message → message appears in widget and in admin inbox
- Guest refreshes the page → previous messages still visible (token in localStorage)
- Guest clears localStorage → treated as new guest on next open

### CHAT-02 (Guest → account link)
- Guest sends messages, then registers or logs in
- After login, their guest conversation appears as their account conversation
- The guest messages are preserved (not lost)
- Admin sees the same conversation now attributed to the registered user's name/email

### CHAT-03 ("Гість" in admin)
- Admin inbox shows "Гість" (not blank, not null, not "Покупець") for unregistered users
- Guest avatar initials = "Г" or similar fallback

### CHAT-04 (Admin closes chat)
- Admin clicks "Завершити чат" in the admin workspace
- Within ~1 second, buyer's open widget shows "Чат завершено" banner
- Buyer's composer is disabled (cannot type or send)
- On next page load (for buyers not currently in widget), the closed state persists

### CHAT-05 (New chat after closure)
- Closed-state banner includes a "Почати новий чат" button
- Clicking it starts a new conversation (new DB record, fresh message list)
- Old conversation is preserved in history (visible in drawer for auth users)

### CHAT-06/07 (In-widget drawer)
- A menu icon (hamburger or list icon) appears in the chat panel header, beside the × button
- Clicking it slides in a panel *inside* the widget (not a new page or full-screen modal)
- Panel shows a list of past conversations (name/preview/date)
- Clicking a conversation switches the message view to that thread
- Guest users do not see the menu icon

### CHAT-08 (New chat from drawer)
- Drawer includes a "Новий чат" button
- Clicking it creates a new conversation and switches to it in the widget

### CHAT-09 (File attachments)
- Auth user sees a paperclip/attachment icon in the composer
- Clicking it opens a file picker filtered to jpg/png/webp/pdf
- Selected file shows a preview (image thumbnail or filename for PDF) before sending
- Sending uploads to Cloudinary and posts a message with the attachment
- Recipient (admin or user) sees the image inline or a PDF download link
- File size limit is visible (or error shown on exceed)
- Guest users see no attachment UI in composer

---

## Scope-Creep Risks for This Milestone

The following were considered and explicitly excluded from v3.0:

1. **Multi-admin chat assignment** — single admin shop; out of scope
2. **Chat-to-order linking for guests** — guests have no order history; link can be added in v3.x after guest migration is stable
3. **Email notifications** — guests have no email; auth users get real-time; emails are post-v3.0
4. **Video/voice** — not in PROJECT.md, high complexity
5. **Chat search within history** — nice but low priority; drawer list with preview is sufficient for a shop with moderate chat volume
6. **File attachments for guests** — explicitly excluded in PROJECT.md to prevent spam

---

## Sources

- `/Users/michael_ivashko/WebStormProjects/web/appliance-store/.planning/PROJECT.md` — v3.0 requirements, stack, constraints (HIGH)
- Codebase audit: `src/components/chat/`, `src/server/services/chat.service.ts`, `src/types/chat.ts`, `prisma/schema.prisma` (HIGH)
- [NN/g — The User Experience of Customer-Service Chat: 20 Guidelines](https://www.nngroup.com/articles/chat-ux/) — closure UX, session continuity (HIGH)
- [Help Scout — What Happens When You End a Live Chat](https://docs.helpscout.com/article/1228-end-a-live-chat) — admin closure behavior (HIGH)
- [Crisp — Session Continuity (Web Chat SDK)](https://docs.crisp.chat/guides/chatbox-sdks/web-sdk/session-continuity/) — guest token / session merge pattern (HIGH)
- [Logto — Implement guest mode and convert to users](https://blog.logto.io/implement-guest-mode-with-logto) — anonymous → authenticated migration flow (MEDIUM)
- [GetStream — Authless Users (React chat)](https://getstream.io/chat/docs/react/authless_users/) — guest identity model in production chat SDKs (MEDIUM)
- [Zendesk — Sending files in a chat](https://support.zendesk.com/hc/en-us/articles/4408828723738-Sending-files-in-a-chat) — file attachment size limits and auth-gate precedent (HIGH)
- [Microsoft Learn — Configure file attachment capability](https://learn.microsoft.com/en-us/dynamics365/customer-service/administer/configure-file-attachment) — attachment size / type configuration (MEDIUM)
- [Baymard — Three Popular Live Chat Approaches](https://baymard.com/blog/live-chat-usability-issues) — floating widget UX patterns (MEDIUM)
- [Qwen/issue#1444 — Guest session history lost on login](https://github.com/QwenLM/Qwen/issues/1444) — UX pitfall: history loss on account creation without migration (MEDIUM)

---
*Feature research for: Appliance Store Lviv — v3.0 Chat & Engagement milestone*
*Researched: 2026-05-24*
