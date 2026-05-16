import { expect, test } from "@playwright/test";

const uniqueEmail = () =>
  `buyer-${Date.now()}@example.com`;

test("register and login flows", async ({ page }) => {
  const email = uniqueEmail();
  const password = "testpass123";

  await page.goto("/reiestratsiia");
  await page.getByLabel("Імʼя").fill("Тест");
  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Пароль", { exact: true }).fill(password);
  await page.getByLabel("Підтвердіть пароль").fill(password);
  await page.getByRole("button", { name: "Створити обліковий запис" }).click();
  await expect(page).toHaveURL(/\/kabinet/);
  await expect(
    page.getByRole("heading", { name: "Особистий кабінет" }),
  ).toBeVisible();

  await page.getByRole("button", { name: "Вийти" }).click();
  await page.goto("/uviity");
  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Пароль", { exact: true }).fill(password);
  await page.getByRole("button", { name: "Увійти" }).click();
  await expect(page).toHaveURL(/\/kabinet/);

  await page.goto("/uviity");
  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Пароль", { exact: true }).fill("wrong-password");
  await page.getByRole("button", { name: "Увійти" }).click();
  await expect(page.getByText("Невірний email або пароль")).toBeVisible();
});
