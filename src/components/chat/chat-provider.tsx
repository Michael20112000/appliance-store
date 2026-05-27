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
  setGuestTokenForPusher,
} from "@/lib/pusher-client";
import type { ConversationStatus } from "@/generated/prisma/client";
import { markBuyerReadAction } from "@/server/actions/chat.actions";
import type { ChatAttachment, MessageDto } from "@/types/chat";
import { StorefrontFabs } from "@/components/layout/storefront-fabs";
import type { PublicStorePhone } from "@/server/services/store-settings.service";
import { DrawerProvider } from "@/lib/drawers/drawer-context";
import { CartDrawer } from "@/components/cart/cart-drawer";
import { WishlistDrawer } from "@/components/wishlist/wishlist-drawer";

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
  guestToken: string | null;
  openPanel: (options?: ProductChatContext) => void;
  closePanel: () => void;
  refetchMessages: () => Promise<void>;
  appendMessage: (message: ChatMessage) => void;
  replaceOptimisticMessage: (tempId: string, message: MessageDto) => void;
  removeOptimisticMessage: (tempId: string) => void;
  setConversationId: (id: string) => void;
  setConversationStatus: (status: ConversationStatus) => void;
  clearUnreadFromStore: () => void;
  resetMessages: () => void;
  updateGuestToken: (token: string) => void;
  panelView: "thread" | "history";
  openHistory: () => void;
  closeHistory: () => void;
};

const ChatContext = createContext<ChatContextValue | null>(null);

const GUEST_CHAT_TOKEN_KEY = "chat_guest_token";

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
  attachments?: ChatAttachment[];
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
  const [guestToken, setGuestToken] = useState<string | null>(null);
  const [panelView, setPanelView] = useState<"thread" | "history">("thread");

  const wasDisconnectedRef = useRef(false);
  const subscribedChannelRef = useRef<string | null>(null);

  const isOpen = query.chat === "open";
  const isOpenRef = useRef(isOpen);
  const canSend =
    conversationStatus === null || conversationStatus === "OPEN";

  const guestRedirect = useCallback(() => {
    const query = searchParams.toString();
    const callbackUrl = encodeURIComponent(
      `${pathname}${query ? `?${query}` : ""}`,
    );
    router.push(`/uviity?callbackUrl=${callbackUrl}`);
  }, [pathname, router, searchParams]);

  // WR-01: keep isOpenRef in sync so appendMessage doesn't need isOpen in its
  // dependency array, preventing Pusher re-subscription on every panel toggle.
  useEffect(() => {
    isOpenRef.current = isOpen;
  }, [isOpen]);

  const closePanel = useCallback(() => {
    void setQuery({ chat: null, productId: null });
    setProductContext(null);
    setPanelView("thread");
  }, [setQuery]);

  const openHistory = useCallback(() => setPanelView("history"), []);
  const closeHistory = useCallback(() => setPanelView("thread"), []);

  const openPanel = useCallback(
    (options?: ProductChatContext) => {
      // D-09: no redirect for guests — widget opens normally
      // D-01: generate token on first open if not already set; no DB write
      if (!hasSession && !guestToken) {
        try {
          const token = crypto.randomUUID();
          localStorage.setItem("chat_guest_token", token);
          setGuestToken(token);
        } catch {
          // private mode or storage unavailable — continue without persistent token
        }
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
    [guestToken, hasSession, setQuery],
  );

  const appendMessage = useCallback((message: ChatMessage) => {
    setMessages((prev) => {
      if (prev.some((item) => item.id === message.id)) return prev;
      return [...prev, message];
    });
    if (message.senderRole === "STORE") {
      setUnreadFromStore(!isOpenRef.current);
    }
  }, []); // stable reference — reads isOpen via isOpenRef.current (WR-01)

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

  // CR-01: guest-safe refetch — routes to the guest endpoint instead of the
  // session-required GET /api/chat/messages endpoint (which returns 401 for guests).
  const refetchMessagesForGuest = useCallback(async () => {
    if (!guestToken) return;
    try {
      const response = await fetch(
        `/api/chat/guest?token=${encodeURIComponent(guestToken)}`,
      );
      if (!response.ok) return;
      const data = (await response.json()) as {
        conversationId: string;
        messages: MessageDto[];
        status: ConversationStatus;
      };
      setMessages(data.messages);
      setConversationStatus(data.status);
      setLoadError(null);
    } catch {
      setLoadError("Не вдалося завантажити повідомлення. Спробуйте оновити сторінку.");
    }
  }, [guestToken]);

  // Guest token management: run once on mount (D-10)
  useEffect(() => {
    if (hasSession) return; // authenticated users don't need a guest token
    if (typeof window === "undefined") return; // SSR guard
    try {
      const stored = localStorage.getItem("chat_guest_token");
      if (!stored) return;
      setGuestToken(stored);
      void (async () => {
        try {
          const response = await fetch(
            `/api/chat/guest?token=${encodeURIComponent(stored)}`,
          );
          if (response.status === 404) {
            // Token was claimed (guestToken set to null in DB) — clear localStorage so
            // future page loads don't hit 404 again. Keep guestToken in state: it is
            // still valid for creating a new conversation in this session, and clearing
            // it would cause a race where a mid-flight Pusher subscription re-runs
            // with guestToken=null → auth 401 → admin replies stop arriving.
            localStorage.removeItem(GUEST_CHAT_TOKEN_KEY);
            return;
          }
          if (!response.ok) return; // other errors: keep token, wait for first Send
          const data = (await response.json()) as {
            conversationId: string;
            messages: MessageDto[];
            status: ConversationStatus;
          };
          setConversationId(data.conversationId);
          setMessages(data.messages);
          setConversationStatus(data.status);
        } catch {
          // network error — keep token, attempt restore on next load
        }
      })();
    } catch {
      // private mode or storage access error — continue without token
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

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
    // T-46-11: guard prevents subscription before conversationId exists
    if (!isOpen || !conversationId || !isPusherClientConfigured()) {
      return;
    }

    // Ensure guestToken is current before Pusher auth request fires
    setGuestTokenForPusher(guestToken);

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
        attachments: payload.attachments,
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
        // CR-01: guests must use the guest endpoint — the session-required
        // GET /api/chat/messages returns 401 for unauthenticated requests.
        if (hasSession) {
          void refetchMessages();
        } else {
          void refetchMessagesForGuest();
        }
      }
    };

    const handleClose = (payload: { conversationId: string }) => {
      if (cancelled || payload.conversationId !== conversationId) return;
      setConversationStatus("ARCHIVED");
    };

    const channel = pusher.subscribe(channelName);
    channel.bind("message:new", handleMessage);
    channel.bind("conversation:closed", handleClose);
    pusher.connection.bind("state_change", handleStateChange);
    subscribedChannelRef.current = channelName;

    setIsDisconnected(
      pusher.connection.state === "disconnected" ||
        pusher.connection.state === "unavailable",
    );

    return () => {
      cancelled = true;
      channel.unbind("message:new", handleMessage);
      channel.unbind("conversation:closed", handleClose);
      pusher.connection.unbind("state_change", handleStateChange);
      pusher.unsubscribe(channelName);
      subscribedChannelRef.current = null;
    };
  }, [appendMessage, conversationId, guestToken, hasSession, isOpen, refetchMessages, refetchMessagesForGuest]);

  useEffect(() => {
    if (isOpen && hasSession) {
      clearUnreadFromStore();
    }
  }, [clearUnreadFromStore, hasSession, isOpen]);

  const resetMessages = useCallback(() => setMessages([]), []);

  const updateGuestToken = useCallback((token: string) => {
    try {
      localStorage.setItem(GUEST_CHAT_TOKEN_KEY, token);
    } catch {
      // private mode — continue without persisting
    }
    setGuestToken(token);
    setGuestTokenForPusher(token);
  }, []);

  const claimAttemptedRef = useRef(false);

  useEffect(() => {
    if (!hasSession || claimAttemptedRef.current) return;
    if (typeof window === "undefined") return;

    const stored = localStorage.getItem(GUEST_CHAT_TOKEN_KEY);
    if (!stored) return;

    claimAttemptedRef.current = true;
    void (async () => {
      try {
        const res = await fetch("/api/chat/claim", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ guestToken: stored }),
        });
        if (res.ok) {
          localStorage.removeItem(GUEST_CHAT_TOKEN_KEY);
          router.refresh();
          setGuestToken(null);
          setGuestTokenForPusher(null);
        }
      } catch {
        // claim failure is non-fatal — guest messages still visible via guestToken until page reload
      }
    })();
  }, [hasSession]); // eslint-disable-line react-hooks/exhaustive-deps

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
      guestToken,
      openPanel,
      closePanel,
      refetchMessages,
      appendMessage,
      replaceOptimisticMessage,
      removeOptimisticMessage,
      setConversationId,
      setConversationStatus,
      clearUnreadFromStore,
      resetMessages,
      updateGuestToken,
      panelView,
      openHistory,
      closeHistory,
    }),
    [
      appendMessage,
      clearUnreadFromStore,
      closePanel,
      canSend,
      conversationId,
      conversationStatus,
      guestToken,
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
      resetMessages,
      unreadFromStore,
      updateGuestToken,
      panelView,
      openHistory,
      closeHistory,
    ],
  );

  return (
    <DrawerProvider>
      <ChatContext.Provider value={value}>
        {children}
        <StorefrontFabs
          phones={phones}
          initialCartCount={initialCartCount}
          hasSession={hasSession}
        />
        <ChatPanel />
        <CartDrawer hasSession={hasSession} />
        <WishlistDrawer hasSession={hasSession} />
      </ChatContext.Provider>
    </DrawerProvider>
  );
}

export function useChat() {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error("useChat must be used within ChatProvider");
  }
  return context;
}
