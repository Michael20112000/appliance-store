import { expect, type Page } from "@playwright/test";

export async function registerBuyer(
  page: Page,
  prefix = "buyer",
): Promise<{ email: string; password: string }> {
  const email = `${prefix}-${Date.now()}@example.com`;
  const password = "testpass123";

  await page.goto("/reiestratsiia");
  await page.getByLabel("Імʼя").fill("Покупець");
  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Пароль", { exact: true }).fill(password);
  await page.getByLabel("Підтвердіть пароль").fill(password);
  await page.getByRole("button", { name: "Створити обліковий запис" }).click();
  await expect(page).toHaveURL(/\/kabinet/);

  return { email, password };
}

export async function openChatFab(page: Page) {
  const dialog = page.getByRole("dialog", { name: "Чат з магазином" });
  const fab = page.getByRole("button", { name: "Відкрити чат з магазином" });

  if (await dialog.isVisible()) {
    return;
  }

  await fab.click();
  await expect(dialog).toBeVisible();
}

export async function sendBuyerChatMessage(page: Page, text: string) {
  const sendResponse = page.waitForResponse(
    (response) =>
      response.url().includes("/api/chat/messages") &&
      response.request().method() === "POST",
  );

  await page.locator("#chat-message").fill(text);
  await page.getByRole("button", { name: "Надіслати" }).click();

  const response = await sendResponse;
  expect(response.status()).toBe(201);

  await expect(page.getByText(text, { exact: true })).toBeVisible({
    timeout: 15_000,
  });
}
