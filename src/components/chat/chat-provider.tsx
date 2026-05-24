"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import dynamic from "next/dynamic";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useQueryStates } from "nuqs";
import { chatParsers, chatUrlKeys } from "@/lib/chat/search-params";
import {
  getPusherClient,
  isPusherClientConfigured,
} from "@/lib/pusher-client";
import type { ConversationStatus } from "@/generated/prisma/client";
import { markBuyerReadAction } from "@/server/actions/chat.actions";
import type { MessageDto } from "@/types/chat";
import { StorefrontFabs } from "@/components/layout/storefront-fabs";
import type { PublicStorePhone } from "@/server/services/store-settings.service";

const ChatPanel = dynamic(
  () =>
    import("@/components/chat/chat-panel").then((m) => ({
      default: m.ChatPanel,
    })),
  { ssr: false },
);

export type ProductChatContext = {
  productId?: string;
  productTitle?: string;
  productSlug?: string;
};

export type ChatMessage = MessageDto & {
  pending?: boolean;
};

type ChatContextValue = {
  hasSession: boolean;
  isOpen: boolean;
  messages: ChatMessage[];
  conversationId: string | null;
  conversationStatus: ConversationStatus | null;
  canSend: boolean;
  isLoading: boolean;
  loadError: string | null;
  isDisconnected: boolean;
  unreadFromStore: boolean;
  productContext: ProductChatContext | null;
  openPanel: (options?: ProductChatContext) => void;
  closePanel: () => void;
  refetchMessages: () => Promise<void>;
  appendMessage: (message: ChatMessage) => void;
  replaceOptimisticMessage: (tempId: string, message: MessageDto) => void;
  removeOptimisticMessage: (tempId: string) => void;
  setConversationId: (id: string) => void;
  setConversationStatus: (status: ConversationStatus) => void;
  clearUnreadFromStore: () => void;
};

const ChatContext = createContext<ChatContextValue | null>(null);

type ChatProviderProps = {
  children?: ReactNode;
  hasSession: boolean;
  initialConversationId?: string;
  initialConversationStatus?: ConversationStatus;
  initialUnreadFromStore?: boolean;
  // FAB-04: props forwarded to StorefrontFabs
  phones: PublicStorePhone[];
  initialCartCount: number;
};

type PusherMessagePayload = {
  id: string;
  conversationId: string;
  body: string;
  senderRole: MessageDto["senderRole"];
  createdAt: string;
};

export function ChatProvider({
  children,
  hasSession,
  initialConversationId,
  initialConversationStatus,
  initialUnreadFromStore = false,
  phones,
  initialCartCount,
}: ChatProviderProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [query, setQuery] = useQueryStates(chatParsers, {
    shallow: false,
    urlKeys: chatUrlKeys,
  });

  const [conversationId, setConversationId] = useState<string | null>(
    initialConversationId ?? null,
  );
  const [conversationStatus, setConversationStatus] =
    useState<ConversationStatus | null>(initialConversationStatus ?? null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [isDisconnected, setIsDisconnected] = useState(false);
  const [unreadFromStore, setUnreadFromStore] = useState(initialUnreadFromStore);
  const [productContext, setProductContext] = useState<ProductChatContext | null>(
    null,
  );

  const wasDisconnectedRef = useRef(false);
  const subscribedChannelRef = useRef<string | null>(null);

  const isOpen = query.chat === "open";
  const canSend =
    conversationStatus === null || conversationStatus === "OPEN";

  const guestRedirect = useCallback(() => {
    const query = searchParams.toString();
    const callbackUrl = encodeURIComponent(
      `${pathname}${query ? `?${query}` : ""}`,
    );
    router.push(`/uviity?callbackUrl=${callbackUrl}`);
  }, [pathname, router, searchParams]);

  const closePanel = useCallback(() => {
    void setQuery({ chat: null, productId: null });
    setProductContext(null);
  }, [setQuery]);

  const openPanel = useCallback(
    (options?: ProductChatContext) => {
      if (!hasSession) {
        guestRedirect();
        return;
      }

      if (options?.productId || options?.productTitle || options?.productSlug) {
        setProductContext(options);
        void setQuery({
          chat: "open",
          productId: options.productId ?? null,
        });
        return;
      }

      void setQuery({ chat: "open" });
    },
    [guestRedirect, hasSession, setQuery],
  );

  const appendMessage = useCallback((message: ChatMessage) => {
    setMessages((prev) => {
      if (prev.some((item) => item.id === message.id)) return prev;
      return [...prev, message];
    });
    if (message.senderRole === "STORE") {
      setUnreadFromStore(!isOpen);
    }
  }, [isOpen]);

  const replaceOptimisticMessage = useCallback(
    (tempId: string, message: MessageDto) => {
      setMessages((prev) => {
        const withoutTemp = prev.filter((item) => item.id !== tempId);
        if (withoutTemp.some((item) => item.id === message.id)) {
          return withoutTemp;
        }
        return [...withoutTemp, message];
      });
    },
    [],
  );

  const removeOptimisticMessage = useCallback((tempId: string) => {
    setMessages((prev) => prev.filter((item) => item.id !== tempId));
  }, []);

  const clearUnreadFromStore = useCallback(() => {
    setUnreadFromStore(false);
  }, []);

  const fetchMessages = useCallback(async (id: string) => {
    const response = await fetch(
      `/api/chat/messages?conversationId=${encodeURIComponent(id)}`,
    );

    if (!response.ok) {
      throw new Error("LOAD_FAILED");
    }

    const data = (await response.json()) as {
      messages: MessageDto[];
      status?: ConversationStatus;
    };
    setMessages(data.messages);
    if (data.status) {
      setConversationStatus(data.status);
    }
    setLoadError(null);
  }, []);

  const refetchMessages = useCallback(async () => {
    if (!conversationId) return;
    setIsLoading(true);
    try {
      await fetchMessages(conversationId);
    } catch {
      setLoadError("Не вдалося завантажити повідомлення. Спробуйте оновити сторінку.");
    } finally {
      setIsLoading(false);
    }
  }, [conversationId, fetchMessages]);

  useEffect(() => {
    if (!isOpen || !hasSession) return;

    if (conversationId) {
      let cancelled = false;
      setIsLoading(true);

      void (async () => {
        try {
          await fetchMessages(conversationId);
          if (cancelled) return;
          await markBuyerReadAction(conversationId);
          clearUnreadFromStore();
        } catch {
          if (!cancelled) {
            setLoadError(
              "Не вдалося завантажити повідомлення. Спробуйте оновити сторінку.",
            );
          }
        } finally {
          if (!cancelled) setIsLoading(false);
        }
      })();

      return () => {
        cancelled = true;
      };
    }

    setMessages([]);
    setConversationStatus(null);
    setLoadError(null);
    setIsLoading(false);
  }, [clearUnreadFromStore, conversationId, fetchMessages, hasSession, isOpen]);

  useEffect(() => {
    if (!isOpen || !hasSession || !conversationId || !isPusherClientConfigured()) {
      return;
    }

    let cancelled = false;

    const channelName = `private-conversation-${conversationId}`;
    const pusher = getPusherClient();

    const handleMessage = (payload: PusherMessagePayload) => {
      if (cancelled || payload.conversationId !== conversationId) return;
      appendMessage({
        id: payload.id,
        conversationId: payload.conversationId,
        body: payload.body,
        senderRole: payload.senderRole,
        senderId: "",
        createdAt: payload.createdAt,
      });
    };

    const handleStateChange = (states: {
      previous: string;
      current: string;
    }) => {
      const disconnected =
        states.current === "disconnected" ||
        states.current === "unavailable" ||
        states.current === "failed";
      setIsDisconnected(disconnected);

      if (disconnected) {
        wasDisconnectedRef.current = true;
        return;
      }

      if (
        states.current === "connected" &&
        wasDisconnectedRef.current &&
        conversationId
      ) {
        wasDisconnectedRef.current = false;
        void refetchMessages();
      }
    };

    const channel = pusher.subscribe(channelName);
    channel.bind("message:new", handleMessage);
    pusher.connection.bind("state_change", handleStateChange);
    subscribedChannelRef.current = channelName;

    setIsDisconnected(
      pusher.connection.state === "disconnected" ||
        pusher.connection.state === "unavailable",
    );

    return () => {
      cancelled = true;
      channel.unbind("message:new", handleMessage);
      pusher.connection.unbind("state_change", handleStateChange);
      pusher.unsubscribe(channelName);
      subscribedChannelRef.current = null;
    };
  }, [appendMessage, conversationId, hasSession, isOpen, refetchMessages]);

  useEffect(() => {
    if (isOpen && hasSession) {
      clearUnreadFromStore();
    }
  }, [clearUnreadFromStore, hasSession, isOpen]);

  const value = useMemo<ChatContextValue>(
    () => ({
      hasSession,
      isOpen,
      messages,
      conversationId,
      conversationStatus,
      canSend,
      isLoading,
      loadError,
      isDisconnected,
      unreadFromStore,
      productContext,
      openPanel,
      closePanel,
      refetchMessages,
      appendMessage,
      replaceOptimisticMessage,
      removeOptimisticMessage,
      setConversationId,
      setConversationStatus,
      clearUnreadFromStore,
    }),
    [
      appendMessage,
      clearUnreadFromStore,
      closePanel,
      canSend,
      conversationId,
      conversationStatus,
      hasSession,
      isDisconnected,
      isLoading,
      isOpen,
      loadError,
      messages,
      openPanel,
      productContext,
      refetchMessages,
      replaceOptimisticMessage,
      removeOptimisticMessage,
      unreadFromStore,
    ],
  );

  return (
    <ChatContext.Provider value={value}>
      {children}
      <StorefrontFabs
        phones={phones}
        initialCartCount={initialCartCount}
        hasSession={hasSession}
      />
      <ChatPanel />
    </ChatContext.Provider>
  );
}

export function useChat() {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error("useChat must be used within ChatProvider");
  }
  return context;
}
