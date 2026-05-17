import { expect, test } from "@playwright/test";
import {
  addCurrentProductToCart,
  openFirstCatalogProduct,
} from "./helpers/catalog";

test("buyer can checkout with pickup", async ({ page }) => {
  const email = `checkout-${Date.now()}@example.com`;

  await page.goto("/reiestratsiia");
  await page.getByLabel("Імʼя").fill("Checkout Тест");
  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Пароль", { exact: true }).fill("password123");
  await page.getByLabel("Підтвердіть пароль").fill("password123");
  await page.getByRole("button", { name: "Створити обліковий запис" }).click();
  await expect(page).toHaveURL(/\/kabinet/);

  await openFirstCatalogProduct(page);
  await addCurrentProductToCart(page);

  await page.goto("/zamovlennia");
  await page.getByLabel("Ім'я та прізвище").fill("Checkout Тест");
  await page.getByLabel("Телефон").fill("+380501112233");
  await page.getByLabel("Самовивіз (м. Львів)").check();
  await page.getByRole("button", { name: "Підтвердити замовлення" }).click();

  await expect(page).toHaveURL(/\/zamovlennia\/pidtverdzhennia\/ASL-/);
  await expect(page.getByText("Дякуємо за замовлення!")).toBeVisible();
  await expect(page.getByText("Оплата при отриманні")).toBeVisible();
});
