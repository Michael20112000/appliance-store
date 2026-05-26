---
phase: 49-file-attachments
reviewed: 2026-05-26T16:02:38Z
depth: standard
files_reviewed: 14
files_reviewed_list:
  - prisma/migrations/20260526153218_chat_message_attachments/migration.sql
  - prisma/schema.prisma
  - src/app/api/chat/messages/route.test.ts
  - src/app/api/chat/messages/route.ts
  - src/app/api/chat/upload/sign/route.test.ts
  - src/app/api/chat/upload/sign/route.ts
  - src/components/chat/admin-chat-provider.tsx
  - src/components/chat/chat-composer.tsx
  - src/components/chat/chat-provider.tsx
  - src/components/chat/message-bubble.tsx
  - src/server/services/chat.service.ts
  - src/server/validators/chat.ts
  - src/server/validators/chat.test.ts
  - src/types/chat.ts
findings:
  critical: 3
  warning: 3
  info: 1
  total: 7
status: issues_found
---

# Phase 49: Code Review Report

**Reviewed:** 2026-05-26T16:02:38Z
**Depth:** standard
**Files Reviewed:** 14
**Status:** issues_found

## Summary

Phase 49 adds file attachment support to the chat system: a signed-upload flow via Cloudinary, a new `attachments` JSONB column, updated validators and service layer, and UI changes across the composer and message-bubble components. The foundational design (sign-then-upload, optimistic UI, JSONB storage) is sound. However, three security/correctness issues must be resolved before shipping.

The most critical gap is that the attachment URL stored in the database is entirely user-controlled: any string that passes the Zod `url()` check will be persisted and then rendered directly in `<img src>` and `<a href>` tags for all participants. This allows a malicious user to store arbitrary third-party or data: URLs. Two additional critical issues are the double invocation of `getCloudinaryConfig()` (which calls `getEnv()` and reconfigures the SDK a second time on each sign request) and the total absence of server-side `publicId` prefix enforcement that ties the stored asset back to the actual upload.

---

## Critical Issues

### CR-01: Attachment URL not restricted to Cloudinary — stored verbatim and rendered unfiltered

**File:** `src/server/validators/chat.ts:6`

**Issue:** `url: z.string().url().max(2000)` accepts any syntactically valid URL. The value is stored in the `attachments` JSONB column and later rendered directly in `message-bubble.tsx` as `<img src={attachment.url}>` (line 62) and `<a href={attachment.url}>` (lines 56 and 71). There is no check that the URL belongs to the project's Cloudinary account or even to `res.cloudinary.com`. Any authenticated or guest-with-token user can craft a POST to `/api/chat/messages` with an `attachments` array containing an arbitrary URL (e.g., a tracking pixel on a third-party server, an internal network address, or a `javascript:` URL escaped through a future browser quirk). The rendered `<img>` will eagerly load the foreign URL for every viewer of the conversation.

**Fix:**
```typescript
// src/server/validators/chat.ts
const CLOUDINARY_URL_RE =
  /^https:\/\/res\.cloudinary\.com\/[a-z0-9_-]+\/(image|raw|video)\/upload\//i;

export const chatAttachmentSchema = z.object({
  publicId: z
    .string()
    .min(1)
    .max(500)
    .regex(/^chat\//, "publicId must be under the 'chat/' folder"),
  resourceType: z.enum(["image", "raw"]),
  url: z
    .string()
    .url()
    .max(2000)
    .refine(
      (val) => CLOUDINARY_URL_RE.test(val),
      "url must be a Cloudinary delivery URL",
    ),
  filename: z.string().min(1).max(255),
  bytes: z.number().int().positive().max(10_485_760),
});
```

---

### CR-02: `signUploadParams` calls `getCloudinaryConfig()` a second time, silently re-entering a path that mutates module-level state

**File:** `src/lib/cloudinary.ts:43` / `src/app/api/chat/upload/sign/route.ts:18-31`

**Issue:** `route.ts` calls `getCloudinaryConfig()` (line 18) to retrieve `apiKey` and `cloudName` for the response body, then immediately calls `signUploadParams(...)` (line 29). `signUploadParams` internally calls `getCloudinaryConfig()` again (line 43 of `cloudinary.ts`). The `configured` boolean guards the `cloudinary.config({...})` call, so the SDK is not reconfigured, but `getEnv()` is invoked twice per request and the function re-runs all validation logic. More concretely, if the environment changes between the two calls (e.g., in a test environment where env is mocked per-call), the two calls can return inconsistent values — the `apiKey` put in the response body could differ from the `apiSecret` used to sign. In production this is a latent inconsistency risk.

**Fix:** Refactor `signUploadParams` to accept `apiSecret` as a parameter (removing the hidden dependency), and call `getCloudinaryConfig()` once in the route:

```typescript
// src/lib/cloudinary.ts
export function signUploadParams(
  paramsToSign: Record<string, string | number>,
  apiSecret: string,
): string {
  return cloudinary.utils.api_sign_request(paramsToSign, apiSecret);
}

// src/app/api/chat/upload/sign/route.ts
const { apiKey, apiSecret, cloudName } = config; // already fetched above
const signature = signUploadParams({ timestamp, upload_preset: "chat-attachments" }, apiSecret);
```

---

### CR-03: Guest users can send attachment-only messages (body = "", attachments set) but the upload sign endpoint returns 401 for them — creates an inconsistent state

**File:** `src/app/api/chat/upload/sign/route.ts:9` / `src/components/chat/chat-composer.tsx:199`

**Issue:** The UI correctly hides the attachment button for guests (`{hasSession ? <input …/> : null}`, line 199 of `chat-composer.tsx`), but the *server* does not enforce this constraint. The POST `/api/chat/messages` route accepts `attachments` for any authenticated or guest-token request (lines 89 and 145 of `route.ts`). A guest with a valid `guestToken` can craft a request directly with a pre-computed `attachments` array and it will be persisted. Meanwhile the sign endpoint (`assertBuyerApi`) blocks unauthenticated requests. This means the only practical path for a guest to obtain a signed upload URL is compromised (they cannot), but a guest who intercepts a signed URL from a session-authenticated request (or constructs a Cloudinary URL using publicly known credentials) can inject attachments. Combined with CR-01, this is particularly dangerous. The server-side send route must reject `attachments` for guest senders:

```typescript
// src/app/api/chat/messages/route.ts — guest branch (around line 81)
if (!session?.user) {
  if (!parsed.data.guestToken) {
    return Response.json({ error: "UNAUTHORIZED" }, { status: 401 });
  }
  // Guests cannot upload files — attachment sign endpoint requires a session.
  if (parsed.data.attachments?.length) {
    return Response.json({ error: "ATTACHMENTS_NOT_ALLOWED_FOR_GUESTS" }, { status: 403 });
  }
  // ... existing sendMessage call
}
```

---

## Warnings

### WR-01: Attachment-only messages produce an empty conversation preview in the inbox

**File:** `src/server/services/chat.service.ts:243`

**Issue:** `messagePreview(input.body)` is called with `input.body` which is `""` for attachment-only messages. The function returns `""`, so `lastMessagePreview` is set to an empty string. The admin inbox will show a blank preview line for any conversation whose last message is an attachment with no text.

**Fix:**
```typescript
function messagePreview(body: string, hasAttachments: boolean): string {
  const trimmed = body.trim();
  if (!trimmed && hasAttachments) return "📎 Вкладення";
  if (trimmed.length <= MESSAGE_PREVIEW_MAX) return trimmed;
  return `${trimmed.slice(0, MESSAGE_PREVIEW_MAX - 1)}…`;
}

// Call site:
const preview = messagePreview(input.body, (input.attachments?.length ?? 0) > 0);
```

---

### WR-02: `mapMessageDto` casts `attachments` from `Prisma.JsonValue` to `ChatAttachment[]` without runtime validation

**File:** `src/server/services/chat.service.ts:82-84`

**Issue:** The cast `message.attachments as unknown as ChatAttachment[]` bypasses type safety entirely. If the stored JSON does not conform to `ChatAttachment[]` (e.g., data written by a migration, a direct DB edit, or a future schema change), the service silently returns malformed objects. Downstream consumers (`message-bubble.tsx`) will then access `attachment.url`, `attachment.publicId`, etc. on potentially undefined values.

**Fix:** Parse through the validator at the boundary, discarding invalid entries rather than crashing:

```typescript
import { chatAttachmentSchema } from "@/server/validators/chat";

// In mapMessageDto:
attachments: Array.isArray(message.attachments)
  ? (message.attachments as unknown[])
      .map((item) => chatAttachmentSchema.safeParse(item))
      .filter((r) => r.success)
      .map((r) => r.data)
  : undefined,
```

---

### WR-03: `signUploadParams` call in `route.ts` is not wrapped in the same try/catch that guards `getCloudinaryConfig`

**File:** `src/app/api/chat/upload/sign/route.ts:29`

**Issue:** `getCloudinaryConfig()` is called in a try/catch that handles `CloudinaryNotConfiguredError` (lines 18-27). The subsequent `signUploadParams(...)` call (line 29) internally calls `getCloudinaryConfig()` again (see `cloudinary.ts:43`). If `getCloudinaryConfig()` throws `CloudinaryNotConfiguredError` on the second call (e.g., due to the `configured` module-level flag being reset in tests, or a future change removing the flag), this second throw is not caught and will propagate as an unhandled 500 error instead of the expected 503.

**Fix:** Move `signUploadParams` inside the try block, or restructure to avoid the double call (see CR-02 fix which eliminates the internal `getCloudinaryConfig()` call entirely).

```typescript
let config: ReturnType<typeof getCloudinaryConfig>;
let signature: string;
try {
  config = getCloudinaryConfig();
  signature = signUploadParams({ timestamp, upload_preset: "chat-attachments" });
} catch (error) {
  if (error instanceof CloudinaryNotConfiguredError) {
    return Response.json({ error: "CLOUDINARY_NOT_CONFIGURED" }, { status: 503 });
  }
  throw error;
}
```

---

## Info

### IN-01: `sendMessageSchema` missing test for whitespace-only body with attachments

**File:** `src/server/validators/chat.test.ts`

**Issue:** The test suite covers `body="" + attachments` (attachment-only, passes) and `body="" + no attachments` (fails). It does not test `body="   " + attachments`. Because the schema uses `.trim().default("")` on `body`, a whitespace-only body should be trimmed to `""` and then the refine should pass since attachments are present. This is likely the intended behavior, but the case is untested. If a future change to the schema moves trimming or alters the default, this path could silently start rejecting valid attachment-only messages.

**Fix:** Add a test case:
```typescript
it("accepts whitespace-only body with attachment", () => {
  const result = sendMessageSchema.safeParse({
    body: "   ",
    attachments: [{ /* valid attachment */ }],
  });
  expect(result.success).toBe(true);
  if (result.success) {
    expect(result.data.body).toBe("");
  }
});
```

---

_Reviewed: 2026-05-26T16:02:38Z_
_Reviewer: Claude (gsd-code-reviewer)_
_Depth: standard_
