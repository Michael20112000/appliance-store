# Phase 35: Callback calls (Дзвінки) - Research

**Researched:** 2026-05-20
**Domain:** Admin callback workspace — Prisma schema extension, server actions, RSC list + client row controls
**Confidence:** HIGH

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

#### Список і архів (CALL-01, CALL-04)
- **D-01:** Нова сторінка `src/app/(admin)/admin/dzvinky/page.tsx` — основний список заявок.
- **D-02:** Таби-фільтри як у замовленнях (`OrderListFilters` патерн): **«Активні»** (default, `archivedAt IS NULL`) та **«Архів»** (`archivedAt IS NOT NULL`). URL: `?view=active` | `?view=archive`, default без query = active.
- **D-03:** Сортування: `createdAt desc` (як зараз). Без пагінації на v1 — обсяг заявок невеликий; `take` не обмежувати 50 на dedicated page (або cap 200 для safety).
- **D-04:** Архівувати можна лише коли статус **«Проконсультовано»** (CONSULTED). Кнопка «В архів» в рядку; unarchive не в scope — архів односторонній для v1.
- **D-05:** Блок «Заявки на дзвінок» повністю прибрати з `nalashtuvannia/page.tsx`; `listCallbackRequestsAdmin` винести з store-settings у callback admin service.

#### Статуси (CALL-02)
- **D-06:** Prisma enum `CallbackRequestStatus`: `PENDING` | `CONSULTED`. Labels UA: «Очікує на дзвінок», «Проконсультовано».
- **D-07:** Default для нових і існуючих записів (migration): `PENDING`.
- **D-08:** Зміна статусу — compact `Select` у рядку таблиці (аналог `order-list-status-select`, без bulk). Server action + `requireAdmin`, optimistic UI optional (planner discretion).

#### Нотатка (CALL-03)
- **D-09:** Колонка «Нотатка» — `Textarea` (2–3 рядки) прямо в таблиці + кнопка «Зберегти» поруч (explicit save, не blur-auto — менше випадкових перезаписів).
- **D-10:** `note` — optional `String?` у Prisma (`@db.Text`). Порожня нотатка = null або "" (planner picks one convention).

#### Навігація
- **D-11:** Пункт sidebar **«Дзвінки»** → `/admin/dzvinky` (icon `Phone` з lucide) — додати в `admin-nav-items.ts` у цій фазі (без badge; badge — Phase 36 / ADM-NAV-01).
- **D-12:** Analytics KPI «Дзвінків» лишається count усіх заявок за період (не лише active) — без змін логіки в 35, якщо не конфліктує з product intent.

### Claude's Discretion
- Точна структура server actions (`updateCallbackStatusAction`, `updateCallbackNoteAction`, `archiveCallbackRequestAction`) vs один mutation — planner/executor.
- Чи рефакторити `CallbackRequestsTable` → `CallbackRequestsDataTable` з client subcomponents — за аналогією orders.
- Toast copy UA та disabled states для archive коли status !== CONSULTED.

### Deferred Ideas (OUT OF SCOPE)
- Sidebar badge «невирішені дзвінки» — Phase 36 (ADM-NAV-01)
- Unarchive / restore from archive — post–v2.0
- Pagination, search by phone, export CSV — out of scope
- Email/SMS нотифікації оператору про нову заявку — out of scope
- Додаткові статуси (напр. «Не додзвонились») — out of scope unless product asks later
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| CALL-01 | Блок «Заявки на дзвінок» прибрано з `/admin/nalashtuvannia`; таблиця на окремій `/admin/dzvinky` | D-01/D-05: strip section from `nalashtuvannia/page.tsx`; new RSC page + nav (D-11); migrate `listCallbackRequestsAdmin` to `callback-request.service.ts` |
| CALL-02 | Статус заявки: default «Очікує на дзвінок»; оператор змінює на «Проконсультовано» | D-06–D-08: Prisma enum + migration default; `CallbackListStatusSelect` + `updateCallbackStatus` service/action |
| CALL-03 | Текстова нотатка про розмову | D-09–D-10: `note` column + inline Textarea + explicit save action; normalize empty → `null` |
| CALL-04 | Оброблені заявки в архів | D-02/D-04: `archivedAt` + view tabs; archive only when `CONSULTED`; server-side gate |
</phase_requirements>

## Summary

Phase 35 is a **relocate-and-enrich** admin feature, not greenfield. Callback requests already exist in PostgreSQL (`CallbackRequest`: `id`, `phone`, `ipAddress`, `createdAt`), are listed on `/admin/nalashtuvannia` via `listCallbackRequestsAdmin(50)`, and are created from the storefront via `createCallbackRequest` + `submitCallbackRequestAction`. The phase adds operator workflow fields (`status`, `note`, `archivedAt`), a dedicated `/admin/dzvinky` page with active/archive tabs, and row-level client controls patterned after orders.

No new npm dependencies are required — the stack already includes Prisma 7.8, shadcn `Select`/`Textarea`/`Button`, sonner toasts, and lucide `Phone`. The main work is a Prisma migration (enum + columns + index), moving admin list logic out of `store-settings.service.ts`, three guarded server actions, and splitting the presentational table into server fetch + client row widgets.

Analytics (`admin-analytics.service.ts`) counts callbacks by `createdAt` only — **no change** satisfies D-12 and keeps KPI aligned with “all requests in period.” Phase 36 badges will later filter `PENDING` + `archivedAt IS NULL`; document that query shape for downstream.

**Primary recommendation:** Extend `callback-request.service.ts` as the single admin data layer, add `src/server/actions/admin/callback.actions.ts` mirroring `order.actions.ts`, build `/admin/dzvinky` as RSC + `?view=` tabs (copy `OrderListFilters` chip UX), and enforce archive eligibility in the **service**, not only in the UI.

## Architectural Responsibility Map

| Capability | Primary Tier | Secondary Tier | Rationale |
|------------|-------------|----------------|-----------|
| Schema: status, note, archivedAt | Database / Prisma | — | Persistence and migration backfill |
| List active vs archive | API / Backend (service) | Frontend Server (RSC page) | `where: { archivedAt: null \| not null }` belongs in Prisma query |
| Status / note / archive mutations | API / Backend (service) | Server Actions (`requireAdmin`) | Business rules (CONSULTED before archive) server-enforced |
| View tab navigation (`?view=`) | Frontend Server (Link chips) | — | Same pattern as orders — URL drives RSC refetch |
| Row Select / Textarea / Archive button | Browser / Client | Server Actions | Interactive controls; `router.refresh()` after success |
| Storefront callback submit | API / Backend (existing) | Server Action (public) | **Unchanged** — only admin surface grows |
| Sidebar «Дзвінки» | Frontend Server (static nav config) | — | `admin-nav-items.ts` |
| Analytics callback KPI | API / Backend (existing count) | — | No filter change per D-12 |

## Standard Stack

### Core

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| Prisma | 7.8.0 [VERIFIED: npm registry] | ORM + migration | Already project ORM; `CallbackRequest` model exists |
| Next.js App Router | 16.2.6 (installed) | RSC admin page, server actions | Existing admin pattern |
| Zod | 4.4.x (installed) | Action input validation | Matches `order.actions.ts`, `callback.actions.ts` |
| shadcn/ui | installed (`Select`, `Textarea`, `Button`) | Row controls | UI-SPEC + `order-list-status-select` reference |
| sonner | ^2.0.7 (installed) | Operator feedback | Admin layout already mounts `<Toaster />` |
| lucide-react | ^1.16.0 (installed) | `Phone` nav icon | D-11 |

### Supporting

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| vitest | (project devDep) | Service/validator unit tests | Extend `callback-request.service.test.ts` |

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Three server actions | One `updateCallbackAdminAction` with discriminated union | Discretion — three actions mirror orders clarity and smaller blast radius |
| Extend `callback-requests-table.tsx` in place | `CallbackRequestsDataTable` + row client components | Discretion — split recommended when table gains 3 client columns |
| `nuqs` for `?view=` | Plain `searchParams` on RSC page | Orders use typed schema + Links; no NuqsAdapter in admin — stay consistent |

**Installation:** None required for Phase 35.

**Version verification:**
```bash
npm view prisma version   # → 7.8.0
npm view next version     # → 16.2.6 (project pin)
```

## Package Legitimacy Audit

> No new external packages in this phase. slopcheck was unavailable at research time.

| Package | Registry | slopcheck | Disposition |
|---------|----------|-----------|-------------|
| *(none new)* | — | — | N/A |

**Packages removed due to slopcheck [SLOP] verdict:** none  
**Packages flagged as suspicious [SUS]:** none

## Project Constraints (from .cursor/rules/)

- **Locale:** Admin copy Ukrainian only [from gsd.mdc / PROJECT.md]
- **Stack:** Next.js App Router + TypeScript + Prisma + PostgreSQL + shadcn + Better Auth [gsd.mdc]
- **Next.js:** Read `node_modules/next/dist/docs/` for APIs — training data may be stale [AGENTS.md]
- **Auth:** Admin routes guarded by `requireAdmin()` in layout and actions [existing `admin/layout.tsx`]

## Architecture Patterns

### System Architecture Diagram

```
Storefront (unchanged)
  CallbackRequestForm → submitCallbackRequestAction
    → createCallbackRequest() → Prisma CallbackRequest (status defaults PENDING)

Admin /admin/dzvinky (new)
  RSC page (searchParams.view)
    → listCallbackRequestsAdmin({ view, limit: 200 })
    → optional getCallbackViewCounts()
    → CallbackListFilters (Link chips)
    → CallbackRequestsTable / DataTable
         ├─ CallbackListStatusSelect → updateCallbackStatusAction (active view only)
         ├─ CallbackNoteField → updateCallbackNoteAction (active view only)
         └─ CallbackArchiveButton → archiveCallbackRequestAction (CONSULTED only)

Admin /admin/nalashtuvannia (modified)
  StoreSettingsForm only — no callback fetch/render

Analytics /admin/analityka (unchanged)
  prisma.callbackRequest.count({ createdAt >= since })  // all rows, any status/archive
```

### Recommended Project Structure

```
prisma/
  schema.prisma                          # enum CallbackRequestStatus + fields
  migrations/YYYYMMDDHHMMSS_callback_admin_fields/

src/lib/callback/
  status-labels.ts                       # CALLBACK_STATUS_LABELS_UA

src/server/validators/
  admin-callback.ts                      # view, updateStatus, updateNote, archive schemas

src/server/services/
  callback-request.service.ts            # create + list + update + archive (admin)
  store-settings.service.ts              # remove listCallbackRequestsAdmin + type

src/server/actions/
  admin/callback.actions.ts              # requireAdmin + revalidatePath

src/app/(admin)/admin/
  dzvinky/page.tsx                       # new list page
  nalashtuvannia/page.tsx                # remove callback section

src/components/admin/
  admin-nav-items.ts                     # + Дзвінки / Phone
  callback-list-filters.tsx              # active | archive chips
  callback-list-status-select.tsx        # client, pattern order-list-status-select
  callback-note-field.tsx                # client Textarea + Зберегти
  callback-archive-button.tsx            # client, disabled unless CONSULTED
  callback-requests-table.tsx            # extend columns / delegate to client cells
```

### Pattern 1: Prisma enum + column defaults (migration)

**What:** Add enum and fields with DB defaults; existing rows pick up defaults on migrate.  
**When to use:** All new columns nullable or defaulted — no manual SQL backfill needed for empty DBs.

```prisma
enum CallbackRequestStatus {
  PENDING
  CONSULTED
}

model CallbackRequest {
  // ... existing fields
  status     CallbackRequestStatus @default(PENDING)
  note       String?               @db.Text
  archivedAt DateTime?

  @@index([archivedAt, createdAt])
}
```

Prisma migrate adds enum type and columns; PostgreSQL applies `DEFAULT 'PENDING'` to existing rows [CITED: Prisma schema defaults — same pattern as `Conversation.status` migration `20260517165509_conversation_status` in repo].

### Pattern 2: View filter via searchParams (orders parity)

**What:** RSC page parses `view` ∈ `{ active, archive }`, default `active`.  
**When to use:** Tab UX without client state store.

Reference: `OrderListFilters` + `adminOrdersUrl` — for callbacks use a minimal helper e.g. `adminCallbacksUrl({ view })` or inline `` `/admin/dzvinky?view=${view}` ``.

### Pattern 3: Server action + revalidate + toast

**What:** `requireAdmin` → Zod parse → service → `revalidatePath("/admin/dzvinky")` → `{ ok: true }`.  
**Reference:** `updateOrderStatusAction` in `src/server/actions/admin/order.actions.ts`.

### Anti-Patterns to Avoid

- **Archive gate only in UI:** Disabled button is not enough — service must reject `archive` when `status !== CONSULTED` or `archivedAt` already set.
- **Leaving list in store-settings:** Violates D-05 and couples unrelated domains.
- **Filtering analytics by active-only:** Breaks D-12 KPI intent.
- **Auto-save note on blur:** Violates D-09 explicit save.
- **Changing `submitCallbackRequestAction`:** Storefront path must stay stable.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Admin auth gate | Custom session checks | `requireAdmin()` | Centralized in `@/lib/permissions` |
| Phone display | Custom formatter | `formatUaPhoneDisplay` | Already used in table |
| Status labels map | Inline strings in components | `CALLBACK_STATUS_LABELS_UA` record | Matches `ORDER_STATUS_LABELS_UA` |
| Tab URL state | useState for view | Link + `searchParams` | Consistent with orders; shareable URLs |
| ORM migrations | Raw SQL scripts | `npx prisma migrate dev` | Project convention |

## Codebase Findings

### Current `CallbackRequest` model

```279:286:prisma/schema.prisma
model CallbackRequest {
  id        String   @id @default(cuid())
  phone     String
  ipAddress String?
  createdAt DateTime @default(now())

  @@index([ipAddress, createdAt])
}
```

No `status`, `note`, or `archivedAt` yet — Phase 35 migration is mandatory for CALL-02–04.

### Settings page coupling (CALL-01)

```8:28:src/app/(admin)/admin/nalashtuvannia/page.tsx
export default async function AdminStoreSettingsPage() {
  const [settings, callbackRequests] = await Promise.all([
    getAdminStoreSettings(),
    listCallbackRequestsAdmin(50),
  ]);
  // ...
  <section className="space-y-4">
    <h2 className="text-lg font-semibold">Заявки на дзвінок</h2>
    <CallbackRequestsTable requests={callbackRequests} />
  </section>
}
```

Remove `listCallbackRequestsAdmin` import, parallel fetch, and entire section.

### Admin list today

- `listCallbackRequestsAdmin(limit=50)` in `store-settings.service.ts` — `select: { id, phone, createdAt }`, `orderBy: createdAt desc`, `take: limit`.
- `CallbackRequestsTable` is **server-only** (two columns). Phase adds client islands — table body cells should be client components or a wrapping client row fragment.

### Storefront path (do not break)

- `createCallbackRequest` only sets `phone`, `ipAddress` — after migration, Prisma `@default(PENDING)` applies `status` automatically.
- Rate limit unchanged (`CALLBACK_RATE_LIMIT_*` on `ipAddress` + `createdAt`).

### Analytics (D-12)

```33:33:src/server/services/admin-analytics.service.ts
    prisma.callbackRequest.count({ where: { createdAt: { gte: since } } }),
```

**No code change** for Phase 35 unless product revises KPI definition.

### Nav gap (D-11)

`admin-nav-items.ts` has no `/admin/dzvinky` — insert after «Чати», before «Налаштування» per UI-SPEC.

### Reference UX assets

| Asset | Path | Reuse |
|-------|------|-------|
| Tab chips | `order-list-filters.tsx` | Border/active classes, Link pattern |
| Status select | `order-list-status-select.tsx` | Select sm, toast, `router.refresh()`, `stopPropagation` if rows clickable later |
| Admin action shape | `admin/order.actions.ts` | `requireAdmin`, Zod, `revalidatePath`, `{ ok, error }` |
| UI contract | `35-UI-SPEC.md` | Column set, empty states, archive tooltip |

### Tests already present

- `src/server/services/callback-request.service.test.ts` — rate limit + create (2 tests, passing).
- `src/server/validators/callback.test.ts` — storefront phone schema.
- No admin callback tests yet — Wave 0 gap for Nyquist.

## Implementation Approach

### 1. Schema and migration (CALL-02, CALL-03, CALL-04)

| File | Change |
|------|--------|
| `prisma/schema.prisma` | Add `CallbackRequestStatus` enum; fields `status`, `note`, `archivedAt`; index `[archivedAt, createdAt]` |
| New migration | `npx prisma migrate dev --name callback_admin_fields` |

**Convention recommendation (D-10):** Store empty note as `null` — `note: trimmed || null` in service.

**create path:** No change to `createCallbackRequest` data object beyond relying on default `status`.

### 2. Service layer (D-05)

| File | Change |
|------|--------|
| `callback-request.service.ts` | Move `CallbackRequestAdminRow` type; add `listCallbackRequestsAdmin({ view, limit })`, `updateCallbackRequestStatus`, `updateCallbackRequestNote`, `archiveCallbackRequest`, optional `getCallbackViewCounts()` |
| `store-settings.service.ts` | Delete `CallbackRequestAdminRow`, `listCallbackRequestsAdmin` |

**List query sketch:**

```typescript
const where =
  view === "archive"
    ? { archivedAt: { not: null } }
    : { archivedAt: null };

await prisma.callbackRequest.findMany({
  where,
  orderBy: { createdAt: "desc" },
  take: limit ?? 200,
  select: {
    id: true,
    phone: true,
    createdAt: true,
    status: true,
    note: true,
    archivedAt: true,
  },
});
```

**Archive service gate:**

```typescript
const row = await prisma.callbackRequest.findUnique({ where: { id } });
if (!row || row.archivedAt) return ARCHIVED_OR_MISSING;
if (row.status !== "CONSULTED") return NOT_CONSULTED;
await prisma.callbackRequest.update({
  where: { id },
  data: { archivedAt: new Date() },
});
```

### 3. Validators and actions

| File | Change |
|------|--------|
| `src/server/validators/admin-callback.ts` | `callbackListViewSchema`, `updateCallbackStatusSchema`, `updateCallbackNoteSchema`, `archiveCallbackSchema` |
| `src/server/actions/admin/callback.actions.ts` | Three actions; `revalidatePath("/admin/dzvinky")`; on archive also safe to revalidate `/admin/nalashtuvannia` if ever cached |

Export typed results: `{ ok: true } | { ok: false; error: "VALIDATION" | "NOT_CONSULTED" | "NOT_FOUND" | "UNKNOWN" }`.

### 4. Lib labels

| File | Change |
|------|--------|
| `src/lib/callback/status-labels.ts` | `CALLBACK_STATUS_LABELS_UA` for PENDING / CONSULTED |

Optional accent classes in discretion — mirror `getOrderStatusAccentClass` lightly (amber / emerald per UI-SPEC).

### 5. UI components and page

| File | Change |
|------|--------|
| `dzvinky/page.tsx` | `metadata.title = "Дзвінки"`; parse `searchParams.view`; fetch list + counts; render filters + table |
| `callback-list-filters.tsx` | Two links: Активні (N), Архів (N) |
| `callback-list-status-select.tsx` | Two-state select; only transitions PENDING ↔ CONSULTED (both allowed) |
| `callback-note-field.tsx` | Local state from `defaultValue={note ?? ""}`; save button |
| `callback-archive-button.tsx` | Disabled + `title` when not CONSULTED |
| `callback-requests-table.tsx` | Add columns Статус, Нотатка, Дії; archive view read-only (status as text, note truncated) |
| `nalashtuvannia/page.tsx` | Settings only |
| `admin-nav-items.ts` | Add `{ href: "/admin/dzvinky", label: "Дзвінки", icon: Phone }` |

**Active vs archive column rules (UI-SPEC):**

| View | Status | Note | Archive |
|------|--------|------|---------|
| active | Select | Textarea + save | Button |
| archive | Static label | Truncated / «—» | Hidden |

### 6. Storefront

**No file changes** unless type errors from generated client — verify `callback-request-form` still compiles after `prisma generate`.

## Risks

| Risk | Severity | Mitigation |
|------|----------|------------|
| Archive without CONSULTED via forged action | High | Service-level `NOT_CONSULTED` error; unit test |
| Migration on prod with many rows | Low | Defaults only; no data transform |
| `take: 200` cap hides old active rows | Low | Accept for v1 (D-03); document in UAT |
| Stale types importing `CallbackRequestAdminRow` from store-settings | Medium | Grep and update imports to callback service |
| Operator edits note then archives without saving note | Low | Explicit save (D-09) — UAT note |
| Phase 36 badge query drift | Low | Document unresolved = `PENDING` + `archivedAt: null` in plan notes |

## Validation Architecture

### Test Framework

| Property | Value |
|----------|-------|
| Framework | Vitest (project `npm test` → `vitest run`) |
| Config file | `vitest.config.ts` |
| Quick run command | `npm test -- --run src/server/services/callback-request.service.test.ts` |
| Full suite command | `npm test` |

### Phase Requirements → Test Map

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| CALL-02 | Default PENDING on create | unit | `npm test -- --run src/server/services/callback-request.service.test.ts` | ✅ extend |
| CALL-02 | Status update persists | unit | same + new cases in service test | ❌ Wave 0 |
| CALL-04 | Archive rejected if not CONSULTED | unit | service test `archiveCallbackRequest` | ❌ Wave 0 |
| CALL-04 | Active list excludes archived | unit | `listCallbackRequestsAdmin({ view: "active" })` mock | ❌ Wave 0 |
| CALL-03 | Note empty → null | unit | validator or service test | ❌ Wave 0 |
| CALL-01 | Settings page has no callback block | manual / grep | `rg "Заявки на дзвінок" src/app/(admin)/admin/nalashtuvannia` → 0 | — |
| Schema | Migration applies | integration | `npx prisma migrate dev` (dev DB) | — |
| Types | Project compiles | static | `npx tsc --noEmit` | — |
| UI | Tabs, status, note, archive | manual UAT | See paths below | — |

### Sampling Rate

- **Per task commit:** `npm test -- --run src/server/services/callback-request.service.test.ts`
- **Per wave merge:** `npm test` && `npx tsc --noEmit`
- **Phase gate:** Manual UAT on `/admin/dzvinky` + confirm analytics unchanged

### Wave 0 Gaps

- [ ] Extend `callback-request.service.test.ts` — status update, archive gate, list filters
- [ ] Add `src/server/validators/admin-callback.test.ts` — view enum, note max length if capped
- [ ] Optional: component smoke for `CallbackListStatusSelect` (lower priority)

### Manual UAT paths

1. **CALL-01:** Open `/admin/nalashtuvannia` — no «Заявки на дзвінок»; sidebar «Дзвінки» → `/admin/dzvinky` shows table.
2. **CALL-02:** New storefront callback → appears as «Очікує на дзвінок»; change to «Проконсультовано» → persists after refresh.
3. **CALL-03:** Enter note → «Зберегти» → refresh shows note; empty save clears to «—».
4. **CALL-04:** Archive disabled until CONSULTED; after archive row leaves «Активні»; visible under «Архів» tab read-only.
5. **D-12:** `/admin/analityka` callback KPI still counts archived requests created in period (create + archive one, KPI includes it).

### Concrete commands (phase gate checklist)

```bash
# Migration (dev)
cd /Users/michael_ivashko/WebStormProjects/web/appliance-store
npx prisma migrate dev --name callback_admin_fields
npx prisma generate

# Unit tests
npm test -- --run src/server/services/callback-request.service.test.ts
npm test

# Typecheck
npx tsc --noEmit

# Lint (if touched files)
npm run lint

# Dev server manual UAT
npm run dev
# → http://localhost:3000/admin/dzvinky
# → http://localhost:3000/admin/nalashtuvannia
# → http://localhost:3000/admin/analityka
```

## Security Domain

### Applicable ASVS Categories

| ASVS Category | Applies | Standard Control |
|---------------|---------|------------------|
| V2 Authentication | yes | `requireAdmin()` on all admin callback actions |
| V4 Access Control | yes | Admin layout + action-level guard; no buyer access to list/mutations |
| V5 Input Validation | yes | Zod schemas on action inputs; enum status values |
| V6 Cryptography | no | N/A for this phase |

### Known Threat Patterns

| Pattern | STRIDE | Standard Mitigation |
|---------|--------|---------------------|
| Unauthorized status/archive change | Elevation of privilege | `requireAdmin()` + server-side rules |
| Archive bypass (skip CONSULTED) | Tampering | Service rejects non-CONSULTED |
| Oversized note payload | Denial of service / storage | Zod `max()` on note length (e.g. 4000) — planner discretion |
| IDOR on callback id | Spoofing | Mutations use `where: { id }` — no cross-tenant (single store) |

Storefront rate limit on **create** remains unchanged — not part of Phase 35 surface.

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Callback list on settings page | Dedicated `/admin/dzvinky` | Phase 35 | CALL-01 |
| No operator status | PENDING / CONSULTED | Phase 35 | CALL-02 |
| No archive | `archivedAt` + view tabs | Phase 35 | CALL-04 |

**Deprecated/outdated:**
- `listCallbackRequestsAdmin` in `store-settings.service.ts` — remove after move.

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | Prisma `@default(PENDING)` backfills existing rows on migrate without custom SQL | Migration | Low — same as Conversation migration pattern in repo |
| A2 | `take: 200` is acceptable safety cap per D-03 discretion | Service | Medium if >200 active callbacks |
| A3 | Two-way status toggle (PENDING ↔ CONSULTED) is allowed | CALL-02 | Low — CONTEXT does not forbid revert |
| A4 | Analytics count unchanged satisfies D-12 | Codebase | Low — explicit in CONTEXT |

## Open Questions

1. **Note max length**
   - What we know: `@db.Text` is unbounded in Postgres.
   - What's unclear: Operator paste limits.
   - Recommendation: Zod `z.string().max(4000)` in validator — planner discretion.

2. **Single vs three server actions**
   - What we know: CONTEXT leaves to discretion.
   - Recommendation: Three actions (status, note, archive) — clearer errors and revalidation.

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| Node.js | build/test | ✓ | v24.14.0 | — |
| Prisma CLI | migration | ✓ | 7.8.0 | — |
| PostgreSQL (dev) | migrate dev | ✓ (assumed) | — | `prisma migrate dev` needs DATABASE_URL |
| vitest | unit tests | ✓ | via npm test | — |

**Missing dependencies with no fallback:** none identified for local dev with existing `.env`.

## Sources

### Primary (HIGH confidence)
- Codebase: `prisma/schema.prisma`, `callback-request.service.ts`, `store-settings.service.ts`, `nalashtuvannia/page.tsx`, `callback-requests-table.tsx`, `order-list-filters.tsx`, `order-list-status-select.tsx`, `admin-nav-items.ts`, `admin-analytics.service.ts`
- `.planning/phases/35-callback-calls/35-CONTEXT.md`, `35-UI-SPEC.md`
- `.planning/REQUIREMENTS.md` — CALL-01..04

### Secondary (MEDIUM confidence)
- Prior phase validation commands — `.planning/phases/34-admin-analytics/34-RESEARCH.md` (`npx tsc --noEmit`, vitest)

### Tertiary (LOW confidence)
- None asserted without codebase verification

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — no new packages; verified installed versions
- Architecture: HIGH — direct extension of existing admin/order patterns
- Pitfalls: HIGH — archive gate and service move are explicit in CONTEXT

**Research date:** 2026-05-20  
**Valid until:** 2026-06-20 (stable admin CRUD domain)

---

## RESEARCH COMPLETE

**Phase:** 35 - Callback calls (Дзвінки)  
**Confidence:** HIGH

### Key Findings

- `CallbackRequest` exists but lacks `status`, `note`, `archivedAt` — one Prisma migration unlocks CALL-02–04.
- Admin list logic lives in the wrong service (`store-settings`) and wrong page (`nalashtuvannia`) — move to `callback-request.service.ts` + `/admin/dzvinky`.
- Reuse orders patterns: Link tab filters, row `Select`, `requireAdmin` actions, sonner toasts; no new npm deps.
- Analytics callback count should stay unfiltered by archive (D-12) — no change in `admin-analytics.service.ts`.
- Archive eligibility must be enforced in the service when `status !== CONSULTED`, not only via disabled UI.

### File Created

`/Users/michael_ivashko/WebStormProjects/web/appliance-store/.planning/phases/35-callback-calls/35-RESEARCH.md`

### Confidence Assessment

| Area | Level | Reason |
|------|-------|--------|
| Standard stack | HIGH | In-repo patterns + verified Prisma/Next versions |
| Architecture | HIGH | CONTEXT locked; codebase references mapped file-by-file |
| Pitfalls | HIGH | Explicit gates documented with mitigations |

### Open Questions

- Note max length (recommend 4000 via Zod).
- Three server actions vs one combined mutation (recommend three).

### Ready for Planning

Research complete. Planner can create PLAN.md from this document and `35-CONTEXT.md` / `35-UI-SPEC.md`.
