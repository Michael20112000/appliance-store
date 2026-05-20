# Phase 31: Order status UX & bugfix - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-05-20
**Phase:** 31-Order status UX & bugfix
**Areas discussed:** BUG-24 / ASL-20260519-0013

---

## BUG-24 / ASL-20260519-0013

| Option | Description | Selected |
|--------|-------------|----------|
| INSUFFICIENT_STOCK toast | «Недостатньо товару на складі» | |
| INVALID_STATUS_TRANSITION | «Недопустима зміна статусу» | |
| No option / disabled | Select doesn't offer Підтверджено | |
| Other (free text) | «Не вдалося оновити статус…» | ✓ |
| You decide after debug | Planner investigates | |

**User's choice:** Free text — toast «Не вдалося оновити статус. Спробуйте ще раз.» (UNKNOWN in UI)

**Notes:** DB check: order PENDING, PICKUP; product qty=0; server throws INSUFFICIENT_STOCK but list select lacks error mapping.

---

## Root fix strategy

| Option | Description | Selected |
|--------|-------------|----------|
| UX only | Map INSUFFICIENT_STOCK in list + detail; no logic change | |
| UX + soft reserve | Reserve at checkout; confirm if order was valid at creation | |
| UX + confirm without decrement | Idempotent when qty already 0 | |
| Data fix only | Fix this order in DB + toast | |

**User's choice:** (implicit via follow-up) UX fix + clear messaging; user asked how admin qty mistake should work — chose block with clear message below.

**Notes:** User did not understand order on OOS product; suspects manual admin qty decrease.

---

## Admin qty mistake policy

| Option | Description | Selected |
|--------|-------------|----------|
| Block + clear message | Toast/hint: increase qty or cancel order | ✓ |
| Confirm without decrement | Allow confirm when reserve fails | |
| Admin guard on qty decrease | Prevent qty below pending orders sum | |
| Combo guard + warning badge | Admin guard + order UI warning | |

**User's choice:** Block confirm + clear operator guidance

**Notes:** No auto-confirm without stock; operator restores qty manually then retries.

---

## Areas not discussed (ORD-05)

Status colors and select width were not selected in gray-area picker. Planner follows `.planning/REQUIREMENTS.md` ORD-05 and ROADMAP success criteria; details in CONTEXT.md D-09–D-10.

## Claude's Discretion

- Status color palette and select width implementation details
- Hint presentation (toast description vs inline)

## Deferred Ideas

- Soft reservation at checkout
- Admin qty-decrease guard vs pending orders
- Combo guard + warning badge on order detail
