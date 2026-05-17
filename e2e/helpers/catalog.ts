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
  await expect(addButton).toBeEnabled({ timeout: 10_000 });

  await expect
    .poll(
      async () => {
        await page.goto("/koszyk");
        const text = await page.locator("main").textContent();
        return text?.includes("₴") ?? false;
      },
      { timeout: 15_000 },
    )
    .toBe(true);
}
