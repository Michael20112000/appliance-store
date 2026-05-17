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

type AuthBody = {
  socket_id?: string;
  channel_name?: string;
};

async function parseAuthBody(request: Request): Promise<AuthBody> {
  const contentType = request.headers.get("content-type") ?? "";

  if (contentType.includes("application/x-www-form-urlencoded")) {
    const text = await request.text();
    const params = new URLSearchParams(text);
    return {
      socket_id: params.get("socket_id") ?? undefined,
      channel_name: params.get("channel_name") ?? undefined,
    };
  }

  try {
    const json = (await request.json()) as AuthBody;
    return {
      socket_id:
        typeof json.socket_id === "string" ? json.socket_id : undefined,
      channel_name:
        typeof json.channel_name === "string" ? json.channel_name : undefined,
    };
  } catch {
    return {};
  }
}

export async function POST(request: Request) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    return Response.json({ error: "UNAUTHORIZED" }, { status: 401 });
  }

  const body = await parseAuthBody(request);
  const socketId = body.socket_id;
  const channelName = body.channel_name;

  if (!socketId || !channelName) {
    return Response.json({ error: "INVALID_BODY" }, { status: 400 });
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
