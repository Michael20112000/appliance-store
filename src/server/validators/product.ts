import { z } from "zod";

export const productConditionSchema = z.enum(["LIKE_NEW", "GOOD", "FAIR"]);
export const productStatusSchema = z.enum(["AVAILABLE", "SOLD", "DRAFT"]);

export const catalogFiltersSchema = z.object({
  q: z.string().max(100).optional(),
  brand: z.string().max(100).optional(),
  minPrice: z.number().int().nonnegative().optional(),
  maxPrice: z.number().int().nonnegative().optional(),
  conditions: z.array(productConditionSchema).optional(),
});

export const listProductsSchema = z.object({
  page: z.number().int().min(1).max(1000).default(1),
  pageSize: z.number().int().min(1).max(24).default(24),
});
