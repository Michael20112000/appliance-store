import { expect, test } from "@playwright/test";
import { loginAsAdmin } from "./helpers/admin";
import {
  openChatFab,
  registerBuyer,
  sendBuyerChatMessage,
} from "./helpers/buyer";
import { hasPusherSecrets } from "./helpers/pusher";

test.describe("live Pusher delivery (requires secrets)", () => {
  test.skip(!hasPusherSecrets(), "Pusher env vars required for realtime e2e");

  test("buyer message appears in admin thread without reload", async ({
    browser,
  }) => {
    const buyerContext = await browser.newContext();
    const adminContext = await browser.newContext();
    const buyerPage = await buyerContext.newPage();
    const adminPage = await adminContext.newPage();

    try {
      await registerBuyer(buyerPage, "pusher-buyer");
      await loginAsAdmin(adminPage);

      await adminPage.goto("/admin/chaty");
      const firstConversation = adminPage.getByRole("option").first();
      await expect(firstConversation).toBeVisible({ timeout: 15_000 });
      await firstConversation.click();

      const liveMessage = `pusher-live-${crypto.randomUUID()}`;
      await buyerPage.goto("/");
      await openChatFab(buyerPage);
      await sendBuyerChatMessage(buyerPage, liveMessage);

      await expect(
        adminPage.getByText(liveMessage, { exact: true }),
      ).toBeVisible({ timeout: 20_000 });
    } finally {
      await buyerContext.close();
      await adminContext.close();
    }
  });
});
