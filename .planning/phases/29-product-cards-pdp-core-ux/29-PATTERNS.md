# Phase 29 — Pattern Map

**Phase:** 29-product-cards-pdp-core-ux  
**Mapped:** 2026-05-20

## Analog Files

| New / modified | Closest analog | Pattern to reuse |
|----------------|----------------|------------------|
| `product-card-image-stack.tsx` | `product-gallery.tsx` | Sorted images, `OptimizedImage` fill, opacity layers |
| `catalog.service.ts` card mapper | existing `mapToCard` | Prisma `include` + `take` limit |
| `add-to-cart-button.tsx` in-cart UI | `wishlist-toggle-button.tsx` overlay | Icon-only secondary action beside primary |
| `pdp-cart-fab.tsx` | `chat-fab.tsx` | `fixed bottom-* right-6`, `size-14`, safe-area padding |
| Lightbox Embla opts | thumbnail `Carousel` in gallery | Pass `opts` to shared `Carousel` |

## Data flow

```
listPublicProducts → mapToCard (previewImages[0..4]) → ProductCard → ProductCardImageStack (client hover)
getPublicProductBySlug → ProductGallery (lightbox opts) + AddToCartButton + PdpCartFab
```

## Integration excerpts

**ChatFab anchor** (`chat-fab.tsx`):

```tsx
className="fixed bottom-6 right-6 z-[60] flex size-14 ..."
```

**Cart count sources:**

- Session: `getCartItemCount(userId)` from `cart.service.ts`
- Guest: `getPendingItemCount()` from `pending-storage.ts` + `CART_CHANGED_EVENT`

**cardInclude today:**

```ts
images: { orderBy: { sortOrder: "asc" }, take: 1, select: { ... } }
```

→ change `take` to `5`, map to `previewImages`.
