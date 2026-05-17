import { describe, expect, it } from "vitest";
import { categoryImageAlt } from "./category-image-alt";

describe("categoryImageAlt", () => {
  it("formats category name with Lviv used-appliance suffix", () => {
    expect(categoryImageAlt("Холодильники")).toBe(
      "Холодильники — б/у техніка, Львів",
    );
  });
});
