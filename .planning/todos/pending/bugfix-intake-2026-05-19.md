---
title: Bugfix intake — 2026-05-19 (wave 1)
status: open
milestone: v1.4-stabilization
source: operator QA
phase: 21
wave: 1
---

# Bugfix intake — wave 1

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

## After triage

- [x] Grouped into phase 21 plan wave: 1 (2 items)
- [ ] Duplicates: none
