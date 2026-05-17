import type { ChatMessage } from "@/components/chat/chat-provider";
import { cn } from "@/lib/utils";

const timeFormatter = new Intl.DateTimeFormat("uk-UA", {
  day: "numeric",
  month: "short",
  hour: "2-digit",
  minute: "2-digit",
});

type MessageBubbleProps = {
  message: ChatMessage;
};

export function MessageBubble({ message }: MessageBubbleProps) {
  const isBuyer = message.senderRole === "BUYER";
  const timestamp = message.pending
    ? null
    : timeFormatter.format(new Date(message.createdAt));

  return (
    <div className={cn("flex", isBuyer ? "justify-end" : "justify-start")}>
      <div className="max-w-[85%]">
        {!isBuyer ? (
          <p className="mb-0.5 text-xs font-semibold text-muted-foreground">
            Магазин
          </p>
        ) : null}
        <div
          className={cn(
            "rounded-2xl px-3 py-2 text-base whitespace-pre-wrap break-words",
            isBuyer
              ? "rounded-br-md bg-primary text-primary-foreground"
              : "rounded-bl-md border border-border bg-muted text-foreground",
            message.pending && "opacity-70",
          )}
        >
          {message.body}
        </div>
        {timestamp ? (
          <p className="mt-1 text-xs text-muted-foreground">{timestamp}</p>
        ) : null}
      </div>
    </div>
  );
}
