import { expect, test } from "@playwright/test";
import { openFirstCatalogProduct } from "./helpers/catalog";

test("guest visiting /koszyk is redirected to login with callbackUrl", async ({
  page,
}) => {
  await page.goto("/koszyk");
  await expect(page).toHaveURL(/\/uviity\?callbackUrl=/);
  await expect(page.getByRole("heading", { name: "Вхід" })).toBeVisible();
});

test("guest visiting /zamovlennia is redirected to login", async ({ page }) => {
  await page.goto("/zamovlennia");
  await expect(page).toHaveURL(/\/uviity\?callbackUrl=/);
});

test("guest add-to-cart redirects to login from PDP", async ({ page }) => {
  await openFirstCatalogProduct(page);

  await page.getByRole("button", { name: /Додати в кошик/i }).click();
  await expect(page).toHaveURL(/\/uviity\?callbackUrl=/);
});
