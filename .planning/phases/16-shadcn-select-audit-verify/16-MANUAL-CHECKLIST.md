# Phase 16 — Manual Checklist (POL-01)

**Run after:** Plans 16-01 through 16-03 (Task 3)  
**Environment:** `npm run dev`, real product with 1 and 3+ images

| # | Route | Action | Expected | Pass |
|---|-------|--------|----------|------|
| 1 | `/tovar/{slug}` (1 image) | Open PDP | Main image renders; no layout break | ✓ |
| 2 | `/tovar/{slug}` (3+ images) | Open PDP | Thumb strip + main carousel; selecting thumb updates main | ✓ |
| 3 | `/tovar/{slug}` | Viewport ~375px | Gallery usable; thumbs scroll if needed | ✓ |
| 4 | `/tovar/{slug}` | Tap main image | Dialog/lightbox opens | ✓ |
| 5 | Dialog open | Use arrows + close | Navigate images in dialog; after close, main view matches last selection | ✓ |

**Notes:**

- Fix **blocking bugs only** in `product-gallery.tsx` (D-16-14).
- Swipe in dialog = nice-to-have, not required for pass (D-16-15).
- Reference: `.planning/phases/02-catalog-discovery/02-UI-SPEC.md` ProductGallery section.
