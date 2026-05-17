import { expect, test } from "@playwright/test";
import { openFirstCatalogProduct } from "./helpers/catalog";

test("pending localStorage merges after login", async ({ page }) => {
  const productHref = await openFirstCatalogProduct(page);
  await page.getByRole("button", { name: /Додати в кошик/i }).click();
  await expect(page).toHaveURL(/\/uviity/);

  const email = `buyer-${Date.now()}@example.com`;
  await page.goto(
    `/reiestratsiia?callbackUrl=${encodeURIComponent(productHref!)}`,
  );
  await page.getByLabel("Імʼя").fill("Тест Покупець");
  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Пароль", { exact: true }).fill("password123");
  await page.getByLabel("Підтвердіть пароль").fill("password123");
  await page.getByRole("button", { name: "Створити обліковий запис" }).click();

  await expect(page).toHaveURL(new RegExp(productHref!.replace("/", "\\/")));
  await page.goto("/koszyk");
  await expect(page.getByRole("heading", { name: "Кошик" })).toBeVisible();
  await expect(page.locator("main")).toContainText("₴");
});
