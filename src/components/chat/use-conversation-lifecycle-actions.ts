"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { useAdminChat } from "@/components/chat/admin-chat-provider";
import {
  archiveConversationAction,
  deleteConversationAction,
  unarchiveConversationAction,
} from "@/server/actions/admin/chat.actions";

export function useConversationLifecycleActions(conversationId: string) {
  const {
    view,
    selectedConversationId,
    clearSelectionAndRefresh,
    refreshInbox,
  } = useAdminChat();
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [pending, startTransition] = useTransition();

  const afterArchiveOrDelete = () => {
    if (selectedConversationId === conversationId) {
      clearSelectionAndRefresh();
    } else {
      refreshInbox();
    }
  };

  const handleArchive = () => {
    startTransition(async () => {
      try {
        await archiveConversationAction(conversationId);
        toast.success("Діалог архівовано");
        afterArchiveOrDelete();
      } catch {
        toast.error("Не вдалося архівувати діалог");
      }
    });
  };

  const handleUnarchive = () => {
    startTransition(async () => {
      try {
        await unarchiveConversationAction(conversationId);
        toast.success("Діалог повернуто в активні");
        refreshInbox();
      } catch {
        toast.error("Не вдалося повернути діалог з архіву");
      }
    });
  };

  const handleDelete = () => {
    startTransition(async () => {
      try {
        await deleteConversationAction(conversationId);
        toast.success("Діалог видалено");
        setDeleteOpen(false);
        afterArchiveOrDelete();
      } catch {
        toast.error("Не вдалося видалити діалог");
      }
    });
  };

  return {
    view,
    pending,
    deleteOpen,
    setDeleteOpen,
    handleArchive,
    handleUnarchive,
    handleDelete,
  };
}
