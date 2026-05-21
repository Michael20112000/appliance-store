# Phase 36: Admin Sidebar Badges - Research

**Researched:** 2026-05-21
**Domain:** Next.js RSC data fetching, Prisma aggregation, React Server/Client component prop pipeline, shadcn sidebar primitives
**Confidence:** HIGH

## Summary

Phase 36 adds badge-lічильники до п'яти nav-пунктів адмін-сайдбару. Вся необхідна
infrastructure вже існує: `SidebarMenuBadge` використовується для чатів, pipeline
`RSC layout → AdminSidebarShell → AppSidebar` встановлений, Prisma models і enums
зафіксовані. Завдання — (1) створити `getAdminSidebarCounts()` з паралельними
count-запитами, (2) замінити `unreadChatCount: number` на `badgeCounts:
AdminSidebarBadgeCounts` у трьох файлах, (3) додати badge-рендер для чотирьох
нових пунктів у `AppSidebar`, дотримуючись шаблону чат-badge що вже є.

Жодних нових бібліотек не потрібно. Scope суто внутрішній: service layer + три
компоненти + admin layout. Немає ризику регресій поза адмін-маршрутом.

**Primary recommendation:** Створити `src/server/services/admin-sidebar.service.ts`
з `getAdminSidebarCounts()` що викликає п'ять `prisma.*. count()` паралельно через
`Promise.all([...])`. `prisma.$transaction([...])` зарезервовано для batch-writes;
для read-only count-запитів `Promise.all` є канонічним та простішим патерном у цій
кодовій базі (див. `getAdminDashboardStats`, `getCallbackViewCounts`).

---

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

**D-01:** "Висячі" замовлення = `status === PENDING` тільки.
**D-02:** Badge приховується при count = 0 (аналог чат-badge).
**D-03:** Categories/Products badge — загальна кількість (total count), прихований при 0.
**D-04:** Стиль categories/products badge — `secondary` або muted (НЕ destructive).
**D-05:** Невирішені дзвінки = `status === PENDING && archivedAt IS NULL`.
**D-06:** Одна агрегована функція `getAdminSidebarCounts()` у service layer — повертає всі counts одним ефективним fetching-патерном. Жодних N+1 на кожен nav render.
**D-07:** Функція виконується у RSC (admin `layout.tsx`) — передається через props у `AdminSidebarShell` → `AppSidebar`. Заміна/розширення поточного `unreadChatCount: number` на об'єкт з усіма counts.
**D-08:** Existing `countUnreadForAdmin()` включається у `getAdminSidebarCounts()` (або викликається паралельно).
**D-09:** Замінити `unreadChatCount: number` на об'єкт `badgeCounts: AdminSidebarBadgeCounts`.

```ts
type AdminSidebarBadgeCounts = {
  categories: number;
  products: number;
  pendingOrders: number;
  unreadChats: number;
  unresolvedCallbacks: number;
};
```

**Badge display rules:**
| Nav item | Показати коли | Стиль |
|---|---|---|
| Категорії | count > 0 | secondary/muted |
| Товари | count > 0 | secondary/muted |
| Замовлення | pendingOrders > 0 | destructive |
| Чати | unreadChats > 0 | destructive (вже є) |
| Дзвінки | unresolvedCallbacks > 0 | destructive |

### Claude's Discretion

- Чи виносити `getAdminSidebarCounts` у `chat.service.ts` (розширення) чи окремий `admin-sidebar.service.ts`.
- Точний className для secondary badge (`bg-muted text-muted-foreground` або shadcn variant).
- Чи додавати aria-label на кожен SidebarMenuButton з badge.

### Deferred Ideas (OUT OF SCOPE)

Жодних ідей поза scope не виникло. Storefront changes, badge click-through, badge animation, push notifications — out of scope.
</user_constraints>

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| ADM-NAV-01 | Sidebar badges: категорії та товари — загальна кількість; замовлення — кількість «висячих» (PENDING); чати та дзвінки — лише невирішені (не архів/не закриті), не total | Всі Prisma queries визначені нижче; компонентний шаблон задокументований |
</phase_requirements>

---

## Architectural Responsibility Map

| Capability | Primary Tier | Secondary Tier | Rationale |
|------------|-------------|----------------|-----------|
| Badge count aggregation | API / Backend (service layer) | — | Prisma queries мають виконуватись server-side; count logic залежить від DB |
| Data fetching + prop injection | Frontend Server (RSC layout) | — | `admin/layout.tsx` — це async RSC; він fetch-ить та передає через props |
| Badge rendering | Browser / Client (`AppSidebar`) | — | `AppSidebar` — `"use client"` компонент; він отримує counts через props, не fetch-ить |
| Props bridge | Browser / Client (`AdminSidebarShell`) | — | `AdminSidebarShell` — `"use client"` (використовує `usePathname`), виступає bridge між RSC і AppSidebar |

**Critical note:** `AdminSidebarShell` є `"use client"`, тому `layout.tsx` передає дані
через сріалізовані props (plain object). Це вже встановлений патерн — `unreadChatCount`
вже проходить цим шляхом. `AdminSidebarBadgeCounts` є plain object з number полями,
тому сріалізація безпроблемна.

---

## Standard Stack

### Core (все вже встановлено в проекті)

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| Prisma Client | existing | DB queries | Проект вже використовує |
| shadcn `SidebarMenuBadge` | existing | Badge UI primitive | Вже використовується для чат-badge |
| Next.js RSC | existing | Server-side data fetch | Вже встановлений pipeline |

### Supporting (вже є)

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| `@/lib/db` (prisma singleton) | existing | DB connection | Всі service queries |
| TypeScript | existing | Type safety for `AdminSidebarBadgeCounts` | Type declaration поруч з service |

**No new packages required.** Цей phase — чисто internal refactor + new service function.

---

## Package Legitimacy Audit

No new external packages are installed in this phase. Audit section is not applicable.

---

## Architecture Patterns

### System Architecture Diagram

```
DB (PostgreSQL)
     │
     │  5 parallel count() queries
     ▼
getAdminSidebarCounts()          [admin-sidebar.service.ts]
     │ Promise.all([...])
     │ returns AdminSidebarBadgeCounts
     ▼
AdminLayout (RSC async)          [app/(admin)/admin/layout.tsx]
     │ prop: badgeCounts={counts}
     ▼
AdminSidebarShell ("use client") [admin-sidebar-shell.tsx]
     │ prop: badgeCounts={badgeCounts}
     ▼
AppSidebar ("use client")        [app-sidebar.tsx]
     │ derives per-item badge visibility
     │ renders SidebarMenuBadge per nav item
     ▼
Browser DOM (badges visible)
```

### Recommended File Changes

```
src/
├── server/services/
│   └── admin-sidebar.service.ts     # NEW — getAdminSidebarCounts()
├── components/admin/
│   ├── app-sidebar.tsx              # MODIFY — badgeCounts prop, 5-badge render
│   └── admin-sidebar-shell.tsx      # MODIFY — badgeCounts prop passthrough
└── app/(admin)/admin/
    └── layout.tsx                   # MODIFY — call getAdminSidebarCounts, pass badgeCounts
```

### Pattern 1: Aggregated parallel count queries

**What:** Всі п'ять count-запитів виконуються паралельно через `Promise.all`.
**When to use:** Read-only aggregation; не потрібен transaction для узгодженості counts між таблицями.

**Why `Promise.all` а не `prisma.$transaction([...])`:**
- `Promise.all` — встановлений патерн у цій codebase для read-only parallel queries (see `getAdminDashboardStats` та `getCallbackViewCounts`)
- `prisma.$transaction([...])` зарезервовано для batch writes у цьому проекті
- Для badge counts transaction consistency не критична — slight staleness між counts acceptable

```typescript
// Source: [VERIFIED: codebase — admin-order.service.ts getAdminDashboardStats + callback-request.service.ts getCallbackViewCounts]
// src/server/services/admin-sidebar.service.ts

import { prisma } from "@/lib/db";
import { countUnreadForAdmin } from "@/server/services/chat.service";

export type AdminSidebarBadgeCounts = {
  categories: number;
  products: number;
  pendingOrders: number;
  unreadChats: number;
  unresolvedCallbacks: number;
};

export async function getAdminSidebarCounts(): Promise<AdminSidebarBadgeCounts> {
  const [categories, products, pendingOrders, unreadChats, unresolvedCallbacks] =
    await Promise.all([
      prisma.category.count(),
      prisma.product.count(),
      prisma.order.count({ where: { status: "PENDING" } }),
      countUnreadForAdmin(),
      prisma.callbackRequest.count({
        where: { status: "PENDING", archivedAt: null },
      }),
    ]);

  return { categories, products, pendingOrders, unreadChats, unresolvedCallbacks };
}
```

**Note on `countUnreadForAdmin`:** Ця функція використовує Prisma field reference
(`prisma.conversation.fields.adminLastReadAt`) у WHERE clause. Вона вже існує та
протестована. Виклик всередині `Promise.all` — найчистіший спосіб інтеграції (D-08).

### Pattern 2: Badge rendering in AppSidebar

**What:** На основі `badgeCounts` та `item.href` визначаємо badge для кожного nav item.

```typescript
// Source: [VERIFIED: codebase — app-sidebar.tsx existing chat badge pattern]
// Extend existing nav item loop in AppSidebar

const badgeConfig: Record<string, { count: number; destructive: boolean } | undefined> = {
  "/admin/kategorii": { count: badgeCounts.categories, destructive: false },
  "/admin/tovary": { count: badgeCounts.products, destructive: false },
  "/admin/zamovlennia": { count: badgeCounts.pendingOrders, destructive: true },
  "/admin/chaty": { count: badgeCounts.unreadChats, destructive: true },
  "/admin/dzvinky": { count: badgeCounts.unresolvedCallbacks, destructive: true },
};

// Inside map:
const badge = badgeConfig[item.href];
const showBadge = badge !== undefined && badge.count > 0;
const badgeLabel = badge && badge.count > 99 ? "99+" : String(badge?.count ?? 0);
```

**Alternative (simpler):** Окремі `const isKategorii = item.href === "/admin/kategorii"` etc.
аналогічно до `isChat`. Підходить якщо planner/executor хоче мінімальний diff.

### Pattern 3: Props refactor chain

Три файли змінюються узгоджено:

```typescript
// layout.tsx (RSC)
const badgeCounts = await getAdminSidebarCounts();
// <AdminSidebarShell badgeCounts={badgeCounts}>

// admin-sidebar-shell.tsx (client bridge)
type AdminSidebarShellProps = {
  badgeCounts: AdminSidebarBadgeCounts;
  children: React.ReactNode;
};
// <AppSidebar badgeCounts={badgeCounts} />

// app-sidebar.tsx (client render)
type AppSidebarProps = {
  badgeCounts: AdminSidebarBadgeCounts;
};
```

### Anti-Patterns to Avoid

- **N+1 per nav item:** Не викликати окремий fetch в кожному `SidebarMenuItem`. Всі counts — один `getAdminSidebarCounts()` call.
- **Fetch in client component:** `AppSidebar` і `AdminSidebarShell` — `"use client"`. Вони НЕ повинні імпортувати `prisma` або service functions. Data приходить через props з RSC layout.
- **`prisma.$transaction` для reads:** Хоча CONTEXT згадує `$transaction`, код проекту використовує `Promise.all` для read-only parallel counts. Слідувати встановленому патерну.
- **Стара prop `unreadChatCount`:** Після refactor вона повністю видаляється з усіх трьох файлів. Залишати обидва prop-и разом — antipattern.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Badge UI | Custom div з count | `SidebarMenuBadge` | Вже встановлено в sidebar; правильне позиціонування, collapsed-icon behavior |
| Chat unread count | Custom query | `countUnreadForAdmin()` | Вже існує, protesta, враховує `adminLastReadAt` field reference |
| Callback unresolved filter | Custom | `{ status: "PENDING", archivedAt: null }` where clause | Точно відповідає D-05; `getCallbackViewCounts` вже демонструє цей pattern |
| Pending orders count | Custom | `prisma.order.count({ where: { status: "PENDING" } })` | Вже використовується в `getAdminDashboardStats` |
| Cap at 99+ | Custom logic | Копіювати існуючий `count > 99 ? "99+" : String(count)` | Консистентний UX з чат-badge |

**Key insight:** 90% logic вже існує в codebase. Phase — з'єднати частини, не будувати нове.

---

## Common Pitfalls

### Pitfall 1: Забути про `archivedAt: null` для callbacks

**What goes wrong:** `prisma.callbackRequest.count({ where: { status: "PENDING" } })` враховує
заархівовані записи зі статусом PENDING (бізнес-логіка дозволяє архівування тільки CONSULTED,
але defensive coding важлива).
**Why it happens:** D-05 явно вказує `archivedAt IS NULL`. Без цього фільтру count може бути вищим.
**How to avoid:** `where: { status: "PENDING", archivedAt: null }` — обов'язково обидва умови.
**Warning signs:** Badge показує більше записів ніж видно в active-tab таблиці Дзвінків.

### Pitfall 2: Залишити `countUnreadForAdmin` import у layout.tsx

**What goes wrong:** Після рефакторингу layout.tsx може залишити стару `import { countUnreadForAdmin }` — TypeScript не зловить якщо вона ще десь використовується, але це dead code.
**Why it happens:** Refactor трьох файлів одночасно — легко пропустити очищення import.
**How to avoid:** Після додавання `import { getAdminSidebarCounts }` — видалити старий `countUnreadForAdmin` import з layout.tsx.

### Pitfall 3: Тип `AdminSidebarBadgeCounts` дублюється

**What goes wrong:** Тип оголошується і в `admin-sidebar.service.ts` і перевизначається в компоненті.
**How to avoid:** Оголосити `export type AdminSidebarBadgeCounts` тільки в service файлі; імпортувати у shell і sidebar.

### Pitfall 4: `SidebarMenuBadge` при collapsed sidebar

**What goes wrong:** `SidebarMenuBadge` має `group-data-[collapsible=icon]:hidden` — badge зникає
коли sidebar collapsed до icon-only mode. Це стандартна shadcn поведінка, не баг.
**How to avoid:** Не намагатись override цю поведінку — вона очікувана (badge не поміщається на icon-only sidebar).

### Pitfall 5: Не оновити `aria-label` для нових badges

**What goes wrong:** `AppSidebar` вже має `aria-label` pattern для чат-badge: `"Чати, N непрочитаних"`. Нові badges без `aria-label` менш доступні.
**How to avoid:** Додати `aria-label` для кожного badge-eligible item: `"Замовлення, N висячих"`, `"Дзвінки, N невирішених"` etc.

---

## Code Examples

### Existing chat badge pattern (to replicate for new items)

```typescript
// Source: [VERIFIED: codebase — src/components/admin/app-sidebar.tsx:67-91]
const isChat = item.href === "/admin/chaty";
const showChatBadge = isChat && unreadChatCount > 0;

// ...
aria-label={
  showChatBadge
    ? `Чати, ${unreadChatCount} непрочитаних`
    : item.label
}

// ...
{showChatBadge ? (
  <SidebarMenuBadge className="bg-destructive text-destructive-foreground">
    {chatBadgeLabel}
  </SidebarMenuBadge>
) : null}
```

### Secondary/muted badge className

```typescript
// Source: [ASSUMED — based on shadcn/Tailwind conventions used in project]
// For informational badges (categories, products):
<SidebarMenuBadge className="bg-muted text-muted-foreground">
  {badgeLabel}
</SidebarMenuBadge>
```

Альтернативно `bg-secondary text-secondary-foreground` — обидва є в shadcn. Executor
вибирає на свій розсуд (D-04 каже "secondary або muted").

### Existing parallel count pattern (to follow)

```typescript
// Source: [VERIFIED: codebase — src/server/services/admin-order.service.ts:134-152]
const [pendingOrders, inStockProducts, outOfStockProducts, recentOrders] =
  await Promise.all([
    prisma.order.count({ where: { status: "PENDING" } }),
    prisma.product.count({ where: { quantity: { gte: 1 } } }),
    prisma.product.count({ where: { quantity: 0 } }),
    prisma.order.findMany({ take: 5, orderBy: { createdAt: "desc" }, include: { items: true } }),
  ]);
```

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| `unreadChatCount: number` prop | `badgeCounts: AdminSidebarBadgeCounts` object prop | Phase 36 | Чистіший API, легко розширювати |
| Single chat badge | Five nav badges (categories, products, orders, chats, callbacks) | Phase 36 | Operator attention signal для всіх key sections |

**Deprecated after this phase:**
- `unreadChatCount` prop на `AdminSidebarShell` та `AppSidebar` — замінюється на `badgeCounts`
- Direct `countUnreadForAdmin()` call у `layout.tsx` — замінюється на `getAdminSidebarCounts()`

---

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | `bg-muted text-muted-foreground` є коректним className для secondary badge в цьому проекті | Code Examples | Візуальний ефект відрізнятиметься від очікуваного; виправляється className зміною |

**All other claims verified directly from codebase source files.**

---

## Open Questions

1. **Де оголосити `AdminSidebarBadgeCounts` тип — в service або окремий types файл?**
   - What we know: Проект має `src/types/` directory (chat.ts, order.ts etc.)
   - What's unclear: Чи відповідає badge counts типу для окремого types файлу або є implementation detail service-у
   - Recommendation: Оголосити як `export type` у `admin-sidebar.service.ts` та імпортувати звідти — менше файлів, тип належить service-у. Якщо колись знадобиться cross-module sharing — move to `src/types/`.

2. **`Promise.all` vs `prisma.$transaction([...])`**
   - What we know: CONTEXT D-06 каже "одним `prisma.$transaction([...])`"; але кодова база використовує `Promise.all` для read-only parallel counts (`getAdminDashboardStats`, `getCallbackViewCounts`)
   - What's unclear: D-06 може мати на увазі "один ефективний aggregated fetch" (не буквально `$transaction`)
   - Recommendation: Використовувати `Promise.all` — це встановлений патерн проекту для read-only parallel queries і функціонально еквівалентний для цього use case.

---

## Environment Availability

Step 2.6: SKIPPED — phase is purely code changes to existing files, no new external tools or services required. All dependencies (Prisma, Next.js, shadcn components) already present in project.

---

## Validation Architecture

### Test Framework

| Property | Value |
|----------|-------|
| Framework | Vitest |
| Config file | `vitest.config.ts` |
| Quick run command | `npx vitest run src/server/services/admin-sidebar.service.test.ts` |
| Full suite command | `npm test` |

### Phase Requirements → Test Map

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| ADM-NAV-01 | `getAdminSidebarCounts()` returns correct counts from all 5 queries | unit | `npx vitest run src/server/services/admin-sidebar.service.test.ts` | ❌ Wave 0 |
| ADM-NAV-01 | pending orders count uses `status === PENDING` only | unit | (included in above) | ❌ Wave 0 |
| ADM-NAV-01 | unresolved callbacks uses `status === PENDING && archivedAt === null` | unit | (included in above) | ❌ Wave 0 |
| ADM-NAV-01 | badge hidden when count = 0 | unit | N/A — rendering logic, manual or component test | manual |
| ADM-NAV-01 | badges cap at 99+ | unit | N/A — rendering logic in client component | manual |

### Sampling Rate

- **Per task commit:** `npx vitest run src/server/services/admin-sidebar.service.test.ts`
- **Per wave merge:** `npm test`
- **Phase gate:** Full suite green before `/gsd:verify-work`

### Wave 0 Gaps

- [ ] `src/server/services/admin-sidebar.service.test.ts` — covers `getAdminSidebarCounts()` mocking all 5 count queries, verifying correct filter for each (PENDING orders, PENDING+archivedAt=null callbacks, total categories, total products, unread chats)

**Test pattern to follow:**

```typescript
// Source: [VERIFIED: codebase — callback-request.service.test.ts, chat.service.test.ts]
vi.mock("@/lib/db", () => ({
  prisma: {
    category: { count: vi.fn() },
    product: { count: vi.fn() },
    order: { count: vi.fn() },
    callbackRequest: { count: vi.fn() },
    conversation: {
      fields: { adminLastReadAt: "adminLastReadAt" },
      count: vi.fn(),
    },
  },
}));
```

Note: `countUnreadForAdmin` uses `prisma.conversation.fields.adminLastReadAt` — the mock
must include `fields` on the conversation mock (see `chat.service.test.ts:22-28`).

---

## Security Domain

### Applicable ASVS Categories

| ASVS Category | Applies | Standard Control |
|---------------|---------|-----------------|
| V2 Authentication | yes | `requireAdmin()` already called in `layout.tsx` before counts fetch — no change needed |
| V4 Access Control | yes | `requireAdmin()` gates entire admin layout; badge counts are behind this gate |
| V5 Input Validation | no | No user input; counts are read-only aggregations |

**No new security surface introduced.** `getAdminSidebarCounts()` is called only inside
the RSC admin layout which already calls `requireAdmin()`. The counts are never exposed
via a public API route.

---

## Sources

### Primary (HIGH confidence)

- [VERIFIED: codebase] `src/components/admin/app-sidebar.tsx` — existing chat badge implementation
- [VERIFIED: codebase] `src/components/admin/admin-sidebar-shell.tsx` — current props shape
- [VERIFIED: codebase] `src/app/(admin)/admin/layout.tsx` — RSC fetch + prop pipeline
- [VERIFIED: codebase] `src/server/services/admin-order.service.ts` — `getAdminDashboardStats` parallel count pattern
- [VERIFIED: codebase] `src/server/services/callback-request.service.ts` — `getCallbackViewCounts` parallel count pattern + archivedAt filter
- [VERIFIED: codebase] `src/server/services/chat.service.ts` — `countUnreadForAdmin()` implementation
- [VERIFIED: codebase] `src/server/services/admin-catalog.service.ts` — `getCategoryCount()` exists
- [VERIFIED: codebase] `prisma/schema.prisma` — `OrderStatus.PENDING`, `CallbackRequestStatus.PENDING`, `CallbackRequest.archivedAt`
- [VERIFIED: codebase] `src/components/ui/sidebar.tsx:583` — `SidebarMenuBadge` component implementation with `group-data-[collapsible=icon]:hidden`

### Secondary (MEDIUM confidence)

- [CITED: CONTEXT.md decisions D-01 through D-09] — all implementation decisions locked by user

### Tertiary (LOW confidence)

- [ASSUMED] `bg-muted text-muted-foreground` for secondary badge className — based on shadcn conventions in project

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — no new packages; all libraries verified in codebase
- Architecture: HIGH — all files identified, props chain fully mapped, existing patterns confirmed
- Pitfalls: HIGH — derived from direct code inspection
- Query correctness: HIGH — all Prisma filters cross-referenced with schema enums

**Research date:** 2026-05-21
**Valid until:** 2026-06-21 (stable — no external dependencies, purely internal code)
