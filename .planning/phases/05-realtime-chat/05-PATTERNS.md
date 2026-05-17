# Phase 5: Realtime Chat - Pattern Map

**Mapped:** 2026-05-17
**Files analyzed:** 28 (create/modify for Phase 5)
**Analogs found:** 24 / 28

## File Classification

| New/Modified File | Role | Data Flow | Closest Analog | Match Quality |
|-------------------|------|-----------|----------------|---------------|
| `prisma/schema.prisma` | model | CRUD schema | same file (`Cart`, `Order`) | exact |
| `src/lib/permissions.ts` | middleware | request-response | same file + `assertAdminApi` | exact |
| `src/lib/env.ts` | config | transform | same file (Cloudinary optional vars) | exact |
| `src/lib/pusher-server.ts` | utility | pub-sub | `src/lib/cloudinary.ts` | exact |
| `src/lib/pusher-client.ts` | utility | pub-sub | `src/lib/cloudinary.ts` (singleton init) | role-match |
| `src/lib/chat/search-params.ts` | utility | transform | `src/lib/catalog/search-params.ts` | exact |
| `src/server/validators/chat.ts` | utility | transform | `src/server/validators/cart.ts` | exact |
| `src/server/validators/chat.test.ts` | test | transform | `src/server/validators/order.test.ts` | exact |
| `src/server/services/chat.service.ts` | service | CRUD + transaction + pub-sub | `cart.service.ts` + `admin-order.service.ts` | exact |
| `src/server/services/chat.service.test.ts` | test | unit | `admin-order.service.test.ts` | exact |
| `src/server/actions/chat.actions.ts` | controller | request-response | `src/server/actions/cart.actions.ts` | exact |
| `src/app/api/chat/messages/route.ts` | route | request-response | `src/app/api/upload/sign/route.ts` | exact |
| `src/app/api/chat/pusher/auth/route.ts` | route | request-response | `src/app/api/upload/sign/route.ts` | exact |
| `src/app/(admin)/admin/chaty/page.tsx` | route | CRUD read | `src/app/(admin)/admin/zamovlennia/page.tsx` | exact |
| `src/app/(storefront)/layout.tsx` | route | request-response | same file + `CartPendingMergeGate` | exact |
| `src/app/(storefront)/kabinet/page.tsx` | route | request-response | same file | exact |
| `src/app/(storefront)/tovar/[slug]/page.tsx` | route | request-response | same file (`AddToCartButton` + `hasSession`) | exact |
| `src/components/admin/admin-nav.tsx` | component | transform | same file + `CartNavLink` badge | exact |
| `src/components/chat/chat-provider.tsx` | provider | pub-sub + event-driven | `cart-pending-merge.tsx` + `catalog-filters.tsx` (nuqs) | role-match |
| `src/components/chat/chat-fab.tsx` | component | request-response | `add-to-cart-button.tsx` (guest gate) | role-match |
| `src/components/chat/chat-panel.tsx` | component | request-response | `src/components/ui/sheet.tsx` usage in `store-header.tsx` | role-match |
| `src/components/chat/chat-composer.tsx` | component | request-response | `checkout-form.tsx` (submit + errors) | partial |
| `src/components/chat/open-chat-button.tsx` | component | request-response | `add-to-cart-button.tsx` | exact |
| `src/components/chat/admin-chat-inbox.tsx` | component | CRUD read | `orders-table.tsx` + admin zamovlennia page | role-match |
| `src/components/chat/conversation-list.tsx` | component | transform | `order-history-list.tsx` | role-match |
| `src/components/chat/chat-thread.tsx` | component | pub-sub | `chat-provider.tsx` (subscribe site) | partial |
| `e2e/chat-auth.spec.ts` | test | e2e | `e2e/cart-auth.spec.ts` | exact |
| `e2e/chat-persistence.spec.ts` | test | e2e | `e2e/checkout.spec.ts` (reload persistence) | role-match |
| `e2e/helpers/pusher.ts` | test | utility | `e2e/helpers/admin.ts` (`hasCloudinarySecrets`) | exact |

---

## Pattern Assignments

### `src/lib/permissions.ts` (middleware, request-response)

**Analog:** same file — extend `assertAdminApi` pattern for buyer API routes.

**Session guards for RSC** (lines 6-28):

```typescript
export async function requireBuyer(callbackPath = "/koszyk") {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    const safe = sanitizeCallbackUrl(callbackPath, "/koszyk");
    redirect(`/uviity?callbackUrl=${encodeURIComponent(safe)}`);
  }

  return session;
}

export async function requireAdmin() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user || session.user.role !== "admin") {
    redirect("/uviity");
  }

  return session;
}
```

**API guard (JSON 401, fetch-friendly)** (lines 31-42):

```typescript
export async function assertAdminApi(): Promise<Response | null> {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user || session.user.role !== "admin") {
    return Response.json({ error: "UNAUTHORIZED" }, { status: 401 });
  }

  return null;
}
```

**Planner add:** `assertBuyerApi()` — mirror `assertAdminApi`; return `401` when `!session?.user`. Use in `POST /api/chat/messages` (buyer) and `POST /api/chat/pusher/auth`. For admin send/reply, either `assertAdminApi()` or shared `assertChatParticipantApi()` that returns session + role.

**Apply to:** `messages/route.ts`, `pusher/auth/route.ts`; optional thin wrapper in route before service.

---

### `src/app/api/upload/sign/route.ts` → chat API routes (route, request-response)

**Analog:** `src/app/api/upload/sign/route.ts`

**Route handler skeleton** (lines 1-42):

```typescript
import { assertAdminApi } from "@/lib/permissions";
// ...

export async function POST(request: Request) {
  const unauthorized = await assertAdminApi();
  if (unauthorized) {
    return unauthorized;
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "INVALID_BODY" }, { status: 400 });
  }

  // validate body shape, then service/lib call
  try {
    // ...
    return Response.json({ signature });
  } catch (error) {
    if (error instanceof CloudinaryNotConfiguredError) {
      return Response.json(
        { error: "CLOUDINARY_NOT_CONFIGURED" },
        { status: 503 },
      );
    }
    throw error;
  }
}
```

**Chat adaptations:**

| Route | Auth | Status codes |
|-------|------|--------------|
| `api/chat/pusher/auth` | `assertBuyerApi()` OR admin session | `403` forbidden channel; `400` invalid body |
| `api/chat/messages` | buyer `assertBuyerApi()`; admin branch for STORE replies | `201` + DTO; `429` rate limit; `503` if Pusher env missing |

**Pusher auth route:** After session check, parse `socket_id` + `channel_name` (support JSON and form — pusher-js may send either). Validate channel regex `^private-conversation-[a-z0-9]+$`, load conversation, verify buyer `userId` or `role === 'admin'`, then `getPusherServer().authorizeChannel(socketId, channelName)`.

**Messages route:** Zod parse → `chat.service.sendMessage` → trigger after DB success; map `ChatRateLimitError` → `429` with Ukrainian message.

---

### `src/server/services/chat.service.ts` (service, CRUD + pub-sub)

**Analogs:** `src/server/services/cart.service.ts` (get-or-create), `src/server/services/admin-order.service.ts` (admin list + transactions)

**Imports / prisma** (cart.service lines 1-3):

```typescript
import type { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/db";
```

**getOrCreate pattern** (cart.service lines 40-58) — copy for `getOrCreateConversation(userId)`:

```typescript
export async function getOrCreateCart(userId: string) {
  const existing = await prisma.cart.findUnique({ where: { userId } });
  if (existing) return existing;

  try {
    return await prisma.cart.create({ data: { userId } });
  } catch (error) {
    const code =
      error &&
      typeof error === "object" &&
      "code" in error &&
      typeof error.code === "string"
        ? error.code
        : null;
    if (code === "P2002") {
      return prisma.cart.findUniqueOrThrow({ where: { userId } });
    }
    throw error;
  }
}
```

**Admin list + sort** (admin-order.service lines 125-137):

```typescript
export async function listAllOrders(
  filter: AdminOrderListFilter = "all",
): Promise<AdminOrderSummaryDto[]> {
  const orders = await prisma.order.findMany({
    where: statuses ? { status: { in: statuses } } : undefined,
    orderBy: { createdAt: "desc" },
    include: { items: true },
  });

  return orders.map(mapOrderSummary);
}
```

Use `orderBy: { lastMessageAt: "desc" }` or `updatedAt: "desc"` for `listConversationsForAdmin()`.

**Transaction + domain errors** (admin-order.service lines 164-176):

```typescript
export async function updateOrderStatus(
  orderId: string,
  newStatus: OrderStatus,
): Promise<{ orderNumber: string }> {
  return prisma.$transaction(async (tx) => {
    const order = await tx.order.findUnique({
      where: { id: orderId },
      include: { items: true },
    });

    if (!order) {
      throw new Error(ORDER_NOT_FOUND);
    }
    // ...
  });
}
```

**sendMessage flow:** `$transaction` → create message → update `lastMessage*` denorm → **after** transaction `getPusherServer().trigger(...)`. Export string constants (`CONVERSATION_NOT_FOUND`, `CHAT_RATE_LIMIT`, `FORBIDDEN`) like `INVALID_STATUS_TRANSITION`.

**Unread helpers:** Pure functions + Prisma `count` where `lastMessageSender === BUYER && lastMessageAt > adminLastReadAt` for nav badge (compute in RSC, not client subscribe-all).

---

### `src/server/services/chat.service.test.ts` (test, unit)

**Analog:** `src/server/services/admin-order.service.test.ts`

**Vitest + prisma mock** (lines 1-22):

```typescript
import { describe, expect, it, vi } from "vitest";
import { prisma } from "@/lib/db";
// ...

vi.mock("@/lib/db", () => ({
  prisma: {
    order: {
      count: vi.fn(),
      findMany: vi.fn(),
    },
    product: {
      count: vi.fn(),
    },
  },
}));
```

**Test structure** (lines 24-38):

```typescript
describe("getAdminDashboardStats", () => {
  it("returns pending, product counts, and recent orders", async () => {
    vi.mocked(prisma.order.count).mockResolvedValueOnce(4);
  });
});
```

**Apply to chat tests:** Mock `conversation`, `message` models; test `getOrCreateConversation` P2002 path, rate limit count, `listConversationsForAdmin` sort, `sendMessage` DTO shape. **Do not** call real Pusher in unit tests — mock `getPusherServer().trigger` via `vi.mock("@/lib/pusher-server")`.

**Secondary analog:** `order.service.test.ts` for pure helpers without DB (if extracting channel name parser).

---

### `src/server/actions/chat.actions.ts` (controller, request-response)

**Analog:** `src/server/actions/cart.actions.ts`

**Full action pattern** (lines 1-28):

```typescript
"use server";

import { revalidatePath } from "next/cache";
import { requireBuyer } from "@/lib/permissions";
import {
  addToCart,
  mergePendingItems,
  removeFromCart,
} from "@/server/services/cart.service";
import { addToCartSchema, mergePendingSchema } from "@/server/validators/cart";

function revalidateCartPaths() {
  revalidatePath("/koszyk");
  revalidatePath("/", "layout");
}

export async function addToCartAction(productId: string) {
  const session = await requireBuyer();
  const parsed = addToCartSchema.parse({ productId, quantity: 1 });

  try {
    await addToCart(session.user.id, parsed.productId);
  } catch {
    return { ok: false as const, error: "PRODUCT_UNAVAILABLE" };
  }

  revalidateCartPaths();
  return { ok: true as const };
}
```

**Chat `markAdminReadAction` / `markBuyerReadAction`:** Use `requireAdmin()` / `requireBuyer()`; call `chat.service.mark*Read`; `revalidatePath("/admin/chaty")` and `revalidatePath("/", "layout")` for FAB badge. Prefer **POST route** for `sendMessage` (RESEARCH Pattern 4); actions only for read-state + revalidation.

**Redirect errors:** If adding redirect actions, copy `order.actions.ts` lines 20-23 (`isRedirectError` rethrow).

---

### `src/server/validators/chat.ts` (utility, transform)

**Analog:** `src/server/validators/cart.ts`

```typescript
import { z } from "zod";

export const addToCartSchema = z.object({
  productId: z.string().cuid("Невірний ідентифікатор товару"),
  quantity: z.literal(1),
});
```

**Chat schema sketch:**

```typescript
export const sendMessageSchema = z.object({
  body: z
    .string()
    .trim()
    .min(1, "Повідомлення не може бути порожнім")
    .max(2000, "Максимум 2000 символів"),
  conversationId: z.string().cuid().optional(), // admin
  productId: z.string().cuid().optional(), // buyer context
});
```

**Tests:** Copy `order.test.ts` — `safeParse` for max length, trim, empty body.

---

### `src/components/admin/admin-nav.tsx` (component, transform)

**Analog:** same file (enabled items) + `src/components/cart/cart-nav-link.tsx` (badge)

**Enabled nav item** (lines 18-62):

```typescript
const navItems = [
  { href: "/admin", label: "Панель", icon: LayoutDashboard, enabled: true },
  // ...
] as const;

// ...
<Link
  key={item.href}
  href={item.href}
  className={cn(
    "flex min-h-11 items-center gap-2 rounded-md px-3 py-2 transition-colors",
    active ? "bg-sidebar-accent font-semibold ..." : "text-muted-foreground ...",
  )}
>
  <Icon className="size-4 shrink-0" aria-hidden />
  {item.label}
</Link>
```

**Replace disabled block** (lines 65-74) with:

```typescript
{
  href: "/admin/chaty",
  label: "Чати",
  icon: MessageSquare,
  enabled: true,
},
```

**Unread badge** (cart-nav-link lines 10-24):

```typescript
export async function CartNavLink({ userId }: CartNavLinkProps) {
  const count = await getCartItemCount(userId);

  return (
    <Link href="/koszyk" className="relative inline-flex ...">
      <ShoppingCart className="size-5" />
      {count > 0 ? (
        <Badge className="absolute -right-0.5 -top-0.5 min-w-5 justify-center px-1 text-[10px]">
          {count > 9 ? "9+" : count}
        </Badge>
      ) : null}
    </Link>
  );
}
```

**Admin nav badge:** Pass `unreadCount` from RSC parent (`admin/layout.tsx` or `chaty/page.tsx`) into `AdminNav` as prop — **server-computed** via `chat.service.countUnreadForAdmin()`, not client Pusher. Cap display `9+` like cart.

---

### `src/app/(storefront)/layout.tsx` (route, request-response)

**Analog:** same file — mount global client island beside cart gate.

**Current layout** (lines 1-22):

```typescript
import { NuqsAdapter } from "nuqs/adapters/next/app";
import { CartPendingMergeGate } from "@/components/cart/cart-pending-merge-gate";
import { StoreFooter } from "@/components/layout/store-footer";
import { StoreHeader } from "@/components/layout/store-header";

export default function StorefrontLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <StoreHeader />
      <main id="main-content" className="flex-1">
        <NuqsAdapter>
          <CartPendingMergeGate />
          {children}
        </NuqsAdapter>
      </main>
      <StoreFooter />
    </>
  );
}
```

**Add:** `<ChatProvider />` **outside** `<main>` but inside fragment — fixed FAB must not scroll with page content:

```tsx
<>
  <StoreHeader />
  <main>...</main>
  <StoreFooter />
  <ChatProvider />
</>
```

Pass `hasSession` from RSC wrapper if needed, or let `ChatProvider` read session via child server component gate pattern (see cart split below).

---

### Phase 3 cart widget patterns (client islands)

#### RSC gate + client island (`cart-pending-merge-gate.tsx`)

**Analog:** `src/components/cart/cart-pending-merge-gate.tsx` (lines 1-9)

```typescript
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { CartPendingMerge } from "@/components/cart/cart-pending-merge";

export async function CartPendingMergeGate() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) return null;
  return <CartPendingMerge />;
}
```

**Chat:** Optional `ChatSessionGate` server component inside `ChatProvider` tree — skip Pusher subscribe when guest; FAB still renders but click redirects.

#### Guest redirect (`add-to-cart-button.tsx`)

**Analog:** lines 28-35

```typescript
if (!hasSession) {
  addPendingProduct(productId);
  const callbackUrl = encodeURIComponent(pathname || `/tovar/${productId}`);
  router.push(`/uviity?callbackUrl=${callbackUrl}`);
  return;
}
```

**Chat FAB / OpenChatButton:** No pending storage needed — `encodeURIComponent(pathname + search)` for `?chat=open` deep link; callback `/kabinet` or current PDP path.

#### Client effect island (`cart-pending-merge.tsx`)

```typescript
"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

export function CartPendingMerge() {
  const router = useRouter();
  const ran = useRef(false);

  useEffect(() => {
    if (ran.current) return;
    ran.current = true;
    // async side effect, then router.refresh()
  }, [router]);

  return null;
}
```

**ChatProvider:** Same `useRef` guard for initial history fetch; subscribe/unsubscribe in `useEffect` cleanup; `router.refresh()` on reconnect refetch (D-05-17).

#### Nav badge from server (`cart-nav-link.tsx`)

Already covered — buyer FAB unread dot uses same Badge positioning; count from `chat.service` in a small RSC child passed to `ChatFab`.

#### nuqs for `?chat=open`

**Server parsers** (`src/lib/catalog/search-params.ts` lines 1-21):

```typescript
import {
  createSearchParamsCache,
  parseAsString,
  parseAsStringEnum,
} from "nuqs/server";

export const catalogParsers = {
  q: parseAsString.withDefault(""),
  // ...
};
```

**Client** (`catalog-filters.tsx` lines 23-26):

```typescript
const [params, setParams] = useQueryStates(catalogParsers, {
  shallow: false,
  urlKeys: catalogUrlKeys,
});
```

**Chat:** `src/lib/chat/search-params.ts` with `chat: parseAsStringEnum(["open"] as const)` or `parseAsBoolean`; `ChatProvider` calls `setParams({ chat: "open" })` when opening panel.

#### Mobile panel / sheet

**Analog:** `store-header.tsx` lines 49-73 — `Sheet` + `SheetContent side="right"` for full-width mobile; chat panel desktop `fixed bottom-20 right-4 w-[380px] z-50`, mobile reuse `Sheet side="bottom"` per UI-SPEC.

---

### `src/lib/pusher-server.ts` (utility, pub-sub)

**Analog:** `src/lib/cloudinary.ts` (lines 4-37)

```typescript
export class CloudinaryNotConfiguredError extends Error {
  constructor() {
    super("CLOUDINARY_API_KEY та CLOUDINARY_API_SECRET обовʼязкові...");
    this.name = "CloudinaryNotConfiguredError";
  }
}

let configured = false;

export function getCloudinaryConfig() {
  const env = getEnv();
  // ...
  if (!apiKey || !apiSecret) {
    throw new CloudinaryNotConfiguredError();
  }
  if (!configured) {
    cloudinary.config({ /* ... */ });
    configured = true;
  }
  return { /* ... */ };
}
```

**Pusher:** `let server: Pusher | undefined`, `getPusherServer()` lazy init from `getEnv()`, throw `PusherNotConfiguredError` for 503 in routes. Export `conversationChannel(id)`.

---

### `src/lib/env.ts` (config)

**Analog:** lines 3-18 — add optional/required Pusher vars:

```typescript
const envSchema = z.object({
  // ...
  CLOUDINARY_API_KEY: z.string().optional(),
  PUSHER_APP_ID: z.string().optional(),
  PUSHER_KEY: z.string().optional(),
  PUSHER_SECRET: z.string().optional(),
  PUSHER_CLUSTER: z.string().optional(),
  NEXT_PUBLIC_PUSHER_KEY: z.string().optional(),
  NEXT_PUBLIC_PUSHER_CLUSTER: z.string().optional(),
});
```

Mirror Cloudinary: server routes check configured before trigger.

---

### `src/app/(storefront)/kabinet/page.tsx` (modify)

**Analog:** same file — remove stub (lines 29-31), add CTA.

**Current stub:**

```typescript
<p className="mt-8 text-sm text-muted-foreground">
  Чат з магазином зʼявиться у наступній фазі проєкту.
</p>
```

**Replace with client `OpenChatButton` or link that sets `?chat=open` via nuqs — keep `requireBuyer("/kabinet")` at top (line 14).

---

### `src/app/(storefront)/tovar/[slug]/page.tsx` (modify)

**Analog:** `AddToCartButton` props (lines 81-85)

```typescript
<AddToCartButton
  productId={product.id}
  productTitle={product.title}
  hasSession={Boolean(session?.user)}
/>
```

Add `<OpenChatButton productId={product.id} productTitle={product.title} hasSession={...} />` below add-to-cart.

---

### `src/app/(admin)/admin/chaty/page.tsx` (route, CRUD read)

**Analog:** `src/app/(admin)/admin/zamovlennia/page.tsx` (lines 1-50)

```typescript
export const metadata: Metadata = {
  title: "Замовлення",
};

export default async function AdminOrdersPage({ searchParams }: PageProps) {
  const orders = await listAllOrders(filter);
  return (
    <motion.div className="space-y-6">
      <h1 className="text-2xl font-semibold">Замовлення</h1>
      {/* list + empty state */}
    </motion.div>
  );
}
```

**Chat page:** `listConversationsForAdmin()` + pass `unreadTotal` to layout/nav; desktop split grid `md:grid-cols-[280px_1fr]`; mobile list → thread via client state or `?conversationId=` nuqs.

**Date formatting** (admin page lines 8-12):

```typescript
function formatDate(date: Date): string {
  return new Intl.DateTimeFormat("uk-UA", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}
```

Reuse in `message-bubble.tsx` for D-05-20.

---

### `src/components/chat/chat-composer.tsx` (component)

**Partial analog:** `checkout-form.tsx` — local error state + submit disabled; use `fetch("/api/chat/messages")` instead of server action (upload/sign precedent).

```typescript
const onSubmit = form.handleSubmit(async (values) => {
  setError(null);
  const res = await fetch("/api/chat/messages", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(values),
  });
  if (res.status === 429) {
    setError("Забагато повідомлень. Спробуйте за хвилину.");
  }
});
```

Message body: `whitespace-pre-wrap` text only (no `dangerouslySetInnerHTML`). Admin bubbles label **«Магазин»** when `senderRole === STORE`.

---

## Shared Patterns

### Authentication

**RSC pages:** `requireBuyer("/path")` or `requireAdmin()` from `permissions.ts`.

**API routes:** `const unauthorized = await assertBuyerApi(); if (unauthorized) return unauthorized;` — mirror `assertAdminApi` in same file.

**Apply to:** All `src/app/api/chat/*`, optional `chat.actions.ts`.

### Error handling

| Layer | Pattern | Source |
|-------|---------|--------|
| Service | `throw new Error(CONSTANT)` | `admin-order.service.ts` |
| Action | `return { ok: false, error: "CODE" }` | `cart.actions.ts` |
| API route | `Response.json({ error: "CODE" }, { status })` | `upload/sign/route.ts` |
| Config missing | Dedicated Error class → 503 | `cloudinary.ts` |

### Validation

Zod in `src/server/validators/chat.ts`; `.parse()` in route/service; Ukrainian error messages in schema strings (cart.ts style).

### Realtime singleton

| Module | Pattern |
|--------|---------|
| `pusher-server.ts` | `getPusherServer()` lazy singleton |
| `pusher-client.ts` | `getPusherClient()` — **only** import from `"use client"` modules |
| Subscribe | Single site: `ChatProvider` + admin `ChatThread` |

### Testing

| Type | Analog | File to create |
|------|--------|----------------|
| Unit service | `admin-order.service.test.ts` | `chat.service.test.ts` |
| Unit validator | `order.test.ts` | `chat.test.ts` |
| E2E auth gate | `cart-auth.spec.ts` | `chat-auth.spec.ts` |
| E2E RBAC | `admin-rbac.spec.ts` | extend for `/admin/chaty` |
| Conditional skip | `hasCloudinarySecrets()` | `hasPusherSecrets()` in `e2e/helpers/pusher.ts` |

**E2E guest test** (cart-auth.spec.ts lines 4-10):

```typescript
test("guest visiting /koszyk is redirected to login with callbackUrl", async ({
  page,
}) => {
  await page.goto("/koszyk");
  await expect(page).toHaveURL(/\/uviity\?callbackUrl=/);
});
```

Mirror for FAB click → `/uviity?callbackUrl=`.

### Ukrainian UI + URL segments

- Admin path: `/admin/chaty` (matches `zamovlennia`, `tovary`)
- No `/chat` storefront route (D-05-07)
- Copy in Ukrainian only (`.cursor/rules/gsd.mdc`)

---

## No Analog Found

| File | Role | Data Flow | Reason |
|------|------|-----------|--------|
| `src/lib/pusher-client.ts` | utility | pub-sub | No existing browser realtime client; follow RESEARCH + official pusher-js `channelAuthorization` |
| `src/components/chat/chat-thread.tsx` | component | pub-sub | No subscribe/bind pattern in repo; RESEARCH Pattern 5 |
| `src/components/chat/message-list.tsx` | component | transform | No chat UI; closest is `order-history-list` (static list, no live append) |
| `e2e/chat-persistence.spec.ts` | test | e2e | No message persistence E2E; infer from checkout reload patterns |

Planner: use RESEARCH.md Patterns 2–5 for these four; still follow service/route analogs for server half.

---

## Metadata

**Analog search scope:** `src/lib/`, `src/server/`, `src/app/api/`, `src/app/(storefront)/`, `src/app/(admin)/`, `src/components/cart/`, `src/components/admin/`, `src/components/layout/`, `e2e/`

**Files scanned:** ~45

**Pattern extraction date:** 2026-05-17

**Phase 4 cross-ref:** `.planning/phases/04-admin-operations/04-PATTERNS.md` — server action checklist, admin list pages, form patterns (admin inbox UI may reuse split/table patterns from Phase 4).

---

## PATTERN MAPPING COMPLETE

**Phase:** 5 - Realtime Chat
**Files classified:** 28
**Analogs found:** 24 / 28

### Coverage
- Files with exact analog: 18
- Files with role-match analog: 6
- Files with no analog: 4

### Key Patterns Identified
- **API auth:** Extend `assertAdminApi` → `assertBuyerApi`; early-return `Response.json` in route handlers (`upload/sign/route.ts`).
- **Services:** `getOrCreate*` from `cart.service.ts`; admin lists from `admin-order.service.ts`; `$transaction` then external trigger (Pusher after DB).
- **Storefront widget:** RSC session gate + client island (`CartPendingMergeGate`); guest redirect from `add-to-cart-button.tsx`; global mount in `layout.tsx` outside `<main>`.
- **Admin nav:** Convert disabled span to `navItems` entry; unread `Badge` from server count like `CartNavLink`.
- **nuqs:** `catalog/search-params.ts` + `useQueryStates` for `?chat=open`.

### File Created
`.planning/phases/05-realtime-chat/05-PATTERNS.md`

### Ready for Planning
Pattern mapping complete. Planner can reference analog paths and line excerpts in PLAN.md tasks.
