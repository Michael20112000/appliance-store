import { z } from "zod";

const uaPhoneSchema = z
  .string()
  .trim()
  .regex(/^\d{10,15}$/, "Вкажіть номер телефону — лише цифри, від 10 до 15");

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

export const guestCheckoutSchema = checkoutSchema.extend({
  productIds: z
    .array(z.string().cuid("Невірний ідентифікатор товару"))
    .min(1, "Кошик порожній")
    .max(20, "Занадто багато товарів у кошику"),
});

export type GuestCheckoutInput = z.infer<typeof guestCheckoutSchema>;
