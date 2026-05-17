---
phase: 08-admin-ux-chat-lifecycle
reviewed: 2026-05-17T20:00:00Z
depth: standard
files_reviewed: 41
files_reviewed_list:
  - src/app/(admin)/admin/page.tsx
  - src/app/(admin)/admin/layout.tsx
  - src/app/(admin)/admin/zamovlennia/page.tsx
  - src/app/(admin)/admin/kategorii/page.tsx
  - src/app/(admin)/admin/chaty/page.tsx
  - src/app/api/chat/messages/route.ts
  - src/app/api/chat/messages/route.test.ts
  - src/components/admin/app-sidebar.tsx
  - src/components/admin/admin-sidebar-shell.tsx
  - src/components/admin/admin-nav-items.ts
  - src/components/admin/admin-nav.tsx
  - src/components/admin/orders-data-table.tsx
  - src/components/admin/order-list-filters.tsx
  - src/components/ui/sidebar.tsx
  - src/components/ui/pagination.tsx
  - src/components/ui/table.tsx
  - src/components/ui/tabs.tsx
  - src/hooks/use-mobile.ts
  - src/lib/admin/orders-url.ts
  - src/lib/admin/orders-url.test.ts
  - src/lib/admin-chat-url.ts
  - src/server/validators/admin-order.ts
  - src/server/validators/admin-order.test.ts
  - src/server/services/admin-order.service.ts
  - src/server/services/admin-order.service.test.ts
  - src/server/services/chat.service.ts
  - src/server/services/chat.service.test.ts
  - src/server/actions/admin/chat.actions.ts
  - src/server/actions/chat.actions.ts
  - src/types/chat.ts
  - src/components/chat/admin-chat-inbox.tsx
  - src/components/chat/admin-chat-provider.tsx
  - src/components/chat/conversation-list.tsx
  - src/components/chat/chat-thread.tsx
  - src/components/chat/chat-provider.tsx
  - src/components/chat/chat-provider-gate.tsx
  - src/components/chat/chat-panel.tsx
  - src/components/chat/chat-composer.tsx
  - src/components/chat/archived-chat-banner.tsx
  - prisma/schema.prisma
  - e2e/admin-chat.spec.ts
findings:
  critical: 0
  warning: 4
  info: 3
  total: 7
status: issues_found
---

# Phase 08: Code Review Report

**Reviewed:** 2026-05-17T20:00:00Z  
**Depth:** standard  
**Files Reviewed:** 35  
**Status:** issues_found

## Summary

Phase 08 delivers admin sidebar chrome, paginated orders Data Table, category list cleanup, and full chat lifecycle (archive/unarchive/hard delete) with buyer read-only archived state. Server-side guards (`CHAT_ARCHIVED`, `assertConversationAccess`, `requireAdmin`) are generally sound; raw SQL for `totalKopiyky` sort uses parameterized Prisma templates.

No critical security or data-loss defects were proven in reviewed source. Four warnings remain around URL/query robustness and admin chat navigation state after lifecycle mutations. Three info items cover duplication and a future footgun in the buyer POST payload.

## Critical Issues

_None._

## Warnings

### WR-01: Unhandled Zod errors on orders list page

**File:** `src/app/(admin)/admin/zamovlennia/page.tsx:23`  
**Issue:** `listOrdersAdminSchema.parse(rawParams)` throws on invalid `filter`, `pageSize`, `page`, etc. (e.g. `?pageSize=99` or `?filter=evil`). There is no `safeParse` fallback or redirect, so a crafted admin URL can surface an unhandled error instead of a controlled empty/default state.  
**Fix:** Mirror a tolerant pattern:

```typescript
const parsed = listOrdersAdminSchema.safeParse(rawParams);
const params = parsed.success
  ? parsed.data
  : listOrdersAdminSchema.parse({}); // defaults
```

Or redirect to `adminOrdersUrl()` when `!parsed.success`.

---

### WR-02: Orders pagination accepts out-of-range `page`

**File:** `src/server/services/admin-order.service.ts:219-240`, `src/components/admin/orders-data-table.tsx:361-363`  
**Issue:** `page` is capped at 1000 but not clamped to `totalPages`. A URL like `?page=50` with few orders returns an empty table while the footer still shows `Сторінка 50 з N`, which looks like broken data rather than an invalid page.  
**Fix:** After computing `totalPages`, clamp `page` before `skip`:

```typescript
const totalPages = computeTotalPages(total, params.pageSize);
const page = Math.min(Math.max(1, params.page), totalPages);
const skip = (page - 1) * params.pageSize;
```

Return the clamped `page` in the response so the UI stays consistent.

---

### WR-03: Unarchive leaves stale URL selection on archive tab

**File:** `src/components/chat/chat-thread.tsx:108-117`  
**Issue:** `handleUnarchive` calls `refreshInbox()` only. The conversation moves to `OPEN` and disappears from the archive list, but `selectedConversationId` and `?conversationId=` in the URL can remain set. `selectedConversation` becomes `null`, so the thread pane shows “Оберіть діалог” while the URL still references a conversation that is no longer in the archive view.  
**Fix:** After successful unarchive, navigate to the active tab with the same conversation selected:

```typescript
router.replace(buildAdminChatHref("active", selectedConversationId));
router.refresh();
```

Or clear selection via `clearSelectionAndRefresh()` and toast that the dialog moved to “Активні”.

---

### WR-04: Admin chat tabs preserve `conversationId` across incompatible views

**File:** `src/components/chat/admin-chat-inbox.tsx:43-66`, `src/lib/admin-chat-url.ts:3-15`  
**Issue:** Tab links call `buildAdminChatHref(view, conversationId)` and keep the current `conversationId` when switching between Active and Archive. `AdminChatInbox` correctly nulls selection when the ID is absent from the filtered list, but the URL can still carry `?conversationId=…` on the wrong tab, causing confusing deep links and empty thread state.  
**Fix:** When building tab hrefs, omit `conversationId` unless it exists in the target list, or always drop it on tab change:

```typescript
buildAdminChatHref("archive", null) // when switching views
```

## Info

### IN-01: Duplicate `useIsMobile` hook

**File:** `src/components/chat/admin-chat-inbox.tsx:13-25`  
**Issue:** Plan 08-01 added `src/hooks/use-mobile.ts`, but `admin-chat-inbox.tsx` reimplements the same `matchMedia` logic inline (also duplicated in `chat-panel.tsx`).  
**Fix:** Import and reuse `useIsMobile` from `@/hooks/use-mobile` in both components.

---

### IN-02: Buyer POST sends `conversationId` the server ignores

**File:** `src/components/chat/chat-composer.tsx:76-80`, `src/app/api/chat/messages/route.ts:95-103`  
**Issue:** The buyer composer includes `conversationId` in the JSON body, but the route only passes `userId` into `sendMessage`. Safe today, but a future refactor that forwards `parsed.data.conversationId` for buyers would introduce IDOR unless `assertConversationAccess` runs first.  
**Fix:** Remove the unused field from the buyer payload, or document and enforce access in the route before calling `sendMessage`.

---

### IN-03: `markAdminReadAction` lacks CUID validation

**File:** `src/server/actions/chat.actions.ts:24-29`  
**Issue:** Lifecycle actions in `admin/chat.actions.ts` validate IDs with Zod `cuid()`, but `markAdminReadAction` passes `conversationId` straight to Prisma. Garbage IDs yield Prisma errors instead of a controlled failure.  
**Fix:** Reuse `conversationIdSchema.parse(conversationId)` before `markAdminRead`.

---

_Reviewed: 2026-05-17T20:00:00Z_  
_Reviewer: Claude (gsd-code-reviewer)_  
_Depth: standard_
