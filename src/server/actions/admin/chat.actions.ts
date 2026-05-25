"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireAdmin } from "@/lib/permissions";
import {
  conversationChannel,
  getPusherServer,
  PusherNotConfiguredError,
} from "@/lib/pusher-server";
import {
  archiveConversation,
  deleteConversation,
  unarchiveConversation,
} from "@/server/services/chat.service";

const conversationIdSchema = z
  .string()
  .cuid("Невірний ідентифікатор розмови");

function revalidateAdminChat() {
  revalidatePath("/admin/chaty");
  revalidatePath("/", "layout");
}

export async function archiveConversationAction(conversationId: string) {
  await requireAdmin();
  const id = conversationIdSchema.parse(conversationId);
  await archiveConversation(id);
  try {
    await getPusherServer().trigger(
      conversationChannel(id),
      "conversation:closed",
      { conversationId: id },
    );
  } catch (error) {
    if (!(error instanceof PusherNotConfiguredError)) throw error;
  }
  revalidateAdminChat();
  return { ok: true as const };
}

export async function unarchiveConversationAction(conversationId: string) {
  await requireAdmin();
  const id = conversationIdSchema.parse(conversationId);
  await unarchiveConversation(id);
  revalidateAdminChat();
  return { ok: true as const };
}

export async function deleteConversationAction(conversationId: string) {
  await requireAdmin();
  const id = conversationIdSchema.parse(conversationId);
  await deleteConversation(id);
  revalidateAdminChat();
  return { ok: true as const };
}
