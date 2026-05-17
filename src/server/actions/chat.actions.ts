"use server";

import { revalidatePath } from "next/cache";
import { requireBuyer } from "@/lib/permissions";
import {
  getConversationForBuyer,
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
