import { expect, test } from "@playwright/test";

test("category page shows product grid without sold items", async ({ page }) => {
  await page.goto("/katalog/kholodylnyky");

  const productLink = page.locator('main a[href^="/tovar/"]').first();
  await expect(productLink).toBeVisible();
  await expect(page.locator("main")).toContainText("₴");
  await expect(page.getByText("Продано")).toHaveCount(0);
});

test("unknown category returns not found", async ({ page }) => {
  await page.goto("/katalog/invalid-category-slug-xyz");
  await expect(page.getByRole("heading", { name: "Категорію не знайдено" })).toBeVisible();
});
