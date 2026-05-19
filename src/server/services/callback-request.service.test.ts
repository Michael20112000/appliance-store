import { describe, expect, it, vi, beforeEach } from "vitest";

vi.mock("@/lib/db", () => ({
  prisma: {
    callbackRequest: {
      count: vi.fn(),
      create: vi.fn(),
    },
  },
}));

import { prisma } from "@/lib/db";
import {
  CALLBACK_RATE_LIMIT_MAX,
  CallbackRateLimitError,
  createCallbackRequest,
} from "./callback-request.service";

describe("createCallbackRequest", () => {
  beforeEach(() => {
    vi.mocked(prisma.callbackRequest.count).mockResolvedValue(0);
    vi.mocked(prisma.callbackRequest.create).mockResolvedValue({
      id: "cb1",
      phone: "0978734712",
      ipAddress: "1.2.3.4",
      createdAt: new Date(),
    });
  });

  it("throws rate limit error when count >= max in window", async () => {
    vi.mocked(prisma.callbackRequest.count).mockResolvedValue(
      CALLBACK_RATE_LIMIT_MAX,
    );

    await expect(
      createCallbackRequest({ phone: "0978734712", ipAddress: "1.2.3.4" }),
    ).rejects.toBeInstanceOf(CallbackRateLimitError);

    await expect(
      createCallbackRequest({ phone: "0978734712", ipAddress: "1.2.3.4" }),
    ).rejects.toThrow("Занадто багато запитів. Спробуйте пізніше.");

    expect(prisma.callbackRequest.create).not.toHaveBeenCalled();
  });

  it("persists when under rate limit", async () => {
    await createCallbackRequest({ phone: "0978734712", ipAddress: "1.2.3.4" });
    expect(prisma.callbackRequest.create).toHaveBeenCalledWith({
      data: { phone: "0978734712", ipAddress: "1.2.3.4" },
    });
  });
});
