"use server";

import { headers } from "next/headers";
import { ZodError } from "zod";
import { CallbackRateLimitError } from "@/server/services/callback-request.service";
import { createCallbackRequest } from "@/server/services/callback-request.service";
import { callbackRequestSchema } from "@/server/validators/callback";

export type SubmitCallbackResult =
  | { ok: true }
  | {
      ok: false;
      error: "VALIDATION" | "RATE_LIMIT" | "UNKNOWN";
      message?: string;
    };

async function resolveClientIp(): Promise<string | null> {
  const h = await headers();
  const forwarded = h.get("x-forwarded-for");
  if (forwarded) {
    const first = forwarded.split(",")[0]?.trim();
    if (first) return first;
  }
  return h.get("x-real-ip")?.trim() || null;
}

export async function submitCallbackRequestAction(
  input: unknown,
): Promise<SubmitCallbackResult> {
  try {
    const data = callbackRequestSchema.parse(input);
    await createCallbackRequest({
      phone: data.phone,
      ipAddress: await resolveClientIp(),
    });
    return { ok: true };
  } catch (error) {
    if (error instanceof ZodError) {
      const message =
        error.issues[0]?.message ??
        "Вкажіть номер телефону — лише цифри, від 10 до 15";
      return { ok: false, error: "VALIDATION", message };
    }
    if (error instanceof CallbackRateLimitError) {
      return { ok: false, error: "RATE_LIMIT", message: error.message };
    }
    return { ok: false, error: "UNKNOWN" };
  }
}
