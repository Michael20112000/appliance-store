import { expect, test } from "@playwright/test";

const SOLD_SLUG = "samsung-kholodylnyk-sold-demo-sold";

test("homepage uses Ukrainian lang attribute", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator("html")).toHaveAttribute("lang", "uk");
});

test("PDP includes Product JSON-LD", async ({ page }) => {
  await page.goto("/katalog/kholodylnyky");
  const href = await page.locator('main a[href^="/tovar/"]').first().getAttribute("href");
  expect(href).toBeTruthy();

  await page.goto(href!);

  const jsonLd = page.locator('script[type="application/ld+json"]');
  await expect(jsonLd).toHaveCount(1);
  const content = await jsonLd.textContent();
  expect(content).toContain('"@type":"Product"');
  expect(content).toMatch(/UsedCondition|RefurbishedCondition/);
});

test("category page title contains category name", async ({ page }) => {
  await page.goto("/katalog/kholodylnyky");
  await expect(page).toHaveTitle(/Холодильники/);
});

test("sitemap lists catalog and product URLs, not admin", async ({ request }) => {
  const response = await request.get("/sitemap.xml");
  expect(response.ok()).toBeTruthy();
  const body = await response.text();
  expect(body).toContain("/katalog/");
  expect(body).toContain("/tovar/");
  expect(body).not.toContain("/admin");
});

test("sitemap excludes sold demo product", async ({ request }) => {
  const response = await request.get("/sitemap.xml");
  expect(response.ok()).toBeTruthy();
  const body = await response.text();
  expect(body).not.toContain(`/tovar/${SOLD_SLUG}`);
});

test("sample sitemap product URL returns 200", async ({ request }) => {
  const response = await request.get("/sitemap.xml");
  expect(response.ok()).toBeTruthy();
  const body = await response.text();
  const match = body.match(/<loc>[^<]*(\/tovar\/[^<]+)<\/loc>/);
  expect(match).toBeTruthy();

  const productResponse = await request.get(match![1]);
  expect(productResponse.ok()).toBeTruthy();
});
