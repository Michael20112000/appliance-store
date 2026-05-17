"use client";

import { useChat, type ProductChatContext } from "@/components/chat/chat-provider";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type OpenChatButtonProps = ProductChatContext & {
  hasSession: boolean;
  label?: string;
  variant?: "default" | "outline";
  className?: string;
};

export function OpenChatButton({
  hasSession,
  productId,
  productTitle,
  productSlug,
  label = "Запитати про цей товар",
  variant = "outline",
  className,
}: OpenChatButtonProps) {
  const { openPanel } = useChat();

  const handleClick = () => {
    openPanel({ productId, productTitle, productSlug });
  };

  return (
    <Button
      type="button"
      variant={variant}
      className={cn("min-h-11", className)}
      onClick={handleClick}
      aria-label={label}
    >
      {label}
    </Button>
  );
}
