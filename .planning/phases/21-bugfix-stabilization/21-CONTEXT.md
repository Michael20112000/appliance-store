# Phase 21: Bugfix stabilization — Context

**Gathered:** 2026-05-19
**Status:** Ready for planning (verify-only close)

<domain>
## Phase Boundary

Зафіксувати і **перевірити** стабільність `main` після v1.3 (17–20) + operator bugfixes (BUG-01…17). Хвилі 1–2 intake уже імплементовані на гілці; фаза **не** чекає wave 3, поки оператор не відкриє новий intake.

**Не в цій фазі:** нові фічі, redesign, merge `git stash@{0}` (catalog pagination WIP), ре-імплементація вже змержених фіксів «для галочки».

**Операторський пріоритет:** проект зараз працює добре — **мінімум змін у коді**, максимум регресійної перевірки (CI + manual checklist).
</domain>

<decisions>
## Implementation Decisions

### Phase closure (wave 3)
- **D-21-01:** **Verify-only close** — wave 3 intake **не** потрібен зараз. Нові баги → новий `bugfix-intake-YYYY-MM-DD.md` + окремий plan wave (або decimal hotfix phase), не блокувати закриття 21.
- **D-21-02:** Успіх фази = «нічого не зламалось» + intake wave 1–2 залишаються `done`, CI green.

### Retro GSD (waves 1–2 already on main)
- **D-21-03:** **Без re-implement.** `21-01-PLAN.md` — verify-only: `npm run build`, `npm test` / targeted Vitest, `21-MANUAL-CHECKLIST.md`, оновити intake/STATE якщо щось впало.
- **D-21-04:** Commits у verify-плані — лише docs/checklist або **мінімальний** fix якщо verify знайшов регресію; не переписувати вже змержену логіку.

### Verification bar
- **D-21-05:** **Wave-level smoke**, не retro «один commit на баг»: один прогін CI + один consolidated manual checklist на surfaces з BUG-12…17 (див. checklist у plan).
- **D-21-06:** Automated: `npm run build`, `npm test` (або `vitest run` на `product-inventory`, `admin-order`, `admin-product`, `catalog` якщо plan звужує scope).
- **D-21-07:** Manual: пройти `21-MANUAL-CHECKLIST.md` після plan; якщо verify clean — позначити intake `status: completed` і перенести/закрити todo.

### Inventory & guest (BUG-14…15)
- **D-21-08:** Listing = `quantity` only (`>0` вітрина, `0` sold out); enum `ProductStatus` не повертаємо.
- **D-21-09:** Резерв: `PENDING → CONFIRMED` → `quantity -= line.quantity`; release на `→ CANCELLED` зі статусів після резерву (`CONFIRMED`, `READY_FOR_PICKUP`, `OUT_FOR_DELIVERY`); `PENDING → CANCELLED` без змін qty; `→ COMPLETED` без змін qty.
- **D-21-10:** Checkout (guest і logged-in) **не** decrement — лише `assertProductsAvailableForCheckout`; ті самі admin transitions для guest orders.
- **D-21-11:** Multi-qty на лінії замовлення — підтримується (`item.quantity` у `product-inventory.ts`); verify сценарій з qty>1 у checklist (admin confirm/cancel).

### Categories (BUG-12…13)
- **D-21-12:** Category sort **1-based**, max = N категорій, reorder без дублікатів rank (вже в intake — verify, не змінювати поведінку без бага).
- **D-21-13:** «Переглянути товари» → `/admin/tovary?categoryId={id}` — verify на edit category.

### Folded Todos
- **`bugfix-intake-2026-05-19.md`** — єдиний активний intake для фази 21; wave 1–2 `done`; verify-only закриття хвиль.

### Claude's Discretion
- Детальний склад рядків у `21-MANUAL-CHECKLIST.md` (planner).
- Чи робити окремий `21-02-PLAN` лише якщо verify знайде blocker.

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Workflow & intake
- `.planning/BUGFIX-WORKFLOW.md` — intake → plan → execute → verify
- `.planning/todos/pending/bugfix-intake-2026-05-19.md` — BUG-12…17, wave 1–2 done
- `.planning/todos/completed/bugfix-v1.4-intake.md` — BUG-01…11 (prior wave on main)

### Roadmap & state
- `.planning/ROADMAP.md` — Phase 21 success criteria
- `.planning/STATE.md` — milestone v1.4-stabilization

### Inventory implementation (verify targets)
- `src/server/services/product-inventory.ts` — reserve/release + checkout assert
- `src/server/services/product-inventory.test.ts` — transition matrix tests
- `src/server/services/admin-order.service.ts` — status change hooks
- `prisma/schema.prisma` — `Product.quantity`, `Order` guest fields (phase 20)

### Prior phase context
- `.planning/phases/20-guest-checkout/20-CONTEXT.md` — guest cart/checkout, no qty at checkout
- `.planning/phases/19-database-purge-empty-states/19-CONTEXT.md` — empty DB tolerance

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `product-inventory.ts` — єдина точка reserve/release; `INSUFFICIENT_STOCK` на confirm.
- `admin-order.service.ts` — викликає inventory helpers на transition.
- Vitest: `product-inventory.test.ts`, `admin-order.service.test.ts`, `admin-product.service.test.ts`, `catalog.service.test.ts`.

### Established Patterns
- Storefront/catalog filter: `quantity: { gte: 1 }`.
- Bugfix waves ≤8 items per plan (BUGFIX-WORKFLOW) — для verify одного plan достатньо.

### Integration Points
- Admin order status UI → `admin-order.service` transitions → inventory.
- Guest checkout → order `PENDING` → admin confirm same path as logged-in buyer orders.

</code_context>

<specifics>
## Specific Ideas

Оператор: «наразі проект працює добре, лиш би не проїбати це» — усі зміни в цій фазі мають бути оборонні (verify/fix regression only).

</specifics>

<deferred>
## Deferred Ideas

- **Wave 3 / нові баги** — окремий intake-файл коли з’являться; не тягнути в verify-only close.
- **`git stash@{0}`** — catalog pagination WIP; окрема фаза/plan.
- **Phase 19 human UAT** — `19-HUMAN-UAT.md`, не блокує 21 verify.
- **CWV / Lighthouse** — v2 PERF-01.

### Reviewed Todos (not folded)
- `bugfix-intake-TEMPLATE.md` — шаблон, не scope фази.

</deferred>

---

*Phase: 21-bugfix-stabilization*
*Context gathered: 2026-05-19*
