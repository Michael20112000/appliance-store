# Phase 14: Admin Chat Context Menu — Pattern Map

**Mapped:** 2026-05-18  
**Files analyzed:** 10 (new/modified + optional)  
**Analogs found:** 9 / 10

## File Classification

| New/Modified File | Role | Data Flow | Closest Analog | Match Quality |
|-------------------|------|-----------|----------------|---------------|
| `src/components/ui/context-menu.tsx` | component (UI primitive) | request-response | `src/components/ui/dropdown-menu.tsx` | exact |
| `src/components/chat/use-conversation-lifecycle-actions.ts` | hook | CRUD + event-driven (server actions) | `src/components/chat/chat-thread.tsx` (handlers) + `admin-chat-provider.tsx` | exact |
| `src/components/chat/conversation-lifecycle-menu-items.tsx` | component | transform (visibility rules) | `src/components/chat/chat-thread.tsx` (menu items) | exact |
| `src/components/chat/conversation-lifecycle-delete-dialog.tsx` | component | request-response | `src/components/chat/chat-thread.tsx` (AlertDialog) | exact |
| `src/components/chat/conversation-list.tsx` | component | request-response | `conversation-list.tsx` + `chat-thread.tsx` (trigger `render`) | exact |
| `src/components/chat/chat-thread.tsx` | component | request-response | `chat-thread.tsx` (refactor source) | exact |
| `src/components/chat/admin-chat-inbox.tsx` | component | request-response | `admin-chat-inbox.tsx` (`useIsMobile`) | exact |
| `e2e/admin-chat.spec.ts` | test | request-response | `e2e/admin-chat.spec.ts` + `e2e/home-layout.spec.ts` | role-match |
| `.planning/phases/14-admin-chat-context-menu/14-MANUAL-CHECKLIST.md` | config/docs | — | `11-MANUAL-CHECKLIST.md`, `08-MANUAL-CHECKLIST.md` | role-match |
| `src/components/chat/conversation-lifecycle-menu-items.test.tsx` | test | transform | `src/components/admin/order-list-status-select.test.tsx` | partial |

**Unchanged (consume only):** `src/server/actions/admin/chat.actions.ts`, `src/components/chat/admin-chat-provider.tsx`

---

## Pattern Assignments

### `src/components/ui/context-menu.tsx` (component, request-response)

**Analog:** `src/components/ui/dropdown-menu.tsx`

**Install pattern** (RESEARCH — no file in repo yet):

```bash
npx shadcn@latest add context-menu
```

**Structural analog** — Base UI menu primitive + same styling slots as dropdown (lines 1–50):

```1:50:src/components/ui/dropdown-menu.tsx
"use client"

import * as React from "react"
import { Menu as MenuPrimitive } from "@base-ui/react/menu"

import { cn } from "@/lib/utils"
import { ChevronRightIcon, CheckIcon } from "lucide-react"

function DropdownMenu({ ...props }: MenuPrimitive.Root.Props) {
  return <MenuPrimitive.Root data-slot="dropdown-menu" {...props} />
}
// ...
function DropdownMenuItem({
  className,
  inset,
  variant = "default",
  ...props
}: MenuPrimitive.Item.Props & {
  inset?: boolean
  variant?: "default" | "destructive"
}) {
  return (
    <MenuPrimitive.Item
      data-slot="dropdown-menu-item"
      data-variant={variant}
      className={cn(
        "group/dropdown-menu-item relative flex cursor-default items-center gap-1.5 rounded-md px-1.5 py-1 text-sm outline-hidden select-none focus:bg-accent focus:text-accent-foreground not-data-[variant=destructive]:focus:**:text-accent-foreground data-inset:pl-7 data-[variant=destructive]:text-destructive data-[variant=destructive]:focus:bg-destructive/10 data-[variant=destructive]:focus:text-destructive dark:data-[variant=destructive]:focus:bg-destructive/20 data-disabled:pointer-events-none data-disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4 data-[variant=destructive]:*:[svg]:text-destructive",
        className
      )}
      {...props}
    />
  )
}
```

**Planner note:** Generated `ContextMenuItem` should mirror `variant="destructive"` API so shared menu items accept `typeof DropdownMenuItem | typeof ContextMenuItem`.

---

### `src/components/chat/use-conversation-lifecycle-actions.ts` (hook, CRUD)

**Analog:** `src/components/chat/chat-thread.tsx` + `src/components/chat/admin-chat-provider.tsx`

**Imports pattern** (from `chat-thread.tsx` lines 3–14, 6):

```3:14:src/components/chat/chat-thread.tsx
import { useEffect, useRef, useState, useTransition } from "react";
import { ArrowLeft, MoreVertical } from "lucide-react";
import { toast } from "sonner";
import { useAdminChat } from "@/components/chat/admin-chat-provider";
// ...
import {
  archiveConversationAction,
  deleteConversationAction,
  unarchiveConversationAction,
} from "@/server/actions/admin/chat.actions";
```

**Core lifecycle handlers** (lines 96–131) — extract verbatim logic, parameterize `conversationId`:

```96:131:src/components/chat/chat-thread.tsx
  const handleArchive = () => {
    startTransition(async () => {
      try {
        await archiveConversationAction(selectedConversationId);
        toast.success("Діалог архівовано");
        clearSelectionAndRefresh();
      } catch {
        toast.error("Не вдалося архівувати діалог");
      }
    });
  };

  const handleUnarchive = () => {
    startTransition(async () => {
      try {
        await unarchiveConversationAction(selectedConversationId);
        toast.success("Діалог повернуто в активні");
        refreshInbox();
      } catch {
        toast.error("Не вдалося повернути діалог з архіву");
      }
    });
  };

  const handleDelete = () => {
    startTransition(async () => {
      try {
        await deleteConversationAction(selectedConversationId);
        toast.success("Діалог видалено");
        setDeleteOpen(false);
        clearSelectionAndRefresh();
      } catch {
        toast.error("Не вдалося видалити діалог");
      }
    });
  };
```

**Post-action refresh (D-14-08)** — extend thread behavior when `conversationId !== selectedConversationId`:

```98:106:src/components/chat/admin-chat-provider.tsx
  const refreshInbox = useCallback(() => {
    router.refresh();
  }, [router]);

  const clearSelectionAndRefresh = useCallback(() => {
    setSelectedConversationIdState(null);
    router.replace(buildAdminChatHref(view, null), { scroll: false });
    router.refresh();
  }, [router, view]);
```

**Recommended hook shape:**

```typescript
// useAdminChat(): view, selectedConversationId, clearSelectionAndRefresh, refreshInbox
function afterArchiveOrDelete(conversationId: string) {
  if (selectedConversationId === conversationId) {
    clearSelectionAndRefresh();
  } else {
    refreshInbox();
  }
}
// unarchive: always refreshInbox() (thread today)
```

**Secondary analog** — `useTransition` + `toast` + `router.refresh` in admin list controls (`order-list-status-select.tsx` lines 44–45, 66–91).

**Server actions** (no changes) — `src/server/actions/admin/chat.actions.ts` lines 21–42:

```21:42:src/server/actions/admin/chat.actions.ts
export async function archiveConversationAction(conversationId: string) {
  await requireAdmin();
  const id = conversationIdSchema.parse(conversationId);
  await archiveConversation(id);
  revalidateAdminChat();
  return { ok: true as const };
}
// unarchiveConversationAction, deleteConversationAction — same shape
```

---

### `src/components/chat/conversation-lifecycle-menu-items.tsx` (component, transform)

**Analog:** `src/components/chat/chat-thread.tsx` (DropdownMenuContent items)

**Visibility rules** (lines 172–188) — single source of truth:

```172:188:src/components/chat/chat-thread.tsx
            {view === "active" && selectedConversation.status === "OPEN" ? (
              <DropdownMenuItem onClick={handleArchive} disabled={pending}>
                Архівувати
              </DropdownMenuItem>
            ) : null}
            {view === "archive" && isArchived ? (
              <DropdownMenuItem onClick={handleUnarchive} disabled={pending}>
                Повернути з архіву
              </DropdownMenuItem>
            ) : null}
            <DropdownMenuItem
              variant="destructive"
              onClick={() => setDeleteOpen(true)}
              disabled={pending}
            >
              Видалити назавжди
            </DropdownMenuItem>
```

**Polymorphic `Item` prop:** Accept `React.ComponentType` with `onClick`, `disabled`, `variant?: "destructive"` — both `DropdownMenuItem` and generated `ContextMenuItem` match `dropdown-menu.tsx` Item API (lines 76–96).

**Types:** `ConversationStatus` from `@/types/chat` / Prisma; `AdminChatView` from `@/lib/admin-chat-url`.

---

### `src/components/chat/conversation-lifecycle-delete-dialog.tsx` (component, request-response)

**Analog:** `src/components/chat/chat-thread.tsx` (AlertDialog block)

**Imports** (lines 15–24):

```15:24:src/components/chat/chat-thread.tsx
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

**UA copy — must not change** (lines 219–238):

```219:238:src/components/chat/chat-thread.tsx
      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Видалити діалог назавжди?</AlertDialogTitle>
            <AlertDialogDescription>
              Усі повідомлення буде видалено без можливості відновлення.
              Покупець більше не побачить цей діалог.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={pending}>Скасувати</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              disabled={pending}
              onClick={handleDelete}
            >
              Видалити
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
```

**Destructive confirm pattern** (secondary): `order-list-status-select.tsx` lines 136–159 — same `AlertDialogAction variant="destructive"` + `pending` disable.

---

### `src/components/chat/conversation-list.tsx` (component, request-response)

**Analogs:** Current list row (`conversation-list.tsx`) + `chat-thread.tsx` `DropdownMenuTrigger` `render` pattern

**Existing listbox row** (lines 68–114) — preserve `role="listbox"` / `role="option"`:

```69:91:src/components/chat/conversation-list.tsx
    <div
      className="flex flex-col overflow-y-auto border-r border-border"
      role="listbox"
      aria-label="Діалоги з покупцями"
    >
      {conversations.map((conversation) => {
        // ...
          <button
            key={conversation.id}
            type="button"
            role="option"
            aria-selected={isSelected}
            onClick={() => onSelect(conversation.id)}
            className={cn(
              "flex min-h-14 w-full items-start gap-3 px-3 py-3 text-left transition-colors hover:bg-muted/50",
```

**Trigger composition** (from `chat-thread.tsx` lines 156–170) — apply to `ContextMenuTrigger`:

```156:170:src/components/chat/chat-thread.tsx
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="size-11 shrink-0"
                aria-label="Дії з діалогом"
                disabled={pending}
              />
            }
          >
            <MoreVertical className="size-4" aria-hidden />
          </DropdownMenuTrigger>
```

**Target pattern for inbox row (desktop only):**

```tsx
// When enableContextMenu === true:
<ContextMenu>
  <ContextMenuTrigger
    nativeButton
    render={
      <button
        type="button"
        role="option"
        aria-selected={isSelected}
        aria-label="Дії з діалогом"
        onClick={() => onSelect(conversation.id)}
        onContextMenu={(e) => e.preventDefault()}
        className={rowClassName}
      />
    }
  />
  <ContextMenuContent>
    <ConversationLifecycleMenuItems Item={ContextMenuItem} ... />
  </ContextMenuContent>
</ContextMenu>
// When enableContextMenu === false: plain <button role="option" ...> (current markup)
```

**New props:**

```typescript
enableContextMenu?: boolean; // default false; parent passes !isMobile
```

**Row subcomponent:** Extract `ConversationListRow` (client) that calls `useConversationLifecycleActions(conversation.id, conversation.status)` + `useAdminChat().view` — provider tree verified: only `admin-chat-inbox.tsx` mounts `ConversationList`.

**Phase 11 nested control pattern** (future / if nested controls added) — `stopPropagation` on pointer/click:

```49:50:src/components/admin/product-list-status-select.tsx
            onClick={(event) => event.stopPropagation()}
            onPointerDown={(event) => event.stopPropagation()}
```

---

### `src/components/chat/chat-thread.tsx` (component, request-response)

**Analog:** Self — refactor consumer only; **keep** `DropdownMenu` (D-14-02).

**Thread menu trigger** stays as-is (lines 156–190); replace inline handlers + menu items + AlertDialog with shared hook/components.

**Do not replace** `DropdownMenu` with `ContextMenu` on the ⋮ button.

---

### `src/components/chat/admin-chat-inbox.tsx` (component, request-response)

**Analog:** Existing local `useIsMobile` (lines 13–25, 71–103)

**Mobile breakpoint** (767px — matches layout `md:` split):

```13:25:src/components/chat/admin-chat-inbox.tsx
function useIsMobile() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const media = window.matchMedia("(max-width: 767px)");
    const update = () => setIsMobile(media.matches);
    update();
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);

  return isMobile;
}
```

**Pass prop to list** (line 96 area):

```96:103:src/components/chat/admin-chat-inbox.tsx
          <ConversationList
            conversations={conversations}
            selectedId={selectedConversationId}
            onSelect={setSelectedConversationId}
            showUnreadHighlight={view === "active"}
            emptyTitle={emptyTitle}
            emptyBody={emptyBody}
          />
```

Add: `enableContextMenu={!isMobile}`

**Alternative (shared hook):** `src/hooks/use-mobile.ts` uses `768` breakpoint (`MOBILE_BREAKPOINT - 1` = 767px) — equivalent; inbox already duplicates inline hook — **prefer extending inbox pattern** for consistency with Phase 8 mobile list/thread split.

**Critical (D-14-09):** Omit entire `ContextMenu` subtree on mobile — Base UI opens on long-press, not only right-click.

---

### `e2e/admin-chat.spec.ts` (test, request-response)

**Analog:** `e2e/admin-chat.spec.ts` (existing flow) + `e2e/home-layout.spec.ts` (mobile viewport)

**Existing admin chat test** (lines 1–25):

```1:25:e2e/admin-chat.spec.ts
import { expect, test } from "@playwright/test";
import { loginAsAdmin } from "./helpers/admin";

test("admin chat inbox loads with enabled nav", async ({ page }) => {
  await loginAsAdmin(page);
  await page.goto("/admin/chaty");
  // ...
  const firstConversation = page.getByRole("option").first();
  if (await firstConversation.isVisible()) {
    await firstConversation.click();
```

**Right-click pattern** (no existing e2e in repo — use Playwright API):

```typescript
await page.setViewportSize({ width: 1280, height: 720 });
await firstRow.click({ button: "right" });
await expect(page.getByRole("menuitem", { name: "Архівувати" })).toBeVisible();
```

**Mobile viewport analog** (`home-layout.spec.ts` lines 1–3):

```1:3:e2e/home-layout.spec.ts
import { expect, test } from "@playwright/test";

test.use({ viewport: { width: 390, height: 844 } });
```

**Mobile negative test:** after right-click on `option`, `page.getByRole("menuitem")` count `0`.

**Locator note:** Menu renders in portal — use page-level `getByRole('menuitem')`, not row subtree.

**Data caveat:** Skip or guard when no `option` rows (same as existing spec line 14 `if (await firstConversation.isVisible())`).

---

### `.planning/phases/14-admin-chat-context-menu/14-MANUAL-CHECKLIST.md` (optional)

**Analog:** `11-MANUAL-CHECKLIST.md` table format (route | action | expected | pass).

**D-14-16 items:** ПКМ не ламає лівий клік; delete confirm; row disappears; mobile — thread ⋮ only.

---

## Shared Patterns

### `useAdminChat()` context

**Source:** `src/components/chat/admin-chat-provider.tsx`  
**Apply to:** Hook, list row, thread (after refactor)

```25:43:src/components/chat/admin-chat-provider.tsx
type AdminChatContextValue = {
  view: AdminChatView;
  conversations: ConversationSummaryDto[];
  selectedConversationId: string | null;
  selectedConversation: ConversationSummaryDto | null;
  // ...
  clearSelectionAndRefresh: () => void;
  refreshInbox: () => void;
```

### Base UI menu `render` + `nativeButton`

**Source:** `src/components/chat/chat-thread.tsx` (DropdownMenuTrigger)  
**Apply to:** ContextMenuTrigger on inbox row

Always use `render={<button ... />}` + `nativeButton` — do not nest `<button role="option">` inside default div trigger.

### Ukrainian UI copy + sonner toasts

**Source:** `chat-thread.tsx` handlers  
**Apply to:** Shared hook — toast strings are fixed product copy.

### Server actions + admin auth

**Source:** `src/server/actions/admin/chat.actions.ts`  
**Apply to:** Hook only — `requireAdmin()` unchanged server-side.

### Admin list row interaction (Phase 11)

**Source:** `src/lib/admin/clickable-table-row.ts`, `product-list-status-select.tsx`  
**Apply to:** This phase only if row gains nested controls; context menu items should not bubble to row `onClick` (Base UI handles on close).

```18:21:src/lib/admin/clickable-table-row.ts
export function suppressAdminRowNavigation(durationMs = 400) {
  suppressRowNavigationUntil = Date.now() + durationMs;
}
```

Not required for RCM-only row (D-14-12) unless ghost-click issues appear after menu close.

---

## No Analog Found

| File | Role | Data Flow | Reason |
|------|------|-----------|--------|
| `conversation-lifecycle-menu-items.test.tsx` | test | transform | No pure visibility-matrix unit test in chat; use `order-list-status-select.test.tsx` structure if added |

| `src/components/ui/context-menu.tsx` | component | request-response | File does not exist yet — **create via shadcn CLI**; structural analog is `dropdown-menu.tsx` |

---

## Metadata

**Analog search scope:** `src/components/chat/`, `src/components/ui/`, `src/components/admin/`, `src/server/actions/admin/`, `src/hooks/`, `src/lib/admin/`, `e2e/`  
**Files scanned:** ~25  
**Pattern extraction date:** 2026-05-18
