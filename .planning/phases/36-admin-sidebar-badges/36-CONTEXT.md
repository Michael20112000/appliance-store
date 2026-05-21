# Phase 36: Admin sidebar badges - Context

**Gathered:** 2026-05-21
**Status:** Ready for planning

<domain>
## Phase Boundary

Admin sidebar показує що потребує уваги оператора: додати badge-лічильники до nav пунктів відповідно до ADM-NAV-01.

**In scope:** Categories (total), Products (total), Orders (pending/hanging), Chats (unresolved — вже є, можливо рефактор), Callbacks/Дзвінки (unresolved).

**Out of scope:** Storefront changes, badge click-through behaviour, badge animation, push notifications.

**Requirements:** ADM-NAV-01

</domain>

<decisions>
## Implementation Decisions

### Orders "висячі" rule
- **D-01:** "Висячі" = `status === PENDING` тільки. Нові непідтверджені замовлення, які оператор ще не підтвердив і не скасував. CONFIRMED+ вже активно обробляються — не потребують Badge attention.
- **D-02:** Badge приховується при count = 0 (аналог чат-badge).

### Categories / Products badges
- **D-03:** Показувати загальну кількість (total count), прихований при 0.
- **D-04:** Стиль — `secondary` або muted badge (НЕ destructive/червоний), бо це informational, не attention signal. Конкретний className — на розсуд executor; має візуально відрізнятись від червоних badges замовлень/чатів/дзвінків.

### Callbacks "невирішені"
- **D-05:** Невирішені дзвінки = `status === PENDING && archivedAt IS NULL`. CONSULTED (навіть не заархівований) — не лічиться як невирішений.

### Data fetching
- **D-06:** Одна агрегована функція `getAdminSidebarCounts()` у service layer — повертає всі потрібні counts одним `prisma.$transaction([...])`. Жодних N+1 на кожен nav render.
- **D-07:** Функція виконується у RSC (admin `layout.tsx`) — передається через props у `AdminSidebarShell` → `AppSidebar`. Заміна/розширення поточного `unreadChatCount: number` на об'єкт з усіма counts.
- **D-08:** Existing `countUnreadForAdmin()` з `chat.service.ts` замінюється на виклик всередині `getAdminSidebarCounts()` (або зберігається як окрема функція і викликається паралельно — на розсуд planner).

### AppSidebar props API
- **D-09:** Замінити `unreadChatCount: number` на об'єкт `badgeCounts: AdminSidebarBadgeCounts` — чистіший API, легко розширювати. Тип оголосити поруч із функцією або в окремому types файлі (planner discretion).

```ts
type AdminSidebarBadgeCounts = {
  categories: number;
  products: number;
  pendingOrders: number;
  unreadChats: number;
  unresolvedCallbacks: number;
};
```

### Badge display rules (summary)
| Nav item | Показати коли | Стиль |
|---|---|---|
| Категорії | count > 0 | secondary/muted |
| Товари | count > 0 | secondary/muted |
| Замовлення | pendingOrders > 0 | destructive |
| Чати | unreadChats > 0 | destructive (вже є) |
| Дзвінки | unresolvedCallbacks > 0 | destructive |

### Claude's Discretion
- Чи виносити `getAdminSidebarCounts` у `chat.service.ts` (розширення) чи окремий `admin-sidebar.service.ts` — planner/executor.
- Точний className для secondary badge (`bg-muted text-muted-foreground` або shadcn variant).
- Чи додавати aria-label на кожен SidebarMenuButton з badge (аналог існуючого `Чати, N непрочитаних`).

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Requirements & roadmap
- `.planning/REQUIREMENTS.md` — ADM-NAV-01 (точне формулювання badge rules)
- `.planning/ROADMAP.md` — Phase 36 success criteria (aggregated query / N+1 constraint)
- `.planning/PROJECT.md` — operator UX, Ukrainian copy

### Current sidebar implementation
- `src/components/admin/app-sidebar.tsx` — main sidebar component; chat badge вже реалізовано тут
- `src/components/admin/admin-sidebar-shell.tsx` — shell, передає props із layout
- `src/components/admin/admin-nav-items.ts` — nav items array (константа)
- `src/app/(admin)/admin/layout.tsx` — RSC layout; тут fetch `countUnreadForAdmin`, тут додати `getAdminSidebarCounts`

### Services to extend/create
- `src/server/services/chat.service.ts` — `countUnreadForAdmin()` — буде включений в aggregated function
- `src/server/services/callback-request.service.ts` — callbacks counts
- `src/server/services/admin-catalog.service.ts` або аналог — categories/products counts

### Schema
- `prisma/schema.prisma` — `OrderStatus` enum (PENDING, CONFIRMED…CANCELLED); `CallbackRequestStatus` enum (PENDING, CONSULTED); `CallbackRequest.archivedAt`

### Prior phases for context
- `.planning/phases/35-callback-calls/35-CONTEXT.md` — D-11: badge для Дзвінки відкладено сюди; callback status/archive schema
- `.planning/phases/33-admin-categories-dnd-links/33-CONTEXT.md` — admin patterns

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `SidebarMenuBadge` — вже імпортовано і використовується в `app-sidebar.tsx` для чат-badge; додаткові badges добавляються за тим самим патерном
- `countUnreadForAdmin()` — логіка для unreadChats; може стати частиною aggregated function
- shadcn `Badge` variants — є `secondary`, `outline` для informational styling

### Established Patterns
- Chat badge: `showChatBadge = isChat && unreadChatCount > 0` → `<SidebarMenuBadge className="bg-destructive text-destructive-foreground">`
- Chat badge cap: `unreadChatCount > 99 ? "99+" : String(unreadChatCount)` — застосувати до всіх badges
- Admin layout RSC fetch → props → client component — вже встановлений pipeline

### Integration Points
- `AdminSidebarShell` як міст між RSC layout і client `AppSidebar` — refactor props тут
- `adminNavItems` — статичний масив констант; badge прив'язки живуть в `AppSidebar` (не в nav items)
- `prisma.$transaction` — патерн для паралельних count queries

</code_context>

<specifics>
## Specific Ideas

Користувач: «роби все на свій смак, головне щоб зручно і гарно було» — пріоритет: консистентність з існуючим sidebar (chat badge), чіткий візуальний поділ informational vs attention badges, без зайвих кліків для оператора.
</specifics>

<deferred>
## Deferred Ideas

Жодних ідей поза scope не виникло.
</deferred>
