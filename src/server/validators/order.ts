import { z } from "zod";

const uaPhoneSchema = z
  .string()
  .trim()
  .regex(
    /^\+380\d{9}$/,
    "Вкажіть телефон у форматі +380XXXXXXXXX",
  );

export const deliveryTypeSchema = z.enum(["PICKUP", "LVIV_DELIVERY"]);

export const checkoutSchema = z
  .object({
    customerName: z
      .string()
      .trim()
      .min(2, "Ім'я має містити щонайменше 2 символи")
      .max(100),
    customerPhone: uaPhoneSchema,
    deliveryType: deliveryTypeSchema,
    deliveryAddress: z.string().trim().max(500).optional(),
    notes: z.string().trim().max(500).optional(),
  })
  .superRefine((data, ctx) => {
    if (data.deliveryType === "LVIV_DELIVERY") {
      if (!data.deliveryAddress || data.deliveryAddress.length < 10) {
        ctx.addIssue({
          code: "custom",
          message: "Вкажіть адресу доставки по Львову (щонайменше 10 символів)",
          path: ["deliveryAddress"],
        });
      }
    }
  });

export type CheckoutInput = z.infer<typeof checkoutSchema>;
