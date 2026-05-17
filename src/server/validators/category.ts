import { z } from "zod";

const slugSchema = z
  .string()
  .trim()
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Латиниця, дефіси");

export const upsertCategorySchema = z
  .object({
    name: z.string().trim().min(2, "Вкажіть назву категорії"),
    slug: z.union([slugSchema, z.literal("")]).optional(),
    description: z.union([z.string().trim().max(2000), z.literal("")]).optional(),
    sortOrder: z.coerce.number().int().default(0),
  })
  .transform((data) => ({
    name: data.name,
    sortOrder: data.sortOrder,
    slug: data.slug === "" ? undefined : data.slug,
    description: data.description === "" ? undefined : data.description,
  }));

export const updateCategorySchema = z
  .object({
    id: z.string().cuid("Невірний ідентифікатор категорії"),
    name: z.string().trim().min(2, "Вкажіть назву категорії"),
    slug: z.union([slugSchema, z.literal("")]).optional(),
    description: z.union([z.string().trim().max(2000), z.literal("")]).optional(),
    sortOrder: z.coerce.number().int().default(0),
  })
  .transform((data) => ({
    id: data.id,
    name: data.name,
    sortOrder: data.sortOrder,
    slug: data.slug === "" ? undefined : data.slug,
    description: data.description === "" ? undefined : data.description,
  }));

export const updateCategoryImageSchema = z
  .object({
    categoryId: z.string().cuid("Невірний ідентифікатор категорії"),
    imagePublicId: z.string().trim().min(1).nullable(),
    imageAlt: z.union([z.string().trim().max(500), z.literal("")]).optional(),
  })
  .transform((data) => ({
    categoryId: data.categoryId,
    imagePublicId: data.imagePublicId,
    imageAlt: data.imageAlt === "" ? null : (data.imageAlt ?? null),
  }));

export type UpsertCategoryInput = z.input<typeof upsertCategorySchema>;
export type UpsertCategoryValues = z.output<typeof upsertCategorySchema>;
export type UpdateCategoryValues = z.output<typeof updateCategorySchema>;
export type UpdateCategoryImageValues = z.output<typeof updateCategoryImageSchema>;
