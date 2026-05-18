import { expect, test } from "@playwright/test";
import { loginAsAdmin } from "./helpers/admin";

test("admin can publish a draft product to storefront", async ({ page }) => {
  const title = `E2E Товар ${Date.now()}`;

  await loginAsAdmin(page);
  await page.goto("/admin/tovary/novyi");

  await page.getByLabel("Назва").fill(title);
  await page.getByLabel("Бренд").fill("E2E Brand");
  await page.getByLabel("Ціна (грн)").fill("3500");
  await page.getByLabel("Кількість").fill("2");
  await page.getByLabel("Статус").selectOption("AVAILABLE");
  await page.getByRole("button", { name: "Зберегти" }).click();

  await expect(page).toHaveURL(/\/admin\/tovary\/.+/);
  await expect(page.getByRole("heading", { name: "Редагувати товар" })).toBeVisible();
  await expect(page.getByLabel("Статус")).toHaveValue("AVAILABLE");
  await expect(page.getByLabel("Кількість")).toHaveValue("2");

  const urlLine = page.getByText(/URL: \/tovar\//);
  await expect(urlLine).toBeVisible();
  const slug = (await urlLine.textContent())?.replace(/.*\/tovar\//, "").trim() ?? "";
  expect(slug.length).toBeGreaterThan(0);

  await page.goto("/admin/tovary");
  await expect(
    page.getByRole("link", { name: new RegExp(title) }),
  ).toContainText("2");

  await page.goto(`/tovar/${slug}`);
  await expect(page.locator("h1")).toContainText(title);
});
