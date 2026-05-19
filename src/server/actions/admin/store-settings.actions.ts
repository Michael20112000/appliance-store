"use server";

import { revalidatePath } from "next/cache";
import { ZodError } from "zod";
import { requireAdmin } from "@/lib/permissions";
import {
  getAdminStoreSettings,
  saveStoreSettings,
} from "@/server/services/store-settings.service";
import { adminStoreSettingsSchema } from "@/server/validators/admin-store-settings";

function revalidateStoreContactPaths() {
  revalidatePath("/", "layout");
  revalidatePath("/admin/nalashtuvannia");
}

export async function getAdminStoreSettingsAction() {
  await requireAdmin();
  return getAdminStoreSettings();
}

export type SaveStoreSettingsResult =
  | { ok: true }
  | { ok: false; error: "VALIDATION" | "UNKNOWN"; message?: string };

export async function saveStoreSettingsAction(
  input: unknown,
): Promise<SaveStoreSettingsResult> {
  await requireAdmin();

  try {
    const data = adminStoreSettingsSchema.parse(input);
    await saveStoreSettings(data);
    revalidateStoreContactPaths();
    return { ok: true };
  } catch (error) {
    if (error instanceof ZodError) {
      return {
        ok: false,
        error: "VALIDATION",
        message: error.issues[0]?.message ?? "Перевірте дані форми",
      };
    }
    return { ok: false, error: "UNKNOWN" };
  }
}
