import { afterEach, describe, expect, it, vi } from "vitest";
import { generateOrderNumber } from "./order.service";

describe("generateOrderNumber", () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it("produces ASL-YYYYMMDD-#### pattern", async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-05-17T12:00:00Z"));

    const tx = {
      order: {
        findFirst: async () => ({ orderNumber: "ASL-20260517-0003" }),
      },
    };

    const number = await generateOrderNumber(tx as never);
    expect(number).toMatch(/^ASL-\d{8}-\d{4}$/);
    expect(number).toBe("ASL-20260517-0004");
  });

  it("starts at 0001 when no prior orders", async () => {
    const tx = {
      order: {
        findFirst: async () => null,
      },
    };

    const number = await generateOrderNumber(tx as never);
    expect(number).toMatch(/^ASL-\d{8}-0001$/);
  });
});

describe("createOrderFromCart transaction", () => {
  it.todo("marks products SOLD atomically — covered in e2e checkout.spec.ts");
});
