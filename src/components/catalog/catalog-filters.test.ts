import { describe, expect, it } from "vitest";
import { normalizeSliderBounds, PRICE_STEP_UAH } from "./catalog-filters";

describe("normalizeSliderBounds", () => {
  it("rounds non-multiple min down and max up to 50 UAH grid", () => {
    expect(normalizeSliderBounds({ minUah: 1273, maxUah: 7890 })).toEqual({
      sliderMin: 1250,
      sliderMax: 7900,
    });
  });

  it("does not change already-aligned bounds", () => {
    expect(normalizeSliderBounds({ minUah: 1000, maxUah: 5000 })).toEqual({
      sliderMin: 1000,
      sliderMax: 5000,
    });
  });

  it("adds one step when min equals max (equal bounds edge case)", () => {
    const result = normalizeSliderBounds({ minUah: 1000, maxUah: 1000 });
    expect(result.sliderMin).toBe(1000);
    expect(result.sliderMax).toBe(1000 + PRICE_STEP_UAH);
  });

  it("guarantees sliderMin <= minUah and maxUah <= sliderMax", () => {
    const bounds = { minUah: 1273, maxUah: 7890 };
    const { sliderMin, sliderMax } = normalizeSliderBounds(bounds);
    expect(sliderMin).toBeLessThanOrEqual(bounds.minUah);
    expect(sliderMax).toBeGreaterThanOrEqual(bounds.maxUah);
  });
});
