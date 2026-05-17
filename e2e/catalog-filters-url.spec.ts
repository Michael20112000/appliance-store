import { expect, test } from "@playwright/test";

test("filters update URL on global catalog", async ({ page }) => {
  await page.goto("/katalog");

  await page.getByRole("combobox", { name: "Сортування" }).selectOption("cina-asc");
  await expect(page).toHaveURL(/sort=cina-asc/);

  const brandSelect = page.locator("aside select").first();
  const options = await brandSelect.locator("option").allTextContents();
  const brand = options.find((o) => o && o !== "Усі бренди");
  if (brand) {
    await brandSelect.selectOption({ label: brand });
    await expect(page).toHaveURL(/brend=/);
  }
});

test("category page preserves filters in URL", async ({ page }) => {
  await page.goto("/katalog/pralni-mashyny?sort=cina-desc");
  await expect(page).toHaveURL(/sort=cina-desc/);
  await expect(page.getByRole("combobox", { name: "Сортування" })).toHaveValue(
    "cina-desc",
  );
});
