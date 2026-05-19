import { expect, test } from "@playwright/test";
import { loginAsAdmin } from "./helpers/admin";

test("admin chat inbox loads with enabled nav", async ({ page }) => {
  await loginAsAdmin(page);
  await page.goto("/admin/chaty");

  await expect(page.getByRole("heading", { name: "Чати", level: 1 })).toBeVisible();
  await expect(page.getByRole("link", { name: /^Чати/ })).toBeVisible();
  await expect(page.getByRole("tab", { name: "Активні" })).toBeVisible();
  await expect(page.getByRole("tab", { name: "Архів" })).toBeVisible();

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

test("right-click on inbox row opens lifecycle menu on desktop", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1280, height: 720 });
  await loginAsAdmin(page);
  await page.goto("/admin/chaty");

  const firstConversation = page.getByRole("option").first();
  if (!(await firstConversation.isVisible())) {
    test.skip(true, "No conversations in inbox seed data");
  }

  await firstConversation.click({ button: "right" });
  await expect(
    page.getByRole("menuitem", { name: "Архівувати" }),
  ).toBeVisible();
});

test("right-click on inbox row does not open menu on mobile", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await loginAsAdmin(page);
  await page.goto("/admin/chaty");

  const firstConversation = page.getByRole("option").first();
  if (!(await firstConversation.isVisible())) {
    test.skip(true, "No conversations in inbox seed data");
  }

  await firstConversation.click({ button: "right" });
  await expect(page.getByRole("menuitem")).toHaveCount(0);
});

test("left-click selects conversation and opens composer", async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 720 });
  await loginAsAdmin(page);
  await page.goto("/admin/chaty");

  const firstConversation = page.getByRole("option").first();
  if (!(await firstConversation.isVisible())) {
    test.skip(true, "No conversations in inbox seed data");
  }

  await firstConversation.click();
  await expect(page.locator("#admin-chat-message")).toBeVisible({
    timeout: 15_000,
  });
});

test("admin chat inbox has no document scroll on desktop", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1280, height: 720 });
  await loginAsAdmin(page);
  await page.goto("/admin/chaty");

  await expect(
    page.getByRole("heading", { name: "Чати", level: 1 }),
  ).toBeVisible();

  const assertNoDocumentScroll = async () => {
    const hasDocumentScroll = await page.evaluate(() => {
      const root = document.documentElement;
      return root.scrollHeight > root.clientHeight + 2;
    });
    expect(hasDocumentScroll).toBe(false);
  };

  await assertNoDocumentScroll();

  const firstConversation = page.getByRole("option").first();
  if (await firstConversation.isVisible()) {
    await firstConversation.click();
    await expect(page.locator("#admin-chat-message")).toBeVisible({
      timeout: 15_000,
    });
    await assertNoDocumentScroll();
  }
});
