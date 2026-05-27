import type { ProductChatContext } from "@/components/chat/chat-provider";

type SuggestedMessagesProps = {
  productContext: ProductChatContext | null;
  onSelect: (text: string) => void;
};

const GENERAL_SUGGESTIONS = [
  "Який у вас графік роботи?",
  "Де ви знаходитесь?",
  "Як оформити замовлення?",
] as const;

export function SuggestedMessages({ productContext, onSelect }: SuggestedMessagesProps) {
  const suggestions: string[] = [];
  if (productContext?.productTitle) {
    suggestions.push(`Цікавить ${productContext.productTitle} — є ще в наявності?`);
  }
  suggestions.push(...GENERAL_SUGGESTIONS);

  return (
    <div className="flex flex-wrap gap-2 px-4 py-3">
      {suggestions.map((text) => (
        <button
          key={text}
          type="button"
          onClick={() => onSelect(text)}
          className="rounded-full border border-border bg-muted px-3 py-1.5 text-sm text-foreground hover:bg-muted/80 transition-colors"
        >
          {text}
        </button>
      ))}
    </div>
  );
}
