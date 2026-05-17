import { expect, test } from "@playwright/test";

// SOLD slug from seed-products.ts (Samsung Холодильник SOLD demo)
const SOLD_SLUG = "samsung-kholodylnyk-sold-demo-sold";

test("product detail page from category grid", async ({ page }) => {
  await page.goto("/katalog/kholodylnyky");
  await page.locator('main a[href^="/tovar/"]').first().click();

  await expect(page.locator("h1")).toBeVisible();
  await expect(page.locator("main")).toContainText("₴");
  await expect(page.getByRole("heading", { name: "Опис" })).toBeVisible();
});

test("sold product returns not found", async ({ page }) => {
  await page.goto(`/tovar/${SOLD_SLUG}`);
  await expect(page.getByRole("heading", { name: "Товар не знайдено" })).toBeVisible();
});
