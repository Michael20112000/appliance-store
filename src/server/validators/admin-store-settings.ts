import { z } from "zod";
import { uaPhoneSchema } from "./phone";

const labelSchema = z.string().trim().max(100).optional();

export const storePhoneInputSchema = z.object({
  digits: uaPhoneSchema,
  label: labelSchema,
});

export const storeEmailInputSchema = z.object({
  email: z.string().trim().email("Невірний email").max(254),
  label: labelSchema,
});

export const storeAddressInputSchema = z.object({
  text: z.string().trim().min(3, "Адреса занадто коротка").max(500),
  mapUrl: z.string().trim().url("Невірне посилання на карту").max(2000).optional().or(z.literal("")),
  latitude: z.number().min(-90).max(90).optional(),
  longitude: z.number().min(-180).max(180).optional(),
  label: labelSchema,
});

export const adminStoreSettingsSchema = z.object({
  phones: z.array(storePhoneInputSchema).max(20),
  emails: z.array(storeEmailInputSchema).max(20),
  addresses: z.array(storeAddressInputSchema).max(20),
});

export type AdminStoreSettingsInput = z.infer<typeof adminStoreSettingsSchema>;
