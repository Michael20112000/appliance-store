import {
  ChatServiceError,
  getGuestConversation,
  listMessages,
} from "@/server/services/chat.service";

export async function GET(request: Request) {
  const token = new URL(request.url).searchParams.get("token");

  if (!token) {
    return Response.json({ error: "TOKEN_REQUIRED" }, { status: 400 });
  }

  try {
    const conversation = await getGuestConversation(token);

    if (!conversation) {
      return Response.json({ error: "NOT_FOUND" }, { status: 404 });
    }

    const messages = await listMessages(conversation.id, { limit: 50 });

    return Response.json({
      conversationId: conversation.id,
      messages,
      status: conversation.status,
    });
  } catch (error) {
    if (error instanceof ChatServiceError) {
      return Response.json({ error: error.code }, { status: 500 });
    }
    throw error;
  }
}
