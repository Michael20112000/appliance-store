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
import { useRouter } from "next/navigation";
import { getPusherClient } from "@/lib/pusher-client";
import type { ConversationSummaryDto, MessageDto } from "@/types/chat";

export type AdminChatMessage = MessageDto & {
  pending?: boolean;
};

type AdminChatContextValue = {
  conversations: ConversationSummaryDto[];
  selectedConversationId: string | null;
  selectedConversation: ConversationSummaryDto | null;
  messages: AdminChatMessage[];
  isLoading: boolean;
  loadError: string | null;
  isDisconnected: boolean;
  setSelectedConversationId: (id: string | null) => void;
  appendMessage: (message: AdminChatMessage) => void;
  replaceOptimisticMessage: (tempId: string, message: MessageDto) => void;
  removeOptimisticMessage: (tempId: string) => void;
  refetchMessages: () => Promise<void>;
  markConversationReadLocally: (conversationId: string) => void;
  refreshAfterRead: () => void;
};

const AdminChatContext = createContext<AdminChatContextValue | null>(null);

type PusherMessagePayload = {
  id: string;
  conversationId: string;
  body: string;
  senderRole: MessageDto["senderRole"];
  createdAt: string;
};

type AdminChatProviderProps = {
  children: ReactNode;
  conversations: ConversationSummaryDto[];
};

export function AdminChatProvider({
  children,
  conversations: initialConversations,
}: AdminChatProviderProps) {
  const router = useRouter();
  const [conversations, setConversations] = useState(initialConversations);
  const [selectedConversationId, setSelectedConversationId] = useState<
    string | null
  >(null);
  const [messages, setMessages] = useState<AdminChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [isDisconnected, setIsDisconnected] = useState(false);

  const wasDisconnectedRef = useRef(false);

  useEffect(() => {
    setConversations(initialConversations);
  }, [initialConversations]);

  const selectedConversation = useMemo(
    () =>
      conversations.find((item) => item.id === selectedConversationId) ?? null,
    [conversations, selectedConversationId],
  );

  const appendMessage = useCallback((message: AdminChatMessage) => {
    setMessages((prev) => {
      if (prev.some((item) => item.id === message.id)) return prev;
      return [...prev, message];
    });

    if (message.senderRole === "BUYER") {
      setConversations((prev) =>
        prev.map((item) =>
          item.id === message.conversationId
            ? {
                ...item,
                lastMessagePreview: message.body,
                lastMessageAt: message.createdAt,
                unreadForAdmin: true,
              }
            : item,
        ),
      );
    }
  }, []);

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

  const markConversationReadLocally = useCallback((conversationId: string) => {
    setConversations((prev) =>
      prev.map((item) =>
        item.id === conversationId ? { ...item, unreadForAdmin: false } : item,
      ),
    );
  }, []);

  const refreshAfterRead = useCallback(() => {
    router.refresh();
  }, [router]);

  const fetchMessages = useCallback(async (conversationId: string) => {
    const response = await fetch(
      `/api/chat/messages?conversationId=${encodeURIComponent(conversationId)}`,
    );

    if (!response.ok) {
      throw new Error("LOAD_FAILED");
    }

    const data = (await response.json()) as { messages: MessageDto[] };
    setMessages(data.messages);
    setLoadError(null);
  }, []);

  const refetchMessages = useCallback(async () => {
    if (!selectedConversationId) return;
    setIsLoading(true);
    try {
      await fetchMessages(selectedConversationId);
    } catch {
      setLoadError(
        "Не вдалося завантажити повідомлення. Спробуйте оновити сторінку.",
      );
    } finally {
      setIsLoading(false);
    }
  }, [fetchMessages, selectedConversationId]);

  useEffect(() => {
    if (!selectedConversationId) {
      setMessages([]);
      setLoadError(null);
      setIsLoading(false);
      return;
    }

    let cancelled = false;
    setIsLoading(true);

    void (async () => {
      try {
        await fetchMessages(selectedConversationId);
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
  }, [fetchMessages, selectedConversationId]);

  useEffect(() => {
    if (!selectedConversationId) return;

    let cancelled = false;
    const channelName = `private-conversation-${selectedConversationId}`;
    const pusher = getPusherClient();

    const handleMessage = (payload: PusherMessagePayload) => {
      if (cancelled || payload.conversationId !== selectedConversationId) {
        return;
      }
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
        selectedConversationId
      ) {
        wasDisconnectedRef.current = false;
        void refetchMessages();
      }
    };

    const channel = pusher.subscribe(channelName);
    channel.bind("message:new", handleMessage);
    pusher.connection.bind("state_change", handleStateChange);

    setIsDisconnected(
      pusher.connection.state === "disconnected" ||
        pusher.connection.state === "unavailable",
    );

    return () => {
      cancelled = true;
      channel.unbind("message:new", handleMessage);
      pusher.connection.unbind("state_change", handleStateChange);
      pusher.unsubscribe(channelName);
    };
  }, [appendMessage, refetchMessages, selectedConversationId]);

  const value = useMemo<AdminChatContextValue>(
    () => ({
      conversations,
      selectedConversationId,
      selectedConversation,
      messages,
      isLoading,
      loadError,
      isDisconnected,
      setSelectedConversationId,
      appendMessage,
      replaceOptimisticMessage,
      removeOptimisticMessage,
      refetchMessages,
      markConversationReadLocally,
      refreshAfterRead,
    }),
    [
      appendMessage,
      conversations,
      isDisconnected,
      isLoading,
      loadError,
      markConversationReadLocally,
      messages,
      refreshAfterRead,
      refetchMessages,
      removeOptimisticMessage,
      replaceOptimisticMessage,
      selectedConversation,
      selectedConversationId,
    ],
  );

  return (
    <AdminChatContext.Provider value={value}>
      {children}
    </AdminChatContext.Provider>
  );
}

export function useAdminChat() {
  const context = useContext(AdminChatContext);
  if (!context) {
    throw new Error("useAdminChat must be used within AdminChatProvider");
  }
  return context;
}
