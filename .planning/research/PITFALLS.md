# Pitfalls Research

**Domain:** Single-store used-appliance e-commerce (Львів), Next.js App Router + Prisma + PostgreSQL + Cloudinary + Better Auth + realtime chat  
**Researched:** 2026-05-16  
**Confidence:** HIGH (stack/docs), MEDIUM (local SEO competitive patterns, used-goods ops)

## Critical Pitfalls

### Pitfall 1: Double-sale of unique used units (race on checkout)

**What goes wrong:**  
Two buyers complete checkout for the same one-of-a-kind washing machine. Staff cannot substitute “something comparable” — used appliances are unique SKUs with quantity 1. Support calls, refunds, and reputation damage follow.

**Why it happens:**  
Developers treat inventory like standard e-commerce (qty > 1) or copy “pending payment hold stock” patterns from payment gateways. v1 has **no online payment**, so there is no payment webhook to finalize availability. Cart + “submit order” without a DB-level lock allows concurrent orders.

**How to avoid:**
- Model products with explicit lifecycle: `available` → `reserved` (optional, short TTL) → `sold`.
- On order submit, use a **transaction** that updates product status only if still `available` (`UPDATE ... WHERE status = 'available'`); fail checkout if 0 rows updated.
- Do **not** copy WooCommerce “hold stock for pending payment” — there is no payment completion event on v1.
- Admin marks order `confirmed` / `cancelled`; cancelling releases `reserved` back to `available`.
- Surface “продано” immediately on PDP and remove from catalog queries / sitemap.

**Warning signs:**
- Cart allows add-to-cart after another user submitted order (no status check).
- Orders created without atomic product status change.
- “Sold” items still appear in Google Search Console indexed URLs.

**Phase to address:** Checkout + catalog (early), admin order workflow

---

### Pitfall 2: Admin secured only by middleware or session cookie presence

**What goes wrong:**  
Any logged-in customer can hit `/admin` API routes or pages. CRUD on products, orders, and all customer chats is exposed.

**Why it happens:**  
Better Auth docs recommend `getSessionCookie()` in middleware for **optimistic redirects only** — it checks cookie existence, not validity. Teams also check `session` in middleware but skip **role** (`admin` / `manager`) on server actions and Route Handlers. GitHub discussions on Better Auth show role checks in middleware are awkward; devs stop at “has session.”

**How to avoid:**
- **Defense in depth:** middleware/proxy for coarse redirect + **every** admin Server Action / Route Handler calls `auth.api.getSession({ headers })` and verifies role.
- Use Better Auth **admin plugin** or custom `role` field; never trust client-sent role flags.
- Separate admin layout that `redirect()`s when `!session || session.user.role !== 'admin'`.
- Cookie-only checks acceptable **only** for redirect to login, never for mutations.
- Install `nextCookies()` plugin if auth cookies are set from Server Actions.

**Warning signs:**
- Admin API routes have no `getSession` call.
- Tests pass because you’re always logged in as admin locally.
- Middleware comment says “THIS IS NOT SECURE” but admin mutations rely on it anyway.

**Phase to address:** Auth + admin foundation (before any admin CRUD ships)

---

### Pitfall 3: Catalog N+1 queries and unindexed filters

**What goes wrong:**  
Category pages and admin lists slow down (500ms–3s+). Under load, connection pool exhaustion. Filter combinations (category + brand + price + condition) cause full table scans.

**Why it happens:**  
- Looping `products.map(p => prisma.category.findUnique(...))` or separate image queries per product.
- `include` over-fetching all columns and relations on list views.
- Filters built as `contains` / unindexed `OR` chains without composite indexes.
- Offset pagination (`skip: 10000`) on growing catalog.
- Multiple `PrismaClient` instances in dev (HMR) or serverless handlers.

**How to avoid:**
- List queries: single `findMany` with selective `select`, `relationLoadStrategy: "join"` where appropriate (per [Prisma query optimization](https://www.prisma.io/docs/orm/prisma-client/queries/query-optimization-performance)).
- Never query per row in loops; use `include` or `where: { id: { in: [...] } }`.
- Add PostgreSQL indexes aligned to filters: `(categoryId, status)`, `(brand)`, `(price)`, `(condition)`, partial index `WHERE status = 'available'`.
- Cursor-based pagination for catalog; reserve offset for small admin tables only.
- Single shared `prisma` singleton (`lib/db.ts`); follow [Prisma + Next.js HMR guidance](https://www.prisma.io/docs/orm/more/troubleshooting/nextjs).
- Log/query-inspect in staging before MVP launch.

**Warning signs:**
- Prisma query log shows repeated similar `SELECT` with different IDs.
- EXPLAIN shows Seq Scan on `Product` for filtered catalog routes.
- TTFB grows linearly with product count.

**Phase to address:** Catalog + search/filters phase

---

### Pitfall 4: Local Lviv SEO built as “generic shop” without entity + used-product signals

**What goes wrong:**  
Site ranks for nothing locally; Google shows wrong snippets; sold/duplicate URLs dilute signals; rich results missing for products. Ukrainian queries (“б/у холодильник Львів”) don’t match titles/meta.

**Why it happens:**  
- Only generic `<title>` / description, no `LocalBusiness` with `geo`, `areaServed`, `addressLocality: "Львів"`.
- Product JSON-LD missing `Offer` + `itemCondition: UsedCondition` (Google expects condition for used goods).
- Filter query URLs (`?brand=...&minPrice=...`) indexed as thin duplicates.
- Sold items remain in `sitemap.xml` and return 200 with “available” content.
- JSON-LD rendered in Client Components → duplicate tags on hydration (known Next.js pitfall).
- Adding `next-intl` / hreflang for a **single-language** site — unnecessary complexity and broken alternates.

**How to avoid:**
- Root layout: `lang="uk"`, Ukrainian `metadata` (title template, description, `openGraph.locale: uk_UA`).
- Server Component JSON-LD per [Next.js JSON-LD guide](https://nextjs.org/docs/app/guides/json-ld) with XSS-safe `JSON.stringify(...).replace(/</g, '\u003c')`.
- `LocalBusiness` + `WebSite` on home/contact; `Product` + `Offer` + `itemCondition` on PDP.
- Dynamic `sitemap.ts` / `robots.ts` — only `available` products; `disallow: /admin`, filter params if needed.
- Canonical URLs on PDP; `noindex` on pure filter permutations or use canonical to base category.
- Align NAP (name, address, phone) with Google Business Profile.
- **Do not** add hreflang variants for v1 (Ukrainian only per PROJECT.md).

**Warning signs:**
- Search Console: duplicate titles, soft 404s on sold items, crawl budget on filter URLs.
- Rich Results Test warnings on `itemCondition` or missing `offers`.
- English UI strings in metadata.

**Phase to address:** Public catalog + PDP (parallel with first content), verify before launch

---

### Pitfall 5: Cloudinary unsigned uploads from admin + orphaned images

**What goes wrong:**  
Quota abuse via exposed upload preset; storage fills with images never linked to products; deleting product leaves Cloudinary orphans (cost + clutter); wrong transformations served (huge originals, poor LCP).

**Why it happens:**  
Tutorials use **unsigned** browser uploads for speed. Admin uploads go direct from browser with preset visible in source. Product save fails after upload → `public_id` never stored in DB.

**How to avoid:**
- **Signed uploads** or server-side upload via Route Handler with API secret (never in client). Cloudinary recommends signed uploads over unsigned for production ([Cloudinary authentication signatures](https://cloudinary.com/documentation/authentication_signatures)).
- Upload only after admin session + role verified; optional upload preset restricted by folder `appliance-store/{productId}/`.
- Store `cloudinaryPublicId` in Prisma; on product delete, call destroy API.
- Use named transformations (`f_auto,q_auto,w_800`) for catalog cards; `next/image` with Cloudinary loader.
- Two-phase admin flow: create draft product → upload → attach; or upload with `tags: ['pending']` + scheduled cleanup job for untagged assets.

**Warning signs:**
- `CLOUDINARY_UPLOAD_PRESET` in `NEXT_PUBLIC_*` env.
- Media library in Cloudinary grows faster than product count.
- PDP LCP > 2.5s on mobile.

**Phase to address:** Admin product CRUD + media

---

### Pitfall 6: Realtime chat — connection sprawl and missing auth on channels

**What goes wrong:**  
Dev environment opens 20–250 WebSocket connections (HMR + per-component client init). Production hits provider connection limits or unexpected billing. Users subscribe to other customers’ channels.

**Why it happens:**  
Instantiating Pusher/Ably/supabase client inside components without a module singleton; Strict Mode double-mount; no channel authorization endpoint; treating “logged in” as sufficient without binding `channelId` to `userId`.

**How to avoid:**
- One realtime client module (singleton); subscribe in dedicated hook/provider.
- Server-issued channel auth token tied to `orderId` or `conversationId` + session user.
- Persist messages in PostgreSQL; realtime is transport, not source of truth.
- For single-store scale: acceptable to poll admin inbox every N seconds as fallback — don’t over-engineer fan-out.
- Rate-limit message POST endpoints.

**Warning signs:**
- Network tab shows new WebSocket on every navigation.
- Chat works in dev but provider dashboard shows connection spike.
- Changing URL param lets you read another thread.

**Phase to address:** Chat phase (after auth)

---

### Pitfall 7: Checkout UX copied from “online payment” flows

**What goes wrong:**  
Orders stuck in `pending_payment` forever; staff confused by payment states; customers think card was charged. Inventory locked with no release rule.

**Why it happens:**  
Default e-commerce templates assume Stripe/LiqPay webhooks. v1 is **cash on pickup / pay later** — payment state machine doesn’t apply.

**How to avoid:**
- Order states: `new` → `confirmed` → `completed` / `cancelled` (no `pending_payment`).
- Clear copy: “Оплата при отриманні” / “Менеджер передзвонить”.
- Email/Telegram notification to store on `new` order (optional v1).
- Don’t block catalog with “payment processing” spinners.

**Warning signs:**
- Order model has `paymentStatus` with no integration behind it.
- Admin filter defaults to “awaiting payment.”

**Phase to address:** Checkout phase

---

## Technical Debt Patterns

| Shortcut | Immediate Benefit | Long-term Cost | When Acceptable |
|----------|-------------------|----------------|-----------------|
| Cookie-only middleware auth redirect | Fast to ship | Admin/data leak if handlers skip role check | Never for mutations; redirect only |
| Client-side catalog filtering | Simple code | Breaks at ~200+ products, bad SEO | Never for public catalog |
| Unsigned Cloudinary preset | Quick admin uploads | Quota abuse, orphans | Never in production |
| `pending_payment` order status | Familiar e-commerce model | Stuck orders, wrong inventory rules | Never on v1 |
| Realtime without DB persistence | Faster chat MVP | Lost messages, no admin audit trail | Never |
| Offset pagination everywhere | Easy page numbers | Slow deep pages | Admin lists only, small data |
| Skip `itemCondition` in schema | Less JSON-LD code | Weak used-product SERP | Never for this domain |

## Integration Gotchas

| Integration | Common Mistake | Correct Approach |
|-------------|----------------|------------------|
| **Better Auth** | Trust `getSessionCookie()` for admin | `auth.api.getSession` + role on every protected handler |
| **Better Auth** | Forget `nextCookies()` in Server Actions | Add plugin; cookies set on sign-in actions |
| **Cloudinary** | Public unsigned preset in admin UI | Server-signed upload or server proxy upload |
| **Cloudinary** | Store full URL only | Store `public_id`; build transforms in code |
| **Prisma** | New client per request handler | Singleton + adapter for serverless if needed |
| **Realtime** | Client created in `useEffect` per page | Module singleton + authorize channel server-side |
| **Next.js SEO** | JSON-LD in client component | Server Component script tag; sanitize `<` |
| **PostgreSQL** | `slug` without unique constraint | Unique index; Ukrainian slug normalization rules |

## Performance Traps

| Trap | Symptoms | Prevention | When It Breaks |
|------|----------|------------|----------------|
| N+1 on product lists | Many similar SQL queries | `include` / `in` / `relationLoadStrategy: "join"` | ~50+ products on a page |
| Unindexed filters | Slow catalog as inventory grows | Composite indexes on filter columns + `status` | ~100+ SKUs |
| Deep offset pagination | Page 50+ slow | Cursor pagination | ~500+ SKUs |
| Unoptimized Cloudinary images | Poor LCP, large bytes | `f_auto,q_auto`, responsive widths | Always on mobile |
| Chat connection leak | Provider connection count high | Singleton client | Dev HMR; multiple tabs |
| No ISR/cache on catalog | High DB load on traffic spike | `revalidate` on product change | Marketing push / ads |

## Security Mistakes

| Mistake | Risk | Prevention |
|---------|------|------------|
| Admin APIs without role check | Full data breach | Session + role on every mutation |
| Chat channel = guessable UUID only | Read others’ messages | Auth + membership check on subscribe |
| Mass assignment on product/order update | Price/status tampering | Zod allowlists per action |
| Admin on same domain without hardening | XSS → account takeover | CSP, httpOnly cookies, separate admin audit log |
| Exposing Cloudinary API secret in client | Account takeover, deletes | Secret only server-side |
| IDOR on order details (`/orders/[id]`) | Privacy leak | Verify `order.userId === session.user.id` |

## UX Pitfalls

| Pitfall | User Impact | Better Approach |
|---------|-------------|-----------------|
| Condition filter without plain-language labels | “Що таке B-grade?” | Ukrainian labels: “Відмінний”, “Добрий”, “Задовільний” + short hint |
| Hidden delivery rules | Cart surprise at checkout | Show “Самовивіз / Доставка по Львову” on PDP and cart |
| Login wall before browse | Bounce from Google | Catalog public; auth for cart/chat only (per PROJECT.md) |
| Sold item still in search results | Frustration, trust loss | Immediate “Продано” badge + 404 or redirect |
| Chat promised “realtime” but 30s lag | Feels broken | Set expectation; show delivery indicator |
| English microcopy in forms | Wrong audience | `uk-UA` copy everywhere; `Intl` for dates/UAH |

## "Looks Done But Isn't" Checklist

- [ ] **Local SEO:** `LocalBusiness` has `geo`, `addressLocality`, `areaServed` (Львів) — verify Rich Results Test
- [ ] **Used products:** JSON-LD `itemCondition: UsedCondition` on every PDP — verify Merchant/Search docs
- [ ] **Sitemap:** Sold/unavailable SKUs excluded — verify `sitemap.xml` vs DB
- [ ] **Admin:** Non-admin user gets 403 on API, not just hidden nav link
- [ ] **Checkout:** Concurrent double order test fails for one SKU
- [ ] **Cloudinary:** No secret/preset in client bundle — verify build output
- [ ] **Chat:** Cannot open another user’s thread by ID tampering
- [ ] **Filters:** Catalog with 100+ items < 300ms TTFB on staging
- [ ] **Ukrainian:** `<html lang="uk">`, metadata Ukrainian, UAH formatting
- [ ] **Cart:** No “payment processing” UI; order confirmation copy mentions offline payment

## Recovery Strategies

| Pitfall | Recovery Cost | Recovery Steps |
|---------|---------------|----------------|
| Double-sold SKU | HIGH (manual) | Contact buyers; mark sold; add DB transaction retroactively |
| Admin exposed | HIGH | Rotate secrets; audit access logs; add role checks; force re-login |
| SEO duplicate/sold URLs | MEDIUM | GSC removal; fix sitemap; 301 sold PDPs to category |
| Cloudinary quota abuse | MEDIUM | Rotate preset; enable signed uploads; delete orphan folder |
| N+1 / slow catalog | MEDIUM | Add indexes; rewrite queries; deploy |
| Chat connection/billing spike | LOW–MEDIUM | Singleton refactor; reduce channels |

## Pitfall-to-Phase Mapping

| Pitfall | Prevention Phase | Verification |
|---------|------------------|--------------|
| Double-sale unique units | Checkout + product status | Parallel order integration test; only one succeeds |
| Admin auth bypass | Auth + admin shell | E2E: customer session → 403 on admin API |
| N+1 / filter performance | Catalog + schema migration | Query log count; EXPLAIN on filter query |
| Local SEO / used schema | Public pages + metadata | Rich Results Test; Search Console |
| Cloudinary security/orphans | Admin media | Secret scan; orphan count ≈ product images |
| Chat auth + connections | Chat | Pen-test channel ID; provider dashboard connections |
| Offline checkout states | Checkout | No `pending_payment`; UA copy review |

## Sources

- [Prisma — Query optimization performance](https://www.prisma.io/docs/orm/prisma-client/queries/query-optimization-performance) — HIGH
- [Better Auth — Next.js integration](https://www.better-auth.com/docs/integrations/next) — HIGH (cookie security warning)
- [Next.js — JSON-LD guide](https://nextjs.org/docs/app/guides/json-ld) — HIGH
- [Next.js — generateMetadata / sitemap / robots](https://nextjs.org/docs/app/api-reference/functions/generate-metadata) — HIGH
- [Cloudinary — Authentication signatures](https://cloudinary.com/documentation/authentication_signatures) — HIGH
- [Cloudinary — Unsigned upload security](https://support.cloudinary.com/hc/en-us/articles/208335975) — HIGH
- [Schema.org — itemCondition / OfferItemCondition](https://schema.org/itemCondition) — HIGH
- [Google — Product structured data](https://developers.google.com/search/docs/appearance/structured-data/product) — HIGH
- [commercetools — Order before/after payment](https://docs.commercetools.com/tutorials/standard-checkout-flow) — MEDIUM (pattern for no-payment v1)
- [Better Auth GitHub #3431 — roles in middleware](https://github.com/better-auth/better-auth/issues/3431) — MEDIUM
- Local business schema guides (MapAtlas, AISO Hub) — MEDIUM
- Used-appliance inventory ops (Linnworks case study) — MEDIUM

---
*Pitfalls research for: Appliance Store Lviv (б/у техніка, single-store)*  
*Researched: 2026-05-16*
