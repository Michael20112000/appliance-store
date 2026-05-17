# Requirements: Appliance Store Lviv

**Defined:** 2026-05-17 (milestone v1.1)
**Core Value:** Покупець швидко знаходить б/у техніку у Львові, оформлює замовлення і за потреби пише магазину в чат.

## v1.1 Requirements

### Bug Fixes

- [x] **FIX-01**: Кнопка «Чернетки» на `/admin` веде на `/admin/tovary?status=DRAFT` (не без query)

### Catalog

- [x] **CAT-01**: Користувач обирає діапазон ціни через shadcn Slider (від/до, ₴) на `/katalog` і `/katalog/[slug]`
- [x] **CAT-02**: Фільтр ціни коректно відсікає товари поза діапазоном (серверна фільтрація + URL sync)
- [x] **CAT-03**: Список брендів у фільтрі залежить від контексту: на категорії — лише бренди цієї категорії; на загальному каталозі — бренди всіх доступних товарів

### Admin UX

- [x] **ADM-01**: Адмін-оболонка використовує shadcn Sidebar (навігація, mobile collapse)
- [x] **ADM-02**: Таблиця замовлень — shadcn Data Table з пагінацією та вибором кількості рядків на сторінці
- [x] **ADM-03**: У таблиці `/admin/kategorii` прибрано колонку Slug

### Chat Management

- [x] **CHAT-05**: Адмін може архівувати діалог (прихований з активного inbox, історія збережена)
- [x] **CHAT-06**: Адмін може остаточно видалити діалог після підтвердження (повідомлення видаляються каскадно)

### Wishlist

- [x] **WISH-01**: Гість додає/прибирає товари в обране (localStorage, окремий ключ)
- [x] **WISH-02**: Залогінений користувач керує обраним у БД (додати/прибрати)
- [x] **WISH-03**: При вході обране гостя **зливається** в БД wishlist користувача (merge gate)
- [x] **WISH-04**: Користувач переглядає список обраного (кабінет або `/obrane`)
- [x] **WISH-05**: Кнопка «В обране» на картці каталогу та на PDP

### Homepage Categories

- [x] **HOME-01**: Картки категорій на головній показують зображення категорії
- [x] **HOME-02**: Адмін завантажує/змінює зображення категорії через існуючий signed Cloudinary flow

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
| Wishlist without merge | Superseded — merge on login shipped phase 9 |
| Нова адмінка (звіти, експорт) | Не в scope |
| Онлайн-оплата | v1+ product |
| Доставка за межі Львова | v1 boundary |

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| FIX-01 | Phase 8 | Complete |
| CAT-01 | Phase 7 | Complete |
| CAT-02 | Phase 7 | Complete |
| CAT-03 | Phase 7 | Complete |
| ADM-01 | Phase 8 | Complete |
| ADM-02 | Phase 8 | Complete |
| ADM-03 | Phase 8 | Complete |
| CHAT-05 | Phase 8 | Complete |
| CHAT-06 | Phase 8 | Complete |
| WISH-01 | Phase 9 | Complete |
| WISH-02 | Phase 9 | Complete |
| WISH-03 | Phase 9 | Complete |
| WISH-04 | Phase 9 | Complete |
| WISH-05 | Phase 9 | Complete |
| HOME-01 | Phase 10 | Complete |
| HOME-02 | Phase 10 | Complete |

**Coverage:**
- v1.1 requirements: 16 total
- Mapped to phases: 16
- Unmapped: 0 ✓

---
*Requirements defined: 2026-05-17*
*Last updated: 2026-05-17 — Phase 9 complete*
