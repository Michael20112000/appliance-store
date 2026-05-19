# Phase 16 — Pattern Map

**Phase:** Shadcn Select Audit & Verify  
**Generated:** 2026-05-19

## File → Analog Map

| Target file | Role | Closest analog | Excerpt pattern |
|-------------|------|--------------|-----------------|
| `catalog-toolbar.tsx` | Storefront controlled Select + nuqs | `order-list-status-select.tsx` (controlled value/onValueChange) | `Select` + `setParams` instead of server action |
| `catalog-filters.tsx` | Nullable filter + sentinel | `catalog-toolbar.tsx` (after 16-01) | `value={params.brend ?? SENTINEL}` |
| `product-form.tsx` | RHF Controller + Select | `product-list-status-select.tsx` + RHF `Input` layout | `Controller` render prop with `SelectTrigger className="w-full"` |

## catalog-toolbar.tsx — nuqs controlled Select

**Analog:** `src/components/admin/order-list-status-select.tsx`

```tsx
<Select
  value={params.sort}
  onValueChange={(value) =>
    setParams({
      sort: value as "novi" | "cina-asc" | "cina-desc",
      storinka: 1,
    })
  }
>
  <SelectTrigger className="w-36" aria-label="Сортування">
    <SelectValue />
  </SelectTrigger>
  <SelectContent>
    <SelectItem value="novi">Новіші</SelectItem>
    ...
  </SelectContent>
</Select>
```

## catalog-filters.tsx — brand sentinel

```tsx
const ALL_BRANDS = "__all__";

<Select
  value={params.brend ?? ALL_BRANDS}
  onValueChange={(value) =>
    setParams({
      brend: value === ALL_BRANDS ? null : value,
      storinka: 1,
    })
  }
>
  <SelectTrigger className="w-full">
    <SelectValue placeholder="Усі бренди" />
  </SelectTrigger>
  <SelectContent>
    <SelectItem value={ALL_BRANDS}>Усі бренди</SelectItem>
    {brands.map((brand) => (
      <SelectItem key={brand} value={brand}>{brand}</SelectItem>
    ))}
  </SelectContent>
</Select>
```

## product-form.tsx — Controller

```tsx
<Controller
  name="categoryId"
  control={form.control}
  render={({ field }) => (
    <Select value={field.value} onValueChange={field.onChange}>
      <SelectTrigger id="categoryId" className="w-full">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {categories.map((c) => (
          <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
        ))}
      </SelectContent>
    </Select>
  )}
/>
```

Repeat for `condition` and `status` with UA labels.

## PATTERN MAPPING COMPLETE
