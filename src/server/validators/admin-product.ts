import { z } from "zod";
import { productConditionSchema, productStatusSchema } from "./product";

const slugSchema = z
  .string()
  .trim()
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Латиниця, дефіси");

export const adminFormProductStatusSchema = z.enum(["DRAFT", "AVAILABLE"]);

export const upsertProductSchema = z
  .object({
    title: z.string().trim().min(2, "Вкажіть назву товару"),
    slug: z.union([slugSchema, z.literal("")]).optional(),
    description: z.union([z.string().trim().max(10_000), z.literal("")]).optional(),
    brand: z.string().trim().min(1, "Вкажіть бренд"),
    categoryId: z.string().cuid("Оберіть категорію"),
    condition: productConditionSchema,
    status: adminFormProductStatusSchema,
    priceUah: z.coerce.number().int().positive("Ціна має бути додатною"),
  })
  .transform((data) => ({
    title: data.title,
    brand: data.brand,
    categoryId: data.categoryId,
    condition: data.condition,
    status: data.status,
    priceUah: data.priceUah,
    slug: data.slug === "" ? undefined : data.slug,
    description: data.description === "" ? undefined : data.description,
  }));

export const updateProductSchema = z
  .object({
    id: z.string().cuid("Невірний ідентифікатор товару"),
    title: z.string().trim().min(2, "Вкажіть назву товару"),
    slug: z.union([slugSchema, z.literal("")]).optional(),
    description: z.union([z.string().trim().max(10_000), z.literal("")]).optional(),
    brand: z.string().trim().min(1, "Вкажіть бренд"),
    categoryId: z.string().cuid("Оберіть категорію"),
    condition: productConditionSchema,
    status: adminFormProductStatusSchema,
    priceUah: z.coerce.number().int().positive("Ціна має бути додатною"),
  })
  .transform((data) => ({
    id: data.id,
    title: data.title,
    brand: data.brand,
    categoryId: data.categoryId,
    condition: data.condition,
    status: data.status,
    priceUah: data.priceUah,
    slug: data.slug === "" ? undefined : data.slug,
    description: data.description === "" ? undefined : data.description,
  }));

export const productImageInputSchema = z.object({
  cloudinaryPublicId: z.string().trim().min(1, "Невірний ідентифікатор зображення"),
  alt: z.union([z.string().trim().max(200), z.literal("")]).optional(),
  sortOrder: z.number().int().nonnegative(),
  width: z.number().int().positive().optional(),
  height: z.number().int().positive().optional(),
});

export const updateProductStatusSchema = z.object({
  productId: z.string().cuid("Невірний ідентифікатор товару"),
  status: adminFormProductStatusSchema,
});

export const saveProductImagesSchema = z.object({
  productId: z.string().cuid("Невірний ідентифікатор товару"),
  images: z.array(productImageInputSchema).max(8, "Максимум 8 фото"),
});

const adminProductPageSizeSchema = z.coerce
  .number()
  .int()
  .refine((value): value is 10 | 20 | 50 => value === 10 || value === 20 || value === 50);

export const listAdminProductsSchema = z.object({
  page: z.coerce.number().int().min(1).max(1000).default(1),
  pageSize: adminProductPageSizeSchema.default(20),
  status: productStatusSchema.optional(),
  categoryId: z.string().cuid().optional(),
  q: z.string().max(100).optional(),
});

export type UpsertProductInput = z.input<typeof upsertProductSchema>;
export type UpsertProductValues = z.output<typeof upsertProductSchema>;
export type UpdateProductValues = z.output<typeof updateProductSchema>;
export type ProductImageInput = z.output<typeof productImageInputSchema>;
export type ListAdminProductsFilters = z.output<typeof listAdminProductsSchema>;
