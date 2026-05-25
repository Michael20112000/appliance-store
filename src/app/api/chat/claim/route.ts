import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { z } from "zod";
import { claimGuestConversation } from "@/server/services/chat.service";

export async function POST(request: Request) {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session?.user) {
    return Response.json({ error: "UNAUTHORIZED" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "INVALID_BODY" }, { status: 400 });
  }

  const parsed = z.object({ guestToken: z.string().uuid() }).safeParse(body);
  if (!parsed.success) {
    return Response.json({ error: "INVALID_TOKEN" }, { status: 400 });
  }

  try {
    await claimGuestConversation(parsed.data.guestToken, session.user.id);
  } catch {
    return Response.json({ error: "CLAIM_FAILED" }, { status: 500 });
  }

  return Response.json({ ok: true });
}
