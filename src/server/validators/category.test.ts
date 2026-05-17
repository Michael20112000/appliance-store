import { describe, expect, it } from "vitest";
import { upsertCategorySchema } from "./category";

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
