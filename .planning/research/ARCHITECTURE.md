# Architecture Research

**Domain:** Single-store used-appliance e-commerce (Lviv) with admin CRUD, cart/checkout, realtime buyer↔store chat  
**Researched:** 2026-05-16  
**Confidence:** HIGH (stack locked in PROJECT.md; patterns verified via Next.js, Prisma, Better Auth, Cloudinary official docs)

## Standard Architecture

### System Overview

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         Browser (Ukrainian UI)                               │
├──────────────────────────────┬──────────────────────────────────────────────┤
│      Storefront (public)     │           Admin panel (role: admin)           │
│  catalog · product · cart    │  products · categories · orders · chats       │
│  checkout · chat widget      │                                               │
└──────────────┬───────────────┴──────────────────────┬────────────────────────┘
               │                                       │
               ▼                                       ▼
┌──────────────────────────────────────────────────────────────────────────────┐
│                    Next.js App Router (monolith on Vercel)                    │
├──────────────────────────────────────────────────────────────────────────────┤
│  Route groups: (storefront) │ (admin) │ api/auth │ api/upload │ api/chat      │
│  Server Components (reads)  │  Server Actions (mutations)  │ Route Handlers   │
├──────────────────────────────────────────────────────────────────────────────┤
│  lib/          auth · db(prisma) · permissions · cloudinary · realtime       │
│  server/       services · actions · validators (zod)                           │
└──────────────┬───────────────────────────────┬───────────────────────────────┘
               │                               │
               ▼                               ▼
┌──────────────────────────┐    ┌────────────────────────────────────────────┐
│  PostgreSQL (Prisma)      │    │  External: Better Auth · Cloudinary ·       │
│  products · orders · chat │    │  Pusher/Ably (realtime transport)           │
└──────────────────────────┘    └────────────────────────────────────────────┘
```

**Principle:** PostgreSQL is the source of truth for catalog, orders, and messages. Realtime is a delivery layer on top of persisted messages—not a second database.

### Component Responsibilities

| Component | Responsibility | Typical Implementation |
|-----------|----------------|------------------------|
| **Storefront routes** `(storefront)/` | Public catalog, SEO, product detail, filters; auth-gated cart/checkout/chat | Server Components + `generateMetadata`; URL search params for filters |
| **Admin routes** `(admin)/admin/` | CRUD categories/products, order fulfillment, chat inbox | Separate layout; `auth.api.getSession` + role guard; denser UI |
| **Auth (Better Auth)** | Sessions, sign-in/up, roles `buyer` \| `admin` | `app/api/auth/[...all]/route.ts` via `toNextJsHandler`; admin plugin + custom access control |
| **Server services** `server/services/` | Business rules: stock, order totals, chat ownership, image limits | Pure TS functions; Prisma inside; no React imports |
| **Server actions** `server/actions/` | Form/API mutations from UI; call services; `revalidatePath` / `revalidateTag` | `'use server'`; Zod validate `FormData` |
| **Route handlers** `app/api/` | Auth mount, signed Cloudinary upload, chat send + realtime publish, webhooks | Thin: validate session → service → JSON |
| **Prisma layer** `lib/db.ts` + `prisma/schema` | Schema, migrations, typed queries | Singleton client; indexes for catalog filters |
| **Cloudinary pipeline** | Admin upload → store `publicId` + metadata in DB; storefront `CldImage` | Signed upload preset (admin only); `next-cloudinary` on storefront |
| **Realtime chat** | Push new messages to open UIs after DB write | Pusher or Ably channel per `conversationId`; optional presence for “manager online” |
| **Permissions** `lib/permissions.ts` | Map Better Auth roles to app capabilities | `requireBuyer()`, `requireAdmin()` helpers used in actions/layouts |

## Recommended Project Structure

```
src/
├── app/
│   ├── (storefront)/              # Public shop — shared marketing layout
│   │   ├── layout.tsx
│   │   ├── page.tsx               # Home
│   │   ├── katalog/               # Catalog + filters (searchParams)
│   │   ├── tovar/[slug]/          # Product PDP
│   │   ├── koszyk/
│   │   ├── zamovlennia/           # Checkout
│   │   ├── chat/                  # Buyer chat (auth required)
│   │   └── uviity/                # Sign-in/up
│   ├── (admin)/
│   │   └── admin/
│   │       ├── layout.tsx         # Admin shell + role guard
│   │       ├── page.tsx           # Dashboard
│   │       ├── kategorii/
│   │       ├── tovary/
│   │       ├── zamovlennia/
│   │       └── chaty/
│   ├── api/
│   │   ├── auth/[...all]/route.ts
│   │   ├── upload/sign/route.ts   # Signed Cloudinary params (admin)
│   │   └── chat/
│   │       ├── messages/route.ts  # POST message + publish realtime
│   │       └── pusher/auth/route.ts  # Private channel auth (if Pusher)
│   ├── layout.tsx                 # Root: fonts, providers
│   └── globals.css
├── components/
│   ├── ui/                        # shadcn
│   ├── storefront/                # ProductCard, FilterBar, CartDrawer…
│   └── admin/                     # DataTable, ProductForm, ChatInbox…
├── lib/
│   ├── auth.ts                    # betterAuth config + plugins
│   ├── auth-client.ts
│   ├── db.ts                      # Prisma singleton
│   ├── permissions.ts
│   ├── cloudinary.ts              # Server signing helpers
│   └── realtime.ts                # Pusher/Ably server instance
├── server/
│   ├── validators/                # Zod schemas (product, order, message)
│   ├── services/                  # Domain logic
│   │   ├── catalog.service.ts
│   │   ├── cart.service.ts
│   │   ├── order.service.ts
│   │   ├── chat.service.ts
│   │   └── media.service.ts
│   └── actions/                   # Thin wrappers for forms
│       ├── cart.actions.ts
│       ├── catalog.actions.ts     # admin CRUD
│       └── chat.actions.ts
└── types/                         # Shared DTOs if needed

prisma/
├── schema.prisma
└── seed.ts                        # Initial 8 categories + sample products
```

### Structure Rationale

- **Route groups `(storefront)` / `(admin)`:** Different layouts, metadata, and auth rules without URL pollution. Admin lives under `/admin/*` with a dedicated layout that fails closed for non-admins.
- **`server/services` vs `server/actions`:** Services hold testable business logic; actions are Next.js entry points (forms, revalidation). Avoid fat actions or Prisma calls scattered in components.
- **`app/api` only where necessary:** Prefer Server Actions for admin CRUD and checkout. Reserve Route Handlers for Better Auth, signed uploads, and chat endpoints that must return JSON or trigger realtime from non-React clients.
- **Ukrainian URL segments** (`katalog`, `tovar`, `koszyk`): SEO-friendly for Lviv audience; route folder names can stay Latin in code with `slug` in Ukrainian transliteration if desired.

## Architectural Patterns

### Pattern 1: Layered server boundary (RSC → Action → Service → Prisma)

**What:** UI never imports Prisma directly. Reads go through small query functions or services; writes go Action → Service → Prisma.

**When to use:** Always for this MVP—keeps admin and storefront rules consistent.

**Trade-offs:** Slightly more files; pays off when chat + orders share validation.

**Example:**
```typescript
// server/actions/cart.actions.ts
'use server'
import { requireBuyer } from '@/lib/permissions'
import { addToCart } from '@/server/services/cart.service'
import { revalidatePath } from 'next/cache'

export async function addToCartAction(productId: string, qty: number) {
  const user = await requireBuyer()
  await addToCart(user.id, productId, qty)
  revalidatePath('/koszyk')
}
```

### Pattern 2: Auth-gated islands inside public storefront

**What:** Catalog and PDP are public Server Components. Cart, checkout, and chat routes call `auth.api.getSession({ headers: await headers() })` and `redirect('/uviity')` when missing.

**When to use:** Matches requirement “catalog without login; cart/chat with login”—no guest-cart merge complexity on v1.

**Trade-offs:** Higher friction before purchase; acceptable for low-volume local store and simpler data model.

### Pattern 3: Database-first chat with managed realtime

**What:** `POST` message → insert `Message` in Postgres → publish event to `conversation:{id}` channel → clients append to UI. Initial history loaded via Server Component or server fetch.

**When to use:** Buyer↔store chat on Vercel serverless (no persistent WebSocket server).

**Trade-offs:** Adds Pusher/Ably dependency and cost; avoids operating custom WS infra. **Do not** use Postgres LISTEN/NOTIFY from serverless workers as primary transport—fragile on Vercel.

**Recommended transport:** **Pusher Channels** or **Ably** (either is HIGH confidence for Next.js + Vercel). Defer SSE-only polling unless budget blocks third-party realtime.

**Example flow:**
```typescript
// server/services/chat.service.ts
export async function sendMessage(conversationId: string, senderId: string, body: string) {
  const message = await prisma.message.create({ data: { conversationId, senderId, body } })
  await realtime.trigger(`conversation:${conversationId}`, 'message:new', message)
  return message
}
```

### Pattern 4: Admin media upload (signed, server-mediated)

**What:** Admin UI uses `CldUploadWidget` with **signed** upload preset. Server route returns signature; only `admin` role can request it. Product record stores `cloudinaryPublicId`, `width`, `height`, `sortOrder`—not raw file blobs in Postgres.

**When to use:** Multi-photo product CRUD from admin.

**Trade-offs:** Requires `CLOUDINARY_API_SECRET` on server only; `next-cloudinary` `CldImage` on storefront for `f_auto,q_auto` delivery.

### Pattern 5: Cache tags for catalog, path revalidation for admin edits

**What:** Tag product list/detail queries (`products`, `category:${slug}`). Admin mutations call `revalidateTag` + `revalidatePath` for affected catalog URLs.

**When to use:** SEO catalog must stay fast; admin edits should appear within seconds.

**Trade-offs:** Must discipline tag naming early in phase 1.

## Prisma Data Model (recommended)

Better Auth owns `user`, `session`, `account` tables (via its schema/migrate). App tables reference `User.id`.

```prisma
enum ProductCondition {
  LIKE_NEW
  GOOD
  FAIR
}

enum OrderStatus {
  PENDING
  CONFIRMED
  READY_FOR_PICKUP
  OUT_FOR_DELIVERY
  COMPLETED
  CANCELLED
}

enum DeliveryType {
  PICKUP
  LVIV_DELIVERY
}

model Category {
  id          String    @id @default(cuid())
  name        String
  slug        String    @unique
  description String?
  sortOrder   Int       @default(0)
  products    Product[]
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt
}

model Product {
  id          String           @id @default(cuid())
  title       String
  slug        String           @unique
  brand       String
  description String?
  price       Int              // kopiyky (UAH * 100) — avoid float money
  condition   ProductCondition
  isPublished Boolean          @default(false)
  categoryId  String
  category    Category         @relation(fields: [categoryId], references: [id])
  images      ProductImage[]
  cartItems   CartItem[]
  orderItems  OrderItem[]
  createdAt   DateTime         @default(now())
  updatedAt   DateTime         @updatedAt

  @@index([categoryId, isPublished])
  @@index([brand])
  @@index([price])
  @@index([condition])
}

model ProductImage {
  id                 String  @id @default(cuid())
  productId          String
  product            Product @relation(fields: [productId], references: [id], onDelete: Cascade)
  cloudinaryPublicId String
  alt                String?
  sortOrder          Int     @default(0)
  width              Int?
  height             Int?
}

model Cart {
  id        String     @id @default(cuid())
  userId    String     @unique
  items     CartItem[]
  updatedAt DateTime   @updatedAt
}

model CartItem {
  id        String  @id @default(cuid())
  cartId    String
  cart      Cart    @relation(fields: [cartId], references: [id], onDelete: Cascade)
  productId String
  product   Product @relation(fields: [productId], references: [id])
  quantity  Int     @default(1)

  @@unique([cartId, productId])
}

model Order {
  id             String        @id @default(cuid())
  orderNumber    String        @unique // human-readable for admin
  userId         String
  status         OrderStatus   @default(PENDING)
  deliveryType   DeliveryType
  deliveryAddress String?
  customerPhone  String
  customerName   String
  notes          String?
  items          OrderItem[]
  conversation   Conversation?
  createdAt      DateTime      @default(now())
  updatedAt      DateTime      @updatedAt

  @@index([userId])
  @@index([status, createdAt])
}

model OrderItem {
  id           String  @id @default(cuid())
  orderId      String
  order        Order   @relation(fields: [orderId], references: [id], onDelete: Cascade)
  productId    String?
  product      Product? @relation(fields: [productId], references: [id], onDelete: SetNull)
  titleSnapshot String
  priceSnapshot Int
  quantity     Int
}

model Conversation {
  id        String    @id @default(cuid())
  buyerId   String    @unique   // one active thread per buyer for single-store MVP
  orderId   String?   @unique
  order     Order?    @relation(fields: [orderId], references: [id])
  messages  Message[]
  updatedAt DateTime  @updatedAt

  @@index([updatedAt])
}

model Message {
  id             String       @id @default(cuid())
  conversationId String
  conversation   Conversation @relation(fields: [conversationId], references: [id], onDelete: Cascade)
  senderId       String
  body           String
  readAt         DateTime?
  createdAt      DateTime     @default(now())

  @@index([conversationId, createdAt])
}
```

**Role field:** Extend Better Auth `user` with `role` enum `BUYER | ADMIN` (default `BUYER`). Seed first admin via migration/script. Use admin plugin access control only if you need granular permissions beyond two roles.

## Auth: buyer vs admin

| Role | Access |
|------|--------|
| **buyer** (default) | Storefront, own cart/orders/chat |
| **admin** | `/admin/*`, all CRUD, all orders/chats, signed uploads |

**Enforcement layers (defense in depth):**
1. `(admin)/admin/layout.tsx` — server session check + `role === ADMIN` or redirect
2. Every `server/actions/*` admin mutation — `requireAdmin()`
3. `app/api/upload/sign` — admin only
4. Optional: middleware/proxy matcher for `/admin` early redirect (session cookie presence only; role check still in layout)

Better Auth setup (verified):
- `app/api/auth/[...all]/route.ts` → `toNextJsHandler(auth)`
- Server pages: `auth.api.getSession({ headers: await headers() })`
- Admin plugin + `createAccessControl` if you later split roles (e.g. `manager` read-only)

## Admin separation

| Concern | Storefront | Admin |
|---------|------------|-------|
| Layout | Light, marketing header/footer | Sidebar + dense tables |
| Data scope | `isPublished: true` products | All products including drafts |
| Mutations | Cart, checkout, send chat | CRUD, order status, read all chats |
| Components | `components/storefront/*` | `components/admin/*` |
| SEO | `generateMetadata`, JSON-LD Product | `noindex` on admin layout |

**Do not** share form components between admin product editor and storefront—different validation and UX density.

## Cloudinary image pipeline

```
Admin ProductForm (client)
    → CldUploadWidget (signed preset)
    → Cloudinary CDN stores asset
    → onSuccess: Server Action saves ProductImage row (publicId, dimensions)
Storefront PDP / catalog
    → Server Component passes publicId
    → <CldImage src={publicId} width height alt sizes />
```

**Rules:**
- `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME` public; `CLOUDINARY_API_SECRET` server-only
- Unsigned preset acceptable only for dev; production admin uploads should be **signed**
- On product delete: optional Cloudinary destroy via Admin API (phase 2 cleanup job acceptable for MVP)
- Multiple images: `sortOrder`; first image = card thumbnail

## Data Flow

### Request flow (catalog read)

```
GET /katalog?category=...&brand=...
    → (storefront)/katalog/page.tsx (Server Component)
    → catalog.service.listPublished(filters)
    → Prisma findMany + indexes
    → HTML with CldImage URLs (cached with tags)
```

### Cart → checkout (authenticated)

```
Add to cart (Server Action)
    → requireBuyer()
    → cart.service.upsertItem(userId, productId, qty)
    → revalidatePath('/koszyk')

Checkout submit (Server Action)
    → validate delivery (PICKUP | LVIV_DELIVERY + address if delivery)
    → order.service.createFromCart(userId, payload)  // transaction: order + items + clear cart
    → optional: conversation linked to orderId
    → revalidatePath + redirect to confirmation
```

### Chat message

```
Client ChatPanel (use client + Pusher subscribe)
    → User sends → POST /api/chat/messages OR sendMessageAction
    → chat.service.sendMessage (DB insert)
    → realtime.trigger(conversation channel)
    → All subscribers update UI
Admin inbox
    → Server Component lists conversations by updatedAt
    → Opening thread loads messages + subscribes to same channel
```

### State management

| State | Where |
|-------|--------|
| Catalog filters | URL `searchParams` (shareable, SEO-friendly) |
| Cart | Postgres `Cart` per `userId` (auth required on v1) |
| Chat messages | Postgres + realtime push for live tail |
| Admin tables | Server Components; optimistic UI optional later |
| Session | Better Auth HTTP-only cookies |

**Avoid** global client stores (Zustand/Redux) for cart/catalog on v1—Server Actions + revalidation are sufficient.

## Suggested build order

Dependencies flow **foundation → catalog → commerce → comms → polish**.

| Step | Deliverable | Why this order |
|------|-------------|----------------|
| **1** | Next.js scaffold, Tailwind, shadcn, Prisma + Postgres, env | Everything else depends on DB and UI kit |
| **2** | Better Auth (buyer sign-up/in), `User.role`, seed admin | Cart/chat/checkout need identity |
| **3** | Prisma schema + migrations + seed categories | Catalog needs stable taxonomy |
| **4** | Admin layout + role guard + Category CRUD | Admins populate data before public launch |
| **5** | Cloudinary signed upload + Product CRUD (admin) | Images block realistic catalog |
| **6** | Storefront catalog + PDP + filters + SEO metadata | Core value path; uses published products only |
| **7** | Cart + checkout + Order admin | Revenue path; depends on products + auth |
| **8** | Realtime provider + Conversation/Message + buyer chat + admin inbox | Depends on auth; can link to order optionally |
| **9** | Performance pass (image sizes, caching tags), accessibility, Ukrainian copy audit | PROJECT quality bar |

**Parallelizable after step 5:** Storefront catalog UI (6) can start while admin product polish continues, but do not ship public site without admin ability to publish products.

## Scaling Considerations

| Scale | Architecture adjustments |
|-------|---------------------------|
| **0–1k users** | Monolith on Vercel + managed Postgres (Neon/Supabase/Vercel Postgres) is sufficient |
| **1k–100k** | Add connection pooling (Prisma Accelerate or PgBouncer); review Pusher/Ably message volume; CDN already via Cloudinary |
| **100k+** | Consider read replicas for catalog; extract chat to dedicated service only if message volume demands it |

### Scaling priorities

1. **First bottleneck:** Unindexed catalog filters (`categoryId`, `price`, `brand`, `condition`)—define indexes in step 3.
2. **Second bottleneck:** N+1 queries on product lists with images—use `include: { images: { orderBy: { sortOrder: 'asc' }, take: 1 } }` or selective `select`.

## Anti-Patterns

### Anti-Pattern 1: Realtime-as-database

**What people do:** Store messages only in Pusher/Ably presence or client state.  
**Why it's wrong:** No history, no admin audit, breaks on refresh.  
**Do this instead:** Always persist `Message` in Postgres, then broadcast.

### Anti-Pattern 2: Prisma in Client Components

**What people do:** Import `prisma` in `'use client'` files for “quick” fetches.  
**Why it's wrong:** Leaks DB access pattern, bundle/security risk.  
**Do this instead:** Server Components, Server Actions, or Route Handlers only.

### Anti-Pattern 3: Single layout for admin and shop

**What people do:** One `layout.tsx` with conditional nav for admin.  
**Why it's wrong:** Accidental SEO indexing of admin, heavier JS on catalog, muddied auth.  
**Do this instead:** Route groups with separate layouts; `robots: noindex` on admin.

### Anti-Pattern 4: Float prices in UAH

**What people do:** `price Float` in Prisma.  
**Why it's wrong:** Rounding errors on totals.  
**Do this instead:** Integer minor units (`price Int` kopiyky) or `Decimal` with explicit rounding in service layer.

### Anti-Pattern 5: Guest cart complexity on v1

**What people do:** Cookie cart + merge on login despite requirement that cart requires auth.  
**Why it's wrong:** Extra migration logic not requested.  
**Do this instead:** `Cart.userId` unique; redirect to sign-in before `/koszyk`.

## Integration Points

### External services

| Service | Integration pattern | Notes |
|---------|---------------------|-------|
| **Better Auth** | `app/api/auth/[...all]` + `lib/auth.ts` | Session via `auth.api.getSession`; extend user with `role` |
| **Cloudinary** | `next-cloudinary` + signed upload route | Admin upload; `CldImage` on storefront; secret server-only |
| **Pusher / Ably** | Server trigger after DB write; client subscribe in chat UI | Pick one; private channel auth route for production |
| **PostgreSQL** | Prisma migrations in CI/deploy | Use pooled connection string in serverless |

### Internal boundaries

| Boundary | Communication | Notes |
|----------|---------------|-------|
| Storefront ↔ Services | Server Actions + RSC data loaders | No direct cross-import of admin components |
| Admin ↔ Services | Same services, `requireAdmin()` | Reuse `catalog.service` with `includeUnpublished` flag |
| Chat client ↔ API | Route Handler or Server Action + realtime | Keep message body validation in `chat.service` |
| Auth ↔ App tables | `userId` FK on Cart, Order, Conversation | Align Better Auth user id type (string/cuid) once in schema |

## Sources

- [Next.js — revalidatePath](https://nextjs.org/docs/app/api-reference/functions/revalidatePath) (HIGH)
- [Next.js Learn — Mutating Data / Server Actions](https://nextjs.org/learn/dashboard-app/mutating-data) (HIGH)
- [Prisma — schema & relations](https://www.prisma.io/docs) via Context7 `/prisma/prisma` (HIGH)
- [Better Auth — Next.js integration & getSession](https://www.better-auth.com/docs/integrations/next) via Context7 `/better-auth/better-auth` (HIGH)
- [Better Auth — Admin plugin & access control](https://www.better-auth.com/docs/plugins/admin) (HIGH)
- [Cloudinary — Next.js SDK](https://cloudinary.com/documentation/nextjs_integration) (HIGH)
- [Ably — database-driven realtime chat architecture](https://ably.com/blog/database-driven-realtime-architectures-serverless-editable-chat-app-part-1) (MEDIUM — pattern reference for DB + realtime split)

---
*Architecture research for: Appliance Store Lviv (greenfield)*  
*Researched: 2026-05-16*
