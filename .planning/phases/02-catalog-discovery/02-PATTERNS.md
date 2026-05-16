# Phase 2: Catalog & Discovery - Pattern Map

**Mapped:** 2026-05-17
**Files analyzed:** 28 (create/modify from `02-RESEARCH.md`)
**Analogs found:** 22 / 28

## File Classification

| New/Modified File | Role | Data Flow | Closest Analog | Match Quality |
|-------------------|------|-----------|----------------|---------------|
| `prisma/schema.prisma` | model | CRUD schema | `prisma/schema.prisma` (Category) | exact |
| `prisma/seed.ts` | migration/seed | batch | `prisma/seed.ts` (categories) | exact |
| `prisma/seed-products.ts` | migration/seed | batch | `prisma/seed.ts` (`seedCategories`) | exact |
| `src/server/services/catalog.service.ts` | service | CRUD + query | `src/components/home/category-grid.tsx` + `katalog/[slug]/page.tsx` | role-match |
| `src/server/services/catalog.service.test.ts` | test | unit | `src/lib/env.test.ts` | exact |
| `src/server/validators/product.ts` | utility | transform | `src/components/auth/auth-form.tsx` (Zod) | role-match |
| `src/types/catalog.ts` | model | transform | `src/lib/env.ts` (`AppEnv`) | partial |
| `src/lib/catalog/search-params.ts` | utility | request-response | — | **no analog** |
| `src/lib/catalog/search-params.test.ts` | test | unit | `src/lib/env.test.ts` | exact |
| `src/lib/catalog/format.ts` | utility | transform | — | **no analog** |
| `src/lib/env.ts` | config | — | `src/lib/env.ts` | exact (extend) |
| `src/app/(storefront)/layout.tsx` | provider | request-response | `src/app/layout.tsx` | partial |
| `src/app/(storefront)/katalog/page.tsx` | route | request-response + CRUD read | `src/components/home/category-grid.tsx` | role-match |
| `src/app/(storefront)/katalog/[slug]/page.tsx` | route | request-response + CRUD read | `src/app/(storefront)/katalog/[slug]/page.tsx` | exact |
| `src/app/(storefront)/tovar/[slug]/page.tsx` | route | request-response + CRUD read | `katalog/[slug]/page.tsx` + `hero-section.tsx` | role-match |
| `src/components/storefront/product-card.tsx` | component | transform | `src/components/home/category-grid.tsx` | role-match |
| `src/components/storefront/product-grid.tsx` | component | transform | `category-grid.tsx` (grid layout) | role-match |
| `src/components/storefront/catalog-filter-bar.tsx` | component | request-response | `src/components/auth/auth-form.tsx` | partial |
| `src/components/storefront/product-gallery.tsx` | component | transform | `src/components/home/hero-section.tsx` | role-match |
| `src/components/storefront/json-ld.tsx` | component | transform | — | **no analog** |
| `src/app/sitemap.ts` | route | batch read | — | **no analog** |
| `e2e/catalog-*.spec.ts` | test | e2e | `e2e/public-browse.spec.ts` | exact |
| `package.json` | config | — | `package.json` | exact (add deps) |

---

## Pattern Assignments

### `prisma/schema.prisma` (model, CRUD schema)

**Analog:** `prisma/schema.prisma` (existing `Category` + auth models)

**Category model pattern** (lines 78-86):

```prisma
model Category {
  id          String   @id @default(cuid())
  name        String
  slug        String   @unique
  description String?
  sortOrder   Int      @default(0)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}
```

**Conventions to copy:**
- `@id @default(cuid())` for app entities (not Better Auth string ids)
- `slug String @unique` for URL segments
- `@@index([status, categoryId])` style composites per `02-RESEARCH.md` (prefix `status` for public queries)

**Extend Category** with `products Product[]` relation only — do not rename existing fields.

---

### `prisma/seed.ts` + `prisma/seed-products.ts` (seed, batch)

**Analog:** `prisma/seed.ts`

**Imports + slugify** (lines 1-4, 17-25):

```typescript
import "dotenv/config";
import slugify from "slugify";
import { auth } from "../src/lib/auth";
import { prisma } from "../src/lib/db";

// inside seedCategories:
const slug = slugify(name, { lower: true, strict: true, locale: "uk" });
await prisma.category.upsert({
  where: { slug },
  create: { name, slug, sortOrder },
  update: { name, sortOrder },
});
```

**Lifecycle** (lines 54-67):

```typescript
async function main() {
  await seedCategories();
  await seedAdmin();
  console.log("Seed complete: 8 categories + admin user");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
```

**Product seed:** Same `upsert` by `slug`, `slugify(title, { locale: "uk", strict: true })`, split `seedProducts()` into `prisma/seed-products.ts` imported from `main()` if file grows. Reuse `HERO_PUBLIC_ID` pattern from `src/lib/demo-assets.ts` for `cloudinaryPublicId` list.

**Integration test analog:** `prisma/seed.test.ts` — add product count assertions alongside category count.

---

### `src/server/services/catalog.service.ts` (service, CRUD + query)

**Analog (query style):** `src/app/(storefront)/katalog/[slug]/page.tsx` + `src/components/home/category-grid.tsx`

**Direct Prisma read today** (`katalog/[slug]/page.tsx` lines 11-13):

```typescript
export default async function CategoryStubPage({ params }: PageProps) {
  const { slug } = await params;
  const category = await prisma.category.findUnique({ where: { slug } });
```

**List query pattern** (`category-grid.tsx` lines 10-13):

```typescript
const categories = await prisma.category.findMany({
  orderBy: { sortOrder: "asc" },
});
```

**Service layer target (from `.planning/research/ARCHITECTURE.md`):** Pure TS, no React imports; all public reads apply `status: "AVAILABLE"` in one `buildPublicProductWhere()`. Phase 2 pages should **stop importing `@/lib/db` directly** and call `listPublicProducts` / `getPublicProductBySlug` instead (ARCHITECTURE Pattern 1).

**N+1 card thumbnail** (from RESEARCH — implement in service):

```typescript
include: {
  images: { orderBy: { sortOrder: "asc" }, take: 1 },
  category: { select: { name: true, slug: true } },
}
```

**Error / null handling:** Return `null` from `getPublicProductBySlug` for missing/SOLD/DRAFT; pages call `notFound()` (not used in codebase yet — see PDP page pattern below).

---

### `src/server/services/catalog.service.test.ts` (test, unit)

**Analog:** `src/lib/env.test.ts`

```typescript
import { describe, expect, it } from "vitest";

describe("parseEnv", () => {
  it("parses valid env", () => {
    expect(parseEnv(validEnv).NEXT_PUBLIC_APP_URL).toBe(
      "http://localhost:3000",
    );
  });
});
```

**Also reference:** `prisma/seed.test.ts` for DB-backed tests if service tests need seeded fixtures:

```typescript
import { prisma } from "../src/lib/db";

describe("seed data", () => {
  it("has 8 categories", async () => {
    const count = await prisma.category.count();
    expect(count).toBe(8);
  });
});
```

Prefer **pure unit tests** for `buildPublicProductWhere()` (no DB) + optional integration tests after seed.

---

### `src/server/validators/product.ts` (utility, transform)

**Analog:** `src/components/auth/auth-form.tsx` (Zod schemas)

```typescript
import { z } from "zod";

const loginSchema = z.object({
  email: z.string().email("Введіть коректний email"),
  password: z.string().min(1, "Введіть пароль"),
});
```

**Env schema pattern** (`src/lib/env.ts` lines 3-14) for bounded filters:

```typescript
const envSchema = z.object({
  NEXT_PUBLIC_APP_URL: z.string().url(),
  // ...
});
```

**Apply:** `ProductCondition` / `ProductStatus` enums as `z.enum([...])`, price bounds `z.number().int().min(0).max(...)`, max `take` capped at 24 server-side.

---

### `src/lib/catalog/search-params.ts` (utility, request-response)

**Analog:** None in codebase (nuqs not installed).

**Fallback:** `02-RESEARCH.md` Pattern 2 + Next.js async `searchParams` on pages. After install, mirror:

```typescript
import {
  createSearchParamsCache,
  parseAsInteger,
  parseAsString,
  parseAsStringEnum,
} from "nuqs/server";

export const catalogParsers = {
  q: parseAsString.withDefault(""),
  brand: parseAsString,
  min: parseAsInteger,
  max: parseAsInteger,
  stan: parseAsStringEnum(["LIKE_NEW", "GOOD", "FAIR"] as const),
  cursor: parseAsString,
};

export const catalogSearchParamsCache = createSearchParamsCache(catalogParsers);
```

**Page consumption** (target — replace direct `searchParams` access):

```typescript
type PageProps = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<SearchParams>;
};
const filters = await catalogSearchParamsCache.parse(searchParams);
```

---

### `src/lib/catalog/format.ts` (utility, transform)

**Analog:** None (new).

**UI conventions to align with:** Ukrainian copy in pages (`katalog/[slug]/page.tsx`), `Badge` for condition labels (`02-UI-SPEC.md`). Export `formatPriceKopiyky(kop: number): string` and `conditionLabelUa(condition)` — keep formatting out of components.

---

### `src/lib/env.ts` (config)

**Analog:** `src/lib/env.ts`

```typescript
const envSchema = z.object({
  NEXT_PUBLIC_APP_URL: z.string().url(),
  // ...
  ADMIN_EMAIL: z.string().email().optional(),
  ADMIN_PASSWORD: z.string().min(8).optional(),
});
```

**Phase 2 add:** `STORE_ADDRESS`, `STORE_PHONE`, optional `SEED_CLOUDINARY_PUBLIC_IDS` per RESEARCH open questions — optional fields with `.optional()` like admin creds.

---

### `src/app/(storefront)/layout.tsx` (provider)

**Analog:** `src/app/layout.tsx` (root shell) + storefront composition

**Storefront shell today** (lines 4-17):

```typescript
export default function StorefrontLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <StoreHeader />
      <main id="main-content" className="flex-1">
        {children}
      </main>
      <StoreFooter />
    </>
  );
}
```

**Add NuqsAdapter** inside this layout (wrap `children` only, not header/footer):

```typescript
import { NuqsAdapter } from "nuqs/adapters/next/app";

// ...
<main id="main-content" className="flex-1">
  <NuqsAdapter>{children}</NuqsAdapter>
</main>
```

---

### `src/app/(storefront)/katalog/page.tsx` (route, request-response)

**Analog:** `src/components/home/category-grid.tsx` (grid + max-width) + future filter bar

**Layout container** (category-grid lines 16-18):

```typescript
<section id="kategorii" className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
  <h2 className="mb-6 text-2xl font-semibold">Категорії</h2>
  <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
```

**Catalog grid:** Use `grid-cols-2 md:grid-cols-4` per UI-SPEC (product cards 4:3), not category 2-col only.

**Metadata** (static, like home — `src/app/(storefront)/page.tsx` lines 6-10):

```typescript
export const metadata: Metadata = {
  title: "Головна",
  description: "Б/у побутова техніка у Львові — ...",
};
```

Use `title: "Каталог"` or template from root `%s | Техніка б/у Львів`.

---

### `src/app/(storefront)/katalog/[slug]/page.tsx` (route, request-response)

**Analog:** Same file (replace stub)

**Async params** (lines 7-13) — keep:

```typescript
type PageProps = {
  params: Promise<{ slug: string }>;
};

export default async function CategoryStubPage({ params }: PageProps) {
  const { slug } = await params;
```

**Upgrade missing category:** Replace inline «не знайдено» UI (lines 15-27) with `notFound()` from `next/navigation` for SEO consistency with PDP (RESEARCH Pattern 4). Current soft-404 is Phase 1 stub only.

**Stub content to remove** (lines 29-44): `Badge` «Незабаром» → `ProductGrid` + `CatalogFilterBar`.

**generateMetadata** (no codebase example — compose from static page + admin robots):

```typescript
// Analog: src/app/(admin)/admin/layout.tsx
export const metadata: Metadata = {
  title: "Адмін-панель",
  robots: { index: false, follow: false },
};
```

Target for category:

```typescript
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const category = await getCategoryBySlug(slug);
  if (!category) return { title: "Категорію не знайдено" };
  return {
    title: `${category.name} — б/у техніка Львів`,
    description: category.description ?? `Б/у ${category.name} у Львові.`,
  };
}
```

**Filtered URLs:** `robots: { index: false, follow: true }` when query params present (RESEARCH SEO section).

---

### `src/app/(storefront)/tovar/[slug]/page.tsx` (route, request-response)

**Analog:** `katalog/[slug]/page.tsx` (slug resolve) + `hero-section.tsx` (gallery image)

**Slug resolve:** Same `params: Promise<{ slug: string }>` + `await params`.

**Gallery / image** (`hero-section.tsx` lines 25-33):

```typescript
<div className="relative aspect-[16/10] overflow-hidden rounded-xl border border-border bg-muted">
  <OptimizedImage
    src={HERO_PUBLIC_ID}
    alt="..."
    fill
    priority
    className="object-cover"
    sizes="(max-width: 1024px) 100vw, 50vw"
  />
</div>
```

PDP: `aspect-[4/3]` per `02-UI-SPEC.md`; map `product.images[].cloudinaryPublicId` to `OptimizedImage` `src`.

**notFound:**

```typescript
import { notFound } from "next/navigation";

const product = await getPublicProductBySlug(slug);
if (!product) notFound();
```

**generateMetadata + JSON-LD:** See `json-ld.tsx` below; metadata uses product title/brand/description slice.

---

### `src/components/storefront/product-card.tsx` (component, transform)

**Analog:** `src/components/home/category-grid.tsx`

**Card + Link** (lines 19-28):

```typescript
{categories.map((category) => (
  <Link key={category.id} href={`/katalog/${category.slug}`}>
    <Card className="h-full transition-shadow hover:shadow-md">
      <CardHeader>
        <CardTitle className="text-base">{category.name}</CardTitle>
        <CardDescription>Переглянути</CardDescription>
      </CardHeader>
    </Card>
  </Link>
))}
```

**Product card changes:** `href={`/tovar/${product.slug}`}`; add `OptimizedImage` in card (first image); `Badge` for condition (`src/app/(storefront)/katalog/[slug]/page.tsx` line 31 uses `Badge variant="secondary"`); price via `format.ts`.

**Server vs client:** Keep as **Server Component** (no `"use client"`) — pass serialized product DTO from page.

---

### `src/components/storefront/product-grid.tsx` (component, transform)

**Analog:** `category-grid.tsx` grid wrapper

```typescript
<div className="grid grid-cols-2 gap-4 md:grid-cols-4">
```

Empty state: copy pattern from katalog stub centered block (`max-w-2xl`, `text-muted-foreground`, link with `buttonVariants()`).

---

### `src/components/storefront/catalog-filter-bar.tsx` (component, request-response)

**Analog:** `src/components/auth/auth-form.tsx` (client interactivity)

**Client directive** (line 1):

```typescript
"use client";
```

**State + submit** (lines 37-78):

```typescript
const [error, setError] = useState<string | null>(null);
const onSubmit = form.handleSubmit(async (values) => {
  setError(null);
  // ...
  router.push("/kabinet");
  router.refresh();
});
```

**nuqs instead of react-hook-form:** `useQueryStates(catalogParsers, { shallow: false })` per RESEARCH — `shallow: false` is mandatory so RSC list re-fetches.

**UI primitives:** `Label`, `Input`, `Button` from `@/components/ui/*`; optional `Select`, `Slider` per UI-SPEC shadcn add list.

---

### `src/components/storefront/product-gallery.tsx` (component, transform)

**Analog:** `src/components/home/hero-section.tsx` + `src/components/media/optimized-image.tsx`

**OptimizedImage wrapper** (`optimized-image.tsx` lines 1-22):

```typescript
"use client";

import { CldImage, type CldImageProps } from "next-cloudinary";

export function OptimizedImage({ alt, sizes, ...props }: OptimizedImageProps) {
  return (
    <CldImage
      alt={alt}
      format="auto"
      quality="auto"
      sizes={sizes ?? "(max-width: 1024px) 100vw, 50vw"}
      {...props}
    />
  );
}
```

Gallery can be Server Component wrapping `OptimizedImage` if no client state; use `"use client"` only for thumb selection state.

---

### `src/components/storefront/json-ld.tsx` (component, transform)

**Analog:** None in codebase.

**Pattern source:** `02-RESEARCH.md` + Next.js JSON-LD guide (cited in RESEARCH). Server Component only:

```tsx
<script
  type="application/ld+json"
  dangerouslySetInnerHTML={{
    __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c"),
  }}
/>
```

Use `schema-dts` types `WithContext<Product>`. Export helper `JsonLd({ data }: { data: object })` to avoid duplicating escape logic on home + PDP.

---

### `src/app/sitemap.ts` (route, batch read)

**Analog:** None.

**Read pattern:** `prisma.category.findMany` + `prisma.product.findMany({ where: { status: "AVAILABLE" } })` — same as `category-grid` / catalog service.

**Conventions:** Next.js `MetadataRoute.Sitemap` export default function; `baseUrl` from `getEnv().NEXT_PUBLIC_APP_URL`; exclude `/admin`, auth routes, SOLD/DRAFT products.

---

### `e2e/catalog-*.spec.ts` (test, e2e)

**Analog:** `e2e/public-browse.spec.ts`

```typescript
import { expect, test } from "@playwright/test";

test("guest can browse home and category stub", async ({ page }) => {
  await page.goto("/");
  const categoryLinks = page.locator('#kategorii a[href^="/katalog/"]');
  await expect(categoryLinks.first()).toBeVisible();
  await expect(categoryLinks).toHaveCount(8);

  await page.goto("/katalog/kholodylnyky");
  await expect(
    page.locator("main").getByText("Незабаром", { exact: true }),
  ).toBeVisible();
});
```

**Extend:** URL assertions (`toHaveURL(/stan=GOOD/)`), `getByText("Продано").toHaveCount(0)`, `script[type="application/ld+json"]` for SEO-02. Keep Ukrainian copy in assertions.

---

## Shared Patterns

### Prisma singleton

**Source:** `src/lib/db.ts`  
**Apply to:** `catalog.service.ts`, seed, tests

```typescript
import { PrismaNeon } from "@prisma/adapter-neon";
import { PrismaClient } from "@/generated/prisma/client";

export const prisma = globalForPrisma.prisma ?? createPrismaClient();
```

Services import `prisma` from `@/lib/db` — never instantiate second client.

---

### Async `params` / `searchParams` (Next 16)

**Source:** `src/app/(storefront)/katalog/[slug]/page.tsx`  
**Apply to:** All dynamic catalog/PDP pages + `generateMetadata`

```typescript
type PageProps = {
  params: Promise<{ slug: string }>;
};
const { slug } = await params;
```

Add `searchParams: Promise<...>` on list pages; always `await` before parse.

---

### Static page metadata + title template

**Source:** `src/app/layout.tsx` + `src/app/(storefront)/page.tsx`

```typescript
// Root layout
export const metadata: Metadata = {
  title: {
    default: "Техніка б/у Львів",
    template: "%s | Техніка б/у Львів",
  },
};

// Child page
export const metadata: Metadata = {
  title: "Головна",
  description: "...",
};
```

Child `title` strings become `"Каталог"`, `"Вхід"`, etc. Dynamic pages use `generateMetadata` returning `title` string (template applies automatically).

---

### Storefront layout width & spacing

**Source:** `src/components/home/category-grid.tsx`, `store-header.tsx`

```typescript
className="mx-auto max-w-6xl px-4 py-12 sm:px-6"
```

Apply to catalog headers, filter bars, PDP sections — matches Phase 1 «повітряний» shell.

---

### Cloudinary delivery (PERF-01)

**Source:** `src/components/media/optimized-image.tsx`, `src/lib/demo-assets.ts`

```typescript
export const HERO_PUBLIC_ID = "samples/ecommerce/leather-bag-gray";
// OptimizedImage: src={publicId}, alt required, fill + sizes for responsive
```

Product images store `cloudinaryPublicId` only in DB; never build manual CDN URLs in components.

---

### Ukrainian UI copy

**Source:** All storefront pages/components  
**Apply to:** Empty states, filter labels, condition badges («Відмінний», «Добрий», «Задовільний» per RESEARCH enum mapping)

No English user-facing strings on storefront routes.

---

### Auth boundary (not for Phase 2 catalog)

**Source:** `src/lib/permissions.ts`  
**Apply to:** Phase 4 admin only — public catalog has **no** `requireAdmin()`.

```typescript
export async function requireAdmin() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user || session.user.role !== "admin") {
    redirect("/uviity");
  }
  return session;
}
```

Catalog routes remain public (Phase 1 D-13).

---

### Path alias imports

**Source:** Throughout `src/`

```typescript
import { prisma } from "@/lib/db";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
```

No relative `../../` from `src/app` — use `@/` prefix consistently.

---

## No Analog Found

| File | Role | Data Flow | Reason |
|------|------|-----------|--------|
| `src/lib/catalog/search-params.ts` | utility | request-response | `nuqs` not installed; no URL state library in repo |
| `src/lib/catalog/format.ts` | utility | transform | No price/condition formatters yet |
| `src/components/storefront/json-ld.tsx` | component | transform | No JSON-LD in Phase 1 |
| `src/app/sitemap.ts` | route | batch read | No sitemap/robots route files |
| `generateMetadata` on catalog/PDP | route metadata | — | Only static `metadata` exports exist; use RESEARCH + admin `robots` as compose guide |

**Planner action:** For no-analog files, follow `02-RESEARCH.md` code examples and Next.js 16 docs in `node_modules/next/dist/docs/` (per AGENTS.md).

---

## Metadata

**Analog search scope:** `src/app/(storefront)/`, `src/components/`, `src/lib/`, `prisma/`, `e2e/`, `.planning/research/ARCHITECTURE.md`  
**Files scanned:** 51 TypeScript/TSX files in repo  
**Pattern extraction date:** 2026-05-17

---

## PATTERN MAPPING COMPLETE

**Phase:** 2 - Catalog & Discovery  
**Files classified:** 28  
**Analogs found:** 22 / 28

### Coverage
- Files with exact analog: 10
- Files with role-match analog: 12
- Files with no analog: 6

### Key Patterns Identified
- RSC pages use `await params` (Promise API) and should migrate reads from inline `prisma` to `server/services/catalog.service.ts` per ARCHITECTURE.md.
- Grid/card UI copies `category-grid.tsx` + `Card`/`Link`; images use `OptimizedImage` + `demo-assets` public_id pattern.
- Seeds use `slugify` + `upsert` by `slug` exactly like Phase 1 categories.
- Client interactivity follows `auth-form.tsx` (`"use client"`, local state); catalog filters use nuqs with `shallow: false` (new dependency).
- Metadata: static `export const metadata` on list pages; dynamic `generateMetadata` composed from admin layout `robots` pattern + root title template.
- Tests: Vitest style from `env.test.ts`; Playwright from `public-browse.spec.ts`.

### File Created
`.planning/phases/02-catalog-discovery/02-PATTERNS.md`

### Ready for Planning
Pattern mapping complete. Planner can reference analog patterns in PLAN.md files.
