import { expect, test } from "@playwright/test";
import {
  addCurrentProductToCart,
  openFirstCatalogProduct,
} from "./helpers/catalog";

test("buyer completes catalog to cabinet journey", async ({ page }) => {
  const email = `critical-journey-${Date.now()}@example.com`;
  const marker = `E2E-JOURNEY-${Date.now()}`;

  await page.goto("/reiestratsiia");
  await page.getByLabel("Імʼя").fill("Journey Тест");
  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Пароль", { exact: true }).fill("password123");
  await page.getByLabel("Підтвердіть пароль").fill("password123");
  await page.getByRole("button", { name: "Створити обліковий запис" }).click();
  await expect(page).toHaveURL(/\/kabinet/);

  await openFirstCatalogProduct(page);
  await addCurrentProductToCart(page);

  await page.goto("/zamovlennia");
  await page.getByLabel("Ім'я та прізвище").fill("Journey Тест");
  await page.getByLabel("Телефон").fill("+380501234567");
  await page.getByLabel("Самовивіз (м. Львів)").check();
  await page.getByLabel(/Коментар/i).fill(marker);
  await page.getByRole("button", { name: "Підтвердити замовлення" }).click();

  await expect(page).toHaveURL(/\/zamovlennia\/pidtverdzhennia\/ASL-/);
  await expect(page.getByText("Дякуємо за замовлення!")).toBeVisible();

  const orderNumber = page.url().match(/ASL-\d+/)?.[0];
  expect(orderNumber).toBeTruthy();

  await page.goto("/kabinet");
  await expect(page.getByRole("heading", { name: "Мої замовлення" })).toBeVisible();
  await expect(page.locator("main")).toContainText(orderNumber!);
});
