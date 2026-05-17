# Phase 9: Wishlist - Pattern Map

**Mapped:** 2026-05-17  
**Files analyzed:** 24 new/modified  
**Analogs found:** 22 / 24

## File Classification

| New/Modified File | Role | Data Flow | Closest Analog | Match Quality |
|-------------------|------|-----------|----------------|---------------|
| `prisma/schema.prisma` | model | CRUD | `CartItem` + `@@unique` | exact |
| `src/lib/wishlist/guest-storage.ts` | utility | file-I/O | `src/lib/cart/pending-storage.ts` | exact |
| `src/lib/wishlist/guest-storage.test.ts` | test | transform | `src/server/services/cart.service.test.ts` | role-match |
| `src/lib/wishlist/wishlist-events.ts` | utility | pub-sub | *(none — new)* | no analog |
| `src/types/wishlist.ts` | model | transform | `src/types/cart.ts` | exact |
| `src/server/validators/wishlist.ts` | utility | transform | `src/server/validators/cart.ts` | exact |
| `src/server/services/wishlist.service.ts` | service | CRUD | `src/server/services/cart.service.ts` | exact (inverse prune) |
| `src/server/services/wishlist.service.test.ts` | test | CRUD | `src/server/services/cart.service.test.ts` | exact |
| `src/server/actions/wishlist.actions.ts` | controller | request-response | `src/server/actions/cart.actions.ts` | exact (no merge action) |
| `src/components/wishlist/wishlist-toggle-button.tsx` | component | request-response | `src/components/cart/add-to-cart-button.tsx` | exact |
| `src/components/wishlist/wishlist-nav-link.tsx` | component | request-response | `cart-nav-link.tsx` + `add-to-cart-button.tsx` guest branch | partial |
| `src/components/wishlist/wishlist-grid.tsx` | component | CRUD | `product-grid.tsx` + `koszyk/page.tsx` | partial |
| `src/components/wishlist/wishlist-unavailable-card.tsx` | component | CRUD | `cart-line-item.tsx` (muted, no CTA) | partial |
| `src/components/wishlist/guest-wishlist-view.tsx` | component | request-response | `add-to-cart-button.tsx` guest + `cart-empty.tsx` | partial |
| `src/app/(storefront)/obrane/page.tsx` | route | request-response | `katalog/page.tsx` (public) + `koszyk/page.tsx` (list) | partial |
| `src/app/(storefront)/layout.tsx` | config | — | `src/app/(admin)/admin/layout.tsx` Toaster | exact |
| `src/components/catalog/product-card.tsx` | component | request-response | self + overlay sibling pattern (research) | modify |
| `src/components/catalog/product-grid.tsx` | component | CRUD | self | modify |
| `src/app/(storefront)/tovar/[slug]/page.tsx` | route | request-response | self (`AddToCartButton` wiring) | modify |
| `src/app/(storefront)/katalog/page.tsx` | route | request-response | self + session prefetch | modify |
| `src/app/(storefront)/katalog/[slug]/page.tsx` | route | request-response | `katalog/page.tsx` | modify |
| `src/components/layout/store-header.tsx` | component | request-response | self (`CartNavLink` placement) | modify |
| `src/app/(storefront)/kabinet/page.tsx` | route | CRUD | self (section blocks) | modify |
| `.planning/phases/09-wishlist/09-MANUAL-CHECKLIST.md` | config | — | phase 08 manual checklist | role-match |

**Anti-patterns (do NOT copy):** `cart-pending-merge.tsx`, `cart-pending-merge-gate.tsx` — wishlist must have no merge gate in layout.

---

## Pattern Assignments

### `prisma/schema.prisma` (model, CRUD)

**Analog:** `CartItem` + `Product` relations

**Relation + unique pattern** (lines 159-168):

```159:168:prisma/schema.prisma
model CartItem {
  id        String  @id @default(cuid())
  cartId    String
  cart      Cart    @relation(fields: [cartId], references: [id], onDelete: Cascade)
  productId String
  product   Product @relation(fields: [productId], references: [id])
  quantity  Int     @default(1)

  @@unique([cartId, productId])
}
```

**Target shape (from RESEARCH — add to `User`, `Product`, new model):**

```prisma
model WishlistItem {
  id        String   @id @default(cuid())
  userId    String
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  productId String
  product   Product  @relation(fields: [productId], references: [id], onDelete: Cascade)
  createdAt DateTime @default(now())

  @@unique([userId, productId])
  @@index([userId])
}
```

Add `wishlistItems WishlistItem[]` on `User` and `Product` (mirror `cartItems` on `Product` line 127).

---

### `src/lib/wishlist/guest-storage.ts` (utility, file-I/O)

**Analog:** `src/lib/cart/pending-storage.ts`

**Imports + constants** (lines 1-9):

```1:9:src/lib/cart/pending-storage.ts
"use client";

const KEY = "appliance-cart-pending";
const MAX_ITEMS = 20;

type PendingCart = {
  v: 1;
  items: { productId: string }[];
};
```

Wishlist: `KEY = "appliance-wishlist-guest"`, same `v: 1` / `items` shape (D-09-13).

**Safe read/write** (lines 11-31):

```11:31:src/lib/cart/pending-storage.ts
function readRaw(): PendingCart {
  if (typeof window === "undefined") {
    return { v: 1, items: [] };
  }

  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return { v: 1, items: [] };
    const parsed = JSON.parse(raw) as PendingCart;
    if (parsed?.v !== 1 || !Array.isArray(parsed.items)) {
      return { v: 1, items: [] };
    }
    return parsed;
  } catch {
    return { v: 1, items: [] };
  }
}

function write(data: PendingCart) {
  localStorage.setItem(KEY, JSON.stringify(data));
}
```

**Add/remove idempotency** (lines 37-58):

```37:58:src/lib/cart/pending-storage.ts
export function addPendingProduct(productId: string) {
  const data = readRaw();
  if (data.items.some((item) => item.productId === productId)) {
    return;
  }
  if (data.items.length >= MAX_ITEMS) {
    return;
  }
  data.items.push({ productId });
  write(data);
}

export function removePendingProduct(productId: string) {
  const data = readRaw();
  const next = data.items.filter((item) => item.productId !== productId);
  if (next.length === data.items.length) return;
  write({ v: 1, items: next });
}

export function hasPendingProduct(productId: string): boolean {
  return readRaw().items.some((item) => item.productId === productId);
}
```

**Wishlist deltas vs cart pending:**
- `addGuestWishlistProduct` returns `'added' | 'duplicate' | 'max'` (cart silently returns on max — D-09-14 needs toast).
- Export `getGuestWishlistCount()`, `readGuestWishlist()` for nav/page.
- After `write`, dispatch `wishlist:changed` (see `wishlist-events.ts` — no codebase analog).

---

### `src/lib/wishlist/guest-storage.test.ts` (test, transform)

**Analog:** `src/server/services/cart.service.test.ts` + `src/lib/catalog/search-params.test.ts`

**Test file skeleton** (cart.service.test.ts lines 1-10):

```1:10:src/server/services/cart.service.test.ts
import { describe, expect, it } from "vitest";
import { canAddProductToCart } from "./cart.service";

describe("canAddProductToCart", () => {
  it("allows AVAILABLE only", () => {
    expect(canAddProductToCart("AVAILABLE")).toBe(true);
    expect(canAddProductToCart("SOLD")).toBe(false);
    expect(canAddProductToCart("DRAFT")).toBe(false);
  });
});
```

**Vitest config** (`vitest.config.ts` lines 10-12): `environment: "node"`, `include: ["src/**/*.test.ts"]` — mock `localStorage` via `vi.stubGlobal` or in-memory object before each test; no existing LS test in repo.

**Cases:** key name, add/remove idempotent, max 20 returns `'max'`, corrupt JSON → empty list.

---

### `src/lib/wishlist/wishlist-events.ts` (utility, pub-sub)

**Analog:** None in codebase.

**Pattern:** Minimal client-only helper:

```typescript
export const WISHLIST_CHANGED_EVENT = "wishlist:changed";

export function dispatchWishlistChanged() {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent(WISHLIST_CHANGED_EVENT));
}
```

Call from `guest-storage.ts` after mutations; `WishlistNavLink` listens in `useEffect`.

---

### `src/types/wishlist.ts` (model, transform)

**Analog:** `src/types/cart.ts`

**DTO shape** (lines 3-20):

```3:20:src/types/cart.ts
export type CartLineDto = {
  productId: string;
  slug: string;
  title: string;
  brand: string;
  priceKopiyky: number;
  condition: ProductCondition;
  image: {
    cloudinaryPublicId: string;
    alt: string | null;
  } | null;
};

export type CartViewDto = {
  items: CartLineDto[];
  subtotalKopiyky: number;
  removedTitles: string[];
};
```

**Wishlist:** `WishlistLineDto` = cart fields + `status: ProductStatus` + `available: boolean` (`status === 'AVAILABLE'`). `WishlistViewDto = { items: WishlistLineDto[] }` (no subtotal, no auto-removedTitles — D-09-20).

---

### `src/server/validators/wishlist.ts` (utility, transform)

**Analog:** `src/server/validators/cart.ts`

```3:16:src/server/validators/cart.ts
export const addToCartSchema = z.object({
  productId: z.string().cuid("Невірний ідентифікатор товару"),
  quantity: z.literal(1),
});

export const mergePendingSchema = z.object({
  items: z
    .array(
      z.object({
        productId: z.string().cuid("Невірний ідентифікатор товару"),
      }),
    )
    .max(20, "Занадто багато товарів для об'єднання"),
});
```

**Wishlist:** `wishlistProductIdSchema` = `{ productId }` only (no quantity). `resolveWishlistIdsSchema` = `z.array(z.string().cuid()).max(20)` for guest resolve action. **Do not** export `mergePendingSchema` equivalent.

---

### `src/server/services/wishlist.service.ts` (service, CRUD)

**Analog:** `src/server/services/cart.service.ts` — **invert** stale-line handling.

**Add only AVAILABLE** (lines 91-109):

```91:109:src/server/services/cart.service.ts
export async function addToCart(userId: string, productId: string) {
  const product = await prisma.product.findFirst({
    where: { id: productId, status: PUBLIC_STATUS },
    select: { id: true },
  });

  if (!product) {
    throw new Error("PRODUCT_UNAVAILABLE");
  }

  const cart = await getOrCreateCart(userId);

  await prisma.cartItem.upsert({
    where: {
      cartId_productId: { cartId: cart.id, productId },
    },
    create: { cartId: cart.id, productId, quantity: 1 },
    update: { quantity: 1 },
  });
}
```

Wishlist: `prisma.wishlistItem.upsert` with `@@unique([userId, productId])` — no `getOrCreateCart` wrapper needed.

**Anti-pattern — do NOT prune SOLD/DRAFT** (cart lines 72-84):

```72:84:src/server/services/cart.service.ts
  for (const item of items) {
    const line = mapLine(item);
    if (line) {
      lines.push(line);
    } else {
      removedTitles.push(item.product.title);
      staleIds.push(item.id);
    }
  }

  if (staleIds.length > 0) {
    await prisma.cartItem.deleteMany({ where: { id: { in: staleIds } } });
  }
```

Wishlist `mapLine` must return DTO for **all** statuses; set `available: product.status === 'AVAILABLE'`.

**Count for header** — mirror `getCartItemCount` (lines 160-166):

```160:166:src/server/services/cart.service.ts
export async function getCartItemCount(userId: string): Promise<number> {
  const cart = await prisma.cart.findUnique({
    where: { userId },
    select: { _count: { select: { items: true } } },
  });
  return cart?._count.items ?? 0;
}
```

Wishlist: `prisma.wishlistItem.count({ where: { userId } })`.

**Helpers:** `canAddProductToWishlist(status)` — copy `canAddProductToCart` (lines 174-176). `isProductInWishlist`, `getWishlistedProductIds(userId)`, `listWishlistForUser` with `orderBy: { createdAt: 'desc' }`, kabinet preview `take: 3`.

---

### `src/server/services/wishlist.service.test.ts` (test, CRUD)

**Analog:** `cart.service.test.ts`

```174:176:src/server/services/cart.service.ts
export function canAddProductToCart(status: string): boolean {
  return status === PUBLIC_STATUS;
}
```

Test `canAddProductToWishlist` identically. Add unit tests that list mapping keeps SOLD/DRAFT with `available: false` (WISH-04). DB integration optional — follow `order.service.test.ts` mock `tx` style if needed.

---

### `src/server/actions/wishlist.actions.ts` (controller, request-response)

**Analog:** `src/server/actions/cart.actions.ts` — **exclude** `mergePendingCartAction`.

**Revalidate + add** (lines 1-29):

```1:29:src/server/actions/cart.actions.ts
"use server";

import { revalidatePath } from "next/cache";
import { requireBuyer } from "@/lib/permissions";
import {
  addToCart,
  mergePendingItems,
  removeFromCart,
} from "@/server/services/cart.service";
import { addToCartSchema, mergePendingSchema } from "@/server/validators/cart";

function revalidateCartPaths() {
  revalidatePath("/koszyk");
  revalidatePath("/", "layout");
}

export async function addToCartAction(productId: string) {
  const session = await requireBuyer();
  const parsed = addToCartSchema.parse({ productId, quantity: 1 });

  try {
    await addToCart(session.user.id, parsed.productId);
  } catch {
    return { ok: false as const, error: "PRODUCT_UNAVAILABLE" };
  }

  revalidateCartPaths();
  return { ok: true as const };
}
```

**Wishlist `revalidateWishlistPaths`:**

```typescript
function revalidateWishlistPaths() {
  revalidatePath("/obrane");
  revalidatePath("/kabinet");
  revalidatePath("/", "layout");
}
```

Exports: `addToWishlistAction`, `removeFromWishlistAction`, `resolveWishlistProductsAction(ids)` (public read by IDs, Zod max 20 — no `requireBuyer` on resolve). **No** merge action.

---

### `src/components/wishlist/wishlist-toggle-button.tsx` (component, request-response)

**Analog:** `src/components/cart/add-to-cart-button.tsx`

**Client + transition + session branch** (lines 1-49):

```1:49:src/components/cart/add-to-cart-button.tsx
"use client";

import { useEffect, useState, useTransition } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Check, ShoppingCart } from "lucide-react";
import {
  addPendingProduct,
  hasPendingProduct,
  removePendingProduct,
} from "@/lib/cart/pending-storage";
import {
  addToCartAction,
  removeFromCartAction,
} from "@/server/actions/cart.actions";
// ...

  useEffect(() => {
    if (!hasSession) {
      setInCart(hasPendingProduct(productId));
    }
  }, [hasSession, productId]);
```

**Session toggle** (lines 62-70, 82-86):

```62:70:src/components/cart/add-to-cart-button.tsx
    startTransition(async () => {
      const result = await addToCartAction(productId);
      if (!result.ok) {
        setError("Цей товар уже недоступний для замовлення.");
        return;
      }
      setInCart(true);
      router.refresh();
    });
```

**Wishlist deltas:**
- `Heart` icon, `aria-pressed`, Ukrainian labels (D-09-11).
- Guest: **no** `router.push('/uviity')` (cart lines 57-58) — stay on page.
- `toast.success` / `toast.error` from `sonner` (see chat-thread).
- Overlay: `type="button"`, `className="absolute right-2 top-2 z-10 ..."`, `onClick` with `e.preventDefault(); e.stopPropagation();`.
- Props: `variant?: 'overlay' | 'inline'` for PDP vs card.

---

### `src/components/wishlist/wishlist-nav-link.tsx` (component, request-response)

**Analog:** `cart-nav-link.tsx` (badge UI) + `add-to-cart-button.tsx` (guest LS)

**Server badge** (lines 10-25):

```10:25:src/components/cart/cart-nav-link.tsx
export async function CartNavLink({ userId }: CartNavLinkProps) {
  const count = await getCartItemCount(userId);

  return (
    <Link
      href="/koszyk"
      className="relative inline-flex min-h-11 min-w-11 items-center justify-center rounded-md px-3 text-sm font-medium hover:bg-muted"
      aria-label={`Кошик${count > 0 ? `, ${count} товарів` : ""}`}
    >
      <ShoppingCart className="size-5" />
      {count > 0 ? (
        <Badge className="absolute -right-0.5 -top-0.5 min-w-5 justify-center px-1 text-[10px]">
          {count > 9 ? "9+" : count}
        </Badge>
      ) : null}
    </Link>
  );
}
```

**Wishlist:** `"use client"`; `href="/obrane"`; `Heart`; badge `count > 99 ? "99+" : count` (D-09-08); hide badge when 0. Props: `{ hasSession: boolean; initialCount?: number }`. If `!hasSession`: `getGuestWishlistCount()` + `wishlist:changed` listener. If `hasSession`: use `initialCount` only — **never** read guest LS (D-09-06).

**Header placement** — always render (unlike cart):

```40:44:src/components/layout/store-header.tsx
        <div className="flex items-center gap-2">
          {session?.user ? <CartNavLink userId={session.user.id} /> : null}
          <StoreHeaderAuth session={session} />
```

Add `<WishlistNavLink hasSession={Boolean(session?.user)} initialCount={...} />` before cart for all visitors.

---

### `src/components/wishlist/wishlist-grid.tsx` (component, CRUD)

**Analog:** `product-grid.tsx` + `koszyk/page.tsx` list

**Grid** (lines 14-19):

```14:19:src/components/catalog/product-grid.tsx
  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-4 md:gap-6">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
```

Wishlist: map `WishlistLineDto[]`; if `line.available` render normal card (or wishlist card with toggle); else `WishlistUnavailableCard`.

---

### `src/components/wishlist/wishlist-unavailable-card.tsx` (component, CRUD)

**Analog:** `cart-line-item.tsx` structure + muted copy

**Line layout** (lines 21-50):

```21:50:src/components/cart/cart-line-item.tsx
    <li className="flex gap-4 border-b border-border py-4 last:border-b-0">
      <Link
        href={`/tovar/${line.slug}`}
        className="relative block h-20 w-20 shrink-0 overflow-hidden rounded-md bg-muted sm:h-24 sm:w-24"
      >
        {line.image ? (
          <OptimizedImage
            src={line.image.cloudinaryPublicId}
            alt={line.image.alt ?? line.title}
            fill
            className="object-cover"
            sizes="96px"
          />
```

Show `Товар більше недоступний` (D-09-19); **no** `AddToCartButton`; keep `WishlistToggleButton` for manual remove.

---

### `src/components/wishlist/guest-wishlist-view.tsx` (component, request-response)

**Analog:** `add-to-cart-button.tsx` guest branch + `cart-empty.tsx`

**Empty state** (lines 5-16):

```5:16:src/components/cart/cart-empty.tsx
export function CartEmpty() {
  return (
    <div className="rounded-lg border border-dashed p-10 text-center">
      <h2 className="text-lg font-medium">Кошик порожній</h2>
      <p className="mt-2 text-sm text-muted-foreground">
        Додайте товари з каталогу — ми збережемо їх тут до оформлення.
      </p>
      <Link href="/katalog" className={cn(buttonVariants(), "mt-6 inline-flex")}>
        До каталогу
      </Link>
    </div>
  );
}
```

Client: `readGuestWishlist()` → `resolveWishlistProductsAction(ids)` in `useEffect`; render `WishlistGrid` or empty; Ukrainian copy for `/obrane`.

---

### `src/app/(storefront)/obrane/page.tsx` (route, request-response)

**Analog:** `katalog/page.tsx` (public, no `requireBuyer`) + `koszyk/page.tsx` (list layout)

**Public page** — katalog has no auth gate (lines 37-50). **Logged-in branch:** `auth.api.getSession` + `listWishlistForUser` like koszyk uses `getCartForUser` (koszyk lines 13-15):

```13:15:src/app/(storefront)/koszyk/page.tsx
export default async function CartPage() {
  const session = await requireBuyer("/koszyk");
  const cart = await getCartForUser(session.user.id);
```

`/obrane`: if `session?.user` → server `WishlistGrid`; else → `<GuestWishlistView />`. Metadata `title: "Обране"`.

---

### `src/app/(storefront)/layout.tsx` (config)

**Analog:** `src/app/(admin)/admin/layout.tsx`

```25:25:src/app/(admin)/admin/layout.tsx
      <Toaster richColors position="top-center" />
```

Add same Toaster to storefront layout (D-09-21/22). Import `Toaster` from `sonner` (admin) or `@/components/ui/sonner` (theme). **Keep** `CartPendingMergeGate` — do **not** add wishlist merge gate.

```14:28:src/app/(storefront)/layout.tsx
      <main id="main-content" className="flex-1">
        <NuqsAdapter>
          <Suspense fallback={null}>
            <ChatProviderGate>
              <CartPendingMergeGate />
              {children}
```

---

### `src/components/catalog/product-card.tsx` (component, modify)

**Analog:** Current file — restructure Link vs button (D-09-09)

**Problem — single wrapping Link** (lines 18-25):

```18:25:src/components/catalog/product-card.tsx
  return (
    <Link
      href={`/tovar/${product.slug}`}
      className="group block h-full"
      aria-label={`${product.title}, ${formatPriceKopiyky(product.price)}`}
    >
      <Card className="h-full overflow-hidden transition-shadow group-hover:shadow-md">
        <div className="relative aspect-[4/3] min-h-48 w-full bg-muted">
```

**Fix:** Outer `div` with `relative h-full`; `Link` wraps card content; `WishlistToggleButton` sibling `absolute right-2 top-2 z-10` on image container. New props: `productId`, `hasSession`, `initialInWishlist?`.

---

### `src/components/catalog/product-grid.tsx` + catalog pages (modify)

**Analog:** `tovar/[slug]/page.tsx` session wiring (lines 33-45, 88-92):

```33:45:src/app/(storefront)/tovar/[slug]/page.tsx
  const session = await auth.api.getSession({ headers: await headers() });
  const product = await getPublicProductBySlug(slug);
  // ...
  const inCart =
    session?.user?.id != null
      ? await isProductInCart(session.user.id, product.id)
      : false;
```

Catalog pages: when session, `getWishlistedProductIds(userId)` once per page; pass to `ProductCard` / grid. `hasSession={Boolean(session?.user)}`.

---

### `src/app/(storefront)/kabinet/page.tsx` (route, modify)

**Analog:** self — section pattern (lines 18-42)

```18:42:src/app/(storefront)/kabinet/page.tsx
  return (
    <div className="mx-auto max-w-2xl px-4 py-12 sm:px-6">
      <h1 className="text-2xl font-semibold">Особистий кабінет</h1>
      // ...
      <section className="mt-10">
        <h2 className="text-lg font-medium">Мої замовлення</h2>
```

Add section **«Обране»**: `listWishlistForUser` limited to 3 + `Link` «Дивитись усе» → `/obrane` (D-09-02).

---

### `src/components/layout/store-header.tsx` (component, modify)

**Analog:** lines 40-44 (see WishlistNavLink). Prefetch `getWishlistItemCount(session.user.id)` in RSC header when session; pass `initialCount` to client nav link.

---

## Shared Patterns

### Authentication (mutations only)

**Source:** `src/lib/permissions.ts` lines 6-16

```6:16:src/lib/permissions.ts
export async function requireBuyer(callbackPath = "/koszyk") {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    const safe = sanitizeCallbackUrl(callbackPath, "/koszyk");
    redirect(`/uviity?callbackUrl=${encodeURIComponent(safe)}`);
  }

  return session;
}
```

**Apply to:** `addToWishlistAction`, `removeFromWishlistAction` only. `/obrane` stays public (D-09-03).

### Session vs guest branching

**Source:** `add-to-cart-button.tsx` lines 51-59, 76-79

```51:59:src/components/cart/add-to-cart-button.tsx
    if (!hasSession) {
      addPendingProduct(productId);
      setInCart(true);
      const callbackUrl = encodeURIComponent(pathname || `/tovar/${productId}`);
      router.push(`/uviity?callbackUrl=${callbackUrl}`);
      return;
    }
```

Wishlist guest branch: storage + toast + sync state — **no redirect**.

### Sonner toasts

**Source:** `src/components/chat/chat-thread.tsx` lines 3-5, 100-103

```3:5:src/components/chat/chat-thread.tsx
import { useEffect, useRef, useState, useTransition } from "react";
import { ArrowLeft, MoreVertical } from "lucide-react";
import { toast } from "sonner";
```

```100:103:src/components/chat/chat-thread.tsx
        toast.success("Діалог архівовано");
      } else {
        toast.error("Не вдалося архівувати діалог");
```

**Apply to:** `WishlistToggleButton` — success add/remove; error max 20.

### Revalidation after mutations

**Source:** `cart.actions.ts` `revalidateCartPaths` — wishlist adds `/obrane`, `/kabinet`.

### Anti-pattern: login merge

**Source:** `cart-pending-merge.tsx` lines 12-26 — **FORBIDDEN**

```12:26:src/components/cart/cart-pending-merge.tsx
  useEffect(() => {
    if (ran.current) return;
    ran.current = true;

    const pending = readPending();
    if (pending.items.length === 0) return;

    void mergePendingCartAction(pending.items)
      .then(() => {
        clearPending();
        router.refresh();
      })
```

Do not create `WishlistPendingMerge` or layout gate.

---

## No Analog Found

| File | Role | Data Flow | Reason |
|------|------|-----------|--------|
| `src/lib/wishlist/wishlist-events.ts` | utility | pub-sub | No `CustomEvent` nav sync in repo yet |
| `guest-wishlist-view.tsx` | component | request-response | No client page that resolves LS IDs via server action |
| `wishlist-nav-link.tsx` (full) | component | hybrid | Cart nav is server-only; guest badge needs new client hybrid |

Planner: use RESEARCH.md Pattern 5/9 for hybrid `WishlistNavLink` and `wishlist:changed` event.

---

## Metadata

**Analog search scope:** `src/lib/cart/`, `src/components/cart/`, `src/server/actions/`, `src/server/services/`, `src/components/catalog/`, `src/app/(storefront)/`, `prisma/schema.prisma`, `src/components/chat/`, `src/app/(admin)/admin/layout.tsx`  
**Files scanned:** ~35  
**Pattern extraction date:** 2026-05-17

---

## PATTERN MAPPING COMPLETE

**Phase:** 9 - Wishlist  
**Files classified:** 24  
**Analogs found:** 22 / 24

### Coverage
- Files with exact analog: 14
- Files with role-match / partial analog: 8
- Files with no analog: 2 (`wishlist-events.ts`, full hybrid nav — partial guidance only)

### Key Patterns Identified
- Guest storage clones `pending-storage.ts` with explicit max result + toasts (not silent cap).
- Session path clones `cart.actions.ts` / `cart.service.ts` without merge and **without** auto-pruning unavailable lines.
- Toggle clones `AddToCartButton` but drops login redirect; adds Sonner + Heart overlay sibling to `Link`.
- Header badge: always visible; `99+` cap; strict `hasSession` branch (never read guest LS when logged in).
- Layout adds admin-style `Toaster`; **no** wishlist merge gate beside `CartPendingMergeGate`.

### File Created
`.planning/phases/09-wishlist/09-PATTERNS.md`

### Ready for Planning
Pattern mapping complete. Planner can reference analog patterns in PLAN.md files.
