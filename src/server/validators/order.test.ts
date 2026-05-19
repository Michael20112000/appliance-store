import { describe, expect, it } from "vitest";
import { checkoutSchema } from "./order";

describe("checkoutSchema", () => {
  const base = {
    customerName: "Олег Коваленко",
    customerPhone: "0501234567",
    deliveryType: "PICKUP" as const,
  };

  it("accepts pickup without address", () => {
    const result = checkoutSchema.safeParse(base);
    expect(result.success).toBe(true);
  });

  it("accepts phone without +380 prefix (digits only)", () => {
    const result = checkoutSchema.safeParse({
      ...base,
      customerPhone: "0978734712",
    });
    expect(result.success).toBe(true);
  });

  it("rejects phone with non-digits", () => {
    const result = checkoutSchema.safeParse({
      ...base,
      customerPhone: "+380501234567",
    });
    expect(result.success).toBe(false);
  });

  it("rejects too short phone", () => {
    const result = checkoutSchema.safeParse({
      ...base,
      customerPhone: "123456789",
    });
    expect(result.success).toBe(false);
  });

  it("requires address for Lviv delivery", () => {
    const result = checkoutSchema.safeParse({
      ...base,
      deliveryType: "LVIV_DELIVERY",
      deliveryAddress: "коротко",
    });
    expect(result.success).toBe(false);
  });

  it("accepts Lviv delivery with address", () => {
    const result = checkoutSchema.safeParse({
      ...base,
      deliveryType: "LVIV_DELIVERY",
      deliveryAddress: "м. Львів, вул. Шевченка, 10",
    });
    expect(result.success).toBe(true);
  });
});
