import { expect, test } from "@playwright/test";
import {
  addCurrentProductToCart,
  openFirstCatalogProduct,
} from "./helpers/catalog";

test("cabinet shows order after checkout", async ({ page }) => {
  const email = `history-${Date.now()}@example.com`;

  await page.goto("/reiestratsiia");
  await page.getByLabel("Імʼя").fill("History Тест");
  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Пароль", { exact: true }).fill("password123");
  await page.getByLabel("Підтвердіть пароль").fill("password123");
  await page.getByRole("button", { name: "Створити обліковий запис" }).click();
  await expect(page).toHaveURL(/\/kabinet/);

  await openFirstCatalogProduct(page);
  await addCurrentProductToCart(page);

  await page.goto("/zamovlennia");
  await page.getByLabel("Ім'я та прізвище").fill("History Тест");
  await page.getByLabel("Телефон").fill("+380509998877");
  await page.getByLabel("Самовивіз (м. Львів)").check();
  await page.getByRole("button", { name: "Підтвердити замовлення" }).click();

  await expect(page).toHaveURL(/\/zamovlennia\/pidtverdzhennia\/ASL-/);

  await page.goto("/kabinet");
  await expect(page.getByRole("heading", { name: "Мої замовлення" })).toBeVisible();
  await expect(page.locator("main")).toContainText("ASL-");
});
