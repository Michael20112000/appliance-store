import { expect, test } from "@playwright/test";
import {
  openChatFab,
  registerBuyer,
  sendBuyerChatMessage,
} from "./helpers/buyer";

test("buyer message persists after page reload", async ({ page }) => {
  test.setTimeout(60_000);
  await registerBuyer(page, "chat-persist");
  const uniqueMessage = `e2e-persist-${crypto.randomUUID()}`;

  await page.goto("/");
  await openChatFab(page);
  await sendBuyerChatMessage(page, uniqueMessage);

  await page.reload();

  await expect(page.getByText(uniqueMessage, { exact: true })).toBeVisible({
    timeout: 20_000,
  });
});
