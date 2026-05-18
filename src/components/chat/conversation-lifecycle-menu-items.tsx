import type { ComponentType, ReactNode } from "react";
import type { ConversationStatus } from "@/generated/prisma/client";
import type { AdminChatView } from "@/lib/admin-chat-url";

export type LifecycleMenuItemProps = {
  onClick?: () => void;
  disabled?: boolean;
  variant?: "default" | "destructive";
  children?: ReactNode;
};

type ConversationLifecycleMenuItemsProps = {
  Item: ComponentType<LifecycleMenuItemProps>;
  view: AdminChatView;
  status: ConversationStatus;
  pending: boolean;
  onArchive: () => void;
  onUnarchive: () => void;
  onRequestDelete: () => void;
};

export function ConversationLifecycleMenuItems({
  Item,
  view,
  status,
  pending,
  onArchive,
  onUnarchive,
  onRequestDelete,
}: ConversationLifecycleMenuItemsProps) {
  const showArchive = view === "active" && status === "OPEN";
  const showUnarchive = view === "archive" && status === "ARCHIVED";

  return (
    <>
      {showArchive ? (
        <Item onClick={onArchive} disabled={pending}>
          Архівувати
        </Item>
      ) : null}
      {showUnarchive ? (
        <Item onClick={onUnarchive} disabled={pending}>
          Повернути з архіву
        </Item>
      ) : null}
      <Item
        variant="destructive"
        onClick={onRequestDelete}
        disabled={pending}
      >
        Видалити назавжди
      </Item>
    </>
  );
}
