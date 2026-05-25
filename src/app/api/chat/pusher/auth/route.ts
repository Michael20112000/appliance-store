import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { getPusherServer, PusherNotConfiguredError } from "@/lib/pusher-server";
import {
  assertConversationAccess,
  ChatServiceError,
  CONVERSATION_NOT_FOUND,
  FORBIDDEN,
  parseConversationChannel,
} from "@/server/services/chat.service";
import { prisma } from "@/lib/db";

type AuthBody = {
  socket_id?: string;
  channel_name?: string;
  guestToken?: string;
};

async function parseAuthBody(request: Request): Promise<AuthBody> {
  const contentType = request.headers.get("content-type") ?? "";

  if (contentType.includes("application/x-www-form-urlencoded")) {
    const text = await request.text();
    const params = new URLSearchParams(text);
    return {
      socket_id: params.get("socket_id") ?? undefined,
      channel_name: params.get("channel_name") ?? undefined,
      guestToken: params.get("guestToken") ?? undefined,
    };
  }

  try {
    const json = (await request.json()) as AuthBody;
    return {
      socket_id:
        typeof json.socket_id === "string" ? json.socket_id : undefined,
      channel_name:
        typeof json.channel_name === "string" ? json.channel_name : undefined,
      guestToken:
        typeof json.guestToken === "string" ? json.guestToken : undefined,
    };
  } catch {
    return {};
  }
}

export async function POST(request: Request) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  const body = await parseAuthBody(request);
  const socketId = body.socket_id;
  const channelName = body.channel_name;

  if (!socketId || !channelName) {
    return Response.json({ error: "INVALID_BODY" }, { status: 400 });
  }

  if (!/^\d+\.\d+$/.test(socketId)) {
    return Response.json({ error: "INVALID_SOCKET_ID" }, { status: 400 });
  }

  if (!session?.user) {
    const guestToken = body.guestToken;
    if (!guestToken) {
      return Response.json({ error: "UNAUTHORIZED" }, { status: 401 });
    }

    const conversationId = parseConversationChannel(channelName);
    if (!conversationId) {
      return Response.json({ error: "INVALID_CHANNEL" }, { status: 400 });
    }

    const conversation = await prisma.conversation.findUnique({
      where: { id: conversationId },
      select: { guestToken: true },
    });

    if (!conversation || conversation.guestToken !== guestToken) {
      return Response.json({ error: "FORBIDDEN" }, { status: 403 });
    }

    try {
      const authResponse = getPusherServer().authorizeChannel(
        socketId,
        channelName,
      );
      return Response.json(authResponse);
    } catch (error) {
      if (error instanceof PusherNotConfiguredError) {
        return Response.json(
          { error: "PUSHER_NOT_CONFIGURED" },
          { status: 503 },
        );
      }
      throw error;
    }
  }

  const conversationId = parseConversationChannel(channelName);
  if (!conversationId) {
    return Response.json({ error: "INVALID_CHANNEL" }, { status: 400 });
  }

  try {
    await assertConversationAccess(session, conversationId);
    const authResponse = getPusherServer().authorizeChannel(
      socketId,
      channelName,
    );
    return Response.json(authResponse);
  } catch (error) {
    if (error instanceof ChatServiceError) {
      if (error.code === FORBIDDEN) {
        return Response.json({ error: FORBIDDEN }, { status: 403 });
      }
      if (error.code === CONVERSATION_NOT_FOUND) {
        return Response.json(
          { error: CONVERSATION_NOT_FOUND },
          { status: 404 },
        );
      }
    }
    if (error instanceof PusherNotConfiguredError) {
      return Response.json(
        { error: "PUSHER_NOT_CONFIGURED" },
        { status: 503 },
      );
    }
    throw error;
  }
}
