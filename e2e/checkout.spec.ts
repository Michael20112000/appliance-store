import { expect, test } from "@playwright/test";
import { loginAsAdmin } from "./helpers/admin";
import {
  addCurrentProductToCart,
  openFirstCatalogProduct,
} from "./helpers/catalog";

test("checkout decrements admin product quantity", async ({ browser }) => {
  const title = `E2E Stock ${Date.now()}`;
  const email = `stock-checkout-${Date.now()}@example.com`;

  const adminContext = await browser.newContext();
  const adminPage = await adminContext.newPage();
  await loginAsAdmin(adminPage);
  await adminPage.goto("/admin/tovary/novyi");
  await adminPage.getByLabel("Назва").fill(title);
  await adminPage.getByLabel("Бренд").fill("Stock Brand");
  await adminPage.getByLabel("Ціна (грн)").fill("1200");
  await adminPage.getByLabel("Кількість").fill("2");
  await adminPage.getByLabel("Статус").selectOption("AVAILABLE");
  await adminPage.getByRole("button", { name: "Зберегти" }).click();
  await expect(adminPage).toHaveURL(/\/admin\/tovary\/.+/);

  const productId = adminPage.url().split("/").pop()!;
  const urlLine = adminPage.getByText(/URL: \/tovar\//);
  const slug =
    (await urlLine.textContent())?.replace(/.*\/tovar\//, "").trim() ?? "";
  expect(slug.length).toBeGreaterThan(0);

  const buyerContext = await browser.newContext();
  const page = await buyerContext.newPage();

  await page.goto("/reiestratsiia");
  await page.getByLabel("Імʼя").fill("Stock Тест");
  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Пароль", { exact: true }).fill("password123");
  await page.getByLabel("Підтвердіть пароль").fill("password123");
  await page.getByRole("button", { name: "Створити обліковий запис" }).click();
  await expect(page).toHaveURL(/\/kabinet/);

  await page.goto(`/tovar/${slug}`);
  await addCurrentProductToCart(page);

  await page.goto("/zamovlennia");
  await page.getByLabel("Ім'я та прізвище").fill("Stock Тест");
  await page.getByLabel("Телефон").fill("+380509998877");
  await page.getByLabel("Самовивіз (м. Львів)").check();
  await page.getByRole("button", { name: "Підтвердити замовлення" }).click();

  await expect(page).toHaveURL(/\/zamovlennia\/pidtverdzhennia\/ASL-/);

  await adminPage.goto(`/admin/tovary/${productId}`);
  await expect(adminPage.getByLabel("Кількість")).toHaveValue("1");

  await adminContext.close();
  await buyerContext.close();
});

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
