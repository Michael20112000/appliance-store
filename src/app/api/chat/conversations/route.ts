import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { listConversationsForBuyer } from "@/server/services/chat.service";

export async function GET() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) {
    return Response.json({ error: "UNAUTHORIZED" }, { status: 401 });
  }
  const conversations = await listConversationsForBuyer(session.user.id);
  return Response.json({ conversations });
}
