import { expect, test } from "@playwright/test";

test("session persists after reload", async ({ page }) => {
  const email = `persist-${Date.now()}@example.com`;
  const password = "testpass123";

  await page.goto("/reiestratsiia");
  await page.getByLabel("Імʼя").fill("Персист");
  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Пароль", { exact: true }).fill(password);
  await page.getByLabel("Підтвердіть пароль").fill(password);
  await page.getByRole("button", { name: "Створити обліковий запис" }).click();
  await expect(page).toHaveURL(/\/kabinet/);

  await page.reload();
  await expect(page.getByText("Особистий кабінет")).toBeVisible();
});
