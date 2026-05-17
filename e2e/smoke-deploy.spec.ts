import { expect, test } from "@playwright/test";

test("home page loads", async ({ page }) => {
  const response = await page.goto("/");
  expect(response?.status()).toBe(200);
  await expect(page.locator("h1")).toContainText("Б/у побутова техніка");
});

test("catalog category shows product links", async ({ page }) => {
  const response = await page.goto("/katalog/kholodylnyky");
  expect(response?.status()).toBe(200);
  await expect(page.locator('main a[href^="/tovar/"]').first()).toBeVisible();
});

test("robots.txt exposes sitemap and blocks admin", async ({ request }) => {
  const response = await request.get("/robots.txt");
  expect(response.ok()).toBeTruthy();
  const body = await response.text();
  expect(body).toMatch(/Sitemap:/i);
  expect(body).toMatch(/Disallow:\s*\/admin/i);
});

test("sitemap.xml lists product URLs", async ({ request }) => {
  const response = await request.get("/sitemap.xml");
  expect(response.ok()).toBeTruthy();
  const body = await response.text();
  expect(body).toContain("/tovar/");
});
