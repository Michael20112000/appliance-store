---
created: 2026-05-19
title: v1.5 operator UX intake
area: admin
status: open
milestone: v1.5
---

# Bugfix / polish intake — v1.5 (2026-05-19)

**Milestone:** v1.5 Incremental polish & operator UX  
**Workflow:** `.planning/BUGFIX-WORKFLOW.md`

| ID | Area | Severity | Steps to reproduce | Expected | Actual | Status |
|----|------|----------|-------------------|----------|--------|--------|
| BUG-18 | orders | major | Admin: замовлення з самовивозом → змінити статус | Немає «Доставляється» | Є OUT_FOR_DELIVERY | open |
| BUG-19 | admin | minor | `/admin/kategorii/[id]` — кнопки біля заголовка | Іконки (Plus, Eye…) | Без іконок | open |
| BUG-20 | admin | major | `/admin/tovary/[id]` — toolbar | Auto-save, «Назад», trash delete | Save/Скасувати/На вітрині | open |
| BUG-21 | admin | minor | `/admin/kategorii` список | Колонка «Товари» → Переглянути | Немає колонки | open |
| BUG-22 | storefront | minor | `/` секція Категорії | Як хедер — без порожніх | Всі категорії з БД | open |
| BUG-23 | storefront | minor | Footer + mobile drawer | Телефон, email, callback, counts | Немає | open |

**Wave 1 (≤6):** BUG-18…23 → phases 22–26 per ROADMAP.md
