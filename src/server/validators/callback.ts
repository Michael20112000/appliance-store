import { z } from "zod";
import { uaPhoneSchema } from "./phone";

export const callbackRequestSchema = z.object({
  phone: uaPhoneSchema,
});

export type CallbackRequestInput = z.infer<typeof callbackRequestSchema>;
