import { describe, expect, it } from "vitest";
import { callbackRequestSchema } from "./callback";

describe("callbackRequestSchema", () => {
  it("accepts valid 10-digit phone", () => {
    expect(callbackRequestSchema.safeParse({ phone: "0978734712" }).success).toBe(
      true,
    );
  });

  it("rejects phone with letters", () => {
    expect(callbackRequestSchema.safeParse({ phone: "abc" }).success).toBe(false);
  });
});
