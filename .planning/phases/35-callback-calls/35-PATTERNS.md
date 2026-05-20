# Phase 35: Callback calls (Дзвінки) - Pattern Map

**Mapped:** 2026-05-20
**Files analyzed:** 18 new/modified
**Analogs found:** 16 / 18

## File Classification

| New/Modified File | Role | Data Flow | Closest Analog | Match Quality |
|-------------------|------|-----------|----------------|---------------|
| `prisma/schema.prisma` | model | CRUD | `Conversation` + `ConversationStatus` enum | exact |
| `prisma/migrations/*_callback_admin_fields/` | migration | batch | `20260517165509_conversation_status` (repo) | role-match |
| `src/lib/callback/status-labels.ts` | utility | transform | `src/lib/order/status-labels.ts` | exact |
| `src/lib/admin/callbacks-url.ts` (optional) | utility | request-response | `src/lib/admin/orders-url.ts` | exact |
| `src/server/validators/admin-callback.ts` | utility | request-response | `src/server/validators/admin-order.ts` | exact |
| `src/server/validators/admin-callback.test.ts` | test | transform | `src/server/validators/callback.test.ts` | role-match |
| `src/server/services/callback-request.service.ts` | service | CRUD | `store-settings.service.ts` (list) + `chat.service.ts` (archive) | exact |
| `src/server/services/store-settings.service.ts` | service | CRUD | self (remove callback list) | exact |
| `src/server/services/callback-request.service.test.ts` | test | CRUD | self (extend) + `chat.service.test.ts` | role-match |
| `src/server/actions/admin/callback.actions.ts` | controller | request-response | `src/server/actions/admin/order.actions.ts` | exact |
| `src/app/(admin)/admin/dzvinky/page.tsx` | route | request-response | `src/app/(admin)/admin/zamovlennia/page.tsx` | exact |
| `src/app/(admin)/admin/nalashtuvannia/page.tsx` | route | request-response | self (strip section) | exact |
| `src/components/admin/admin-nav-items.ts` | config | — | self (existing nav array) | exact |
| `src/components/admin/callback-list-filters.tsx` | component | request-response | `order-list-filters.tsx` | exact |
| `src/components/admin/callback-list-status-select.tsx` | component | request-response | `order-list-status-select.tsx` | exact |
| `src/components/admin/callback-note-field.tsx` | component | request-response | `product-form.tsx` (explicit save) | partial |
| `src/components/admin/callback-archive-button.tsx` | component | request-response | `order-list-status-select.tsx` + `chat.actions.ts` | partial |
| `src/components/admin/callback-requests-table.tsx` | component | CRUD | self + `orders-data-table` (columns) | exact |

**Unchanged (verify compile only):** `src/server/actions/callback.actions.ts`, `src/server/services/admin-analytics.service.ts`

---

## Pattern Assignments

### `prisma/schema.prisma` (model, CRUD)

**Analog:** `Conversation` + `ConversationStatus` in same file; extend existing `CallbackRequest`

**Enum + defaulted status** (lines 218-226, 279-286):

```218:226:prisma/schema.prisma
enum ConversationStatus {
  OPEN
  ARCHIVED
}

model Conversation {
  id                  String             @id @default(cuid())
  userId              String             @unique
  status              ConversationStatus @default(OPEN)
```

```279:286:prisma/schema.prisma
model CallbackRequest {
  id        String   @id @default(cuid())
  phone     String
  ipAddress String?
  createdAt DateTime @default(now())

  @@index([ipAddress, createdAt])
}
```

**Apply:** Add `enum CallbackRequestStatus { PENDING CONSULTED }`; on `CallbackRequest` add `status @default(PENDING)`, `note String? @db.Text`, `archivedAt DateTime?`, `@@index([archivedAt, createdAt])`. Existing rows get `PENDING` via DB default on migrate (same as `Conversation.status`).

---

### `src/server/services/callback-request.service.ts` (service, CRUD)

**Analog (list move):** `store-settings.service.ts` `listCallbackRequestsAdmin`  
**Analog (create/rate limit):** same file (keep)  
**Analog (archive gate):** `chat.service.ts` `archiveConversation` + service error constants in `admin-order.service.ts`

**Existing create + rate limit** (lines 1-42):

```1:42:src/server/services/callback-request.service.ts
import { prisma } from "@/lib/db";

export const CALLBACK_RATE_LIMIT_WINDOW_MS = 3_600_000;
export const CALLBACK_RATE_LIMIT_MAX = 5;
// ...
export async function createCallbackRequest(input: {
  phone: string;
  ipAddress: string | null;
}): Promise<void> {
  const digits = input.phone.trim();
  await enforceCallbackRateLimit(input.ipAddress);

  await prisma.callbackRequest.create({
    data: {
      phone: digits,
      ipAddress: input.ipAddress,
    },
  });
}
```

**List to move from store-settings** (lines 113-120):

```113:120:src/server/services/store-settings.service.ts
export async function listCallbackRequestsAdmin(
  limit = 50,
): Promise<CallbackRequestAdminRow[]> {
  return prisma.callbackRequest.findMany({
    orderBy: { createdAt: "desc" },
    take: limit,
    select: { id: true, phone: true, createdAt: true },
  });
}
```

**Extend type + view filter** (planner sketch from RESEARCH):

```typescript
export type CallbackRequestAdminRow = {
  id: string;
  phone: string;
  createdAt: Date;
  status: CallbackRequestStatus;
  note: string | null;
  archivedAt: Date | null;
};

export async function listCallbackRequestsAdmin(options: {
  view: "active" | "archive";
  limit?: number;
}): Promise<CallbackRequestAdminRow[]> {
  const where =
    options.view === "archive"
      ? { archivedAt: { not: null } }
      : { archivedAt: null };
  return prisma.callbackRequest.findMany({
    where,
    orderBy: { createdAt: "desc" },
    take: options.limit ?? 200,
    select: {
      id: true,
      phone: true,
      createdAt: true,
      status: true,
      note: true,
      archivedAt: true,
    },
  });
}
```

**Archive gate pattern** (mirror order action errors — export string constants, throw/check in service):

```typescript
export const CALLBACK_NOT_FOUND = "CALLBACK_NOT_FOUND";
export const CALLBACK_NOT_CONSULTED = "CALLBACK_NOT_CONSULTED";
export const CALLBACK_ALREADY_ARCHIVED = "CALLBACK_ALREADY_ARCHIVED";

// findUnique → reject if !row || row.archivedAt → reject if status !== "CONSULTED" → update archivedAt
```

**Note normalization:** `note: trimmed.length ? trimmed : null` (matches `saveStoreSettings` label trim-to-null at lines 82-83).

---

### `src/server/services/store-settings.service.ts` (service, modify)

**Analog:** self — delete callback admin exports only

**Remove** `CallbackRequestAdminRow`, `listCallbackRequestsAdmin` (lines 31-35, 113-120). Keep `getAdminStoreSettings` / `saveStoreSettings` unchanged.

---

### `src/server/actions/admin/callback.actions.ts` (controller, request-response)

**Analog:** `src/server/actions/admin/order.actions.ts`

**File header + guard + parse + revalidate** (lines 1-42):

```1:42:src/server/actions/admin/order.actions.ts
"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/permissions";
import {
  INVALID_STATUS_TRANSITION,
  INSUFFICIENT_STOCK,
  ORDER_NOT_FOUND,
  updateOrderStatus,
} from "@/server/services/admin-order.service";
import { updateOrderStatusSchema } from "@/server/validators/admin-order";

export async function updateOrderStatusAction(input: unknown) {
  await requireAdmin();
  const data = updateOrderStatusSchema.parse(input);

  try {
    const { orderNumber } = await updateOrderStatus(data.orderId, data.status);
    revalidatePath("/admin/zamovlennia");
    revalidatePath(`/admin/zamovlennia/${orderNumber}`);
    revalidatePath("/admin/tovary");
    revalidatePath("/katalog");
    revalidatePath("/kabinet");
    return { ok: true as const, orderNumber };
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === INVALID_STATUS_TRANSITION) {
        return {
          ok: false as const,
          error: "INVALID_STATUS_TRANSITION" as const,
        };
      }
      // ...
    }
    return { ok: false as const, error: "UNKNOWN" as const };
  }
}
```

**Apply:** Three actions (`updateCallbackStatusAction`, `updateCallbackNoteAction`, `archiveCallbackRequestAction`); `revalidatePath("/admin/dzvinky")` only (optional `nalashtuvannia` if cached). Map service errors to `{ ok: false, error: "NOT_CONSULTED" | "NOT_FOUND" | "VALIDATION" | "UNKNOWN" }`.

**Simpler Zod-only action shape** (archive id only) — `chat.actions.ts`:

```21:27:src/server/actions/admin/chat.actions.ts
export async function archiveConversationAction(conversationId: string) {
  await requireAdmin();
  const id = conversationIdSchema.parse(conversationId);
  await archiveConversation(id);
  revalidateAdminChat();
  return { ok: true as const };
}
```

Use order-style `{ ok, error }` for callbacks (UI toasts), not chat’s bare throw.

---

### `src/server/validators/admin-callback.ts` (utility, request-response)

**Analog:** `src/server/validators/admin-order.ts`

**View enum + defaults** (lines 3-31):

```3:31:src/server/validators/admin-order.ts
export const adminOrderListFilterSchema = z.enum([
  "all",
  "new",
  "in_progress",
  "completed",
  "cancelled",
]);
// ...
export const listOrdersAdminSchema = z.object({
  filter: adminOrderListFilterSchema.default("all"),
  page: z.coerce.number().int().min(1).max(1000).default(1),
  pageSize: adminOrderPageSizeSchema.default(20),
  sort: adminOrderListSortSchema.default("createdAt"),
  dir: adminOrderListDirSchema.default("desc"),
});
```

**Apply:**

```typescript
export const callbackListViewSchema = z.enum(["active", "archive"]).default("active");

export const listCallbacksAdminPageSchema = z.object({
  view: callbackListViewSchema,
});

export const updateCallbackStatusSchema = z.object({
  id: z.string().cuid("Невірний ідентифікатор заявки"),
  status: z.enum(["PENDING", "CONSULTED"]),
});

export const updateCallbackNoteSchema = z.object({
  id: z.string().cuid("Невірний ідентифікатор заявки"),
  note: z.string().max(4000).optional(),
});

export const archiveCallbackSchema = z.object({
  id: z.string().cuid("Невірний ідентифікатор заявки"),
});
```

---

### `src/lib/callback/status-labels.ts` (utility, transform)

**Analog:** `src/lib/order/status-labels.ts`

```1:10:src/lib/order/status-labels.ts
import type { OrderStatus } from "@/generated/prisma/client";

export const ORDER_STATUS_LABELS_UA: Record<OrderStatus, string> = {
  PENDING: "Нове",
  CONFIRMED: "Підтверджено",
  READY_FOR_PICKUP: "Готово до самовивозу",
  OUT_FOR_DELIVERY: "Доставляється",
  COMPLETED: "Виконано",
  CANCELLED: "Скасовано",
};
```

**Apply:** `CALLBACK_STATUS_LABELS_UA`: `PENDING` → «Очікує на дзвінок», `CONSULTED` → «Проконсультовано». Optional `src/lib/callback/status-styles.ts` mirroring `status-styles.ts` (amber / emerald).

---

### `src/lib/admin/callbacks-url.ts` (optional utility)

**Analog:** `src/lib/admin/orders-url.ts` + `src/lib/admin-chat-url.ts` (two-view `active` | `archive`)

**Orders URL builder** (lines 7-44):

```7:44:src/lib/admin/orders-url.ts
const ORDERS_PATH = "/admin/zamovlennia";
// ...
export function adminOrdersUrl(params: AdminOrdersUrlParams = {}): string {
  const searchParams = new URLSearchParams();
  if (params.filter != null && params.filter !== DEFAULT_FILTER) {
    searchParams.set("filter", params.filter);
  }
  // ...
  const query = searchParams.toString();
  return query ? `${ORDERS_PATH}?${query}` : ORDERS_PATH;
}
```

**Chat view param** (lines 1-16):

```1:16:src/lib/admin-chat-url.ts
export type AdminChatView = "active" | "archive";

export function buildAdminChatHref(
  view: AdminChatView,
  conversationId?: string | null,
): string {
  const params = new URLSearchParams();
  if (view === "archive") {
    params.set("view", "archive");
  }
  // default path = active (no query)
```

**Apply:** `CALLBACKS_PATH = "/admin/dzvinky"`; omit `view` for active; `?view=archive` for archive tab.

---

### `src/app/(admin)/admin/dzvinky/page.tsx` (route, request-response)

**Analog:** `src/app/(admin)/admin/zamovlennia/page.tsx`

```1:62:src/app/(admin)/admin/zamovlennia/page.tsx
import type { Metadata } from "next";
import { OrderListFilters } from "@/components/admin/order-list-filters";
import { OrdersDataTable } from "@/components/admin/orders-data-table";
import {
  getOrderFilterCounts,
  listOrdersAdminPaginated,
} from "@/server/services/admin-order.service";
import { listOrdersAdminSchema } from "@/server/validators/admin-order";

export const metadata: Metadata = {
  title: "Замовлення",
};

type PageProps = {
  searchParams: Promise<{
    filter?: string;
    // ...
  }>;
};

export default async function AdminOrdersPage({ searchParams }: PageProps) {
  const rawParams = await searchParams;
  const params = listOrdersAdminSchema.parse(rawParams);
  const [result, filterCounts] = await Promise.all([
    listOrdersAdminPaginated(params),
    getOrderFilterCounts(),
  ]);

  return (
    <div className="min-w-0 space-y-6">
      <h1 className="text-2xl font-semibold">Замовлення</h1>
      <OrderListFilters active={params.filter} counts={filterCounts} ... />
      {result.total === 0 && params.filter === "all" ? (
        <p className="text-sm text-muted-foreground">...</p>
      ) : (
        <OrdersDataTable ... />
      )}
    </div>
  );
}
```

**Apply:** `title: "Дзвінки"`; parse `listCallbacksAdminPageSchema`; `Promise.all([listCallbackRequestsAdmin({ view }), getCallbackViewCounts()])`; `space-y-6`; empty copy per UI-SPEC (active vs archive).

---

### `src/app/(admin)/admin/nalashtuvannia/page.tsx` (route, modify)

**Analog:** self — reduce to settings-only

**Remove pattern** (lines 1-29):

```1:29:src/app/(admin)/admin/nalashtuvannia/page.tsx
import { CallbackRequestsTable } from "@/components/admin/callback-requests-table";
// ...
  const [settings, callbackRequests] = await Promise.all([
    getAdminStoreSettings(),
    listCallbackRequestsAdmin(50),
  ]);
// ...
      <section className="space-y-4">
        <h2 className="text-lg font-semibold">Заявки на дзвінок</h2>
        <CallbackRequestsTable requests={callbackRequests} />
      </section>
```

**Keep:** `StoreSettingsForm` + H1 block (lines 15-23). Single `getAdminStoreSettings()` fetch.

---

### `src/components/admin/admin-nav-items.ts` (config)

**Analog:** self — insert `Phone` between Chats and Analytics (per UI-SPEC)

```11:19:src/components/admin/admin-nav-items.ts
export const adminNavItems = [
  { href: "/admin", label: "Панель", icon: LayoutDashboard },
  { href: "/admin/kategorii", label: "Категорії", icon: FolderTree },
  { href: "/admin/tovary", label: "Товари", icon: Package },
  { href: "/admin/zamovlennia", label: "Замовлення", icon: ShoppingBag },
  { href: "/admin/chaty", label: "Чати", icon: MessageSquare },
  { href: "/admin/analityka", label: "Аналітика", icon: BarChart2 },
  { href: "/admin/nalashtuvannia", label: "Налаштування", icon: Settings },
] as const;
```

**Apply:** After `chaty`, before `analityka`: `{ href: "/admin/dzvinky", label: "Дзвінки", icon: Phone }` from `lucide-react`.

---

### `src/components/admin/callback-list-filters.tsx` (component, request-response)

**Analog:** `order-list-filters.tsx`

```13:63:src/components/admin/order-list-filters.tsx
const filters: Array<{ key: AdminOrderListFilter; label: string }> = [
  { key: "all", label: "Усі" },
  // ...
];

export function OrderListFilters({ active, counts, ... }: OrderListFiltersProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {filters.map((filter) => {
        const href = adminOrdersUrl({ filter: filter.key, page: 1, ... });
        return (
          <Link
            key={filter.key}
            href={href}
            className={cn(
              "rounded-md border px-3 py-1.5 text-sm transition-colors",
              active === filter.key
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border bg-background text-muted-foreground hover:text-foreground",
            )}
          >
            {filter.label} ({counts[filter.key]})
          </Link>
        );
      })}
    </div>
  );
}
```

**Apply:** Two chips — «Активні», «Архів»; keys `active` | `archive`; counts from `getCallbackViewCounts()`.

---

### `src/components/admin/callback-list-status-select.tsx` (component, request-response)

**Analog:** `order-list-status-select.tsx` (simplified — 2 states, no AlertDialog)

**Imports + client + Select sm** (lines 1-29, 72-127):

```1:29:src/components/admin/order-list-status-select.tsx
"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition, type MouseEvent } from "react";
import type { DeliveryType, OrderStatus } from "@/generated/prisma/client";
import { toast } from "sonner";
// ...
import { updateOrderStatusAction } from "@/server/actions/admin/order.actions";
```

```72:127:src/components/admin/order-list-status-select.tsx
  async function applyStatus(nextStatus: OrderStatus) {
    try {
      const result = await updateOrderStatusAction({ orderId, status: nextStatus });
      if (!result.ok) {
        showOrderStatusErrorToast(result.error);
        return;
      }
      toast.success("Статус оновлено");
      router.refresh();
    } catch {
      showOrderStatusErrorToast("UNKNOWN");
    }
  }
  // ...
  return (
    <>
      <Select value={status} onValueChange={handleSelect} disabled={pending}>
        <SelectTrigger size="sm" className={cn(listTriggerClassName, getOrderStatusAccentClass(status))}
          onClick={stopRowNav} onPointerDown={stopRowNav}>
```

**Apply:** Props `{ id, status }`; options both `PENDING` and `CONSULTED`; call `updateCallbackStatusAction`; toast «Статус оновлено» / error UA; narrower trigger (`min-w-[12rem]`). Only render in `view === "active"`.

---

### `src/components/admin/callback-note-field.tsx` (component, request-response)

**Analog (partial):** explicit save from `product-form.tsx`; client refresh from `order-list-status-select.tsx`

**Save button** (lines 280-284):

```280:284:src/components/admin/product-form.tsx
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Збереження…" : "Зберегти"}
            </Button>
```

**Apply:** `"use client"`; `useState` for note from `defaultValue={note ?? ""}`; shadcn `Textarea` `rows={3}`; `Button` size `sm` «Зберегти»; `useTransition` + `updateCallbackNoteAction` + `toast.success("Нотатку збережено")` + `router.refresh()`. **Do not** use product-form `onBlur` auto-save (violates D-09).

---

### `src/components/admin/callback-archive-button.tsx` (component, request-response)

**Analog (partial):** `order-list-status-select` transition/toast/refresh + disabled + `title` tooltip

**Apply:** `Button` variant `outline` size `sm` «В архів»; `disabled={status !== "CONSULTED" || pending}`; `title` when disabled explaining CONSULTED requirement; `archiveCallbackRequestAction`; on `!result.ok` toast error for `NOT_CONSULTED`. Hide entirely in archive view.

---

### `src/components/admin/callback-requests-table.tsx` (component, CRUD)

**Analog:** self (table shell) + import type from `callback-request.service`

**Current shell** (lines 1-41):

```1:41:src/components/admin/callback-requests-table.tsx
import { formatUaPhoneDisplay } from "@/lib/phone/format-ua";
import type { CallbackRequestAdminRow } from "@/server/services/store-settings.service";

export function CallbackRequestsTable({ requests }: { requests: CallbackRequestAdminRow[] }) {
  if (requests.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">Ще немає заявок</p>
    );
  }
  return (
    <div className="overflow-x-auto rounded-md border border-border">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border bg-muted/50 text-left">
            <th className="px-4 py-3 font-medium">Телефон</th>
            <th className="px-4 py-3 font-medium">Дата</th>
          </tr>
        </thead>
        <tbody>
          {requests.map((request) => (
            <tr key={request.id} className="border-b border-border last:border-0">
              <td className="px-4 py-3 tabular-nums">
                {formatUaPhoneDisplay(request.phone)}
              </td>
              <td className="px-4 py-3 text-muted-foreground">
                {request.createdAt.toLocaleString("uk-UA", { dateStyle: "short", timeStyle: "short" })}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
```

**Apply:** Add props `view: "active" | "archive"`; columns Статус, Нотатка, Дії; delegate cells to client components; archive view — static status label, truncated note; change import to `@/server/services/callback-request.service`.

---

### `src/server/services/callback-request.service.test.ts` (test, extend)

**Analog:** self + `chat.service.test.ts` archive tests

**Existing mock setup** (lines 1-52):

```1:52:src/server/services/callback-request.service.test.ts
vi.mock("@/lib/db", () => ({
  prisma: {
    callbackRequest: {
      count: vi.fn(),
      create: vi.fn(),
    },
  },
}));
// ... createCallbackRequest rate limit tests
```

**Apply:** Add `findMany`, `findUnique`, `update` to mock; tests for list `view`, archive `NOT_CONSULTED`, note `null` on empty.

---

## Shared Patterns

### Authentication
**Source:** `src/app/(admin)/admin/layout.tsx` + every `admin/*.actions.ts`  
**Apply to:** RSC page (layout guard), all `admin/callback.actions.ts`

```17:17:src/app/(admin)/admin/layout.tsx
  await requireAdmin();
```

```14:15:src/server/actions/admin/order.actions.ts
  await requireAdmin();
  const data = updateOrderStatusSchema.parse(input);
```

### Server action result shape
**Source:** `order.actions.ts`, `store-settings.actions.ts`  
**Apply to:** All three callback admin actions

```22:24:src/server/actions/admin/store-settings.actions.ts
export type SaveStoreSettingsResult =
  | { ok: true }
  | { ok: false; error: "VALIDATION" | "UNKNOWN"; message?: string };
```

### Ukrainian empty states
**Source:** `callback-requests-table.tsx`, `zamovlennia/page.tsx`  
**Apply to:** Table + dzvinky page

```9:12:src/components/admin/callback-requests-table.tsx
    return (
      <p className="text-sm text-muted-foreground">Ще немає заявок</p>
    );
```

### Phone display
**Source:** `callback-requests-table.tsx`  
**Apply to:** Phone column unchanged

```27:28:src/components/admin/callback-requests-table.tsx
                {formatUaPhoneDisplay(request.phone)}
```

### Toasts
**Source:** Admin layout + `order-list-status-select.tsx`  
**Apply to:** Status, note, archive client components

```25:25:src/app/(admin)/admin/layout.tsx
      <Toaster richColors position="top-center" />
```

### Analytics (no change — D-12)
**Source:** `admin-analytics.service.ts`  
**Do not filter** by `archivedAt` or `status` in Phase 35.

```33:33:src/server/services/admin-analytics.service.ts
    prisma.callbackRequest.count({ where: { createdAt: { gte: since } } }),
```

### Storefront submit (unchanged)
**Source:** `callback.actions.ts` + `createCallbackRequest`  
**Do not modify** except verify types after `prisma generate`.

```27:36:src/server/actions/callback.actions.ts
export async function submitCallbackRequestAction(
  input: unknown,
): Promise<SubmitCallbackResult> {
  try {
    const data = callbackRequestSchema.parse(input);
    await createCallbackRequest({
      phone: data.phone,
      ipAddress: await resolveClientIp(),
    });
    return { ok: true };
```

---

## No Analog Found

| File | Role | Data Flow | Reason |
|------|------|-----------|--------|
| `src/components/admin/callback-note-field.tsx` | component | request-response | No inline table Textarea+save in admin; compose from `product-form` Button + `order-list-status-select` refresh |
| `prisma/migrations/*_callback_admin_fields/` | migration | batch | Generated by CLI; follow Conversation-status migration precedent in repo history |

Planner may use RESEARCH.md migration SQL sketch for `CallbackRequestStatus` enum fields.

---

## Metadata

**Analog search scope:** `src/app/(admin)/admin/`, `src/components/admin/`, `src/server/services/`, `src/server/actions/admin/`, `src/server/validators/`, `src/lib/order/`, `src/lib/admin/`, `prisma/schema.prisma`  
**Files scanned:** ~25 primary analogs  
**Pattern extraction date:** 2026-05-20

---

## PATTERN MAPPING COMPLETE

**Phase:** 35 - Callback calls (Дзвінки)  
**Files classified:** 18  
**Analogs found:** 16 / 18

### Coverage
- Files with exact analog: 12
- Files with role-match analog: 4
- Files with no analog: 2 (note-field partial; migration CLI-generated)

### Key Patterns Identified
- Admin list page = RSC + Zod `searchParams` + `Promise.all` fetch + chip `Link` filters (`zamovlennia` + `order-list-filters`).
- Row status = client `Select` + `requireAdmin` action + sonner + `router.refresh()` (`order-list-status-select`).
- Data layer consolidation in `callback-request.service.ts`; remove list from `store-settings.service.ts`.
- Archive eligibility enforced in service (`NOT_CONSULTED`), not UI-only; `archivedAt` + `?view=archive` like chat active/archive URLs.
- Prisma enum + `@default(PENDING)` on `CallbackRequest`; analytics count unchanged.

### File Created
`.planning/phases/35-callback-calls/35-PATTERNS.md`

### Ready for Planning
Pattern mapping complete. Planner can reference analog patterns in PLAN.md files.
