import { expect, test } from "@playwright/test";

test.use({ viewport: { width: 390, height: 844 } });

test("storefront shell on mobile", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("banner")).toBeVisible();
  await expect(page.locator("footer")).toBeVisible();
  const fontSize = await page.locator("body").evaluate(
    (el) => window.getComputedStyle(el).fontSize,
  );
  expect(parseFloat(fontSize)).toBeGreaterThanOrEqual(16);
});
