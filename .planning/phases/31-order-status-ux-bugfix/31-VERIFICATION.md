---
phase: 31-order-status-ux-bugfix
verified: 2026-05-20T15:55:00Z
status: passed
score: 7/7
overrides_applied: 0
human_verification:
  - test: "На `/admin/zamovlennia` знайти ASL-20260519-0013 (або PENDING pickup з товаром qty=0) і в списку обрати «Підтверджено»"
    expected: "Toast «Недостатньо товару на складі для підтвердження.» + hint «Збільште кількість…», не generic UNKNOWN «Не вдалося оновити статус…»"
    why_human: "Потрібен реальний заказ і DB qty; grep не підтверджує runtime toast у браузері"
  - test: "У `/admin/tovary/[id]` відновити quantity ≥ 1 для лінії замовлення, знову підтвердити ASL (або той самий seed)"
    expected: "CONFIRMED проходить без stock-помилки; reserve спрацьовує (статус оновлюється)"
    why_human: "D-08 / ROADMAP SC3 — успіх після data fix потребує живої БД"
  - test: "Візуально на списку: різні акценти тригера за статусом; для CONFIRMED повний текст «Підтверджено (поточний)» без обрізання"
    expected: "Скасовано — червонуватий фон/бордер, виконано — зеленуватий; min-w ~14rem вміщує довгий UA label"
    why_human: "ORD-05 / D-09–D-10 — CSS є в коді, але clipping і hue perception лише в UI"
---

# Phase 31: Order status UX & bugfix Verification Report

**Phase Goal:** Оператор бачить статуси з першого погляду; критичний bug підтвердження закритий.
**Verified:** 2026-05-20T15:55:00Z
**Status:** human_needed
**Re-verification:** No — initial verification

## Goal Achievement

### Observable Truths

| # | Truth | Status | Evidence |
| --- | ------- | ---------- | -------------- |
| 1 | List select shows «Недостатньо товару на складі для підтвердження» (not UNKNOWN) when server returns `INSUFFICIENT_STOCK` | ✓ VERIFIED | `order-list-status-select.tsx` calls `showOrderStatusErrorToast(result.error)`; `ORDER_STATUS_ERROR_MESSAGES.INSUFFICIENT_STOCK` in `admin-status-errors.ts`; component test asserts stock title (not UNKNOWN) |
| 2 | Stock error toast includes actionable hint to restore qty or cancel order | ✓ VERIFIED | `ORDER_STATUS_ERROR_DESCRIPTIONS.INSUFFICIENT_STOCK` + `toast.error(title, { description })`; covered in `admin-status-errors.test.ts` and `order-list-status-select.test.tsx` |
| 3 | `CONFIRMED` still requires successful reserve — no bypass when `product.quantity` is 0 | ✓ VERIFIED | `admin-order.service.ts` L319–321: `shouldReserveInventoryOnTransition` → `reserveProductUnitsForOrder` before `order.update`; service test rejects with `INSUFFICIENT_STOCK`, asserts `orderUpdate` not called |
| 4 | Status `SelectTrigger` shows distinct light accent per `OrderStatus` on list and detail | ✓ VERIFIED | `getOrderStatusAccentClass` maps all 6 statuses (amber/sky/violet/emerald/red + dark); applied on both triggers in list (L62, L107) and detail (L99–101); `status-styles.test.ts` per-status hue |
| 5 | «Підтверджено (поточний)» is not clipped in list select at min-w ~14rem | ✓ VERIFIED (code) | `listTriggerClassName = "min-w-[14rem] w-auto max-w-[18rem] whitespace-nowrap"`; dropdown item appends `(поточний)` to `ORDER_STATUS_LABELS_UA.CONFIRMED` — visual clip needs human (below) |
| 6 | Vitest covers list error mapping and service PENDING→CONFIRMED stock failure | ✓ VERIFIED | `npx vitest run` on 4 phase files: **41 passed**; includes list INSUFFICIENT_STOCK toast + `ASL-20260519-0013` service regression |
| 7 | ASL-20260519-0013 root cause documented; confirm succeeds only after qty restored | ✓ VERIFIED | `31-01-SUMMARY.md` § ASL root cause (PENDING pickup, qty 0, list UNKNOWN mapping, restore qty path); no reserve bypass in code |

**Score:** 7/7 truths verified (programmatic); 3 manual checks pending for phase closure

### ROADMAP Success Criteria

| # | Criterion | Status | Evidence |
| --- | --------- | ------ | -------- |
| 1 | Колонка статусу з легким кольоровим акцентом за статусом | ✓ VERIFIED | Status column renders `OrderListStatusSelect` with `getOrderStatusAccentClass` on trigger (UI-SPEC: trigger-only, not whole row — matches D-09) |
| 2 | Select не обрізає «Підтверджено (поточний)» | ✓ VERIFIED (code) / human visual | `min-w-[14rem]` + `whitespace-nowrap` on list trigger |
| 3 | ASL-20260519-0013 → CONFIRMED проходить (або задокументована причина + fix) | ✓ VERIFIED | Root cause + fix documented; server path unchanged; valid confirm after qty restore — live ASL needs human |
| 4 | Vitest на регресію transition/stock | ✓ VERIFIED | Phase Vitest suites green (41 tests) |

### Required Artifacts

| Artifact | Expected | Status | Details |
| -------- | ----------- | ------ | ------- |
| `src/lib/order/admin-status-errors.ts` | UA messages + `showOrderStatusErrorToast` | ✓ VERIFIED | 28 lines; exports `ORDER_STATUS_ERROR_MESSAGES`, descriptions, toast helper |
| `src/lib/order/status-styles.ts` | `getOrderStatusAccentClass` | ✓ VERIFIED | All 6 `OrderStatus` entries + dark variants |
| `src/components/admin/order-list-status-select.tsx` | List select: shared errors, accents, width | ✓ VERIFIED | Imports helpers; removed local `errorMessages`; both trigger branches styled |
| `src/components/admin/order-status-select.tsx` | Detail parity | ✓ VERIFIED | Same `showOrderStatusErrorToast` + accent + `min-w-[14rem]` |

### Key Link Verification

| From | To | Via | Status | Details |
| ---- | --- | --- | ------ | ------- |
| `order-list-status-select.tsx` | `admin-status-errors.ts` | `showOrderStatusErrorToast` on `!result.ok` | ✓ WIRED | L7–8 import, L79 call |
| `order-list-status-select.tsx` | `status-styles.ts` | `getOrderStatusAccentClass(status)` on `SelectTrigger` | ✓ WIRED | L62, L107 |
| `admin-order.service.ts` | `product-inventory.ts` | `reserveProductUnitsForOrder` on PENDING→CONFIRMED | ✓ WIRED | L319–321 unchanged; test asserts call before failure |

### Data-Flow Trace (Level 4)

| Artifact | Data Variable | Source | Produces Real Data | Status |
| -------- | ------------- | ------ | ------------------ | ------ |
| `OrderListStatusSelect` | `result.error` | `updateOrderStatusAction` → service reserve/transition | Server error codes (`INSUFFICIENT_STOCK`, etc.) | ✓ FLOWING |
| `OrderListStatusSelect` | `status` prop | `orders-data-table` order row | Live `OrderStatus` from DB | ✓ FLOWING |
| `showOrderStatusErrorToast` | `errorCode` | Action failure payload | Maps to UA strings, not hardcoded UNKNOWN for stock | ✓ FLOWING |

### Behavioral Spot-Checks

| Behavior | Command | Result | Status |
| -------- | ------- | ------ | ------ |
| Phase Vitest regression | `npx vitest run src/lib/order/admin-status-errors.test.ts src/lib/order/status-styles.test.ts src/components/admin/order-list-status-select.test.tsx src/server/services/admin-order.service.test.ts` | 4 files, 41 tests passed | ✓ PASS |
| Production build | `npm run build` | Exit 0 | ✓ PASS |

### Probe Execution

Step 7c: SKIPPED — no phase-declared probes.

### Requirements Coverage

| Requirement | Source Plan | Description | Status | Evidence |
| ----------- | ---------- | ----------- | ------ | -------- |
| **ORD-05** | 31-01 | Status colors + select width on admin orders | ✓ SATISFIED (code) | Per-status trigger accents; `min-w-[14rem]` list/detail; human visual sign-off pending |
| **BUG-24** | 31-01 | ASL confirm / stock error — valid transition without spurious error | ✓ SATISFIED (mapping + policy) | List maps `INSUFFICIENT_STOCK` with hint; reserve not bypassed; ASL documented; live confirm-after-qty-fix needs human |

### Anti-Patterns Found

| File | Line | Pattern | Severity | Impact |
| ---- | ---- | ------- | -------- | ------ |
| — | — | None in phase-modified files | — | No TBD/FIXME/stub handlers |

### Human Verification Required

### 1. ASL stock toast (not UNKNOWN)

**Test:** На `/admin/zamovlennia` знайти ASL-20260519-0013 (або PENDING pickup з товаром qty=0) і в списку обрати «Підтверджено».
**Expected:** Toast «Недостатньо товару на складі для підтвердження.» + hint «Збільште кількість…», не generic UNKNOWN.
**Why human:** Потрібен реальний заказ і DB qty.

### 2. Confirm after qty restore

**Test:** У `/admin/tovary/[id]` відновити `quantity ≥ 1`, знову підтвердити замовлення.
**Expected:** CONFIRMED проходить; статус оновлюється.
**Why human:** D-08 / ROADMAP SC3 — data fix path.

### 3. Visual accents and label width

**Test:** На списку переглянути різні статуси; для CONFIRMED перевірити повний текст «Підтверджено (поточний)».
**Expected:** Скасовано — reddish, виконано — greenish accents; label not clipped.
**Why human:** ORD-05 visual QA.

### Gaps Summary

No programmatic gaps. Automated verification (7/7 truths, artifacts wired, 41 Vitest tests, build) supports phase goal achievement. **Status `human_needed`** because Task 3 `<human-check>`, D-12, and `31-VALIDATION.md` manual-only items require operator UAT on live admin + DB before treating ORD-05/BUG-24 as fully closed in production.

---

_Verified: 2026-05-20T15:55:00Z_
_Verifier: Claude (gsd-verifier)_
