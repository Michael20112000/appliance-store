---
phase: 49-file-attachments
plan: "02"
subsystem: chat
tags: [chat, attachments, validator, zod, prisma, api, tdd]
dependency_graph:
  requires:
    - 49-01 (ChatAttachment type, Message.attachments Json? schema)
  provides:
    - chatAttachmentSchema Zod schema
    - Extended sendMessageSchema with attachments field and refine
    - sendMessage service stores attachments to DB
    - mapMessageDto returns attachments from DB
    - POST /api/chat/messages accepts and persists attachments
    - GET /api/chat/messages returns attachments in message list
    - Pusher message:new payload includes attachments
  affects:
    - src/server/validators/chat.ts
    - src/server/validators/chat.test.ts
    - src/server/services/chat.service.ts
    - src/app/api/chat/messages/route.ts
    - src/app/api/chat/messages/route.test.ts
tech_stack:
  added: []
  patterns:
    - Zod .refine() for cross-field validation (body OR attachments required)
    - Prisma.JsonValue cast to ChatAttachment[] in mapMessageDto
    - Conditional spread for optional Prisma fields (..attachment ? {attachments} : {})
key_files:
  created: []
  modified:
    - src/server/validators/chat.ts
    - src/server/validators/chat.test.ts
    - src/server/services/chat.service.ts
    - src/app/api/chat/messages/route.ts
    - src/app/api/chat/messages/route.test.ts
decisions:
  - body field uses .default("") not .optional() — keeps SendMessageInput.body as string (not string|undefined)
  - .max(2000) placed before .default("") to avoid ZodDefault chain issue
  - attachments stored via conditional spread (not Prisma.JsonNull) — Prisma treats omitted field as DB null
  - mapMessageDto casts attachments via (as unknown as ChatAttachment[]) — JsonValue has no type narrowing
  - Pusher payload always includes attachments key (undefined when absent) — consumers filter it
metrics:
  duration: "~8 min"
  completed: "2026-05-26T15:43:00Z"
  tasks_completed: 2
  tasks_total: 2
  files_changed: 5
---

# Phase 49 Plan 02: File Attachments — Data Layer and API Summary

**One-liner:** Extended Zod validator with chatAttachmentSchema, sendMessage service to persist attachments JSON, mapMessageDto to return them, and messages route to wire attachments through POST body and Pusher payload.

## Tasks Completed

| # | Task | Status | Commit |
|---|------|--------|--------|
| 1 | Extend sendMessageSchema with attachments field | Done | a26a12e |
| 2 | Extend sendMessage service + mapMessageDto + messages route | Done | dc1b618 |

## What Was Built

### Task 1 — Validator Extension (`src/server/validators/chat.ts`)

- Exported `chatAttachmentSchema` with fields: `publicId` (min 1, max 500), `resourceType` (enum `["image","raw"]`), `url` (url() max 2000), `filename` (min 1, max 255), `bytes` (int positive max 10,485,760)
- `sendMessageSchema`: body changed from `.min(1)` to `.default("")`; `.max(2000)` placed before `.default("")` due to Zod chain constraint
- Added `attachments: z.array(chatAttachmentSchema).max(1, "Максимум 1 вкладення").optional()`
- Added `.refine()`: `body.length > 0 || (attachments?.length ?? 0) > 0` — message: "Потрібне повідомлення або вкладення"
- `SendMessageInput` type updated via `z.infer`
- 16 tests passing (10 new + 6 existing preserved)

### Task 2 — Service + Route Extension

**`src/server/services/chat.service.ts`:**
- Added `import type { Prisma }` and `import type { ChatAttachment }` from their respective paths
- `SendMessageInput` local type gains `attachments?: ChatAttachment[]`
- `mapMessageDto` parameter extended with `attachments?: Prisma.JsonValue | null`; returns `attachments: message.attachments ? cast : undefined`
- `tx.message.create` uses conditional spread: `...(input.attachments ? { attachments: input.attachments } : {})`

**`src/app/api/chat/messages/route.ts`:**
- `pusherPayload` includes `attachments: message.attachments`
- All three `sendMessage` call sites (admin, buyer, guest paths) pass `attachments: parsed.data.attachments`

**`src/app/api/chat/messages/route.test.ts`:**
- `messageDto` gains `attachments: undefined` field
- Added `messageDtoWithAttachment` fixture and `attachment` const
- Updated existing pusher payload assertion to include `attachments: messageDto.attachments`
- 3 new test cases: buyer POST with attachment (201), empty body no attachment (400 VALIDATION_ERROR), GET with attachments in list
- 15 total tests passing (12 existing + 3 new)

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Zod chain ordering: .max() before .default()**
- **Found during:** Task 1 implementation
- **Issue:** `z.string().trim().default("").max(...)` fails at runtime — `ZodDefault` does not have `.max()`. Zod requires string validators before `.default()`
- **Fix:** Reordered to `.trim().max(2000, ...).default("")`
- **Files modified:** `src/server/validators/chat.ts`
- **Commit:** a26a12e

## Self-Check

### Created files exist:
- No new files created in this plan

### Modified files verified:
- `grep -n "attachments" src/server/services/chat.service.ts` → lines 73, 82-83, 226, 253 ✓
- `grep -n "attachments" src/app/api/chat/messages/route.ts` → lines 32, 89, 135, 145 ✓
- `grep -n "chatAttachmentSchema" src/server/validators/chat.ts` → exported ✓

### Commits verified:
- a26a12e — `feat(49-02): extend sendMessageSchema with chatAttachmentSchema and attachments field` ✓
- dc1b618 — `feat(49-02): extend sendMessage service, mapMessageDto, and messages route with attachments` ✓

## Self-Check: PASSED

## Known Stubs

None — all attachment handling is fully wired through validator → service → route → Pusher payload.

## Threat Flags

No new security surface introduced beyond what's in the plan threat model:
- T-49-05 mitigated: `chatAttachmentSchema` enforces bytes ≤ 10 MB, resourceType enum, url() validation
- T-49-06 mitigated: `.max(1)` on attachments array prevents bulk attachment abuse
