# Phase 23: Pattern Map

**Mapped:** 2026-05-19

## Files to modify

| File | Role | Closest analog |
|------|------|----------------|
| `src/app/(admin)/admin/kategorii/[id]/page.tsx` | Edit toolbar | `src/app/(admin)/admin/kategorii/page.tsx` (Plus + label) |
| `src/components/admin/admin-categories-table.tsx` | List table cell + row | `src/components/admin/admin-products-table.tsx` + `product-list-delete-button.tsx` |

## Analog excerpts

### Icon + label button (list header)

```14:17:src/app/(admin)/admin/kategorii/page.tsx
        <Button render={<Link href="/admin/kategorii/novyi" />}>
          <Plus className="size-4" aria-hidden />
          Додати категорію
        </Button>
```

### stopPropagation in clickable row

```41:41:src/components/admin/product-list-delete-button.tsx
  const stopRowNav = (event: MouseEvent) => event.stopPropagation();
```

### Category filter URL builder

```24:32:src/lib/admin/products-url.ts
export function adminProductsUrl(params: AdminProductsUrlParams = {}): string {
  const searchParams = new URLSearchParams();
  // ...
  if (params.categoryId != null) {
    searchParams.set("categoryId", params.categoryId);
  }
```

### Row props (preserve)

```37:40:src/components/admin/admin-categories-table.tsx
            const rowProps = getAdminClickableRowProps({
              href,
              onNavigate: (target) => router.push(target),
            });
```

## PATTERN MAPPING COMPLETE
