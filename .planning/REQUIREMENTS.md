# Requirements: Appliance Store Lviv

**Defined:** 2026-05-20  
**Milestone:** v2.0 Polish, UX & Admin analytics  
**Core Value:** Покупець швидко знаходить б/у техніку у Львові, оформлює замовлення і за потреби пише магазину в чат.

## v2.0 Requirements

### Storefront — navigation & homepage

- [x] **NAV-01**: У mobile drawer під формою зворотного дзвінка є кнопки входу та реєстрації (як у хедері для неавторизованих)
- [x] **HOME-04**: Якір `#kategorii` на головній плавно скролить до секції категорій (не миттєвий стрибок)
- [x] **HOME-05**: На картках категорій на головній показано кількість доступних товарів; категорії з 0 товарів не рендеряться (існуюча логіка збережена)

### Storefront — catalog

- [x] **CAT-02**: На `/katalog` у select сортування підписи: «Новіше», «Дорожче», «Дешевше» (замість поточних довгих формулювань)

### Storefront — product cards

- [x] **CARD-01**: На desktop при hover на картку товару з кількома зображеннями — плавна fade-ротація по 3 с на зображення

### Storefront — PDP

- [x] **PDP-05**: Lightbox-слайдер на PDP: swipe/перемикання плавне, без різкого стрибка після відпускання пальця
- [x] **PDP-06**: Після «Додати в кошик» основна кнопка стає «Вже в кошику»; окремо icon trash для видалення з кошика; без окремої кнопки «Прибрати з кошика» як основної дії; фіксована FAB-кнопка кошика над кнопкою чату
- [x] **PDP-07**: Секція «Схожі товари» — товари тієї ж категорії в ціновому діапазоні ±20% від поточного (виключити поточний товар)

### Storefront — footer

- [x] **FOOT-05**: Footer на desktop: дві колонки (карта | контакти + форма callback); рядок © 2026 Техніка б/у Львів відцентрований

### Admin — orders

- [x] **ORD-05**: У таблиці `/admin/zamovlennia` статуси візуально підсвічені легкими кольорами (скасовано — червонуватий, виконано — зеленуватий тощо); select вміщує довгі підписи типу «Підтверджено (поточний)»
- [x] **BUG-24**: Замовлення ASL-20260519-0013 (і аналогічні кейси) можна перевести в «Підтверджено» без помилки, якщо перехід валідний за delivery/stock

### Admin — dashboard

- [x] **ADM-DASH-03**: На `/admin` кнопки «Додати товар» (синя + Plus) і «Переглянути замовлення» (Eye) з іконками як на `/admin/tovary`
- [x] **ADM-DASH-04**: Stat-картки (нові замовлення, в наявності, розпродано) мають відповідні lucide-іконки

### Admin — categories

- [ ] **ADM-CAT-05**: У таблиці `/admin/kategorii` посилання «Переглянути (N)» виглядає як клікабельне посилання (underline/hover/color), не як plain text
- [x] **ADM-CAT-06**: На `/admin/kategorii` drag & drop змінює `sortOrder` категорій і зберігається на сервері

### Admin — analytics

- [ ] **AN-01**: Сторінка `/admin/analityka` з продажами, виручкою, заявками на дзвінок, графіками та зведеною статистикою проєкту
- [ ] **AN-02**: На `/admin` перед «Останні замовлення» — прев’ю аналітики (макс. 2 графіки + короткі KPI)

### Admin — callback calls (Дзвінки)

- [ ] **CALL-01**: Блок «Заявки на дзвінок» прибрано з `/admin/nalashtuvannia`; таблиця на окремій `/admin/dzvinky`
- [ ] **CALL-02**: Статус заявки: за замовчуванням «Очікує на дзвінок»; оператор може змінити на «Проконсультовано»
- [ ] **CALL-03**: До заявки можна додати текстову нотатку (про зміст розмови)
- [ ] **CALL-04**: Оброблені заявки можна архівувати, щоб не займали основну таблицю

### Admin — navigation

- [ ] **ADM-NAV-01**: У sidebar badges: категорії та товари — загальна кількість; замовлення — кількість «висячих» (за узгодженим правилом); чати та дзвінки — лише невирішені (не архів/не закриті), не total

## Future Requirements (post–v2.0)

### Performance & SEO

- **PERF-01**: Core Web Vitals / Lighthouse targets на preview/prod
- **SEO-01**: Google Search Console, sitemap submit
- **SEO-02**: Custom domain на Vercel

### Engagement

- **REV-01**: Відгуки на товари (модерація)
- **REV-02**: Рейтинг на картці / PDP

### Tech debt

- **CAT-WIP-01**: Merge `git stash@{0}` (catalog pagination WIP)
- **DEBT-01**: `e2e/cart-auth.spec.ts` vs guest checkout
- **DEBT-02**: `prisma/seed.test.ts` out-of-stock count

## Out of Scope

| Feature | Reason |
|---------|--------|
| Відгуки (REV) | Окремий engagement milestone |
| PERF / SEO | Свідомо відкладено після v2.0 polish |
| Онлайн-оплата, доставка за межі Львова | Бізнес-модель |
| Показ quantity на вітрині | Admin-only by design |

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| NAV-01 | Phase 28 | Complete |
| HOME-04 | Phase 28 | Complete |
| HOME-05 | Phase 28 | Complete |
| CAT-02 | Phase 28 | Complete |
| CARD-01 | Phase 29 | Complete |
| PDP-05 | Phase 29 | Complete |
| PDP-06 | Phase 29 | Complete |
| PDP-07 | Phase 30 | Complete |
| FOOT-05 | Phase 30 | Complete |
| ORD-05 | Phase 31 | Complete |
| BUG-24 | Phase 31 | Complete |
| ADM-DASH-03 | Phase 32 | Complete |
| ADM-DASH-04 | Phase 32 | Complete |
| ADM-CAT-05 | Phase 33 | Pending |
| ADM-CAT-06 | Phase 33 | Complete |
| AN-01 | Phase 34 | Pending |
| AN-02 | Phase 34 | Pending |
| CALL-01 | Phase 35 | Pending |
| CALL-02 | Phase 35 | Pending |
| CALL-03 | Phase 35 | Pending |
| CALL-04 | Phase 35 | Pending |
| ADM-NAV-01 | Phase 36 | Pending |

**Coverage:**

- v2.0 requirements: 21 total
- Mapped to phases: 21
- Unmapped: 0 ✓

---
*Requirements defined: 2026-05-20*
*Last updated: 2026-05-20 after milestone v2.0 roadmap*
