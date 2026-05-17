import { expect, test } from "@playwright/test";
import { hasCloudinarySecrets, loginAsAdmin } from "./helpers/admin";

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

  await page.goto("/admin/chaty");
  await expect(page).toHaveURL(/\/uviity/);

  const buyerSign = await page.request.post("/api/upload/sign", {
    data: { paramsToSign: { timestamp: Math.floor(Date.now() / 1000) } },
  });
  expect(buyerSign.ok()).toBe(false);
  expect([401, 403]).toContain(buyerSign.status());

  await page.getByRole("button", { name: "Вийти" }).click();

  await loginAsAdmin(page);
  await page.goto("/admin");
  await expect(page.getByText("Панель керування")).toBeVisible();
  await expect(page.getByRole("link", { name: /^Чати/ })).toBeVisible();

  test.skip(!hasCloudinarySecrets(), "Cloudinary secrets required for admin sign route");

  const adminSign = await page.request.post("/api/upload/sign", {
    data: { paramsToSign: { timestamp: Math.floor(Date.now() / 1000) } },
  });
  expect(adminSign.ok()).toBe(true);
  const body = (await adminSign.json()) as { signature?: string };
  expect(body.signature).toBeTruthy();
});
