# Stack Research

**Domain:** Chat enhancements — v3.0 milestone (guest chat, history drawer, file attachments)
**Researched:** 2026-05-24
**Confidence:** HIGH (existing stack locked; additions are minimal and targeted)

---

## Context: Existing Stack (Do Not Re-Research)

Next.js 16, Prisma 7, PostgreSQL (Neon), Tailwind, shadcn/ui, Cloudinary, Better Auth, Pusher — all in production.

---

## Recommended Stack Additions

### New Libraries Needed

| Library | Version | Purpose | Why Recommended |
|---------|---------|---------|-----------------|
| `react-dropzone` | ^14.x | File picker UI in ChatComposer | Handles drag-and-drop + click-to-upload with file type/size filtering; integrates cleanly with controlled inputs |
| `crypto.randomUUID()` | native (Node 16+) | Generate guestToken UUIDs | No install needed; already available in Next.js App Router server context |

**Everything else is already installed.** Cloudinary SDK (`next-cloudinary` or `cloudinary` package) is in use for product images. Pusher client + server are already wired. No new real-time infra needed.

### Supporting Patterns (No New Install)

| Pattern | Purpose | Notes |
|---------|---------|-------|
| `localStorage` key `chat_guest_token` | Persist guest identity across page refreshes | Standard browser storage; no library needed |
| Cloudinary Upload API (existing preset) | Upload chat attachments (images + PDF) | Create a separate `chat-attachments` upload preset in Cloudinary dashboard with PDF allowed |
| Prisma schema migration | `guestToken`, nullable `userId`, `isActive`, attachment fields | Standard `prisma migrate dev` — no new tooling |
| shadcn/ui `Drawer` (already installed) | In-widget history panel | Slide-in within fixed-width widget; already used in mobile chat |

---

## Installation

```bash
# Only new dependency
npm install react-dropzone
```

---

## What NOT to Add

| Avoid | Why | Use Instead |
|-------|-----|-------------|
| `socket.io` | Pusher already handles real-time; two WS systems = conflict | Pusher client (already installed) |
| `aws-sdk` / S3 | Cloudinary is already integrated for media | Cloudinary upload endpoint (extend existing) |
| `@pusher/pusher-js-auth` separate package | Already included in `pusher-js` | `pusher.signin()` or `pusher.config.auth` |
| Firebase / Supabase Realtime | Would duplicate Pusher | Pusher (already in use) |
| `uuid` npm package | Overkill for one UUID | `crypto.randomUUID()` (native) |
| GetStream / Sendbird / Crisp SDK | Full chat platform SDKs | Custom implementation on existing Pusher |
| Separate Redis session store for guests | Premature | localStorage + DB guestToken is sufficient |

---

## Pusher Channel Strategy for Guests

**Problem:** Pusher `private-*` channels require authenticated users (Better Auth session). Guests have no session.

**Solution options:**

| Option | Security | Complexity | Recommendation |
|--------|----------|------------|----------------|
| Public channel `chat-{conversationId}` for guests | Low — anyone who knows the ID can subscribe | LOW | ✗ Not recommended |
| Custom Pusher auth endpoint that accepts guestToken | Medium — validate token against DB | MEDIUM | ✓ **Recommended** |
| Server-Sent Events (SSE) as fallback | Low — no WS auth needed | LOW | ✗ Extra infra |

**Recommended:** Extend the existing Pusher auth endpoint (`/api/pusher/auth`) to accept `guestToken` query param. If `guestToken` matches a `Conversation.guestToken` in DB, authorize the channel. This keeps one auth path.

---

## Cloudinary Config for Chat Attachments

Create a separate upload preset `chat-attachments` in Cloudinary:
- Allowed formats: `jpg,png,webp,pdf`
- Max file size: 10 MB
- Folder: `chat/` (separate from `products/`)
- Resource type: `auto` (handles both images and raw PDF)

Use **signed uploads** (server-side signature) to prevent unauthorized uploads. The existing product upload pattern likely uses unsigned — chat uploads should be signed since they're user-generated content.

---

## Version Compatibility

| Package | Notes |
|---------|-------|
| `react-dropzone ^14` | Compatible with React 18 and Next.js 16 |
| `crypto.randomUUID()` | Available in Node 19+ and all modern browsers; Next.js 16 uses Node 22 |
| Prisma 7 | `String?` nullable fields and removing `@unique` constraint supported without data loss migration (if handled correctly) |

---

## Sources

- Existing codebase: `package.json`, `src/components/chat/`, Prisma schema
- [react-dropzone docs](https://react-dropzone.js.org/) — file picker API
- [Pusher — Authenticating users](https://pusher.com/docs/channels/server_api/authenticating-users/) — custom auth endpoint pattern
- [Cloudinary — Upload API reference](https://cloudinary.com/documentation/image_upload_api_reference) — signed upload, preset config
- MDN: `crypto.randomUUID()` — browser/Node native UUID

---
*Stack research for: Appliance Store Lviv — v3.0 Chat & Engagement*
*Researched: 2026-05-24*
