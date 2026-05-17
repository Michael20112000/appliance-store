import { z } from "zod";

const slugSchema = z
  .string()
  .trim()
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Латиниця, дефіси");

export const upsertCategorySchema = z.object({
  name: z.string().trim().min(2, "Вкажіть назву категорії"),
  slug: z.preprocess(
    (value) => (value === "" || value == null ? undefined : value),
    slugSchema.optional(),
  ),
  description: z.preprocess(
    (value) => (value === "" ? undefined : value),
    z.string().trim().max(2000).optional(),
  ),
  sortOrder: z.coerce.number().int().default(0),
});

export const updateCategorySchema = upsertCategorySchema.extend({
  id: z.string().cuid("Невірний ідентифікатор категорії"),
});

export type UpsertCategoryInput = z.infer<typeof upsertCategorySchema>;
export type UpdateCategoryInput = z.infer<typeof updateCategorySchema>;
