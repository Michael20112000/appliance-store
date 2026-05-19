import { describe, expect, it } from "vitest";
import { uaPhoneSchema } from "./phone";

describe("uaPhoneSchema", () => {
  it("accepts 10-digit UA phone", () => {
    expect(uaPhoneSchema.safeParse("0978734712").success).toBe(true);
  });

  it("accepts pickup-style phone", () => {
    expect(uaPhoneSchema.safeParse("0501234567").success).toBe(true);
  });

  it("rejects phone with non-digits", () => {
    expect(uaPhoneSchema.safeParse("+380501234567").success).toBe(false);
  });

  it("rejects too short phone", () => {
    expect(uaPhoneSchema.safeParse("123456789").success).toBe(false);
  });
});
