import { z } from "zod";
import { productConditionSchema } from "./product";

const slugSchema = z
  .string()
  .trim()
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Латиниця, дефіси");

const adminProductFormFields = {
  title: z.string().trim().min(2, "Вкажіть назву товару"),
  slug: z.union([slugSchema, z.literal("")]).optional(),
  description: z.union([z.string().trim().max(10_000), z.literal("")]).optional(),
  brand: z.string().trim().min(1, "Вкажіть бренд"),
  categoryId: z.string().cuid("Оберіть категорію"),
  condition: productConditionSchema,
  priceUah: z.coerce.number().int().positive("Ціна має бути додатною"),
} as const;

const createQuantitySchema = z.coerce
  .number()
  .int()
  .min(1, "Кількість має бути не менше 1")
  .max(999, "Максимум 999 одиниць");

const editQuantitySchema = z.coerce
  .number()
  .int()
  .min(0, "Кількість не може бути від'ємною")
  .max(999, "Максимум 999 одиниць");

function normalizeAdminProductFormFields<
  T extends {
    title: string;
    brand: string;
    categoryId: string;
    condition: z.infer<typeof productConditionSchema>;
    priceUah: number;
    quantity: number;
    slug?: string;
    description?: string;
  },
>(data: T) {
  return {
    title: data.title,
    brand: data.brand,
    categoryId: data.categoryId,
    condition: data.condition,
    priceUah: data.priceUah,
    quantity: data.quantity,
    slug: data.slug === "" ? undefined : data.slug,
    description: data.description === "" ? undefined : data.description,
  };
}

export const upsertProductSchema = z
  .object({
    ...adminProductFormFields,
    quantity: createQuantitySchema,
  })
  .transform(normalizeAdminProductFormFields);

/** Client edit form — quantity 0 allowed (write-off / sold out). */
export const editProductFormSchema = z
  .object({
    ...adminProductFormFields,
    quantity: editQuantitySchema,
  })
  .transform(normalizeAdminProductFormFields);

export const updateProductSchema = z
  .object({
    id: z.string().cuid("Невірний ідентифікатор товару"),
    ...adminProductFormFields,
    quantity: editQuantitySchema,
  })
  .transform((data) => ({
    id: data.id,
    ...normalizeAdminProductFormFields(data),
  }));

export const productImageInputSchema = z.object({
  cloudinaryPublicId: z.string().trim().min(1, "Невірний ідентифікатор зображення"),
  alt: z.union([z.string().trim().max(200), z.literal("")]).optional(),
  sortOrder: z.number().int().nonnegative(),
  width: z.number().int().positive().optional(),
  height: z.number().int().positive().optional(),
});

export const saveProductImagesSchema = z.object({
  productId: z.string().cuid("Невірний ідентифікатор товару"),
  images: z.array(productImageInputSchema).max(8, "Максимум 8 фото"),
});

const adminProductPageSizeSchema = z.coerce
  .number()
  .int()
  .refine((value): value is 10 | 20 | 50 => value === 10 || value === 20 || value === 50);

export const adminProductStockFilterSchema = z.enum(["in_stock", "out_of_stock"]);

export const adminProductListSortSchema = z.enum([
  "title",
  "category",
  "price",
  "quantity",
]);

export const adminProductListDirSchema = z.enum(["asc", "desc"]);

export const listAdminProductsSchema = z.object({
  page: z.coerce.number().int().min(1).max(1000).default(1),
  pageSize: adminProductPageSizeSchema.default(20),
  stock: adminProductStockFilterSchema.optional(),
  categoryId: z.string().cuid().optional(),
  q: z.string().max(100).optional(),
  sort: adminProductListSortSchema.optional(),
  dir: adminProductListDirSchema.default("desc"),
});

export type UpsertProductInput = z.input<typeof upsertProductSchema>;
export type UpsertProductValues = z.output<typeof upsertProductSchema>;
export type UpdateProductValues = z.output<typeof updateProductSchema>;
export type ProductImageInput = z.output<typeof productImageInputSchema>;
export type ListAdminProductsFilters = z.output<typeof listAdminProductsSchema>;
export type AdminProductListSort = z.output<typeof adminProductListSortSchema>;
export type AdminProductListDir = z.output<typeof adminProductListDirSchema>;
export type AdminProductStockFilter = z.output<typeof adminProductStockFilterSchema>;
