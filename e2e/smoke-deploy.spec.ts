/**
 * Post-deploy smoke — run against a live origin (preview or production).
 *
 * Ship blocker (D-06-17): set PLAYWRIGHT_BASE_URL to the deployed https origin.
 * When unset, playwright.config.ts starts `npm run dev` on localhost (local dev only).
 *
 * Example:
 *   PLAYWRIGHT_BASE_URL=https://your-app.vercel.app npx playwright test e2e/smoke-deploy.spec.ts --reporter=line
 */
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
