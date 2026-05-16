import { expect, test } from "@playwright/test";

test("ukrainian locale defaults", async ({ page }) => {
  await page.goto("/");
  const lang = await page.locator("html").getAttribute("lang");
  expect(lang).toBe("uk");
  await expect(page).toHaveTitle(/Львів/);
});
