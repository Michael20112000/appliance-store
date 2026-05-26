"use client";

import { useRef, useState, type KeyboardEvent } from "react";
import { Paperclip, Send } from "lucide-react";
import { useAdminChat } from "@/components/chat/admin-chat-provider";
import { useChat } from "@/components/chat/chat-provider";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { ChatAttachment, MessageDto } from "@/types/chat";

const MAX_LENGTH = 2000;
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];

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
    return "Не вдалося надіслати. Спробуйте ще раз.";
  }
  return "Не вдалося надіслати. Спробуйте ще раз.";
}

async function signAndUpload(file: File): Promise<ChatAttachment> {
  // 1. POST to /api/chat/upload/sign
  const signRes = await fetch("/api/chat/upload/sign", { method: "POST" });
  if (!signRes.ok) throw new Error("SIGN_FAILED");
  const { signature, timestamp, apiKey, cloudName } = await signRes.json() as {
    signature: string; timestamp: number; apiKey: string; cloudName: string;
  };
  // 2. Upload directly to Cloudinary
  const formData = new FormData();
  formData.append("file", file);
  formData.append("api_key", apiKey);
  formData.append("folder", "chat");
  formData.append("timestamp", String(timestamp));
  formData.append("signature", signature);
  formData.append("upload_preset", "chat-attachments");
  const resourceType = "image";
  const uploadRes = await fetch(
    `https://api.cloudinary.com/v1_1/${cloudName}/${resourceType}/upload`,
    { method: "POST", body: formData }
  );
  if (!uploadRes.ok) {
    let detail = "";
    try {
      const err = await uploadRes.json() as { error?: { message?: string } };
      detail = err?.error?.message ?? "";
    } catch { /* ignore */ }
    throw new Error(`UPLOAD_FAILED:${uploadRes.status}:${detail}`);
  }
  const data = await uploadRes.json() as {
    public_id: string; resource_type: string; secure_url: string; bytes: number;
  };
  return {
    publicId: data.public_id,
    resourceType: resourceType as "image" | "raw",
    url: data.secure_url,
    filename: file.name,
    bytes: data.bytes,
  };
}

export function ChatComposer() {
  const {
    conversationId,
    productContext,
    guestToken,
    canSend: canSendMessages,
    hasSession,
    appendMessage,
    replaceOptimisticMessage,
    removeOptimisticMessage,
    setConversationId,
    setConversationStatus,
  } = useChat();

  const [body, setBody] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSending, setIsSending] = useState(false);
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const trimmed = body.trim();
  const overLimit = body.length > MAX_LENGTH;
  const canSubmit =
    canSendMessages &&
    (trimmed.length > 0 || pendingFile !== null) &&
    !overLimit &&
    !isSending;
  const composerDisabled = !canSendMessages || isSending;

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] ?? null;
    event.target.value = ""; // reset input so same file can be re-selected
    setFileError(null);
    if (!file) return;
    if (!ALLOWED_TYPES.includes(file.type)) {
      setFileError("Дозволені формати: JPG, PNG, WEBP.");
      return;
    }
    if (file.size > MAX_FILE_SIZE) {
      setFileError("Файл занадто великий. Максимум 10 МБ.");
      return;
    }
    setPendingFile(file);
  };

  const send = async () => {
    if (!canSubmit) return;

    setError(null);
    setIsSending(true);

    let attachments: ChatAttachment[] | undefined;
    if (pendingFile) {
      try {
        const att = await signAndUpload(pendingFile);
        attachments = [att];
        setPendingFile(null);
      } catch (err) {
        console.error("[chat-composer] upload error:", err);
        setIsSending(false);
        setError("Не вдалося завантажити файл. Спробуйте ще раз.");
        return;
      }
    }

    const tempId = `pending-${crypto.randomUUID()}`;
    const optimistic: MessageDto & { pending: true } = {
      id: tempId,
      conversationId: conversationId ?? "pending",
      body: trimmed,
      senderRole: "BUYER",
      senderId: "",
      createdAt: new Date().toISOString(),
      attachments,
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
          attachments,
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
        {hasSession ? (
          <>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="hidden"
              onChange={handleFileSelect}
            />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="size-11 shrink-0"
              disabled={composerDisabled || pendingFile !== null}
              aria-label="Прикріпити файл"
              onClick={() => fileInputRef.current?.click()}
            >
              <Paperclip className="size-4" />
            </Button>
          </>
        ) : null}
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
      {pendingFile ? (
        <div className="mt-1 flex items-center gap-2 text-sm text-muted-foreground">
          <Paperclip className="size-3 shrink-0" />
          <span className="truncate">{pendingFile.name}</span>
          <button
            type="button"
            className="ml-auto text-destructive"
            onClick={() => { setPendingFile(null); setFileError(null); }}
            aria-label="Прибрати файл"
          >
            ×
          </button>
        </div>
      ) : null}
      {fileError ? <p className="mt-1 text-sm text-destructive">{fileError}</p> : null}
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
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const trimmed = body.trim();
  const overLimit = body.length > MAX_LENGTH;
  const canSend =
    Boolean(selectedConversationId) &&
    (trimmed.length > 0 || pendingFile !== null) &&
    !overLimit &&
    !isSending;

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] ?? null;
    event.target.value = ""; // reset input so same file can be re-selected
    setFileError(null);
    if (!file) return;
    if (!ALLOWED_TYPES.includes(file.type)) {
      setFileError("Дозволені формати: JPG, PNG, WEBP.");
      return;
    }
    if (file.size > MAX_FILE_SIZE) {
      setFileError("Файл занадто великий. Максимум 10 МБ.");
      return;
    }
    setPendingFile(file);
  };

  const send = async () => {
    if (!canSend || !selectedConversationId) return;

    setError(null);
    setIsSending(true);

    let attachments: ChatAttachment[] | undefined;
    if (pendingFile) {
      try {
        const att = await signAndUpload(pendingFile);
        attachments = [att];
        setPendingFile(null);
      } catch {
        setIsSending(false);
        setError("Не вдалося завантажити файл. Спробуйте ще раз.");
        return;
      }
    }

    const tempId = `pending-${crypto.randomUUID()}`;
    const optimistic: MessageDto & { pending: true } = {
      id: tempId,
      conversationId: selectedConversationId,
      body: trimmed,
      senderRole: "STORE",
      senderId: "",
      createdAt: new Date().toISOString(),
      attachments,
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
          attachments,
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
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="hidden"
          onChange={handleFileSelect}
        />
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="size-11 shrink-0"
          disabled={isSending || pendingFile !== null}
          aria-label="Прикріпити файл"
          onClick={() => fileInputRef.current?.click()}
        >
          <Paperclip className="size-4" />
        </Button>
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
      {pendingFile ? (
        <div className="mt-1 flex items-center gap-2 text-sm text-muted-foreground">
          <Paperclip className="size-3 shrink-0" />
          <span className="truncate">{pendingFile.name}</span>
          <button
            type="button"
            className="ml-auto text-destructive"
            onClick={() => { setPendingFile(null); setFileError(null); }}
            aria-label="Прибрати файл"
          >
            ×
          </button>
        </div>
      ) : null}
      {fileError ? <p className="mt-1 text-sm text-destructive">{fileError}</p> : null}
    </div>
  );
}
