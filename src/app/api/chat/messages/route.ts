import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import {
  conversationChannel,
  getPusherServer,
  PusherNotConfiguredError,
} from "@/lib/pusher-server";
import { sendMessageSchema } from "@/server/validators/chat";
import {
  assertConversationAccess,
  ChatRateLimitError,
  ChatServiceError,
  CHAT_ARCHIVED,
  CHAT_RATE_LIMIT,
  CONVERSATION_NOT_FOUND,
  FORBIDDEN,
  listMessages,
  sendMessage,
} from "@/server/services/chat.service";
import type { MessageDto } from "@/types/chat";

const RATE_LIMIT_MESSAGE =
  "Забагато повідомлень. Спробуйте за хвилину.";

function pusherPayload(message: MessageDto) {
  return {
    id: message.id,
    conversationId: message.conversationId,
    body: message.body,
    senderRole: message.senderRole,
    createdAt: message.createdAt,
    attachments: message.attachments,
  };
}

function mapChatServiceError(error: ChatServiceError): Response {
  if (error.code === FORBIDDEN) {
    return Response.json({ error: FORBIDDEN }, { status: 403 });
  }
  if (error.code === CHAT_ARCHIVED) {
    return Response.json(
      { error: CHAT_ARCHIVED, message: error.message },
      { status: 403 },
    );
  }
  if (error.code === CONVERSATION_NOT_FOUND) {
    return Response.json(
      { error: CONVERSATION_NOT_FOUND },
      { status: 404 },
    );
  }
  return Response.json({ error: error.code }, { status: 400 });
}

export async function POST(request: Request) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "INVALID_BODY" }, { status: 400 });
  }

  const parsed = sendMessageSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json(
      { error: "VALIDATION_ERROR", issues: parsed.error.flatten() },
      { status: 400 },
    );
  }

  if (!session?.user) {
    if (!parsed.data.guestToken) {
      return Response.json({ error: "UNAUTHORIZED" }, { status: 401 });
    }

    try {
      const message = await sendMessage({
        guestToken: parsed.data.guestToken,
        senderId: parsed.data.guestToken,
        senderRole: "BUYER",
        body: parsed.data.body,
        productContext: parsed.data.productId
          ? { productId: parsed.data.productId }
          : undefined,
        attachments: parsed.data.attachments,
      });

      try {
        await getPusherServer().trigger(
          conversationChannel(message.conversationId),
          "message:new",
          pusherPayload(message),
        );
      } catch (error) {
        if (!(error instanceof PusherNotConfiguredError)) {
          throw error;
        }
      }

      return Response.json(message, { status: 201 });
    } catch (error) {
      if (error instanceof ChatRateLimitError) {
        return Response.json(
          { error: CHAT_RATE_LIMIT, message: RATE_LIMIT_MESSAGE },
          { status: 429 },
        );
      }
      if (error instanceof ChatServiceError) {
        return mapChatServiceError(error);
      }
      throw error;
    }
  }

  const isAdmin = session.user.role === "admin";

  if (isAdmin && !parsed.data.conversationId) {
    return Response.json(
      { error: "CONVERSATION_ID_REQUIRED" },
      { status: 400 },
    );
  }

  try {
    const message = isAdmin
      ? await sendMessage({
          conversationId: parsed.data.conversationId,
          senderId: session.user.id,
          senderRole: "STORE",
          body: parsed.data.body,
          attachments: parsed.data.attachments,
        })
      : await sendMessage({
          userId: session.user.id,
          senderId: session.user.id,
          senderRole: "BUYER",
          body: parsed.data.body,
          productContext: parsed.data.productId
            ? { productId: parsed.data.productId }
            : undefined,
          attachments: parsed.data.attachments,
        });

    try {
      await getPusherServer().trigger(
        conversationChannel(message.conversationId),
        "message:new",
        pusherPayload(message),
      );
    } catch (error) {
      if (!(error instanceof PusherNotConfiguredError)) {
        throw error;
      }
    }

    return Response.json(message, { status: 201 });
  } catch (error) {
    if (error instanceof ChatRateLimitError) {
      return Response.json(
        { error: CHAT_RATE_LIMIT, message: RATE_LIMIT_MESSAGE },
        { status: 429 },
      );
    }
    if (error instanceof ChatServiceError) {
      return mapChatServiceError(error);
    }
    throw error;
  }
}

export async function GET(request: Request) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    return Response.json({ error: "UNAUTHORIZED" }, { status: 401 });
  }

  const conversationId = new URL(request.url).searchParams.get("conversationId");
  if (!conversationId) {
    return Response.json(
      { error: "CONVERSATION_ID_REQUIRED" },
      { status: 400 },
    );
  }

  try {
    const conversation = await assertConversationAccess(session, conversationId);
    const messages = await listMessages(conversationId, { limit: 50 });
    return Response.json({ messages, status: conversation.status });
  } catch (error) {
    if (error instanceof ChatServiceError) {
      return mapChatServiceError(error);
    }
    throw error;
  }
}
