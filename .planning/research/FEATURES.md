# Feature Research

**Domain:** Used-appliance single-store e-commerce (Lviv, Ukraine)
**Researched:** 2026-05-16
**Confidence:** HIGH (catalog/checkout/admin aligned with PROJECT.md + verified UA competitors; MEDIUM for legal copy specifics)

## Feature Landscape

### Table Stakes (Users Expect These)

Features users assume exist. Missing these = product feels incomplete or untrustworthy for б/у великої техніки.

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| Каталог з категоріями | Усі конкуренти (Tehnoskarb, OBYAVA, Vencon) групують за типом техніки | LOW | 8 seed-категорій + admin CRUD; breadcrumbs |
| Картка товару (PDP) | Рішення купувати приймають на сторінці одиниці | LOW | Фото, бренд, модель, ціна, **стан**, опис, наявність |
| Кілька фото на товар | Б/у — потрібно бачити подряпини, фасад, комплектацію | MEDIUM | Cloudinary gallery; мінімум 2–4 фото для великої техніки |
| Позначка стану (condition) | На OBYAVA/оголошеннях — «б/у», «відмінний стан»; на refurbished — grades A/B/C | LOW | Enum + пояснення шкали в UI (не лише «б/у») |
| Ціна в гривнях, чітко | Без ціни — не магазин | LOW | Форматування UAH; без «договірна» на v1 |
| Наявність / «в наявності» | Б/у часто 1 одиниця; покупець боїться «продали» | LOW | `in_stock` / sold flag; прибирати з каталогу або «продано» |
| Пошук + фільтри | PROJECT + OBYAVA: категорія, бренд, ціна, стан | MEDIUM | Facets: category, brand, price range, condition; URL-sync (nuqs) |
| Сортування списку | Tehnoskarb: за ціною ↑↓, популярністю | LOW | Price asc/desc; «нові» / дата додавання |
| Кошик | Стандарт e-commerce | MEDIUM | Auth required per PROJECT; persist per user |
| Checkout без онлайн-оплати | Типово для UA локальних магазинів: готівка/термінал при отриманні | MEDIUM | Ім’я, телефон, спосіб доставки, коментар; статус замовлення |
| Самовивіз + доставка по Львову | Локальний бізнес; PROJECT out of scope — за межі міста | LOW | Enum: pickup / delivery; адреса доставки умовно |
| Підтвердження замовлення | Покупець має бачити, що заявку прийнято | LOW | Success screen + номер замовлення; email — v1.x |
| Контакти магазину | Довіра + «Комфорт Техніка» — телефон, графік | LOW | Footer/header: телефон, адреса, години роботи |
| Мобільна версія | Більшість трафіку — телефон | MEDIUM | Responsive; великі touch-targets для фільтрів |
| Українська мова UI | Аудиторія Львів | LOW | `uk` only; copy для стану/доставки/оплати |
| Адмін: CRUD товарів | Один магазин оновлює асортимент | MEDIUM | Фото, бренд, ціна, стан, категорія, опис |
| Адмін: CRUD категорій | PROJECT requirement | LOW | Create/edit/delete; slug для URL |
| Адмін: замовлення | Магазин виконує замовлення | MEDIUM | Список, статуси (нове → підтверджено → виконано/скасовано) |
| Адмін: чати з клієнтами | PROJECT + high-consideration used goods | HIGH | Inbox, прив’язка до user/order context |
| Авторизація для кошика/чату | PROJECT: каталог без логіну | MEDIUM | Better Auth; guest browse OK |
| Базові юридичні сторінки | Закон про захист прав споживачів — дистанційний договір, контакти продавця | LOW | Оферта, політика повернення (б/у — обмеження), privacy |
| SEO-сторінки товарів/категорій | PROJECT: «хороший продукт = SEO» | MEDIUM | SSR/SSG, title/description, Product schema, local Lviv copy |
| Швидке завантаження каталогу | UX table stakes 2024+ | MEDIUM | Image optimization, pagination, indexed filters |

**Used-appliance-specific table stakes** (не generic shop):

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| Бренд + модель у назві/картці | Пошук «Samsung пральна» — стандарт оголошень | LOW | Admin fields; search index |
| Короткі характеристики | Об’єм барабана, No Frost, розміри — для вбудовування | MEDIUM | JSON specs або fixed fields per category — v1 може бути в описі |
| Гарантія / перевірка (якщо є) | OBYAVA: «гарантія 6 місяців», «перевірена майстром» | LOW | Optional text field + badge; не вигадувати — лише те, що дає магазин |
| Прозорість дефектів | Refurbished industry: grades + photos of damage | LOW–MED | Condition + фото подряпин; знижує суперечки |

### Differentiators (Competitive Advantage)

Not required to launch, but aligned with **Core Value** (швидкий пошук + реальний стан + чат без тертя).

| Feature | Value Proposition | Complexity | Notes |
|---------|-------------------|------------|-------|
| Легкий, «повітряний» UI | Відрізняє від важких маркетплейсів і оголошень | MEDIUM | Design tokens, whitespace, shadcn — trust for used |
| Real-time чат під час перегляду | Закриває питання «чи є доставка?», «чи працює?» до checkout | HIGH | Pusher/Ably; не лише після замовлення |
| Чітка шкала стану з легендою | Менше повернень vs vague «б/у» | LOW | A/B/C або «відмінний/добрий/задовільний» + tooltip |
| Швидкі фільтри без перезавантаження | Краще за OBYAVA UX | MEDIUM | Client + server filters; debounced URL |
| Локальний SEO «б/у техніка Львів» | Органіка vs платні оголошення | MEDIUM | Category H1, area pages, LocalBusiness schema |
| Історія замовлень (кабінет) | Повторні покупці | LOW | Після auth — список + статус |
| Прив’язка чату до товару/замовлення | Менеджер бачить контекст | MEDIUM | Admin sees product link in thread |
| Оптимізовані фото (WebP, sizes) | Швидкість = SEO + UX | LOW | Cloudinary transforms |

### Anti-Features (Commonly Requested, Often Problematic)

| Feature | Why Requested | Why Problematic | Alternative |
|---------|---------------|-----------------|-------------|
| Онлайн-оплата (LiqPay/Stripe) v1 | Зручність | Scope, chargebacks на б/у, інтеграція | «Оплата при отриманні» + статус замовлення |
| Маркетплейс (багато продавців) | Масштаб | Не бізнес-модель | Single admin, один асортимент |
| Розстрочка Monobank/Приват v1 | Tehnoskarb показує badges | Окремі договори, API, compliance | Телефон менеджера / «уточніть в чаті» |
| Відгуки та рейтинги v1 | Довіра | Немає об’єму; фейки | Гарантія магазину + чат + фото стану |
| Порівняння товарів (compare) | Електроніка | Overkill для малого каталогу | Фільтри + wishlist later |
| Доставка Нова Пошта по Україні v1 | Охоплення | Логістика великої техніки | Львів pickup + local delivery only |
| AI ціноутворення | «Ринкова ціна» | Помилки, відповідальність | Ручна ціна в адмінці |
| Native mobile app | Охоплення | Подвійна підтримка | PWA-ready responsive web |
| Guest checkout без телефону | Швидше | Неможливо передзвонити/доставити | Телефон обов’язковий на checkout |
| Нова техніка в каталозі | Більший TAM | Розмиває позиціонування | Тільки б/у; окремий проект якщо треба |
| Багатомовність | Туризм | Scope | UA only v1 |
| Аукціон / торг | «Дешевше» | Не магазин | Фіксована ціна |
| Trade-in онлайн | Залучення | Оцінка, логістика | «Привезіть в магазин» — офлайн |
| Real-time everything (live stock sync) | Актуальність | Over-engineering для 1 магазину | Admin mark sold + cache revalidate |
| Чат без auth | Менше тертя | Спам, немає історії | Auth для чату (PROJECT) |
| Складний CRM в v1 | Продажі | Відволікає від каталогу | Admin orders + chat достатньо |

## Feature Dependencies

```
Public Catalog
    └──requires──> Categories (seed + admin)
    └──requires──> Products (admin CRUD)
                       └──enhances──> Cloudinary images

Search & Filters
    └──requires──> Products + Categories (indexed fields)
    └──enhances──> Catalog listing UX

Product Detail (PDP)
    └──requires──> Product record + images + condition

Auth (Better Auth)
    └──requires──> User model
    └──gates──> Cart
    └──gates──> Chat (buyer)
    └──gates──> Order history (buyer)

Cart
    └──requires──> Auth (buyer)
    └──requires──> Products in_stock

Checkout
    └──requires──> Cart (non-empty)
    └──creates──> Order
    └──requires──> Delivery method (pickup | Lviv delivery)

Orders (admin)
    └──requires──> Checkout
    └──enhanced by──> Chat (context)

Chat (realtime)
    └──requires──> Auth (buyer + admin role)
    └──requires──> Realtime transport (research in STACK)
    └──enhances──> PDP, Checkout (pre-sale questions)

Admin CRUD
    └──requires──> Auth (admin role)
    └──requires──> Categories before product assign

SEO / Structured data
    └──requires──> Public PDP + category routes
    └──conflicts with──> Heavy client-only catalog (bad for crawl)
```

### Dependency Notes

- **Filters require catalog schema:** brand, price, condition, categoryId must be queryable with DB indexes before filter UI ships.
- **Cart requires auth:** Browse-without-login means cart is post-login — expect «login to add to cart» UX, not silent guest cart.
- **Chat enhances conversion on used goods:** High-consideration purchases; thread should optionally reference `productId` or `orderId`.
- **Checkout without payment gateway:** Order is the source of truth; payment method = offline enum (cash/terminal on delivery) — no PaymentIntent flow v1.
- **Sold items:** Marking `sold` or `in_stock=false` must hide from catalog filters and invalidate cart lines — dependency between admin and cart.

## MVP Definition

**Note:** Stakeholder defined MVP = **full feature set in one release** (not stripped catalog-only). Below maps to PROJECT.md Active requirements; ordering is for **roadmap phases**, not scope cut.

### Launch With (v1)

Minimum to match stated MVP — all P1:

- [ ] **Каталог** — 8 категорій, listing, PDP, pagination
- [ ] **Пошук і фільтри** — category, brand, price range, condition + sort
- [ ] **Кошик + checkout** — без онлайн-оплати; pickup + Lviv delivery; phone required
- [ ] **Опційна auth** — каталог публічний; login для cart/chat
- [ ] **Realtime чат** — покупець ↔ менеджер; admin inbox
- [ ] **Адмінка** — CRUD categories/products; orders list + status; chats
- [ ] **UI/UX/SEO baseline** — UA, mobile, legal pages, Product meta, performance budget

### Add After Validation (v1.x)

- [ ] Email/SMS on new order (admin + buyer) — when manual phone calls become bottleneck
- [ ] Order notes timeline in admin — when dispute rate grows
- [ ] Wishlist — repeat visitors without commitment
- [ ] Spec templates per category — when descriptions inconsistent
- [ ] Basic analytics (Plausible/PostHog) — when marketing starts

### Future Consideration (v2+)

- [ ] Online payment (LiqPay / Monobank pay)
- [ ] Installment badges / bank APIs
- [ ] Delivery outside Lviv (NP / own logistics)
- [ ] Reviews / verified purchase
- [ ] Promotions / discount codes
- [ ] Multi-store / franchise (explicitly out of scope now)
- [ ] EN/RU locale

## Feature Prioritization Matrix

| Feature | User Value | Implementation Cost | Priority |
|---------|------------|---------------------|----------|
| Catalog + categories | HIGH | MEDIUM | P1 |
| PDP (photos, condition, price) | HIGH | LOW | P1 |
| Search/filters/sort | HIGH | MEDIUM | P1 |
| Cart + checkout (offline pay) | HIGH | MEDIUM | P1 |
| Delivery pickup + Lviv | HIGH | LOW | P1 |
| Admin products/categories | HIGH | MEDIUM | P1 |
| Admin orders | HIGH | MEDIUM | P1 |
| Auth (optional browse) | HIGH | MEDIUM | P1 |
| Realtime chat | HIGH | HIGH | P1 |
| Ukrainian UI + legal pages | HIGH | LOW | P1 |
| SEO (meta, schema, speed) | HIGH | MEDIUM | P1 |
| Condition grade legend | MEDIUM | LOW | P1 |
| Order email notifications | MEDIUM | LOW | P2 |
| Wishlist | LOW | LOW | P3 |
| Reviews | MEDIUM | MEDIUM | P3 |
| Online payment | HIGH | HIGH | v2 |
| NP Ukraine delivery | MEDIUM | HIGH | v2 |

**Priority key:** P1 = v1 launch per PROJECT; P2 = soon after traffic; P3 = defer.

## Competitor Feature Analysis

| Feature | Tehnoskarb (b/у UA) | OBYAVA (classifieds) | Komfort Tekhnika (Lviv shop) | Our Approach |
|---------|----------------------|------------------------|------------------------------|--------------|
| Catalog by category | ✓ filters, city | ✓ deep categories | ✓ SEO catalog pages | ✓ 8 cats + admin CRUD |
| Condition filter | Partial (marketplace) | ✓ «б/у» / state in text | «Відновлена» positioning | ✓ Dedicated condition enum + legend |
| Price sort | ✓ | ✓ | — | ✓ |
| Installment badges | ✓ Monobank/Privat | — | «Гнучка оплата» | ✗ v1 — anti-feature |
| Cart/checkout | Marketplace flow | Contact seller | Online + visit store | ✓ Full cart; offline pay |
| Chat | — | Messenger off-site | Phone callback | ✓ In-app realtime |
| Single seller | Multi-seller platform | Multi-seller | ✓ Single store | ✓ Single store |
| Warranty in listing | Varies | Often in description | ✓ Stated on site | Optional field + badge |
| Delivery | City filter | Self-arranged | Lviv store + delivery | ✓ Pickup + Lviv only |
| Reviews | — | — | Mentioned in copy | ✗ v1 |
| Airy modern UI | Utilitarian | Ad-heavy | Traditional | ✓ Differentiator |

## Sources

- [PROJECT.md](../PROJECT.md) — scope, constraints, active requirements (HIGH)
- [Tehnoskarb — побутова техніка Львів](https://tehnoskarb.ua/bytovaja-tekhnika/c141/filter/city=8) — filters, sort, installment (HIGH)
- [OBYAVA.ua — велика побутова техніка Львів](https://obyava.ua/ua/elektronika/krupnaja-bytovaja-tehnika/lvov) — category/brand/used filters (HIGH)
- [Komfort Tekhnika Lviv](https://komfort-tekhnika.com.ua/pobutova-tekhnika.php?lang=1) — local shop, consultation, delivery copy (MEDIUM)
- [Appliances Direct — refurbished grades](https://appliancesdirect.co.uk/help-and-advice/buying-guides/refurbished-grades-explained) — A1/A2/A3 condition pattern (HIGH)
- [Inflow — category page best practices](https://www.goinflow.com/blog/gallery-pages-best-in-class/) — filters, sort, mobile (MEDIUM)
- [Zakon.rada.gov.ua — consumer protection 1023-XII](https://zakon.rada.gov.ua/laws/show/1023-12?lang=en) — distance selling, returns framework (MEDIUM)
- [LIGA:ZAKON — internet store returns](https://ips.ligazakon.net/document/BZ012335) — 14-day return context (MEDIUM; legal review before copy)

---
*Feature research for: Appliance Store Lviv (used appliances, single-store)*
*Researched: 2026-05-16*
