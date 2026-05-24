# Pitfalls Research

**Domain:** Chat enhancements — v3.0 (guest chat, history drawer, file attachments, admin chat control)
**Researched:** 2026-05-24
**Confidence:** HIGH (stack-specific; based on codebase audit + known integration risks)

---

## Critical Pitfalls

### Pitfall 1: `Conversation.userId @unique` constraint not removed before CHAT-05/07/08

**Problem:** The current schema has `userId @unique` on `Conversation`. Creating a second conversation for the same user (required by CHAT-05 "start new chat" and CHAT-07 history) will throw a Prisma unique constraint error.

**Prevention:** The schema migration in Phase 46 must remove `@unique` from `userId` AND add `isActive Boolean @default(true)`. All existing `getConversation(userId)` calls must be updated to `findFirst({ where: { userId, isActive: true } })`. Failing to update service calls will return the wrong conversation silently (the first one, not the active one).

**Phase:** Phase 46 (foundation migration)

---

### Pitfall 2: Guest Pusher channel — `private-*` requires Better Auth session

**Problem:** Pusher `private-*` channels require a POST to `/api/pusher/auth` with a valid session cookie. Guests have no session. If the chat widget tries to subscribe to a `private-guest-*` channel without extending the auth endpoint, Pusher returns 403 and the guest gets no real-time updates.

**Prevention:** Extend `/api/pusher/auth` to accept `guestToken` as a request body/header parameter. Verify it against `Conversation.guestToken` in DB before authorizing. Add rate limiting (or just DB lookup) to prevent token enumeration.

**Phase:** Phase 46

---

### Pitfall 3: Guest localStorage token cleared — user loses conversation

**Problem:** If a guest clears browser storage (incognito session ends, explicit clear, browser privacy settings), their `chat_guest_token` is gone. They'll start a new guest conversation and lose their history.

**Prevention:** This is acceptable by design (guests accept ephemeral sessions). Document it in the UI: show a soft prompt "Зареєструйтесь, щоб зберегти історію" in the guest chat widget header or after a few messages. Do NOT try to recover — no fingerprinting.

**Phase:** Phase 46 (add the registration nudge)

---

### Pitfall 4: Race condition on guest → account claim (CHAT-02)

**Problem:** User sends a guest message, then registers/logs in in another tab while the first tab is still open. Two claim attempts may fire simultaneously, or the claim may arrive before the conversation is fully created.

**Prevention:**
1. `claimGuestConversation(userId, guestToken)` must be idempotent — use `UPDATE ... WHERE guestToken = ? AND userId IS NULL` (atomic single write).
2. If `userId` already set on the conversation (double-claim), return success silently.
3. After claim, clear `localStorage` in ALL open tabs — use `window.addEventListener('storage', ...)` to detect the claim event cross-tab.

**Phase:** Phase 47

---

### Pitfall 5: Admin closes chat — buyer widget doesn't update in real time

**Problem:** The existing `archiveConversation()` service sets `status: ARCHIVED` in DB but does NOT emit a Pusher event to the buyer's channel. The buyer only discovers the closed state on next page load. This is the current gap CHAT-04 addresses.

**Prevention:** After updating DB status, explicitly trigger Pusher event on buyer's channel (`private-user-{userId}` or `private-guest-{conversationId}`). The buyer `ChatProvider` must subscribe to `conversation:closed` and update local status reactively. Verify this with Pusher debug console during development.

**Phase:** Phase 47

---

### Pitfall 6: File uploads — unsigned Cloudinary preset allows abuse

**Problem:** If the chat file upload endpoint uses an unsigned Cloudinary upload preset, any user with the preset name can upload arbitrary content directly to Cloudinary, bypassing the app entirely.

**Prevention:** Use **signed uploads** for chat attachments. The Next.js API route generates a short-lived signature before the client uploads. Never expose the Cloudinary API secret to the client. Create a dedicated `chat-attachments` preset (separate from `products`) with strict `allowed_formats: jpg,png,webp,pdf` and `max_file_size: 10485760` (10 MB).

**Phase:** Phase 49

---

### Pitfall 7: File type validation client-only

**Problem:** Restricting file types only in the `<input accept="...">` attribute or `react-dropzone` config is bypassable. A user can rename a `.exe` to `.pdf` and send it.

**Prevention:**
1. Client: filter by extension in `react-dropzone` `accept` prop.
2. Server: check `Content-Type` header AND inspect the first bytes (magic bytes) for the allowed formats using `file-type` npm package, OR rely on Cloudinary's format enforcement (`allowed_formats` in preset).
3. Cloudinary is the final gate — if it rejects the file, return a 400 to the client.

**Phase:** Phase 49

---

### Pitfall 8: `ChatProvider` state growing stale on conversation switch

**Problem:** When the user switches conversations in the history drawer, `ChatProvider` must clear the current messages array and load the new conversation's messages. If messages are loaded lazily (e.g., only the active Pusher channel sends them), switching to an old conversation shows an empty pane until re-fetch completes.

**Prevention:**
1. Load conversation messages via `GET /api/chat/[id]/messages` on switch (not via Pusher replay).
2. Show a loading skeleton while fetching.
3. Do NOT rely on Pusher history — Pusher does not persist message history beyond the last 1 second by default.

**Phase:** Phase 48

---

### Pitfall 9: Multiple `isActive: true` conversations for same user after migration

**Problem:** If `isActive` is added as `@default(true)` for all existing rows, and later a bug in `createNewConversation()` forgets to set `isActive: false` on the old one before creating a new one, `getActiveConversation(userId)` returns undefined or the wrong one (findFirst is non-deterministic without ordering).

**Prevention:**
1. `createNewConversation()` must atomically: (a) set current active conversation `isActive: false`, (b) create new one `isActive: true`, in a Prisma `$transaction`.
2. Add a DB-level partial unique index: `@@unique([userId, isActive], where: isActive = true)` — Prisma 7 supports filtered unique constraints. This makes it physically impossible to have two active conversations per user.

**Phase:** Phase 47 (when new-conversation logic is implemented)

---

### Pitfall 10: In-widget drawer breaks mobile chat sheet layout

**Problem:** On mobile, the existing chat opens as a bottom `Sheet` (full-screen). The history drawer (slide-in panel inside the widget) is designed for the desktop 380×520px fixed widget. On mobile, a "drawer inside a sheet" creates layered overlays that fight each other.

**Prevention:** On mobile (`useIsMobile()` hook), the history drawer should replace the message view entirely (not slide in from the side), and use the Sheet's back-navigation affordance instead of a side panel. Design the drawer as a separate view state in `ChatPanel`: `view: "messages" | "history"` with a back button on mobile.

**Phase:** Phase 48

---

## Security Summary

| Risk | Severity | Mitigation |
|------|----------|-----------|
| Unsigned Cloudinary upload | HIGH | Signed upload endpoint |
| File type bypass | HIGH | Server-side format check + Cloudinary preset |
| Guest token enumeration | MEDIUM | Token is UUID (128-bit entropy); DB lookup on every Pusher auth |
| Admin close via CSRF | MEDIUM | Next.js App Router CSRF protection; add revalidation token |
| Guest flood (spam conversations) | LOW | Rate-limit guest conversation creation by IP |

---
*Pitfalls research for: Appliance Store Lviv — v3.0 Chat & Engagement*
*Researched: 2026-05-24*
