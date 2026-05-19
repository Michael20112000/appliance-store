# Phase 21: Bugfix stabilization — Context

**Goal:** Стабілізувати `main` після v1.3 (17–20) + hotfixes; усунути відкриті баги оператора **по хвилях**, без ad-hoc правок у чаті.

**Milestone:** v1.4-stabilization (operator-driven, не нові фічі)

## Scope

| In | Out |
|----|-----|
| Регресії storefront / admin / checkout / cart | Нові фічі (pagination, SEO, reviews) |
| Помилки збірки / runtime на `main` | Повний redesign |
| Дані після purge (empty states edge cases) | Stash WIP merge без окремого плану |

## Workflow

Див. `.planning/BUGFIX-WORKFLOW.md`.

1. Заповнити intake (`bugfix-intake-*.md` або `/gsd-capture` per bug)
2. `/gsd-discuss-phase 21` → пріоритети
3. `/gsd-plan-phase 21` → 21-01-PLAN.md (wave 1)
4. `/gsd-execute-phase 21`
5. Manual checklist + verify

## Known deferred (не плутати з багами)

| Item | Where |
|------|--------|
| Catalog pagination WIP | `git stash@{0}` — catalog-url, CatalogListPagination |
| Phase 19 human UAT admin routes | 19-HUMAN-UAT.md |
| CWV / Lighthouse | v2 PERF-01 |

## Success criteria (phase)

1. Intake backlog для wave 1 заповнений і пріоритизований
2. Усі `blocker`/`major` з wave 1 → `done` у intake
3. `npm run build` / CI green на `main`
4. `21-MANUAL-CHECKLIST.md` пройдений для змінених surface

## Next operator action

Надішли **новий** `bugfix-intake-YYYY-MM-DD.md` (копія template) з усіма багами, що лишились — **без коду в чаті**. Потім: `/gsd-plan-phase 21`.
