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

  page.once("dialog", (dialog) => dialog.accept());
  await page.getByRole("button", { name: "Видалити" }).click();

  await expect(page).toHaveURL(/\/admin\/kategorii$/);
  await expect(page.getByText(categoryName)).not.toBeVisible();
});
