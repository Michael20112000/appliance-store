# Requirements: Appliance Store Lviv

**Defined:** 2026-05-18
**Milestone:** v1.2 Polish & UX
**Core Value:** Покупець швидко знаходить б/у техніку у Львові, оформлює замовлення і за потреби пише магазину в чат.

## v1.2 Requirements

### Admin — Orders

- [x] **ADM-ORD-01**: Адмін відкриває замовлення кліком по рядку таблиці `/admin/zamovlennia` (колонка «Відкрити» прибрана)
- [x] **ADM-ORD-02**: Адмін змінює статус замовлення з таблиці — клік по бейджу відкриває shadcn Select або DropdownMenu з дозволеними переходами

### Admin — Categories

- [x] **ADM-CAT-01**: Кнопка «Додати категорію» має іконку Plus (lucide)
- [x] **ADM-CAT-02**: Адмін відкриває редагування категорії кліком по рядку (кнопка «Редагувати» прибрана)

### Admin — Products

- [x] **ADM-PRD-01**: Кнопка «Додати товар» має іконку Plus
- [x] **ADM-PRD-02**: Таблиця `/admin/tovary` підтримує сортування по колонках (як orders Data Table)
- [ ] **ADM-PRD-03**: Адмін вказує кількість одиниць товару при створенні/редагуванні; залишок видно в адмінці (список і/або форма), на storefront не показується

### Admin — Chat

- [ ] **ADM-CHAT-01**: ПКМ по чату в списку `/admin/chaty` відкриває context menu: архівувати / розархівувати / видалити (той самий набір, що ⋮ у відкритому треді)

### Storefront — Catalog

- [ ] **CAT-04**: Категорії без доступних товарів не показуються на головній, в навігації та сайдбарі каталогу
- [ ] **CAT-05**: Лічильник товарів у сайдбарі каталогу відображається як shadcn Badge (не plain text «— N»)
- [ ] **CAT-06**: Сітка `/katalog` (і category pages) пагінована: 16 карток на сторінку, пагінація в стилі `/admin/tovary` (`AdminListPagination`)

### UX / Design System

- [ ] **UX-01**: Усі storefront і admin `<select>` замінені на shadcn `Select` (мінімум: `catalog-toolbar`, `catalog-filters`, `product-form`)
- [x] **UX-02**: Клікабельні рядки таблиць і списків мають `cursor-pointer` і keyboard access де доречно

### Polish (verify)

- [ ] **POL-01**: PDP gallery (Carousel + Dialog lightbox) коректно на mobile та з кількома фото
- [ ] **POL-02**: Slug товару/категорії генерується автоматично при create; ручне поле slug відсутнє в create UI

## v2 Requirements

Deferred beyond v1.2.

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
| Відгуки v1.2 | v2 |
| CWV / Lighthouse milestone | v2 (PERF-01) |
| SEO / custom domain | v2 |
| Stock quantity on PDP/catalog cards | v1.2 admin-only (ADM-PRD-03) |
| Онлайн-оплата, доставка за межі Львова | Product boundary |
| Нова адмін-аналітика / експорт | Не в scope |

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| ADM-ORD-01 | Phase 11 | Complete |
| ADM-CAT-01 | Phase 11 | Complete |
| ADM-CAT-02 | Phase 11 | Complete |
| ADM-PRD-01 | Phase 11 | Complete |
| UX-02 | Phase 11 | Complete |
| ADM-ORD-02 | Phase 12 | Complete |
| ADM-PRD-02 | Phase 12 | Complete |
| ADM-PRD-03 | Phase 13 | Pending |
| ADM-CHAT-01 | Phase 14 | Pending |
| CAT-04 | Phase 15 | Pending |
| CAT-05 | Phase 15 | Pending |
| CAT-06 | Phase 15 | Pending |
| UX-01 | Phase 16 | Pending |
| POL-01 | Phase 16 | Pending |
| POL-02 | Phase 16 | Pending |

**Coverage:**

- v1.2 requirements: 15 total
- Mapped to phases: 15
- Unmapped: 0 ✓

---
*Requirements defined: 2026-05-18*
*Last updated: 2026-05-18 after roadmap creation*
