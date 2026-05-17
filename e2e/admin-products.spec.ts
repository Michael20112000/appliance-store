import { expect, test } from "@playwright/test";
import { loginAsAdmin } from "./helpers/admin";

test("admin can publish a draft product to storefront", async ({ page }) => {
  const title = `E2E Товар ${Date.now()}`;
  const slug = `e2e-tovar-${Date.now()}`;

  await loginAsAdmin(page);
  await page.goto("/admin/tovary/novyi");

  await page.getByLabel("Назва").fill(title);
  await page.getByLabel("Slug").fill(slug);
  await page.getByLabel("Бренд").fill("E2E Brand");
  await page.getByLabel("Ціна (грн)").fill("3500");
  await page.getByLabel("Статус").selectOption("AVAILABLE");
  await page.getByRole("button", { name: "Зберегти" }).click();

  await expect(page).toHaveURL(/\/admin\/tovary\/.+/);
  await expect(page.getByRole("heading", { name: "Редагувати товар" })).toBeVisible();
  await expect(page.getByLabel("Статус")).toHaveValue("AVAILABLE");

  await page.goto(`/tovar/${slug}`);
  await expect(page.locator("h1")).toContainText(title);
});
