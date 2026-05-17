# Requirements: Appliance Store Lviv

**Defined:** 2026-05-16
**Core Value:** Покупець швидко знаходить б/у техніку у Львові, оформлює замовлення і за потреби пише магазину в чат.

## v1 Requirements

### Authentication

- [ ] **AUTH-01**: Користувач може переглядати каталог без реєстрації
- [ ] **AUTH-02**: Користувач може зареєструватися / увійти (email) через Better Auth
- [x] **AUTH-03**: Для додавання в кошик, checkout і чату потрібен вхід
- [ ] **AUTH-04**: Адмін має окрему роль; доступ до `/admin` лише з role admin
- [ ] **AUTH-05**: Сесія зберігається після перезавантаження сторінки

### Catalog

- [ ] **CAT-01**: Користувач бачить список товарів з фото, ціною, брендом і станом (condition)
- [ ] **CAT-02**: Користувач може відкрити сторінку товару з описом, галереєю і станом
- [ ] **CAT-03**: Користувач може переглядати товари за категоріями (8 стартових + динамічні)
- [ ] **CAT-04**: Користувач може шукати товари за текстом (назва/опис)
- [ ] **CAT-05**: Користувач може фільтрувати за категорією, брендом, діапазоном ціни і станом
- [ ] **CAT-06**: Фільтри синхронізовані з URL (можна поділитися посиланням)
- [ ] **CAT-07**: Продані товари не показуються в публічному каталозі

### Cart & Checkout

- [ ] **CART-01**: Користувач може додати товар у кошик на сторінці товару
- [ ] **CART-02**: Користувач може переглядати кошик і змінювати кількість / видаляти позиції
- [ ] **CART-03**: При вході гостьовий кошик об'єднується з кошиком користувача
- [ ] **CHK-01**: Користувач може оформити замовлення: контакт (телефон), спосіб отримання
- [ ] **CHK-02**: Користувач обирає самовивіз або доставку по Львову
- [ ] **CHK-03**: Замовлення зберігається без онлайн-оплати; показується підтвердження
- [ ] **CHK-04**: Користувач бачить історію своїх замовлень у кабінеті

### Chat

- [x] **CHAT-01**: Користувач може відкрити чат з магазином (з товару або кабінету)
- [x] **CHAT-02**: Повідомлення доставляються в реальному часі (Pusher або еквівалент)
- [x] **CHAT-03**: Історія чату зберігається в БД і доступна після перезавантаження
- [x] **CHAT-04**: Адмін бачить список діалогів і може відповідати покупцям

### Admin

- [ ] **ADM-01**: Адмін може створювати, редагувати і видаляти категорії
- [ ] **ADM-02**: Адмін може CRUD товарів: назва, опис, ціна, бренд, стан, категорія, статус
- [ ] **ADM-03**: Адмін може завантажувати фото товару через Cloudinary (кілька зображень)
- [ ] **ADM-04**: Адмін може переглядати замовлення і змінювати статус
- [x] **ADM-05**: Адмін може керувати чатами з покупцями в одному інтерфейсі

### UI & Quality

- [ ] **UI-01**: Інтерфейс українською мовою
- [ ] **UI-02**: Легкий, повітряний візуальний стиль (design tokens + shadcn)
- [ ] **UI-03**: Адаптивна верстка (mobile-first)
- [ ] **SEO-01**: Унікальні meta title/description для категорій і товарів
- [ ] **SEO-02**: JSON-LD Product і LocalBusiness для локального SEO (Львів)
- [ ] **PERF-01**: Оптимізовані зображення через Cloudinary (формати, розміри)

## v2 Requirements

### Payments

- **PAY-01**: Онлайн-оплата (LiqPay / Monobank)

### Notifications

- **NOTF-01**: Email/SMS про статус замовлення

### Discovery

- **DISC-01**: Wishlist / порівняння товарів
- **DISC-02**: Meilisearch для fuzzy search

### Logistics

- **LOG-01**: Доставка за межі Львова

## Out of Scope

| Feature | Reason |
|---------|--------|
| Маркетплейс (багато продавців) | Single-store за PROJECT.md |
| Нова техніка | Тільки б/у |
| Онлайн-оплата v1 | Відкладено — checkout без payment |
| Доставка по Україні v1 | Лише Львів |
| EN/RU інтерфейс | Тільки UA |
| Native mobile app | Web-first |

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| AUTH-01 | Phase 1 | Pending |
| AUTH-02 | Phase 1 | Pending |
| AUTH-03 | Phase 3 | Complete |
| AUTH-04 | Phase 4 | Pending |
| AUTH-05 | Phase 1 | Pending |
| CAT-01 | Phase 2 | Pending |
| CAT-02 | Phase 2 | Pending |
| CAT-03 | Phase 2 | Pending |
| CAT-04 | Phase 2 | Pending |
| CAT-05 | Phase 2 | Pending |
| CAT-06 | Phase 2 | Pending |
| CAT-07 | Phase 2 | Pending |
| CART-01 | Phase 3 | Pending |
| CART-02 | Phase 3 | Pending |
| CART-03 | Phase 3 | Pending |
| CHK-01 | Phase 3 | Pending |
| CHK-02 | Phase 3 | Pending |
| CHK-03 | Phase 3 | Pending |
| CHK-04 | Phase 3 | Pending |
| CHAT-01 | Phase 5 | Complete |
| CHAT-02 | Phase 5 | Complete |
| CHAT-03 | Phase 5 | Complete |
| CHAT-04 | Phase 5 | Complete |
| ADM-01 | Phase 4 | Pending |
| ADM-02 | Phase 4 | Pending |
| ADM-03 | Phase 4 | Pending |
| ADM-04 | Phase 4 | Pending |
| ADM-05 | Phase 4 | Complete |
| UI-01 | Phase 1 | Pending |
| UI-02 | Phase 1 | Pending |
| UI-03 | Phase 1 | Pending |
| SEO-01 | Phase 2 | Pending |
| SEO-02 | Phase 2 | Pending |
| PERF-01 | Phase 1 | Pending |

**Coverage:**
- v1 requirements: 34 total
- Mapped to phases: 34/34 ✓
- Unmapped: 0

---
*Requirements defined: 2026-05-16*
*Last updated: 2026-05-16 after roadmap creation*
