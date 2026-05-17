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

function PanelHeader({
  onClose,
  sticky = false,
}: {
  onClose: () => void;
  sticky?: boolean;
}) {
  return (
    <div
      className={
        sticky
          ? "relative z-20 flex shrink-0 items-start justify-between border-b border-border bg-background px-4 py-3"
          : "flex shrink-0 items-start justify-between border-b border-border px-4 py-3"
      }
    >
      <div className="min-w-0 pr-2">
        <p className="text-sm font-semibold">Чат з магазином</p>
        <p className="text-xs text-muted-foreground">Відповімо якнайшвидше</p>
      </div>
      <Button
        type="button"
        variant="outline"
        size="icon"
        className="size-9 shrink-0"
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

function PanelBody({
  useNativeScroll,
  stickyHeader = false,
}: {
  useNativeScroll?: boolean;
  stickyHeader?: boolean;
}) {
  const {
    messages,
    isLoading,
    loadError,
    isDisconnected,
    productContext,
    refetchMessages,
    closePanel,
    isOpen,
  } = useChat();

  return (
    <div className="flex h-full min-h-0 flex-1 flex-col overflow-hidden">
      <PanelHeader onClose={closePanel} sticky={stickyHeader} />
      {isDisconnected ? (
        <div className="shrink-0">
          <DisconnectedBanner onRefresh={refetchMessages} />
        </div>
      ) : null}
      <MessageList
        messages={messages}
        isLoading={isLoading}
        loadError={loadError}
        useNativeScroll={useNativeScroll}
        isPanelOpen={isOpen}
      />
      {productContext ? (
        <div className="shrink-0">
          <ProductContextBanner context={productContext} />
        </div>
      ) : null}
      <div className="shrink-0">
        <ChatComposer />
      </div>
    </div>
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
          {isOpen ? <PanelBody useNativeScroll={false} /> : null}
        </div>
      </div>

      <Sheet
        open={isOpen && isMobile}
        onOpenChange={(open) => !open && closePanel()}
      >
        <SheetContent
          side="bottom"
          showCloseButton={false}
          className="flex h-[80dvh] max-h-[80dvh] min-h-0 flex-col gap-0 overflow-hidden rounded-t-2xl border-t p-0 pb-[max(0px,env(safe-area-inset-bottom))] md:hidden data-[side=bottom]:h-[80dvh]"
        >
          <SheetHeader className="sr-only">
            <SheetTitle>Чат з магазином</SheetTitle>
          </SheetHeader>
          <PanelBody useNativeScroll stickyHeader />
        </SheetContent>
      </Sheet>
    </>
  );
}
