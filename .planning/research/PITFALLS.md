# Pitfalls Research

**Domain:** Used-appliance e-commerce (Next.js + Prisma)
**Researched:** 2026-05-16
**Confidence:** HIGH

## Critical Pitfalls

### 1. Treating used goods like new SKUs

**Warning signs:** No condition field; single generic description; no defect photos.

**Prevention:** Required `condition` enum (e.g. excellent/good/fair), condition notes, min 2 photos; show prominently on PDP.

**Phase:** Catalog / Admin products

### 2. Chat without persisted messages

**Warning signs:** Pusher-only, no DB; refresh loses history.

**Prevention:** Write Message to Postgres first, then broadcast; idempotent message IDs.

**Phase:** Chat phase

### 3. Filter performance on unindexed columns

**Warning signs:** Slow catalog with 100+ items; full table scans.

**Prevention:** Composite indexes on filter fields; paginate; cap price range queries.

**Phase:** Catalog filters

### 4. Admin exposed without server-side RBAC

**Warning signs:** Admin UI hidden but API routes open.

**Prevention:** Middleware on `/admin` + `requireAdmin()` in every mutation.

**Phase:** Admin foundation

### 5. Weak local SEO

**Warning signs:** English URLs only; no structured data; generic titles.

**Prevention:** Ukrainian slugs, `LocalBusiness` + `Product` JSON-LD, Lviv-specific copy, Open Graph images from Cloudinary.

**Phase:** Storefront polish

### 6. Cart/session confusion

**Warning signs:** Guest cart lost on login; duplicate line items.

**Prevention:** Merge guest cart to user on sign-in; single cart per user.

**Phase:** Cart phase

### 7. Cloudinary upload abuse

**Warning signs:** Public unsigned upload from client.

**Prevention:** Server-signed uploads; admin-only; folder per product.

**Phase:** Admin media

## Medium Pitfalls

- **Checkout without phone validation** — require UA phone format
- **Sold items still in catalog** — filter `status=active`, mark sold on order
- **Realtime cost** — one Pusher app, channel per conversation, disconnect idle clients

## Phase Mapping Summary

| Pitfall | Address in Phase |
|---------|------------------|
| Condition/photos | 2 – Catalog + Admin |
| RBAC | 1 – Foundation |
| Filters/indexes | 2 – Catalog |
| Cart merge | 3 – Cart/Checkout |
| Chat persistence | 4 – Chat |
| SEO | 2 + 5 – Polish |
