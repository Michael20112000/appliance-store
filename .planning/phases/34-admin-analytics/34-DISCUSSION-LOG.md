# Phase 34: Admin analytics - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-05-20
**Phase:** 34-admin-analytics
**Areas discussed:** Metrics scope, Time period, KPI + charts layout, Dashboard preview, Revenue format

---

## Metrics scope

| Option | Description | Selected |
|--------|-------------|----------|
| Всі замовлення | Будь-яке замовлення (PENDING, DELIVERED і т.д.) — простіший запит, більша цифра | ✓ |
| Тільки DELIVERED | Тільки доставлені/закриті — точніша виручка, відфільтровує скасовані | |
| Всі крім CANCELLED | Золота середина | |

**User's choice:** Всі замовлення
**Notes:** Простіший запит, показує загальний обсяг інтересу

---

## Time period

| Option | Description | Selected |
|--------|-------------|----------|
| Останні 30 днів, без селектора | Фіксований діапазон, немає фільтра | |
| 7 / 30 / 90 днів — селектор | Оператор може перемикати період | ✓ |
| Весь час | Усі дані завжди, без фільтрування | |

**User's choice:** 7/30/90 днів — селектор
**Notes:** Default 30 днів. Dashboard preview використовує фіксований 30-денний діапазон без селектора.

---

## KPI + графіки на /admin/analityka

| Option | Description | Selected |
|--------|-------------|----------|
| KPI рядом з графіками | KPI-картки (замовлення, виручка, дзвінки) + 2 графіки нижче | ✓ |
| Тільки графіки | 2-3 графіки без окремих KPI-карток | |
| KPI + 1 зведений графік | KPI-картки + один комбінований графік з двома лініями | |

**User's choice:** KPI рядом з графіками
**Notes:** Тренд замовлень + тренд виручки як два окремі графіки. Дзвінки — тільки KPI-картка.

---

## Dashboard preview (AN-02)

| Option | Description | Selected |
|--------|-------------|----------|
| 2 міні-графіки + посилання | 2 компактні графіки (замовлення + виручка) + «Детальна аналітика» | ✓ |
| StatCard-картки з трендом | StatCard з індикатором зростання/падіння (без графіка) | |
| 1 широкий графік + KPI | 1 повношироткий графік + KPI-рядок під ним | |

**User's choice:** 2 міні-графіки + посилання
**Notes:** Компактні (~120px висота), без осей та селектора, за останні 30 днів. Посилання «Детальна аналітика →» на /admin/analityka.

---

## Revenue format

| Option | Description | Selected |
|--------|-------------|----------|
| 1 200 грн | Цілі гривні, пробіл як роздільник тисяч | ✓ |
| 1 200,00 грн | З копійками | |

**User's choice:** 1 200 грн
**Notes:** Ціни зберігаються як Int в Prisma (цілі гривні), тому копійки не потрібні.

---

## Claude's Discretion

- **Chart library:** shadcn chart (recharts) — встановити через `npx shadcn@latest add chart`. Вписується в існуючий стек.
- **Chart type:** line/area chart для обох трендів — стандартний вибір для time-series.
- **Prisma query approach:** `$queryRaw` або `groupBy` для агрегації по днях — Claude вибирає кращий варіант при плануванні.

## Deferred Ideas

- CSV/Excel export аналітики — post-v2.0
- Порівняння з попереднім периодом — post-v2.0
- Тренд дзвінків як окремий графік — може бути в Phase 35
- Mobile touch interactions для графіків — post-v2.0
