import { expect, test } from "@playwright/test";
import {
  addCurrentProductToCart,
  openFirstCatalogProduct,
} from "./helpers/catalog";
import { loginAsAdmin } from "./helpers/admin";

test("admin can confirm a pending order", async ({ page }) => {
  const buyerEmail = `admin-order-${Date.now()}@example.com`;
  const password = "testpass123";

  await page.goto("/reiestratsiia");
  await page.getByLabel("Імʼя").fill("Order E2E");
  await page.getByLabel("Email").fill(buyerEmail);
  await page.getByLabel("Пароль", { exact: true }).fill(password);
  await page.getByLabel("Підтвердіть пароль").fill(password);
  await page.getByRole("button", { name: "Створити обліковий запис" }).click();
  await expect(page).toHaveURL(/\/kabinet/);

  await openFirstCatalogProduct(page);
  await addCurrentProductToCart(page);

  await page.goto("/zamovlennia");
  await page.getByLabel("Ім'я та прізвище").fill("Order E2E");
  await page.getByLabel("Телефон").fill("+380501234567");
  await page.getByLabel("Самовивіз (м. Львів)").check();
  await page.getByRole("button", { name: "Підтвердити замовлення" }).click();

  await expect(page).toHaveURL(/\/zamovlennia\/pidtverdzhennia\/ASL-/);
  const orderNumber = page.url().split("/").pop()!;
  expect(orderNumber).toMatch(/^ASL-/);

  await page.getByRole("button", { name: "Вийти" }).click();

  await loginAsAdmin(page);
  await page.goto(`/admin/zamovlennia/${orderNumber}`);

  await expect(page.getByRole("heading", { name: `Замовлення ${orderNumber}` })).toBeVisible();
  await page.locator("#order-status").click();
  await page.getByRole("option", { name: "Підтверджено" }).click();
  await expect(page.getByText("Статус оновлено")).toBeVisible({ timeout: 10_000 });
  await expect(
    page.locator('[data-slot="badge"]').filter({ hasText: "Підтверджено" }),
  ).toBeVisible();
  await expect(page.locator("#order-status")).toContainText("Підтверджено");
});
