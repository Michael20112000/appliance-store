import { expect, test } from "@playwright/test";
import { registerBuyer } from "./helpers/buyer";
import { openFirstCatalogProduct } from "./helpers/catalog";

test("PDP opens chat with product context banner", async ({ page }) => {
  await registerBuyer(page, "chat-widget");
  await openFirstCatalogProduct(page);

  await page.getByRole("button", { name: "Запитати про цей товар" }).click();
  await expect(
    page.getByRole("dialog", { name: "Чат з магазином" }),
  ).toBeVisible();
  await expect(page.getByText(/Питання про:/)).toBeVisible();
});
