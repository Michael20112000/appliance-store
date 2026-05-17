import { expect, test } from "@playwright/test";

test("guest can browse home and category stub", async ({ page }) => {
  await page.goto("/");
  const categoryLinks = page.locator('#kategorii a[href^="/katalog/"]');
  await expect(categoryLinks.first()).toBeVisible();
  await expect(categoryLinks).toHaveCount(8);

  await page.goto("/katalog/kholodylnyky");
  await expect(page.locator('main a[href^="/tovar/"]').first()).toBeVisible();
});
