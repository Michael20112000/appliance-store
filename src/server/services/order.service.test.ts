import { describe, expect, it } from "vitest";
import { generateOrderNumber } from "./order.service";

describe("generateOrderNumber", () => {
  it("produces ASL-YYYYMMDD-#### pattern", async () => {
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
