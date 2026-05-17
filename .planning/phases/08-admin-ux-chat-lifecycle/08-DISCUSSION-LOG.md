# Phase 8: Admin UX & Chat Lifecycle - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-05-17
**Phase:** 8-admin-ux-chat-lifecycle
**Areas discussed:** Sidebar shell, Orders Data Table, Categories Slug, Chat archive UX, Chat archive navigation, Buyer archived behavior, Chat delete policy, Dashboard drafts fix

---

## Sidebar shell (ADM-01)

| Option | Description | Selected |
|--------|-------------|----------|
| Sheet on mobile + persistent sidebar desktop | shadcn SidebarProvider, SidebarTrigger, collapsible icon on md+ | ✓ |
| Keep current CSS grid aside | No shadcn sidebar component | |
| Separate /admin routes per section | Bigger restructure | |

**User's choice:** Delegated to Claude («все на свій вибір»)
**Notes:** Standard shadcn Sidebar block; preserve nav items and unread badge.

---

## Orders Data Table (ADM-02)

| Option | Description | Selected |
|--------|-------------|----------|
| Server-side pagination + URL sort/filter | page, pageSize 10/20/50, sort columns | ✓ |
| Client-side TanStack on full `listAllOrders` | Simpler but loads all rows | |
| Drop status filter tabs | Conflicts with existing UX | |

**User's choice:** Delegated to Claude
**Notes:** Keep OrderListFilters; default pageSize 20; sort createdAt/total/orderNumber/status.

---

## Chat lifecycle — admin UX (CHAT-05/06)

| Option | Description | Selected |
|--------|-------------|----------|
| Actions in thread header + AlertDialog delete | Archive, restore, hard delete | ✓ |
| List-only actions | Less discoverable | |
| No restore from archive | Worse ops UX | |

**User's choice:** Delegated to Claude
**Notes:** Restore from archive included.

---

## Chat archive navigation

| Option | Description | Selected |
|--------|-------------|----------|
| Tabs on `/admin/chaty` (`view=active\|archive`) | Single page, same split layout | ✓ |
| Separate `/admin/chaty/arkhiv` route | Extra routing | |

**User's choice:** Delegated to Claude
**Notes:** Unread badge counts OPEN only.

---

## Buyer behavior when archived

| Option | Description | Selected |
|--------|-------------|----------|
| Read-only widget + block send | Banner + disabled composer | ✓ |
| Buyer can still send (admin sees in archive) | Noisy for closed chats | |

**User's choice:** Delegated to Claude
**Notes:** Same Conversation row; server rejects send.

---

## Chat delete policy (CHAT-06)

| Option | Description | Selected |
|--------|-------------|----------|
| Hard delete + cascade messages | Matches «немає в БД» | ✓ |
| Soft delete `deletedAt` | ROADMAP mentioned as optional | |

**User's choice:** Delegated to Claude
**Notes:** `ConversationStatus` enum for archive only.

---

## Categories / Dashboard (ADM-03, FIX-01)

| Option | Description | Selected |
|--------|-------------|----------|
| Remove Slug column; fix StatCard href | Minimal change | ✓ |

**User's choice:** Delegated to Claude

---

## Claude's Discretion

All six gray areas from discuss-phase presentation — user message: «все на свій вибір, дивись сам як краще буде».

## Deferred Ideas

- Data Table for products/categories admin lists
- Soft-delete conversations
- Push notifications for chat
