# Bugfix workflow (GSD)

**Не фіксити баги «пачкою в чаті».** Кожна хвиля — окрема фаза/план з intake → plan → execute → verify.

## 1. Зафіксувати баг (intake)

**Варіант A — один баг:**
```
/gsd-capture <короткий заголовок>
```
Створюється `.planning/todos/pending/<area>-<slug>.md` з problem / files / solution.

**Варіант B — сесія QA (5+ багів):**
Скопіюй `.planning/todos/pending/bugfix-intake-TEMPLATE.md` → `bugfix-intake-YYYY-MM-DD.md` і заповни таблицю.  
**Не чіпай код**, поки таблиця не повна.

## 2. Тріаж (людина або агент у discuss)

- Severity: `blocker` | `major` | `minor`
- Area: storefront | admin | orders | cart | auth | data
- Чи це регресія після merge? (так → пріоритет)
- Групувати **≤ 8 багів** на один plan wave

## 3. Фаза в ROADMAP

```
/gsd-phase 21-bugfix-stabilization
```
або decimal insert між фазами: `/gsd-phase --insert 20 21.1-hotfix-…`

## 4. Планування (обовʼязково)

```
/gsd-discuss-phase 21
/gsd-plan-phase 21
```

План має містити: файли, критерії «done», тести (Vitest/e2e/manual), **один commit на баг** або на логічний шматок.

## 5. Виконання

```
/gsd-execute-phase 21
```

Правила:
- Не змішувати з WIP фічами (pagination, seed) в тому ж commit
- Після кожного бага — `vitest` / `tsc` на торкнутих файлах
- Оновити рядок у intake → `done`

## 6. Перевірка

```
/gsd-verify-work
```
+ чеклист `21-MANUAL-CHECKLIST.md` якщо є UI.

## 7. Закриття хвилі

- Intake → `todos/completed/` або `status: completed` у файлі
- `STATE.md` → `stopped_at` / наступна хвиля
- `main` push лише після verify

## Антипатерни (чому «тупить»)

| ❌ Не так | ✅ Так |
|---------|--------|
| 10 багів одним повідомленням без intake | Таблиця intake + plan |
| Merge WIP stash + bugfix разом | Окремі PR/commits |
| Фікс без тесту на регресію | Мінімум unit або manual row у PLAN |
| `requireBuyer` повернути «бо простіше» | CONTEXT фази + success criteria |

## Поточний backlog

Див. `.planning/todos/pending/` та фазу **21** у `ROADMAP.md`.
