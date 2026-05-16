# Architecture Research

**Domain:** Next.js used-appliance store
**Researched:** 2026-05-16
**Confidence:** HIGH

## System Overview

Monolithic Next.js app with colocated API (Route Handlers / Server Actions), Prisma data layer, Cloudinary for media, Pusher for chat realtime, Better Auth for sessions.

```
┌─────────────────────────────────────────────────────────┐
│                     Next.js App                          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐ │
│  │ Storefront   │  │ Admin (/admin)│  │ API Routes   │ │
│  │ (public)     │  │ role-guarded  │  │ + Actions    │ │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘ │
│         └─────────────────┼─────────────────┘         │
│                           ▼                             │
│                    Prisma → PostgreSQL                  │
└───────────────────────────┬─────────────────────────────┘
                            │
              ┌─────────────┼─────────────┐
              ▼             ▼             ▼
        Cloudinary      Pusher        Better Auth
        (images)        (chat RT)     (sessions)
```

## Route Structure

| Area | Path | Purpose |
|------|------|---------|
| Home | `/` | Featured, categories |
| Catalog | `/katalog`, `/katalog/[category]` | List + filters |
| Product | `/tovar/[slug]` | Detail, add to cart, chat CTA |
| Cart | `/koszyk` | Line items |
| Checkout | `/oformlennya` | Delivery/pickup, contact, submit |
| Account | `/kabinet` | Orders, chats (auth) |
| Admin | `/admin/*` | Products, categories, orders, chats |
| API | `/api/*` | Webhooks, Pusher auth, uploads |

## Data Model (Core Entities)

- **User** — buyer (optional until cart/chat)
- **Admin** — role via Better Auth `role: admin`
- **Category** — name, slug, sortOrder; CRUD admin
- **Product** — title, slug, description, price, brand, **condition** enum, categoryId, status (draft/active/sold), cloudinaryPublicIds[]
- **Cart** / **CartItem** — userId or sessionId
- **Order** — items snapshot, deliveryType, address, phone, status (new/confirmed/completed/cancelled)
- **Conversation** — buyerId, optional productId
- **Message** — conversationId, senderId, body, readAt

Indexes: `(categoryId, status)`, `(brand)`, `(price)`, `(condition)`, full-text on title optional.

## Component Boundaries

| Component | Responsibility | Talks To |
|-----------|----------------|----------|
| CatalogService | Filtered product queries | Prisma |
| CartService | Add/update/remove | Prisma, session |
| OrderService | Checkout validation, create order | Prisma, Zod |
| ChatService | Messages CRUD + Pusher trigger | Prisma, Pusher |
| MediaService | Signed upload, delete | Cloudinary |
| AdminGuard | Middleware role check | Better Auth |

## Auth Flow

- **Public**: browse catalog, view product
- **Buyer**: sign up/in (email) for cart persistence, checkout, chat
- **Admin**: separate allowlist or `role` field; middleware on `/admin`

## Realtime Chat Pattern

1. Client subscribes to `private-conversation-{id}` via Pusher
2. Server Action saves message to Postgres, triggers Pusher event
3. Admin `/admin/chats` lists open conversations, unread badge

## Suggested Build Order

1. Schema + seed categories + Better Auth
2. Storefront catalog + product detail (static-first SEO)
3. Admin product/category CRUD + Cloudinary upload
4. Cart + checkout + order admin
5. Chat (conversation model + Pusher + UI)
6. Search/filter polish + SEO JSON-LD
7. E2E tests + Vercel deploy

## Security Notes

- Admin routes: middleware + server-side role check (never client-only)
- Pusher auth endpoint: verify session + conversation membership
- Cloudinary upload: signed uploads from server, preset restrictions

## Implications for Roadmap

Align phases to vertical slices matching build order; chat phase after auth + admin exist.
