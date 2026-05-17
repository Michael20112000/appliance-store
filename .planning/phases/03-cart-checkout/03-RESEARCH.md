# Phase 3: Cart & Checkout - Research

**Researched:** 2026-05-17
**Domain:** Authenticated cart, offline checkout, atomic used-SKU reservation, Ukrainian commerce routes
**Confidence:** HIGH (requirements + codebase + Prisma/Better Auth docs verified)

## Summary

Phase 3 closes the **buyer revenue path**: add-to-cart from PDP, `/koszyk` management, `/zamovlennia` checkout without online payment, order confirmation, and order history in `/kabinet`. The stack is already sufficient — **no new npm packages** for this phase (`Prisma 7.8`, `Better Auth 1.6`, `Zod 4`, `react-hook-form 7` installed).

The main design tension — **ROADMAP SC#1** (“неавторизований не може додати в кошик”) vs **CART-03** (“гостьовий кошик об’єднується при вході”) — is resolved with a **two-tier model**, not contradictory guest DB rows:

1. **Pre-auth intent (browser only):** clicking “Додати в кошик” without session writes `{ productId }` to `localStorage` and redirects to `/uviity?callbackUrl=…`. **No server cart mutation** until authenticated.
2. **Server cart (Postgres):** `Cart` / `CartItem` keyed by `userId` after login only.
3. **Merge on login (CART-03):** after successful sign-in/up, client calls `mergePendingCartAction` with pending items → server upserts into DB cart if products still `AVAILABLE` → clears `localStorage`.

Used appliances are **unique SKUs (qty = 1)**. Checkout runs a **Prisma interactive `$transaction`**: for each line, `updateMany` product `AVAILABLE → SOLD` only if still available; if any line fails, entire order rolls back (prevents double-sale per PITFALLS). v1 has **no `pending_payment`** — order lifecycle is store-fulfillment only with Ukrainian copy (“Оплата при отриманні”).

**Primary recommendation:** Implement `cart.service.ts` + `order.service.ts` + thin Server Actions; guard `/koszyk`, `/zamovlennia`, `/kabinet` orders with `requireBuyer()`; use routes `/koszyk` and `/zamovlennia` per ARCHITECTURE; extend `/kabinet` for CHK-04.

## Architectural Responsibility Map

| Capability | Primary Tier | Secondary Tier | Rationale |
|------------|-------------|----------------|-----------|
| Cart persistence | Database (Prisma `Cart`) | — | Source of truth per authenticated user |
| Pre-login cart intent | Browser (`localStorage`) | — | Satisfies CART-03 without guest DB rows or SC#1 violation |
| Add/remove/update cart | API / Backend (`server/services/cart.service.ts`) | Frontend Server (Actions) | Business rules: AVAILABLE-only, qty cap 1 |
| Auth gate (AUTH-03) | Frontend Server (RSC redirect) + Actions | — | `getSession` + `requireBuyer()` on every mutation |
| Checkout + inventory lock | API / Backend (`order.service.ts` transaction) | Database | Atomic SOLD transition; no payment webhook on v1 |
| Checkout form UI | Browser (react-hook-form) | Frontend Server (submit action) | Interactive fields; server validates with Zod |
| Order confirmation page | Frontend Server (RSC) | — | Read order by `orderNumber` + ownership check |
| Order history (CHK-04) | Frontend Server (`/kabinet`) | Database | List `Order` where `userId = session.user.id` |
| Catalog “still available” checks | API / Backend (reuse `catalog.service`) | — | Revalidate cart lines against `ProductStatus` |

## Standard Stack

### Core

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| **Prisma** | **7.8.0** (installed) | `Cart`, `Order`, transactions | Project ORM; `Product.status` already `AVAILABLE \| SOLD \| DRAFT` |
| **Better Auth** | **1.6.11** (installed) | Session for buyer actions | `auth.api.getSession({ headers })` in RSC/actions [CITED: better-auth.com/docs/integrations/next] |
| **Zod** | **4.4.3** (installed) | Checkout payload, phone, delivery | Same pattern as `catalogFiltersSchema` |
| **react-hook-form** | **7.76.0** (installed) | Checkout form state | Already in stack for forms |
| **@hookform/resolvers** | **5.2.2** (installed) | Zod ↔ RHF | Installed |
| **Next.js App Router** | **16.2.6** (installed) | `/koszyk`, `/zamovlennia`, Server Actions | Phase 1–2 patterns |

### Supporting

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| **Vitest** | **4.1.6** | Unit tests for merge + checkout guards | Nyquist |
| **Playwright** | **1.60.0** | E2E auth gate + checkout + double-sale | Extend `e2e/auth.spec.ts` pattern |

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| **localStorage pending intent** | Cookie guest cart in DB | Violates SC#1 (server add without auth) or needs anonymous `userId` |
| **localStorage pending intent** | Skip CART-03 | Fails requirement traceability |
| **`AVAILABLE → SOLD` at checkout** | `RESERVED` + TTL | Extra state machine; defer unless admin needs hold-before-call |
| **`PENDING` order status** | `NEW` enum value | `PENDING` OK if UA copy ≠ “очікує оплату”; document labels |
| **Server Actions only** | REST `/api/orders` | Actions match Phase 1–2; API only if mobile client later |

**Installation (Phase 3):** none required.

**Version verification (2026-05-17):** all commerce deps already in `package.json` at versions above.

## Package Legitimacy Audit

> Phase 3 adds **no new packages**. Existing stack verified in repo `package.json`.

| Package | Registry | slopcheck | Disposition |
|---------|----------|-----------|-------------|
| (none new) | — | not run | N/A |

**Packages removed due to slopcheck [SLOP] verdict:** none  
**Packages flagged [SUS]:** none

## Architecture Patterns

### System Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ Browser                                                                      │
│  PDP: AddToCartButton (client)                                               │
│    ├─ session? ─no─► localStorage pending[] + redirect /uviity?callbackUrl=  │
│    └─ session? ─yes─► addToCartAction ───────────────────────────────┐       │
│  After login: CartPendingMerge (client) ─► mergePendingCartAction ───┤       │
│  /koszyk, /zamovlennia forms (RHF client) ─► submitCheckoutAction ──┤       │
└──────────────────────────────────────────────────────────────────────┼───────┘
                                                                        │
                    ┌───────────────────────────────────────────────────▼───────┐
                    │ Next.js Server Actions + RSC                               │
                    │  requireBuyer() · Zod validate · revalidatePath            │
                    └───────────────────────────┬───────────────────────────────┘
                                                │
              ┌─────────────────────────────────┼─────────────────────────────────┐
              ▼                                 ▼                                 ▼
     ┌─────────────────┐              ┌─────────────────┐              ┌─────────────────┐
     │ cart.service     │              │ order.service    │              │ catalog.service  │
     │ upsert/remove    │              │ createFromCart() │              │ AVAILABLE guard  │
     │ validate lines   │              │ $transaction     │              │ (existing)       │
     └────────┬─────────┘              └────────┬─────────┘              └─────────────────┘
              │                                 │
              └──────────────┬──────────────────┘
                             ▼
                    ┌─────────────────┐
                    │ PostgreSQL       │
                    │ Cart, Order,     │
                    │ Product.status   │
                    └─────────────────┘
```

### Coherent auth + cart flow (resolves SC#1 vs CART-03)

| Step | Actor | Behavior |
|------|-------|----------|
| 1 | Guest on PDP | Clicks “Додати в кошик” → **no Server Action** → append `productId` to `localStorage` key `appliance-cart-pending` → `redirect(/uviity?callbackUrl=/tovar/{slug})` |
| 2 | Guest | Cannot open `/koszyk` or `/zamovlennia` — RSC `redirect(/uviity?callbackUrl=/koszyk)` |
| 3 | User logs in | `callbackUrl` returns to intended page; **`CartPendingMerge`** runs once: POST pending items to `mergePendingCartAction` |
| 4 | Logged-in buyer | Add to cart uses **`addToCartAction`** → DB `Cart` / `CartItem` (qty forced to **1**) |
| 5 | Logged-in buyer | `/koszyk` edit/remove; stale `SOLD` lines removed with UA toast/message |
| 6 | Checkout | `createOrderFromCart` transaction → order rows + **SOLD** products + clear cart → redirect confirmation |

**SC#1:** “cannot add to cart” = cannot mutate **server** cart nor view `/koszyk` without auth.  
**CART-03:** “guest cart merge” = merge **localStorage pending intent**, not anonymous DB cart.

> Note: `.planning/research/ARCHITECTURE.md` suggested skipping guest merge on v1; **REQUIREMENTS.md CART-03 overrides** with the localStorage bridge above.

### Recommended project structure

```
src/
├── app/(storefront)/
│   ├── koszyk/page.tsx              # auth RSC; list cart
│   ├── zamovlennia/
│   │   ├── page.tsx                 # checkout form (auth)
│   │   └── pidtverdzhennia/page.tsx # confirmation (auth, orderNumber query)
│   ├── kabinet/page.tsx             # extend: order history list
│   └── tovar/[slug]/page.tsx        # AddToCartButton
├── components/storefront/
│   ├── add-to-cart-button.tsx       # client: session branch + pending storage
│   ├── cart-pending-merge.tsx       # client: run after auth
│   ├── cart-line-list.tsx
│   ├── checkout-form.tsx            # client RHF
│   └── order-summary-card.tsx
├── lib/cart/
│   └── pending-storage.ts           # localStorage schema + helpers
├── server/
│   ├── services/
│   │   ├── cart.service.ts
│   │   └── order.service.ts
│   ├── actions/
│   │   ├── cart.actions.ts
│   │   └── order.actions.ts
│   └── validators/
│       ├── cart.ts
│       └── order.ts
├── lib/permissions.ts               # add requireBuyer()
└── types/cart.ts, types/order.ts

prisma/schema.prisma                 # Cart, CartItem, Order, OrderItem, enums
```

### Pattern 1: `requireBuyer()` helper

**What:** Central auth guard for commerce actions and layouts.  
**When:** Every cart/order Server Action and `/koszyk`, `/zamovlennia`, order detail.

```typescript
// lib/permissions.ts — extend existing requireAdmin pattern
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";

export async function requireBuyer() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) {
    redirect("/uviity?callbackUrl=/koszyk");
  }
  return session;
}
```

[CITED: better-auth.com/docs/integrations/next — server `getSession` + redirect]

### Pattern 2: Qty = 1 for used SKUs

**What:** `CartItem.quantity` is always `1`; service rejects `qty > 1`. UI shows remove only (no stepper), or disabled “+”.  
**When:** All add/merge/update paths.

### Pattern 3: Checkout transaction (atomic inventory)

**What:** Single interactive transaction: validate cart → create `Order` + `OrderItem` snapshots → mark products `SOLD` → delete cart items.  
**When:** `submitCheckoutAction`.

See **Code Examples** below.

### Pattern 4: Order status machine (no online payment)

**Enum `OrderStatus` (recommended):**

| Status | Ukrainian (admin/buyer) | Meaning |
|--------|-------------------------|---------|
| `PENDING` | Нове замовлення | Submitted; store will call — **not** payment pending |
| `CONFIRMED` | Підтверджено | Store accepted |
| `READY_FOR_PICKUP` | Готово до самовивозу | Pickup path |
| `OUT_FOR_DELIVERY` | Доставляється | Lviv delivery path |
| `COMPLETED` | Виконано | Closed |
| `CANCELLED` | Скасовано | Admin cancel; product `SOLD → AVAILABLE` (Phase 4) |

**Explicitly excluded:** `pending_payment`, `paymentStatus`, Stripe/LiqPay fields (v2 PAY-01).

**Enum `DeliveryType`:** `PICKUP` | `LVIV_DELIVERY` — address required only for delivery.

### Anti-patterns to avoid

- **Guest `Cart` rows without `userId`:** breaks SC#1 or needs anonymous auth.
- **Increment quantity > 1:** invalid for unique used units.
- **Mark SOLD on add-to-cart:** inventory locked too early; two buyers see “in cart” forever.
- **Checkout without transaction:** double-sale race (PITFALLS #1).
- **Payment-state UX:** spinners, “awaiting payment” filters (PITFALLS #7).

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Session/auth for actions | Custom JWT parsing | Better Auth `auth.api.getSession` | Cookie + refresh handled |
| Checkout atomicity | App-level locks / Redis | Prisma `$transaction` interactive | DB ACID, `updateMany` conditional |
| Money totals | Float math | Integer kopiyky + `OrderItem.priceSnapshot` | Same as `Product.price` |
| Human order IDs | Random UUID only | `orderNumber` (e.g. `ASL-20260517-0042`) | Admin phone support |
| Phone validation | Regex only | Zod + UA pattern (`+380…`) | Consistent error messages |
| Cart merge conflict rules | Ad-hoc UI state | `cart.service.mergePendingItems` | Testable single place |

## Prisma schema additions (from ARCHITECTURE, aligned to current `ProductStatus`)

```prisma
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
  id              String        @id @default(cuid())
  orderNumber     String        @unique
  userId          String
  status          OrderStatus   @default(PENDING)
  deliveryType    DeliveryType
  deliveryAddress String?
  customerPhone   String
  customerName    String
  notes           String?
  items           OrderItem[]
  createdAt       DateTime      @default(now())
  updatedAt       DateTime      @updatedAt

  @@index([userId, createdAt])
  @@index([status, createdAt])
}

model OrderItem {
  id             String  @id @default(cuid())
  orderId        String
  order          Order   @relation(fields: [orderId], references: [id], onDelete: Cascade)
  productId      String?
  product        Product? @relation(fields: [productId], references: [id], onDelete: SetNull)
  titleSnapshot  String
  priceSnapshot  Int
  quantity       Int
}
```

Add `cartItems` / `orderItems` relations on `Product`. `userId` on `Cart`/`Order` is `String` matching Better Auth `User.id` (no FK required if Better Auth manages user table — optional `@@index` only).

## Common Pitfalls

### Pitfall 1: Double-sale on concurrent checkout

**What goes wrong:** Two buyers checkout the same washing machine; both get confirmation.  
**Why:** Non-atomic read-then-write on `Product.status`.  
**How to avoid:** `updateMany({ where: { id, status: 'AVAILABLE' }, data: { status: 'SOLD' } })` inside `$transaction`; verify `count === 1` per item; else throw `ProductUnavailableError`.  
**Warning signs:** E2E parallel checkout test passes for both users.

### Pitfall 2: SC#1 / CART-03 contradiction implemented as DB guest cart

**What goes wrong:** Anonymous `Cart` rows or add without redirect.  
**How to avoid:** localStorage pending + server cart only after `requireBuyer()`.

### Pitfall 3: Stale cart lines after another buyer purchases

**What goes wrong:** User sees product in `/koszyk` that is already `SOLD`.  
**How to avoid:** On `/koszyk` load and pre-checkout, filter/remove invalid lines; block checkout with UA message listing removed titles.

### Pitfall 4: IDOR on order confirmation/history

**What goes wrong:** User guesses `orderNumber` and sees another buyer’s order.  
**How to avoid:** Every query includes `where: { userId: session.user.id }`.

### Pitfall 5: `pending_payment` creep

**What goes wrong:** Orders stuck, admin filters wrong, buyers expect card charge.  
**How to avoid:** Enum + copy per Pattern 4; no payment columns in schema.

### Pitfall 6: Forgetting `revalidatePath`

**What goes wrong:** PDP still shows “available” after checkout.  
**How to avoid:** After transaction: `revalidatePath('/koszyk')`, `revalidatePath('/tovar/[slug]')`, `revalidateTag` if catalog tags exist.

## Code Examples

### Checkout transaction (Prisma)

```typescript
// server/services/order.service.ts
// Source: https://www.prisma.io/docs/orm/prisma-client/queries/transactions
import { prisma } from "@/lib/db";
import type { DeliveryType } from "@/generated/prisma/client";

export async function createOrderFromCart(
  userId: string,
  input: {
    customerName: string;
    customerPhone: string;
    deliveryType: DeliveryType;
    deliveryAddress?: string;
    notes?: string;
  },
) {
  return prisma.$transaction(async (tx) => {
    const cart = await tx.cart.findUnique({
      where: { userId },
      include: {
        items: {
          include: {
            product: {
              select: {
                id: true,
                title: true,
                price: true,
                status: true,
              },
            },
          },
        },
      },
    });

    if (!cart?.items.length) {
      throw new Error("EMPTY_CART");
    }

    for (const item of cart.items) {
      if (item.product.status !== "AVAILABLE") {
        throw new Error("PRODUCT_UNAVAILABLE");
      }
    }

    const orderNumber = await generateOrderNumber(tx); // e.g. ASL-YYYYMMDD-####

    const order = await tx.order.create({
      data: {
        orderNumber,
        userId,
        status: "PENDING",
        deliveryType: input.deliveryType,
        deliveryAddress:
          input.deliveryType === "LVIV_DELIVERY"
            ? input.deliveryAddress
            : null,
        customerName: input.customerName,
        customerPhone: input.customerPhone,
        notes: input.notes,
        items: {
          create: cart.items.map((item) => ({
            productId: item.productId,
            titleSnapshot: item.product.title,
            priceSnapshot: item.product.price,
            quantity: 1,
          })),
        },
      },
    });

    for (const item of cart.items) {
      const updated = await tx.product.updateMany({
        where: { id: item.productId, status: "AVAILABLE" },
        data: { status: "SOLD" },
      });
      if (updated.count !== 1) {
        throw new Error("PRODUCT_UNAVAILABLE");
      }
    }

    await tx.cartItem.deleteMany({ where: { cartId: cart.id } });

    return order;
  });
}
```

### Merge pending cart (server)

```typescript
// server/services/cart.service.ts
export async function mergePendingItems(
  userId: string,
  pending: { productId: string }[],
) {
  const cart = await getOrCreateCart(userId);
  for (const { productId } of pending) {
    const product = await prisma.product.findFirst({
      where: { id: productId, status: "AVAILABLE" },
    });
    if (!product) continue;
    await prisma.cartItem.upsert({
      where: { cartId_productId: { cartId: cart.id, productId } },
      create: { cartId: cart.id, productId, quantity: 1 },
      update: { quantity: 1 },
    });
  }
}
```

### localStorage pending schema (client)

```typescript
// lib/cart/pending-storage.ts
const KEY = "appliance-cart-pending";

export type PendingCart = { v: 1; items: { productId: string }[] };

export function addPendingProduct(productId: string) {
  const current = readPending();
  if (!current.items.some((i) => i.productId === productId)) {
    current.items.push({ productId });
  }
  localStorage.setItem(KEY, JSON.stringify(current));
}
```

## State of the Art

| Old Approach | Current Approach | Impact |
|--------------|------------------|--------|
| Guest DB cart + merge | localStorage intent + DB cart post-auth | SC#1 + CART-03 both satisfied |
| `isPublished` boolean | `ProductStatus` AVAILABLE/SOLD/DRAFT | Phase 2 already migrated |
| Payment gateway checkout | Offline fulfillment statuses | Matches v1 scope |
| Reserve on add-to-cart | Reserve (`SOLD`) at commit | Simpler; fits no-payment v1 |

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | `PENDING` order status labeled “Нове” not “Очікує оплату” | Order statuses | UX confusion — fix copy only |
| A2 | `orderNumber` format `ASL-YYYYMMDD-####` | Order model | Stakeholder wants numeric-only |
| A3 | Confirmation at `/zamovlennia/pidtverdzhennia?nr=` | Routes | Prefer `/zamovlennia/[orderNumber]` |
| A4 | Admin revert `SOLD → AVAILABLE` on cancel deferred to Phase 4 | Pitfall 1 | Need manual DB fix until ADM-04 |
| A5 | `callbackUrl` query supported on `/uviity` | Auth flow | May need small login page enhancement |

## Open Questions (RESOLVED)

1. **SC#1 vs CART-03 — contradictory?** — **RESOLVED:** Two-tier model (localStorage pending + server cart after auth). No anonymous `Cart` rows.

2. **When to mark product `SOLD`?** — **RESOLVED:** At successful checkout transaction, not add-to-cart. Optional admin `RESERVED` deferred.

3. **Order statuses for no-payment v1?** — **RESOLVED:** `PENDING | CONFIRMED | READY_FOR_PICKUP | OUT_FOR_DELIVERY | COMPLETED | CANCELLED`. No `pending_payment`.

4. **Checkout routes?** — **RESOLVED:** `/koszyk`, `/zamovlennia`, confirmation under `/zamovlennia/pidtverdzhennia`, history in `/kabinet` (extend existing page).

5. **Quantity controls?** — **RESOLVED:** Max 1 per line; remove line only; used SKU semantics.

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|------------|-------------|-----------|---------|----------|
| Node.js | Next/Prisma | ✓ | v24.14.0 | — |
| PostgreSQL/Neon | Cart/Order tables | ✓ (Phase 1) | — | — |
| Better Auth | AUTH-03 gates | ✓ | 1.6.11 | — |
| Prisma CLI | migrate | ✓ | 7.8.0 | — |
| slopcheck | package audit | ✗ | — | N/A (no new packages) |

**Missing dependencies with no fallback:** none.

## Validation Architecture

### Test Framework

| Property | Value |
|----------|-------|
| Framework | Vitest 4.1.6 + Playwright 1.60.0 |
| Config file | `vitest.config.ts`, `playwright.config.ts` |
| Quick run | `npm test` |
| Full E2E | `npm run test:e2e` |

### Phase Requirements → Test Map

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|--------------|
| AUTH-03 | Guest redirected from `/koszyk` | e2e | `npx playwright test e2e/cart-auth.spec.ts` | ❌ Wave 0 |
| CART-01 | Logged-in add from PDP | e2e | same | ❌ Wave 0 |
| CART-02 | View/edit/remove cart | e2e | same | ❌ Wave 0 |
| CART-03 | Pending merges after login | e2e | `e2e/cart-merge.spec.ts` | ❌ Wave 0 |
| CHK-01 | Submit name + phone | e2e | `e2e/checkout.spec.ts` | ❌ Wave 0 |
| CHK-02 | Pickup vs Lviv delivery | unit + e2e | `vitest order.validator` | ❌ Wave 0 |
| CHK-03 | Confirmation without payment UI | e2e | `e2e/checkout.spec.ts` | ❌ Wave 0 |
| CHK-04 | Order list in kabinet | e2e | `e2e/orders-history.spec.ts` | ❌ Wave 0 |
| — | Double-sale race | e2e (parallel) | `e2e/checkout-race.spec.ts` | ❌ Wave 0 |
| — | `createOrderFromCart` rejects unavailable | unit | `vitest order.service.test.ts` | ❌ Wave 0 |

### Sampling Rate

- **Per task commit:** `npm test -- src/server/services/order.service.test.ts`
- **Per wave merge:** `npm test && npx playwright test e2e/cart-auth.spec.ts e2e/checkout.spec.ts`
- **Phase gate:** full E2E green before `/gsd-verify-work`

### Wave 0 Gaps

- [ ] `src/server/services/order.service.test.ts` — transaction / unavailable product
- [ ] `src/server/services/cart.service.test.ts` — merge + qty cap
- [ ] `src/server/validators/order.test.ts` — phone + delivery address rules
- [ ] `e2e/cart-auth.spec.ts`, `e2e/checkout.spec.ts`, `e2e/cart-merge.spec.ts`
- [ ] `lib/permissions.ts` — `requireBuyer()` + tests if desired

## Security Domain

### Applicable ASVS Categories

| ASVS Category | Applies | Standard Control |
|---------------|---------|------------------|
| V2 Authentication | yes | Better Auth session; AUTH-03 on commerce routes |
| V3 Session Management | yes | HTTP-only cookies; `getSession` server-side |
| V4 Access Control | yes | `order.userId === session.user.id`; admin orders Phase 4 |
| V5 Input Validation | yes | Zod on checkout; allowlist delivery fields |
| V6 Cryptography | no payment | N/A v1 |

### Known Threat Patterns

| Pattern | STRIDE | Mitigation |
|---------|--------|------------|
| IDOR on orders | Elevation | `userId` filter on all order reads |
| Double-sale | Tampering | Conditional `updateMany` in transaction |
| Mass assignment on checkout | Tampering | Zod schema; ignore client price |
| Cart merge spam | DoS | Cap pending items (e.g. 20) in validator |

## Project Constraints (from .cursor/rules/)

- **Stack locked:** Next.js App Router, Prisma + PostgreSQL, Better Auth, Tailwind/shadcn, Cloudinary, Ukrainian-only UI.
- **Business:** Single-store used appliances; Lviv delivery only; no online payment v1.
- **Architecture:** `server/services` + thin Server Actions; no Prisma in client components.
- **Roles:** `buyer` default; `admin` for `/admin` (Phase 4 order management).

## Vertical MVP Slices (recommended plan order)

| Slice | Delivers | Requirements |
|-------|----------|--------------|
| **03-01** | Prisma Cart/Order models + migrate | Enables all |
| **03-02** | `cart.service`, actions, `/koszyk`, `requireBuyer` | CART-02, AUTH-03 |
| **03-03** | PDP add + pending localStorage + merge | CART-01, CART-03, AUTH-03 |
| **03-04** | `/zamovlennia` checkout + transaction + confirmation | CHK-01–03 |
| **03-05** | `/kabinet` order history | CHK-04 |

**Parallelization:** 03-02 and 03-03 can split after 03-01; 03-04 blocked on cart.

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| AUTH-03 | Login required for cart, checkout, chat | `requireBuyer()`; RSC redirects on `/koszyk`, `/zamovlennia`; PDP guest → `/uviity` |
| CART-01 | Add to cart from PDP | `addToCartAction` (auth) or pending localStorage + redirect (guest) |
| CART-02 | View/edit/remove cart | `/koszyk` + `cart.service` + remove action; qty fixed at 1 |
| CART-03 | Guest cart merges on login | `mergePendingCartAction` + `CartPendingMerge` client; no DB guest cart |
| CHK-01 | Checkout with phone + fulfillment | `CheckoutForm` + Zod: `customerPhone`, `customerName`, `deliveryType` |
| CHK-02 | Pickup vs Lviv delivery | `DeliveryType` enum; address required iff `LVIV_DELIVERY` |
| CHK-03 | Order saved, no online payment | `createOrderFromCart`; confirmation copy; no payment fields |
| CHK-04 | Order history in cabinet | Extend `/kabinet` with `listOrdersForUser(userId)` |
</phase_requirements>

## Sources

### Primary (HIGH confidence)

- [Prisma transactions](https://www.prisma.io/docs/orm/prisma-client/queries/transactions) — interactive `$transaction` [Context7 `/websites/prisma_io`]
- [Better Auth Next.js integration](https://www.better-auth.com/docs/integrations/next) — `getSession` in RSC/actions [Context7 `/better-auth/better-auth`]
- `.planning/research/ARCHITECTURE.md` — cart/order models, routes `/koszyk`, `/zamovlennia`
- `.planning/research/PITFALLS.md` — double-sale, checkout states
- `prisma/schema.prisma` — `ProductStatus` AVAILABLE/SOLD/DRAFT
- `src/server/services/catalog.service.ts` — `PUBLIC_STATUS = AVAILABLE`

### Secondary (MEDIUM confidence)

- `.planning/ROADMAP.md` Phase 3 success criteria — SC#1 guest redirect interpreted with CART-03 bridge

## Metadata

**Confidence breakdown:**

- Standard stack: **HIGH** — no new deps; versions from `package.json`
- Architecture: **HIGH** — tension resolved with explicit two-tier flow
- Pitfalls: **HIGH** — aligned with PITFALLS.md + Prisma transaction docs

**Research date:** 2026-05-17  
**Valid until:** 2026-06-17 (stable domain)
