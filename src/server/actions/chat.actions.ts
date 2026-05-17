"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin, requireBuyer } from "@/lib/permissions";
import {
  getConversationForBuyer,
  markAdminRead,
  markBuyerRead,
} from "@/server/services/chat.service";

export async function markBuyerReadAction(conversationId: string) {
  const session = await requireBuyer();
  const conversation = await getConversationForBuyer(session.user.id);

  if (!conversation || conversation.id !== conversationId) {
    return { ok: false as const, error: "FORBIDDEN" };
  }

  await markBuyerRead(conversationId);
  revalidatePath("/", "layout");
  return { ok: true as const };
}

export async function markAdminReadAction(conversationId: string) {
  await requireAdmin();
  await markAdminRead(conversationId);
  revalidatePath("/admin/chaty");
  revalidatePath("/", "layout");
  return { ok: true as const };
}
