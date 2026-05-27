import { z } from "zod";

export const cartProductIdSchema = z.object({
  productId: z.string().cuid("Невірний ідентифікатор товару"),
});

export const addToCartSchema = z.object({
  productId: z.string().cuid("Невірний ідентифікатор товару"),
  quantity: z.literal(1),
});

export const mergePendingSchema = z.object({
  items: z
    .array(
      z.object({
        productId: z.string().cuid("Невірний ідентифікатор товару"),
      }),
    )
    .max(20, "Занадто багато товарів для об'єднання"),
});

export const resolveGuestCartSchema = z.object({
  productIds: z
    .array(z.string().cuid("Невірний ідентифікатор товару"))
    .max(20, "Занадто багато товарів у кошику"),
});
