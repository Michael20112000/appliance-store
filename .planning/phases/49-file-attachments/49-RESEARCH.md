# Phase 49 Research: File Attachments

**Phase**: 49 — File Attachments
**Goal**: Authenticated users and admin can attach image files and PDFs to chat messages; guests have text-only access; uploads go through a signed Cloudinary endpoint

---

## Requirement

**CHAT-09**: Авторизований юзер та адмін можуть прикріплювати файли (jpg/png/webp + pdf, до 10 МБ) у повідомленнях; неавторизовані — тільки текст

---

## Existing Cloudinary Integration

### Pattern: Signed Uploads via CldUploadWidget

The codebase uses `next-cloudinary` v6 (`CldUploadWidget`, `CldImage`) for all image uploads:

- `src/components/admin/product-image-upload.tsx` — uses `CldUploadWidget` with `signatureEndpoint="/api/upload/sign"`
- `src/components/admin/category-image-upload.tsx` — same pattern
- Both pass `options.sources: ["local"]` to restrict to local file picker
- Both call `open()` from the widget's render prop on button click

### Existing Sign Endpoint

`src/app/api/upload/sign/route.ts` — POST endpoint:
- **Currently admin-only** via `assertAdminApi()`
- Accepts `{ paramsToSign: Record<string,string|number> }` in body
- Calls `signUploadParams(paramsToSign)` from `src/lib/cloudinary.ts`
- Returns `{ signature: string }`

### `src/lib/cloudinary.ts`

- `getCloudinaryConfig()` — reads env vars, configures `cloudinary` v2, returns `{ cloudName, apiKey, apiSecret }`
- `signUploadParams(paramsToSign)` — calls `cloudinary.utils.api_sign_request(params, apiSecret)`
- Requires `CLOUDINARY_API_KEY` + `CLOUDINARY_API_SECRET` (optional in env schema; throws `CloudinaryNotConfiguredError` if absent)

### Chat Attachment Approach: Direct Upload (not CldUploadWidget)

**Decision (v3.0)**: File uploads use signed Cloudinary preset `chat-attachments` (not unsigned). Server validates type + size.

Since chat attachments come from authenticated users (not admin-only), we need a new sign endpoint that accepts buyers (auth session present, not necessarily admin). The existing `/api/upload/sign` is admin-only and should stay that way for product/category images.

**New endpoint**: `POST /api/chat/upload/sign`
- Requires authenticated session (buyer or admin, NOT guest)
- Signs params for the `chat-attachments` upload preset
- Returns `{ signature, timestamp, apiKey, cloudName }` so client can POST directly to Cloudinary

**Client flow** (not using CldUploadWidget — direct fetch to Cloudinary):
1. User picks file via `<input type="file" accept="image/jpeg,image/png,image/webp,application/pdf">`
2. Client validates: size ≤ 10 MB, type in allowed set
3. Client requests signature: `POST /api/chat/upload/sign` with `{ timestamp }`
4. Client POSTs directly to `https://api.cloudinary.com/v1_1/{cloud_name}/auto/upload` (FormData: file, api_key, timestamp, signature, upload_preset, resource_type)
5. Cloudinary returns `{ public_id, resource_type, secure_url, format, bytes }`
6. Client embeds `{ publicId, resourceType, url }` into message send request

**Why direct fetch instead of CldUploadWidget**:
- CldUploadWidget uses its own modal/iframe UI; for chat composer we need inline attachment preview with custom styling
- Direct upload gives full control over the file picker and preview experience
- Simpler to integrate into existing `ChatComposer` / `AdminChatComposer` flow

---

## Prisma Schema Changes

### Current Message Model

```prisma
model Message {
  id             String         @id @default(cuid())
  conversationId String
  conversation   Conversation   @relation(fields: [conversationId], references: [id], onDelete: Cascade)
  senderId       String
  senderRole     MessageSender
  body           String
  createdAt      DateTime       @default(now())

  @@index([conversationId, createdAt])
}
```

### Required Change: `attachments` JSON field

Add `attachments Json?` to `Message`. Each attachment is a JSON object:
```ts
type ChatAttachment = {
  publicId: string;        // Cloudinary public_id
  resourceType: "image" | "raw";  // Cloudinary resource_type (pdf → "raw")
  url: string;             // secure_url from Cloudinary
  filename: string;        // original filename for display
  bytes: number;           // file size in bytes
};
```

Storing as `Json?` array (null for text-only messages) avoids a separate Attachment table and keeps reads simple. Attachment count per message is bounded (max 1 per message in v3.0).

**Migration**: Add nullable `attachments Json?` column to `message` table. No data migration needed — existing messages stay null.

---

## `MessageDto` Extension

Current `MessageDto` in `src/types/chat.ts`:
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

Add:
```ts
export type ChatAttachment = {
  publicId: string;
  resourceType: "image" | "raw";
  url: string;
  filename: string;
  bytes: number;
};

export type MessageDto = {
  // ... existing fields ...
  attachments?: ChatAttachment[];
};
```

---

## Validation

### Client-side (pre-upload)
- MIME type must be one of: `image/jpeg`, `image/png`, `image/webp`, `application/pdf`
- File size: `file.size <= 10 * 1024 * 1024` (10 MB)
- Show error immediately if invalid; do not call sign endpoint

### Server-side (in message POST handler)
- `sendMessageSchema` gains optional `attachments` field: array of `ChatAttachment` shapes
- Validate: max 1 attachment per message (v3.0 scope), `resourceType` in `["image","raw"]`, `publicId` non-empty string, `bytes <= 10_485_760`

### Server-side (in sign endpoint)
- The signed upload uses the `chat-attachments` upload preset which is configured in Cloudinary Dashboard to restrict resource types (images + raw) and enforce size limits at the Cloudinary level as a second layer of defense.

---

## UI

### ChatComposer (buyer widget)

- Add paperclip icon button (`Paperclip` from `lucide-react`) to the composer toolbar, to the left of the Send button
- **Hidden for guests**: rendered only when `hasSession` is true (from `useChat()`)
- On click: triggers hidden `<input type="file">` with `accept="image/jpeg,image/png,image/webp,application/pdf"`
- On file select: validate → show inline preview (thumbnail for images, filename for PDFs) → ready to send
- On Send: if attachment pending, upload to Cloudinary first, then include in message body

### AdminChatComposer

- Same pattern: paperclip button always visible (admin is always authenticated)
- Admin is always a valid authenticated user, so no guest-check needed

### MessageBubble

- If `message.attachments` is non-empty, render below the text body:
  - Image: `<img>` or `<CldImage>` using the `url` (direct Cloudinary URL, no transformation needed)
  - PDF: download link showing filename
- `body` for attachment-only messages (no text): use empty string `""` — we must allow sending with attachment but no text body

### Send flow change

`body` can be empty string when there is an attachment. Validator change: min-length 1 → allow empty if `attachments` present.

---

## Sign Endpoint: New vs Extended

**New endpoint** `POST /api/chat/upload/sign`:
- Accessible to authenticated users (buyer or admin) — NOT guests
- Uses `assertBuyerApi()` from `src/lib/permissions.ts` (checks session exists, not just admin)
- Signs params for preset `chat-attachments`
- Includes timestamp generation server-side to avoid clock skew
- Returns: `{ signature, timestamp, apiKey, cloudName }`

The existing `/api/upload/sign` remains admin-only for product/category images.

---

## Pusher Event Extension

The `message:new` Pusher event payload currently carries:
```ts
{ id, conversationId, body, senderRole, createdAt }
```

Add `attachments?: ChatAttachment[]` to the Pusher payload so real-time recipients can render attachments without a refetch.

---

## File Size / Context Budget

- Schema migration: light (add one field)
- New sign endpoint: light
- Service + validator changes: light-medium
- Composer UI changes (both buyer and admin): medium
- MessageBubble changes: light

Splits into 3 plans:
1. **Schema + types + sign endpoint** (Wave 1): Prisma migration, `MessageDto` extension, `ChatAttachment` type, new `/api/chat/upload/sign` endpoint
2. **Service + API changes** (Wave 2): Extend `sendMessageSchema` to accept `attachments`, extend `sendMessage` service to save attachments, extend message GET to return attachments, extend Pusher payload
3. **UI: Composer + MessageBubble** (Wave 3): Paperclip button in `ChatComposer` and `AdminChatComposer`, preview, upload-before-send flow, `MessageBubble` attachment rendering

---

## Package Legitimacy Audit

No new packages required. All dependencies already present:
- `cloudinary` v2 — in use for signing
- `next-cloudinary` v6 — in use for `CldImage`/`CldUploadWidget`
- Attachment upload uses native `fetch` to Cloudinary API (no new SDK)

---

## Environment Variables

No new env vars required. Existing:
- `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME` — already required
- `CLOUDINARY_API_KEY` — already optional (needed for signing)
- `CLOUDINARY_API_SECRET` — already optional (needed for signing)

The `chat-attachments` upload preset must be created in the Cloudinary Dashboard — this is a human action (dashboard config).

---

## Security Considerations

- **STRIDE T-49-01 (Elevation of Privilege)**: Sign endpoint must check session exists; guests must never reach it. Mitigation: `assertBuyerApi()` returns 401 for unauthenticated requests.
- **STRIDE T-49-02 (Tampering)**: Server must re-validate attachment metadata (size, type) from the client payload; client-side validation is UX-only. Mitigation: zod schema on `attachments` field in `sendMessageSchema`.
- **STRIDE T-49-03 (Information Disclosure)**: Cloudinary `chat-attachments` preset should be configured as signed (not unsigned) to prevent direct uploads without a valid signature. This is the Cloudinary Dashboard config step.
- **STRIDE T-49-04 (Denial of Service)**: Max 1 attachment per message in v3.0, 10 MB cap enforced client + server. Rate limiting already in place via existing `enforceRateLimit`.
