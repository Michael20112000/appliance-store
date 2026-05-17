# Phase 8: Admin UX & Chat Lifecycle - Pattern Map

**Mapped:** 2026-05-17
**Files analyzed:** 28 (create/modify for Phase 8)
**Analogs found:** 24 / 28

## File Classification

| New/Modified File | Role | Data Flow | Closest Analog | Match Quality |
|-------------------|------|-----------|----------------|---------------|
| `src/components/ui/sidebar.tsx` | component (shadcn) | request-response | — (install via CLI) | **no analog** |
| `src/components/ui/table.tsx` | component (shadcn) | transform | existing plain `<table>` in admin pages | partial |
| `src/components/ui/pagination.tsx` | component (shadcn) | transform | — | **no analog** |
| `src/components/ui/tabs.tsx` | component (shadcn) | transform | `order-list-filters.tsx` (tab-like Links) | partial |
| `src/components/admin/app-sidebar.tsx` | component | transform | `src/components/admin/admin-nav.tsx` | exact |
| `src/app/(admin)/admin/layout.tsx` | route | request-response | same file + shadcn Sidebar block | exact |
| `src/app/(admin)/admin/page.tsx` | route | CRUD read | same file (`StatCard` href) | exact |
| `src/app/(admin)/admin/zamovlennia/page.tsx` | route | CRUD read | `src/app/(admin)/admin/tovary/page.tsx` | exact |
| `src/app/(admin)/admin/kategorii/page.tsx` | route | CRUD read | same file (drop column only) | exact |
| `src/app/(admin)/admin/chaty/page.tsx` | route | CRUD read | same file + `searchParams` view | exact |
| `src/components/admin/orders-data-table.tsx` | component | transform | `orders-table.tsx` + TanStack manual mode | role-match |
| `src/components/admin/order-list-filters.tsx` | component | transform | `product-list-filters.tsx` | exact |
| `src/components/admin/orders-table.tsx` | component | transform | same file (replace/deprecate) | exact |
| `src/components/admin/admin-nav.tsx` | component | transform | migrate into `app-sidebar.tsx` | exact |
| `src/server/validators/admin-order.ts` | utility | transform | `listAdminProductsSchema` in `admin-product.ts` | role-match |
| `src/server/services/admin-order.service.ts` | service | CRUD + batch | `admin-product.service.ts` `listAdminProducts` | exact |
| `src/server/services/admin-order.service.test.ts` | test | unit | `chat.service.test.ts` | role-match |
| `src/server/actions/admin/chat.actions.ts` | controller | request-response | `chat.actions.ts` + `category.actions.ts` | exact |
| `src/server/services/chat.service.ts` | service | CRUD + pub-sub | same file (extend) | exact |
| `src/server/services/chat.service.test.ts` | test | unit | same file (extend) | exact |
| `src/components/chat/admin-chat-inbox.tsx` | component | CRUD read + event-driven | same file + `order-list-filters` tabs | role-match |
| `src/components/chat/admin-chat-provider.tsx` | provider | event-driven | same file (`router.refresh`) | exact |
| `src/components/chat/chat-thread.tsx` | component | request-response | `order-status-select.tsx` (AlertDialog) | role-match |
| `src/components/chat/chat-provider.tsx` | provider | pub-sub | same file | exact |
| `src/components/chat/chat-composer.tsx` | component | request-response | same file (`canSend` gate) | exact |
| `src/types/chat.ts` | model | transform | same file | exact |
| `prisma/schema.prisma` | model | CRUD schema | same file `Conversation` | exact |
| `e2e/admin-chat.spec.ts` | test | e2e | same file | exact |

---

## Pattern Assignments

### `src/components/admin/app-sidebar.tsx` (component, transform)

**Analog:** `src/components/admin/admin-nav.tsx`

**Imports + nav items** (lines 1-39):

```typescript
"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  ExternalLink,
  FolderTree,
  LayoutDashboard,
  MessageSquare,
  Package,
  ShoppingBag,
} from "lucide-react";
import { authClient } from "@/lib/auth-client";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const navItems = [
  { href: "/admin", label: "Панель", icon: LayoutDashboard, enabled: true },
  { href: "/admin/kategorii", label: "Категорії", icon: FolderTree, enabled: true },
  { href: "/admin/tovary", label: "Товари", icon: Package, enabled: true },
  { href: "/admin/zamovlennia", label: "Замовлення", icon: ShoppingBag, enabled: true },
  { href: "/admin/chaty", label: "Чати", icon: MessageSquare, enabled: true },
] as const;
```

**Active link + unread badge** (lines 54-86):

```typescript
const active =
  item.href === "/admin"
    ? pathname === "/admin"
    : pathname.startsWith(item.href);
const isChat = item.href === "/admin/chaty";
const showChatBadge = isChat && unreadChatCount > 0;
// ...
aria-label={
  showChatBadge
    ? `Чати, ${unreadChatCount} непрочитаних`
    : item.label
}
```

**Footer: site + logout** (lines 90-110):

```typescript
await authClient.signOut();
router.push("/uviity");
router.refresh();
```

**Planner:** Wrap items in shadcn `SidebarMenu` / `SidebarMenuButton` with `render={<Link href={...} />}` (project Button pattern). Keep `unreadChatCount` prop from RSC layout. Preserve `getByRole("link", { name: /^Чати/ })` for e2e (D-08-27).

---

### `src/app/(admin)/admin/layout.tsx` (route, request-response)

**Analog:** same file + shadcn SidebarProvider (tokens already in `globals.css` L32-39, L109-116)

**Server auth + unread fetch** (lines 12-18):

```typescript
export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireAdmin();
  const unreadChatCount = await countUnreadForAdmin();
```

**Current grid shell to replace** (lines 20-35):

```typescript
return (
  <motion.div className="min-h-dvh bg-muted">
    <div className="grid min-h-dvh grid-cols-1 md:grid-cols-[240px_1fr]">
      <aside className="border-b ...">
        <AdminNav unreadChatCount={unreadChatCount} />
      </aside>
      <main>...</main>
    </motion.div>
    <Toaster richColors position="top-center" />
  </motion.div>
);
```

**Target structure:** `SidebarProvider` → `AppSidebar unreadChatCount={...}` → `SidebarInset` → mobile-only `SidebarTrigger` header → children card wrapper. Keep `requireAdmin()` + `countUnreadForAdmin()` on server; pass count into client sidebar only.

---

### `src/app/(admin)/admin/page.tsx` (route, CRUD read) — FIX-01

**Analog:** same file + `StatCard`

**StatCard drafts href** (lines 33-37) — change `href` only:

```typescript
<StatCard
  label="Чернетки"
  count={stats.draftProducts}
  href="/admin/tovary?status=DRAFT"
/>
```

**Analog for DRAFT filter:** `src/app/(admin)/admin/tovary/page.tsx` L29-43 parses `status=DRAFT`.

---

### `src/app/(admin)/admin/zamovlennia/page.tsx` (route, CRUD read)

**Analog:** `src/app/(admin)/admin/tovary/page.tsx`

**searchParams Promise + Zod parse** (tovary L20-48):

```typescript
type PageProps = {
  searchParams: Promise<{
    page?: string;
    filter?: string;
    pageSize?: string;
    sort?: string;
    dir?: string;
  }>;
};

export default async function AdminOrdersPage({ searchParams }: PageProps) {
  const rawParams = await searchParams;
  const params = listOrdersAdminSchema.parse(rawParams);

  const [result] = await Promise.all([
    listOrdersAdminPaginated(params),
  ]);
```

**Parallel fetch pattern** (tovary L50-53):

```typescript
const [result, categories] = await Promise.all([
  listAdminProducts(filters),
  listCategoriesAdmin(),
]);
```

**Planner:** Pass `result.items`, `result.total`, `result.page`, `result.pageSize`, `result.totalPages`, and URL state (`filter`, `sort`, `dir`) to `OrdersDataTable`. Keep `OrderListFilters` above table.

---

### `src/server/validators/admin-order.ts` (utility, transform)

**Analog:** `listAdminProductsSchema` in `src/server/validators/admin-product.ts` L70-76

**Extend file** (existing `updateOrderStatusSchema` L12-15 stays):

```typescript
export const listOrdersAdminSchema = z.object({
  page: z.coerce.number().int().min(1).max(1000).default(1),
  pageSize: z.coerce.number().int().refine((n) => [10, 20, 50].includes(n), {
    message: "Невірний розмір сторінки",
  }).default(20),
  filter: z.enum(["all", "new", "in_progress", "completed", "cancelled"]).default("all"),
  sort: z.enum(["createdAt", "totalKopiyky", "orderNumber", "status"]).default("createdAt"),
  dir: z.enum(["asc", "desc"]).default("desc"),
});

export type ListOrdersAdminParams = z.output<typeof listOrdersAdminSchema>;
```

**Planner:** Add `adminOrdersUrl()` helper in `src/lib/admin/orders-url.ts` or colocated with filters — mirror `product-list-filters.tsx` `statusHref` / `categoryHref` (L23-36).

---

### `src/server/services/admin-order.service.ts` (service, CRUD + batch)

**Analog:** `listAdminProducts` in `admin-product.service.ts` L114-129 + existing `listAllOrders` / `FILTER_STATUS_MAP` L27-35, L125-137

**Paginated list** (mirror products):

```typescript
export async function listOrdersAdminPaginated(params: ListOrdersAdminParams) {
  const where = buildOrderWhere(params.filter);
  const skip = (params.page - 1) * params.pageSize;
  const orderBy = buildOrderOrderBy(params.sort, params.dir);

  const [total, orders] = await Promise.all([
    prisma.order.count({ where }),
    prisma.order.findMany({
      where,
      include: { items: true },
      orderBy,
      skip,
      take: params.pageSize,
    }),
  ]);

  return {
    items: orders.map(mapOrderSummary),
    total,
    page: params.page,
    pageSize: params.pageSize,
    totalPages: Math.max(1, Math.ceil(total / params.pageSize)),
  };
}
```

**Existing filter map** (reuse, do not duplicate):

```typescript
const FILTER_STATUS_MAP: Record<
  Exclude<AdminOrderListFilter, "all">,
  readonly OrderStatus[]
> = {
  new: ["PENDING"],
  in_progress: ["CONFIRMED", "READY_FOR_PICKUP", "OUT_FOR_DELIVERY"],
  completed: ["COMPLETED"],
  cancelled: ["CANCELLED"],
};
```

**Pitfall:** `totalKopiyky` sort — computed in `mapOrderSummary` L79-82, not a DB column. Use `$queryRaw` for ordered IDs when `sort === "totalKopiyky"` (see RESEARCH Pitfall 1).

---

### `src/components/admin/orders-data-table.tsx` (component, transform)

**Analog:** `src/components/admin/orders-table.tsx` L21-76 + TanStack manual mode (RESEARCH Pattern 3)

**Column/cell patterns from orders-table** (L43-71):

```typescript
<td className="px-4 py-2 font-medium">{order.orderNumber}</td>
<td className="px-4 py-2 tabular-nums">
  {formatPriceKopiyky(order.totalKopiyky)}
</td>
<td className="px-4 py-2">
  <OrderStatusBadge status={order.status} />
</td>
<Link href={`/admin/zamovlennia/${order.orderNumber}`} ...>Відкрити</Link>
```

**Client table shell** (minimal JS — prefer Link headers):

```typescript
"use client";

import Link from "next/link";
import {
  flexRender,
  getCoreRowModel,
  useReactTable,
  type ColumnDef,
} from "@tanstack/react-table";

const table = useReactTable({
  data,
  columns,
  getCoreRowModel: getCoreRowModel(),
  manualPagination: true,
  manualSorting: true,
  pageCount: totalPages,
  state: {
    pagination: { pageIndex: page - 1, pageSize },
    sorting: [{ id: sort, desc: dir === "desc" }],
  },
});
```

**Sort header:** `<Link href={adminOrdersUrl({ filter, page: 1, sort: "createdAt", dir: nextDir })}>` — toggle `dir` when same `sort`.

**Footer:** shadcn `Pagination` as `Link` components, not `table.nextPage()`.

---

### `src/components/admin/order-list-filters.tsx` (component, transform)

**Analog:** `src/components/admin/product-list-filters.tsx` L23-36 URL builders

**Current filter links** (L21-24) — extend with `adminOrdersUrl`:

```typescript
const href =
  filter.key === "all"
    ? "/admin/zamovlennia"
    : `/admin/zamovlennia?filter=${filter.key}`;
```

**Reset page on filter change** (D-08-10) — never pass `page` when filter/pageSize changes:

```typescript
href={adminOrdersUrl({ filter: filter.key, page: 1, pageSize, sort, dir })}
```

---

### `src/app/(admin)/admin/kategorii/page.tsx` (route, CRUD read) — ADM-03

**Analog:** same file — remove Slug column only

**Remove from thead/tbody** (L25-26, L38-40):

```typescript
<th className="px-4 py-2 font-medium">Slug</th>
// ...
<td className="px-4 py-2 text-muted-foreground">{category.slug}</td>
```

Slug remains in category edit form — no service changes.

---

### `prisma/schema.prisma` (model, CRUD schema)

**Analog:** same file `Conversation` L206-222

**Add enum + field + index:**

```prisma
enum ConversationStatus {
  OPEN
  ARCHIVED
}

model Conversation {
  // ...existing fields
  status ConversationStatus @default(OPEN)

  @@index([status, lastMessageAt])
}
```

Messages already `onDelete: Cascade` on `Message.conversation` — hard delete uses `prisma.conversation.delete`.

---

### `src/server/services/chat.service.ts` (service, CRUD + pub-sub)

**Analog:** same file — extend exports

**listConversationsForAdmin — add status filter** (current L268-273):

```typescript
export async function listConversationsForAdmin(options?: {
  status?: "OPEN" | "ARCHIVED";
}): Promise<ConversationSummaryDto[]> {
  const conversations = await prisma.conversation.findMany({
    where: options?.status ? { status: options.status } : undefined,
    orderBy: { lastMessageAt: "desc" },
  });
```

**countUnreadForAdmin — OPEN only** (L252-265):

```typescript
export async function countUnreadForAdmin(): Promise<number> {
  return prisma.conversation.count({
    where: {
      status: "OPEN",
      lastMessageSender: "BUYER",
      lastMessageAt: { not: null },
      AND: [
        {
          lastMessageAt: {
            gt: prisma.conversation.fields.adminLastReadAt,
          },
        },
      ],
    },
  });
}
```

**sendMessage guard** (insert in `sendMessage` after `resolveConversationForSend`, ~L184):

```typescript
if (conversation.status === "ARCHIVED") {
  throw new ChatServiceError(
    "CHAT_ARCHIVED",
    "Діалог закрито магазином. Написати більше не можна.",
  );
}
```

**New exports:** `archiveConversation`, `unarchiveConversation`, `deleteConversation` — thin `prisma.conversation.update` / `delete`.

**getOrCreateConversation** (L85-110): do **not** create new row when archived — return existing (D-08-25).

---

### `src/server/actions/admin/chat.actions.ts` (controller, request-response)

**Analog:** `src/server/actions/chat.actions.ts` L24-29 + `category.actions.ts` L39-46

**Lifecycle action skeleton:**

```typescript
"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/permissions";
import {
  archiveConversation,
  deleteConversation,
  unarchiveConversation,
} from "@/server/services/chat.service";
import { z } from "zod";

const conversationIdSchema = z.string().cuid("Невірний ідентифікатор діалогу");

export async function archiveConversationAction(conversationId: string) {
  await requireAdmin();
  const id = conversationIdSchema.parse(conversationId);
  await archiveConversation(id);
  revalidatePath("/admin/chaty");
  revalidatePath("/", "layout");
  return { ok: true as const };
}
```

**Mirror for:** `unarchiveConversationAction`, `deleteConversationAction` (no redirect; return `{ ok: true }`).

---

### `src/app/(admin)/admin/chaty/page.tsx` (route, CRUD read)

**Analog:** same file + `tovary/page.tsx` searchParams

```typescript
type PageProps = {
  searchParams: Promise<{ view?: string }>;
};

export default async function AdminChatyPage({ searchParams }: PageProps) {
  const { view } = await searchParams;
  const status = view === "archive" ? "ARCHIVED" : "OPEN";
  const conversations = await listConversationsForAdmin({ status });

  return <AdminChatInbox conversations={conversations} view={view ?? "active"} />;
}
```

---

### `src/components/chat/admin-chat-inbox.tsx` (component, CRUD read)

**Analog:** same file L23-54 + `order-list-filters.tsx` tab Links

**Tabs via searchParams** (add above grid):

```typescript
<Link
  href="/admin/chaty"
  className={cn(/* active when view !== archive */)}
>
  Активні
</Link>
<Link href="/admin/chaty?view=archive" className={cn(/* ... */)}>
  Архів
</Link>
```

Or shadcn `Tabs` with `Link` triggers after `npx shadcn add tabs`.

**Provider wiring** (L61-66) — pass `view` + lifecycle callbacks into `ChatThread`.

---

### `src/components/chat/chat-thread.tsx` (component, request-response)

**Analog:** `src/components/admin/order-status-select.tsx` L11-19, L46-76 (AlertDialog + transition)

**Thread header** (L70-90) — add `DropdownMenu` for Архівувати / Повернути / Видалити:

```typescript
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
```

**Delete confirm UA copy** (pattern from order cancel dialog in same file L80+):

```typescript
<AlertDialogDescription>
  Діалог і всі повідомлення будуть видалені назавжди. Цю дію не можна скасувати.
</AlertDialogDescription>
```

**After delete:** `setSelectedConversationId(null)` + `router.refresh()` (use `refreshAfterRead` from `useAdminChat` L129-131).

**Disable composer when archived:** conditionally omit `<AdminChatComposer />` when `selectedConversation.status === "ARCHIVED"`.

---

### `src/components/chat/admin-chat-provider.tsx` (provider, event-driven)

**Analog:** same file

**Post-lifecycle refresh** (L129-131):

```typescript
const refreshAfterRead = useCallback(() => {
  router.refresh();
}, [router]);
```

**Planner:** Add `refreshConversations()` that calls `router.refresh()` after archive/delete; clear `selectedConversationId` on delete. Sync `initialConversations` via existing `useEffect` L72-74.

**Extend `ConversationSummaryDto` usage:** map `status` from server into list items.

---

### `src/components/chat/chat-provider.tsx` + `chat-composer.tsx` (buyer read-only)

**Analog:** `chat-composer.tsx` `canSend` gate L40 + `ChatServiceError` mapping L14-22

**types/chat.ts** — extend DTO:

```typescript
export type ConversationSummaryDto = {
  // ...existing
  status: "OPEN" | "ARCHIVED";
};
```

**ChatProvider:** pass `canSend = status === "OPEN"` to panel/composer; banner «Діалог закрито магазином» when `ARCHIVED`.

**ChatComposer buyer send** — guard before POST:

```typescript
const canSend = trimmed.length > 0 && !overLimit && !isSending && conversationStatus === "OPEN";
```

**API route** `mapChatServiceError` — add `CHAT_ARCHIVED` → 403 (extend `src/app/api/chat/messages/route.ts` L34-44).

---

### `src/types/chat.ts` (model, transform)

**Analog:** same file L12-20 — add `status: "OPEN" | "ARCHIVED"` to `ConversationSummaryDto`.

---

### `src/server/services/chat.service.test.ts` (test, unit)

**Analog:** same file — mock pattern L16-37, describe blocks L47+

**Extend mock:**

```typescript
conversation: {
  // ...existing
  delete: vi.fn(),
},
```

**New cases:** `listConversationsForAdmin({ status: "OPEN" })`, `archiveConversation`, `deleteConversation`, `sendMessage` throws `CHAT_ARCHIVED`, `countUnreadForAdmin` filters `status: OPEN`.

---

### `src/server/services/admin-order.service.test.ts` (test, unit) — NEW

**Analog:** `src/server/services/chat.service.test.ts` L1-37 (prisma mock + describe)

**Test:** `listOrdersAdminPaginated` respects `page`, `pageSize`, `filter`, `sort`/`dir`; empty page when filter changes; `buildOrderWhere` for each filter key.

---

### `e2e/admin-chat.spec.ts` (test, e2e)

**Analog:** same file L4-22

**Keep selectors:**

```typescript
await expect(page.getByRole("link", { name: /^Чати/ })).toBeVisible();
```

**Touch only if** sidebar DOM breaks link accessibility (D-08-27). Archive/delete — manual checklist, not new e2e.

---

## Shared Patterns

### Authentication (all new admin actions)

**Source:** `src/server/actions/chat.actions.ts` L24-25

```typescript
export async function markAdminReadAction(conversationId: string) {
  await requireAdmin();
```

**Apply to:** `src/server/actions/admin/chat.actions.ts` — first line every export; never rely on layout alone (04-PATTERNS, PITFALLS).

---

### Server action revalidation (chat lifecycle + nav badge)

**Source:** `src/server/actions/chat.actions.ts` L27-28

```typescript
revalidatePath("/admin/chaty");
revalidatePath("/", "layout");
```

**Apply to:** archive, unarchive, delete actions.

---

### RSC + URL state (admin lists)

**Source:** `src/app/(admin)/admin/tovary/page.tsx` L20-48

| Concern | Pattern |
|---------|---------|
| `searchParams` | `Promise<{...}>` (Next 16) |
| Parse | Zod `.parse()` on awaited params |
| Fetch | Single page in RSC, not full list |
| Client | Links for sort/page/filter, minimal `useState` |

**Apply to:** `zamovlennia/page.tsx`, `chaty/page.tsx` (`view` param).

---

### Admin table markup

**Source:** `src/components/admin/orders-table.tsx` L28-30

```typescript
<div className="overflow-x-auto rounded-lg border border-border bg-background">
  <table className="w-full text-sm">
```

**Apply to:** `orders-data-table.tsx` — wrap shadcn `Table` with same outer div for visual continuity.

---

### AlertDialog confirmation (destructive admin)

**Source:** `src/components/admin/order-status-select.tsx` L11-19, L78-95

```typescript
<AlertDialog open={cancelOpen} onOpenChange={setCancelOpen}>
  <AlertDialogContent>
    <AlertDialogHeader>
      <AlertDialogTitle>...</AlertDialogTitle>
      <AlertDialogDescription>...</AlertDialogDescription>
    </AlertDialogHeader>
    <AlertDialogFooter>
      <AlertDialogCancel>Скасувати</AlertDialogCancel>
      <AlertDialogAction onClick={...}>...</AlertDialogAction>
    </AlertDialogFooter>
  </AlertDialogContent>
</AlertDialog>
```

**Apply to:** chat hard delete in `chat-thread.tsx`.

---

### ChatServiceError + API mapping

**Source:** `src/server/services/chat.service.ts` L20-27, `route.ts` L34-44

```typescript
export class ChatServiceError extends Error {
  constructor(
    public readonly code: string,
    message: string,
  ) {
    super(message);
  }
}
```

**Apply to:** `CHAT_ARCHIVED` in service + `mapChatServiceError` 403 branch.

---

### Vitest prisma mock

**Source:** `src/server/services/chat.service.test.ts` L16-37

**Apply to:** new `admin-order.service.test.ts`; extend chat mock with `delete`, `status` field on conversation objects.

---

## No Analog Found

| File | Role | Data Flow | Reason |
|------|------|-----------|--------|
| `src/components/ui/sidebar.tsx` | component | request-response | Not installed; shadcn CLI + `--sidebar-*` tokens in `globals.css` ready |
| `src/components/ui/pagination.tsx` | component | transform | Not installed; use shadcn CLI example from data-table docs |
| `src/components/ui/table.tsx` | component | transform | Not installed; project uses raw `<table>` — CLI adds shadcn Table primitives |
| `src/components/ui/tabs.tsx` | component | transform | Not installed; optional vs Link tabs (D-08-18) |

**Planner fallback:** Official shadcn Sidebar block + Data Table docs (`08-RESEARCH.md` Pattern 1–3); do not hand-roll mobile Sheet.

---

## Metadata

**Analog search scope:** `src/app/(admin)/`, `src/components/admin/`, `src/components/chat/`, `src/server/services/`, `src/server/actions/`, `src/server/validators/`, `prisma/`, `e2e/`
**Files scanned:** ~35
**Pattern extraction date:** 2026-05-17

**Cross-phase refs:** `.planning/phases/04-admin-operations/04-PATTERNS.md` (server actions), `.planning/phases/05-realtime-chat/05-PATTERNS.md` (chat service/API)
