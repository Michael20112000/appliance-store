# Requirements: Appliance Store Lviv

**Defined:** 2026-05-19
**Milestone:** v1.3 Fixes & Admin UX
**Core Value:** Покупець швидко знаходить б/у техніку у Львові, оформлює замовлення і за потреби пише магазину в чат.

## v1.3 Requirements

### Admin — Chat

- [ ] **ADM-CHAT-02**: На `/admin/chaty` (desktop) контейнер inbox має фіксовану висоту viewport; список діалогів скролиться всередині лівої колонки; повідомлення треду — всередині правої колонки; сторінка адмінки не росте по висоті від кількості чатів/повідомлень

### Admin — Products

- [ ] **ADM-PRD-04**: Таблиця `/admin/tovary` має колонку з іконкою кошика (видалити); клік по delete не відкриває edit (`stopPropagation`); підтвердження та існуючі guardrails `deleteProduct` (кошик/активне замовлення) збережені

### Data & Empty States

- [ ] **DATA-01**: Оператор може повністю очистити бізнес-дані в PostgreSQL (товари, зображення, категорії, замовлення, чати, wishlist/cart lines тощо) одним документованим скриптом/командою; auth users (admin) за потреби залишаються або документовано що видаляється
- [ ] **DATA-02**: Storefront і адмінка коректно працюють з порожньою БД: без 500, зрозумілі empty states (головна, каталог, кошик, адмін-списки, dashboard stats)

## v2 Requirements

Deferred beyond v1.3.

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
| Buyer mobile FAB chat scroll rework | v1.3 — admin `/admin/chaty` layout only (per operator) |
| Відгуки | v2 |
| CWV / Lighthouse milestone | v2 |
| SEO / custom domain | v2 |
| Онлайн-оплата, доставка за межі Львова | Product boundary |
| Cloudinary asset purge | Optional; out of scope unless operator requests |

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| ADM-CHAT-02 | Phase 17 | Pending |
| ADM-PRD-04 | Phase 18 | Pending |
| DATA-01 | Phase 19 | Pending |
| DATA-02 | Phase 19 | Pending |
