"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { useChat } from "@/components/chat/chat-provider";
import { ChatComposer } from "@/components/chat/chat-composer";
import { MessageList } from "@/components/chat/message-list";
import { ProductContextBanner } from "@/components/chat/product-context-banner";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";

function PanelHeader({ onClose }: { onClose: () => void }) {
  return (
    <div className="flex items-start justify-between border-b border-border px-4 py-3">
      <div>
        <p className="text-sm font-semibold">Чат з магазином</p>
        <p className="text-xs text-muted-foreground">Відповімо якнайшвидше</p>
      </div>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        onClick={onClose}
        aria-label="Закрити чат"
      >
        <X className="size-4" />
      </Button>
    </div>
  );
}

function DisconnectedBanner({
  onRefresh,
}: {
  onRefresh: () => void;
}) {
  return (
    <div className="border-b border-border bg-muted px-3 py-2 text-sm text-muted-foreground">
      <p>Зʼєднання перервано. Повідомлення можуть затримуватися.</p>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        className="mt-1 h-auto px-0 text-sm"
        onClick={() => void onRefresh()}
      >
        Оновити
      </Button>
    </div>
  );
}

function PanelBody() {
  const {
    messages,
    isLoading,
    loadError,
    isDisconnected,
    productContext,
    refetchMessages,
    closePanel,
  } = useChat();

  return (
    <>
      <PanelHeader onClose={closePanel} />
      {isDisconnected ? (
        <DisconnectedBanner onRefresh={refetchMessages} />
      ) : null}
      <MessageList
        messages={messages}
        isLoading={isLoading}
        loadError={loadError}
      />
      {productContext ? (
        <ProductContextBanner context={productContext} />
      ) : null}
      <ChatComposer />
    </>
  );
}

function useIsMobile() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const media = window.matchMedia("(max-width: 767px)");
    const update = () => setIsMobile(media.matches);
    update();
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);

  return isMobile;
}

export function ChatPanel() {
  const { isOpen, closePanel } = useChat();
  const isMobile = useIsMobile();

  return (
    <>
      <div
        className="pointer-events-none fixed inset-0 z-[61] hidden md:block"
        aria-hidden={!isOpen}
      >
        <div
          className={
            isOpen
              ? "pointer-events-auto fixed bottom-6 right-6 flex h-[min(520px,calc(100dvh-7rem))] w-[380px] flex-col overflow-hidden rounded-xl border border-border bg-background shadow-2xl pb-[max(0px,env(safe-area-inset-bottom))]"
              : "hidden"
          }
          role="dialog"
          aria-modal="true"
          aria-label="Чат з магазином"
        >
          {isOpen ? <PanelBody /> : null}
        </div>
      </div>

      <Sheet
        open={isOpen && isMobile}
        onOpenChange={(open) => !open && closePanel()}
      >
        <SheetContent
          side="bottom"
          className="flex h-[85dvh] flex-col gap-0 p-0 md:hidden"
        >
          <SheetHeader className="sr-only">
            <SheetTitle>Чат з магазином</SheetTitle>
          </SheetHeader>
          <PanelBody />
        </SheetContent>
      </Sheet>
    </>
  );
}
