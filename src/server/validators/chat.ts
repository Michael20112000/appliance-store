import { z } from "zod";

export const sendMessageSchema = z.object({
  body: z
    .string()
    .trim()
    .min(1, "Повідомлення не може бути порожнім")
    .max(2000, "Повідомлення занадто довге (максимум 2000 символів)"),
  conversationId: z
    .string()
    .cuid("Невірний ідентифікатор розмови")
    .optional(),
  productId: z.string().cuid("Невірний ідентифікатор товару").optional(),
});

export type SendMessageInput = z.infer<typeof sendMessageSchema>;
