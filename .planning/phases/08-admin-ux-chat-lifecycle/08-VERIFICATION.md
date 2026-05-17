---
phase: 08-admin-ux-chat-lifecycle
verified: 2026-05-17T20:12:00Z
status: human_needed
score: 8/8 must-haves verified
overrides_applied: 0
human_verification:
  - test: "Desktop (md+): sidebar visible; collapse to icon rail; all nav links work"
    expected: "Sidebar stays visible; SidebarRail collapses to icons; Замовлення, Чати (badge), Категорії navigate correctly"
    why_human: "Mobile Sheet vs desktop collapse requires viewport interaction; grep confirms structure only"
  - test: "Mobile (<md): SidebarTrigger opens Sheet; navigate or tap outside closes"
    expected: "Header trigger visible on mobile; overlay menu opens/closes without trapping content"
    why_human: "Sheet open/close behavior is runtime UI, not statically provable"
  - test: "Orders page — change page size 10/20/50 and paginate"
    expected: "URL uses `page` and `pageSize` query keys; row count matches; filter change resets page=1"
    why_human: "Browser URL sync and rendered row counts need live session"
  - test: "Orders page — click sortable column headers"
    expected: "`sort` and `dir` update in URL; table order changes for createdAt, total, orderNumber, status"
    why_human: "Sort toggle UX verified in unit tests for service; header Link behavior needs browser"
  - test: "Chat archive flow on /admin/chaty"
    expected: "Archive removes thread from Активні; appears under Архів; unarchive restores; toasts shown"
    why_human: "Multi-step admin flow with router.refresh; no Playwright coverage per D-08-27"
  - test: "Chat delete with AlertDialog confirm"
    expected: "Confirm UA copy; toast «Діалог видалено»; thread removed from list; optional DB shows no Conversation/Message rows"
    why_human: "Destructive action + DB cascade requires operator session or DB inspection"
  - test: "Buyer archived read-only in storefront chat"
    expected: "Banner «Діалог закрито магазином»; composer disabled with placeholder «Діалог закрито»; POST /api/chat/messages returns 403 CHAT_ARCHIVED"
    why_human: "Two-session flow (admin archives, buyer opens widget); API 403 covered in Vitest but buyer UI needs browser"
---

# Phase 8: Admin UX & Chat Lifecycle Verification Report

**Phase Goal:** Адмінка на shadcn Sidebar + Data Table; керування життєвим циклом чатів; дрібні фікси.

**Verified:** 2026-05-17T20:12:00Z

**Status:** human_needed

**Re-verification:** No — initial verification

## Goal Achievement

### Observable Truths

| # | Truth | Status | Evidence |
| --- | ------- | ---------- | -------------- |
| 1 | «Чернетки» на dashboard → `/admin/tovary?status=DRAFT` | ✓ VERIFIED | `src/app/(admin)/admin/page.tsx` StatCard `href="/admin/tovary?status=DRAFT"` |
| 2 | Admin layout uses `@/components/ui/sidebar` (mobile trigger + desktop collapse) | ✓ VERIFIED | `admin-sidebar-shell.tsx`: `SidebarProvider`, `SidebarTrigger` in `md:hidden` header; `app-sidebar.tsx`: `collapsible="icon"`, `SidebarRail` |
| 3 | `/admin/zamovlennia` — pagination, page size 10/20/50, column sort via URL | ✓ VERIFIED | `zamovlennia/page.tsx` → `listOrdersAdminPaginated`; `orders-data-table.tsx` + `adminOrdersUrl`; filter links force `page: 1` |
| 4 | Categories table without Slug column; edit form keeps slug | ✓ VERIFIED | `kategorii/page.tsx` headers: Назва/Товарів/Порядок only; `kategorii/[id]/page.tsx` still passes `slug` to form |
| 5 | Archived chat leaves active list, visible in «Архів» tab | ✓ VERIFIED | `chaty/page.tsx` maps `view=archive` → `status: ARCHIVED`; `listConversationsForAdmin({ status })`; inbox tabs Активні/Архів |
| 6 | Delete after confirm removes conversation from DB (messages cascade) | ✓ VERIFIED | `deleteConversation` → `prisma.conversation.delete`; `Message` `onDelete: Cascade`; `AlertDialog` UA copy in `chat-thread.tsx` |
| 7 | Buyer in ARCHIVED thread: history visible, cannot send, banner shown | ✓ VERIFIED | `chat-provider.tsx` `canSend` only when OPEN; `ArchivedChatBanner`; `chat-composer.tsx` disabled + placeholder; `sendMessage` throws `CHAT_ARCHIVED`; API maps to 403 |
| 8 | Phase regression tests pass | ✓ VERIFIED | `npm test` — 5 files, 71 tests passed (admin-order, chat.service, messages route) |

**Score:** 8/8 truths verified (automated)

**Note:** `08-MANUAL-CHECKLIST.md` item 5 says «admin can still reply» in archive tab; implementation hides `AdminChatComposer` when `status === ARCHIVED` (`chat-thread.tsx`). ROADMAP SC 5 does not require admin reply in archive — treat checklist line as outdated during UAT.

### Required Artifacts

| Artifact | Expected | Status | Details |
| -------- | ----------- | ------ | ------- |
| `src/app/(admin)/admin/page.tsx` | FIX-01 drafts link | ✓ VERIFIED | href with `status=DRAFT` |
| `src/components/admin/app-sidebar.tsx` | ADM-01 navigation | ✓ VERIFIED | 127 lines; nav items, badge, logout |
| `src/components/ui/sidebar.tsx` | shadcn primitives | ✓ VERIFIED | ~674 lines substantive |
| `src/components/admin/admin-sidebar-shell.tsx` | SidebarProvider shell | ✓ VERIFIED | Wired in `admin/layout.tsx` |
| `src/server/validators/admin-order.ts` | Zod URL contract | ✓ VERIFIED | pageSize 10/20/50, sort/dir |
| `src/server/services/admin-order.service.ts` | Paginated orders | ✓ VERIFIED | `skip/take`, totalKopiyky sort |
| `src/components/admin/orders-data-table.tsx` | Data Table UI | ✓ VERIFIED | Link-driven sort/pagination |
| `src/app/(admin)/admin/kategorii/page.tsx` | No Slug column | ✓ VERIFIED | 4 data columns + edit link |
| `prisma/schema.prisma` + migration | ConversationStatus | ✓ VERIFIED | enum OPEN/ARCHIVED; `20260517165509_conversation_status` |
| `src/server/services/chat.service.ts` | Lifecycle + guards | ✓ VERIFIED | archive/unarchive/delete; `CHAT_ARCHIVED` |
| `src/server/actions/admin/chat.actions.ts` | requireAdmin actions | ✓ VERIFIED | archive/unarchive/delete |
| `src/components/chat/admin-chat-inbox.tsx` | Active/Archive tabs | ✓ VERIFIED | `view` param via `buildAdminChatHref` |
| `src/components/chat/chat-thread.tsx` | Lifecycle dropdown + delete dialog | ✓ VERIFIED | Actions wired to server actions |
| `.planning/phases/08-admin-ux-chat-lifecycle/08-MANUAL-CHECKLIST.md` | Operator gate | ✓ VERIFIED | 7 manual sections + test commands |

### Key Link Verification

| From | To | Via | Status | Details |
| ---- | --- | --- | ------ | ------- |
| `admin/layout.tsx` | `countUnreadForAdmin` | server fetch | ✓ WIRED | Only OPEN conversations in `where.status` |
| `app-sidebar.tsx` | `/admin/chaty` | nav + badge | ✓ WIRED | `unreadChatCount` prop |
| `zamovlennia/page.tsx` | `listOrdersAdminPaginated` | `listOrdersAdminSchema.parse` | ✓ WIRED | RSC fetch one page |
| `orders-data-table.tsx` | `adminOrdersUrl` | Link hrefs | ✓ WIRED | Headers, pagination, page size |
| `chaty/page.tsx` | `listConversationsForAdmin` | status from view | ✓ WIRED | OPEN vs ARCHIVED split |
| `chat-thread.tsx` | `admin/chat.actions.ts` | server actions | ✓ WIRED | archive/unarchive/delete |
| `sendMessage` | `conversation.status` | `CHAT_ARCHIVED` guard | ✓ WIRED | Before message create |
| `api/chat/messages/route.ts` | `sendMessage` | 403 on archived | ✓ WIRED | route.test.ts |
| `chat-composer.tsx` | `canSend` from ChatProvider | disabled when ARCHIVED | ✓ WIRED | `composerDisabled` |

### Data-Flow Trace (Level 4)

| Artifact | Data Variable | Source | Produces Real Data | Status |
| -------- | ------------- | ------ | ------------------ | ------ |
| `OrdersDataTable` | `data` prop | `listOrdersAdminPaginated` → Prisma `order.findMany` | Yes | ✓ FLOWING |
| `AdminChatInbox` | `conversations` | `listConversationsForAdmin` → Prisma filtered by status | Yes | ✓ FLOWING |
| `ChatProvider` | `conversationStatus` | `getOrCreateConversation` / initial prop | Yes | ✓ FLOWING |
| `countUnreadForAdmin` | badge count | Prisma count OPEN + unread predicate | Yes | ✓ FLOWING |

### Behavioral Spot-Checks

| Behavior | Command | Result | Status |
| -------- | ------- | ------ | ------ |
| Admin order pagination/sort validators | `npm test -- admin-order` (3 files) | 71 tests passed (5 files total) | ✓ PASS |
| Chat lifecycle + API 403 | included in run above | All green | ✓ PASS |
| Module exports chat actions | grep `archiveConversationAction` in `chat-thread.tsx` | Present | ✓ PASS |

**Step 7b:** Runnable unit tests executed; no dev server started.

### Probe Execution

No phase-declared `probe-*.sh` scripts. **Skipped.**

### Requirements Coverage

| Requirement | Source Plan | Description | Status | Evidence |
| ----------- | ---------- | ----------- | ------ | -------- |
| FIX-01 | 08-01 | Drafts link with query | ✓ SATISFIED | `admin/page.tsx` href |
| ADM-01 | 08-01 | shadcn Sidebar, mobile collapse | ✓ SATISFIED | Sidebar shell + app-sidebar (human UAT for Sheet) |
| ADM-02 | 08-02, 08-03 | Orders Data Table + pagination | ✓ SATISFIED | Service + UI + tests |
| ADM-03 | 08-04 | No Slug in categories table | ✓ SATISFIED | `kategorii/page.tsx` |
| CHAT-05 | 08-05, 08-06, 08-07 | Admin archive dialog | ✓ SATISFIED | Schema + services + tabs + actions |
| CHAT-06 | 08-05, 08-06 | Hard delete with confirm | ✓ SATISFIED | `deleteConversation` + AlertDialog |

**Traceability note:** `.planning/REQUIREMENTS.md` still marks FIX-01 and ADM-01 as Pending — implementation exists; update traceability table after human sign-off.

### Anti-Patterns Found

| File | Line | Pattern | Severity | Impact |
| ---- | ---- | ------- | -------- | ------ |
| — | — | None blocking in phase touchpoints | — | `admin-nav.tsx` deprecated re-export only; no TBD/FIXME in phase files |

### Human Verification Required

See frontmatter `human_verification` and `08-MANUAL-CHECKLIST.md`. Operator must run checklist before closing phase. Use URL key `page` (not `сторінка` — checklist typo).

### Gaps Summary

No automated gaps found. Phase code and unit tests satisfy ROADMAP success criteria and plan must-haves. **Blocking operator UAT** remains per `08-MANUAL-CHECKLIST.md` and mobile/chat flows that grep cannot validate.

---

_Verified: 2026-05-17T20:12:00Z_

_Verifier: Claude (gsd-verifier)_
