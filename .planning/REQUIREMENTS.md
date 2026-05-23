# Requirements: Appliance Store Lviv — v2.3

**Defined:** 2026-05-23
**Core Value:** Покупець швидко знаходить б/у техніку у Львові, оформлює замовлення і за потреби пише магазину в чат.

## v2.3 Requirements

### Header (HDR)

- [ ] **HDR-01**: Кнопки авторизації прибрані з мобільного хедера; бургер-кнопка стоїть крайньою правою
- [ ] **HDR-02**: При кліку "Вийти" у хедері показується стан завантаження (лоадер або текст "Виходимо...") до завершення запиту

### Floating UI (FAB)

- [ ] **FAB-03**: Callback-форма не показує повідомлення "Вкажіть номер телефону — лише цифри, від 10 до 15"
- [ ] **FAB-04**: Всі floating-кнопки зібрані у правому нижньому куті екрана у стовпчик у порядку: зворотній дзвінок (верх) → корзина → чат (низ); callback-діалог відкривається поверх цього блоку

## Future Requirements

- HDR-03: OAuth-логін через Google/Apple — post-v3.0
- FAB-05: Реальні URL для соцмереж (Telegram, Viber, WhatsApp) — коли оператор надасть посилання

## Out of Scope

| Feature | Reason |
|---------|--------|
| Повна перебудова auth flow | Виходить за рамки UI-полірування |
| Анімації для floating-кнопок | Вже є fade-перехід між сторінками; додатковий рух зайвий |

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| HDR-01 | Phase 44 | Pending |
| HDR-02 | Phase 44 | Pending |
| FAB-03 | Phase 45 | Pending |
| FAB-04 | Phase 45 | Pending |

**Coverage:**
- v2.3 requirements: 4 total
- Mapped to phases: 4
- Unmapped: 0 ✓

---
*Requirements defined: 2026-05-23*
*Last updated: 2026-05-23 after initial definition*
