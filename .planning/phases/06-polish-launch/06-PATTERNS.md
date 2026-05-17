# Phase 6: Polish & Launch - Pattern Map

**Mapped:** 2026-05-17  
**Files analyzed:** 14 (new/modify/verify)  
**Analogs found:** 11 / 14

## File Classification

| New/Modified File | Role | Data Flow | Closest Analog | Match Quality |
|-------------------|------|-----------|----------------|---------------|
| `.github/workflows/ci.yml` | config | batch (CI pipeline) | — | **no analog** |
| `src/app/robots.ts` | route | request-response | `src/app/sitemap.ts` | exact |
| `e2e/critical-journey.spec.ts` | test | request-response | `e2e/checkout.spec.ts` + `e2e/orders-history.spec.ts` | exact |
| `e2e/catalog-seo.spec.ts` | test | request-response | `e2e/catalog-seo.spec.ts` (extend) + `e2e/locale.spec.ts` + `e2e/product-pdp.spec.ts` | exact |
| `e2e/smoke-deploy.spec.ts` | test | request-response | `e2e/smoke-deploy.spec.ts` (extend) + `e2e/public-browse.spec.ts` | exact |
| `e2e/helpers/catalog.ts` | utility | — | *(reuse as-is)* | exact |
| `e2e/helpers/admin.ts` | utility | — | *(reuse as-is)* | exact |
| `e2e/helpers/pusher.ts` | utility | — | *(reuse as-is)* | exact |
| `playwright.config.ts` | config | — | *(preserve)* | exact |
| `package.json` (scripts) | config | — | *(preserve)* | exact |
| `src/app/sitemap.ts` | route | CRUD (read DB → XML) | *(verify only)* | exact |
| `src/components/media/optimized-image.tsx` | component | transform (CDN) | `src/components/catalog/product-gallery.tsx` | exact |
| `.env.example` | config | — | `.env.example` (extend) | exact |
| `06-ENV-CHECKLIST.md` / `06-VERIFICATION.md` | docs | — | `.planning/phases/05-realtime-chat/05-VERIFICATION.md` | role-match |

---

## Pattern Assignments

### `.github/workflows/ci.yml` (config, batch)

**Analog:** None in repo (0 workflows). Compose from `playwright.config.ts` + `package.json` scripts + RESEARCH Pattern 1.

**Scripts to chain** (from `package.json`):

```5:12:package.json
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "eslint",
    "test": "vitest run",
    "test:e2e": "playwright test",
```

**Playwright CI contract** (preserve — do not weaken D-06-26):

```6:30:playwright.config.ts
export default defineConfig({
  testDir: "./e2e",
  globalSetup: "./e2e/global-setup.js",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  // ...
  webServer: process.env.PLAYWRIGHT_BASE_URL
    ? undefined
    : {
        command: "npm run dev",
        url: baseURL,
        reuseExistingServer: !process.env.CI,
      },
});
```

**Global setup** (CI must provide `DATABASE_URL` / `DIRECT_URL` — seed runs before tests):

```1:9:e2e/global-setup.js
const { execSync } = require("node:child_process");

module.exports = async function globalSetup() {
  execSync("npx prisma db seed", {
    cwd: process.cwd(),
    stdio: "inherit",
    env: process.env,
  });
};
```

**CI env pattern (from RESEARCH — adapt secrets names):**

- `CI: true` (enables `forbidOnly`, retries, single worker)
- `BETTER_AUTH_URL` / `NEXT_PUBLIC_APP_URL`: `http://localhost:3000`
- `DATABASE_URL`, `DIRECT_URL`: GitHub Secrets (Neon CI branch, not prod)
- `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME`: required for app boot
- Pusher / full Cloudinary API: optional — optional specs skip

**Steps order (D-06-23):** `npm ci` → `npm run lint` → `npm test` → `npx playwright install --with-deps chromium` → `npx playwright test` (or `npm run test:e2e`).

**Consider:** `npx prisma migrate deploy` before seed if CI DB is fresh (RESEARCH A1).

---

### `src/app/robots.ts` (route, request-response)

**Analog:** `src/app/sitemap.ts`

**Imports + base URL normalization** (lines 1-9):

```1:9:src/app/sitemap.ts
import type { MetadataRoute } from "next";
import { getEnv } from "@/lib/env";
import {
  listCategories,
  listPublicProductSlugsForSitemap,
} from "@/server/services/catalog.service";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = getEnv().NEXT_PUBLIC_APP_URL.replace(/\/$/, "");
```

**Robots pattern to implement** (sync with RESEARCH Pattern 3 — same `getEnv()` + `MetadataRoute.Robots`):

```typescript
import type { MetadataRoute } from "next";
import { getEnv } from "@/lib/env";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = getEnv().NEXT_PUBLIC_APP_URL.replace(/\/$/, "");
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/admin", "/api/"],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
```

---

### `e2e/critical-journey.spec.ts` (test, request-response)

**Analog:** `e2e/checkout.spec.ts` (happy path) + `e2e/orders-history.spec.ts` (post-order assertion)

**Imports + catalog helpers** (checkout lines 1-5):

```1:5:e2e/checkout.spec.ts
import { expect, test } from "@playwright/test";
import {
  addCurrentProductToCart,
  openFirstCatalogProduct,
} from "./helpers/catalog";
```

**Registration → catalog → cart → checkout** (lines 7-28):

```7:28:e2e/checkout.spec.ts
test("buyer can checkout with pickup", async ({ page }) => {
  const email = `checkout-${Date.now()}@example.com`;

  await page.goto("/reiestratsiia");
  await page.getByLabel("Імʼя").fill("Checkout Тест");
  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Пароль", { exact: true }).fill("password123");
  await page.getByLabel("Підтвердіть пароль").fill("password123");
  await page.getByRole("button", { name: "Створити обліковий запис" }).click();
  await expect(page).toHaveURL(/\/kabinet/);

  await openFirstCatalogProduct(page);
  await addCurrentProductToCart(page);

  await page.goto("/zamovlennia");
  await page.getByLabel("Ім'я та прізвище").fill("Checkout Тест");
  await page.getByLabel("Телефон").fill("+380501112233");
  await page.getByLabel("Самовивіз (м. Львів)").check();
  await page.getByRole("button", { name: "Підтвердити замовлення" }).click();

  await expect(page).toHaveURL(/\/zamovlennia\/pidtverdzhennia\/ASL-/);
```

**Unique marker (D-06-03):** Fill notes before submit — label in form is `Коментар (необов'язково)`:

```101:108:src/components/checkout/checkout-form.tsx
      <motion.div className="space-y-2">
        <Label htmlFor="notes">Коментар (необов'язково)</Label>
        <textarea
          id="notes"
          rows={3}
          className="flex min-h-[80px] w-full rounded-lg border border-input bg-transparent px-2.5 py-2 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
          {...form.register("notes")}
        />
```

**Planner note:** Confirmation page does **not** render `order.notes` — only order number and totals:

```28:45:src/app/(storefront)/zamovlennia/pidtverdzhennia/[orderNumber]/page.tsx
  return (
    <motion.div className="mx-auto max-w-2xl px-4 py-12 sm:px-6">
      <h1 className="text-3xl font-semibold tracking-tight">
        Дякуємо за замовлення!
      </h1>
      <p className="mt-4 text-muted-foreground">
        Номер замовлення:{" "}
        <span className="font-medium text-foreground">{order.orderNumber}</span>
      </p>
      // ... no notes field
```

**Assertion options for marker:**
1. Capture `ASL-…` from URL after redirect (required).
2. Optional: `page.goto("/kabinet")` and assert order list — pattern from `orders-history.spec.ts` (lines 27-31).
3. Do **not** `expect(page.getByText(marker))` on confirmation unless UI is extended.

**Catalog helper reuse** (`e2e/helpers/catalog.ts` lines 3-28):

```3:28:e2e/helpers/catalog.ts
export async function openFirstCatalogProduct(page: Page) {
  await page.goto("/katalog");
  const productLink = page.locator('main a[href^="/tovar/"]').first();
  await expect(productLink).toBeVisible({ timeout: 15_000 });
  // ...
}

export async function addCurrentProductToCart(page: Page) {
  const addButton = page.getByRole("button", { name: /Додати в кошик/i });
  await addButton.click();
  // ... poll /koszyk for ₴
}
```

---

### `e2e/catalog-seo.spec.ts` (test, request-response) — EXTEND

**Analog:** Existing file + `e2e/locale.spec.ts` + `e2e/product-pdp.spec.ts`

**Existing JSON-LD Product test** (lines 3-14):

```3:14:e2e/catalog-seo.spec.ts
test("PDP includes Product JSON-LD", async ({ page }) => {
  await page.goto("/katalog/kholodylnyky");
  const href = await page.locator('main a[href^="/tovar/"]').first().getAttribute("href");
  expect(href).toBeTruthy();

  await page.goto(href!);

  const jsonLd = page.locator('script[type="application/ld+json"]');
  await expect(jsonLd).toHaveCount(1);
  const content = await jsonLd.textContent();
  expect(content).toContain('"@type":"Product"');
});
```

**Extend for UsedCondition** — assert against `product-json-ld.ts` mapping:

```10:14:src/lib/catalog/product-json-ld.ts
const CONDITION_MAP = {
  LIKE_NEW: "https://schema.org/RefurbishedCondition",
  GOOD: "https://schema.org/UsedCondition",
  FAIR: "https://schema.org/UsedCondition",
} as const;
```

Example assertion: `expect(content).toMatch(/UsedCondition|RefurbishedCondition/)`.

**lang="uk"** — copy from `locale.spec.ts` (avoid drift: extract shared helper or duplicate one-liner):

```3:7:e2e/locale.spec.ts
test("ukrainian locale defaults", async ({ page }) => {
  await page.goto("/");
  const lang = await page.locator("html").getAttribute("lang");
  expect(lang).toBe("uk");
```

Source of truth in layout:

```24:24:src/app/layout.tsx
    <html lang="uk" className={cn("h-full", GeistSans.className, "font-sans", geist.variable)}>
```

**Sitemap tests** — extend existing (lines 21-28) + sold slug constant from PDP spec:

```3:4:e2e/product-pdp.spec.ts
// SOLD slug from seed-products.ts (Samsung Холодильник SOLD demo)
const SOLD_SLUG = "samsung-kholodylnyk-sold-demo-sold";
```

```21:28:e2e/catalog-seo.spec.ts
test("sitemap lists catalog and product URLs, not admin", async ({ request }) => {
  const response = await request.get("/sitemap.xml");
  expect(response.ok()).toBeTruthy();
  const body = await response.text();
  expect(body).toContain("/katalog/");
  expect(body).toContain("/tovar/");
  expect(body).not.toContain("/admin");
});
```

**Add (D-06-10):**
- `expect(body).not.toContain(\`/tovar/${SOLD_SLUG}\`)` — service already filters `AVAILABLE` only:

```186:192:src/server/services/catalog.service.ts
export async function listPublicProductSlugsForSitemap(): Promise<string[]> {
  const rows = await prisma.product.findMany({
    where: { status: PUBLIC_STATUS },
    select: { slug: true },
    orderBy: { updatedAt: "desc" },
  });
  return rows.map((r) => r.slug);
}
```

- Parse first `<loc>…/tovar/…</loc>` and `request.get(pathname)` → `ok()`.

**Home LocalBusiness (manual D-06-11):** reference implementation:

```19:32:src/app/(storefront)/page.tsx
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "LocalBusiness",
          name: store.name,
          address: {
            "@type": "PostalAddress",
            addressLocality: "Львів",
```

---

### `e2e/smoke-deploy.spec.ts` (test, request-response) — EXTEND

**Analog:** `e2e/smoke-deploy.spec.ts` + `e2e/public-browse.spec.ts`

**Existing home smoke** (lines 3-7):

```3:7:e2e/smoke-deploy.spec.ts
test("home page loads", async ({ page }) => {
  const response = await page.goto("/");
  expect(response?.status()).toBe(200);
  await expect(page.locator("h1")).toContainText("Б/у побутова техніка");
});
```

**Add catalog smoke** (from `public-browse.spec.ts`):

```9:10:e2e/public-browse.spec.ts
  await page.goto("/katalog/kholodylnyky");
  await expect(page.locator('main a[href^="/tovar/"]').first()).toBeVisible();
```

**Add robots/sitemap API checks** (use `request` fixture like `catalog-seo.spec.ts`):

```typescript
test("robots.txt references sitemap", async ({ request }) => {
  const res = await request.get("/robots.txt");
  expect(res.ok()).toBeTruthy();
  const body = await res.text();
  expect(body).toMatch(/Sitemap:/i);
});
```

**Remote run (D-06-17):** `PLAYWRIGHT_BASE_URL=https://<prod>` disables `webServer` — run only this file:

```bash
PLAYWRIGHT_BASE_URL=https://your-domain.vercel.app npx playwright test e2e/smoke-deploy.spec.ts
```

---

### `playwright.config.ts` (config) — PRESERVE

**Analog:** Self (no changes unless explicitly needed)

Key behaviors for Phase 6:
- `import "dotenv/config"` at top (loads `.env` for local + CI when secrets injected)
- `PLAYWRIGHT_BASE_URL` → skip `webServer` (production smoke)
- `forbidOnly: !!process.env.CI` (D-06-26)
- `globalSetup` always seeds DB

---

### `package.json` scripts (config) — PRESERVE

**Analog:** Current scripts sufficient for D-06-01 gate:

| Command | Purpose |
|---------|---------|
| `npm test` | Vitest unit gate |
| `npm run test:e2e` | Full `e2e/` (D-06-01) |
| `npm run lint` | ESLint in CI |

Phase gate: `npm test && npm run test:e2e`.

---

### `e2e/helpers/*.ts` (utility) — REUSE

**`e2e/helpers/catalog.ts`** — see critical-journey section.

**Optional secret gates** — do not change semantics (D-06-04/05/24):

```21:27:e2e/helpers/admin.ts
export function hasCloudinarySecrets(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME &&
      process.env.CLOUDINARY_API_KEY &&
      process.env.CLOUDINARY_API_SECRET,
  );
}
```

```1:9:e2e/helpers/pusher.ts
export function hasPusherSecrets(): boolean {
  return Boolean(
    process.env.PUSHER_APP_ID &&
      process.env.PUSHER_KEY &&
      // ...
  );
}
```

**Pusher skip pattern** (`e2e/chat-realtime.spec.ts` lines 10-11):

```10:11:e2e/chat-realtime.spec.ts
test.describe("live Pusher delivery (requires secrets)", () => {
  test.skip(!hasPusherSecrets(), "Pusher env vars required for realtime e2e");
```

**Cloudinary skip pattern** (`e2e/admin-rbac.spec.ts` line 35):

```35:35:e2e/admin-rbac.spec.ts
  test.skip(!hasCloudinarySecrets(), "Cloudinary secrets required for admin sign route");
```

---

### `src/app/sitemap.ts` (route, CRUD) — VERIFY ONLY

**Analog:** Self — no structural change expected; E2E validates behavior.

Full pattern (lines 8-41):

```8:41:src/app/sitemap.ts
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = getEnv().NEXT_PUBLIC_APP_URL.replace(/\/$/, "");
  const [categories, productSlugs] = await Promise.all([
    listCategories(),
    listPublicProductSlugsForSitemap(),
  ]);
  // ... staticRoutes, categoryRoutes, productRoutes
  return [...staticRoutes, ...categoryRoutes, ...productRoutes];
}
```

---

### `src/components/media/optimized-image.tsx` (component, transform) — VERIFY (D-06-09)

**Analog:** `optimized-image.tsx` + consumers `product-gallery.tsx`, `product-card.tsx`, `hero-section.tsx`

**Wrapper defaults** (lines 14-21):

```14:21:src/components/media/optimized-image.tsx
  return (
    <CldImage
      alt={alt}
      format="auto"
      quality="auto"
      sizes={sizes ?? "(max-width: 1024px) 100vw, 50vw"}
      {...props}
    />
```

**PDP LCP `priority` + `sizes`** (`product-gallery.tsx` lines 37-44):

```37:44:src/components/catalog/product-gallery.tsx
        <OptimizedImage
          src={current.cloudinaryPublicId}
          alt={current.alt ?? defaultAlt}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, 50vw"
          priority
        />
```

**Catalog card `sizes`** (`product-card.tsx` lines 27-33):

```27:33:src/components/catalog/product-card.tsx
            <OptimizedImage
              src={product.image.cloudinaryPublicId}
              alt={imageAlt}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 50vw, 25vw"
            />
```

Perf pass = confirm no regressions; no new component unless Lighthouse fails (D-06-07).

---

### `.env.example` (config) — EXTEND Production section

**Analog:** `.env.example` (existing dev comments)

**Existing structure to extend** (lines 1-42):

```1:42:.env.example
# Застосунок (публічний URL для Better Auth client)
NEXT_PUBLIC_APP_URL=http://localhost:3000
# ...
# Playwright (опційно — preview URL після deploy)
# PLAYWRIGHT_BASE_URL=http://localhost:3000
```

**Add Production section (D-06-18):** document required prod vars (`DATABASE_URL`, `DIRECT_URL`, `BETTER_AUTH_*`, Cloudinary trio, Pusher six), forbid `ADMIN_PASSWORD` on prod (D-06-14), align `NEXT_PUBLIC_APP_URL` === `BETTER_AUTH_URL` origin (D-06-15).

---

## Shared Patterns

### E2E import style
**Source:** All `e2e/*.spec.ts`  
**Apply to:** New/extended specs

```typescript
import { expect, test } from "@playwright/test";
```

### Authenticated buyer registration
**Source:** `e2e/checkout.spec.ts` lines 10-16  
**Apply to:** `critical-journey.spec.ts`, any new buyer flows

```typescript
await page.goto("/reiestratsiia");
await page.getByLabel("Імʼя").fill("…");
await page.getByLabel("Email").fill(email);
await page.getByLabel("Пароль", { exact: true }).fill("password123");
await page.getByLabel("Підтвердіть пароль").fill("password123");
await page.getByRole("button", { name: "Створити обліковий запис" }).click();
await expect(page).toHaveURL(/\/kabinet/);
```

### Request-based SEO checks
**Source:** `e2e/catalog-seo.spec.ts`  
**Apply to:** `catalog-seo.spec.ts`, `smoke-deploy.spec.ts`

```typescript
test("…", async ({ request }) => {
  const response = await request.get("/sitemap.xml");
  expect(response.ok()).toBeTruthy();
});
```

### Metadata routes + `getEnv()`
**Source:** `src/app/sitemap.ts`  
**Apply to:** `src/app/robots.ts`, `sitemap.ts` (already uses)

```typescript
const baseUrl = getEnv().NEXT_PUBLIC_APP_URL.replace(/\/$/, "");
```

### Optional third-party E2E
**Source:** `e2e/helpers/pusher.ts`, `e2e/helpers/admin.ts`  
**Apply to:** Do not fail CI when secrets missing — `test.skip(!hasXSecrets())`

### Vitest vs Playwright split
**Source:** `vitest.config.ts`, `playwright.config.ts`  
**Apply to:** CI job — unit first, then E2E

```10:12:vitest.config.ts
  test: {
    environment: "node",
    include: ["src/**/*.test.ts", "prisma/**/*.test.ts"],
```

---

## No Analog Found

| File | Role | Data Flow | Reason |
|------|------|-----------|--------|
| `.github/workflows/ci.yml` | config | batch | No `.github/workflows/` in repo; follow RESEARCH Pattern 1 + Playwright CI intro |
| `06-ENV-CHECKLIST.md` | docs | — | No env checklist in repo; mirror structure from phase VERIFICATION docs |
| `06-VERIFICATION.md` | docs | — | Manual Lighthouse/Rich Results — no code analog |

**For `ci.yml`:** Use RESEARCH excerpt (lines 209-242 in `06-RESEARCH.md`) as starter; wire `env.CI: true`, Neon secrets, localhost auth URLs.

---

## Metadata

**Analog search scope:** `e2e/`, `src/app/`, `src/components/media/`, `src/components/catalog/`, `playwright.config.ts`, `package.json`, `.env.example`, `src/server/services/catalog.service.ts`  
**Files scanned:** ~35  
**Pattern extraction date:** 2026-05-17
