import { describe, expect, it } from "vitest";
import {
  listAdminProductsSchema,
  productImageInputSchema,
  upsertProductSchema,
} from "./admin-product";

describe("upsertProductSchema", () => {
  it("accepts valid product input with price in UAH", () => {
    const result = upsertProductSchema.parse({
      title: "Холодильник Samsung",
      brand: "Samsung",
      categoryId: "clxxxxxxxxxxxxxxxxxxxxxxxxx",
      condition: "GOOD",
      status: "DRAFT",
      priceUah: 4500,
    });
    expect(result.priceUah).toBe(4500);
    expect(result.status).toBe("DRAFT");
  });

  it("rejects SOLD status in admin form", () => {
    expect(() =>
      upsertProductSchema.parse({
        title: "Test",
        brand: "B",
        categoryId: "clxxxxxxxxxxxxxxxxxxxxxxxxx",
        condition: "GOOD",
        status: "SOLD",
        priceUah: 100,
      }),
    ).toThrow();
  });
});

describe("productImageInputSchema", () => {
  it("requires cloudinaryPublicId", () => {
    const result = productImageInputSchema.parse({
      cloudinaryPublicId: "appliance-store/demo",
      sortOrder: 0,
    });
    expect(result.cloudinaryPublicId).toBe("appliance-store/demo");
  });
});

describe("listAdminProductsSchema", () => {
  it("allows optional status filter including SOLD", () => {
    const result = listAdminProductsSchema.parse({
      page: 1,
      status: "SOLD",
    });
    expect(result.status).toBe("SOLD");
  });

  it("accepts valid sort and dir", () => {
    const result = listAdminProductsSchema.parse({
      sort: "title",
      dir: "asc",
    });
    expect(result.sort).toBe("title");
    expect(result.dir).toBe("asc");
  });

  it("rejects invalid sort", () => {
    expect(() =>
      listAdminProductsSchema.parse({ sort: "invalid" }),
    ).toThrow();
  });

  it("defaults dir to desc when sort is provided", () => {
    const result = listAdminProductsSchema.parse({ sort: "price" });
    expect(result.dir).toBe("desc");
  });
});
