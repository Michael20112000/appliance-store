# Requirements: Appliance Store Lviv

**Defined:** 2026-05-26
**Milestone:** v3.1 UX Polish & Fixes
**Core Value:** Покупець швидко знаходить б/у техніку у Львові, оформлює замовлення і за потреби пише магазину в чат.

## v3.1 Requirements

### Drawers

- [ ] **DRWR-01**: Корзина відкривається як full-height drawer справа (FAB/кнопка кошика більше не переходить на /koszyk)
- [ ] **DRWR-02**: Вішліст відкривається як full-height drawer справа (іконка серця більше не переходить на /obrane)

### Chat UX

- [ ] **CHAT-10**: Юзер бачить лічильник непрочитаних повідомлень від адміна на FAB/кнопці відкриття чату
- [ ] **CHAT-11**: При відкритті нового чату юзеру пропонуються suggested messages: одне контекстне по поточному товару (якщо є) + 2–3 загальних (графік роботи, адреса тощо)
- [ ] **CHAT-12**: На мобілі чат реалізований через shadcn Drawer (виїжає знизу, закривається свайпом вниз)
- [ ] **CHAT-13**: Список чатів (history) виїжає як panel з лівого боку всередині widget, не замінюючи поточний вміст
- [ ] **CHAT-14**: Чат залишається відкритим при навігації між сторінками — закривається лише явним close або зміною URL-параметра

### Admin

- [ ] **ADM-SRCH-01**: Live-пошук товарів через пошукове поле на /admin/tovary

## Future Requirements

### Deferred from previous milestones

- **PERF-01**: Core Web Vitals / Lighthouse оптимізація
- **SEO-01**: Google Search Console підключення
- **SEO-02**: Custom domain
- **REV-01**: Відгуки на товари — форма + список
- **REV-02**: Рейтинг товарів (зірки)

## Out of Scope

| Feature | Reason |
|---------|--------|
| Онлайн-оплата | Поза бізнес-моделлю |
| Доставка за межі Львова | Single-store, local only |
| Багатомовність | Ukrainian-only by design |
| Storefront stock quantity | Admin-only by design |
| Відгуки (REV-01/02) | Deferred post-v3.1 |

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| DRWR-01 | TBD | Pending |
| DRWR-02 | TBD | Pending |
| CHAT-10 | TBD | Pending |
| CHAT-11 | TBD | Pending |
| CHAT-12 | TBD | Pending |
| CHAT-13 | TBD | Pending |
| CHAT-14 | TBD | Pending |
| ADM-SRCH-01 | TBD | Pending |

**Coverage:**
- v3.1 requirements: 8 total
- Mapped to phases: 0 (pending roadmap)
- Unmapped: 8 ⚠️

---
*Requirements defined: 2026-05-26*
*Last updated: 2026-05-26 after v3.1 milestone start*
