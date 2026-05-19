import { z } from "zod";

export const uaPhoneSchema = z
  .string()
  .trim()
  .regex(
    /^\d{10,15}$/,
    "Вкажіть номер телефону — лише цифри, від 10 до 15",
  );
