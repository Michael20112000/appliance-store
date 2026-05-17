import { expect, test } from "@playwright/test";
import { openChatFab, registerBuyer } from "./helpers/buyer";

test("guest FAB redirects to login with callbackUrl", async ({ page }) => {
  await page.goto("/");
  await page
    .getByRole("button", { name: "Відкрити чат з магазином" })
    .click();
  await expect(page).toHaveURL(/\/uviity\?callbackUrl=/);
  await expect(page.getByRole("heading", { name: "Вхід" })).toBeVisible();
});

test("guest cannot POST /api/chat/messages", async ({ page }) => {
  const response = await page.request.post("/api/chat/messages", {
    data: { body: "guest probe" },
  });
  expect(response.status()).toBe(401);
  const body = (await response.json()) as { error?: string };
  expect(body.error).toBe("UNAUTHORIZED");
});

test("authenticated buyer opens chat from kabinet", async ({ page }) => {
  await registerBuyer(page, "chat-auth");

  await page.goto("/kabinet");
  await page
    .getByRole("button", { name: "Відкрити чат", exact: true })
    .click();
  await expect(
    page.getByRole("dialog", { name: "Чат з магазином" }),
  ).toBeVisible();
});

test("authenticated buyer opens chat from storefront FAB", async ({
  page,
}) => {
  await registerBuyer(page, "chat-fab");

  await page.goto("/");
  await openChatFab(page);
});
