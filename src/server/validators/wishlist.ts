import { z } from "zod";

export const wishlistProductIdSchema = z.object({
  productId: z.string().cuid("Невірний ідентифікатор товару"),
});

export const resolveGuestWishlistSchema = z.object({
  productIds: z
    .array(z.string().cuid("Невірний ідентифікатор товару"))
    .max(20, "Занадто багато товарів у списку обраного"),
});
