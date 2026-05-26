---
phase: 49-file-attachments
plan: "03"
subsystem: chat
tags: [chat, attachments, cloudinary, ui, composer, message-bubble, pusher]
dependency_graph:
  requires:
    - 49-01 (ChatAttachment type, sign endpoint)
    - 49-02 (validator, service, route with attachments)
  provides:
    - Paperclip button in ChatComposer (auth-only, T-49-08)
    - Paperclip button in AdminChatComposer (always visible)
    - signAndUpload helper: sign → Cloudinary direct upload
    - Client-side file validation (type + size, Ukrainian errors)
    - Pending file preview with remove button
    - MessageBubble renders image inline and PDF as download link
    - Pusher real-time delivery includes attachments in both providers
  affects:
    - src/components/chat/chat-composer.tsx
    - src/components/chat/message-bubble.tsx
    - src/components/chat/chat-provider.tsx
    - src/components/chat/admin-chat-provider.tsx
tech_stack:
  added: []
  patterns:
    - useRef for hidden file input click delegation
    - signAndUpload top-level async helper shared by both composers
    - Optimistic attachment message: attachments field propagated to appendMessage
    - MessageBubble conditional render: body.length > 0 guard avoids empty bubble
    - Pusher PusherMessagePayload extended with attachments?: ChatAttachment[]
key_files:
  created: []
  modified:
    - src/components/chat/chat-composer.tsx
    - src/components/chat/message-bubble.tsx
    - src/components/chat/chat-provider.tsx
    - src/components/chat/admin-chat-provider.tsx
decisions:
  - signAndUpload is a module-level function shared by both composers (not a hook) — avoids duplication with no side effects
  - Paperclip button disabled when pendingFile !== null — prevents double-attachment
  - AdminChatComposer paperclip has no hasSession guard — admin is always authenticated
  - File preview shows below error section, file error shows below preview
  - Image attachments wrapped in <a> so tap opens full size
  - PDF attachments use download attribute for direct download
metrics:
  duration: "~12 min"
  completed: "2026-05-26T19:00:00Z"
  tasks_completed: 2
  tasks_total: 3
  files_changed: 4
---

# Phase 49 Plan 03: File Attachments — UI Layer Summary

**One-liner:** Paperclip button added to buyer and admin chat composers with signed Cloudinary upload flow, client-side validation, and MessageBubble extended to render image attachments inline and PDF attachments as download links.

## Tasks Completed

| # | Task | Status | Commit |
|---|------|--------|--------|
| 1 | Extend Pusher handlers + update MessageBubble for attachment rendering | Done | c85cdbc |
| 2 | Add paperclip + upload flow to ChatComposer and AdminChatComposer | Done | 5f70f3a |
| 3 | Human UAT — verify full attachment flow | Awaiting checkpoint | — |

## What Was Built

### Task 1 — Pusher Handler Extension + MessageBubble

**`src/components/chat/chat-provider.tsx`:**
- Imported `ChatAttachment` from `@/types/chat`
- Added `attachments?: ChatAttachment[]` to `PusherMessagePayload` type
- `handleMessage` now passes `attachments: payload.attachments` to `appendMessage`

**`src/components/chat/admin-chat-provider.tsx`:**
- Same changes: `ChatAttachment` import, `PusherMessagePayload.attachments?`, and `appendMessage` call updated

**`src/components/chat/message-bubble.tsx`:**
- Imported `Paperclip` from `lucide-react`
- Text bubble wrapped in conditional: `{message.body.length > 0 ? ... : null}` — avoids empty bubble for attachment-only messages
- Attachments section below text: images render as `<img>` wrapped in `<a target="_blank">` with `max-w-[200px] max-h-[200px] rounded-md object-contain`; PDFs render as `<a download>` with Paperclip icon + filename
- Pending opacity applied to attachment wrapper as well

### Task 2 — ChatComposer + AdminChatComposer Attachment Flow

**`src/components/chat/chat-composer.tsx`:**

New module-level constants and helper:
- `MAX_FILE_SIZE = 10 * 1024 * 1024` (10 MB)
- `ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "application/pdf"]`
- `signAndUpload(file: File): Promise<ChatAttachment>` — POSTs to `/api/chat/upload/sign`, uploads to `https://api.cloudinary.com/v1_1/${cloudName}/${resourceType}/upload` via FormData

`ChatComposer` changes:
- Added `useRef` for hidden `<input type="file">` click delegation
- Added `pendingFile`, `fileError` state
- `hasSession` destructured from `useChat()`
- `canSubmit` updated: allows `pendingFile !== null` in addition to `trimmed.length > 0`
- `handleFileSelect`: validates type (Ukrainian error) and size (Ukrainian error), sets `pendingFile`
- `send()`: calls `signAndUpload(pendingFile)` before POST; `attachments` included in optimistic message and fetch body
- Paperclip button + hidden file input rendered only when `hasSession` (T-49-08 mitigation)
- Pending file preview with remove button rendered below error display

`AdminChatComposer` changes:
- Same state (`pendingFile`, `fileError`, `fileInputRef`), same `handleFileSelect`, same `signAndUpload` call
- Paperclip button always rendered (no `hasSession` guard — admin is always authenticated)
- `canSend` updated: `trimmed.length > 0 || pendingFile !== null`
- `attachments` included in optimistic message and fetch body

## Deviations from Plan

None — both tasks executed exactly as specified in the plan.

## Known Stubs

None — all attachment wiring is complete. Cloudinary upload requires `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME` env var and a configured `chat-attachments` upload preset; these are runtime configuration, not code stubs.

## Threat Flags

No new security surface beyond plan threat model:
- T-49-08 mitigated: paperclip button rendered only when `hasSession === true`; guest cannot reach the sign endpoint
- T-49-09 accepted: client-side validation is UX only; server enforces via `chatAttachmentSchema`
- T-49-10 accepted: Cloudinary URLs in chat are intentionally shared

## Self-Check: PASSED

### Modified files exist:
- `src/components/chat/chat-composer.tsx` — FOUND (contains `signAndUpload`, `Paperclip`, `pendingFile`)
- `src/components/chat/message-bubble.tsx` — FOUND (contains `Paperclip`, `attachment.resourceType`)
- `src/components/chat/chat-provider.tsx` — FOUND (contains `ChatAttachment` import, `attachments: payload.attachments`)
- `src/components/chat/admin-chat-provider.tsx` — FOUND (contains `ChatAttachment` import, `attachments: payload.attachments`)

### Commits verified:
- c85cdbc — `feat(49-03): extend Pusher handlers and MessageBubble for attachment rendering` ✓
- 5f70f3a — `feat(49-03): add paperclip upload flow to ChatComposer and AdminChatComposer` ✓
