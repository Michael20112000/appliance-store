import { describe, expect, it } from "vitest";
import { updateCategoryImageSchema, upsertCategorySchema } from "./category";

const validCategoryId = "clxyz1234567890abcdefghij";

describe("upsertCategorySchema", () => {
  it("rejects name shorter than 2 chars with Ukrainian message", () => {
    const result = upsertCategorySchema.safeParse({
      name: "А",
      sortOrder: 0,
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0]?.message).toBe("Вкажіть назву категорії");
    }
  });

  it("accepts valid category payload", () => {
    const result = upsertCategorySchema.safeParse({
      name: "Холодильники",
      slug: "kholodylnyky",
      description: "Опис",
      sortOrder: 2,
    });
    expect(result.success).toBe(true);
  });

  it("rejects invalid slug format", () => {
    const result = upsertCategorySchema.safeParse({
      name: "Тест",
      slug: "Bad Slug!",
      sortOrder: 0,
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues.some((i) => i.message === "Латиниця, дефіси")).toBe(
        true,
      );
    }
  });
});

describe("updateCategoryImageSchema", () => {
  it("accepts valid cuid and public_id", () => {
    const result = updateCategoryImageSchema.safeParse({
      categoryId: validCategoryId,
      imagePublicId: "appliance-store/category-demo",
      imageAlt: "Холодильники",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.categoryId).toBe(validCategoryId);
      expect(result.data.imagePublicId).toBe("appliance-store/category-demo");
      expect(result.data.imageAlt).toBe("Холодильники");
    }
  });

  it("rejects invalid cuid", () => {
    const result = updateCategoryImageSchema.safeParse({
      categoryId: "not-a-cuid",
      imagePublicId: "appliance-store/category-demo",
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0]?.message).toBe("Невірний ідентифікатор категорії");
    }
  });

  it("accepts imagePublicId null for clear", () => {
    const result = updateCategoryImageSchema.safeParse({
      categoryId: validCategoryId,
      imagePublicId: null,
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.imagePublicId).toBeNull();
      expect(result.data.imageAlt).toBeNull();
    }
  });

  it("rejects empty string when imagePublicId is not null", () => {
    const result = updateCategoryImageSchema.safeParse({
      categoryId: validCategoryId,
      imagePublicId: "   ",
    });
    expect(result.success).toBe(false);
  });

  it("normalizes empty imageAlt to null", () => {
    const result = updateCategoryImageSchema.safeParse({
      categoryId: validCategoryId,
      imagePublicId: "appliance-store/category-demo",
      imageAlt: "",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.imageAlt).toBeNull();
    }
  });
});
