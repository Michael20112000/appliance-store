import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { z } from "zod";
import { createNewConversation } from "@/server/services/chat.service";

export async function POST(request: Request) {
  const session = await auth.api.getSession({ headers: await headers() });

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "INVALID_BODY" }, { status: 400 });
  }

  // Guest path — guestToken required for unauthenticated requests
  if (!session?.user) {
    const parsed = z.object({ guestToken: z.string().uuid() }).safeParse(body);
    if (!parsed.success) {
      return Response.json({ error: "INVALID_TOKEN" }, { status: 400 });
    }

    try {
      const conversation = await createNewConversation({
        guestToken: parsed.data.guestToken,
      });
      return Response.json(
        { conversationId: conversation.id, guestToken: conversation.guestToken },
        { status: 201 },
      );
    } catch {
      return Response.json({ error: "INTERNAL_ERROR" }, { status: 500 });
    }
  }

  try {
    const conversation = await createNewConversation({ userId: session.user.id });
    return Response.json({ conversationId: conversation.id }, { status: 201 });
  } catch {
    return Response.json({ error: "INTERNAL_ERROR" }, { status: 500 });
  }
}
