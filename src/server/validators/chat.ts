import { z } from "zod";

const CLOUDINARY_URL_RE =
  /^https:\/\/res\.cloudinary\.com\/[a-z0-9_-]+\/(image|raw|video)\/upload\//i;

export const chatAttachmentSchema = z.object({
  publicId: z
    .string()
    .min(1)
    .max(500)
    .regex(/^chat\//, "publicId must be under the 'chat/' folder"),
  resourceType: z.enum(["image"]),
  url: z
    .string()
    .url()
    .max(2000)
    .refine(
      (val) => CLOUDINARY_URL_RE.test(val),
      "url must be a Cloudinary delivery URL",
    ),
  filename: z.string().min(1).max(255),
  bytes: z.number().int().positive().max(10_485_760),
});

export const sendMessageSchema = z
  .object({
    body: z
      .string()
      .trim()
      .max(2000, "Повідомлення занадто довге (максимум 2000 символів)")
      .default(""),
    conversationId: z
      .string()
      .cuid("Невірний ідентифікатор розмови")
      .optional(),
    productId: z.string().cuid("Невірний ідентифікатор товару").optional(),
    guestToken: z.string().uuid("Невірний гостьовий токен").optional(),
    attachments: z
      .array(chatAttachmentSchema)
      .max(1, "Максимум 1 вкладення")
      .optional(),
  })
  .refine(
    (data) =>
      data.body.length > 0 || (data.attachments?.length ?? 0) > 0,
    { message: "Потрібне повідомлення або вкладення" },
  );

export type SendMessageInput = z.infer<typeof sendMessageSchema>;
