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
    <div className="flex gap-2 overflow-x-auto px-4 py-3 scrollbar-none">
      {suggestions.map((text) => (
        <button
          key={text}
          type="button"
          onClick={() => onSelect(text)}
          className="shrink-0 whitespace-nowrap rounded-full border border-primary/30 bg-primary/10 px-3 py-1.5 text-sm text-primary transition-colors hover:bg-primary/20"
        >
          {text}
        </button>
      ))}
    </div>
  );
}
