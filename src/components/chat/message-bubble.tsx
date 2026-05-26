import { Paperclip } from "lucide-react";
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
  buyerDisplayName?: string;
};

export function MessageBubble({ message, buyerDisplayName }: MessageBubbleProps) {
  const isBuyer = message.senderRole === "BUYER";
  const timestamp = message.pending
    ? null
    : timeFormatter.format(new Date(message.createdAt));

  const hasAttachments = (message.attachments?.length ?? 0) > 0;

  return (
    <div className={cn("flex", isBuyer ? "justify-end" : "justify-start")}>
      <div className="max-w-[85%]">
        {!isBuyer ? (
          <p className="mb-0.5 text-xs font-semibold text-muted-foreground">
            Магазин
          </p>
        ) : buyerDisplayName ? (
          <p className="mb-0.5 text-xs font-semibold text-muted-foreground">
            {buyerDisplayName}
          </p>
        ) : null}
        {message.body.length > 0 ? (
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
        ) : null}
        {hasAttachments ? (
          <div className={cn("mt-1", message.pending && "opacity-70")}>
            {message.attachments!.map((attachment) =>
              attachment.resourceType === "image" ? (
                <a
                  key={attachment.publicId}
                  href={attachment.url}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={attachment.url}
                    alt={attachment.filename}
                    className="mt-1 max-w-[200px] max-h-[200px] rounded-md object-contain"
                    loading="lazy"
                  />
                </a>
              ) : (
                <a
                  key={attachment.publicId}
                  href={`/api/chat/attachment?publicId=${encodeURIComponent(attachment.publicId)}`}
                  download={attachment.filename}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-1 flex items-center gap-1 text-sm underline"
                >
                  <Paperclip className="size-3" />
                  <span>{attachment.filename}</span>
                </a>
              ),
            )}
          </div>
        ) : null}
        {timestamp ? (
          <p className="mt-1 text-xs text-muted-foreground">{timestamp}</p>
        ) : null}
      </div>
    </div>
  );
}
