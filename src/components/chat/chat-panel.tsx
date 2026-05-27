"use client";

import { useEffect, useRef, useState } from "react";
import { Menu, X } from "lucide-react";
import { useChat } from "@/components/chat/chat-provider";
import { ArchivedChatBanner } from "@/components/chat/archived-chat-banner";
import { ChatComposer, type ChatComposerHandle } from "@/components/chat/chat-composer";
import { HistoryDrawer } from "@/components/chat/history-drawer";
import { MessageList } from "@/components/chat/message-list";
import { ProductContextBanner } from "@/components/chat/product-context-banner";
import { SuggestedMessages } from "@/components/chat/suggested-messages";
import { Button } from "@/components/ui/button";
import {
  DrawerRoot,
  DrawerPortal,
  DrawerBackdrop,
  DrawerViewport,
  DrawerPopup,
  DrawerSwipeArea,
} from "@/components/ui/drawer";
import { cn } from "@/lib/utils";

function PanelHeader({
  onClose,
  sticky = false,
}: {
  onClose: () => void;
  sticky?: boolean;
}) {
  const { hasSession, openHistory } = useChat();

  return (
    <div
      className={
        sticky
          ? "relative z-20 flex shrink-0 items-start justify-between border-b border-border bg-background px-4 py-3"
          : "flex shrink-0 items-start justify-between border-b border-border px-4 py-3"
      }
    >
      <div className="min-w-0 flex-1 pr-2">
        <p className="text-sm font-semibold">Чат з магазином</p>
        <p className="text-xs text-muted-foreground">Відповімо якнайшвидше</p>
      </div>
      {hasSession ? (
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="size-9 shrink-0"
          onClick={openHistory}
          aria-label="Відкрити меню чатів"
        >
          <Menu className="size-4" />
        </Button>
      ) : null}
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
    conversationStatus,
    refetchMessages,
    closePanel,
    isOpen,
    canSend,
  } = useChat();

  const isArchived = conversationStatus === "ARCHIVED";
  const composerRef = useRef<ChatComposerHandle>(null);

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
      {messages.length === 0 && !isLoading && canSend ? (
        <div className="shrink-0">
          <SuggestedMessages
            productContext={productContext}
            onSelect={(text) => { void composerRef.current?.sendWithText(text); }}
          />
        </div>
      ) : null}
      {productContext ? (
        <div className="shrink-0">
          <ProductContextBanner context={productContext} />
        </div>
      ) : null}
      {isArchived ? (
        <div className="shrink-0">
          <ArchivedChatBanner />
        </div>
      ) : null}
      <div className="shrink-0">
        <ChatComposer ref={composerRef} />
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
  const { isOpen, closePanel, panelView, closeHistory } = useChat();
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
          {isOpen ? (
            <div className="relative flex h-full min-h-0 flex-1 flex-col overflow-hidden">
              <PanelBody useNativeScroll={false} />
              <div
                className={cn(
                  "absolute inset-y-0 left-0 z-10 w-[75%] bg-background transition-transform duration-200 ease-in-out motion-reduce:transition-none",
                  panelView === "history" ? "translate-x-0" : "-translate-x-full"
                )}
              >
                <HistoryDrawer />
              </div>
              <div
                className={cn(
                  "absolute inset-0 z-[9] bg-black/30 transition-opacity duration-200 motion-reduce:transition-none",
                  panelView === "history" ? "opacity-100" : "pointer-events-none opacity-0"
                )}
                onClick={closeHistory}
                aria-hidden="true"
              />
            </div>
          ) : null}
        </div>
      </div>

      <DrawerRoot
        open={isOpen && isMobile}
        onOpenChange={(open) => { if (!open) closePanel(); }}
        swipeDirection="down"
      >
        <DrawerPortal>
          <DrawerBackdrop />
          <DrawerViewport className="md:hidden">
          <DrawerPopup className="h-[80dvh] max-h-[80dvh] min-h-0 w-full flex-col gap-0 rounded-t-2xl border-t p-0 pb-[max(0px,env(safe-area-inset-bottom))]">
            <DrawerSwipeArea />
            <div className="relative flex h-full min-h-0 flex-1 flex-col overflow-hidden">
              <PanelBody useNativeScroll stickyHeader />
              <div
                className={cn(
                  "absolute inset-y-0 left-0 z-10 w-[75%] bg-background transition-transform duration-200 ease-in-out motion-reduce:transition-none",
                  panelView === "history" ? "translate-x-0" : "-translate-x-full"
                )}
              >
                <HistoryDrawer />
              </div>
              <div
                className={cn(
                  "absolute inset-0 z-[9] bg-black/30 transition-opacity duration-200 motion-reduce:transition-none",
                  panelView === "history" ? "opacity-100" : "pointer-events-none opacity-0"
                )}
                onClick={closeHistory}
                aria-hidden="true"
              />
            </div>
          </DrawerPopup>
          </DrawerViewport>
        </DrawerPortal>
      </DrawerRoot>
    </>
  );
}
