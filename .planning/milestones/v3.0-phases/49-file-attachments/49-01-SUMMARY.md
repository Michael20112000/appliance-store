---
phase: 49-file-attachments
plan: "01"
subsystem: chat
tags: [chat, attachments, cloudinary, prisma, typescript]
dependency_graph:
  requires: []
  provides:
    - ChatAttachment type in src/types/chat.ts
    - MessageDto.attachments field
    - Message.attachments Json? in schema.prisma
    - POST /api/chat/upload/sign endpoint
  affects:
    - prisma/schema.prisma
    - src/types/chat.ts
    - src/app/api/chat/upload/sign/route.ts
tech_stack:
  added: []
  patterns:
    - ChatAttachment TypeScript type for Cloudinary upload metadata
    - Json? Prisma field for flexible attachment storage
    - assertBuyerApi() auth gate for buyer+admin routes
    - getCloudinaryConfig() + signUploadParams() for server-side Cloudinary signing
key_files:
  created:
    - src/app/api/chat/upload/sign/route.ts
    - src/app/api/chat/upload/sign/route.test.ts
    - prisma/migrations/20260526153218_chat_message_attachments/migration.sql
  modified:
    - src/types/chat.ts
    - prisma/schema.prisma
decisions:
  - ChatAttachment stores publicId, resourceType, url, filename, bytes — matches Cloudinary upload response shape
  - attachments stored as Json? (not separate table) — flexible, no FK overhead for read-heavy chat
  - Sign endpoint uses assertBuyerApi (buyers + admin) not assertAdminApi — chat attachments are buyer-initiated
  - timestamp generated server-side at signing time (Math.round(Date.now() / 1000))
  - upload_preset hardcoded to "chat-attachments" — dedicated preset per plan spec
metrics:
  duration: "~10 min"
  completed: "2026-05-26T18:34:00Z"
  tasks_completed: 3
  tasks_total: 3
  files_changed: 5
---

# Phase 49 Plan 01: File Attachments — Data Foundation Summary

**One-liner:** ChatAttachment type, Prisma schema extended with attachments Json?, migration applied, and POST /api/chat/upload/sign endpoint signing uploads for authenticated buyers and admin.

## Tasks Completed

| # | Task | Status | Commit |
|---|------|--------|--------|
| 1 | Extend MessageDto with ChatAttachment type + update Prisma schema | Done | ad36375 |
| 2 | Run Prisma migration (human checkpoint) | Done | c192d79 |
| 3 | Create POST /api/chat/upload/sign endpoint + tests | Done | 20f004f |

## What Was Built

### Task 1 — Type and Schema Changes

**`src/types/chat.ts`:**
- Exported new `ChatAttachment` type with fields: `publicId: string`, `resourceType: "image" | "raw"`, `url: string`, `filename: string`, `bytes: number`
- Added `attachments?: ChatAttachment[]` to `MessageDto`
- No other types changed; `MessageSender` and `ConversationStatus` imports untouched

**`prisma/schema.prisma`:**
- Added `attachments    Json?` to `Message` model after `body` field
- No other models or fields changed

### Task 2 — Prisma Migration

Migration `20260526153218_chat_message_attachments` applied by human:
- `ALTER TABLE "Message" ADD COLUMN "attachments" JSONB;`
- Prisma client regenerated after migration

### Task 3 — Sign Endpoint

**`src/app/api/chat/upload/sign/route.ts`:**
- `assertBuyerApi()` gate — 401 for unauthenticated requests
- Generates `timestamp = Math.round(Date.now() / 1000)` server-side
- `getCloudinaryConfig()` — throws `CloudinaryNotConfiguredError` → 503 response
- Signs `{ timestamp, upload_preset: "chat-attachments" }` via `signUploadParams()`
- Returns `{ signature, timestamp, apiKey, cloudName }`

**`src/app/api/chat/upload/sign/route.test.ts`:**
- 4 tests: 401 unauthenticated, 200 buyer, 200 admin, 503 missing Cloudinary config
- Mocks `@/lib/auth`, `next/headers`, `@/lib/cloudinary` (signUploadParams + getCloudinaryConfig)
- All 4 tests pass

## Deviations from Plan

None — all three tasks executed as planned. Pre-existing TypeScript errors (128 errors in unrelated files) not introduced by this plan.

## Self-Check

### Created files exist:
- `src/app/api/chat/upload/sign/route.ts` ✓
- `src/app/api/chat/upload/sign/route.test.ts` ✓
- `prisma/migrations/20260526153218_chat_message_attachments/migration.sql` ✓

### Modified files verified:
- `grep -n "ChatAttachment" src/types/chat.ts` → line 6 (type declaration), line 21 (MessageDto field) ✓
- `grep -n "attachments" prisma/schema.prisma` → `attachments    Json?` ✓

### Commits verified:
- ad36375 — `feat(49-01): extend MessageDto with ChatAttachment type + update Prisma schema` ✓
- c192d79 — `chore(49-01): add Prisma migration for chat message attachments` ✓
- 20f004f — `feat(49-01): add POST /api/chat/upload/sign endpoint for chat attachments` ✓

## Self-Check: PASSED

## Known Stubs

None — all plan artifacts are fully implemented.

## Threat Flags

| Flag | File | Description |
|------|------|-------------|
| threat_flag: new-api-endpoint | src/app/api/chat/upload/sign/route.ts | POST /api/chat/upload/sign — mitigated by T-49-01 (assertBuyerApi auth gate) and T-49-02 (signed preset) per plan threat model |
