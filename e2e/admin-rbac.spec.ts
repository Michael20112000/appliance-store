import { expect, test } from "@playwright/test";

test("admin RBAC", async ({ page }) => {
  const buyerEmail = `buyer-rbac-${Date.now()}@example.com`;
  const password = "testpass123";

  await page.goto("/reiestratsiia");
  await page.getByLabel("Імʼя").fill("Покупець");
  await page.getByLabel("Email").fill(buyerEmail);
  await page.getByLabel("Пароль", { exact: true }).fill(password);
  await page.getByLabel("Підтвердіть пароль").fill(password);
  await page.getByRole("button", { name: "Створити обліковий запис" }).click();
  await expect(page).toHaveURL(/\/kabinet/);

  await page.goto("/admin");
  await expect(page).toHaveURL(/\/uviity/);

  await page.getByRole("button", { name: "Вийти" }).click();

  await page.goto("/uviity");
  await page.getByLabel("Email").fill(
    process.env.ADMIN_EMAIL ?? "official.michael.developer@gmail.com",
  );
  await page.getByLabel("Пароль", { exact: true }).fill(
    process.env.ADMIN_PASSWORD ?? "michael20112000",
  );
  await page.getByRole("button", { name: "Увійти" }).click();
  await expect(page).toHaveURL(/\/kabinet/);

  await page.goto("/admin");
  await expect(page.getByText("Адмін-панель")).toBeVisible();
  await expect(page.getByText("Панель керування")).toBeVisible();
});
