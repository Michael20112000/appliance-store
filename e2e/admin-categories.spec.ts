import { expect, test } from "@playwright/test";
import { loginAsAdmin } from "./helpers/admin";

test("admin can create and delete a category", async ({ page }) => {
  const categoryName = `Тестова ${Date.now()}`;

  await loginAsAdmin(page);
  await page.goto("/admin/kategorii/novyi");

  await page.getByLabel("Назва").fill(categoryName);
  await page.getByRole("button", { name: "Зберегти" }).click();

  await expect(page).toHaveURL(/\/admin\/kategorii\/.+/);
  await expect(page.getByRole("heading", { name: "Редагувати категорію" })).toBeVisible();
  await expect(page.getByLabel("Назва")).toHaveValue(categoryName);
  await expect(
    page.getByRole("button", { name: "Переглянути товари" }),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Додати товар" }),
  ).toBeVisible();

  await page.goto("/admin/kategorii");
  const viewProductsLink = page
    .getByRole("row", { name: new RegExp(categoryName) })
    .getByRole("link", { name: /Переглянути/i });
  await expect(viewProductsLink).toBeVisible();
  const categoryId = new URL(
    (await viewProductsLink.getAttribute("href")) ?? "",
    "http://localhost",
  ).searchParams.get("categoryId");
  expect(categoryId).toBeTruthy();
  await viewProductsLink.click();
  await expect(page).toHaveURL(
    new RegExp(`/admin/tovary\\?categoryId=${categoryId}`),
  );

  await page.goto(`/admin/kategorii/${categoryId}`);
  page.once("dialog", (dialog) => dialog.accept());
  await page.getByRole("button", { name: "Видалити" }).click();

  await expect(page).toHaveURL(/\/admin\/kategorii$/);
  await expect(page.getByText(categoryName)).not.toBeVisible();
});
