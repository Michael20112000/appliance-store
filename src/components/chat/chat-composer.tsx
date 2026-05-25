"use client";

import { useState, type KeyboardEvent } from "react";
import { Send } from "lucide-react";
import { useAdminChat } from "@/components/chat/admin-chat-provider";
import { useChat } from "@/components/chat/chat-provider";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { MessageDto } from "@/types/chat";

const MAX_LENGTH = 2000;

function mapSendError(status: number, payload: { error?: string; message?: string }) {
  if (payload.error === "CHAT_ARCHIVED") {
    return (
      payload.message ??
      "Діалог закрито. Напишіть нам іншим способом або зачекайте відповіді магазину."
    );
  }
  if (status === 429 || payload.error === "CHAT_RATE_LIMIT") {
    return payload.message ?? "Забагато повідомлень. Зачекайте хвилину.";
  }
  if (payload.error === "VALIDATION_ERROR") {
    return "Повідомлення занадто довге (максимум 2000 символів).";
  }
  return "Не вдалося надіслати. Спробуйте ще раз.";
}

export function ChatComposer() {
  const {
    conversationId,
    productContext,
    guestToken,
    canSend: canSendMessages,
    appendMessage,
    replaceOptimisticMessage,
    removeOptimisticMessage,
    setConversationId,
    setConversationStatus,
  } = useChat();

  const [body, setBody] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSending, setIsSending] = useState(false);

  const trimmed = body.trim();
  const overLimit = body.length > MAX_LENGTH;
  const canSubmit =
    canSendMessages && trimmed.length > 0 && !overLimit && !isSending;
  const composerDisabled = !canSendMessages || isSending;

  const send = async () => {
    if (!canSubmit) return;

    setError(null);
    setIsSending(true);

    const tempId = `pending-${crypto.randomUUID()}`;
    const optimistic: MessageDto & { pending: true } = {
      id: tempId,
      conversationId: conversationId ?? "pending",
      body: trimmed,
      senderRole: "BUYER",
      senderId: "",
      createdAt: new Date().toISOString(),
      pending: true,
    };

    appendMessage(optimistic);
    setBody("");

    try {
      const response = await fetch("/api/chat/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          body: trimmed,
          conversationId: conversationId ?? undefined,
          productId: productContext?.productId,
          guestToken: guestToken ?? undefined,
        }),
      });

      const payload = (await response.json()) as MessageDto & {
        error?: string;
        message?: string;
      };

      if (!response.ok) {
        removeOptimisticMessage(tempId);
        if (payload.error === "CHAT_ARCHIVED") {
          setConversationStatus("ARCHIVED");
        }
        setError(mapSendError(response.status, payload));
        setBody(trimmed);
        return;
      }

      replaceOptimisticMessage(tempId, payload);
      if (!conversationId) {
        setConversationId(payload.conversationId);
        setConversationStatus("OPEN");
      }
    } catch {
      removeOptimisticMessage(tempId);
      setError("Не вдалося надіслати. Спробуйте ще раз.");
      setBody(trimmed);
    } finally {
      setIsSending(false);
    }
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      void send();
    }
  };

  return (
    <div className="border-t border-border bg-background p-3">
      <Label htmlFor="chat-message" className="sr-only">
        Повідомлення
      </Label>
      <div className="flex items-end gap-2">
        <Textarea
          id="chat-message"
          value={body}
          onChange={(event) => setBody(event.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={
            canSendMessages ? "Напишіть повідомлення…" : "Діалог закрито"
          }
          rows={1}
          maxLength={MAX_LENGTH}
          disabled={composerDisabled}
          aria-disabled={!canSendMessages}
          aria-invalid={overLimit || Boolean(error)}
          className="max-h-[120px] min-h-11 resize-none"
        />
        <Button
          type="button"
          size="icon"
          className="size-11 shrink-0"
          disabled={!canSubmit}
          aria-label="Надіслати"
          aria-busy={isSending}
          onClick={() => void send()}
        >
          <Send className="size-4" />
        </Button>
      </div>
      {body.length > 1800 ? (
        <p className="mt-1 text-xs text-muted-foreground">
          {body.length}/{MAX_LENGTH}
        </p>
      ) : null}
      {overLimit ? (
        <p className="mt-1 text-sm text-destructive">
          Повідомлення занадто довге (максимум 2000 символів).
        </p>
      ) : null}
      {error ? <p className="mt-1 text-sm text-destructive">{error}</p> : null}
    </div>
  );
}

export function AdminChatComposer() {
  const {
    selectedConversationId,
    appendMessage,
    replaceOptimisticMessage,
    removeOptimisticMessage,
  } = useAdminChat();

  const [body, setBody] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSending, setIsSending] = useState(false);

  const trimmed = body.trim();
  const overLimit = body.length > MAX_LENGTH;
  const canSend =
    Boolean(selectedConversationId) &&
    trimmed.length > 0 &&
    !overLimit &&
    !isSending;

  const send = async () => {
    if (!canSend || !selectedConversationId) return;

    setError(null);
    setIsSending(true);

    const tempId = `pending-${crypto.randomUUID()}`;
    const optimistic: MessageDto & { pending: true } = {
      id: tempId,
      conversationId: selectedConversationId,
      body: trimmed,
      senderRole: "STORE",
      senderId: "",
      createdAt: new Date().toISOString(),
      pending: true,
    };

    appendMessage(optimistic);
    setBody("");

    try {
      const response = await fetch("/api/chat/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          body: trimmed,
          conversationId: selectedConversationId,
        }),
      });

      const payload = (await response.json()) as MessageDto & {
        error?: string;
        message?: string;
      };

      if (!response.ok) {
        removeOptimisticMessage(tempId);
        setError(mapSendError(response.status, payload));
        setBody(trimmed);
        return;
      }

      replaceOptimisticMessage(tempId, payload);
    } catch {
      removeOptimisticMessage(tempId);
      setError("Не вдалося надіслати. Спробуйте ще раз.");
      setBody(trimmed);
    } finally {
      setIsSending(false);
    }
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      void send();
    }
  };

  if (!selectedConversationId) {
    return null;
  }

  return (
    <div className="border-t border-border bg-background p-3">
      <Label htmlFor="admin-chat-message" className="sr-only">
        Відповідь покупцю
      </Label>
      <div className="flex items-end gap-2">
        <Textarea
          id="admin-chat-message"
          value={body}
          onChange={(event) => setBody(event.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Напишіть відповідь…"
          rows={1}
          maxLength={MAX_LENGTH}
          disabled={isSending}
          aria-invalid={overLimit || Boolean(error)}
          className="max-h-[120px] min-h-11 resize-none"
        />
        <Button
          type="button"
          size="icon"
          className="size-11 shrink-0"
          disabled={!canSend}
          aria-label="Надіслати"
          aria-busy={isSending}
          onClick={() => void send()}
        >
          <Send className="size-4" />
        </Button>
      </div>
      {body.length > 1800 ? (
        <p className="mt-1 text-xs text-muted-foreground">
          {body.length}/{MAX_LENGTH}
        </p>
      ) : null}
      {overLimit ? (
        <p className="mt-1 text-sm text-destructive">
          Повідомлення занадто довге (максимум 2000 символів).
        </p>
      ) : null}
      {error ? <p className="mt-1 text-sm text-destructive">{error}</p> : null}
    </div>
  );
}
