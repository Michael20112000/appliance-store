import { expect, test } from "@playwright/test";
import { loginAsAdmin } from "./helpers/admin";

test("admin chat inbox loads with enabled nav", async ({ page }) => {
  await loginAsAdmin(page);
  await page.goto("/admin/chaty");

  await expect(page.getByRole("heading", { name: "Чати", level: 1 })).toBeVisible();
  await expect(page.getByRole("link", { name: /^Чати/ })).toBeVisible();

  const firstConversation = page.getByRole("option").first();
  if (await firstConversation.isVisible()) {
    await firstConversation.click();
    const composer = page.locator("#admin-chat-message");
    await expect(composer).toBeVisible({ timeout: 15_000 });
    const reply = `admin-e2e-${crypto.randomUUID()}`;
    await composer.fill(reply);
    await page.getByRole("button", { name: "Надіслати" }).click();
    await expect(page.getByText(reply, { exact: true })).toBeVisible({
      timeout: 15_000,
    });
  }
});
