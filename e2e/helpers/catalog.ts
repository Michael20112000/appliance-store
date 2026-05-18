import { expect, type Page } from "@playwright/test";

export async function openFirstCatalogProduct(page: Page) {
  await page.goto("/katalog");
  const productLink = page.locator('main a[href^="/tovar/"]').first();
  await expect(productLink).toBeVisible({ timeout: 15_000 });
  const href = await productLink.getAttribute("href");
  expect(href).toBeTruthy();
  await productLink.click();
  return href!;
}

export async function addCurrentProductToCart(page: Page) {
  const addButton = page.getByRole("button", { name: /Додати в кошик/i });
  await addButton.click();

  await expect(
    page.getByRole("button", { name: /уже в кошику/i }),
  ).toBeVisible({ timeout: 10_000 });

  await expect(
    page.getByRole("link", { name: /Кошик,\s*\d+ товар/i }),
  ).toBeVisible({ timeout: 15_000 });
}
