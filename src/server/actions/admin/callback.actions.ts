"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/permissions";
import {
  CALLBACK_ALREADY_ARCHIVED,
  CALLBACK_NOT_CONSULTED,
  CALLBACK_NOT_FOUND,
  archiveCallbackRequest,
  updateCallbackRequestNote,
  updateCallbackRequestStatus,
} from "@/server/services/callback-request.service";
import {
  archiveCallbackSchema,
  updateCallbackNoteSchema,
  updateCallbackStatusSchema,
} from "@/server/validators/admin-callback";

type CallbackActionResult =
  | { ok: true }
  | {
      ok: false;
      error:
        | "VALIDATION"
        | "NOT_FOUND"
        | "NOT_CONSULTED"
        | "ALREADY_ARCHIVED"
        | "UNKNOWN";
    };

function mapServiceError(message: string): CallbackActionResult {
  if (message === CALLBACK_NOT_FOUND) {
    return { ok: false, error: "NOT_FOUND" };
  }
  if (message === CALLBACK_NOT_CONSULTED) {
    return { ok: false, error: "NOT_CONSULTED" };
  }
  if (message === CALLBACK_ALREADY_ARCHIVED) {
    return { ok: false, error: "ALREADY_ARCHIVED" };
  }
  return { ok: false, error: "UNKNOWN" };
}

export async function updateCallbackStatusAction(
  input: unknown,
): Promise<CallbackActionResult> {
  await requireAdmin();
  const parsed = updateCallbackStatusSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: "VALIDATION" };
  }

  try {
    await updateCallbackRequestStatus(parsed.data.id, parsed.data.status);
    revalidatePath("/admin/dzvinky");
    return { ok: true };
  } catch (error) {
    if (error instanceof Error) {
      return mapServiceError(error.message);
    }
    return { ok: false, error: "UNKNOWN" };
  }
}

export async function updateCallbackNoteAction(
  input: unknown,
): Promise<CallbackActionResult> {
  await requireAdmin();
  const parsed = updateCallbackNoteSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: "VALIDATION" };
  }

  try {
    await updateCallbackRequestNote(
      parsed.data.id,
      parsed.data.note ?? "",
    );
    revalidatePath("/admin/dzvinky");
    return { ok: true };
  } catch (error) {
    if (error instanceof Error) {
      return mapServiceError(error.message);
    }
    return { ok: false, error: "UNKNOWN" };
  }
}

export async function archiveCallbackRequestAction(
  input: unknown,
): Promise<CallbackActionResult> {
  await requireAdmin();
  const parsed = archiveCallbackSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: "VALIDATION" };
  }

  try {
    await archiveCallbackRequest(parsed.data.id);
    revalidatePath("/admin/dzvinky");
    return { ok: true };
  } catch (error) {
    if (error instanceof Error) {
      return mapServiceError(error.message);
    }
    return { ok: false, error: "UNKNOWN" };
  }
}
