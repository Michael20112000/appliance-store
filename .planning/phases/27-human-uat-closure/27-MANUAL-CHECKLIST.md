# 27-MANUAL-CHECKLIST — Master operator UAT (v1.5)

**Мета:** Закрити UAT-01 для milestone v1.5  
**Базовий URL:** http://localhost:3000  
**Viewport:** desktop + **375px** для drawer/footer (D-13)

Заповнюй результати в [`27-UAT-REPORT.md`](./27-UAT-REPORT.md).

---

## §0 Environment

| # | Крок | Pass / Fail |
|---|------|-------------|
| 0.1 | `npm run dev` на http://localhost:3000 | |
| 0.2 | Адмін-сесія активна | |
| 0.3 | Автоматичний gate (§2) виконано в плані 27-02 **до** ручного блоку | |

---

## §1 Purge & empty state

Виконати повністю: **[19-MANUAL-CHECKLIST.md](./19-MANUAL-CHECKLIST.md)**

Записати результати в `27-UAT-REPORT.md` §19 purge.

---

## §2 Automated gate (D-14)

Виконує executor / оператор перед ручним UAT:

```bash
# Якщо БД порожня після purge і потрібен повний npm test:
npx prisma db seed

# Targeted v1.5 regression:
npm test -- --run src/lib/order/status-transitions.test.ts \
  src/components/admin/order-list-status-select.test.ts \
  src/server/services/admin-order.service.test.ts

npm test
npm run build
```

| Результат | Pass / Fail |
|-----------|-------------|
| Targeted status tests | |
| Full `npm test` | |
| `npm run build` | |

**P2:** якщо падає лише `prisma/seed.test.ts` (out-of-stock count) — задокументувати в звіті, не блокувати UAT (D-06).

**Не запускати:** `npm run test:e2e` — `e2e/cart-auth.spec.ts` застарілий (очікує redirect на login).

---

## §3 Smoke — guest checkout (D-16)

**Передумова:** хоча б один товар in-stock (після `npx prisma db seed` або створення в `/admin/tovary`).

| # | Крок | Pass / Fail |
|---|------|-------------|
| 3.1 | Як гість: додати товар у кошик | |
| 3.2 | `/koszyk` — підзаголовок про оформлення без реєстрації | |
| 3.3 | Перейти на `/zamovlennia`, заповнити форму, відправити | |
| 3.4 | `/zamovlennia/pidtverdzhennia/[orderNumber]` — **номер замовлення** видно | |

---

## §4 Smoke — admin orders (D-17)

| # | Крок | Pass / Fail |
|---|------|-------------|
| 4.1 | `/admin/zamovlennia` — список і деталь відкриваються | |
| 4.2 | Замовлення **самовивіз**: у select статусу **немає** «Доставляється» | |
| 4.3 | Замовлення **доставка Львів**: **немає** «Готово до самовивозу» | |
| 4.4 | Спроба незаконного переходу (якщо UI дозволяє) — статус **не** зберігається (ORD-04) | |

→ **BUG-18** verified якщо 4.2–4.4 pass.

---

## §5 Phase 22–23 spot-check

| # | Перевірка | BUG | Pass / Fail |
|---|-----------|-----|-------------|
| 5.1 | `/admin/kategorii/[id]` — іконки Plus, Eye біля заголовка | BUG-19 | |
| 5.2 | `/admin/kategorii` — колонка «Товари» → «Переглянути» | BUG-21 | |

---

## §6 Phase 24 (optional regression)

Файл: [24-HUMAN-UAT.md](../24-product-edit-auto-save-ux/24-HUMAN-UAT.md) — **status: resolved**.

Швидка регресія (опційно): auto-save на edit, trash delete, «Назад» з categoryId.

→ **BUG-20** verified (вже passed у 24-HUMAN-UAT).

---

## §7 Phase 25 HOME-03 (D-19)

Виконати всі тести: [25-HUMAN-UAT.md](../25-homepage-empty-categories/25-HUMAN-UAT.md)

| Тест | Pass / Fail |
|------|-------------|
| 1. Немає `#kategorii` при порожніх категоріях | |
| 2. Parity header ↔ homepage | |
| 3. Sparse grid 1–3 категорії | |

Оновити `25-HUMAN-UAT.md`: `status: resolved`, усі `result: passed`.  
→ **BUG-22** verified.

---

## §8 Phase 26 FOOT (D-20)

Виконати всі тести: [26-HUMAN-UAT.md](./26-HUMAN-UAT.md)

| Тест | Pass / Fail |
|------|-------------|
| 1. `/admin/nalashtuvannia` → footer tel:/mailto: | |
| 2. Desktop footer — 2 колонки + map | |
| 3. Mobile drawer — badges + форма | |
| 4. «Передзвоніть мені» + 6-й rate limit | |

Оновити `26-HUMAN-UAT.md`: `status: resolved`.  
→ **BUG-23** verified.

---

## §9 Intake closure (D-21)

Файл: `.planning/todos/pending/bugfix-intake-2026-05-19-v1.5.md`

| BUG | Секція checklist | Status |
|-----|------------------|--------|
| BUG-18 | §4 | verified / open |
| BUG-19 | §5.1 | |
| BUG-20 | §6 | |
| BUG-21 | §5.2 | |
| BUG-22 | §7 | |
| BUG-23 | §8 | |

---

## §10 Sign-off

### Severity (D-04–D-06)

| Рівень | Політика |
|--------|----------|
| **P0** | 5xx, зламаний guest checkout, адмін login, illegal status збережено → **блок UAT-01** |
| **P1** | Фікс у фазі 27 якщо ≤30 хв |
| **P2** | defer: seed.test, Cloudinary orphans, e2e cart-auth, **legacy phases 04/07/18** (D-03) |

### Legacy deferred (D-03)

Фази **04, 07, 18** — частковий UAT залишається в STATE.md; **не блокує** v1.5 ship.

| Поле | Значення |
|------|----------|
| Дата | |
| Оператор | |
| Рекомендація | Ship / Hold |
| P0 відкриті | |
