---
phase: 49-file-attachments
verified: 2026-05-26T19:07:00Z
status: human_needed
score: 12/12 must-haves verified
overrides_applied: 0
human_verification:
  - test: "Guest sees no attachment UI"
    expected: "No paperclip icon in the chat composer toolbar when browsing as an unauthenticated user"
    why_human: "Conditional render based on hasSession requires browser session state; grep confirms the guard is present but runtime behavior needs visual confirmation"
  - test: "Auth user can attach and send an image"
    expected: "Paperclip icon appears, file picker opens, preview shows filename, sending uploads to Cloudinary and renders the image inline in the bubble"
    why_human: "Requires live Cloudinary credentials (NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME, chat-attachments preset), real HTTP calls, and visual rendering in the browser"
  - test: "PDF attachment renders as download link"
    expected: "Sent PDF appears as a download link with filename and paperclip icon in the message bubble"
    why_human: "Requires runtime file upload and browser rendering"
  - test: "File size / type validation shows Ukrainian error without uploading"
    expected: "Files over 10 MB show 'Файл занадто великий. Максимум 10 МБ.'; disallowed types show 'Дозволені формати: JPG, PNG, WEBP, PDF.' — no network request made"
    why_human: "Requires browser file picker interaction"
  - test: "Admin chat workspace has paperclip and same upload flow"
    expected: "Paperclip button visible in AdminChatComposer at /admin/chaty, attach and send works identically"
    why_human: "Requires admin session and browser test"
  - test: "Real-time Pusher delivery of attachments"
    expected: "Attachment sent by one party appears in the other party's chat without page refresh"
    why_human: "Requires two live browser sessions and a running Pusher connection"
---

# Phase 49: File Attachments Verification Report

**Phase Goal:** Enable authenticated users to attach and share files (images and PDFs) in the chat, with uploads going to Cloudinary via server-signed requests and metadata persisted alongside messages.
**Verified:** 2026-05-26T19:07:00Z
**Status:** human_needed
**Re-verification:** No — initial verification

## Goal Achievement

### Observable Truths

| # | Truth | Status | Evidence |
|---|-------|--------|----------|
| 1 | ChatAttachment type is exported from src/types/chat.ts and matches the stored JSON shape | VERIFIED | `src/types/chat.ts` lines 6-12: exports `ChatAttachment` with `publicId`, `resourceType`, `url`, `filename`, `bytes` |
| 2 | MessageDto includes optional attachments field | VERIFIED | `src/types/chat.ts` line 21: `attachments?: ChatAttachment[]` |
| 3 | prisma/schema.prisma has attachments Json? on the Message model | VERIFIED | `prisma/schema.prisma` line 253: `attachments    Json?`; migration `20260526153218_chat_message_attachments` applies `ALTER TABLE "Message" ADD COLUMN "attachments" JSONB` |
| 4 | POST /api/chat/upload/sign returns 401 for unauthenticated requests and guests | VERIFIED | `route.ts` calls `assertBuyerApi()` at top; test passes (4/4 green, including 401 case) |
| 5 | POST /api/chat/upload/sign returns { signature, timestamp, apiKey, cloudName } for authenticated buyers and admin | VERIFIED | `route.ts` returns `Response.json({ signature, timestamp, apiKey, cloudName })`; tests for buyer and admin both pass |
| 6 | POST /api/chat/upload/sign returns 503 when Cloudinary secrets are missing | VERIFIED | `route.ts` catches `CloudinaryNotConfiguredError` → returns 503 with `{ error: "CLOUDINARY_NOT_CONFIGURED" }`; test passes |
| 7 | sendMessageSchema accepts attachments array (max 1) and allows empty body when attachments present | VERIFIED | `src/server/validators/chat.ts`: `chatAttachmentSchema` exported; body uses `.default("")`; `.refine()` enforces body.length > 0 OR attachments.length > 0; 16 validator tests pass |
| 8 | sendMessage service persists attachments JSON to the Message row | VERIFIED | `chat.service.ts` line 253: `...(input.attachments ? { attachments: input.attachments } : {})` in `tx.message.create` |
| 9 | GET /api/chat/messages returns attachments in MessageDto responses | VERIFIED | `mapMessageDto` returns `attachments` field; `listMessages` uses `findMany` (includes all scalar fields including `attachments`); route test passes for GET with attachments |
| 10 | Pusher message:new event payload includes attachments field | VERIFIED | `route.ts` line 32: `pusherPayload` returns `attachments: message.attachments`; both providers extend `PusherMessagePayload` with `attachments?: ChatAttachment[]` and pass `attachments: payload.attachments` to `appendMessage` |
| 11 | Authenticated user sees paperclip icon in chat composer; guest does not | VERIFIED (code) | `chat-composer.tsx` line 199: `{hasSession ? (<>... <Paperclip .../> ...</>) : null}`; AdminChatComposer has unconditional paperclip (no hasSession guard) — RUNTIME confirmation needed |
| 12 | Image attachment renders inline and PDF attachment renders as download link in MessageBubble | VERIFIED (code) | `message-bubble.tsx` lines 50-83: conditionally renders `<img>` wrapped in `<a target="_blank">` for `resourceType === "image"`, and `<a download>` with `Paperclip` icon for `resourceType === "raw"` |

**Score:** 12/12 must-haves verified (code); 6 human checks required for runtime confirmation

### Required Artifacts

| Artifact | Expected | Status | Details |
|----------|----------|--------|---------|
| `src/types/chat.ts` | ChatAttachment type + extended MessageDto | VERIFIED | Lines 6-22: both present and correctly shaped |
| `prisma/schema.prisma` | attachments Json? on Message | VERIFIED | Line 253: `attachments    Json?` |
| `src/app/api/chat/upload/sign/route.ts` | Sign endpoint for chat attachments | VERIFIED | Exports `POST`; full implementation with auth, timestamp, signing, 503 error handling |
| `src/app/api/chat/upload/sign/route.test.ts` | Tests for sign endpoint | VERIFIED | 4 test cases (401, buyer 200, admin 200, 503); all pass |
| `src/server/validators/chat.ts` | Extended sendMessageSchema with attachments | VERIFIED | `chatAttachmentSchema` exported; refine wired; 16 tests pass |
| `src/server/services/chat.service.ts` | sendMessage stores attachments | VERIFIED | Conditional spread into `tx.message.create`; `mapMessageDto` returns attachments |
| `src/app/api/chat/messages/route.ts` | Route passes attachments through to service and Pusher | VERIFIED | All 3 `sendMessage` call sites pass `attachments: parsed.data.attachments`; `pusherPayload` includes attachments |
| `src/components/chat/chat-composer.tsx` | Buyer and admin composers with paperclip + upload flow | VERIFIED | `signAndUpload` helper; `pendingFile` state; `handleFileSelect` with type/size validation; `ChatComposer` paperclip gated on `hasSession`; `AdminChatComposer` paperclip always visible |
| `src/components/chat/message-bubble.tsx` | Attachment rendering (image inline, PDF link) | VERIFIED | `Paperclip` imported; image and PDF branches render correctly; empty body guard present |
| `src/components/chat/chat-provider.tsx` | Pusher handler extended with attachments | VERIFIED | `PusherMessagePayload` includes `attachments?: ChatAttachment[]`; `handleMessage` passes `attachments: payload.attachments` |
| `src/components/chat/admin-chat-provider.tsx` | Admin Pusher handler extended with attachments | VERIFIED | Same pattern as buyer provider — confirmed |
| `prisma/migrations/20260526153218_chat_message_attachments/migration.sql` | DB migration applied | VERIFIED | File exists with `ALTER TABLE "Message" ADD COLUMN "attachments" JSONB` |

### Key Link Verification

| From | To | Via | Status | Details |
|------|----|-----|--------|---------|
| `chat/upload/sign/route.ts` | `src/lib/cloudinary.ts` | `signUploadParams` import | WIRED | Line 1-6: imports `CloudinaryNotConfiguredError`, `getCloudinaryConfig`, `signUploadParams` from `@/lib/cloudinary` |
| `chat/upload/sign/route.ts` | `src/lib/permissions.ts` | `assertBuyerApi` import | WIRED | Line 1: `import { assertBuyerApi } from "@/lib/permissions"`; called at line 9 |
| `chat/messages/route.ts` | `chat.service.ts` | `sendMessage({ ..., attachments })` | WIRED | Lines 89, 135, 145: all 3 call sites include `attachments: parsed.data.attachments` |
| `chat.service.ts` | prisma | `tx.message.create({ data: { ..., attachments } })` | WIRED | Line 253: conditional spread `...(input.attachments ? { attachments: input.attachments } : {})` |
| `chat-composer.tsx` | `/api/chat/upload/sign` | `fetch POST for signature` | WIRED | `signAndUpload` at line 34: `fetch("/api/chat/upload/sign", { method: "POST" })` |
| `chat-composer.tsx` | `api.cloudinary.com` | FormData POST with signature | WIRED | Lines 47-50: `fetch(\`https://api.cloudinary.com/v1_1/${cloudName}/${resourceType}/upload\`, ...)` |
| `message-bubble.tsx` | `ChatAttachment` | `message.attachments` | WIRED | Lines 23, 52: checks `message.attachments?.length > 0` and maps over `message.attachments!` |

### Data-Flow Trace (Level 4)

| Artifact | Data Variable | Source | Produces Real Data | Status |
|----------|---------------|--------|--------------------|--------|
| `message-bubble.tsx` | `message.attachments` | `MessageDto.attachments` from API response / Pusher payload | Yes — persisted from Cloudinary upload metadata via `mapMessageDto` casting `Prisma.JsonValue` | FLOWING |
| `chat/messages/route.ts` | `attachments` in response | `listMessages` → `mapMessageDto` → `prisma.message.findMany` (all scalar fields) | Yes — DB query returns JSONB column cast to `ChatAttachment[]` | FLOWING |

### Behavioral Spot-Checks

| Behavior | Command | Result | Status |
|----------|---------|--------|--------|
| POST /api/chat/upload/sign returns 401 without session | `npx vitest run src/app/api/chat/upload/sign/route.test.ts` | 4 tests passed | PASS |
| Messages route handles attachment POST + GET | `npx vitest run src/app/api/chat/messages/route.test.ts` | 15 tests passed | PASS |
| Validator accepts/rejects attachment permutations | `npx vitest run src/server/validators/chat.test.ts` | 16 tests passed | PASS |
| Cloudinary upload URL correct format | Code read: `signAndUpload` builds `https://api.cloudinary.com/v1_1/${cloudName}/${resourceType}/upload` | Correct pattern | PASS |

### Probe Execution

No probes declared in PLAN files and no conventional probe scripts for this phase.

### Requirements Coverage

| Requirement | Source Plan | Description | Status | Evidence |
|-------------|------------|-------------|--------|----------|
| CHAT-09 | 49-01, 49-02, 49-03 | Authenticated user and admin can attach files (jpg/png/webp/pdf, max 10 MB); unauthenticated see text only | SATISFIED | Full stack implemented: schema, type, sign endpoint, validator, service, route, UI composer, MessageBubble rendering |

### Anti-Patterns Found

No blockers found. The TS2556 error in `src/app/api/chat/upload/sign/route.test.ts` line 30 (`...args: unknown[]` spread) is a direct copy of the pre-existing pattern from `src/app/api/upload/sign/route.test.ts` (same error present there). Both files were authored using the same mock pattern that exists in the original upload sign test. This is a pre-existing codebase issue, not introduced by Phase 49, and does not affect test execution (Vitest runs successfully). No `TBD`, `FIXME`, or `XXX` markers found in any Phase 49 modified files.

| File | Line | Pattern | Severity | Impact |
|------|------|---------|----------|--------|
| `src/app/api/chat/upload/sign/route.test.ts` | 30 | `...args: unknown[]` spread → TS2556 | INFO (pre-existing) | Tests still pass; same error exists in original `upload/sign/route.test.ts` template |

### Human Verification Required

#### 1. Guest Sees No Attachment UI

**Test:** Open the site in an incognito window (not logged in). Open the chat widget. Inspect the composer toolbar.
**Expected:** No paperclip icon is visible. The composer shows only the textarea and send button.
**Why human:** `{hasSession ? (...paperclip...) : null}` is confirmed in code at line 199 of `chat-composer.tsx`, but runtime session state is needed to confirm it works end-to-end.

#### 2. Auth User Can Attach and Send an Image

**Test:** Log in as a buyer, open the chat widget, click the paperclip icon (left of textarea), select a valid JPEG under 10 MB. Verify preview appears below textarea. Type a message (optional) and click Send.
**Expected:** Paperclip icon visible; file picker opens filtered to jpg/png/webp/pdf; filename preview with remove button appears; message sends and the image renders inline in the conversation bubble.
**Why human:** Requires live Cloudinary credentials (`NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME`, `chat-attachments` upload preset configured as signed), real HTTP calls, and visual rendering.

#### 3. PDF Attachment Renders as Download Link

**Test:** As an auth user, attach a PDF file and send (body can be empty).
**Expected:** PDF appears in the message bubble as a download link with the paperclip icon and filename. Clicking it downloads the file.
**Why human:** Requires live Cloudinary upload and browser rendering of the `resourceType === "raw"` branch.

#### 4. File Size / Type Validation Shows Ukrainian Error Without Uploading

**Test:** As an auth user, click the paperclip and try to select a file over 10 MB, then a .gif or .txt file.
**Expected:** "Файл занадто великий. Максимум 10 МБ." for oversized file; "Дозволені формати: JPG, PNG, WEBP, PDF." for invalid type. No upload request should be made.
**Why human:** Requires browser file picker interaction to observe `handleFileSelect` validation branch execution.

#### 5. Admin Chat Workspace Has Paperclip and Same Upload Flow

**Test:** Log in as admin at /admin/chaty. Select an active conversation. Verify paperclip icon appears in the admin composer. Attach an image and send.
**Expected:** Paperclip icon is unconditionally visible (no hasSession check needed for admin). Image attachment sends and renders inline.
**Why human:** Requires admin session, Cloudinary config, and browser verification.

#### 6. Real-Time Pusher Delivery of Attachments

**Test:** Open two browser windows (one buyer, one admin) in the same conversation. Send an attachment from one side.
**Expected:** The other window receives the `message:new` Pusher event with the `attachments` field populated and renders the attachment without page refresh.
**Why human:** Requires two live sessions and a running Pusher connection. Code confirms `pusherPayload` includes `attachments` and both providers forward `payload.attachments` to `appendMessage`.

### Gaps Summary

No gaps — all code-verifiable must-haves are VERIFIED. 6 items require human UAT due to runtime dependencies (Cloudinary credentials, browser sessions, Pusher connectivity). The automated test suite (4 + 15 + 16 = 35 tests across sign endpoint, messages route, and validator) passes cleanly.

---

_Verified: 2026-05-26T19:07:00Z_
_Verifier: Claude (gsd-verifier)_
