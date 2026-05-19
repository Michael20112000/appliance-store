---
title: Bugfix intake — 2026-05-19
status: open
milestone: v1.4-stabilization
source: operator QA
phase: 21
wave: 2
---

# Bugfix intake — wave 1 (done)

**Environment:** local `http://localhost:3000`  
**Branch:** main  
**Tester:** operator

| ID | Area | Severity | Steps to reproduce | Expected | Actual | Status |
|----|------|----------|-------------------|----------|--------|--------|
| BUG-12 | Admin `/admin/kategorii` | major | Відкрити список категорій; змінити «Порядок» у рядку | Порядок 1…N (N = кількість категорій); не можна ввести > N; при зміні порядку інші зсуваються (swap/rank), без дублікатів | Стартує з 0; можна ввести 62 при 3 категоріях; однакові sortOrder можливі | done |
| BUG-13 | Admin `/admin/kategorii/[id]` | minor | Відкрити редагування категорії | Кнопка «Переглянути товари» → `/admin/tovary?categoryId={id}` | Кнопки немає (лише «Додати товар» на деяких збірках) | done |

## BUG-12 — деталі логіки порядку

- База: **1-based** rank (1 = перша в списку).
- Max для категорії з id X при N категоріях: **N**.
- При зміні категорії з позиції `old` на `new` (1…N): інші категорії **зсуваються**, щоб залишилась перестановка без прогалин і без однакових rank.
- Приклад N=3: друга → 3: колишня 3-та стає 2-ю; третя → 1: колишня 1-ша → 2, колишня 2-га → 3.

## BUG-13 — деталі

- URL: `/admin/tovary?categoryId=<cuid>`
- Фільтр на сторінці товарів уже має підтримувати `categoryId` (перевірити при implement).

# Bugfix intake — wave 2

| ID | Area | Severity | Steps to reproduce | Expected | Actual | Status |
|----|------|----------|-------------------|----------|--------|--------|
| BUG-14 | Admin product form + model | major | Створити/редагувати товар | Немає статусу чернетка/в наявності/продано; лише **кількість** (0 = розпродано, >0 = в наявності); створений адміном товар одразу на вітрині | Поле статусу DRAFT/AVAILABLE; SOLD окремо від qty | done |
| BUG-15 | Checkout + order status | major | Оформити замовлення → підтвердити / скасувати | Списання qty при **CONFIRMED** (−1 за одиницю); при **CANCELLED** після резерву — повернення +1; при **COMPLETED** без змін | Списання при checkout; SOLD enum при qty=0 | done |
| BUG-16 | Admin `/admin/tovary` | minor | Відкрити список товарів | Без колонки статусів | Колонка + inline select статусу | done |
| BUG-17 | Admin `/admin/tovary/[id]` | minor | Відкрити картку товару | Список замовлень по товару з посиланням на `/admin/zamovlennia/{orderNumber}` | Немає блоку замовлень | done |

## BUG-14 — логіка наявності

- Один listing = одна модель, **quantity** = кількість однакових одиниць.
- `quantity > 0` → в наявності (вітрина + можна в кошик).
- `quantity === 0` → розпродано (приховано з вітрини).
- Enum `ProductStatus` (DRAFT / AVAILABLE / SOLD) **прибрати**.

## BUG-15 — резерв через статус замовлення

- `PENDING` → `CONFIRMED`: `quantity -= item.quantity` (атомарно, помилка якщо не вистачає).
- `* → CANCELLED` (якщо до цього був резерв, не з PENDING): `quantity += item.quantity`.
- `→ COMPLETED`: без змін qty.
- Checkout **не** зменшує qty (лише перевірка `quantity >= 1`).

## After triage

- [x] Wave 1 grouped into phase 21 plan wave: 1 (2 items)
- [x] Wave 2 grouped into phase 21 plan wave: 2 (4 items)
- [ ] Duplicates: none
