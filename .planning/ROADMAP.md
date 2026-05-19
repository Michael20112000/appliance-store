# Roadmap: Appliance Store Lviv

## Milestones

- 🚧 **v1.4 Bugfix stabilization** — Phase 21 (intake-first, 2026-05-19)
- ✅ **v1.3 Fixes & Admin UX** — Phases 17–20 (shipped 2026-05-19)
- ✅ **v1.2 Polish & UX** — Phases 11–16 (shipped 2026-05-19) — [archive](milestones/v1.2-ROADMAP.md) · [requirements](milestones/v1.2-REQUIREMENTS.md)
- ✅ **v1.1 Engagement & Fixes** — Phases 7–10 (shipped 2026-05-17) — [archive](milestones/v1.1-ROADMAP.md) · [requirements](milestones/v1.1-REQUIREMENTS.md)
- ✅ **v1.0 Appliance Store MVP** — Phases 1–6 (shipped 2026-05-17) — [archive](milestones/v1.0-ROADMAP.md) · [requirements](milestones/v1.0-REQUIREMENTS.md)

## Phases

### v1.3 Fixes & Admin UX

#### Phase 17: Admin Chat Inbox Layout

**Goal:** Адмін на `/admin/chaty` скролить список чатів і тред всередині панелі, а не всю сторінку.

**Requirements:** ADM-CHAT-02

**Success criteria:**

1. Desktop: grid inbox має `max-h` / `h` прив’язаний до viewport (мінус header/tabs); `min-h-0` на flex/grid chain
2. Ліва колонка (`ConversationList`): `overflow-y-auto`, список не розтягує document height
3. Права колонка (`ChatThread` + `MessageList`): messages area `flex-1 min-h-0 overflow-y-auto`; composer лишається внизу колонки
4. Mobile split view (list ↔ thread) зберігає той самий internal-scroll патерн у активній панелі
5. Manual checklist: 10+ діалогів, довгий тред — page scroll не потрібен для читання історії

**Plans:** 3 plans

Plans:
**Wave 1**

- [x] 17-01-PLAN.md — Admin shell + inbox flex height chain

**Wave 2** *(blocked on Wave 1 completion)*

- [x] 17-02-PLAN.md — Column scroll, mobile native scroll, isPanelOpen

**Wave 3** *(blocked on Wave 2 completion)*

- [x] 17-03-PLAN.md — Manual checklist + Playwright scroll gate + sign-off

---

#### Phase 18: Product Delete from List

**Goal:** Видалення товару з таблиці `/admin/tovary` без row-navigation.

**Requirements:** ADM-PRD-04

**Success criteria:**

1. Остання колонка «Дії» з ghost/icon кнопкою Trash; `aria-label` українською
2. `stopPropagation` на delete control; row-click на інші комірки лишається
3. Confirm dialog (існуючий copy з product-form); toast success/error
4. Reuse `deleteProductAction` / guards; Vitest на stopPropagation або component test
5. e2e або manual: delete → row зникає після refresh/revalidate

**Plans:** 2 plans

Plans:
**Wave 1**

- [x] 18-01-PLAN.md — List delete action + ProductListDeleteButton + «Дії» column

**Wave 2** *(blocked on Wave 1 completion)*

- [x] 18-02-PLAN.md — Vitest stopPropagation + manual checklist

---

#### Phase 19: Database Purge & Empty States

**Goal:** Чиста БД для реального наповнення; застосунок не падає без даних.

**Requirements:** DATA-01, DATA-02

**Success criteria:**

1. `prisma` script (напр. `db:purge` або `seed --purge`) видаляє business tables у безпечному FK order; README/comment для оператора
2. Admin user(s) залишаються або документовано як створити admin після purge
3. `/`, `/katalog`, `/katalog/[slug]`, кошик, `/admin`, `/admin/tovary`, `/admin/kategorii`, `/admin/zamovlennia`, `/admin/chaty` — без unhandled errors при 0 rows
4. Dashboard показує нулі / empty copy, не ламається
5. Operator runs purge on dev/staging; smoke checklist signed

**Plans:** 2 plans

Plans:
**Wave 1**

- [x] 19-01-PLAN.md — Purge script, db:purge, guards, README, Vitest

**Wave 2** *(blocked on Wave 1 completion)*

- [x] 19-02-PLAN.md — Manual checklist + empty-DB smoke (fix-only if 500)

---

#### Phase 20: Guest Checkout (no registration)

**Goal:** Оформлення замовлення без реєстрації — кошик у браузері, checkout з контактами.

**Requirements:** GUEST-01

**Success criteria:**

1. «Додати в кошик» для гостя не редіректить на `/uviity`
2. `/koszyk` і `/zamovlennia` доступні без сесії (guest views)
3. `Order` без `userId` + `guestAccessToken`; підтвердження для гостя
4. Header: `GuestCartNavLink` з badge
5. Logged-in flow і merge pending on login без регресії

**Status:** ✅ Shipped inline 2026-05-19 (restored from WIP stash)

---

#### Phase 21: Bugfix stabilization

**Goal:** Закрити відкриті баги оператора на `main` хвилями — без ad-hoc правок у чаті.

**Requirements:** (per intake) — див. `.planning/BUGFIX-WORKFLOW.md`

**Success criteria:**

1. Intake wave 1 заповнений (`bugfix-intake-*.md`)
2. `21-01-PLAN.md` виконаний; усі blocker/major з wave 1 → done
3. CI / `npm run build` green
4. Manual checklist для змінених surface

**Status:** 🚧 Planning — awaiting intake

**Plans:** TBD after `/gsd-plan-phase 21`

---

<details>
<summary>✅ v1.2 Polish & UX (Phases 11–16) — SHIPPED 2026-05-19</summary>

- [x] Phase 11: Admin List Row UX (5/5 plans)
- [x] Phase 12: Admin Tables — Status & Sort (3/3 plans)
- [x] Phase 13: Product Stock Quantity (4/4 plans)
- [x] Phase 14: Admin Chat Context Menu (3/3 plans)
- [x] Phase 15: Storefront Catalog Polish (3/3 plans)
- [x] Phase 16: Shadcn Select Audit & Verify (3/3 plans)

See [milestones/v1.2-ROADMAP.md](milestones/v1.2-ROADMAP.md).

</details>

<details>
<summary>✅ v1.1 Engagement & Fixes (Phases 7–10) — SHIPPED 2026-05-17</summary>

See [milestones/v1.1-ROADMAP.md](milestones/v1.1-ROADMAP.md).

</details>

<details>
<summary>✅ v1.0 Appliance Store MVP (Phases 1–6) — SHIPPED 2026-05-17</summary>

See [milestones/v1.0-ROADMAP.md](milestones/v1.0-ROADMAP.md).

</details>

## Progress

| Milestone | Phases | Plans | Status |
|-----------|--------|-------|--------|
| v1.4 Bugfix stabilization | 1 (21) | 0 | 🚧 Planning |
| v1.3 Fixes & Admin UX | 4 (17–20) | 7 | ✅ Shipped 2026-05-19 |
| v1.2 Polish & UX | 6 (11–16) | 21 | ✅ Shipped 2026-05-19 |
| v1.1 Engagement & Fixes | 4 (7–10) | 20 | ✅ Shipped 2026-05-17 |
| v1.0 MVP | 6 (1–6) | 36 | ✅ Shipped 2026-05-17 |
