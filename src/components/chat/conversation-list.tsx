"use client";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import { Skeleton } from "@/components/ui/skeleton";
import { ConversationLifecycleDeleteDialog } from "@/components/chat/conversation-lifecycle-delete-dialog";
import { ConversationLifecycleMenuItems } from "@/components/chat/conversation-lifecycle-menu-items";
import { useConversationLifecycleActions } from "@/components/chat/use-conversation-lifecycle-actions";
import { cn } from "@/lib/utils";
import type { ConversationSummaryDto } from "@/types/chat";

const timeFormatter = new Intl.DateTimeFormat("uk-UA", {
  day: "numeric",
  month: "short",
  hour: "2-digit",
  minute: "2-digit",
});

function buyerInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "П";
  if (parts.length === 1) return parts[0]!.slice(0, 2).toUpperCase();
  return `${parts[0]![0] ?? ""}${parts[1]![0] ?? ""}`.toUpperCase();
}

function formatListTime(iso: string | null): string {
  if (!iso) return "";
  return timeFormatter.format(new Date(iso));
}

type ConversationListRowProps = {
  conversation: ConversationSummaryDto;
  isSelected: boolean;
  showUnreadHighlight: boolean;
  enableContextMenu: boolean;
  onSelect: (conversationId: string) => void;
};

function ConversationListRow({
  conversation,
  isSelected,
  showUnreadHighlight,
  enableContextMenu,
  onSelect,
}: ConversationListRowProps) {
  const lifecycle = useConversationLifecycleActions(conversation.id);
  const displayName = conversation.buyerName || conversation.buyerEmail;

  const rowButton = (
    <button
      type="button"
      role="option"
      aria-selected={isSelected}
      aria-label={enableContextMenu ? "Дії з діалогом" : undefined}
      onClick={() => onSelect(conversation.id)}
      onContextMenu={
        enableContextMenu ? (event) => event.preventDefault() : undefined
      }
      className={cn(
        "flex min-h-14 w-full items-start gap-3 px-3 py-3 text-left transition-colors hover:bg-muted/50",
        isSelected && "bg-muted/70",
        showUnreadHighlight &&
          conversation.unreadForAdmin &&
          "border-l-2 border-primary font-semibold",
      )}
    >
      <Avatar size="sm" className="mt-0.5">
        <AvatarFallback>{buyerInitials(displayName)}</AvatarFallback>
      </Avatar>
      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-2">
          <p className="truncate text-sm font-semibold">{displayName}</p>
          <span className="shrink-0 text-xs text-muted-foreground">
            {formatListTime(conversation.lastMessageAt)}
          </span>
        </div>
        {conversation.buyerEmail ? (
          <p className="truncate text-xs text-muted-foreground">
            {conversation.buyerEmail}
          </p>
        ) : null}
        {conversation.lastMessagePreview ? (
          <p className="mt-0.5 line-clamp-1 text-sm text-muted-foreground">
            {conversation.lastMessagePreview}
          </p>
        ) : null}
      </div>
    </button>
  );

  if (!enableContextMenu) {
    return rowButton;
  }

  return (
    <>
      <ContextMenu>
        <ContextMenuTrigger nativeButton render={rowButton} />
        <ContextMenuContent align="end">
          <ConversationLifecycleMenuItems
            Item={ContextMenuItem}
            view={lifecycle.view}
            status={conversation.status}
            pending={lifecycle.pending}
            onArchive={lifecycle.handleArchive}
            onUnarchive={lifecycle.handleUnarchive}
            onRequestDelete={() => lifecycle.setDeleteOpen(true)}
          />
        </ContextMenuContent>
      </ContextMenu>
      <ConversationLifecycleDeleteDialog
        open={lifecycle.deleteOpen}
        onOpenChange={lifecycle.setDeleteOpen}
        pending={lifecycle.pending}
        onConfirm={lifecycle.handleDelete}
      />
    </>
  );
}

type ConversationListProps = {
  conversations: ConversationSummaryDto[];
  selectedId: string | null;
  isLoading?: boolean;
  enableContextMenu?: boolean;
  onSelect: (conversationId: string) => void;
  showUnreadHighlight?: boolean;
  emptyTitle?: string;
  emptyBody?: string;
};

export function ConversationList({
  conversations,
  selectedId,
  isLoading = false,
  enableContextMenu = false,
  onSelect,
  showUnreadHighlight = true,
  emptyTitle = "Ще немає повідомлень",
  emptyBody = "Коли покупець напише, діалог з'явиться тут.",
}: ConversationListProps) {
  if (isLoading) {
    return (
      <div
        className="flex flex-col gap-1 border-r border-border p-2"
        aria-busy="true"
      >
        {Array.from({ length: 6 }).map((_, index) => (
          <Skeleton key={index} className="min-h-14 w-full rounded-md" />
        ))}
      </div>
    );
  }

  if (conversations.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center border-r border-border px-4 py-12 text-center">
        <p className="text-sm font-semibold">{emptyTitle}</p>
        <p className="mt-2 text-sm text-muted-foreground">{emptyBody}</p>
      </div>
    );
  }

  return (
    <div
      className="flex flex-col overflow-y-auto border-r border-border"
      role="listbox"
      aria-label="Діалоги з покупцями"
    >
      {conversations.map((conversation) => (
        <ConversationListRow
          key={conversation.id}
          conversation={conversation}
          isSelected={conversation.id === selectedId}
          showUnreadHighlight={showUnreadHighlight}
          enableContextMenu={enableContextMenu}
          onSelect={onSelect}
        />
      ))}
    </div>
  );
}
