import { describe, expect, it } from "vitest";
import {
  editProductFormSchema,
  listAdminProductsSchema,
  productImageInputSchema,
  updateProductSchema,
  upsertProductSchema,
} from "./admin-product";

const validUpsert = {
  title: "Холодильник Samsung",
  brand: "Samsung",
  categoryId: "clxxxxxxxxxxxxxxxxxxxxxxxxx",
  condition: "GOOD" as const,
  status: "DRAFT" as const,
  priceUah: 4500,
  quantity: 1,
};

const validUpdate = {
  ...validUpsert,
  id: "clxxxxxxxxxxxxxxxxxxxxxxxy",
};

describe("upsertProductSchema", () => {
  it("accepts valid product input with price in UAH", () => {
    const result = upsertProductSchema.parse({
      ...validUpsert,
    });
    expect(result.priceUah).toBe(4500);
    expect(result.status).toBe("DRAFT");
  });

  it("rejects SOLD status in admin form", () => {
    expect(() =>
      upsertProductSchema.parse({
        ...validUpsert,
        title: "Test",
        brand: "B",
        status: "SOLD",
        priceUah: 100,
        quantity: 1,
      }),
    ).toThrow();
  });

  it("accepts quantity 1 on create", () => {
    const result = upsertProductSchema.parse({ ...validUpsert, quantity: 1 });
    expect(result.quantity).toBe(1);
  });

  it("rejects quantity 0 on create", () => {
    expect(() =>
      upsertProductSchema.parse({ ...validUpsert, quantity: 0 }),
    ).toThrow();
  });

  it("rejects quantity over 999 on create", () => {
    expect(() =>
      upsertProductSchema.parse({ ...validUpsert, quantity: 1000 }),
    ).toThrow();
  });
});

describe("editProductFormSchema", () => {
  it("accepts quantity 0 without product id", () => {
    const result = editProductFormSchema.parse({ ...validUpsert, quantity: 0 });
    expect(result.quantity).toBe(0);
  });
});

describe("updateProductSchema", () => {
  it("accepts quantity 0 on edit", () => {
    const result = updateProductSchema.parse({ ...validUpdate, quantity: 0 });
    expect(result.quantity).toBe(0);
  });

  it("rejects quantity over 999 on edit", () => {
    expect(() =>
      updateProductSchema.parse({ ...validUpdate, quantity: 1000 }),
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
