# Requirements: Appliance Store Lviv

**Defined:** 2026-05-17 (milestone v1.1)
**Core Value:** Покупець швидко знаходить б/у техніку у Львові, оформлює замовлення і за потреби пише магазину в чат.

## v1.1 Requirements

### Bug Fixes

- [ ] **FIX-01**: Кнопка «Чернетки» на `/admin` веде на `/admin/tovary?status=DRAFT` (не без query)

### Catalog

- [x] **CAT-01**: Користувач обирає діапазон ціни через shadcn Slider (від/до, ₴) на `/katalog` і `/katalog/[slug]`
- [x] **CAT-02**: Фільтр ціни коректно відсікає товари поза діапазоном (серверна фільтрація + URL sync)
- [x] **CAT-03**: Список брендів у фільтрі залежить від контексту: на категорії — лише бренди цієї категорії; на загальному каталозі — бренди всіх доступних товарів

### Admin UX

- [ ] **ADM-01**: Адмін-оболонка використовує shadcn Sidebar (навігація, mobile collapse)
- [ ] **ADM-02**: Таблиця замовлень — shadcn Data Table з пагінацією та вибором кількості рядків на сторінці
- [x] **ADM-03**: У таблиці `/admin/kategorii` прибрано колонку Slug

### Chat Management

- [ ] **CHAT-05**: Адмін може архівувати діалог (прихований з активного inbox, історія збережена)
- [ ] **CHAT-06**: Адмін може остаточно видалити діалог після підтвердження (повідомлення видаляються каскадно)

### Wishlist

- [ ] **WISH-01**: Гість додає/прибирає товари в обране (localStorage, окремий ключ)
- [ ] **WISH-02**: Залогінений користувач керує обраним у БД (додати/прибрати)
- [ ] **WISH-03**: При вході обране гостя **не** зливається з обраним користувача
- [ ] **WISH-04**: Користувач переглядає список обраного (кабінет або `/obrane`)
- [ ] **WISH-05**: Кнопка «В обране» на картці каталогу та на PDP

### Homepage Categories

- [ ] **HOME-01**: Картки категорій на головній показують зображення категорії
- [ ] **HOME-02**: Адмін завантажує/змінює зображення категорії через існуючий signed Cloudinary flow

## v2 Requirements

Deferred beyond v1.1.

### Social

- **REV-01**: Користувач залишає відгук на товар
- **REV-02**: Відгук публікується лише після approve адміном

### Performance

- **PERF-01**: Core Web Vitals LCP ≤2.5s, CLS ≤0.1 на ключових сторінках

### Growth

- **SEO-01**: Google Search Console verification
- **SEO-02**: Custom production domain

## Out of Scope

| Feature | Reason |
|---------|--------|
| Відгуки v1.1 | Descoped під час планування milestone |
| CWV / Lighthouse milestone | Явно out of scope v1.1 |
| Wishlist merge on login | Протилежно вимозі користувача |
| Нова адмінка (звіти, експорт) | Не в scope |
| Онлайн-оплата | v1+ product |
| Доставка за межі Львова | v1 boundary |

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| FIX-01 | Phase 8 | Pending |
| CAT-01 | Phase 7 | Complete |
| CAT-02 | Phase 7 | Complete |
| CAT-03 | Phase 7 | Complete |
| ADM-01 | Phase 8 | Pending |
| ADM-02 | Phase 8 | Pending |
| ADM-03 | Phase 8 | Complete |
| CHAT-05 | Phase 8 | Pending |
| CHAT-06 | Phase 8 | Pending |
| WISH-01 | Phase 9 | Pending |
| WISH-02 | Phase 9 | Pending |
| WISH-03 | Phase 9 | Pending |
| WISH-04 | Phase 9 | Pending |
| WISH-05 | Phase 9 | Pending |
| HOME-01 | Phase 10 | Pending |
| HOME-02 | Phase 10 | Pending |

**Coverage:**
- v1.1 requirements: 16 total
- Mapped to phases: 16
- Unmapped: 0 ✓

---
*Requirements defined: 2026-05-17*
*Last updated: 2026-05-17 after milestone v1.1 roadmap*
