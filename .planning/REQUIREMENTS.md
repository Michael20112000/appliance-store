# Requirements: Appliance Store Lviv — v3.0 Chat & Engagement

**Defined:** 2026-05-24
**Core Value:** Покупець швидко знаходить б/у техніку у Львові, оформлює замовлення і за потреби пише магазину в чат.

## v3.0 Requirements

### Guest Access (Гостьовий чат)

- [ ] **CHAT-01**: Незареєстрований користувач може відкрити чат-віджет і надсилати текстові повідомлення без реєстрації; сесія зберігається через localStorage (`chat_guest_token`)
- [ ] **CHAT-02**: Коли гість реєструється або входить в акаунт, його гостьовий чат автоматично прив'язується до акаунту (повідомлення зберігаються)
- [ ] **CHAT-03**: У адмінській панелі гостьовий користувач відображається як "Гість"

### Lifecycle Control (Управління чатом)

- [ ] **CHAT-04**: Адмін може завершити чат; у відкритому віджеті покупця протягом ~1 секунди з'являється "Чат завершено" і input блокується
- [ ] **CHAT-05**: Після завершення чату юзер може почати новий (кнопка "Почати новий чат" в банері)

### History Drawer (Історія чатів)

- [ ] **CHAT-06**: У заголовку чат-віджету (поряд з кнопкою ×) є кнопка меню, що відкриває дровер з середини віджету; видима тільки для авторизованих
- [ ] **CHAT-07**: Дровер показує список попередніх чатів з можливістю перемикання між ними
- [ ] **CHAT-08**: З дровера можна створити новий чат

### File Attachments (Вкладення файлів)

- [ ] **CHAT-09**: Авторизований юзер та адмін можуть прикріплювати файли (jpg/png/webp + pdf, до 10 МБ) у повідомленнях; неавторизовані — тільки текст

---

## Future Requirements (post-v3.0)

### Notifications

- **NOTF-01**: Push-повідомлення при новому повідомленні в чаті (Service Worker + FCM)
- **NOTF-02**: Email з транскриптом чату після завершення

### Enhanced Chat

- **CHAT-10**: Typing indicators (Pusher presence channels)
- **CHAT-11**: Read receipts ("seen" indicator)
- **CHAT-12**: Пошук по історії чатів
- **CHAT-13**: Прикріплення файлів для гостей (потребує модерації)

---

## Out of Scope

| Feature | Reason |
|---------|--------|
| Video / voice chat | WebRTC інфраструктура, висока складність — не відповідає масштабу магазину |
| Chat-to-order linking for guests | Гості не мають замовлень; реалізувати після стабілізації guest migration |
| File attachments for guests | Вектор зловживань без модерації; виключено в PROJECT.md |
| Multi-admin chat assignment | Один адмін; складність не виправдана |
| Admin-to-admin internal notes | CRM-фіча; поза масштабом |
| Email notification for guests | Гості не мають email; post-v3.0 |
| Typing indicators (v3.0) | Потребує Pusher presence channels; marginal UX gain; defer |

---

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| CHAT-01 | Phase 46 | Pending |
| CHAT-02 | Phase 47 | Pending |
| CHAT-03 | Phase 46 | Pending |
| CHAT-04 | Phase 47 | Pending |
| CHAT-05 | Phase 47 | Pending |
| CHAT-06 | Phase 48 | Pending |
| CHAT-07 | Phase 48 | Pending |
| CHAT-08 | Phase 48 | Pending |
| CHAT-09 | Phase 49 | Pending |

**Coverage:**
- v3.0 requirements: 9 total
- Mapped to phases: 9
- Unmapped: 0 ✓

---
*Requirements defined: 2026-05-24*
*Last updated: 2026-05-24 after initial definition*
