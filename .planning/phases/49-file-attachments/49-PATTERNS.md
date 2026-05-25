# Phase 49 Patterns: File Attachments

## Relevant Codebase Patterns

---

### 1. Cloudinary Sign Endpoint Pattern

**Source**: `src/app/api/upload/sign/route.ts`

```ts
// Admin-only sign endpoint pattern
import { assertAdminApi } from "@/lib/permissions";
import { signUploadParams } from "@/lib/cloudinary";

export async function POST(request: Request) {
  const unauthorized = await assertAdminApi();
  if (unauthorized) return unauthorized;

  const body = await request.json();
  const paramsToSign = (body as { paramsToSign?: unknown })?.paramsToSign;
  // validate paramsToSign shape...
  const signature = signUploadParams(paramsToSign as Record<string, string | number>);
  return Response.json({ signature });
}
```

**For Phase 49**: New endpoint `/api/chat/upload/sign` uses `assertBuyerApi()` instead (allows any authenticated user).

The sign function:
```ts
// src/lib/cloudinary.ts
export function signUploadParams(paramsToSign: Record<string, string | number>): string {
  const { apiSecret } = getCloudinaryConfig();
  return cloudinary.utils.api_sign_request(paramsToSign, apiSecret);
}
```

---

### 2. Permissions Pattern

**Source**: `src/lib/permissions.ts`

```ts
/** API routes: JSON 401 for unauthenticated buyers (no redirect). */
export async function assertBuyerApi(): Promise<Response | null> {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) {
    return Response.json({ error: "UNAUTHORIZED" }, { status: 401 });
  }
  return null;
}
```

Use `assertBuyerApi()` for the new chat sign endpoint — accepts both buyer and admin (any authenticated session).

---

### 3. Chat Composer Pattern

**Source**: `src/components/chat/chat-composer.tsx`

Both `ChatComposer` (buyer) and `AdminChatComposer` use the same structure:
- `useChat()` / `useAdminChat()` for context
- `appendMessage` for optimistic update (creates pending message)
- `replaceOptimisticMessage` on success, `removeOptimisticMessage` on failure
- `fetch("/api/chat/messages", { method: "POST", body: JSON.stringify({...}) })`
- `isSending` state to prevent double-submit
- `setBody("")` before await, restore on error

**Extension for attachments**:
- Add `pendingFile: File | null` state
- Add `attachmentPreview: { url: string; name: string } | null` state
- Before calling the messages POST: if `pendingFile`, call sign endpoint, then POST to Cloudinary
- Include `attachments: [{ publicId, resourceType, url, filename, bytes }]` in the messages POST body

---

### 4. MessageDto Pattern

**Source**: `src/types/chat.ts`

```ts
export type MessageDto = {
  id: string;
  conversationId: string;
  body: string;
  senderRole: MessageSender;
  senderId: string;
  createdAt: string;
};
```

Extend with:
```ts
export type ChatAttachment = {
  publicId: string;
  resourceType: "image" | "raw";
  url: string;
  filename: string;
  bytes: number;
};

export type MessageDto = {
  // ... all existing fields ...
  attachments?: ChatAttachment[];
};
```

---

### 5. sendMessage Service Pattern

**Source**: `src/server/services/chat.service.ts`

```ts
type SendMessageInput = {
  senderId: string;
  senderRole: MessageSender;
  body: string;
  conversationId?: string;
  userId?: string;
  productContext?: ProductContext;
  guestToken?: string;
};

export async function sendMessage(input: SendMessageInput): Promise<MessageDto> {
  // ... rate limit, resolve conversation, assertConversationOpen ...
  const message = await prisma.$transaction(async (tx) => {
    const created = await tx.message.create({
      data: {
        conversationId: conversation.id,
        senderId: input.senderId,
        senderRole: input.senderRole,
        body: input.body,
      },
    });
    // update conversation lastMessage fields...
    return created;
  });
  return mapMessageDto(message);
}
```

**Extension**: Add `attachments?: ChatAttachment[]` to `SendMessageInput` and pass to `tx.message.create({ data: { ..., attachments: input.attachments ?? undefined } })`. `mapMessageDto` must also extract `attachments`.

---

### 6. sendMessageSchema Validator Pattern

**Source**: `src/server/validators/chat.ts`

```ts
export const sendMessageSchema = z.object({
  body: z.string().trim().min(1).max(2000),
  conversationId: z.string().cuid().optional(),
  productId: z.string().cuid().optional(),
  guestToken: z.string().uuid().optional(),
});
```

**Extension**: Add `attachments` field and relax `body` constraint:
```ts
const chatAttachmentSchema = z.object({
  publicId: z.string().min(1).max(500),
  resourceType: z.enum(["image", "raw"]),
  url: z.string().url().max(2000),
  filename: z.string().min(1).max(255),
  bytes: z.number().int().positive().max(10_485_760),
});

export const sendMessageSchema = z.object({
  body: z.string().trim().max(2000).default(""),
  conversationId: z.string().cuid().optional(),
  productId: z.string().cuid().optional(),
  guestToken: z.string().uuid().optional(),
  attachments: z.array(chatAttachmentSchema).max(1).optional(),
}).refine(
  (data) => data.body.length > 0 || (data.attachments?.length ?? 0) > 0,
  { message: "Потрібне повідомлення або вкладення" }
);
```

---

### 7. Pusher Payload Pattern

**Source**: `src/app/api/chat/messages/route.ts`

```ts
function pusherPayload(message: MessageDto) {
  return {
    id: message.id,
    conversationId: message.conversationId,
    body: message.body,
    senderRole: message.senderRole,
    createdAt: message.createdAt,
  };
}
```

Extend to include `attachments`:
```ts
function pusherPayload(message: MessageDto) {
  return {
    id: message.id,
    conversationId: message.conversationId,
    body: message.body,
    senderRole: message.senderRole,
    createdAt: message.createdAt,
    attachments: message.attachments,
  };
}
```

The Pusher handler in `chat-provider.tsx` and `admin-chat-provider.tsx` must also spread `attachments` when calling `appendMessage`.

---

### 8. `mapMessageDto` Pattern

**Source**: `src/server/services/chat.service.ts`

```ts
function mapMessageDto(message: {
  id: string;
  conversationId: string;
  body: string;
  senderRole: MessageSender;
  senderId: string;
  createdAt: Date;
}): MessageDto {
  return {
    id: message.id,
    conversationId: message.conversationId,
    body: message.body,
    senderRole: message.senderRole,
    senderId: message.senderId,
    createdAt: message.createdAt.toISOString(),
  };
}
```

Extend to include `attachments` field from the Prisma model. The `attachments` field in Prisma is `Json?`, which means it comes back as `Prisma.JsonValue | null`. Cast to `ChatAttachment[] | undefined`:
```ts
import type { ChatAttachment } from "@/types/chat";

function mapMessageDto(message: { ...; attachments: Prisma.JsonValue | null }): MessageDto {
  return {
    // ... existing fields ...
    attachments: message.attachments
      ? (message.attachments as unknown as ChatAttachment[])
      : undefined,
  };
}
```

---

### 9. MessageBubble Rendering Pattern

**Source**: `src/components/chat/message-bubble.tsx`

Currently renders only `message.body`. Extend to render attachments below the body:

- Image attachments: use `<img src={attachment.url} alt={attachment.filename} ...>` (direct Cloudinary URL, no transformation, max-w + rounded)
- PDF attachments: `<a href={attachment.url} download={attachment.filename} target="_blank">📎 {attachment.filename}</a>`
- When `body` is empty string, do not render the text bubble div — render only the attachment

---

### 10. Guest Restriction Pattern

In `chat-provider.tsx`:
```ts
const { hasSession } = useChat();
```

The paperclip button renders only when `hasSession === true`. Guests see no attachment UI.

In `ChatComposer`:
```tsx
{hasSession ? (
  <Button type="button" size="icon" onClick={() => fileInputRef.current?.click()} aria-label="Прикріпити файл">
    <Paperclip className="size-4" />
  </Button>
) : null}
<input
  ref={fileInputRef}
  type="file"
  accept="image/jpeg,image/png,image/webp,application/pdf"
  className="hidden"
  onChange={handleFileSelect}
/>
```

---

### 11. Test Pattern (Vitest)

**Source**: `src/app/api/upload/sign/route.test.ts`, `src/app/api/chat/messages/route.test.ts`

Consistent pattern:
```ts
import { beforeEach, describe, expect, it, vi } from "vitest";

const getSession = vi.fn();
vi.mock("@/lib/auth", () => ({ auth: { api: { getSession: (...args) => getSession(...args) } } }));
vi.mock("next/headers", () => ({ headers: vi.fn(async () => new Headers()) }));
// ... mock service functions

describe("POST /api/...", () => {
  beforeEach(() => vi.clearAllMocks());
  it("returns 401 when unauthenticated", async () => { ... });
  it("returns 200 for authenticated buyer", async () => { ... });
});
```

---

### 12. Direct Cloudinary Upload (no SDK)

For the chat attachment flow, the client does a direct fetch to Cloudinary after getting a signature:

```ts
async function uploadToCloudinary(
  file: File,
  { signature, timestamp, apiKey, cloudName }: SignResponse
): Promise<{ publicId: string; resourceType: string; url: string; bytes: number }> {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("api_key", apiKey);
  formData.append("timestamp", String(timestamp));
  formData.append("signature", signature);
  formData.append("upload_preset", "chat-attachments");

  const resourceType = file.type === "application/pdf" ? "raw" : "image";
  const res = await fetch(
    `https://api.cloudinary.com/v1_1/${cloudName}/${resourceType}/upload`,
    { method: "POST", body: formData }
  );
  if (!res.ok) throw new Error("UPLOAD_FAILED");
  const data = await res.json();
  return {
    publicId: data.public_id as string,
    resourceType: data.resource_type as string,
    url: data.secure_url as string,
    bytes: data.bytes as number,
  };
}
```

---

### 13. Prisma Schema Migration Pattern

**Source**: existing migration in `prisma/migrations/`

Pattern:
1. Edit `prisma/schema.prisma` — add `attachments Json?` to `model Message`
2. Run `npx prisma migrate dev --name chat-message-attachments` — creates migration SQL
3. Migration SQL will be `ALTER TABLE "message" ADD COLUMN "attachments" JSONB;`

No seed changes needed. Existing messages get `null` attachments (nullable column).
